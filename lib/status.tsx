"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";

export type Status = {
  ticker: string;
  live: boolean;
  mint: string | null;
  nextSplitAt: string;
  rules: { splitMinutes: number; minHoldUsd: number; holderShareBps: number; deductCosts: boolean; minSolPayoutLamports: string };
  priceUsd: number | null;
  solUsd: number | null;
  lastSplit: Record<string, string | number | null> | null;
  totals: { splits: number; allocatedLamports: string; paidLamports: string; paidWallets: number; inflowLamports: string; costLamports: string };
  treasury: { address: string; lamports: string | null; owedLamports: string } | null;
  routes?: { minRoutedUsd: number; minZecUsd: number };
  minStockUsd?: number;
  stocks?: { id: string; mint: string; symbol: string; name: string; priceUsd: number | null }[];
};

const Ctx = createContext<{ status: Status | null; offline: boolean }>({ status: null, offline: false });

export const StatusProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<Status | null>(null);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const s = await api<Status>("/api/status");
        if (!alive) return;
        setStatus(s);
        setOffline(false);
      } catch {
        if (alive) setOffline(true);
      }
    };
    void load();
    const t = setInterval(load, 20_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);
  return <Ctx.Provider value={{ status, offline }}>{children}</Ctx.Provider>;
};

export const useStatus = () => useContext(Ctx);
