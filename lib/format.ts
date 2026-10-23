export const LAMPORTS = 1_000_000_000;

export const toBig = (v: unknown) => {
  try {
    return BigInt(String(v ?? "0"));
  } catch {
    return 0n;
  }
};

export const sol = (lamports: unknown, digits = 4) => {
  const n = Number(toBig(lamports)) / LAMPORTS;
  if (n === 0) return "0";
  if (n < 0.000001) return "<0.000001";
  if (n < 0.0001) return n.toFixed(6);
  return n.toLocaleString("en-US", { maximumFractionDigits: digits });
};

export const usd = (n: number | null | undefined) => {
  if (n === null || n === undefined || !Number.isFinite(n)) return "–";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${(n / 1_000).toFixed(1)}K`;
  if (n >= 1) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  return `$${n.toPrecision(3)}`;
};

export const tokens = (raw: unknown, decimals: number) => {
  const n = Number(toBig(raw)) / 10 ** decimals;
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
};

export const short = (a: string | null | undefined, n = 4) => (a ? `${a.slice(0, n)}…${a.slice(-n)}` : "");

export const solscanTx = (sig: string) => `https://solscan.io/tx/${sig}`;
export const solscanAccount = (a: string) => `https://solscan.io/account/${a}`;

export const ago = (iso: string | Date) => {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export const parseSol = (v: string) => {
  const t = v.trim();
  if (!/^\d+(\.\d{1,9})?$/.test(t)) return null;
  return t;
};
