import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bookmark,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleQuestionMark,
  Code,
  Copy,
  Cpu,
  Eye,
  Flame,
  Grid3x3,
  Languages,
  Layers,
  ListChecks,
  LoaderCircle,
  LogIn,
  MemoryStick,
  Pin,
  Search,
  Settings,
  Snowflake,
  TriangleAlert,
  WandSparkles,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * NDIF's live status board, ported from nnsight.net/status: the same data,
 * wording and controls (cluster panel, level filters, search, sort, pages,
 * copyable nnsight snippet per model), drawn in this site's design.
 */

const STATUS_URL = "https://api.ndif.us/status";
const LEVELS = ["HOT", "WARM", "COLD"] as const;
type Level = (typeof LEVELS)[number];

type Deployment = {
  model_key?: string;
  repo_id: string;
  revision: string | null;
  task: string | null;
  dtype?: string | null;
  n_params?: number | null;
  pinned?: boolean;
  trust_remote_code?: boolean;
  deployment_level: Level;
  application_state?: string;
  schedule?: { end_time?: string } | null;
  replicas_count: number;
};
type GpuDetail = { index: number; memory_bytes: number; available_memory_bytes: number };
type ClusterNode = {
  resources: { gpu_details?: GpuDetail[] };
  deployments?: Record<string, Record<string, { gpus?: Record<string, number> }>>;
};
type Cluster = { nodes?: Record<string, ClusterNode> };

const SORTS = [
  { label: "Status", value: "deployment_level" },
  { label: "Name", value: "repo_id" },
  { label: "Params", value: "n_params" },
] as const;
type Sort = (typeof SORTS)[number]["value"];

const formatBytes = (bytes: number) =>
  bytes >= 1e9 ? (bytes / 1e9).toFixed(1) + " GB" : bytes >= 1e6 ? Math.round(bytes / 1e6) + " MB" : Math.round(bytes / 1e3) + " KB";
/** Compact, for the node row: 1.2T / 192G. */
const formatVram = (bytes: number) => {
  const gb = bytes / 1e9;
  return gb >= 1000 ? (gb / 1000).toFixed(1) + "T" : Math.round(gb) + "G";
};
const formatParams = (n: number) => (n / 1e9 < 1 ? (n / 1e9).toFixed(1) + "B" : Math.round(n / 1e9) + "B");

function formatTimeRemaining(endTime: string) {
  const diff = +new Date(endTime) - +new Date();
  if (diff < 0) return "Ended";
  let s = Math.floor(diff / 1000);
  const d = Math.floor(s / 86400);
  s %= 86400;
  const h = Math.floor(s / 3600);
  s %= 3600;
  const m = Math.floor(s / 60);
  return d > 10 ? ">10d remaining" : `${d}d ${h}h ${m}m remaining`;
}

/**
 * One card per model_key: HOT outranks WARM outranks COLD, RUNNING outranks
 * DEPLOYING. COLD cache entries have no model_key and pass through as-is.
 */
function aggregateByModelKey(entries: Omit<Deployment, "replicas_count">[]): Deployment[] {
  const LEVEL_RANK: Record<string, number> = { HOT: 0, WARM: 1, COLD: 2 };
  const STATE_RANK: Record<string, number> = { RUNNING: 0, DEPLOYING: 1, NOT_STARTED: 2, UNHEALTHY: 3 };
  const out = new Map<string, Deployment>();
  for (const e of entries) {
    const mk = e.model_key;
    if (!mk) {
      out.set(e.repo_id, { ...e, replicas_count: 0 });
      continue;
    }
    let card = out.get(mk);
    if (!card) {
      card = { ...e, replicas_count: 0 };
      out.set(mk, card);
    }
    if (e.deployment_level && (LEVEL_RANK[e.deployment_level] ?? 99) < (LEVEL_RANK[card.deployment_level] ?? 99)) {
      card.deployment_level = e.deployment_level;
    }
    if (
      e.application_state &&
      (!card.application_state || (STATE_RANK[e.application_state] ?? 99) < (STATE_RANK[card.application_state] ?? 99))
    ) {
      card.application_state = e.application_state;
    }
    if (e.pinned) {
      card.pinned = true;
      if (e.schedule && !card.schedule) card.schedule = e.schedule;
    }
    card.replicas_count += 1;
  }
  return [...out.values()];
}

function clusterInfo(cluster: Cluster | null, deployments: Deployment[]) {
  if (!cluster?.nodes) return null;
  let totalGpus = 0;
  let busyGpus = 0;
  let totalVramBytes = 0;
  let allocatedBytes = 0;
  const repoOf = (modelKey: string) => /"repo_id":\s*"([^"]+)"/.exec(modelKey)?.[1] ?? modelKey.split(":").pop()!;
  // One checkpoint can be deployed under several tasks; name the task so they stay apart.
  const fieldsByKey: Record<string, string> = {};
  for (const d of deployments) {
    if (!d.model_key) continue;
    const fields = [d.task, d.trust_remote_code ? "trust_remote_code" : null].filter(Boolean);
    if (fields.length) fieldsByKey[d.model_key] = fields.join(", ");
  }
  const labelOf = (mk: string) => repoOf(mk) + (fieldsByKey[mk] ? " (" + fieldsByKey[mk] + ")" : "");
  const nodes = Object.entries(cluster.nodes)
    .map(([id, node]) => {
      const gpus = node.resources.gpu_details ?? [];
      const occupants: Record<string, { repo: string; bytes: number }[]> = {};
      for (const [mk, replicas] of Object.entries(node.deployments ?? {})) {
        for (const replica of Object.values(replicas ?? {})) {
          for (const [idx, bytes] of Object.entries(replica?.gpus ?? {})) {
            (occupants[idx] ??= []).push({ repo: labelOf(mk), bytes: Number(bytes) || 0 });
          }
        }
      }
      Object.values(occupants).forEach((list) => list.sort((a, b) => b.bytes - a.bytes));
      const vramBytes = gpus.reduce((sum, g) => sum + g.memory_bytes, 0);
      totalGpus += gpus.length;
      totalVramBytes += vramBytes;
      const gpuDetails = gpus.map((g) => {
        const usedBytes = Math.max(0, g.memory_bytes - g.available_memory_bytes);
        const isUsed = usedBytes > 0;
        if (isUsed) busyGpus += 1;
        allocatedBytes += usedBytes;
        const here = occupants[String(g.index)] ?? [];
        const head =
          "GPU " +
          g.index +
          " · " +
          (isUsed ? formatBytes(usedBytes) + " of " + formatBytes(g.memory_bytes) + " in use" : "free · " + formatBytes(g.memory_bytes));
        return {
          index: g.index,
          memoryBytes: g.memory_bytes,
          usedPct: g.memory_bytes ? Math.round((usedBytes / g.memory_bytes) * 100) : 0,
          isUsed,
          tooltip: [head, ...here.map((o) => o.repo + "  " + formatBytes(o.bytes))].join("\n"),
        };
      });
      return { rawId: id, totalGpus: gpus.length, vram: formatVram(vramBytes), gpuDetails, label: "", tooltip: "" };
    })
    .sort((a, b) => b.totalGpus - a.totalGpus);
  // Ray node ids change on restart, so nodes are labelled by position; the id lives in the tooltip.
  nodes.forEach((node, i) => {
    node.label = "Node " + (i + 1);
    const size = node.gpuDetails.length ? " · " + formatBytes(node.gpuDetails[0].memoryBytes) + " each" : "";
    node.tooltip = node.totalGpus + " GPUs" + size + "\n" + node.rawId;
  });
  const totalVramTb = totalVramBytes / 1e12;
  return {
    totalGpus,
    busyGpus,
    totalVram: totalVramTb >= 1 ? totalVramTb.toFixed(1) + " TB" : Math.round(totalVramBytes / 1e9) + " GB",
    memoryPct: totalVramBytes > 0 ? Math.round((allocatedBytes / totalVramBytes) * 100) : 0,
    nodes,
  };
}

const BADGE_TONE = {
  success: "bg-[#10b981]/12 text-[#047857] dark:text-[#34d399]",
  warning: "bg-[#f59e0b]/14 text-[#b45309] dark:text-[#fbbf24]",
  primary: "bg-[#4385be]/12 text-[#2f6a9c] dark:text-[#86c1f0]",
  info: "bg-ploy-accent-primary/10 text-ploy-accent-primary",
  danger: "bg-[#ef4444]/12 text-[#b91c1c] dark:text-[#f87171]",
  secondary: "bg-ploy-background-secondary text-ploy-text-secondary",
  muted: "shadow-[inset_0_0_0_1px_var(--ploy-border-primary)] text-ploy-text-secondary",
} as const;

function Badge({ tone, title, children }: { tone: keyof typeof BADGE_TONE; title?: string; children: ReactNode }) {
  return (
    <span title={title} className={cn("inline-flex items-center gap-1 rounded-[4px] px-1.5 py-0.5 text-[0.75rem] font-medium", BADGE_TONE[tone])}>
      {children}
    </span>
  );
}

const ic = "size-3.5 shrink-0";

function levelBadge(level: string) {
  if (level === "HOT") return <Badge tone="success" title="This model is on GPU and ready."><Cpu className={ic} /> Hot</Badge>;
  if (level === "WARM") return <Badge tone="warning" title="Cached on CPU, quick to load."><Flame className={ic} /> Warm</Badge>;
  if (level === "COLD") return <Badge tone="primary" title="Downloaded, slower to load."><Snowflake className={ic} /> Cold</Badge>;
  return <Badge tone="secondary">{level}</Badge>;
}

function stateBadge(state: string) {
  const spin = <Settings className={cn(ic, "animate-spin")} />;
  if (state === "NOT_STARTED") return <Badge tone="warning">{spin} Not Started</Badge>;
  if (state === "DEPLOYING") return <Badge tone="warning">{spin} Deploying</Badge>;
  if (state === "DEPLOY_FAILED") return <Badge tone="danger"><X className={ic} /> Deploy Failed</Badge>;
  if (state === "RUNNING") return <Badge tone="success"><Check className={ic} /> Running</Badge>;
  if (state === "UNHEALTHY") return <Badge tone="danger"><X className={ic} /> Unhealthy</Badge>;
  return <Badge tone="secondary">{state}</Badge>;
}

function classBadge(modelKey: string) {
  const base = modelKey.split(":")[0].split(".").pop();
  if (base === "LanguageModel") return <Badge tone="secondary"><Languages className={ic} /> Language</Badge>;
  if (base === "VisionLanguageModel") return <Badge tone="secondary"><Eye className={ic} /> Vision-Language</Badge>;
  if (base === "DiffusionModel") return <Badge tone="secondary"><WandSparkles className={ic} /> Diffusion</Badge>;
  return null;
}

/** The snippet a card copies: import, load with the deployment's identity, run remotely. */
function snippet(d: Deployment) {
  const parts = d.model_key!.split(":")[0].split(".");
  const imp = parts.slice(0, -1).join(".");
  const obj = parts[parts.length - 1];
  const task = d.task ? `, task="${d.task}"` : "";
  const trc = d.trust_remote_code ? `, trust_remote_code=True` : "";
  const rev = d.revision ? `, revision="${d.revision}"` : "";
  return `from ${imp} import ${obj}\n\nmodel = ${obj}("${d.repo_id}"${task}${trc}${rev})\n\nwith model.trace("The Eiffel Tower is in the city of", remote=True):\n    output = model.output.save()`;
}

function DeploymentCard({ d }: { d: Deployment }) {
  const [copied, setCopied] = useState(false);
  const hfUrl = "https://huggingface.co/" + d.repo_id;
  const autoEvict = !d.pinned && d.schedule?.end_time && new Date() < new Date(d.schedule.end_time);
  const meta = [
    d.task && { key: "task", title: "Task", icon: <ListChecks className={ic} />, text: d.task },
    d.revision && { key: "rev", title: "Revision", icon: <Bookmark className={ic} />, text: d.revision },
    d.trust_remote_code && {
      key: "trc",
      title: "Runs the checkpoint's own modelling code; load with trust_remote_code=True",
      icon: <Code className={ic} />,
      text: "trust_remote_code",
    },
    d.n_params && { key: "params", title: "# Params", icon: <Grid3x3 className={ic} />, text: formatParams(d.n_params) },
    d.dtype && { key: "dtype", title: "Weight dtype", icon: <MemoryStick className={ic} />, text: d.dtype },
    d.replicas_count > 1 && {
      key: "replicas",
      title: "HOT/WARM replicas serving this model",
      icon: <Layers className={ic} />,
      text: `${d.replicas_count} replicas`,
    },
  ].filter(Boolean) as { key: string; title: string; icon: ReactNode; text: string }[];

  return (
    <div
      className={cn(
        "glass relative min-w-0 rounded-[6px] border-l-[3px] p-5 transition-shadow hover:shadow-[0_18px_40px_-28px_rgb(20_20_28/0.45)]",
        d.deployment_level === "HOT" ? "border-l-[#10b981]" : d.deployment_level === "WARM" ? "border-l-[#f59e0b]" : "border-l-[#4385be]",
      )}
    >
      <a href={hfUrl} target="_blank" rel="noopener" tabIndex={-1} aria-hidden="true" className="absolute inset-0 z-0">
        <span className="sr-only">HuggingFace</span>
      </a>
      {d.model_key ? (
        <div className="group/snip absolute top-3 right-3 z-20">
          <button
            type="button"
            aria-label="Copy nnsight snippet"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigator.clipboard?.writeText(snippet(d)).then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              });
            }}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-[4px] text-ploy-text-secondary shadow-[inset_0_0_0_1px_var(--ploy-border-primary)] transition-colors hover:bg-ploy-background-secondary hover:text-ploy-text-primary"
          >
            {copied ? <Check className="size-4 text-[#10b981]" /> : <Copy className="size-4" />}
          </button>
          <pre className="pointer-events-none invisible absolute top-10 right-0 z-30 w-max max-w-[min(34rem,80vw)] overflow-x-auto rounded-[6px] bg-[#14141f] px-4 py-3 font-mono text-[0.75rem] leading-[1.6] whitespace-pre text-[#e8e8f0] opacity-0 shadow-[0_20px_40px_-20px_rgb(0_0_0/0.6)] transition-opacity group-hover/snip:visible group-hover/snip:opacity-100">
            {snippet(d)}
          </pre>
        </div>
      ) : null}
      <a
        href={hfUrl}
        target="_blank"
        rel="noopener"
        title={d.repo_id}
        className="relative z-10 block truncate pr-10 font-mono text-[0.9375rem] font-medium text-ploy-text-primary hover:text-ploy-accent-primary"
      >
        {d.repo_id}
      </a>
      <div className="relative z-10 mt-3 flex flex-wrap gap-1.5">
        {d.pinned ? (
          <Badge tone="info" title="Pinned deployment — always kept HOT.">
            <Pin className={ic} /> Pinned
          </Badge>
        ) : null}
        {autoEvict ? (
          <Badge tone="muted" title="Hot-swap deployment — eligible for eviction after this window ends.">
            {formatTimeRemaining(d.schedule!.end_time!)}
          </Badge>
        ) : null}
        {d.model_key ? classBadge(d.model_key) : null}
        {levelBadge(d.deployment_level)}
        {d.application_state ? stateBadge(d.application_state) : null}
      </div>
      {meta.length ? (
        <div className="relative z-10 mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem] text-ploy-text-secondary">
          {meta.map((m) => (
            <span key={m.key} title={m.title} className="inline-flex items-center gap-1.5">
              {m.icon}
              {m.text}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Panel({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <div className="glass rounded-[6px]">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-[0.75rem] font-semibold tracking-[0.08em] text-ploy-text-secondary uppercase"
      >
        {title}
        <ChevronDown className={cn("size-4 transition-transform", !open && "-rotate-90")} />
      </button>
      {open ? <div className="px-5 pb-5">{children}</div> : null}
    </div>
  );
}

export function StatusBoard() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("deployment_level");
  const [page, setPage] = useState(1);
  const [columns, setColumns] = useState(1);
  const [panels, setPanels] = useState({ resources: true, cluster: true });
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(STATUS_URL)
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((d) => {
        const raw = Object.values(d.deployments ?? {}).filter((dep: any) => dep.repo_id) as Omit<Deployment, "replicas_count">[];
        setDeployments(aggregateByModelKey(raw));
        setCluster(d.cluster ?? null);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  // Pages end on a full row: the closest multiple of the column count to 18 cards.
  useEffect(() => {
    const el = grid.current;
    if (!el) return;
    const measure = () => setColumns(Math.max(1, getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const pageSize = columns * Math.max(1, Math.round(18 / columns));

  const stats = useMemo(
    () => ({
      HOT: deployments.filter((x) => x.deployment_level === "HOT").length,
      WARM: deployments.filter((x) => x.deployment_level === "WARM").length,
      COLD: deployments.filter((x) => x.deployment_level === "COLD").length,
    }),
    [deployments],
  );
  const info = useMemo(() => clusterInfo(cluster, deployments), [cluster, deployments]);

  const filtered = useMemo(() => {
    let f = [...deployments];
    if (level) f = f.filter((d) => d.deployment_level === level);
    const q = query.toLowerCase().trim();
    if (q) f = f.filter((d) => d.repo_id.toLowerCase().includes(q) || (d.task ?? "").toLowerCase().includes(q));
    if (sort === "deployment_level") {
      const o: string[] = [...LEVELS];
      f.sort((a, b) => {
        const al = o.indexOf(a.deployment_level);
        const bl = o.indexOf(b.deployment_level);
        if (al === bl)
          return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || a.repo_id.localeCompare(b.repo_id) || (a.task ?? "").localeCompare(b.task ?? "");
        return (al === -1 ? o.length : al) - (bl === -1 ? o.length : bl);
      });
    } else if (sort === "repo_id") {
      f.sort((a, b) => a.repo_id.localeCompare(b.repo_id) || (a.task ?? "").localeCompare(b.task ?? ""));
    } else {
      f.sort((a, b) => (b.n_params ?? 0) - (a.n_params ?? 0));
    }
    return f;
  }, [deployments, level, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const shown = filtered.slice((current - 1) * pageSize, current * pageSize);

  const chip = (active: boolean) =>
    cn(
      "inline-flex h-9 cursor-pointer items-center gap-2 rounded-[4px] px-3.5 text-[0.875rem] font-medium transition-colors",
      active ? "bg-ploy-background-inverse text-white" : "text-ploy-text-secondary shadow-[inset_0_0_0_1px_var(--ploy-border-primary)] hover:text-ploy-text-primary",
    );
  const count = (n: number, active: boolean) =>
    status === "success" ? <span className={cn("font-mono text-[0.75rem]", active ? "text-white/70" : "text-ploy-text-secondary")}>{n}</span> : null;
  const dot = { HOT: "bg-[#10b981]", WARM: "bg-[#f59e0b]", COLD: "bg-[#4385be]" };
  const pager = (
    <div className="flex items-center gap-2 text-[0.875rem] text-ploy-text-secondary">
      <button
        type="button"
        aria-label="Previous page"
        disabled={current <= 1}
        onClick={() => setPage(current - 1)}
        className="inline-flex size-9 cursor-pointer items-center justify-center rounded-[4px] shadow-[inset_0_0_0_1px_var(--ploy-border-primary)] hover:text-ploy-text-primary disabled:cursor-default disabled:opacity-40"
      >
        <ChevronLeft className="size-4" />
      </button>
      <span className="font-mono text-[0.8125rem]">
        ({current} of {totalPages})
      </span>
      <button
        type="button"
        aria-label="Next page"
        disabled={current >= totalPages}
        onClick={() => setPage(current + 1)}
        className="inline-flex size-9 cursor-pointer items-center justify-center rounded-[4px] shadow-[inset_0_0_0_1px_var(--ploy-border-primary)] hover:text-ploy-text-primary disabled:cursor-default disabled:opacity-40"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );

  return (
    <div>
      {status !== "success" ? (
        <p
          role="status"
          aria-live="polite"
          className={cn(
            "mb-6 flex items-center gap-2 rounded-[6px] px-4 py-3 text-[0.9375rem]",
            status === "error" ? "bg-[#ef4444]/10 text-[#b91c1c] dark:text-[#f87171]" : "bg-ploy-background-secondary text-ploy-text-secondary",
          )}
        >
          {status === "loading" ? (
            <>
              <LoaderCircle className="size-4 animate-spin" /> Connecting to NDIF...
            </>
          ) : (
            <>
              <TriangleAlert className="size-4" /> Unable to reach NDIF. Please try again later.
            </>
          )}
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4">
          <Panel title="Resources" open={panels.resources} onToggle={() => setPanels((p) => ({ ...p, resources: !p.resources }))}>
            <div className="flex justify-center gap-4">
              <a
                href="/features/15_remote_execution"
                title="How do I use NDIF?"
                aria-label="How do I use NDIF?"
                className="inline-flex size-11 items-center justify-center rounded-[6px] text-ploy-accent-primary transition-colors hover:bg-ploy-accent-primary/10"
              >
                <CircleQuestionMark className="size-6" />
              </a>
              <a
                href="https://login.ndif.us/"
                target="_blank"
                rel="noopener"
                title="Login to NDIF"
                aria-label="Login to NDIF"
                className="inline-flex size-11 items-center justify-center rounded-[6px] text-ploy-accent-primary transition-colors hover:bg-ploy-accent-primary/10"
              >
                <LogIn className="size-6" />
              </a>
            </div>
          </Panel>
          {info ? (
            <Panel title="Cluster" open={panels.cluster} onToggle={() => setPanels((p) => ({ ...p, cluster: !p.cluster }))}>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  [info.totalGpus, "GPUs"],
                  [info.busyGpus, "Holding a model"],
                  [info.totalVram, "Total VRAM"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-[4px] bg-ploy-background-secondary px-1 py-3">
                    <div className="text-[1.25rem] leading-tight font-semibold text-ploy-text-primary">{value}</div>
                    <div className="mt-1 text-[0.6875rem] leading-tight tracking-[0.04em] text-ploy-text-secondary uppercase">{label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex justify-between text-[0.8125rem] text-ploy-text-secondary">
                <span title="Share of the cluster's total GPU memory currently holding model weights.">GPU memory allocated</span>
                <span>{info.memoryPct}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ploy-background-secondary">
                <div className="h-full rounded-full bg-ploy-accent-primary" style={{ width: info.memoryPct + "%" }} />
              </div>
              <p className="mt-5 mb-2 text-[0.75rem] font-semibold tracking-[0.08em] text-ploy-text-secondary uppercase">Nodes</p>
              <ul className="flex flex-col gap-2">
                {info.nodes.map((node) => (
                  <li key={node.rawId} className="flex items-center gap-3">
                    <span title={node.tooltip} className="w-12 shrink-0 font-mono text-[0.75rem] text-ploy-text-secondary">
                      {node.label}
                    </span>
                    <div className="flex flex-1 gap-1">
                      {node.gpuDetails.map((g) => (
                        <div
                          key={g.index}
                          title={g.tooltip}
                          className="h-4 flex-1 overflow-hidden rounded-[2px] bg-ploy-background-secondary shadow-[inset_0_0_0_1px_var(--ploy-border-primary)]"
                        >
                          <div className="h-full bg-ploy-accent-primary/80" style={{ width: g.usedPct + "%" }} />
                        </div>
                      ))}
                    </div>
                    <span className="w-10 shrink-0 text-right font-mono text-[0.75rem] text-ploy-text-secondary">{node.vram}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}
        </aside>

        <div className="min-w-0">
          <div className="flex flex-col gap-4">
            <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
              <button type="button" aria-pressed={!level} onClick={() => (setLevel(null), setPage(1))} className={chip(!level)}>
                All {count(deployments.length, !level)}
              </button>
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={level === l}
                  onClick={() => (setLevel(level === l ? null : l), setPage(1))}
                  className={chip(level === l)}
                >
                  <span className={cn("size-2 rounded-full", dot[l])} />
                  {l[0] + l.slice(1).toLowerCase()} {count(stats[l], level === l)}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="relative min-w-[180px] flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ploy-text-secondary" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => (setQuery(e.target.value), setPage(1))}
                  placeholder="Search models..."
                  aria-label="Search models"
                  className="h-10 w-full rounded-[4px] border border-ploy-border-primary bg-ploy-background-primary pr-3 pl-9 text-[0.9375rem] text-ploy-text-primary placeholder:text-ploy-text-secondary focus:border-ploy-accent-primary focus:outline-none"
                />
              </label>
              <label className="flex items-center gap-2 text-[0.8125rem] text-ploy-text-secondary">
                Sort
                <select
                  value={sort}
                  onChange={(e) => (setSort(e.target.value as Sort), setPage(1))}
                  className="h-10 cursor-pointer rounded-[4px] border border-ploy-border-primary bg-ploy-background-primary px-3 text-[0.9375rem] text-ploy-text-primary focus:border-ploy-accent-primary focus:outline-none"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              {filtered.length > 0 ? pager : null}
            </div>
          </div>

          <div ref={grid} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {status === "loading"
              ? Array.from({ length: 6 }, (_, n) => <div key={n} aria-hidden="true" className="glass h-[132px] animate-pulse rounded-[6px]" />)
              : shown.map((d) => <DeploymentCard key={d.model_key || d.repo_id} d={d} />)}
          </div>
          {status === "success" && shown.length === 0 ? (
            <p className="mt-6 flex items-center justify-center gap-2 py-10 text-[0.9375rem] text-ploy-text-secondary">
              <Search className="size-4" /> No models match your filters.
            </p>
          ) : null}
          {totalPages > 1 ? <div className="mt-8 flex justify-center">{pager}</div> : null}
        </div>
      </div>
    </div>
  );
}
