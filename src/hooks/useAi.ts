"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AiGenerateInput, AiMode } from "@/lib/validation";

export function useAiGenerate() {
  return useMutation({
    mutationFn: (input: AiGenerateInput) =>
      api.post<{ text: string; mode: AiMode }>("/ai/generate", input),
  });
}
