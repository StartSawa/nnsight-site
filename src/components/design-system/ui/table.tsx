"use client";

import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * @ployComponent
 * @ployComponentId table
 * @ployComponentType component
 * @ployComponentTags data, table, measured
 * @ployComponentDescription Table with horizontal overflow, shared body type, and measured rules and surfaces.
 * @ployComponentStatus stable
 * The brand's table: shadcn's structure carrying this page's own measured
 * type, rules and surfaces rather than that library's neutral palette.
 *
 * It sets NO type: a table renders the page's body copy, and sizing it here
 * took the smallest measured variant, so tabular data read as fine print.
 *
 * The source has no table, so these are DERIVED: rules from its measured border token, cell padding from half its card inset. Adjust freely — nothing here was measured.
 *
 * The wrapper scrolls horizontally rather than letting a wide table push the
 * page sideways, which is the defect every hand-written table ships with.
 */
export function Table({
  hoverRows = false,
  className,
  ...props
}: ComponentProps<"table"> & {
  /**
   * Light each row under the cursor. OFF by default — a hover says "this row
   * does something", and most tables on a marketing page are static, so a
   * table that lights up is claiming an interaction it does not have.
   *
   * It belongs to the TABLE, not to a row: rows in one table cannot disagree
   * about whether they respond to a cursor.
   */
  hoverRows?: boolean;
}) {
  return (
    <div
      data-ploy-component="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-ploy-component="table"
        // Read by every row through the group, so one prop settles the table.
        data-hover-rows={hoverRows ? "" : undefined}
        className={cn(
          // NO type of its own. Sized here it took the SMALLEST measured
          // variant — text-xs on one source — so tabular data read as fine
          // print beside the prose above it. shadcn's text-sm is the same
          // mistake with a different number. A table inherits the page's body
          // copy; a cell that needs to differ says so at the call site.
          "group/table w-full caption-bottom border-collapse text-ploy-text-primary",
          className,
        )}
        {...props}
      />
    </div>
  );
}

/**
 * @ployComponent
 * @ployComponentId table-header
 * @ployComponentType component
 * @ployComponentTags data, table
 * @ployComponentDescription The head row group. Its rule is the brand's border token.
 * @ployComponentStatus stable
 */
export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return (
    <thead
      data-ploy-component="table-header"
      className={cn(
        "[&_tr]:border-b [&_tr]:border-ploy-border-primary",
        className,
      )}
      {...props}
    />
  );
}

/**
 * @ployComponent
 * @ployComponentId table-body
 * @ployComponentType component
 * @ployComponentTags data, table
 * @ployComponentDescription The body row group. The last row drops its rule so the table does not end on a line.
 * @ployComponentStatus stable
 */
export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return (
    <tbody
      data-ploy-component="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

/**
 * @ployComponent
 * @ployComponentId table-footer
 * @ployComponentType component
 * @ployComponentTags data, table
 * @ployComponentDescription A totals row group, on the brand's alternate surface.
 * @ployComponentStatus stable
 */
export function TableFooter({ className, ...props }: ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-ploy-component="table-footer"
      className={cn(
        "border-t border-ploy-border-primary bg-ploy-background-secondary font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

/**
 * @ployComponent
 * @ployComponentId table-row
 * @ployComponentType component
 * @ployComponentTags data, table
 * @ployComponentDescription One row. Rules are a 1px hairline — a measured section divider is far too heavy here.
 * @ployComponentStatus stable
 */
export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      data-ploy-component="table-row"
      // 1px, not the measured separator thickness: that number describes a
      // SECTION divider, and at 3px a table reads as a stack of boxes.
      className={cn(
        "border-b border-ploy-border-primary transition-colors group-data-[hover-rows]/table:hover:bg-ploy-background-secondary data-[state=selected]:bg-ploy-background-secondary",
        className,
      )}
      {...props}
    />
  );
}

/**
 * @ployComponent
 * @ployComponentId table-head
 * @ployComponentType component
 * @ployComponentTags data, table
 * @ployComponentDescription A column heading. Left-aligned and emphasised, never a smaller grey.
 * @ployComponentStatus stable
 */
export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      data-ploy-component="table-head"
      className={cn(
        "px-[12px] py-[8px] text-left align-middle whitespace-nowrap font-medium text-ploy-text-primary",
        className,
      )}
      {...props}
    />
  );
}

/**
 * @ployComponent
 * @ployComponentId table-cell
 * @ployComponentType component
 * @ployComponentTags data, table
 * @ployComponentDescription One cell, at the measured inset.
 * @ployComponentStatus stable
 */
export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      data-ploy-component="table-cell"
      className={cn("px-[12px] py-[8px] align-middle", className)}
      {...props}
    />
  );
}

/**
 * @ployComponent
 * @ployComponentId table-caption
 * @ployComponentType component
 * @ployComponentTags data, table
 * @ployComponentDescription The table's caption, in the brand's secondary text colour.
 * @ployComponentStatus stable
 */
export function TableCaption({
  className,
  ...props
}: ComponentProps<"caption">) {
  return (
    <caption
      data-ploy-component="table-caption"
      className={cn("mt-4 text-ploy-text-secondary", className)}
      {...props}
    />
  );
}
