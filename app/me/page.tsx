"use client";

import { ChoicePreview, PayoutHistory, PayoutSettings, SignInGate, Standing, useMe, type RouteOption } from "@/components/me";
import { useStatus } from "@/lib/status";

const useOptions = () => {
  const { status } = useStatus();
  const minStock = status?.minStockUsd ?? 10;

  const options: RouteOption[] = [
    { id: "sol", label: "SOL", detail: "sent straight from the treasury to the wallet that holds the coin.", needsDest: false, minLabel: "from 0.001 SOL" },
    {
      id: "openai",
      label: "OpenAI PreStocks",
      detail: "your share buys the OpenAI PreStocks token on Jupiter and it lands in the wallet that holds the coin.",
      needsDest: false,
      minLabel: `from about $${minStock}`,
    },
    {
      id: "anthropic",
      label: "Anthropic PreStocks",
      detail: "your share buys the Anthropic PreStocks token on Jupiter and it lands in the wallet that holds the coin.",
      needsDest: false,
      minLabel: `from about $${minStock}`,
    },
  ];
  return options;
};

const Inner = () => {
  const { me, reload } = useMe();
  const options = useOptions();
  return (
    <div className="grid2" style={{ paddingTop: 28 }}>
      <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
        <Standing me={me} />
        <PayoutSettings
          me={me}
          options={options}
          onSaved={() => void reload()}
          note={
            <>
              PreStocks tokens are issued by PreStocks and track the company&apos;s private valuation. they are not shares. the issuer sets a transfer fee (1%
              today) and can pause the token. your first PreStocks payout also opens a token account in your wallet, about 0.0017 SOL, paid from that payout. the
              swap uses up to 3% slippage.
            </>
          }
        />
      </div>
      <PayoutHistory me={me} labels={{ sol: "SOL", openai: "OpenAI PreStocks", anthropic: "Anthropic PreStocks" }} />
      <style>{`.grid2 { display: grid; grid-template-columns: 420px minmax(0, 1fr); gap: 14px; align-items: start; } @media (max-width: 900px) { .grid2 { grid-template-columns: 1fr; } }`}</style>
    </div>
  );
};

export default function MePage() {
  const options = useOptions();
  return (
    <div className="wrap">
      <SignInGate
        title="your payout"
        blurb="connect the wallet that holds the coin and sign a message. signing proves the wallet is yours and moves nothing. you can set your payout before launch."
        aside={<ChoicePreview head="what your share buys" rows={options.map((o) => ({ label: o.label, min: o.minLabel ?? "", detail: o.detail }))} />}
      >
        <Inner />
      </SignInGate>
    </div>
  );
}
