"""Word-for-word check: every word of each nnsight.net page must be on the built page.

    python scripts/qa/check_coverage.py

Reads the original pages from the import cache (node_modules/.cache/nnsight-docs,
filled by `bun scripts/import-docs.ts`) and the built pages from dist/ (`bun run
build`). Compares the article text as ordered word lists with difflib and
prints pages where under 99.5% of the original words line up, with the words
that went missing. Math and charts are skipped: they are re-drawn here.
"""
import difflib
import json
import os
import re
import sys
import unicodedata

from bs4 import BeautifulSoup

ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
CACHE = os.path.join(ROOT, "node_modules", ".cache", "nnsight-docs")
BLOCKS = "p div li h1 h2 h3 h4 h5 h6 td th tr summary pre br figcaption figure details aside ul ol table blockquote dt dd".split()


def words(soup_el):
    for tag in soup_el.find_all(BLOCKS):
        tag.append(" ")
    text = unicodedata.normalize("NFKC", soup_el.get_text()).replace("¶", " ")
    return [w.lower() for w in re.split(r"[^\w]+", text) if w]


def original(path):
    html = open(os.path.join(CACHE, path[1:].replace("/", "__") + ".html"), encoding="utf8").read()
    art = BeautifulSoup(html, "html.parser").select_one("article.md-content__inner")
    for el in art.select(
        "script, style, .jp-InputPrompt, .jp-OutputPrompt, .clipboard-copy-txt, clipboard-copy, "
        ".zeroclipboard-container, a.headerlink, a.anchor-link, .md-source-file, .md-content__button, "
        ".arithmatex, .plotly-graph-div"
    ):
        el.decompose()
    return words(art)


def built(path):
    file = os.path.join(ROOT, "dist", path[1:], "index.html")
    if not os.path.exists(file):
        return None
    soup = BeautifulSoup(open(file, encoding="utf8").read(), "html.parser")
    body = soup.select_one(".docs-body")
    for el in body.select('.katex, .doc-plotly, [data-copy], [aria-hidden="true"]'):
        el.decompose()
    for line in body.select("code > span"):
        line.append("\n")
    h1 = soup.select_one("main h1")
    return words(h1) + words(body)


pages = json.load(open(os.path.join(ROOT, "src", "content", "docs", "index.json"), encoding="utf8"))["pages"]
low = 0
for page in pages:
    path = page["path"]
    b = built(path)
    if b is None:
        print(f"NOT BUILT {path}")
        low += 1
        continue
    a = original(path)
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    matched = sum(block.size for block in sm.get_matching_blocks())
    share = matched / len(a) if a else 1
    if share < 0.995:
        low += 1
        missing = [w for tag, i1, i2, _, _ in sm.get_opcodes() if tag in ("delete", "replace") for w in a[i1:i2]]
        print(f"{share * 100:.1f}%  {path}  missing: {' '.join(missing[:15])}")
print(f"{len(pages)} pages checked, {low} below 99.5%")
sys.exit(1 if low else 0)
