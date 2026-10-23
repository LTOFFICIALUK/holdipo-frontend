"use client";

import Link from "next/link";
import { Copy } from "./copy";
import { Mark } from "./mark";
import { useStatus } from "@/lib/status";

const X = process.env.NEXT_PUBLIC_X_HANDLE || "holdipofun";

export const Footer = () => {
  const { status } = useStatus();
  const ca = status?.mint ?? null;
  return (
    <footer style={{ borderTop: "1px solid var(--line)", marginTop: 56 }}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 24px", flexWrap: "wrap", fontSize: 12 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Mark size={12} /> holdipo
        </span>
        <a href={`https://x.com/${X}`} target="_blank" rel="noreferrer" className="mu">
          x.com/{X}
        </a>
        <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span className="mu">CA</span>
          {ca ? (
            <>
              <code style={{ overflow: "hidden", textOverflow: "ellipsis", maxWidth: 360 }}>{ca}</code>
              <Copy text={ca} />
            </>
          ) : (
            <span className="mu">soon</span>
          )}
        </span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 16 }} className="mu">
          <Link href="/me">my payout</Link>
          <Link href="/vault">the record</Link>
          <Link href="/how">how it works</Link>
        </span>
      </div>
    </footer>
  );
};
