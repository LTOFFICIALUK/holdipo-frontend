import type { Metadata } from "next";

export const metadata: Metadata = { title: "my payout" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
