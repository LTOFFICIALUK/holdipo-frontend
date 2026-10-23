export const Mark = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg viewBox="0.9 -1 98.2 77" width={(size * 98.2) / 77} height={size} style={{ display: "block", color }} aria-hidden>
    <polyline points="16,54 50,14 84,54" fill="none" stroke="currentColor" strokeWidth="20" strokeLinejoin="miter" strokeLinecap="square" />
    <circle cx="50" cy="68" r="7" fill="currentColor" />
  </svg>
);
