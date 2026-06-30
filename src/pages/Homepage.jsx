import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import HeroCards from "../components/HeroCards";

const B = "https://gktcrehhhixfgwkixamg.supabase.co/storage/v1/object/public/yati/";
const U = "https://images.unsplash.com/";

function uSrc(id, w)         { return `${U}${id}?auto=format&fit=crop&w=${w}&q=80`; }
function uSrcset(id, widths) { return widths.map((w) => `${uSrc(id, w)} ${w}w`).join(", "); }

const GIF = {
  morning:    B + "morning.mp4",
  withAgents: B + "Founder_with_AI_agents_202605291326.mp4",
  deepWork:   B + "deep_work.mp4",
};

const POSTER = {
  morning:    uSrc("photo-1506784983877-45594efa4cbe", 600),
  withAgents: uSrc("photo-1551434678-e076c223a692",    600),
};

const IMG_ID = {
  osPreview:        "photo-1551288049-bebda4e38f71",
  ring:             "photo-1535632066927-ab7c9ab60908", // unused now — kept for reference
  agentCMO:         "photo-1519389950473-47ba0277781c",
  agentCRO:         "photo-1521791136064-7986c2920216",
  agentCFO:         "photo-1434030216411-0b793f4b4173",
  agentCOO:         "photo-1478737270239-2f02b77fc618",
  audienceFounder:  "photo-1556761175-4b46a572b786",
  audienceOperator: "photo-1504384308090-c894fdcc538d",
  audienceCreator:  "photo-1611532736597-de2d4265fba3",
};

const AGENT_SIZES    = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw";
const AUDIENCE_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
const OS_SIZES       = "(max-width: 1024px) 100vw, 50vw";

const AVATARS = [
  uSrc("photo-1534528741775-53994a69daeb", 60),
  uSrc("photo-1506794778202-cad84cf45f1d", 60),
  uSrc("photo-1494790108377-be9c29b29330", 60),
  uSrc("photo-1500648767791-00dcc994a43e", 60),
];

const RING_IMAGES = ["/ring1.jpeg", "/ring2.jpeg", "/ring3.jpeg", "/ring4.jpeg"];

const HERO_CARDS = [
  { src: GIF.morning,    posterId:"photo-1506784983877-45594efa4cbe", label:"Morning ritual",   alt:"Founder starting their morning ritual at desk"    },
  { src: GIF.withAgents, posterId:"photo-1551434678-e076c223a692",    label:"With your agents", alt:"Founder collaborating with AI agents on screen"    },
  { src: GIF.deepWork,   posterId:"photo-1498050108023-c5249f4df085", label:"Deep work",        alt:"Founder in deep focused work session"              },
];

// ─── COPY ────────────────────────────────────────────────────────────────────

const SIGNALS = [
  "Recovery: 84%",
  "Resting HR: 58 bpm",
  "Sleep: 7h 12m",
  "Steps today: 4,210",
];

const HERO_PILLS = [
  { dot: "#605CFF", label: "Signal Ring — launching first" },
  { dot: "#C86DD7", label: "Digital C-Suite — your AI team" },
  { dot: "#FF6B8A", label: "Founder OS — your command center" },
];

const QUICK_LINKS = [
  { title: "Signal Ring", text: "Launching first — on your finger",   href: "/wearables"  },
  { title: "Founder OS", text: "Your daily command center",         href: "/"           },
  { title: "AI Agents",  text: "Your invisible team, 24/7",         href: "/agents"     },
  { title: "Community",  text: "Founders who live it",              href: "/community"  },
];

const BEFORE_AFTER = [
  {
    before: "10 tools open. None of them talking to each other.",
    after:  "One OS. Every tool connected. One place to decide.",
  },
  {
    before: "Hiring a CMO, CFO, and COO costs $600K+ a year.",
    after:  "Your Digital C-Suite works 24/7 for a fraction of that.",
  },
  {
    before: "You miss a critical market signal while away from your desk.",
    after:  "Your ring tells you. You decide from wherever you are.",
  },
];

const LAUNCH_TIMELINE = [
  { q: "Now",      label: "Signal Ring — sleep, heart rate, activity, recovery", dot: "#605CFF" },
  { q: "Next",     label: "Founder OS — your daily command center",             dot: "#C86DD7" },
  { q: "Later",    label: "Digital C-Suite — full ecosystem connected",         dot: "#FF6B8A" },
];

const JOURNEY = [
  {
    n:     "01",
    title: "Discover",
    text:  "Start with the Signal Ring. Daily intelligence on your finger before you open a laptop.",
  },
  {
    n:     "02",
    title: "Capture",
    text:  "Voice notes, ideas, meetings, and signals — collected automatically as you move through your day.",
  },
  {
    n:     "03",
    title: "Build",
    text:  "Activate Founder OS and Builder Mode. Scattered thoughts become structured launch plans.",
  },
  {
    n:     "04",
    title: "Scale",
    text:  "Deploy your Digital C-Suite. AI executives handle strategy, growth, finance, and ops while you focus.",
  },
];

const PRODUCTS = [
  {
    name:    "Signal Ring",
    eyebrow: "Launching first",
    text:    "The Signal Ring. Daily intelligence, productivity, and personal assistance — always on, always with you.",
    accent:  "#605CFF",
    tag:     "Hardware · Available now",
  },
  {
    name:    "Founder OS",
    eyebrow: "Coming next",
    text:    "Your operating rhythm. Goals, priorities, dashboards, and weekly cadence — one command center for everything that matters.",
    accent:  "#4ECDC4",
    tag:     "Software · Early access",
  },
  {
    name:    "Digital C-Suite",
    eyebrow: "AI executives",
    text:    "Role-based AI agents across strategy, marketing, sales, finance, and operations. The team you couldn't afford. Now you can.",
    accent:  "#FF6B8A",
    tag:     "Agents · Included in OS",
  },
];

const TIMELINE_CARDS = [
  {
    time:  "06:00",
    title: "Morning briefing",
    text:  "Ring pulses once. Earpiece delivers your founder score, top priority, and overnight agent updates.",
  },
  {
    time:  "12:30",
    title: "Decision queue",
    text:  "Three decisions ready. Market gap identified. NDA flagged. Campaign draft approved. Each takes under a minute.",
  },
  {
    time:  "17:00",
    title: "Day closed",
    text:  "Agents keep working. Content drafted. Leads scored. Runway updated. You live your life.",
  },
];

const AGENTS = [
  {
    title: "AI CMO",
    color: "#605CFF",
    text:  "Creates positioning, content strategy, campaigns, product messaging, and audience insights.",
    tasks: ["Brand positioning", "Content strategy", "Campaign ideas"],
    id:    IMG_ID.agentCMO,
    alt:   "Founder planning a go-to-market strategy",
  },
  {
    title: "AI CRO",
    color: "#C86DD7",
    text:  "Scores leads, drafts outreach, supports deal coaching, and recommends next best actions.",
    tasks: ["Lead scoring", "Warm outreach", "Deal coaching"],
    id:    IMG_ID.agentCRO,
    alt:   "Professional connecting with a potential client",
  },
  {
    title: "AI CFO",
    color: "#4ECDC4",
    text:  "Tracks budgets, runway, unit economics, investor updates, and financial decision scenarios.",
    tasks: ["Runway tracking", "Unit economics", "Investor updates"],
    id:    IMG_ID.agentCFO,
    alt:   "Founder reviewing financial metrics at desk",
  },
  {
    title: "AI COO",
    color: "#FF6B8A",
    text:  "Turns goals into workflows, routines, delivery systems, and operating dashboards.",
    tasks: ["Goal-to-workflow", "Daily routines", "Operating dashboards"],
    id:    IMG_ID.agentCOO,
    alt:   "Operator managing execution systems",
  },
];

const AUDIENCE = [
  {
    title: "First-time founders",
    text:  "Stop guessing what to do next. YATIVerse gives you a repeatable launch rhythm from day one.",
    id:    IMG_ID.audienceFounder,
    alt:   "Young founder focused at their laptop",
  },
  {
    title: "Operators and builders",
    text:  "Connect strategy, execution, content, and follow-up without adding another tool to your stack.",
    id:    IMG_ID.audienceOperator,
    alt:   "Operator reviewing dashboards at a coworking space",
  },
  {
    title: "Vision-led creators",
    text:  "Keep identity, audience, product, and momentum aligned as your personal brand becomes a business.",
    id:    IMG_ID.audienceCreator,
    alt:   "Creator filming content in a well-lit studio",
  },
];

const TESTIMONIALS = [
  { q: "I used to feel like a fraud calling myself CEO. Now I actually feel like one.",                        name: "Neha P.",   role: "Co-founder, Studio Arc" },
  { q: "It's the first time I've felt like I have a real team behind me. Even though it's just me.",          name: "Marcus L.", role: "Indie founder"           },
  { q: "The ring knows when I'm sharp. The agents take over everything else. I just build.",                   name: "Ravi M.",   role: "Founder, Buildfast"      },
  { q: "I stopped apologising for being a solo founder. My invisible team handles more than most offices do.", name: "Sara P.",   role: "Solo founder"            },
];

const TRUST = ["Product Hunt", "Indie Hackers", "foundr", "Notion", "Reforge"];

// ─── END COPY ────────────────────────────────────────────────────────────────

function Img({ id, widths=[400,800], sizes="100vw", alt, className="", style={},
               loading="lazy", fetchpriority="auto", width, height }) {
  const src    = uSrc(id, widths[widths.length - 1]);
  const srcset = uSrcset(id, widths);
  return (
    <img src={src} srcSet={srcset} sizes={sizes} alt={alt} className={className}
      style={style} loading={loading} fetchpriority={fetchpriority}
      decoding="async" width={width} height={height} />
  );
}

function RingCarousel({ images, intervalMs = 3200 }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((p) => (p + 1) % images.length), intervalMs);
    return () => clearInterval(id);
  }, [paused, images.length, intervalMs]);

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`YATIVerse Signal Ring — view ${i + 1}`}
          width={640}
          height={420}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: i === active ? 0.8 : 0, minHeight: 420 }}
        />
      ))}

      {/* Dot navigation */}
      <div className="absolute top-4 right-4 flex gap-1.5 z-10" role="tablist" aria-label="Ring image selector">
        {images.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === active}
            aria-label={`Show ring view ${i + 1}`}
            onClick={() => { setActive(i); setPaused(true); }}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              background: i === active ? "#ffffff" : "rgba(255,255,255,0.3)",
              transform: i === active ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Reveal({ children, delay=0, className="", style={} }) {
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
      style={{ opacity:vis?1:0, transform:vis?"none":"translateY(24px)",
               transition:`opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

export default function Homepage() {
  const [sig, setSig]                       = useState(0);
  const [activeTimeline, setActiveTimeline] = useState(0);
  const signal = useMemo(() => SIGNALS[sig], [sig]);

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
        title="yAtIverse — AI Lifestyle for Founders. Signal Ring, Agents & OS."
        description="YATIVerse is an AI lifestyle for founders. A Signal Ring on your finger, a Digital C-Suite running your business, and a Founder OS keeping you in control. The Signal Ring ships first."
        canonical="https://yativerse.ai/"
        ogImage="https://yativerse.ai/og-image.png"
      />
      <div className="bg-brand-bg text-white min-h-screen">
        <Navbar />
        <main>

        {/* ══ HERO ══ */}
        <section aria-label="yAtIverse — AI lifestyle for founders"
          className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none"
            style={{ background:"radial-gradient(ellipse 80% 55% at 50% 30%, rgba(96,92,255,0.14) 0%, transparent 68%), radial-gradient(ellipse 45% 35% at 72% 72%, rgba(200,109,215,0.08) 0%, transparent 60%)" }} />

          <div className="relative z-10 max-w-3xl w-full text-center mx-auto">
            <Link to="/wearables" aria-label="Signal Ring — launching first"
              className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-mono font-medium tracking-wide border border-white/10 bg-white/[0.05] text-[#F5C542] hover:text-white transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-[#605CFF] animate-pulse flex-shrink-0" aria-hidden="true" />
              Signal Ring — launching first&nbsp;
              <span className="text-brand-purple font-semibold">Learn more →</span>
            </Link>

            <h1 className="font-display font-bold leading-[1.0] tracking-[-0.03em] text-white mb-4"
              style={{ fontSize:"clamp(44px,7vw,88px)" }}>
              You don't need
              <span className="text-gradient"><br />a bigger team.</span>
            </h1>

            <p className="font-body text-lg text-white/60 max-w-xl mx-auto leading-relaxed mb-3">
              You need a smarter life. YATIVerse gives founders an AI lifestyle — the Signal Ring on your finger, a Digital C-Suite running your business, and an OS keeping you in control.
            </p>

            <p className="font-mono text-xs text-white/35 mb-8 tracking-wide">
              A ring · an AI team · an operating system — built to work together
            </p>

            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="flex" aria-hidden="true">
                {AVATARS.map((s, i) => (
                  <img key={i} src={s} alt="" width={28} height={28}
                    loading="eager" fetchpriority="low" decoding="async"
                    className="w-7 h-7 rounded-full object-cover border-2 border-brand-bg -ml-2 first:ml-0" />
                ))}
              </div>
              <p className="text-xs text-white/48 font-body">
                <span className="text-white/75 font-semibold">1,200+ founders</span> already on the waitlist
              </p>
            </div>

            <ul className="flex flex-wrap gap-2.5 justify-center mb-10 list-none" aria-label="yAtIverse products">
              {HERO_PILLS.map((tab) => (
                <li key={tab.label}
                  className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] px-3.5 py-1.5 rounded-full text-xs font-body text-white/60">
                  <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background:tab.dot, boxShadow:`0 0 6px ${tab.dot}` }} />
                  {tab.label}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3 justify-center mb-10">
              <Link to="/waitlist" className="btn-primary">Join the Waitlist →</Link>
              <Link to="/signal-ring" className="btn-ghost">Watch the Vision</Link>
            </div>
            <p className="text-xs text-white/35 font-body">Free to join · No credit card · Signal Ring ships first</p>
          </div>

          <section aria-label="yAtIverse founder lifestyle previews"
            className="relative z-10 w-full max-w-4xl mx-auto mt-16 px-4">
            <HeroCards cards={HERO_CARDS} />
          </section>
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

        {/* ══ SIGNAL RING — hero product, launches first ══ */}
        <section className="py-20 px-6 border-t border-white/[0.06]" id="wearables" aria-labelledby="wearable-heading">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <Reveal>
              <span className="kicker mb-5 inline-block">Available now</span>
              <h2 id="wearable-heading" className="font-display font-bold tracking-tight text-white mb-5"
                style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                It starts on your finger.{" "}
                <span className="text-gradient">It's just the beginning.</span>
              </h2>
              <p className="font-body text-base text-white/55 leading-relaxed mb-4 max-w-md">
                The Signal Ring tracks your sleep, heart rate, activity, and recovery — giving you the daily readiness data founders need to operate at their best.
              </p>
              <p className="font-body text-sm text-white/38 leading-relaxed mb-8 max-w-md">
                It's the first physical piece of the YATIVerse lifestyle — and the foundation everything else gets built on, as Founder OS and your Digital C-Suite come online.
              </p>
              <div className="flex flex-col gap-3 mb-8">
                {LAUNCH_TIMELINE.map((item) => (
                  <div key={item.q} className="flex items-center gap-4">
                    <span className="font-mono text-xs text-white/35 w-16 flex-shrink-0">{item.q}</span>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: item.dot, boxShadow:`0 0 6px ${item.dot}` }} aria-hidden="true" />
                    <span className="font-body text-sm text-white/65">{item.label}</span>
                  </div>
                ))}
              </div>
              <Link to="/wearables" className="btn-ghost">Explore Signal Ring →</Link>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="relative rounded-[2rem] overflow-hidden border border-white/[0.08]"
                style={{ minHeight:420, background:"radial-gradient(ellipse 70% 60% at 50% 40%, rgba(96,92,255,0.18), rgba(5,8,20,0.9) 70%)" }}>
                <RingCarousel images={RING_IMAGES} />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="glass rounded-xl px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-0.5">Signal Ring · Live</p>
                      <p className="font-display text-sm font-semibold text-white">{signal}</p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-[#77d6a1] animate-pulse flex-shrink-0"
                      style={{ boxShadow:"0 0 8px #77d6a1" }} aria-hidden="true" />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══ BEFORE / AFTER ══ */}
        <section className="py-20 px-6 border-t border-white/[0.06]" aria-labelledby="before-after-heading">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <Reveal>
                <span className="kicker mb-5 inline-block">The difference</span>
                <h2 id="before-after-heading" className="font-display font-bold tracking-tight text-white"
                  style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                  Before YATIVerse.{" "}
                  <span className="text-gradient">After YATIVerse.</span>
                </h2>
              </Reveal>
            </div>
            <div className="grid gap-4 max-w-3xl mx-auto">
              {BEFORE_AFTER.map((item, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="glass rounded-2xl p-6 grid sm:grid-cols-2 gap-4 items-center">
                    <div className="flex items-start gap-3">
                      <span className="text-white/20 text-lg font-bold flex-shrink-0 mt-0.5" aria-hidden="true">✕</span>
                      <p className="font-body text-sm text-white/42 leading-relaxed">{item.before}</p>
                    </div>
                    <div className="flex items-start gap-3 sm:border-l sm:border-white/[0.06] sm:pl-4">
                      <span className="text-[#77d6a1] text-lg font-bold flex-shrink-0 mt-0.5" aria-hidden="true">✓</span>
                      <p className="font-body text-sm text-white/80 leading-relaxed">{item.after}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ JOURNEY ══ */}
        <section className="py-20 px-6 border-t border-white/[0.06]" id="journey" aria-labelledby="journey-heading">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start mb-14">
              <Reveal>
                <span className="kicker mb-5 inline-block">The path</span>
                <h2 id="journey-heading" className="font-display font-bold leading-tight tracking-tight text-white"
                  style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                  Start on your finger.<br />End up running a company.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="font-body text-base text-white/58 leading-relaxed lg:pt-14">
                  Every product you add compounds the one before it. The more of YATIVerse you use, the more leverage you get.
                </p>
              </Reveal>
            </div>
            <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {JOURNEY.map((item, i) => (
                <li key={item.title}>
                  <Reveal delay={i * 0.07}>
                    <div className="glass rounded-2xl p-6 hover:border-white/14 transition-colors duration-300 h-full">
                      <span aria-hidden="true" className="block font-mono text-4xl font-bold mb-4 leading-none"
                        style={{ color:"rgba(96,92,255,0.35)" }}>{item.n}</span>
                      <h3 className="font-display font-semibold text-base text-white mb-2">{item.title}</h3>
                      <p className="font-body text-sm text-white/50 leading-relaxed">{item.text}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ══ PRODUCTS — three not eight ══ */}
        <section className="py-20 px-6 border-t border-white/[0.06]" id="products" aria-labelledby="products-heading">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <Reveal>
                <span className="kicker mb-5 inline-block">The ecosystem</span>
                <h2 id="products-heading" className="font-display font-bold tracking-tight text-white"
                  style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                  Three products.{" "}
                  <span className="text-gradient">One lifestyle.</span>
                </h2>
                <p className="font-body text-base text-white/45 leading-relaxed mt-4">
                  Start with the ring. Add the OS. Activate your C-Suite. Each one makes the next more powerful.
                </p>
              </Reveal>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {PRODUCTS.map((p, i) => (
                <Reveal key={p.name} delay={i * 0.08}>
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
                      <p className="font-mono text-[10px] uppercase tracking-widest mb-3"
                        style={{ color:`${p.accent}99` }}>{p.tag}</p>
                      <span className="text-xs font-medium font-body" style={{ color:p.accent }}>Explore →</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ OS — a day in the life ══ */}
        <section className="py-20 px-6 border-t border-white/[0.06]" id="os" aria-labelledby="os-heading">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="flex flex-col gap-3">
              {TIMELINE_CARDS.map((card, i) => (
                <button key={card.time} onClick={() => setActiveTimeline(i)}
                  aria-pressed={i === activeTimeline}
                  className={`rounded-2xl p-5 text-left transition-all duration-500 border ${
                    i === activeTimeline ? "bg-white/[0.07] border-white/20" : "bg-white/[0.02] border-white/[0.06] opacity-55"
                  }`}>
                  <p className="font-mono text-xs text-white/45 mb-1">{card.time}</p>
                  <p className="font-display font-semibold text-sm text-white mb-1">{card.title}</p>
                  <p className="font-body text-xs text-white/55 leading-relaxed">{card.text}</p>
                </button>
              ))}
              <div className="relative rounded-2xl overflow-hidden mt-2 border border-white/[0.08]" style={{ height:180 }}>
                <Img id={IMG_ID.osPreview} widths={[400,800]} sizes={OS_SIZES}
                  alt="yAtI OS dashboard showing goals, priorities, and daily workflow"
                  width={640} height={180} className="w-full h-full object-cover" />
                <div aria-hidden="true" className="absolute inset-0"
                  style={{ background:"linear-gradient(135deg, rgba(96,92,255,0.2) 0%, transparent 60%)" }} />
                <p className="absolute bottom-3 left-4 text-[10px] font-mono uppercase tracking-widest text-white/40">Founder OS · Preview</p>
              </div>
            </div>
            <Reveal delay={0.1}>
              <span className="kicker mb-5 inline-block">Founder OS</span>
              <h2 id="os-heading" className="font-display font-bold tracking-tight text-white mb-5"
                style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                Your day —<br />without the chaos.
              </h2>
              <p className="font-body text-base text-white/55 leading-relaxed mb-8 max-w-md">
                The Founder OS replaces your scattered tabs, morning confusion, and end-of-day guilt with one clear operating rhythm. Know what matters. Let agents handle the rest. Watch it compound.
              </p>
              <Link to="/waitlist" className="btn-ghost">Request early access →</Link>
            </Reveal>
          </div>
        </section>

        {/* ══ DIGITAL C-SUITE ══ */}
        <section className="py-20 px-6 border-t border-white/[0.06]" id="agents" aria-labelledby="agents-heading">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-end mb-14">
              <Reveal>
                <span className="kicker mb-5 inline-block">Digital C-Suite</span>
                <h2 id="agents-heading" className="font-display font-bold tracking-tight text-white mb-5"
                  style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                  They work while you sleep.{" "}
                  <span className="text-gradient">You wake up ahead.</span>
                </h2>
                <p className="font-body text-base text-white/55 leading-relaxed max-w-md">
                  Role-based AI executives across strategy, marketing, revenue, and operations. Each one owns a function. All of them report to you.
                </p>
              </Reveal>
              <Reveal delay={0.1} className="lg:text-right">
                <Link to="/agents" className="btn-ghost">Meet your C-Suite →</Link>
              </Reveal>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {AGENTS.map((a, i) => (
                <Reveal key={a.title} delay={i * 0.07}>
                  <article className="glass rounded-2xl overflow-hidden hover:border-white/14 transition-all duration-300 group hover:-translate-y-1 cursor-default h-full">
                    <div className="relative overflow-hidden" style={{ height:120 }}>
                      <Img id={a.id} widths={[200,400]} sizes={AGENT_SIZES} alt={a.alt}
                        width={400} height={120}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
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
                          <span key={t} className="text-[10px] font-body px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/50">{t}</span>
                        ))}
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ AUDIENCE ══ */}
        <section className="py-20 px-6 border-t border-white/[0.06]" aria-labelledby="audience-heading">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start mb-14">
              <Reveal>
                <span className="kicker mb-5 inline-block">Who it's for</span>
                <h2 id="audience-heading" className="font-display font-bold tracking-tight text-white"
                  style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                  Built for real builders,{" "}<span className="text-gradient">not just tech tourists.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="font-body text-base text-white/55 leading-relaxed lg:pt-14">
                  Whether you're validating your first idea or running a lean operation solo — YATIVerse gives you the infrastructure that used to cost a full-time staff.
                </p>
              </Reveal>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {AUDIENCE.map((a, i) => (
                <Reveal key={a.title} delay={i * 0.08}>
                  <article className="glass rounded-[1.75rem] overflow-hidden hover:border-white/14 transition-all duration-300 group hover:-translate-y-1 cursor-default h-full">
                    <div className="relative overflow-hidden" style={{ height:200 }}>
                      <Img id={a.id} widths={[500,800]} sizes={AUDIENCE_SIZES} alt={a.alt}
                        width={600} height={200}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
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

        {/* ══ TESTIMONIALS ══ */}
        <section className="py-20 px-6 border-t border-white/[0.06]" id="community" aria-labelledby="testimonials-heading">
          <div className="max-w-5xl mx-auto">
            <Reveal style={{ textAlign:"center", marginBottom:52 }}>
              <span className="kicker mb-5 inline-block">Founders love it</span>
              <h2 id="testimonials-heading" className="font-display font-bold tracking-tight text-white"
                style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                The CEO feeling{" "}<span className="text-gradient">is real now.</span>
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

        {/* ══ CTA ══ */}
        <section className="py-24 px-6" aria-labelledby="cta-heading">
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-[2rem] overflow-hidden border border-white/10">
              <div aria-hidden="true" className="absolute inset-0 z-0">
                <video src={GIF.withAgents} poster={POSTER.withAgents}
                  autoPlay muted loop playsInline preload="none" aria-hidden="true"
                  className="w-full h-full object-cover" style={{ opacity:0.22 }} />
                <div className="absolute inset-0"
                  style={{ background:"radial-gradient(ellipse 70% 60% at 50% 40%, rgba(96,92,255,0.32), rgba(5,8,20,0.88) 65%)" }} />
              </div>
              <div className="relative z-10 px-8 md:px-12 py-16 text-center">
                <Reveal>
                  <h2 id="cta-heading" className="font-display font-bold tracking-tight text-white mb-4"
                    style={{ fontSize:"clamp(32px,4vw,56px)" }}>
                    The founders building with AI today<br />
                    <span className="text-gradient">will be the ones everyone else studies tomorrow.</span>
                  </h2>
                  <p className="font-body text-white/60 mt-4 max-w-xl mx-auto leading-relaxed mb-8">
                    Join the waitlist. Signal Ring ships first. Your Digital C-Suite and Founder OS follow. Your AI lifestyle starts here.
                  </p>
                  <Link to="/waitlist"
                    className="btn-primary !py-4 !px-10 !text-base uppercase tracking-wide"
                    aria-label="Join the yAtIverse waitlist">
                    Get in Early →
                  </Link>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/25 mt-5">
                    Free to join · No credit card · Limited spots
                  </p>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        </main>
        <Footer />
      </div>
    </>
  );
}