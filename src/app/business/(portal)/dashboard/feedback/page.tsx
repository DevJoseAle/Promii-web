"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function FeedbackPage() {
  const [text, setText] = useState("");

  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary">Feedback</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Cuéntanos qué mejorarías. Esto luego lo conectamos a una tabla o a email.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ej: Me gustaría que..."
        className="mt-4 min-h-[140px] w-full rounded-xl border border-border bg-surface p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      <div className="mt-3">
        <Button
          className="bg-primary text-white hover:bg-primary/90"
          disabled={!text.trim()}
          onClick={() => {
            // Aquí luego conectamos Supabase (feedbacks table) o mail.
            setText("");
          }}
        >
          Enviar
        </Button>
      </div>
    </div>
  );
}
