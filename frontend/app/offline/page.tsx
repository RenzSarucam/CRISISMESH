// This page is the service worker's offline fallback (see public/sw.js) --
// the one screen guaranteed to render with zero connectivity. It must not
// depend on the external Next.js stylesheet: that CSS file is content-hashed
// per build and was never precached (precaching every hashed asset by name
// would break on the next deploy), so if it can't be fetched while offline
// the page would render as unstyled HTML. Every style here is inline for
// that reason -- this file intentionally does not use Tailwind classes.
import Link from "next/link";

const styles = {
  page: {
    minHeight: "100svh",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    padding: "32px 24px",
    textAlign: "center" as const,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    backgroundColor: "#0f1226",
    color: "#eef0fb",
  },
  logoWrap: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "72px",
    height: "72px",
    borderRadius: "18px",
    backgroundColor: "#dc2626",
  },
  heading: {
    fontSize: "22px",
    fontWeight: 700,
    margin: 0,
  },
  body: {
    maxWidth: "360px",
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#9ba0c9",
    margin: 0,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap" as const,
    justifyContent: "center",
    gap: "10px",
    marginTop: "8px",
  },
  primaryLink: {
    display: "inline-block",
    padding: "10px 20px",
    borderRadius: "10px",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
  },
};

export default function OfflinePage() {
  return (
    <main style={styles.page}>
      <div style={styles.logoWrap}>
        <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
          <path
            d="M20 6 L31 10 V19 C31 26 26.5 31 20 33.5 C13.5 31 9 26 9 19 V10 Z"
            fill="#dc2626"
            stroke="#ffffff"
            strokeWidth="1.4"
          />
          <g stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round">
            <line x1="14.8" y1="24" x2="20" y2="15.2" />
            <line x1="25.2" y1="24" x2="20" y2="15.2" />
            <line x1="14.8" y1="24" x2="25.2" y2="24" />
          </g>
          <circle cx="20" cy="15.2" r="2.4" fill="#ffffff" />
          <circle cx="14.8" cy="24" r="2.4" fill="#ffffff" />
          <circle cx="25.2" cy="24" r="2.4" fill="#ffffff" />
        </svg>
      </div>

      <h1 style={styles.heading}>You&apos;re offline</h1>
      <p style={styles.body}>
        This page hasn&apos;t been saved on this device yet. Pages, reports, and SOS
        requests you&apos;ve already opened are still available offline.
      </p>

      <div style={styles.actions}>
        <Link href="/" style={styles.primaryLink}>
          Continue
        </Link>
      </div>
    </main>
  );
}
