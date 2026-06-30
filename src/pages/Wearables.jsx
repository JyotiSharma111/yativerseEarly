import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

const RING_IMAGES = ["/ring1.jpeg", "/ring2.jpeg", "/ring3.jpeg", "/ring4.jpeg"];
const SIGNALS = ["Recovery: 84%", "Resting HR: 58 bpm", "Sleep: 7h 12m", "Steps today: 4,210"];

const FEATURES = [
  {
    title: "Recovery",
    text:  "A daily score built from your sleep quality and resting heart rate — so you know whether today is a build day or a rest day.",
    accent: "#605CFF",
  },
  {
    title: "Heart rate",
    text:  "Continuous resting heart rate tracking, giving you a clear baseline for stress and exertion across your week.",
    accent: "#4ECDC4",
  },
  {
    title: "Sleep",
    text:  "Sleep stages and duration tracked automatically — no manual logging, no app you have to remember to open.",
    accent: "#C86DD7",
  },
  {
    title: "Activity",
    text:  "Steps and movement throughout your day, contextualized against your recovery — not just a raw number.",
    accent: "#FF6B8A",
  },
];

const WHY_IT_MATTERS = [
  {
    title: "Real signal, not guesswork",
    text:  "Founders make big calls on adrenaline and caffeine. YATI Flow gives you an honest read on whether you're actually sharp.",
  },
  {
    title: "Zero extra effort",
    text:  "No app to check obsessively, no manual logging. It works in the background, the way the best tools should.",
  },
  {
    title: "The foundation of the ecosystem",
    text:  "As Founder OS and your Digital C-Suite come online, your YATI Flow data becomes part of the bigger picture — automatically.",
  },
];

function RingCarousel({ images, intervalMs = 3200 }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((p) => (p + 1) % images.length), intervalMs);
    return () => clearInterval(id);
  }, [paused, images.length, intervalMs]);

  return (
    <div className="relative w-full h-full"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {images.map((src, i) => (
        <img key={src} src={src} alt={`Signal Ring — view ${i + 1}`}
          width={640} height={520} loading={i === 0 ? "eager" : "lazy"} decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: i === active ? 0.85 : 0, minHeight: 520 }} />
      ))}
      <div className="absolute top-4 right-4 flex gap-1.5 z-10" role="tablist" aria-label="Ring image selector">
        {images.map((_, i) => (
          <button key={i} role="tab" aria-selected={i === active} aria-label={`Show ring view ${i + 1}`}
            onClick={() => { setActive(i); setPaused(true); }}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{ background: i === active ? "#ffffff" : "rgba(255,255,255,0.3)", transform: i === active ? "scale(1.3)" : "scale(1)" }} />
        ))}
      </div>
    </div>
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

export default function WearablesPage() {
  const [sig, setSig] = useState(0);
  const signal = useMemo(() => SIGNALS[sig], [sig]);

  useEffect(() => {
    const id = setInterval(() => setSig((p) => (p + 1) % SIGNALS.length), 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <SEO
        path="/wearables"
        title="YATI Flow — Signal Ring | yAtIverse"
        description="YATI Flow is our line of AI-native wearables. The Signal Ring is available now, tracking sleep, heart rate, activity, and recovery."
        canonical="https://yativerse.ai/wearables"
        ogImage="https://yativerse.ai/og-image.png"
      />
      <div className="bg-brand-bg text-white min-h-screen">
        <Navbar />
        <main>

          {/* ══ HERO ══ */}
          <section className="relative px-6 pt-32 pb-20 overflow-hidden">
            <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none"
              style={{ background:"radial-gradient(ellipse 70% 50% at 50% 20%, rgba(96,92,255,0.16) 0%, transparent 65%)" }} />
            <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
              <Reveal>
                <span className="kicker mb-5 inline-block">YATI Flow · Available now</span>
                <h1 className="font-display font-bold leading-[1.02] tracking-[-0.03em] text-white mb-5"
                  style={{ fontSize:"clamp(36px,5.5vw,68px)" }}>
                  It starts with{" "}
                  <span className="text-gradient">a signal.</span>
                </h1>
                <p className="font-body text-lg text-white/55 leading-relaxed mb-4 max-w-md">
                  The Signal Ring — our first YATI Flow device — tracks your sleep, heart rate, activity, and recovery, giving you the daily readiness data founders need to operate at their best.
                </p>
                <p className="font-body text-sm text-white/38 leading-relaxed mb-8 max-w-md">
                  It's the foundation everything else gets built on, as Founder OS and your Digital C-Suite come online around it.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/waitlist" className="btn-primary">Join the Waitlist →</Link>
                </div>
                <p className="text-xs text-white/35 font-body mt-4">Free to join · No credit card</p>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="relative rounded-[2rem] overflow-hidden border border-white/[0.08]"
                  style={{ minHeight:520, background:"radial-gradient(ellipse 70% 60% at 50% 40%, rgba(96,92,255,0.18), rgba(5,8,20,0.9) 70%)" }}>
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

          {/* ══ FEATURES ══ */}
          <section className="py-20 px-6 border-t border-white/[0.06]" aria-labelledby="features-heading">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <Reveal>
                  <span className="kicker mb-5 inline-block">What it tracks</span>
                  <h2 id="features-heading" className="font-display font-bold tracking-tight text-white"
                    style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                    Four signals.{" "}
                    <span className="text-gradient">One daily picture.</span>
                  </h2>
                </Reveal>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {FEATURES.map((f, i) => (
                  <Reveal key={f.title} delay={i * 0.07}>
                    <div className="glass rounded-2xl overflow-hidden border border-white/[0.08] hover:border-white/16 transition-all duration-300 h-full">
                      <div aria-hidden="true" className="h-1.5 w-full" style={{ background:f.accent, opacity:0.85 }} />
                      <div className="p-6">
                        <h3 className="font-display font-semibold text-base text-white mb-2">{f.title}</h3>
                        <p className="font-body text-sm text-white/50 leading-relaxed">{f.text}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ══ WHY IT MATTERS ══ */}
          <section className="py-20 px-6 border-t border-white/[0.06]" aria-labelledby="why-heading">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start mb-14">
                <Reveal>
                  <span className="kicker mb-5 inline-block">Why it matters</span>
                  <h2 id="why-heading" className="font-display font-bold leading-tight tracking-tight text-white"
                    style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                    Not another fitness tracker.
                  </h2>
                </Reveal>
                <Reveal delay={0.1}>
                  <p className="font-body text-base text-white/58 leading-relaxed lg:pt-14">
                    YATI Flow exists for one reason: to give founders an honest read on their own state, with zero added effort.
                  </p>
                </Reveal>
              </div>
              <div className="grid sm:grid-cols-3 gap-5">
                {WHY_IT_MATTERS.map((item, i) => (
                  <Reveal key={item.title} delay={i * 0.08}>
                    <div className="glass rounded-2xl p-6 hover:border-white/14 transition-colors duration-300 h-full">
                      <h3 className="font-display font-semibold text-base text-white mb-2">{item.title}</h3>
                      <p className="font-body text-sm text-white/50 leading-relaxed">{item.text}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ══ CATEGORY NOTE ══ */}
          <section className="py-16 px-6 border-t border-white/[0.06]">
            <div className="max-w-3xl mx-auto text-center">
              <Reveal>
                <p className="font-body text-sm text-white/40 leading-relaxed">
                  YATI Flow is our line of AI-native wearables. The Signal Ring is live today, with more devices in the category planned as YATIVerse grows.
                </p>
              </Reveal>
            </div>
          </section>

          {/* ══ CTA ══ */}
          <section className="py-24 px-6" aria-labelledby="cta-heading">
            <div className="max-w-5xl mx-auto">
              <div className="relative rounded-[2rem] overflow-hidden border border-white/10 px-8 md:px-12 py-16 text-center"
                style={{ background:"radial-gradient(ellipse 70% 60% at 50% 40%, rgba(96,92,255,0.18), rgba(5,8,20,0.92) 70%)" }}>
                <Reveal>
                  <h2 id="cta-heading" className="font-display font-bold tracking-tight text-white mb-4"
                    style={{ fontSize:"clamp(28px,4vw,48px)" }}>
                    Get your daily signal.
                  </h2>
                  <p className="font-body text-white/60 mt-2 max-w-xl mx-auto leading-relaxed mb-8">
                    Join the waitlist for early access to the Signal Ring and everything coming next in YATIVerse.
                  </p>
                  <Link to="/waitlist" className="btn-primary !py-4 !px-10 !text-base uppercase tracking-wide">
                    Join the Waitlist →
                  </Link>
                </Reveal>
              </div>
            </div>
          </section>

        </main>
        <Footer />
      </div>
    </>
  );
}