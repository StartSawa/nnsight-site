import type { ReactNode } from "react";
import { Button } from "@/components/design-system/ui/button";
import { Container } from "@/components/design-system/ui/container";
import { Heading } from "@/components/design-system/ui/heading";
import { Text } from "@/components/design-system/ui/text";
import { docUrl } from "@/lib/docs-links";


export type Feature = { name: string; slug: string; summary: ReactNode; plain?: string };

export const FEATURES: Feature[] = [
  { name: "Getting Activations", slug: "1_getting/", summary: "Access hidden states and activations from any layer" },
  { name: "Setting Activations", slug: "2_setting/", summary: "Modify activations to study causal effects" },
  { name: "Gradients", slug: "3_gradients/", summary: "Compute gradients with respect to intermediate values" },
  { name: "Multiple Token Generation", slug: "4_multiple_token/", summary: "Work with autoregressive generation" },
  { name: "Loading a Model", slug: "5_loading/", summary: "Constructor options, meta-model dispatch, and device placement" },
  { name: "Module Access", slug: "6_modules/", summary: "Navigate and access model components" },
  { name: "Model Editing", slug: "7_model_editing/", summary: "Create persistent model modifications" },
  { name: "Batching", slug: "8_batching/", summary: "Combine multiple prompts in one forward pass and move values between them" },
  { name: "Empty Invokers", slug: "9_empty_invokers/", summary: "Run interventions without input data" },
  { name: "Cache", slug: "10_cache/", summary: "Bulk-collect activations from many modules in one pass" },
  { name: "Intermediate Operations", slug: "11_source/", summary: "Access intermediate operations inside modules" },
  { name: "Early Stopping", slug: "12_early_stopping/", summary: "Stop computation early for efficiency" },
  { name: "Skip Execution", slug: "13_skip/", summary: "Skip parts of model execution" },
  { name: "Scan", slug: "14_scan/", summary: "Infer shapes without full execution" },
  { name: "Remote Execution", slug: "15_remote_execution/", summary: "Run on NDIF's remote infrastructure" },
  { name: "vLLM Support", slug: "16_vllm_support/", summary: "High-performance inference with vLLM" },
  {
    name: "Tensor Parallelism",
    slug: "17_tensor_parallel/",
    plain: "Trace a model sharded across several GPUs with transformers tensor parallelism",
    summary: (
      <>
        Trace a model sharded across several GPUs with{" "}
        <code className="font-mono text-[0.9em]">transformers</code> tensor
        parallelism
      </>
    ),
  },
  {
    name: "Quantization",
    slug: "18_quantization/",
    summary:
      "Hold a model in 4 or 8 bits: the names, what a trace sees, and what memory, accuracy and speed cost",
  },
];

/**
 * @ployComponent
 * @ployComponentId home-features-index
 * @ployComponentType section
 * @ployComponentTags features, index, links
 * @ployComponentDescription All 18 feature notebooks beside a sticky heading: a two-column list of linked names and one-line summaries, with a Features button.
 * @ployComponentStatus stable
 */
export function HomeFeaturesIndex() {
  return (
    <section className="relative isolate overflow-hidden py-14 md:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
          <div data-rise className="lg:sticky lg:top-32 lg:self-start">
            <Heading level={2} className="max-w-[12ch] text-ploy-text-primary">
              All our features
            </Heading>
            <Text className="mt-5 max-w-sm text-ploy-text-secondary">
              Each of the 18 features has a notebook you can run.
            </Text>
            <Button variant="secondary" href="/features" className="mt-8">
              Browse features
            </Button>
          </div>

          <div data-rise-group className="grid gap-x-10 [--stagger:30ms] sm:grid-cols-2">
            {FEATURES.map((f) => (
              <a
                key={f.slug}
                href={docUrl("/features/" + f.slug)}
                className="group block h-full border-t border-ploy-border-primary py-4 md:py-6"
              >
                <span className="block text-[1.0625rem] font-semibold tracking-[-0.01em] text-ploy-text-primary transition-colors group-hover:text-ploy-accent-primary">
                  {f.name}
                </span>
                <span className="mt-1 block text-[0.9375rem] leading-[1.55] text-ploy-text-secondary">
                  {f.summary}
                </span>
              </a>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
