"use client";

import { useEffect, useState } from "react";
import { Chart } from "@/components/chart";
import { Countdown } from "@/components/countdown";
import { api } from "@/lib/api";
import { ago, short, sol, solscanAccount, solscanTx, tokens, usd } from "@/lib/format";
import { useStatus } from "@/lib/status";
import { useWallet } from "@/lib/wallet";

type Split = {
  id: string;
  at: string;
  source_lamports: string;
  pool_lamports: string;
  allocated_lamports: string;
  carry_out: string;
  eligible_count: number;
  token_price_usd: number | null;
  inflows: { kind: string; lamports: string; signature: string | null; move_signature: string | null }[];
};
type Payout = { route?: string; wallet: string | null; lamports: string | null; signature: string | null; at?: string; updated_at?: string; out_symbol?: string | null };
type Standing = {
  wallet: string;
  live: boolean;
  balance: string | null;
  decimals: number | null;
  balanceUsd: number | null;
  eligibleNow: boolean | null;
  owedLamports: string;
  earnedLamports: string;
  paidLamports: string;
  recentShares: { id: string; at: string; balance: string; lamports: string }[];
};

const CheckWallet = () => {
  const w = useWallet();
  const { status } = useStatus();
  const [addr, setAddr] = useState("");
  const [out, setOut] = useState<Standing | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (w.address && !addr) setAddr(w.address);
  }, [w.address, addr]);
  const check = async () => {
    setErr(null);
    try {
      setOut(await api<Standing>(`/api/wallet/${addr.trim()}`));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Check failed.");
    }
  };
  const min = status?.rules.minHoldUsd ?? 20;
  return (
    <div className="panel">
      <div className="panel-head">
        <b>check a wallet</b>
        <span className="mu">public, read only</span>
      </div>
      <div style={{ padding: 14, display: "grid", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="input" placeholder="wallet address" value={addr} onChange={(e) => setAddr(e.target.value)} />
          <button className="btn" onClick={() => void check()}>
            check
          </button>
        </div>
        {err && <div className="err">{err}</div>}
        {!out && !err && (
          <div className="mu" style={{ fontSize: 11, lineHeight: 1.6 }}>
            paste any wallet to see what it holds, whether it is in the next split, and what it has been owed and paid.
          </div>
        )}
        {out && (
          <div style={{ display: "grid", gap: 8, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="mu">holding</span>
              <span>
                {out.balance !== null && out.decimals !== null ? tokens(out.balance, out.decimals) : "–"} <span className="mu">({usd(out.balanceUsd)})</span>
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="mu">in the next split</span>
              <span className={out.eligibleNow ? "ok" : "mu"}>
                {out.eligibleNow === null ? "after launch" : out.eligibleNow ? `yes, if held through the 10 minutes` : `no, hold at least $${min}`}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="mu">owed, not paid yet</span>
              <span>{sol(out.owedLamports, 6)} SOL</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="mu">earned all time</span>
              <span>{sol(out.earnedLamports, 6)} SOL</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="mu">paid all time</span>
              <span>{sol(out.paidLamports, 6)} SOL</span>
            </div>
            {out.recentShares.length > 0 && (
              <div className="mu" style={{ fontSize: 11 }}>
                last share {sol(out.recentShares[0].lamports, 6)} SOL, {ago(out.recentShares[0].at)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const Record = ({ intro, routeLabel }: { intro: React.ReactNode; routeLabel: (p: Payout) => string }) => {
  const { status } = useStatus();
  const [splits, setSplits] = useState<Split[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  useEffect(() => {
    const load = () => {
      void api<{ splits: Split[] }>("/api/splits?limit=40").then((r) => setSplits(r.splits)).catch(() => undefined);
      void api<{ payouts: Payout[] }>("/api/payouts/recent").then((r) => setPayouts(r.payouts)).catch(() => undefined);
    };
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, []);
  return (
    <div>
      {intro}
      {status?.live && status.mint && (
        <div style={{ marginTop: 26 }}>
          <Chart mint={status.mint} height={340} />
        </div>
      )}
      <div className="stats" style={{ marginTop: 26 }}>
        {[
          [status?.live ? <Countdown key="c" to={status.nextSplitAt} /> : "soon", "NEXT SPLIT"],
          [String(status?.totals.splits ?? 0), "SPLITS SO FAR"],
          [`${sol(status?.totals.allocatedLamports ?? "0")} SOL`, "SPLIT TO HOLDERS"],
          [`${sol(status?.totals.paidLamports ?? "0")} SOL`, "PAID OUT"],
        ].map(([a, b], i) => (
          <div key={i} className="stat">
            <div style={{ fontSize: 26 }}>{a}</div>
            <div className="mu" style={{ fontSize: 11, letterSpacing: ".14em", marginTop: 8 }}>
              {b}
            </div>
          </div>
        ))}
      </div>
      <div className="two" style={{ marginTop: 18 }}>
        <CheckWallet />
        <div className="panel">
          <div className="panel-head">
            <b>treasury</b>
            {status?.treasury && (
              <a className="mu" href={solscanAccount(status.treasury.address)} target="_blank" rel="noreferrer">
                solscan
              </a>
            )}
          </div>
          <div style={{ padding: 14, display: "grid", gap: 8, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="mu">address</span>
              <code>{short(status?.treasury?.address, 6)}</code>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="mu">holds</span>
              <span>{status?.treasury?.lamports ? `${sol(status.treasury.lamports)} SOL` : "–"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="mu">owed to holders</span>
              <span>{sol(status?.treasury?.owedLamports ?? "0")} SOL</span>
            </div>
            <div className="mu" style={{ fontSize: 11, lineHeight: 1.6 }}>
              the treasury only pays holders. payouts stop if it ever holds less than it owes, so every number here can be checked on solscan.
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 36 }}>
        <div className="sec">splits</div>
        <div className="panel scroll-x">
          {splits.length ? (
            <table className="t">
              <thead>
                <tr>
                  <th>split</th>
                  <th>creator fees in</th>
                  <th>pool</th>
                  <th>wallets</th>
                  <th>split out</th>
                  <th>carried</th>
                  <th>proof</th>
                </tr>
              </thead>
              <tbody>
                {splits.map((s) => (
                  <tr key={s.id}>
                    <td>
                      #{s.id} <span className="mu">{ago(s.at)}</span>
                    </td>
                    <td>{sol(s.source_lamports, 6)}</td>
                    <td>{sol(s.pool_lamports, 6)}</td>
                    <td>{s.eligible_count}</td>
                    <td>{sol(s.allocated_lamports, 6)}</td>
                    <td className="mu">{sol(s.carry_out, 6)}</td>
                    <td>
                      {s.inflows.map((i) =>
                        i.signature ? (
                          <a key={i.signature} href={solscanTx(i.signature)} target="_blank" rel="noreferrer" className="acc" style={{ marginRight: 8 }}>
                            in
                          </a>
                        ) : null,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="mu" style={{ padding: 18, fontSize: 12 }}>
              the first split lands here.
            </div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 36 }}>
        <div className="sec">payouts</div>
        <div className="panel scroll-x">
          {payouts.length ? (
            <table className="t">
              <tbody>
                {payouts.map((p, i) => (
                  <tr key={i}>
                    <td>{p.wallet ? <code>{short(p.wallet)}</code> : <span className="mu">private route</span>}</td>
                    <td>{p.lamports ? `${sol(p.lamports, 6)} SOL` : <span className="mu">hidden</span>}</td>
                    <td className="mu">{routeLabel(p)}</td>
                    <td className="mu">{ago(p.at ?? p.updated_at ?? "")}</td>
                    <td style={{ textAlign: "right" }}>
                      {p.signature ? (
                        <a href={solscanTx(p.signature)} target="_blank" rel="noreferrer" className="acc">
                          solscan
                        </a>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="mu" style={{ padding: 18, fontSize: 12 }}>
              payouts show here with solscan links.
            </div>
          )}
        </div>
      </div>
      <style>{`
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid var(--line); }
        .stat { padding: 20px 18px; border-right: 1px solid var(--line); }
        .stat:last-child { border-right: none; }
        .two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 860px) { .stats { grid-template-columns: 1fr 1fr; } .stat:nth-child(2n) { border-right: none; } .stat:nth-child(-n + 2) { border-bottom: 1px solid var(--line); } .two { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};
