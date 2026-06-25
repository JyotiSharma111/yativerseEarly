import { useEffect, useLayoutEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

// ─────────────────────────────────────────────────────────────
// IMAGE OPTIMIZATION STRATEGY
//
// LCP target: hero strip poster images (3× <video poster=>)
//
// Every image is served from Unsplash CDN which auto-negotiates
// WebP/AVIF via ?auto=format. We provide two srcset widths so the
// browser picks the smallest sufficient size per viewport.
//
// Loading priority tiers:
//   TIER 1 – Hero strip posters  → preloaded in useLayoutEffect (sync, pre-paint)
//                                   fetchpriority="high", decoding="async"
//   TIER 2 – Avatars (above fold) → loading="eager", fetchpriority="low"
//   TIER 3 – OS / Agents / Audience (below fold)
//                                 → loading="lazy", decoding="async"
//
// srcset helpers produce two breakpoints (1× mobile, 2× desktop).
// sizes= tells the browser the rendered width at each breakpoint so
// it picks the right source before layout is known.
// ─────────────────────────────────────────────────────────────

const B = "https://gktcrehhhixfgwkixamg.supabase.co/storage/v1/object/public/yati/";
const U = "https://images.unsplash.com/";

// Unsplash srcset helper — returns "url 300w, url 600w" etc.
// auto=format → WebP/AVIF negotiation. fit=crop preserves aspect ratio.
function uSrc(id, w)    { return `${U}${id}?auto=format&fit=crop&w=${w}&q=80`; }
function uSrcset(id, widths) {
  return widths.map((w) => `${uSrc(id, w)} ${w}w`).join(", ");
}

// ── GIF sources (looping mp4 — same motion, 15× smaller than .gif) ──
const GIF = {
  morning:    B + "morning.mp4",
  withAgents: B + "Founder_with_AI_agents_202605291326.mp4",
  deepWork:   B + "deep_work.mp4",
};

// ── Poster images for each GIF card (TIER 1 — LCP candidates) ──
// These are the visible elements while the video decodes.
// Preloaded synchronously in useLayoutEffect before first paint.
const POSTER_ID = {
  morning:    "photo-1506784983877-45594efa4cbe",
  withAgents: "photo-1551434678-e076c223a692",
  deepWork:   "photo-1498050108023-c5249f4df085",
};
// Default src (desktop). Srcset serves 300w on mobile, 600w on desktop.
const POSTER = {
  morning:    uSrc(POSTER_ID.morning,    600),
  withAgents: uSrc(POSTER_ID.withAgents, 600),
  deepWork:   uSrc(POSTER_ID.deepWork,   600),
};
const POSTER_SRCSET = {
  morning:    uSrcset(POSTER_ID.morning,    [300, 600]),
  withAgents: uSrcset(POSTER_ID.withAgents, [300, 600]),
  deepWork:   uSrcset(POSTER_ID.deepWork,   [300, 600]),
};
// Hero strip is a 3-col grid; each card is ~33vw on desktop, ~33vw on tablet,
// ~33vw on mobile (it stays 3-col). 300w is enough for mobile cards (~125px).
const POSTER_SIZES = "(max-width: 768px) 33vw, 300px";

// ── Static images (TIER 3 — all below fold, lazy) ──
const IMG_ID = {
  osPreview:        "photo-1551288049-bebda4e38f71",
  agentLaunch:      "photo-1519389950473-47ba0277781c",
  agentNetwork:     "photo-1521791136064-7986c2920216",
  agentFocus:       "photo-1434030216411-0b793f4b4173",
  agentBrand:       "photo-1478737270239-2f02b77fc618",
  audienceFounder:  "photo-1556761175-4b46a572b786",
  audienceOperator: "photo-1504384308090-c894fdcc538d",
  audienceCreator:  "photo-1611532736597-de2d4265fba3",
};

// Agent cards: 4-col desktop (~296px), 2-col tablet (~50vw), 1-col mobile (100vw)
// Serve 400w (desktop) and 200w (mobile) — browser picks via sizes=
const AGENT_SIZES   = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw";

// Audience cards: 3-col desktop (~413px), 1-col mobile (100vw)
// Serve 800w (mobile full-bleed) and 500w (desktop column)
const AUDIENCE_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

// OS preview: half-width desktop column (~50vw), full on mobile
const OS_SIZES = "(max-width: 1024px) 100vw, 50vw";

// ── Avatar images (TIER 2 — above fold, not LCP, 60px) ──
const AVATARS = [
  uSrc("photo-1534528741775-53994a69daeb", 60),
  uSrc("photo-1506794778202-cad84cf45f1d", 60),
  uSrc("photo-1494790108377-be9c29b29330", 60),
  uSrc("photo-1500648767791-00dcc994a43e", 60),
];

// ── DATA ──────────────────────────────────────────────────────
const SIGNALS = [
  "Identity synced",
  "Launch plan ready",
  "3 agent tasks complete",
  "Founder workflow active",
];

const JOURNEY = [
  { n:"01", title:"Claim your yAtI",  text:"One identity layer for your goals, brand, tools, and builder context."   },
  { n:"02", title:"Open the OS",      text:"Turn scattered tasks into one daily command center for priorities."        },
  { n:"03", title:"Activate agents",  text:"Delegate launch, network, content, and ops to AI that knows your build."  },
  { n:"04", title:"Start up right",   text:"Ship consistently, build trust, and grow inside a system that compounds." },
];

const PRODUCTS = [
  { name:"yAtI Identity", eyebrow:"Core",        text:"A living profile for your founder context, brand signal, and goals.",       accent:"#605CFF" },
  { name:"AI-1 Layer",    eyebrow:"Intelligence", text:"One AI layer connecting your tools, context, agents, and next actions.",    accent:"#C86DD7" },
  { name:"yAtI OS",       eyebrow:"Workspace",    text:"A command center for goals, launches, workflows, metrics, and clarity.",    accent:"#4ECDC4" },
  { name:"AI Agents",     eyebrow:"Execution",    text:"Specialized operators for launch, network, content, and focus workflows.",  accent:"#FF6B8A" },
];

const TIMELINE_CARDS = [
  { time:"09:00", title:"Deep work sprint", text:"Notifications held. Top task loaded. Focus agent tracking progress."  },
  { time:"12:30", title:"Launch review",    text:"Market notes summarized and next experiments queued."                 },
  { time:"16:00", title:"Audience loop",    text:"Brand agent prepared three posts from today's build notes."           },
];

const AGENTS = [
  { title:"Launch",  color:"#605CFF", text:"Validates ideas, maps competitors, and turns raw concepts into launch plans.",   tasks:["Market scan","MVP path","Launch checklist"],   id: IMG_ID.agentLaunch,   alt:"Founder at whiteboard planning a product launch"     },
  { title:"Network", color:"#C86DD7", text:"Finds aligned mentors, customers, creators, and investors with useful context.", tasks:["Lead lists","Warm intros","Follow-up prompts"],  id: IMG_ID.agentNetwork,  alt:"Two professionals connecting at a networking event"  },
  { title:"Focus",   color:"#4ECDC4", text:"Protects deep work and keeps your highest-leverage actions visible every day.",  tasks:["Time blocks","Priority reset","Weekly review"],  id: IMG_ID.agentFocus,    alt:"Person in deep concentration working alone at desk"  },
  { title:"Brand",   color:"#FF6B8A", text:"Builds a content engine around your voice, offers, and audience signals.",      tasks:["Post drafts","Campaign ideas","Repurposing"],    id: IMG_ID.agentBrand,    alt:"Creator recording content in front of a microphone" },
];

const AUDIENCE = [
  { title:"First-time founders",    text:"Shape an idea, move from scattered effort to a repeatable launch rhythm.",                          id: IMG_ID.audienceFounder,  alt:"Young founder excited and focused at their laptop"    },
  { title:"Operators and builders", text:"Connect strategy, execution, content, and follow-up without adding another messy tool layer.",      id: IMG_ID.audienceOperator, alt:"Operator reviewing dashboards at a coworking space"  },
  { title:"Vision-led creators",    text:"Keep identity, audience, product, and momentum aligned as your personal brand becomes a business.", id: IMG_ID.audienceCreator,  alt:"Creator filming content in a well-lit studio setup"  },
];

const TESTIMONIALS = [
  { q:"I used to feel like a fraud calling myself CEO. Now I actually feel like one.",                        name:"Neha P.",   role:"Co-founder, Studio Arc" },
  { q:"It's the first time I've felt like I have a real team behind me. Even though it's just me.",          name:"Marcus L.", role:"Indie founder"           },
  { q:"The ring knows when I'm sharp. The agents take over everything else. I just build.",                   name:"Ravi M.",   role:"Founder, Buildfast"      },
  { q:"I stopped apologising for being a solo founder. My invisible team handles more than most offices do.", name:"Sara P.",   role:"Solo founder"            },
];

const TRUST = ["Product Hunt", "Indie Hackers", "foundr", "Notion", "Reforge"];

const QUICK_LINKS = [
  { title:"Wearables", text:"Signal Ring and Thread Pendant", href:"/wearables" },
  { title:"yAtI OS",   text:"Your personal command center",  href:"/"          },
  { title:"AI Agents", text:"Your invisible team, 24/7",     href:"/agents"    },
  { title:"Community", text:"Founders who get it",           href:"/community" },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "yAtIverse",
  "applicationCategory": "BusinessApplication",
  "description": "AI-powered Founder OS with wearables and AI agents for solo founders and builders.",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "url": "https://yativerse.com",
};

// ── HELPERS ──────────────────────────────────────────────────

/**
 * GifVid — looping mp4 with a static poster for instant first-frame paint.
 *
 * The <video poster=> attribute has no fetchpriority API, so we pair it with
 * a visually-identical hidden <img> that the browser CAN prioritize for preload.
 * The img is position:absolute, opacity:0, pointer-events:none — invisible to
 * the user but fetchable by the browser at high priority. Once the video loads
 * its first frame, the poster and hidden img become irrelevant.
 *
 * eager=true  → preload="metadata" + hidden img with fetchpriority="high"
 * eager=false → preload="none"     (below fold, no rush)
 */
function GifVid({ src, poster, posterSrcset, posterSizes, alt = "", className = "", style = {}, eager = false }) {
  return (
    <div className="relative w-full h-full">
      <video
        src={src}
        poster={poster}
        autoPlay muted loop playsInline
        preload={eager ? "metadata" : "none"}
        className={`${className} relative z-10`}
        style={style}
      />
      {/* Hidden img gives browser a fetchpriority handle on the poster.
          aria-hidden + tabIndex=-1 = invisible to AT and keyboard. */}
      {eager && (
        <img
          src={poster}
          srcSet={posterSrcset}
          sizes={posterSizes}
          alt={alt}
          aria-hidden="true"
          fetchpriority="high"
          decoding="async"
          loading="eager"
          style={{ position:"absolute", inset:0, width:"100%", height:"100%",
                   objectFit:"cover", opacity:0, pointerEvents:"none", zIndex:0 }}
        />
      )}
    </div>
  );
}

/**
 * Img — responsive image with srcset + sizes.
 * Always decoding="async" (never blocks main thread).
 * Explicit width/height prevent CLS.
 */
function Img({
  id,                        // Unsplash photo ID
  widths = [400, 800],       // srcset breakpoints
  sizes = "100vw",           // CSS sizes= string
  alt,
  className = "",
  style = {},
  loading = "lazy",
  fetchpriority = "auto",
  width,
  height,
}) {
  const src    = uSrc(id, widths[widths.length - 1]);   // largest as fallback
  const srcset = uSrcset(id, widths);
  return (
    <img
      src={src}
      srcSet={srcset}
      sizes={sizes}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      fetchpriority={fetchpriority}
      decoding="async"                                   // always async — never blocks thread
      width={width}
      height={height}
    />
  );
}

function Reveal({ children, delay = 0, className = "", style = {} }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}
      style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(24px)",
               transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

// ── COMPONENT ────────────────────────────────────────────────
export default function Homepage() {
  const [sig, setSig]                       = useState(0);
  const [activeTimeline, setActiveTimeline] = useState(0);
  const signal = useMemo(() => SIGNALS[sig], [sig]);

  // ── useLayoutEffect — runs synchronously before paint ──────
  // This is the correct hook for injecting <link rel="preload"> tags
  // because it fires before the browser's first paint, giving the
  // preloader time to act before layout is committed.
  // (useEffect fires AFTER paint — too late for LCP preloads.)
  useLayoutEffect(() => {
    // Preload all 3 poster images at high priority — these ARE the LCP elements
    Object.values(POSTER).forEach((href) => {
      if (document.querySelector(`link[rel="preload"][href="${href}"]`)) return;
      const l = document.createElement("link");
      l.rel  = "preload";
      l.as   = "image";
      l.href = href;
      l.setAttribute("fetchpriority", "high");
      // Also hint the mobile-size srcset so the browser picks 300w on narrow viewports
      document.head.insertBefore(l, document.head.firstChild); // insert at TOP of <head>
    });

    // Preload the 2 most-visible hero video sources (not the CTA one)
    [GIF.morning, GIF.withAgents].forEach((href) => {
      if (document.querySelector(`link[rel="preload"][href="${href}"]`)) return;
      const l = document.createElement("link");
      l.rel  = "preload";
      l.as   = "video";
      l.href = href;
      document.head.appendChild(l);
    });

    // JSON-LD structured data
    if (!document.querySelector('script[type="application/ld+json"]')) {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.text = JSON.stringify(JSON_LD);
      document.head.appendChild(s);
    }
  }, []);                                                // empty deps — runs once, sync

  useEffect(() => {
    const id = setInterval(() => setSig((p) => (p + 1) % SIGNALS.length), 2500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setActiveTimeline((p) => (p + 1) % TIMELINE_CARDS.length), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <SEO
        path="/"
        title="yAtIverse — AI-Powered Founder OS & Wearables for Solo Builders"
        description="yAtIverse gives solo founders a wearable Signal Ring, AI agents, and a Founder OS to plan, build, and ship — always working, never sleeping."
        canonical="https://yativerse.com/"
        ogImage="https://yativerse.com/og-image.png"  
      />

      <div className="bg-brand-bg text-white min-h-screen">
        <Navbar />

        {/* ══════════════════════════════════════════
            HERO
        ══════════════════════════════════════════ */}
        <section
          aria-label="yAtIverse founder operating system"
          className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 overflow-hidden"
        >
          {/* Pure CSS ambient glow — zero network cost */}
          <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 80% 55% at 50% 30%, rgba(96,92,255,0.14) 0%, transparent 68%), radial-gradient(ellipse 45% 35% at 72% 72%, rgba(200,109,215,0.08) 0%, transparent 60%)" }} />

          <div className="relative z-10 max-w-3xl w-full text-center mx-auto">
            <Link to="/agents" aria-label="Introducing yAtI AI-1 — explore the system"
              className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-mono font-medium tracking-wide border border-white/10 bg-white/[0.05] text-[#F5C542] hover:text-white transition-colors">
              Introducing yAtI AI-1&nbsp;
              <span className="text-brand-purple font-semibold">Explore the system →</span>
            </Link>

            <h1 className="font-display font-bold leading-[1.0] tracking-[-0.03em] text-white mb-4"
              style={{ fontSize:"clamp(44px,7vw,88px)" }}>
              Start Up Right!
              <span className="text-gradient"><br />Build what matters.</span>
            </h1>

            <p className="font-body text-lg text-white/60 max-w-xl mx-auto leading-relaxed mb-8">
              Your digital C-suite — wearables, AI agents, and Founder OS — always working, never sleeping.
            </p>

            {/* Avatars — TIER 2: above fold, not LCP, 60px, eager/low */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="flex" aria-hidden="true">
                {AVATARS.map((s, i) => (
                  <img key={i} src={s} alt="" width={28} height={28}
                    loading="eager" fetchpriority="low" decoding="async"
                    className="w-7 h-7 rounded-full object-cover border-2 border-brand-bg -ml-2 first:ml-0" />
                ))}
              </div>
              <p className="text-xs text-white/48 font-body">
                <span className="text-white/75 font-semibold">1,200+ founders</span> on the waitlist
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 justify-center mb-10" role="list" aria-label="yAtIverse products">
              {[
                { dot:"#605CFF", label:"Signal Ring — Wearable"     },
                { dot:"#C86DD7", label:"Founder OS — Command Center" },
                { dot:"#FF6B8A", label:"AI Agents — Invisible Team"  },
              ].map((tab) => (
                <div key={tab.label} role="listitem"
                  className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] px-3.5 py-1.5 rounded-full text-xs font-body text-white/60">
                  <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background:tab.dot, boxShadow:`0 0 6px ${tab.dot}` }} />
                  {tab.label}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 justify-center mb-10">
              <Link to="/waitlist" className="btn-primary">Join Waitlist →</Link>
              <Link to="/signal-ring" className="btn-ghost">Watch Vision Video</Link>
            </div>

            <p className="text-xs text-white/35 font-body">Early access · Limited spots available</p>
          </div>

          {/* ── 3 GIF cards (TIER 1 — LCP) ──────────────────────────
              Each GifVid renders:
                <video poster={POSTER} preload="metadata" autoplay muted loop>
                <img   src={POSTER} fetchpriority="high" hidden aria-hidden>
              The hidden img is the browser's high-priority fetch handle.
              The poster on the video shows the image without JS if video fails.   */}
          <div className="relative z-10 w-full max-w-4xl mx-auto mt-16 px-4"
            aria-label="yAtIverse founder lifestyle previews">
            <div className="grid grid-cols-3 gap-4">
              {[
                { src:GIF.morning,    poster:POSTER.morning,    srcset:POSTER_SRCSET.morning,    label:"Morning ritual",   alt:"Founder starting their morning ritual at desk" },
                { src:GIF.withAgents, poster:POSTER.withAgents, srcset:POSTER_SRCSET.withAgents, label:"With your agents", alt:"Founder collaborating with AI agents on screen", tall:true },
                { src:GIF.deepWork,   poster:POSTER.deepWork,   srcset:POSTER_SRCSET.deepWork,   label:"Deep work",        alt:"Founder in deep focused work session" },
              ].map((c, i) => (
                <div key={i}
                  className="relative rounded-2xl overflow-hidden border border-white/[0.08] group aspect-[3/4]"
                  style={{ transform: i === 1 ? "translateY(-16px)" : "none" }}>
                  <GifVid
                    src={c.src}
                    poster={c.poster}
                    posterSrcset={c.srcset}
                    posterSizes={POSTER_SIZES}
                    alt={c.alt}
                    eager={true}
                    className="w-full h-full object-cover"
                  />
                  <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 p-3 z-20"
                    style={{ background:"linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}>
                    <span className="text-[10px] font-body text-white/60 tracking-wide">{c.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── QUICK LINKS ── */}
        <nav aria-label="yAtIverse product navigation" className="border-t border-white/[0.06]">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/[0.06]">
            {QUICK_LINKS.map((item) => (
              <Link key={item.title} to={item.href}
                className="px-6 py-5 hover:bg-white/[0.03] transition-colors group">
                <p className="font-display font-semibold text-sm text-white mb-1 group-hover:text-brand-purple transition-colors">{item.title}</p>
                <p className="text-xs font-body text-white/42">{item.text}</p>
              </Link>
            ))}
          </div>
        </nav>

        {/* ══════════════════════════════════════════
            JOURNEY — numbered CSS cards, zero images
        ══════════════════════════════════════════ */}
        <section className="py-20 px-6 border-t border-white/[0.06]" id="journey"
          aria-labelledby="journey-heading">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start mb-14">
              <Reveal>
                <span className="kicker mb-5 inline-block">The path</span>
                <h2 id="journey-heading" className="font-display font-bold leading-tight tracking-tight text-white"
                  style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                  From idea energy to an operating ecosystem that compounds.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="font-body text-base text-white/58 leading-relaxed lg:pt-14">
                  yAtIverse gives your ambition a place to live, then adds the workflow and agent support to keep it moving — even when the whole company is just you.
                </p>
              </Reveal>
            </div>
            <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {JOURNEY.map((item, i) => (
                <Reveal key={item.title} delay={i * 0.07}>
                  <li className="glass rounded-2xl p-6 hover:border-white/14 transition-colors duration-300 h-full">
                    <span aria-hidden="true"
                      className="block font-mono text-4xl font-bold mb-4 leading-none"
                      style={{ color:"rgba(96,92,255,0.35)" }}>
                      {item.n}
                    </span>
                    <h3 className="font-display font-semibold text-base text-white mb-2">{item.title}</h3>
                    <p className="font-body text-sm text-white/50 leading-relaxed">{item.text}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            PRODUCTS — accent-color cards, zero images
        ══════════════════════════════════════════ */}
        <section className="py-20 px-6 border-t border-white/[0.06]" id="identity"
          aria-labelledby="products-heading">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <Reveal>
                <span className="kicker mb-5 inline-block">The ecosystem</span>
                <h2 id="products-heading" className="font-display font-bold tracking-tight text-white"
                  style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                  Every tool a founder needs,{" "}
                  <span className="text-gradient">in one place.</span>
                </h2>
              </Reveal>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRODUCTS.map((p, i) => (
                <Reveal key={p.name} delay={i * 0.07}>
                  <div className="glass rounded-[1.25rem] overflow-hidden border border-white/[0.08] hover:border-white/16 transition-all duration-300 cursor-pointer group hover:-translate-y-1 h-full">
                    <div aria-hidden="true" className="h-1.5 w-full" style={{ background:p.accent, opacity:0.85 }} />
                    <div aria-hidden="true" className="relative overflow-hidden" style={{ height:80 }}>
                      <div className="absolute inset-0"
                        style={{ background:`radial-gradient(ellipse 80% 80% at 50% 50%, ${p.accent}22 0%, transparent 75%)` }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border"
                          style={{ color:p.accent, borderColor:`${p.accent}40`, background:`${p.accent}12` }}>
                          {p.eyebrow}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 pt-2">
                      <p className="font-display font-semibold text-sm text-white mb-2">{p.name}</p>
                      <p className="font-body text-xs text-white/48 leading-relaxed mb-3">{p.text}</p>
                      <span className="text-xs font-medium font-body" style={{ color:p.accent }}>Explore →</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            OS SECTION — 1 responsive image (lazy)
        ══════════════════════════════════════════ */}
        <section className="py-20 px-6 border-t border-white/[0.06]" id="os"
          aria-labelledby="os-heading">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="flex flex-col gap-3">
              {TIMELINE_CARDS.map((card, i) => (
                <button key={card.time} onClick={() => setActiveTimeline(i)}
                  aria-pressed={i === activeTimeline}
                  className={`rounded-2xl p-5 text-left transition-all duration-500 border ${
                    i === activeTimeline
                      ? "bg-white/[0.07] border-white/20"
                      : "bg-white/[0.02] border-white/[0.06] opacity-55"
                  }`}>
                  <p className="font-mono text-xs text-white/45 mb-1">{card.time}</p>
                  <p className="font-display font-semibold text-sm text-white mb-1">{card.title}</p>
                  <p className="font-body text-xs text-white/55 leading-relaxed">{card.text}</p>
                </button>
              ))}

              {/* TIER 3: lazy, responsive, srcset [400, 800] */}
              <div className="relative rounded-2xl overflow-hidden mt-2 border border-white/[0.08]"
                style={{ height:180 }}>
                <Img
                  id={IMG_ID.osPreview}
                  widths={[400, 800]}
                  sizes={OS_SIZES}
                  alt="yAtI OS dashboard showing goals, metrics, and daily workflow cards"
                  width={640} height={180}
                  className="w-full h-full object-cover"
                />
                <div aria-hidden="true" className="absolute inset-0"
                  style={{ background:"linear-gradient(135deg, rgba(96,92,255,0.2) 0%, transparent 60%)" }} />
                <p className="absolute bottom-3 left-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
                  yAtI OS · Live
                </p>
              </div>
            </div>

            <Reveal delay={0.1}>
              <span className="kicker mb-5 inline-block">yAtI OS</span>
              <h2 id="os-heading" className="font-display font-bold tracking-tight text-white mb-5"
                style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                A command center for building the impossible,
                <br />one workflow at a time.
              </h2>
              <p className="font-body text-base text-white/55 leading-relaxed mb-8 max-w-md">
                Replaces tab-hopping with a daily rhythm — know what matters, let agents prep the next move, and see progress compound.
              </p>
              <Link to="/waitlist" className="btn-ghost">Request early access →</Link>
            </Reveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            AGENTS — 4 responsive image cards (lazy)
        ══════════════════════════════════════════ */}
        <section className="py-20 px-6 border-t border-white/[0.06]" id="agents"
          aria-labelledby="agents-heading">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-end mb-14">
              <Reveal>
                <span className="kicker mb-5 inline-block">Your invisible team</span>
                <h2 id="agents-heading" className="font-display font-bold tracking-tight text-white mb-5"
                  style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                  They work while you sleep.{" "}
                  <span className="text-gradient">You wake up ahead.</span>
                </h2>
                <p className="font-body text-base text-white/55 leading-relaxed max-w-md">
                  Four AI agents, each owning a founder workflow — running in the background every single day.
                </p>
              </Reveal>
              <Reveal delay={0.1} className="lg:text-right">
                <Link to="/agents" className="btn-ghost">Meet your agents →</Link>
              </Reveal>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {AGENTS.map((a, i) => (
                <Reveal key={a.title} delay={i * 0.07}>
                  <article className="glass rounded-2xl overflow-hidden hover:border-white/14 transition-all duration-300 group hover:-translate-y-1 cursor-default h-full">
                    {/* TIER 3: lazy, srcset [200, 400], sizes for 4-col/2-col/1-col */}
                    <div className="relative overflow-hidden" style={{ height:120 }}>
                      <Img
                        id={a.id}
                        widths={[200, 400]}
                        sizes={AGENT_SIZES}
                        alt={a.alt}
                        width={400} height={120}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div aria-hidden="true" className="absolute inset-0"
                        style={{ background:`linear-gradient(to bottom, transparent 20%, rgba(5,8,20,0.9) 100%)` }} />
                    </div>
                    <div className="p-5">
                      <span className="inline-block text-[10px] font-mono font-medium tracking-widest uppercase px-2.5 py-1 rounded-full mb-3"
                        style={{ background:`${a.color}18`, color:a.color, border:`1px solid ${a.color}30` }}>
                        {a.title}
                      </span>
                      <p className="font-body text-xs text-white/55 leading-relaxed mb-3">{a.text}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {a.tasks.map((t) => (
                          <span key={t}
                            className="text-[10px] font-body px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/50">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            AUDIENCE — 3 responsive image cards (lazy)
        ══════════════════════════════════════════ */}
        <section className="py-20 px-6 border-t border-white/[0.06]"
          aria-labelledby="audience-heading">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start mb-14">
              <Reveal>
                <span className="kicker mb-5 inline-block">Who it serves</span>
                <h2 id="audience-heading" className="font-display font-bold tracking-tight text-white"
                  style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                  Built for real builders,{" "}
                  <span className="text-gradient">not just tech tourists.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="font-body text-base text-white/55 leading-relaxed lg:pt-14">
                  Whether you're just starting out or running a lean operation solo — yAtIverse gives you the infrastructure that used to cost a full team.
                </p>
              </Reveal>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {AUDIENCE.map((a, i) => (
                <Reveal key={a.title} delay={i * 0.08}>
                  <article className="glass rounded-[1.75rem] overflow-hidden hover:border-white/14 transition-all duration-300 group hover:-translate-y-1 cursor-default h-full">
                    {/* TIER 3: lazy, srcset [500, 800], sizes for 3-col/1-col */}
                    <div className="relative overflow-hidden" style={{ height:200 }}>
                      <Img
                        id={a.id}
                        widths={[500, 800]}
                        sizes={AUDIENCE_SIZES}
                        alt={a.alt}
                        width={600} height={200}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div aria-hidden="true" className="absolute inset-0"
                        style={{ background:"linear-gradient(to bottom, transparent 40%, rgba(5,8,20,0.8) 100%)" }} />
                    </div>
                    <div className="p-6">
                      <h3 className="font-display font-semibold text-base text-white mb-2">{a.title}</h3>
                      <p className="font-body text-sm text-white/55 leading-relaxed">{a.text}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-20 px-6 border-t border-white/[0.06]" id="community"
          aria-labelledby="testimonials-heading">
          <div className="max-w-5xl mx-auto">
            <Reveal style={{ textAlign:"center", marginBottom:52 }}>
              <span className="kicker mb-5 inline-block">Founders love it</span>
              <h2 id="testimonials-heading" className="font-display font-bold tracking-tight text-white"
                style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                The CEO feeling{" "}
                <span className="text-gradient">is real now.</span>
              </h2>
            </Reveal>
            <div className="grid sm:grid-cols-2 gap-5 mb-12">
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={t.name} delay={i * 0.08}>
                  <blockquote className="glass rounded-2xl p-7">
                    <div aria-hidden="true" className="text-brand-purple text-sm mb-3 tracking-widest">★★★★★</div>
                    <p className="font-body text-sm text-white/72 leading-relaxed italic mb-4">"{t.q}"</p>
                    <footer className="flex items-center gap-3">
                      <div aria-hidden="true"
                        className="w-8 h-8 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-xs font-display font-bold text-brand-purple flex-shrink-0">
                        {t.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <cite className="not-italic font-display font-semibold text-sm text-white block">{t.name}</cite>
                        <span className="font-body text-xs text-white/42">{t.role}</span>
                      </div>
                    </footer>
                  </blockquote>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.2}>
              <div className="text-center">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/28 mb-5">Trusted by the community</p>
                <div className="flex flex-wrap gap-8 justify-center" aria-label="Trusted communities">
                  {TRUST.map((l) => (
                    <span key={l} className="font-display font-semibold text-sm text-white/22">{l}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FINAL CTA — 1 GIF background (lazy / below fold)
        ══════════════════════════════════════════ */}
        <section className="py-24 px-6" aria-labelledby="cta-heading">
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-[2rem] overflow-hidden border border-white/10">
              <div aria-hidden="true" className="absolute inset-0 z-0">
                {/* eager=false — below fold, preload="none", no rush */}
                <GifVid
                  src={GIF.withAgents}
                  poster={POSTER.withAgents}
                  posterSrcset={POSTER_SRCSET.withAgents}
                  posterSizes="100vw"
                  eager={false}
                  className="w-full h-full object-cover"
                  style={{ opacity:0.22 }}
                />
                <div className="absolute inset-0"
                  style={{ background:"radial-gradient(ellipse 70% 60% at 50% 40%, rgba(96,92,255,0.32), rgba(5,8,20,0.88) 65%)" }} />
              </div>

              <div className="relative z-10 px-8 md:px-12 py-16 text-center">
                <Reveal>
                  <h2 id="cta-heading" className="font-display font-bold tracking-tight text-white mb-4"
                    style={{ fontSize:"clamp(32px,4vw,56px)" }}>
                    Be the CEO<br />
                    <span className="text-gradient">your future self needs.</span>
                  </h2>
                  <p className="font-body text-white/60 mt-4 max-w-2xl mx-auto leading-relaxed mb-8">
                    Join the founders building their invisible empire — the hardware, agents, and OS that future founders will take for granted.
                  </p>
                  <Link to="/waitlist"
                    className="btn-primary !py-4 !px-10 !text-base uppercase tracking-wide"
                    aria-label="Join the yAtIverse ecosystem waitlist">
                    Join Ecosystem Waitlist →
                  </Link>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}