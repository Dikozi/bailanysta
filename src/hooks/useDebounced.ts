"use client";

import { useEffect, useState } from "react";

/** Откладывает значение, чтобы поиск не бил в API на каждое нажатие клавиши. */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
