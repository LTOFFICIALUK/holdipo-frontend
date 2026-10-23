"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "./mark";
import { WalletButton } from "./wallet-button";
import { useStatus } from "@/lib/status";

const LINKS = [
  { href: "/me", label: "my payout" },
  { href: "/vault", label: "the record" },
  { href: "/how", label: "how it works" },
];

export const Nav = () => {
  const path = usePathname();
  const { status } = useStatus();
  const buy = status?.mint ? `https://pump.fun/coin/${status.mint}` : null;
  return (
    <header style={{ borderBottom: "1px solid var(--line)" }}>
      <div style={{ display: "flex", alignItems: "center", paddingTop: 16, paddingBottom: 16, gap: 20, flexWrap: "wrap" }} className="wrap navrow">
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 17 }}>
          <Mark size={18} />
          holdipo
        </Link>
        <nav className="hide-sm" style={{ display: "flex", gap: 26, fontSize: 13, margin: "0 auto" }}>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} style={{ color: path === l.href ? "var(--text)" : "var(--muted)" }}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
          {buy ? (
            <a className="btn" style={{ background: "var(--text)", color: "#111", borderColor: "var(--text)" }} href={buy} target="_blank" rel="noreferrer">
              buy {status?.ticker ?? "$IPO"}
            </a>
          ) : (
            <span className="btn" style={{ background: "var(--text)", color: "#111", borderColor: "var(--text)", opacity: 0.7 }}>
              {status?.ticker ?? "$IPO"} soon
            </span>
          )}
          <WalletButton />
        </div>
      </div>
        <nav className="show-sm" style={{ gap: 18, padding: "10px 16px", borderTop: "1px solid var(--line)", fontSize: 12, overflowX: "auto" }}>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} style={{ color: path === l.href ? "var(--text)" : "var(--muted)", whiteSpace: "nowrap" }}>
              {l.label}
            </Link>
          ))}
        </nav>
      <style>{`@media (max-width: 760px) { .navrow { padding-top: 14px !important; padding-bottom: 14px !important; } }`}</style>
    </header>
  );
};
