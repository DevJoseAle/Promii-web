// src/components/Accordion.tsx
// Tremor Accordion [v1.0.0] (tal cual doc)

import React from "react";
import * as AccordionPrimitives from "@radix-ui/react-accordion";
import { RiAddLine } from "@remixicon/react";
import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitives.Root;
// Nota: en la doc aparece esto así, lo dejamos igual (aunque el displayName luce raro)
Accordion.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitives.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitives.Trigger>
>(({ className, children, ...props }, forwardedRef) => (
  <AccordionPrimitives.Header className="flex">
    <AccordionPrimitives.Trigger
      className={cn(
        // base
        "group flex flex-1 cursor-pointer items-center justify-between py-3 text-left text-sm font-medium leading-none",
        // text color
        "text-foreground",
        // disabled
        "data-disabled:cursor-default data-disabled:text-muted-foreground",
        // focus
        "focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset",
        className,
      )}
      {...props}
      ref={forwardedRef}
    >
      {children}
      <RiAddLine
        className={cn(
          // base
          "size-5 shrink-0 transition-transform duration-150 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:-rotate-45",
          // text color
          "text-muted-foreground",
          // disabled
          "group-data-disabled:opacity-50",
        )}
        aria-hidden="true"
        focusable="false"
      />
    </AccordionPrimitives.Trigger>
  </AccordionPrimitives.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitives.Content>
>(({ className, children, ...props }, forwardedRef) => (
  <AccordionPrimitives.Content
    ref={forwardedRef}
    className={cn(
      "data-[state=closed]:animate-accordion-close data-[state=open]:animate-accordion-open transform-gpu",
    )}
    {...props}
  >
    <div
      className={cn(
        // base
        "overflow-hidden pb-4 text-sm",
        // text color
        "text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  </AccordionPrimitives.Content>
));
AccordionContent.displayName = "AccordionContent";

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitives.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitives.Item>
>(({ className, ...props }, forwardedRef) => (
  <AccordionPrimitives.Item
    ref={forwardedRef}
    className={cn(
      // base
      "overflow-hidden border-b first:mt-0",
      // border color
      "border-border",
      className,
    )}
    tremor-id="tremor-raw"
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
