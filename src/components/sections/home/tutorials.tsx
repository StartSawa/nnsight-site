import { Container } from "@/components/design-system/ui/container";
import { Heading } from "@/components/design-system/ui/heading";
import { Marquee } from "@/components/design-system/ui/marquee";
import { docUrl } from "@/lib/docs-links";

const T = "/tutorials/tutorials/";
const MP = "/tutorials/mini-papers/";
const MORE_LINK =
  "text-[0.9375rem] font-medium text-ploy-text-secondary underline decoration-ploy-border-primary underline-offset-[6px] transition-colors hover:text-ploy-text-primary hover:decoration-ploy-text-primary";

export const GROUPS: { name: string; items: [string, string][] }[] = [
  {
    name: "Getting Started",
    items: [
      ["Walkthrough", "get_started/walkthrough/"],
      ["Chat Templates", "get_started/chat_templates/"],
      ["Remote Access", "get_started/start_remote_access/"],
    ],
  },
  {
    name: "Causal Tracing",
    items: [
      ["Causal Models Intro", "causal_mediation_analysis/causal_models_intro/"],
      ["Activation Patching", "causal_mediation_analysis/activation_patching/"],
      ["Attribution Patching", "causal_mediation_analysis/attribution_patching/"],
      ["Causal Mediation I", "causal_mediation_analysis/causal_mediation_analysis_i/"],
      ["Causal Mediation II", "causal_mediation_analysis/causal_mediation_analysis_ii/"],
      ["DAS", "causal_mediation_analysis/DAS/"],
    ],
  },
  {
    name: "Probing",
    items: [
      ["Logit Lens", "probing/logit_lens/"],
      ["Diffusion Lens", "probing/diffusion_lens/"],
      ["Concept Erasure", "probing/concept_erasure/"],
    ],
  },
  {
    name: "Steering",
    items: [
      ["Dictionary Learning", "steering/dict_learning/"],
      ["Evaluating SAEs", "steering/evaluating_saes/"],
      ["LoRA Tutorial", "steering/LoRA_tutorial/"],
    ],
  },
  {
    name: "Attention",
    items: [
      ["Attention Patterns and Per-Head Detection", "attention/attention_heads/"],
    ],
  },
  {
    name: "Circuits",
    items: [["Attribution Graphs", "circuits/attribution_graphs/"]],
  },
  {
    name: "Architectures",
    items: [
      ["MoE Routing", "architectures/moe_routing/"],
      ["State-Space Models", "architectures/state_space_models/"],
    ],
  },
  {
    name: "Migrating",
    items: [["From TransformerLens", "migrating/from_transformerlens/"]],
  },
];

export const MINI_PAPERS: [string, string][] = [
  ["Function Vectors", "todd_function_vectors/"],
  ["Massive Activations", "massive-activations/"],
  ["Induction Heads and the ICL Phase Change", "induction-heads-phase-change/"],
  ["Under-trained Tokens", "under-trained-tokens/"],
  ["Chain-of-Thought Faithfulness", "cot-faithfulness/"],
  ["Belief Lookbacks", "belief-lookbacks/"],
  ["Geometry of Truth", "marks_geometry_of_truth/"],
  ["LLM Depth", "csordas_llm_depth/"],
  ["Dual Route Induction", "feucht_dual_route_induction/"],
  ["Demystifying Memorization", "huang_demystifying_memorization/"],
  ["Jacobian Lens", "jacobian-lens/"],
  ["Patchscopes", "patchscopes/"],
  ["IOI Path Patching", "ioi-path-patching/"],
  ["Progress Measures for Grokking", "grokking-progress-measures/"],
  ["Emergent World Models", "othello-world-models/"],
  ["Concept Attention", "concept-attention/"],
  ["VLM Logit Lens", "vlm-logit-lens/"],
  ["Cyclic Arithmetic", "cyclic-arithmetic/"],
  ["Gaze Heads", "gaze-heads/"],
  ["Matryoshka Attribution", "matryoshka-attribution/"],
];

/**
 * @ployComponent
 * @ployComponentId home-tutorials
 * @ployComponentType section
 * @ployComponentTags tutorials, library, links
 * @ployComponentDescription Tutorial library: grouped tutorial cards (group name plus linked tutorials) and a four-column list of Mini Papers.
 * @ployComponentStatus stable
 */
export function HomeTutorials() {
  return (
    <section className="relative isolate overflow-hidden py-14 md:py-24">
      <Container>
        <div data-rise className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Heading level={2} className="text-ploy-text-primary">
            Tutorials
          </Heading>
          <a href="/tutorials" className={MORE_LINK}>
            All tutorials
          </a>
        </div>

        <div data-rise-group className="mt-12 grid grid-cols-2 gap-3 [--stagger:50ms] md:gap-4 lg:grid-cols-4">
          {GROUPS.map((g) => (
            <article key={g.name} className="glass flex h-full flex-col rounded-[6px] p-4 md:p-6">
              <Heading level={6} as="h3" className="text-ploy-text-primary">
                {g.name}
              </Heading>
              <ul className="mt-3 flex flex-col gap-0.5 md:mt-4 md:gap-1">
                {g.items.map(([label, path]) => (
                  <li key={path}>
                    <a
                      href={docUrl(T + path)}
                      className="inline-block py-1 text-[0.9375rem] leading-[1.45] text-ploy-text-secondary transition-colors hover:text-ploy-accent-primary"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

      </Container>

      <div data-rise className="mt-16 md:mt-20">
        <Container className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Heading level={4} as="h3" className="text-ploy-text-primary">
              Mini Papers
            </Heading>
            <p className="mt-2 max-w-[34rem] text-[0.9375rem] leading-[1.55] text-ploy-text-secondary">
              Reproductions of key research papers using nnsight.
            </p>
          </div>
          <a href="/tutorials/mini-papers" className={MORE_LINK}>
            All Mini Papers
          </a>
        </Container>
        <div className="mt-8 flex flex-col gap-3">
          {[MINI_PAPERS.slice(0, 10), MINI_PAPERS.slice(10)].map((row, i) => (
            <Marquee
              key={i}
              reverse={i === 1}
              pauseOnHover
              repeat={3}
              className="py-2 [--duration:70s] [--gap:0.75rem] [--fade:6rem]"
            >
              {row.map(([label, path]) => (
                <a
                  key={path}
                  href={docUrl(MP + path)}
                  className="glass flex items-center rounded-[6px] px-5 py-3.5 text-[0.9375rem] font-medium text-ploy-text-primary hover:text-ploy-accent-primary"
                >
                  {label}
                </a>
              ))}
            </Marquee>
          ))}
        </div>
      </div>
    </section>
  );
}
