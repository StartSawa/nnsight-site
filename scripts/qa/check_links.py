"""Check every link and asset on the built site.

    python scripts/qa/check_links.py dist            internal links, anchors, old-site links
    python scripts/qa/check_links.py dist --external also request every outside URL once

Fails (exit 1) on: an internal href/src with no file behind it, a #anchor
that no element on the target page carries, and any link or asset that
points at nnsight.net (canonical, og and sitemap tags excepted) or Ploy.
"""
import concurrent.futures as cf
import html.parser
import os
import re
import sys
import urllib.parse
import urllib.request

DIST = sys.argv[1]
EXTERNAL = "--external" in sys.argv
OLD_HOSTS = re.compile(r"^https?://(www\.)?(nnsight\.net|[^/]*ploy\.(ai|build))", re.I)


class Page(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.ids = [], set()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.add(a["id"])
        if tag == "a" and a.get("name"):
            self.ids.add(a["name"])
        rel = a.get("rel") or ""
        prop = a.get("property") or ""
        if tag == "link" and ("canonical" in rel or "alternate" in rel or "sitemap" in rel):
            return
        if tag == "meta":
            return
        for key in ("href", "src"):
            if a.get(key):
                self.links.append((tag, key, a[key]))


def target_file(path):
    path = urllib.parse.unquote(path)
    base = os.path.join(DIST, path.lstrip("/"))
    for cand in (base, base + ".html", os.path.join(base, "index.html")):
        if os.path.isfile(cand):
            return cand
    return None


pages = {}
for root, _, files in os.walk(DIST):
    for f in files:
        if f.endswith(".html"):
            full = os.path.join(root, f)
            p = Page()
            p.feed(open(full, encoding="utf8").read())
            pages[os.path.normpath(full)] = p

errors, external = [], {}
for file, page in pages.items():
    rel = "/" + os.path.relpath(file, DIST).replace(os.sep, "/").removesuffix("index.html").removesuffix(".html")
    for tag, key, url in page.links:
        if url.startswith(("mailto:", "data:", "javascript:", "tel:")):
            continue
        if OLD_HOSTS.match(url):
            errors.append(f"OLD SITE  {rel}  ->  {url}")
            continue
        if url.startswith(("http://", "https://", "//")):
            external.setdefault(url.split("#")[0], rel)
            continue
        u = urllib.parse.urlparse(urllib.parse.urljoin("https://site" + rel, url))
        target = target_file(u.path) if u.path not in ("", "/") else os.path.join(DIST, "index.html")
        if not target:
            errors.append(f"MISSING   {rel}  ->  {url}")
            continue
        if u.fragment and target.endswith(".html"):
            ids = pages.get(os.path.normpath(target))
            if ids is not None and urllib.parse.unquote(u.fragment) not in ids.ids:
                errors.append(f"ANCHOR    {rel}  ->  {url}")

if EXTERNAL:
    def check(url):
        req = urllib.request.Request(url, method="GET", headers={"User-Agent": "Mozilla/5.0 (link check)"})
        try:
            with urllib.request.urlopen(req, timeout=25) as r:
                return url, r.status
        except urllib.error.HTTPError as e:
            return url, e.code
        except Exception as e:
            return url, type(e).__name__

    with cf.ThreadPoolExecutor(16) as ex:
        for url, code in ex.map(check, sorted(external)):
            if code != 200 and code not in (401, 403, 429, 999):
                errors.append(f"EXTERNAL {code}  {external[url]}  ->  {url}")

print(f"{len(pages)} pages, {len(external)} outside URLs")
for e in sorted(set(errors)):
    print(e)
print(f"{len(set(errors))} problems")
sys.exit(1 if errors else 0)
