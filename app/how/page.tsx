"use client";

import { useStatus } from "@/lib/status";
import { sol } from "@/lib/format";

const Block = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <section className="panel" style={{ padding: 22 }}>
    <div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
      <span className="acc sans" style={{ fontSize: 34, fontWeight: 300, lineHeight: 1 }}>
        {n}
      </span>
      <h2 className="sans" style={{ fontSize: 22, fontWeight: 400 }}>{title}</h2>
    </div>
    <div className="mu prose" style={{ marginTop: 14, fontSize: 13, lineHeight: 1.8 }}>
      {children}
    </div>
  </section>
);

export default function How() {
  const { status } = useStatus();
  const t = status?.ticker ?? "$IPO";
  const min = status?.rules.minHoldUsd ?? 20;
  const share = status ? status.rules.holderShareBps / 100 : 100;
  const minSol = status ? sol(status.rules.minSolPayoutLamports) : "0.001";
  const minStock = status?.minStockUsd ?? 10;
  return (
    <div className="wrap" style={{ paddingTop: 36, display: "grid", gap: 14, maxWidth: 900 }}>
      <h1 style={{ fontSize: 30, fontWeight: 500 }}>how it works</h1>
      <p className="mu" style={{ fontSize: 13, lineHeight: 1.7 }}>
        every number on this page comes from the live server settings.
      </p>
      <Block n={1} title="where the money comes from">
        <p>
          every {t} trade on pump.fun pays a creator fee to the coin&apos;s deploy wallet. every 10 minutes our server claims it and moves the exact amount
          claimed into the treasury. both steps are on solscan and listed in the record.
        </p>
        <p>
          {share}% of what each claim brings in goes to holders. the claim&apos;s own network fee is taken before the amount is moved, and the network
          fees the treasury pays to move it and pay holders come out of the next split. every one is on solscan.
        </p>
      </Block>
      <Block n={2} title="who is in a split">
        <p>
          a wallet needs at least ${min} of {t}. it counts with the smaller of its last two balances, taken 10 minutes apart, so buying just before a split and
          selling just after earns nothing.
        </p>
        <p>pools, locks and other program accounts never count, and neither do our own wallets. shares are by how much each wallet held.</p>
      </Block>
      <Block n={3} title="how you get paid">
        <p>shares are recorded at every split and add up. a payout goes out once your total passes the minimum for your choice:</p>
        <p>
          SOL from {minSol} SOL. OpenAI or Anthropic PreStocks from about ${minStock}: your share buys the token on Jupiter and it is delivered straight into
          the wallet that holds the coin, in the same transaction. you set your choice by signing a message with that wallet, and you can change it at any time.
        </p>
      </Block>
      <Block n={4} title="what a PreStocks token is">
        <p>
          PreStocks tokens are issued by PreStocks on Solana and track a private company&apos;s valuation. they are not shares and do not give you ownership of
          OpenAI or Anthropic. we do not issue them and cannot promise any IPO or date.
        </p>
        <p>
          the issuer sets a transfer fee (1% today) and can pause or move the token. the swap uses up to 3% slippage. your first PreStocks payout opens a token
          account in your wallet, about 0.0017 SOL, paid from that payout. if a swap fails, the amount goes back onto what you are owed.
        </p>
      </Block>
      <Block n={5} title="what we do not promise">
        <p>
          we do not promise any price, volume or amount of fees. payouts depend on how much {t} trades. memecoins and PreStocks tokens can lose value, and you can lose what you put in. nothing here is financial advice.
        </p>
      </Block>
      <style>{`.prose p + p { margin-top: 10px; }`}</style>
    </div>
  );
}
