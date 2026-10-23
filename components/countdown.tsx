"use client";

import { useEffect, useState } from "react";

export const Countdown = ({ to }: { to: string | null | undefined }) => {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!to || now === null) return <>--:--</>;
  const left = Math.max(0, Math.floor((new Date(to).getTime() - now) / 1000));
  const m = String(Math.floor(left / 60)).padStart(2, "0");
  const s = String(left % 60).padStart(2, "0");
  return <>{`${m}:${s}`}</>;
};
