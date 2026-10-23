"use client";

import { Record } from "@/components/record";
import { useStatus } from "@/lib/status";
import { sol } from "@/lib/format";

const LABEL: Record<string, string> = { sol: "SOL", openai: "OpenAI PreStocks", anthropic: "Anthropic PreStocks" };

export default function Vault() {
  const { status } = useStatus();
  const t = status?.ticker ?? "$IPO";
  const min = status?.rules.minHoldUsd ?? 20;
  const share = status ? status.rules.holderShareBps / 100 : 100;
  return (
    <div className="wrap" style={{ paddingTop: 36 }}>
      <Record
        intro={
          <>
            <h1 style={{ fontSize: 30, fontWeight: 500 }}>the record</h1>
            <p className="mu" style={{ marginTop: 10, fontSize: 13, lineHeight: 1.7, maxWidth: 780 }}>
              every 10 minutes the creator fees from {t} trades are claimed into the treasury and {share}% of them, less the network fees the treasury paid,
              are split between wallets holding ${min} or more. every claim, split and payout is listed with its solscan link. SOL payouts start from{" "}
              {status ? sol(status.rules.minSolPayoutLamports) : "0.001"} SOL, PreStocks payouts from about ${status?.minStockUsd ?? 10}.
            </p>
          </>
        }
        routeLabel={(p) => LABEL[p.route ?? "sol"] ?? p.route ?? ""}
      />
    </div>
  );
}
