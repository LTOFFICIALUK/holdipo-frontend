"use client";

import { useState } from "react";

export const Copy = ({ text, label }: { text: string; label?: string }) => {
  const [done, setDone] = useState(false);
  return (
    <button
      className="btn sm"
      onClick={() => {
        void navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1200);
        });
      }}
    >
      {done ? "copied" : label ?? "copy"}
    </button>
  );
};
