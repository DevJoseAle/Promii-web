import React from "react";

export function useObjectUrls(files: File[]) {
  const [urls, setUrls] = React.useState<string[]>([]);

  React.useEffect(() => {
    const next = files.map((f) => URL.createObjectURL(f));
    setUrls(next);

    return () => {
      next.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  return urls;
}