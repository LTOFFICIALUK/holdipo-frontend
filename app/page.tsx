"use client";

import Link from "next/link";
import { ago, sol, usd } from "@/lib/format";
import { useStatus } from "@/lib/status";

const Arc = () => {
  const dots = Array.from({ length: 15 }, (_, i) => {
    const a = Math.PI + (i * Math.PI) / 14;
    return { x: 280 + 250 * Math.cos(a), y: 210 + 170 * Math.sin(a) };
  });
  return (
    <svg viewBox="0 0 560 230" style={{ width: "100%", height: "auto", display: "block" }} aria-hidden>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r="2.4" fill="#F1EEE4" opacity=".75" />
      ))}
      <line x1="280" y1="40" x2="280" y2="215" stroke="#3a3833" />
    </svg>
  );
};

export default function Home() {
  const { status } = useStatus();
  const t = status?.ticker ?? "$IPO";
  const min = status?.rules.minHoldUsd ?? 20;
  const stocks = status?.stocks ?? [];
  const price = (id: string) => {
    const p = stocks.find((s) => s.id === id)?.priceUsd ?? null;
    return p ? usd(p) : null;
  };
  const last = status?.lastSplit;
  return (
    <div className="wrap">
      <section className="hero">
        <div>
          <h1 className="sans" style={{ fontSize: 58, fontWeight: 300, lineHeight: 1.06, letterSpacing: -1 }}>
            get paid in
            <br />
            a token that
            <br />
            tracks openai.
          </h1>
          <p className="sans mu" style={{ fontSize: 17, lineHeight: 1.55, marginTop: 26, maxWidth: 480 }}>
            every wallet holding ${min} of {t} shares the creator fees every 10 minutes. take SOL, or let your share buy the OpenAI or Anthropic PreStocks token
            straight into your wallet.
          </p>
          <div className="mu" style={{ fontSize: 12, marginTop: 26 }}>
            pick it
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {["openai", "anthropic", "sol"].map((x) => (
              <Link key={x} href="/me" className="bd" style={{ padding: "7px 12px", fontSize: 12 }}>
                {x}
              </Link>
            ))}
          </div>
          <Link className="btn" href="/me" style={{ marginTop: 34, background: "var(--text)", color: "#111", borderColor: "var(--text)" }}>
            check my wallet
          </Link>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }} className="mu">
            <span>one share, every 10 minutes</span>
            <span>set by you</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <Arc />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", marginTop: -14, textAlign: "center" }}>
            {[
              ["SOL", "to your wallet", false, null],
              ["OpenAI", "PreStocks", true, price("openai")],
              ["Anthropic", "PreStocks", false, price("anthropic")],
            ].map(([a, b, on, px]) => (
              <div key={String(a)}>
                <div className="sans" style={{ fontSize: on ? "clamp(20px, 5.2vw, 40px)" : "clamp(18px, 4.6vw, 36px)", fontWeight: 300, color: on ? "var(--acc)" : "var(--text)" }}>
                  {a}
                </div>
                <div className="mu" style={{ fontSize: 12, marginTop: 8 }}>
                  {b}
                </div>
                {px && (
                  <div className="mu" style={{ fontSize: 11, marginTop: 4 }}>
                    {String(px)}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="mu" style={{ fontSize: 11, lineHeight: 1.6, marginTop: 26, textAlign: "center" }}>
            PreStocks tokens track a company&apos;s private valuation. they are issued by PreStocks, are not shares, and carry a transfer fee set by the issuer (1% today).
          </p>
        </div>
      </section>
      <section className="steps3">
        {[
          ["someone trades", `every ${t} trade pays pump.fun's creator fee.`],
          ["fees pool", "every 10 minutes the fees are claimed into one public treasury."],
          ["every 10 minutes", `wallets holding $${min} or more share it by what they held through the 10 minutes.`],
        ].map(([a, b], i) => (
          <div key={a}>
            <div className="mu" style={{ fontSize: 12 }}>
              {i + 1}
            </div>
            <div className="sans" style={{ fontSize: 17, marginTop: 10, fontWeight: 500 }}>
              {a}
            </div>
            <div className="sans mu" style={{ fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
              {b}
            </div>
          </div>
        ))}
      </section>
      <section className="recordrow">
        <Link href="/vault">the record</Link>
        <span className="mu">
          {last ? `last split ${ago(String(last.at))} · ${sol(last.allocated_lamports)} SOL to ${last.eligible_count} wallets` : "the first split lands here."}
        </span>
      </section>
      <style>{`
        .hero { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; padding: 70px 0 0; }
        .steps3 { margin: 60px 0 0; border-top: 1px solid var(--line); padding-top: 30px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
        .recordrow { margin: 40px 0 0; border-top: 1px solid var(--line); padding-top: 24px; display: flex; justify-content: space-between; gap: 16px; font-size: 13px; flex-wrap: wrap; }
        @media (max-width: 860px) { .hero { grid-template-columns: 1fr; padding: 40px 0 0; } .steps3 { grid-template-columns: 1fr; margin: 40px 0 0; gap: 22px; } .recordrow { margin: 30px 0 0; } h1 { font-size: 44px !important; } }
      `}</style>
    </div>
  );
}
