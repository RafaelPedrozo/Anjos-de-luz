"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { monthOptions } from "@/data/shared";

const STORAGE_KEY = "viaconeta-period";

interface PeriodState {
  month: string;
  year: string;
  label: string;
  setPeriod: (month: string, year: string) => void;
}

const PeriodContext = createContext<PeriodState | null>(null);

function periodLabel(month: string, year: string) {
  const name = monthOptions.find((m) => m.value === month)?.label ?? month;
  return `${name} ${year}`;
}

function currentDefaults() {
  const now = new Date();
  return {
    month: String(now.getMonth() + 1).padStart(2, "0"),
    year: String(now.getFullYear()),
  };
}

export function PeriodProvider({ children }: { children: ReactNode }) {
  const defaults = currentDefaults();
  const [month, setMonth] = useState(defaults.month);
  const [year, setYear] = useState(defaults.year);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { month?: string; year?: string };
        if (parsed.month && parsed.year) {
          setMonth(parsed.month);
          setYear(parsed.year);
        }
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const setPeriod = useCallback((nextMonth: string, nextYear: string) => {
    setMonth(nextMonth);
    setYear(nextYear);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ month: nextMonth, year: nextYear }),
    );
  }, []);

  const value = useMemo(
    () => ({
      month,
      year,
      label: hydrated ? periodLabel(month, year) : periodLabel(defaults.month, defaults.year),
      setPeriod,
    }),
    [month, year, hydrated, setPeriod, defaults.month, defaults.year],
  );

  return (
    <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>
  );
}

export function usePeriod() {
  const ctx = useContext(PeriodContext);
  if (!ctx) {
    throw new Error("usePeriod deve ser usado dentro de PeriodProvider");
  }
  return ctx;
}
