"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ago, short, sol, solscanTx, tokens, usd } from "@/lib/format";
import { useStatus } from "@/lib/status";
import { useWallet } from "@/lib/wallet";

export type RouteOption = { id: string; label: string; detail: string; needsDest: boolean; placeholder?: string; minLabel: string };

type Payout = {
  id: string;
  route: string;
  dest: string;
  lamports: string;
  out_amount: string | null;
  out_symbol: string | null;
  signature: string | null;
  out_tx: string | null;
  status: string;
  error: string | null;
  not_before: string;
  created_at: string;
};

export type Me = {
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
  preference: { route: string; dest: string | null; updatedAt: string | null };
  payouts: Payout[];
};

const Row = ({ k, v, cls }: { k: string; v: React.ReactNode; cls?: string }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}>
    <span className="mu">{k}</span>
    <span className={cls}>{v}</span>
  </div>
);

export const SignInGate = ({ title, blurb, aside, children }: { title: string; blurb: string; aside?: React.ReactNode; children: React.ReactNode }) => {
  const w = useWallet();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (w.address && w.token) return <>{children}</>;
  return (
    <div className={aside ? "gate gate2" : "gate"}>
      <div className="panel" style={{ padding: 24, display: "grid", gap: 14, alignContent: "start" }}>
        <div style={{ fontSize: 20 }}>{title}</div>
        <p className="mu" style={{ fontSize: 13, lineHeight: 1.7 }}>
          {blurb}
        </p>
        {!w.address ? (
          <button className="btn p" onClick={w.openPicker}>
            connect wallet
          </button>
        ) : (
          <button
            className="btn p"
            disabled={busy}
            onClick={async () => {
              setErr(null);
              setBusy(true);
              try {
                await w.signIn();
              } catch (e) {
                setErr(e instanceof Error ? e.message : "Sign in failed.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "check your wallet…" : `sign in as ${short(w.address)}`}
          </button>
        )}
        {err && <div className="err">{err}</div>}
      </div>
      {aside}
      <style>{`
        .gate { display: grid; gap: 14px; max-width: 520px; margin: 48px auto 0; }
        .gate2 { grid-template-columns: 1fr 1fr; max-width: 980px; }
        @media (max-width: 860px) { .gate2 { grid-template-columns: 1fr; margin-top: 24px; } }
      `}</style>
    </div>
  );
};

/** A read-only list of payout choices shown before sign-in. */
export const ChoicePreview = ({ head, rows }: { head: string; rows: { label: string; min: string; detail: string }[] }) => (
  <div className="panel">
    <div className="panel-head">
      <b>{head}</b>
      <span className="mu">pick after you sign in</span>
    </div>
    {rows.map((r, i) => (
      <div key={r.label} style={{ padding: 14, borderTop: i ? "1px solid var(--line)" : undefined, display: "grid", gap: 6, fontSize: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <span>{r.label}</span>
          <span className="mu">{r.min}</span>
        </div>
        <div className="mu" style={{ lineHeight: 1.6 }}>
          {r.detail}
        </div>
      </div>
    ))}
  </div>
);

export const useMe = () => {
  const w = useWallet();
  const [me, setMe] = useState<Me | null>(null);
  const load = useCallback(async () => {
    if (!w.token) return;
    setMe(await api<Me>("/api/me", { token: w.token }));
  }, [w.token]);
  useEffect(() => {
    void load().catch(() => undefined);
    const t = setInterval(() => void load().catch(() => undefined), 15_000);
    return () => clearInterval(t);
  }, [load]);
  return { me, reload: load };
};

export const Standing = ({ me }: { me: Me | null }) => {
  const { status } = useStatus();
  const min = status?.rules.minHoldUsd ?? 20;
  return (
    <div className="panel">
      <div className="panel-head">
        <b>your share</b>
        <span className="mu">{me ? short(me.wallet) : ""}</span>
      </div>
      <div style={{ padding: 14, display: "grid", gap: 9 }}>
        {me ? (
          <>
            <Row k="holding" v={me.balance !== null && me.decimals !== null ? `${tokens(me.balance, me.decimals)} (${usd(me.balanceUsd)})` : me.live ? "0" : "after launch"} />
            <Row
              k="in the next split"
              v={me.eligibleNow === null ? "after launch" : me.eligibleNow ? "yes, if you hold through the 10 minutes" : `no, hold at least $${min}`}
              cls={me.eligibleNow ? "ok" : "mu"}
            />
            <Row k="owed, not paid yet" v={`${sol(me.owedLamports, 6)} SOL`} />
            <Row k="earned all time" v={`${sol(me.earnedLamports, 6)} SOL`} />
            <Row k="paid all time" v={`${sol(me.paidLamports, 6)} SOL`} />
            {me.recentShares[0] && <div className="mu" style={{ fontSize: 11 }}>last share {sol(me.recentShares[0].lamports, 6)} SOL, {ago(me.recentShares[0].at)}</div>}
          </>
        ) : (
          <div className="mu">loading…</div>
        )}
      </div>
    </div>
  );
};

export const PayoutSettings = ({ me, options, onSaved, note }: { me: Me | null; options: RouteOption[]; onSaved: () => void; note?: React.ReactNode }) => {
  const w = useWallet();
  const [route, setRoute] = useState<string>(options[0].id);
  const [dest, setDest] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  useEffect(() => {
    if (!me) return;
    setRoute(me.preference.route);
    setDest(me.preference.dest ?? "");
  }, [me?.preference.route, me?.preference.dest]); // eslint-disable-line react-hooks/exhaustive-deps
  const opt = options.find((o) => o.id === route) ?? options[0];
  const save = async () => {
    if (!w.address) return;
    setMsg(null);
    setBusy(true);
    try {
      const body = { wallet: w.address, route, dest: opt.needsDest ? dest.trim() : null };
      const n = await api<{ nonce: string; message: string }>("/api/payout/nonce", { method: "POST", body });
      const signature = await w.signMessage(n.message);
      await api("/api/payout", { method: "POST", body: { ...body, nonce: n.nonce, signature } });
      setMsg({ ok: true, text: "saved. your next payout uses this." });
      onSaved();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Could not save." });
    } finally {
      setBusy(false);
    }
  };
  const current = me ? options.find((o) => o.id === me.preference.route) : null;
  return (
    <div className="panel">
      <div className="panel-head">
        <b>how you get paid</b>
        <span className="mu">{current ? `now: ${current.label}` : ""}</span>
      </div>
      <div style={{ padding: 14, display: "grid", gap: 10 }}>
        {options.map((o) => (
          <button
            key={o.id}
            className="bd"
            onClick={() => setRoute(o.id)}
            style={{
              textAlign: "left",
              padding: 12,
              background: "transparent",
              cursor: "pointer",
              borderColor: route === o.id ? "var(--acc)" : "var(--line)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{o.label}</span>
              <span className="mu" style={{ fontSize: 11 }}>
                {o.minLabel}
              </span>
            </div>
            <div className="mu" style={{ fontSize: 11, marginTop: 6, lineHeight: 1.6 }}>
              {o.detail}
            </div>
          </button>
        ))}
        {opt.needsDest && <input className="input" placeholder={opt.placeholder} value={dest} onChange={(e) => setDest(e.target.value)} />}
        <button className="btn p" disabled={busy} onClick={() => void save()}>
          {busy ? "check your wallet…" : "save, sign in your wallet"}
        </button>
        {msg && <div className={msg.ok ? "ok" : "err"}>{msg.text}</div>}
        {note && (
          <div className="mu" style={{ fontSize: 11, lineHeight: 1.6 }}>
            {note}
          </div>
        )}
      </div>
    </div>
  );
};

const STATUS: Record<string, string> = {
  planned: "queued",
  sent: "sending",
  routing: "routing",
  confirmed: "paid",
  failed: "returned to owed",
  refunded: "refunded to owed",
  review: "being checked",
};

export const PayoutHistory = ({ me, labels, outLink }: { me: Me | null; labels: Record<string, string>; outLink?: (p: Payout) => string | null }) => (
  <div className="panel scroll-x">
    <div className="panel-head">
      <b>your payouts</b>
      <span className="mu">only you see destinations</span>
    </div>
    {me?.payouts.length ? (
      <table className="t">
        <tbody>
          {me.payouts.map((p) => {
            const link = p.status === "confirmed" ? (outLink?.(p) ?? (p.signature ? solscanTx(p.signature) : null)) : null;
            return (
              <tr key={p.id}>
                <td>
                  {sol(p.lamports, 6)} SOL <span className="mu">→ {labels[p.route] ?? p.route}</span>
                  {p.route !== "sol" && p.dest && p.dest !== me.wallet && <div className="mu">{short(p.dest, 6)}</div>}
                  {p.out_amount && p.out_symbol === "ZEC" && <div className="mu">{p.out_amount} ZEC</div>}
                </td>
                <td className="mu">{p.status === "planned" && new Date(p.not_before) > new Date() ? "scheduled" : ago(p.created_at)}</td>
                <td style={{ textAlign: "right" }}>
                  {link ? (
                    <a href={link} target="_blank" rel="noreferrer" className="ok">
                      {STATUS[p.status]}
                    </a>
                  ) : (
                    <span className={p.status === "failed" || p.status === "review" ? "err" : "mu"} title={p.error ?? ""}>
                      {STATUS[p.status] ?? p.status}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    ) : (
      <div className="mu" style={{ padding: 14, fontSize: 12 }}>
        no payouts yet. they start once your owed total reaches the minimum for your payout choice.
      </div>
    )}
  </div>
);
