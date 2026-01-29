import { ReactNode } from "react";

export function AuthCard({
  heading,
  subheading,
  children,
}: {
  heading: string;
  subheading?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-surface p-6 shadow-sm">
      <div className="text-xl font-bold text-text-primary">{heading}</div>
      {subheading ? (
        <div className="mt-1 text-sm text-text-secondary">{subheading}</div>
      ) : null}
      <div className="mt-6">{children}</div>
    </div>
  );
}
