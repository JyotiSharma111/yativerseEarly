// src/components/HeroCards.jsx
// 
// STRATEGY: No JS media query. Pure CSS show/hide.
// - Both <img> and <video> exist in the DOM always
// - CSS hides video on mobile, hides img on desktop
// - No re-render, no hydration flash, no TBT spike
// - <img> has fetchpriority="high" so it's always the LCP candidate
// - <video> has preload="none" so it never downloads on mobile
//   (display:none elements still get preload="none" respected by browser)

const U = "https://images.unsplash.com/";
function uSrc(id, w) { return `${U}${id}?auto=format&fit=crop&w=${w}&q=82`; }
function uSrcset(id, widths) { return widths.map((w) => `${uSrc(id, w)} ${w}w`).join(", "); }

const POSTER_SIZES = "(max-width: 768px) 33vw, 300px";

export default function HeroCards({ cards }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((c, i) => (
        <div
          key={i}
          className="relative rounded-2xl overflow-hidden border border-white/[0.08] group aspect-[3/4]"
          style={{ transform: i === 1 ? "translateY(-16px)" : "none" }}
        >
          {/* ── MOBILE: static image only ──────────────────────────
              Always rendered, always fetchpriority="high".
              Hidden on desktop via CSS (md:hidden).
              ~20KB download on slow 4G → fast LCP.           */}
          <img
            src={uSrc(c.posterId, 600)}
            srcSet={uSrcset(c.posterId, [300, 600])}
            sizes={POSTER_SIZES}
            alt={c.alt}
            fetchpriority="high"
            decoding="async"
            loading="eager"
            className="md:hidden absolute inset-0 w-full h-full object-cover z-10"
          />

          {/* ── DESKTOP: looping video ──────────────────────────────
              Hidden on mobile via CSS (hidden md:block).
              preload="none" = zero bytes fetched on mobile
              even though element exists in DOM.               */}
          <video
            src={c.src}
            poster={uSrc(c.posterId, 600)}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            className="hidden md:block absolute inset-0 w-full h-full object-cover z-10"
          />

          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 right-0 p-3 z-20"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}
          >
            <span className="text-[10px] font-body text-white/60 tracking-wide">
              {c.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}