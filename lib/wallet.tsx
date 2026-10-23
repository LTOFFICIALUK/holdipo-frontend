"use client";

import { Transaction } from "@solana/web3.js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "./api";

type Kind = "phantom" | "solflare" | "backpack";

type Provider = {
  isPhantom?: boolean;
  isSolflare?: boolean;
  isBackpack?: boolean;
  publicKey?: { toString: () => string } | null;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey?: { toString: () => string } } | void>;
  disconnect?: () => Promise<void>;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
  signMessage?: (message: Uint8Array, display?: string) => Promise<{ signature: Uint8Array } | Uint8Array>;
  on?: (event: string, cb: (arg: unknown) => void) => void;
};

type Ctx = {
  address: string | null;
  token: string | null;
  connecting: boolean;
  pickerOpen: boolean;
  error: string | null;
  openPicker: () => void;
  closePicker: () => void;
  connect: (kind: Kind) => Promise<void>;
  disconnect: () => Promise<void>;
  signIn: () => Promise<string>;
  signMessage: (message: string) => Promise<string>;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
};

const WalletContext = createContext<Ctx | null>(null);
const ADDR = "app.wallet";
const KIND = "app.wallet.kind";
const TOKEN = "app.session";

const store = {
  get: (k: string) => {
    try {
      return window.localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string | null) => {
    try {
      if (v === null) window.localStorage.removeItem(k);
      else window.localStorage.setItem(k, v);
    } catch {
      // Private mode: the session lasts until the tab closes.
    }
  },
};

const providerFor = (kind: Kind | null): Provider | null => {
  const w = window as unknown as { phantom?: { solana?: Provider }; solflare?: Provider; backpack?: Provider; solana?: Provider };
  if (kind === "solflare") return w.solflare ?? null;
  if (kind === "backpack") return w.backpack ?? null;
  return w.phantom?.solana ?? (w.solana?.isPhantom ? w.solana : null);
};

export const WALLETS: { kind: Kind; name: string; url: string }[] = [
  { kind: "phantom", name: "Phantom", url: "https://phantom.com/download" },
  { kind: "solflare", name: "Solflare", url: "https://solflare.com/download" },
  { kind: "backpack", name: "Backpack", url: "https://backpack.app/download" },
];

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const a = store.get(ADDR);
    const t = store.get(TOKEN);
    if (a) setAddress(a);
    if (a && t && t.startsWith(a + ":")) setToken(t.slice(a.length + 1));
    const expired = () => {
      store.set(TOKEN, null);
      setToken(null);
    };
    window.addEventListener("session-expired", expired);
    return () => window.removeEventListener("session-expired", expired);
  }, []);

  const provider = useCallback(() => {
    const p = providerFor(store.get(KIND) as Kind | null);
    if (!p) throw new Error("Open this page in a browser with your wallet installed.");
    return p;
  }, []);

  const connect = useCallback(async (kind: Kind) => {
    setError(null);
    const p = providerFor(kind);
    if (!p) {
      setError(`${WALLETS.find((w) => w.kind === kind)?.name} is not installed in this browser.`);
      return;
    }
    setConnecting(true);
    try {
      const res = await p.connect();
      const next = res?.publicKey?.toString() || p.publicKey?.toString();
      if (!next) throw new Error("The wallet did not share an address.");
      store.set(KIND, kind);
      store.set(ADDR, next);
      if (next !== address) {
        store.set(TOKEN, null);
        setToken(null);
      }
      setAddress(next);
      setPickerOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect.");
    } finally {
      setConnecting(false);
    }
  }, [address]);

  const disconnect = useCallback(async () => {
    if (token) await api("/api/auth/signout", { method: "POST", token }).catch(() => undefined);
    try {
      await providerFor(store.get(KIND) as Kind | null)?.disconnect?.();
    } catch {
      // The local session ends either way.
    }
    store.set(ADDR, null);
    store.set(TOKEN, null);
    setAddress(null);
    setToken(null);
  }, [token]);

  const ready = useCallback(async () => {
    const p = provider();
    if (!p.publicKey) {
      try {
        await p.connect({ onlyIfTrusted: true });
      } catch {
        await p.connect();
      }
    }
    const active = p.publicKey?.toString();
    if (address && active && active !== address) {
      throw new Error("Your wallet switched accounts. Reconnect with the account shown here.");
    }
    return p;
  }, [provider, address]);

  const signMessage = useCallback(async (message: string) => {
    const p = await ready();
    if (!p.signMessage) throw new Error("This wallet cannot sign messages.");
    const out = await p.signMessage(new TextEncoder().encode(message), "utf8");
    const bytes = out instanceof Uint8Array ? out : out.signature;
    let s = "";
    for (const b of bytes) s += String.fromCharCode(b);
    return btoa(s);
  }, [ready]);

  const signIn = useCallback(async () => {
    if (!address) throw new Error("Connect a wallet first.");
    if (token) return token;
    const n = await api<{ nonce: string; message: string }>("/api/auth/nonce", { method: "POST", body: { wallet: address } });
    const signature = await signMessage(n.message);
    const v = await api<{ token: string }>("/api/auth/verify", { method: "POST", body: { wallet: address, nonce: n.nonce, signature } });
    store.set(TOKEN, `${address}:${v.token}`);
    setToken(v.token);
    return v.token;
  }, [address, token, signMessage]);

  const signTransaction = useCallback(async (tx: Transaction) => (await ready()).signTransaction(tx), [ready]);

  const value = useMemo(
    () => ({
      address,
      token,
      connecting,
      pickerOpen,
      error,
      openPicker: () => setPickerOpen(true),
      closePicker: () => setPickerOpen(false),
      connect,
      disconnect,
      signIn,
      signMessage,
      signTransaction,
    }),
    [address, token, connecting, pickerOpen, error, connect, disconnect, signIn, signMessage, signTransaction],
  );
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("WalletProvider missing");
  return ctx;
};
