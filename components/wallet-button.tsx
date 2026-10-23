"use client";

import { short } from "@/lib/format";
import { useWallet, WALLETS } from "@/lib/wallet";

export const WalletButton = () => {
  const w = useWallet();
  if (w.address) {
    return (
      <button className="btn" onClick={() => void w.disconnect()} title="Disconnect">
        {short(w.address)}
      </button>
    );
  }
  return (
    <button className="btn" onClick={w.openPicker}>
      wallet
    </button>
  );
};

export const WalletPicker = () => {
  const w = useWallet();
  if (!w.pickerOpen) return null;
  return (
    <div className="modal-back" onClick={w.closePicker}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="panel-head">
          <b>connect a wallet</b>
          <button className="btn sm" onClick={w.closePicker}>
            close
          </button>
        </div>
        <div style={{ padding: 14, display: "grid", gap: 8 }}>
          {WALLETS.map((x) => (
            <button key={x.kind} className="btn" style={{ justifyContent: "space-between" }} disabled={w.connecting} onClick={() => void w.connect(x.kind)}>
              <span>{x.name}</span>
              <span className="mu">→</span>
            </button>
          ))}
          {w.error && <div className="err">{w.error}</div>}
          {w.error && typeof window !== "undefined" && (
            <div className="mu" style={{ fontSize: 11, lineHeight: 1.6 }}>
              on a phone, open this page inside your wallet app:{" "}
              <a style={{ textDecoration: "underline" }} href={`https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}?ref=${encodeURIComponent(window.location.origin)}`}>
                Phantom
              </a>{" "}
              ·{" "}
              <a style={{ textDecoration: "underline" }} href={`https://solflare.com/ul/v1/browse/${encodeURIComponent(window.location.href)}?ref=${encodeURIComponent(window.location.origin)}`}>
                Solflare
              </a>
            </div>
          )}
          <div className="mu" style={{ fontSize: 11, lineHeight: 1.6 }}>
            Connecting only shares your address. You sign a message to prove the wallet is yours. Nothing moves without your approval.
          </div>
        </div>
      </div>
    </div>
  );
};
