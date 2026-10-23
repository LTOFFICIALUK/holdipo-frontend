"use client";

import { useEffect, useState } from "react";

type DexPair = { pairAddress?: string; volume?: { m5?: number; h1?: number }; liquidity?: { usd?: number } };

// A mint page can sit on a dead pump.fun curve after the coin moves to a pool,
// so chart the pair that is actually trading, and re-check it every 30 seconds.
const activePair = (pairs: DexPair[]) =>
  [...pairs]
    .filter((p) => p.pairAddress)
    .sort((a, b) => {
      const score = (p: DexPair) => (p.volume?.m5 ?? 0) * 1_000_000 + (p.volume?.h1 ?? 0) * 1_000 + (p.liquidity?.usd ?? 0);
      return score(b) - score(a);
    })[0]?.pairAddress ?? null;

const chartSrc = (address: string) =>
  `https://dexscreener.com/solana/${address}?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=1&chartType=marketCap&interval=1`;

export const Chart = ({ mint, height = 380 }: { mint: string; height?: number }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    let alive = true;
    setAddress(null);
    const load = () =>
      fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((body: { pairs?: DexPair[] } | null) => {
          if (alive) setAddress(activePair(body?.pairs ?? []) ?? mint);
        })
        .catch(() => {
          if (alive) setAddress((current) => current ?? mint);
        });
    void load();
    const t = setInterval(load, 30_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [mint]);
  return (
    <div className="panel" style={{ height, overflow: "hidden", position: "relative" }}>
      {address && <iframe key={`${address}-${n}`} title="chart" src={chartSrc(address)} style={{ width: "100%", height: "100%", border: 0 }} />}
      <button className="btn sm" onClick={() => setN((x) => x + 1)} style={{ position: "absolute", right: 8, bottom: 8, background: "var(--bg)", opacity: 0.85 }}>
        refresh chart
      </button>
    </div>
  );
};
