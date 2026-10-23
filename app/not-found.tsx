import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "not found" };

export default function NotFound() {
  return (
    <div className="wrap" style={{ paddingTop: 80, paddingBottom: 80, textAlign: "center" }}>
      <div style={{ fontSize: 40 }}>404</div>
      <p className="mu" style={{ marginTop: 12, fontSize: 13 }}>
        nothing lives at this address.
      </p>
      <Link className="btn" href="/" style={{ marginTop: 24 }}>
        back home
      </Link>
    </div>
  );
}
