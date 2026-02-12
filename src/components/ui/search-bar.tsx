"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { COLORS } from "@/config/colors";
import { Input } from "./input";
import { Button } from "./button";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-2xl">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 size-5 -translate-y-1/2"
          style={{ color: COLORS.text.tertiary }}
        />
        <Input
          type="search"
          placeholder="Buscar promociones..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 pl-11 pr-24"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.main,
          }}
        />
        <Button
          type="submit"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-9"
          style={{
            backgroundColor: COLORS.primary.main,
            color: COLORS.text.inverse,
          }}
        >
          Buscar
        </Button>
      </div>
    </form>
  );
}
