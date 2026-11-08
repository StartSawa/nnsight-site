"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { Children, isValidElement } from "react";

import { cn } from "@/lib/utils";

import { Text } from "./text";

/** A row's id: its `value`, else its question. Faq and FaqItem must agree. */
function rowId(value: string | undefined, question: string) {
  return value ?? question.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/** The row's own chevron. It has to rotate, which a font icon fights. */
function Chevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-4 w-4 shrink-0 transition-transform duration-[250ms] group-data-[state=open]/row:rotate-180"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

/**
 * @ployComponent
 * @ployComponentId faq
 * @ployComponentType component
 * @ployComponentTags disclosure, accordion, faq
 * @ployComponentDescription The measured accordion. Radix handles keyboard navigation and ARIA; type='single' opens one row at a time, 'multiple' allows several. The first row opens unless defaultValue says otherwise; defaultValue={[]} opens none.
 * @ployComponentStatus stable
 */
export function Faq({
  children,
  type = "multiple",
  animate = false,
  defaultValue,
  value,
  onValueChange,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  /** Several rows open at once by default; "single" closes the others. */
  type?: "single" | "multiple";
  /** Animate every row's height. A page's disclosures animate or they do not. */
  animate?: boolean;
  /** Initially open row(s); single mode uses the first value. Omitted opens the first row; [] opens none. */
  defaultValue?: string | string[];
  /** Controlled selection for associated media; single mode uses the first id. */
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  className?: string;
}) {
  // KRBY098 faq-opens-first-row: no defaultValue opens the first row, so the
  // reader sees an answer before they click. An explicit value, [] included, wins.
  const first = Children.toArray(children).find(isValidElement) as
    | React.ReactElement<{ value?: string; question?: string }>
    | undefined;
  const firstId = rowId(first?.props.value, first?.props.question ?? "");
  const defaults =
    defaultValue === undefined
      ? firstId
        ? [firstId]
        : []
      : Array.isArray(defaultValue)
        ? defaultValue
        : [defaultValue];
  return (
    <Accordion.Root
      // `collapsible` so the open row can be closed again; without it a
      // single-type accordion traps the reader on whichever row they opened.
      {...(type === "single"
        ? {
            type: "single" as const,
            collapsible: true,
            defaultValue: defaults[0],
            value: Array.isArray(value) ? value[0] : value,
            onValueChange,
          }
        : {
            type: "multiple" as const,
            defaultValue: defaults,
            value:
              value === undefined
                ? undefined
                : Array.isArray(value)
                  ? value
                  : [value],
            onValueChange,
          })}
      data-ploy-component="faq"
      data-animate={animate ? "" : undefined}
      className={cn("group/faq w-full", className)}
      {...props}
    >
      {children}
    </Accordion.Root>
  );
}

/**
 * @ployComponent
 * @ployComponentId faq-item
 * @ployComponentType component
 * @ployComponentTags disclosure, accordion, faq
 * @ployComponentDescription One question and its answer. `value` is its id and defaults to the question, so a row opens whether or not you pass one.
 * @ployComponentStatus stable
 */
export function FaqItem({
  value,
  question,
  icon,
  showIndicator = true,
  children,
  className = "",
  ...props
}: {
  /** Optional: defaults to the question. Radix needs one stable id per row. */
  value?: string;
  question: string;
  icon?: React.ReactNode;
  /** Set false when the captured disclosure has no trailing indicator. */
  showIndicator?: boolean;
  children: React.ReactNode;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<"div">, "className" | "value">) {
  return (
    <Accordion.Item
      // Derived from the question when a call site omits it. Declared required,
      // this prop was simply left off — Radix then tracked every row under the
      // same undefined id and not one of them opened. The question already
      // identifies the row.
      value={rowId(value, question)}
      data-ploy-component="faq-item"
      className={cn(
        "border-b border-ploy-border-primary last:border-b-0",
        className,
      )}
      {...props}
    >
      <Accordion.Header>
        <Accordion.Trigger className="group/row flex w-full cursor-pointer items-center justify-between gap-4 py-[16px] text-left text-[1.4375rem] font-bold">
          <span className="flex min-w-0 items-center gap-3">
            {icon}
            {question}
          </span>
          {showIndicator && <Chevron />}
        </Accordion.Trigger>
      </Accordion.Header>

      {/* Radix publishes the measured content height as a CSS variable, which is
          what makes an `auto` height animatable at all. The keyframes are in
          globals.css; without `data-animate` on the root they never match. */}
      <Accordion.Content className="overflow-hidden group-data-[animate]/faq:data-[state=closed]:animate-faq-up group-data-[animate]/faq:data-[state=open]:animate-faq-down">
        <div className="pb-[16px] pr-8">
          {typeof children === "string" ? <Text>{children}</Text> : children}
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
}
