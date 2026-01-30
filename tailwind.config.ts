// tailwind.config.ts
export default {
  theme: {
    extend: {
      keyframes: {
        drawerSlideLeftAndFade: {
          from: { opacity: "0", transform: "translateX(100%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        drawerSlideRightAndFade: {
          from: { opacity: "1", transform: "translateX(0)" },
          to: { opacity: "0", transform: "translateX(100%)" },
        },
        accordionOpen: {
          from: { height: "0px" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        accordionClose: {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0px" },
        },
      },
      animation: {
        "drawer-slide-left-and-fade":
          "drawerSlideLeftAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "drawer-slide-right-and-fade": "drawerSlideRightAndFade 150ms ease-in",
        "accordion-open": "accordionOpen 150ms cubic-bezier(0.87, 0, 0.13, 1)",
        "accordion-close": "accordionClose 150ms cubic-bezier(0.87, 0, 0.13, 1)",
      },
    },
  },
};
