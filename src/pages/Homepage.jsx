import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

// ── MEDIA ──────────────────────────────────────────────────────
const B = "https://gktcrehhhixfgwkixamg.supabase.co/storage/v1/object/public/yati/";
const M = {
  routine:    B + "video_showing_the_routine_of_a_founder.gif",
  morning:    B + "morning.mp4",
  deepWork:   B + "deep_work.mp4",
  onTheMove:  B + "on%20the%20move.mp4",
  idea:       B + "the-idea-moment.mp4",
  withAgents: B + "Founder_with_AI_agents_202605291326.mp4",
  appGrid:    B + "App%20grid%20showing%20all%20integrations.mp4",
  justSpeak:  B + "Dont%20type_just%20speak.mp4",
  copilot:    B + "Copilot_20260529_125037.png",
  sea:        B + "founder_doing_sea_activities_202605291355.jpeg",
};

// ── DATA ───────────────────────────────────────────────────────
const SIGNALS = ["Identity synced", "Launch plan ready", "3 agent tasks complete", "Founder workflow active"];

const JOURNEY = [
  { n:"01", title:"Claim your yAtI",  text:"Start with one identity layer for your goals, brand, tools, and builder context.",  vid: M.idea      },
  { n:"02", title:"Open the OS",      text:"Turn scattered tasks into one daily command center for priorities and progress.",     vid: M.appGrid   },
  { n:"03", title:"Activate agents",  text:"Delegate launch, network, content, and operations to AI that knows your build.",     vid: M.withAgents},
  { n:"04", title:"Start up right",   text:"Ship consistently, build trust, and grow inside a system that compounds.",           vid: M.morning   },
];

const PRODUCTS = [
  { name:"yAtI Identity", eyebrow:"Core",        text:"A living profile for your founder context, brand signal, and goals.",       accent:"#605CFF", vid: M.morning    },
  { name:"AI-1 Layer",    eyebrow:"Intelligence", text:"One AI layer connecting your tools, context, agents, and next actions.",    accent:"#C86DD7", vid: M.appGrid    },
  { name:"yAtI OS",       eyebrow:"Workspace",    text:"A command center for goals, launches, workflows, metrics, and clarity.",    accent:"#4ECDC4", vid: M.deepWork   },
  { name:"AI Agents",     eyebrow:"Execution",    text:"Specialized operators for launch, network, content, and focus workflows.",  accent:"#FF6B8A", vid: M.withAgents },
];

const TIMELINE_CARDS = [
  { time:"09:00", title:"Deep work sprint", text:"Notifications held. Top task loaded. Focus agent tracking progress." },
  { time:"12:30", title:"Launch review",    text:"Market notes summarized and next experiments queued." },
  { time:"16:00", title:"Audience loop",    text:"Brand agent prepared three posts from today's build notes." },
];

const AGENTS = [
  { title:"Launch",  color:"#605CFF", text:"Validates ideas, maps competitors, and turns raw concepts into launch plans.",   tasks:["Market scan","MVP path","Launch checklist"],   vid: M.idea      },
  { title:"Network", color:"#C86DD7", text:"Finds aligned mentors, customers, creators, and investors with useful context.", tasks:["Lead lists","Warm intros","Follow-up prompts"],  vid: M.onTheMove },
  { title:"Focus",   color:"#4ECDC4", text:"Protects deep work and keeps your highest-leverage actions visible every day.",  tasks:["Time blocks","Priority reset","Weekly review"],  vid: M.deepWork  },
  { title:"Brand",   color:"#FF6B8A", text:"Builds a content engine around your voice, offers, and audience signals.",      tasks:["Post drafts","Campaign ideas","Repurposing"],    vid: M.justSpeak },
];

const AUDIENCE = [
  { title:"First-time founders",    text:"Shape an idea, organise the work, and move from scattered effort to a repeatable launch rhythm.", img: M.morning    },
  { title:"Operators and builders", text:"Connect strategy, execution, content, and follow-up without adding another messy tool layer.",     img: M.sea        },
  { title:"Vision-led creators",    text:"Keep identity, audience, product, and momentum aligned as your personal brand becomes a business.", img: M.copilot   },
];

const TESTIMONIALS = [
  { q:"I used to feel like a fraud calling myself CEO. Now I actually feel like one.",                        name:"Neha P.",   role:"Co-founder, Studio Arc" },
  { q:"It's the first time I've felt like I have a real team behind me. Even though it's just me.",          name:"Marcus L.", role:"Indie founder"           },
  { q:"The ring knows when I'm sharp. The agents take over everything else. I just build.",                   name:"Ravi M.",   role:"Founder, Buildfast"      },
  { q:"I stopped apologising for being a solo founder. My invisible team handles more than most offices do.", name:"Sara P.",   role:"Solo founder"            },
];

const TRUST = ["Product Hunt","Indie Hackers","foundr","Notion","Reforge"];

const AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=60&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=60&q=80",
];

const QUICK_LINKS = [
  { title:"Wearables", text:"Signal Ring and Thread Pendant",  href:"/wearables" },
  { title:"yAtI OS",   text:"Your personal command center",   href:"/"          },
  { title:"AI Agents", text:"Your invisible team, 24/7",      href:"/agents"    },
  { title:"Community", text:"Founders who get it",            href:"/community" },
];

// ── HELPERS ────────────────────────────────────────────────────
function Vid({ src, className = "", style = {} }) {
  return <video src={src} autoPlay muted loop playsInline className={className} style={style} />;
}
function Img({ src, className = "", style = {}, alt = "" }) {
  return <img src={src} alt={alt} className={className} style={style} />;
}

function Reveal({ children, delay = 0, className = "", style = {} }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}
      style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(24px)", transition: `opacity 0.75s ease ${delay}s, transform 0.75s ease ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

// ── COMPONENT ─────────────────────────────────────────────────
export default function Homepage() {
  const [sig, setSig] = useState(0);
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
      <SEO path="/" />
      <div className="bg-brand-bg text-white min-h-screen">
        <Navbar />

        {/* ══════════════════════════════════════════
            HERO — centered + ambient video strip
        ══════════════════════════════════════════ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 overflow-hidden">

          {/* Ambient background — very subtle looping video at low opacity */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <Vid src={M.deepWork}
              className="w-full h-full object-cover"
              style={{ opacity: 0.06, filter: "blur(2px)", transform: "scale(1.05)" }} />
            {/* dark overlay to keep text readable */}
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(to bottom, var(--color-bg) 0%, rgba(5,8,20,0.6) 40%, rgba(5,8,20,0.6) 60%, var(--color-bg) 100%)" }} />
          </div>

          {/* Purple radial glow */}
          <div className="absolute inset-0 z-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(96,92,255,0.1) 0%, transparent 70%)" }} />

          {/* Hero content */}
          <div className="relative z-10 max-w-3xl w-full text-center mx-auto">

            <Link to="/agents"
              className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-mono font-medium tracking-wide border border-white/10 bg-white/[0.05] text-[#F5C542] hover:text-white transition-colors">
              Introducing yAtI AI-1 &nbsp;<span className="text-brand-purple font-semibold">Explore the system →</span>
            </Link>

            <h1 className="font-display font-bold leading-[1.0] tracking-[-0.03em] text-white mb-4"
              style={{ fontSize: "clamp(44px,7vw,88px)" }}>
              Start Up Right!
              <span className="text-gradient"><br />Build what matters.</span>
            </h1>

            <p className="font-body text-lg text-white/60 max-w-xl mx-auto leading-relaxed mb-8">
              Your invisible digital C-suite — wearables, AI agents, and Founder OS — always working, never sleeping.
            </p>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="flex">
                {AVATARS.map((s, i) => (
                  <img key={i} src={s} alt="" className="w-7 h-7 rounded-full object-cover border-2 border-brand-bg -ml-2 first:ml-0" />
                ))}
              </div>
              <span className="text-xs text-white/48 font-body">
                <span className="text-white/75 font-semibold">1,200+ founders</span> on the waitlist
              </span>
            </div>

            {/* Ecosystem pills */}
            <div className="flex flex-wrap gap-2.5 justify-center mb-10">
              {[
                { dot:"#605CFF", label:"Signal Ring — Wearable"      },
                { dot:"#C86DD7", label:"Founder OS — Command Center"  },
                { dot:"#FF6B8A", label:"AI Agents — Invisible Team"   },
              ].map((tab) => (
                <div key={tab.label}
                  className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] px-3.5 py-1.5 rounded-full text-xs font-body text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: tab.dot, boxShadow: `0 0 6px ${tab.dot}` }} />
                  {tab.label}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 justify-center mb-10">
              <Link to="/waitlist" className="btn-primary">Join Waitlist →</Link>
              <Link to="/signal-ring" className="btn-ghost">Watch Vision Video →</Link>
            </div>

            <p className="text-xs text-white/35 font-body">Early access · Limited spots available</p>
          </div>

          {/* ── HERO VISUAL STRIP — 3 floating video cards below CTA ── */}
          <div className="relative z-10 w-full max-w-4xl mx-auto mt-16 px-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { src: M.morning,    label:"Morning ritual",   aspect:"aspect-[3/4]"  },
                { src: M.withAgents, label:"With your agents", aspect:"aspect-[3/4]", tall: true },
                { src: M.routine,    label:"Founder routine",  aspect:"aspect-[3/4]", img: true  },
              ].map((c, i) => (
                <div key={i}
                  className={`relative rounded-2xl overflow-hidden border border-white/[0.08] group ${c.aspect}`}
                  style={{ transform: i === 1 ? "translateY(-16px)" : "none", animationDelay:`${i*0.1}s` }}>
                  {c.img
                    ? <Img src={c.src} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    : <Vid src={c.src} className="w-full h-full object-cover" />}
                  {/* label */}
                  <div className="absolute bottom-0 left-0 right-0 p-3"
                    style={{ background:"linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}>
                    <span className="text-[10px] font-body text-white/60 tracking-wide">{c.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── QUICK LINKS ── */}
        <section className="border-t border-white/[0.06]">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/[0.06]">
            {QUICK_LINKS.map((item) => (
              <Link key={item.title} to={item.href}
                className="px-6 py-5 hover:bg-white/[0.03] transition-colors group">
                <p className="font-display font-semibold text-sm text-white mb-1 group-hover:text-brand-purple transition-colors">{item.title}</p>
                <p className="text-xs font-body text-white/42">{item.text}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            JOURNEY — cards now have video thumbnails
        ══════════════════════════════════════════ */}
        <section className="py-20 px-6 border-t border-white/[0.06]" id="journey">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start mb-14">
              <Reveal>
                <span className="kicker mb-5 inline-block">The path</span>
                <h2 className="font-display font-bold leading-tight tracking-tight text-white"
                  style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                  From idea energy to an operating eco-system that compounds.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="font-body text-base text-white/58 leading-relaxed lg:pt-14">
                  yAtIverse gives your ambition a place to live, then adds the workflow and agent support to keep it moving — even when the whole company is just you.
                </p>
              </Reveal>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {JOURNEY.map((item, i) => (
                <Reveal key={item.title} delay={i * 0.07}>
                  <div className="glass rounded-2xl overflow-hidden hover:border-white/14 transition-colors duration-300 group cursor-default">
                    {/* video thumbnail */}
                    <div className="relative overflow-hidden" style={{ height:140 }}>
                      <Vid src={item.vid} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0" style={{ background:"linear-gradient(to bottom, transparent 40%, rgba(5,8,20,0.85) 100%)" }} />
                      <span className="absolute bottom-3 left-4 font-mono text-xs text-white/40 tracking-widest">{item.n}</span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-display font-semibold text-base text-white mb-2">{item.title}</h3>
                      <p className="font-body text-sm text-white/50 leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            PRODUCTS — cards with video thumbnails
        ══════════════════════════════════════════ */}
        <section className="py-20 px-6 border-t border-white/[0.06]" id="identity">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <Reveal>
                <span className="kicker mb-5 inline-block">The ecosystem</span>
                <h2 className="font-display font-bold tracking-tight text-white"
                  style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                  Every tool a founder needs,<br />
                  <span className="text-gradient">in one place.</span>
                </h2>
              </Reveal>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRODUCTS.map((p, i) => (
                <Reveal key={p.name} delay={i * 0.07}>
                  <div className="glass rounded-[1.25rem] overflow-hidden border border-white/[0.08] hover:border-white/16 transition-all duration-300 cursor-pointer group hover:-translate-y-1">
                    {/* video thumbnail */}
                    <div className="relative overflow-hidden" style={{ height:130 }}>
                      <Vid src={p.vid} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0" style={{ background:"linear-gradient(to bottom, transparent 30%, rgba(5,8,20,0.9) 100%)" }} />
                    </div>
                    <div className="p-5">
                      <p className="text-[10px] font-mono font-semibold uppercase tracking-widest mb-1.5" style={{ color:p.accent }}>{p.eyebrow}</p>
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
            OS SECTION — video on the right
        ══════════════════════════════════════════ */}
        <section className="py-20 px-6 border-t border-white/[0.06]" id="os">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left — timeline cards */}
            <div className="flex flex-col gap-3">
              {TIMELINE_CARDS.map((card, i) => (
                <div key={card.time} onClick={() => setActiveTimeline(i)}
                  className={`rounded-2xl p-5 cursor-pointer transition-all duration-500 border ${
                    i === activeTimeline
                      ? "bg-white/[0.07] border-white/20"
                      : "bg-white/[0.02] border-white/[0.06] opacity-55"
                  }`}>
                  <p className="font-mono text-xs text-white/45 mb-1">{card.time}</p>
                  <p className="font-display font-semibold text-sm text-white mb-1">{card.title}</p>
                  <p className="font-body text-xs text-white/55 leading-relaxed">{card.text}</p>
                </div>
              ))}

              {/* OS video preview */}
              <div className="relative rounded-2xl overflow-hidden mt-2 border border-white/[0.08]" style={{ height:180 }}>
                <Vid src={M.appGrid} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background:"linear-gradient(135deg, rgba(96,92,255,0.2) 0%, transparent 60%)" }} />
                <div className="absolute bottom-3 left-4">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">yAtI OS · Live</p>
                </div>
              </div>
            </div>

            {/* Right — copy */}
            <Reveal delay={0.1}>
              <span className="kicker mb-5 inline-block">yAtI OS</span>
              <h2 className="font-display font-bold tracking-tight text-white mb-5"
                style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                A command center for building the impossible,<br />one workflow at a time.
              </h2>
              <p className="font-body text-base text-white/55 leading-relaxed mb-8 max-w-md">
                Your personal command center. Replaces tab-hopping with a daily rhythm — know what matters, let agents prep the next move, and see progress compound.
              </p>
              <Link to="/waitlist" className="btn-ghost">Request early access →</Link>
            </Reveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            AGENTS — cards with video thumbnails + split hero
        ══════════════════════════════════════════ */}
        <section className="py-20 px-6 border-t border-white/[0.06]" id="agents">
          <div className="max-w-7xl mx-auto">

            {/* Section header + hero visual */}
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-16">
              <Reveal>
                <span className="kicker mb-5 inline-block">Your invisible team</span>
                <h2 className="font-display font-bold tracking-tight text-white mb-5"
                  style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                  They work while you sleep.<br />
                  <span className="text-gradient">You wake up ahead.</span>
                </h2>
                <p className="font-body text-base text-white/55 leading-relaxed mb-6 max-w-md">
                  Four AI agents, each owning a founder workflow — running in the background every single day.
                </p>
                <Link to="/agents" className="btn-ghost">Meet your agents →</Link>
              </Reveal>

              {/* 2x2 video grid */}
              <Reveal delay={0.12}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl overflow-hidden border border-white/[0.08]" style={{ height:180 }}>
                    <Vid src={M.withAgents} className="w-full h-full object-cover" />
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-white/[0.08]" style={{ height:180 }}>
                    <Vid src={M.deepWork} className="w-full h-full object-cover" />
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-white/[0.08]" style={{ height:180 }}>
                    <Vid src={M.justSpeak} className="w-full h-full object-cover" />
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-white/[0.08]" style={{ height:180 }}>
                    <Vid src={M.onTheMove} className="w-full h-full object-cover" />
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Agent cards with video thumbnails */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {AGENTS.map((a, i) => (
                <Reveal key={a.title} delay={i * 0.07}>
                  <div className="glass rounded-2xl overflow-hidden hover:border-white/14 transition-all duration-300 group hover:-translate-y-1 cursor-default">
                    {/* video thumbnail */}
                    <div className="relative overflow-hidden" style={{ height:120 }}>
                      <Vid src={a.vid} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0" style={{ background:`linear-gradient(to bottom, transparent 20%, rgba(5,8,20,0.9) 100%)` }} />
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
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            AUDIENCE — cards with real founder images
        ══════════════════════════════════════════ */}
        <section className="py-20 px-6 border-t border-white/[0.06]">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start mb-14">
              <Reveal>
                <span className="kicker mb-5 inline-block">Who it serves</span>
                <h2 className="font-display font-bold tracking-tight text-white"
                  style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                  Built for real builders,<br />
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
                  <div className="glass rounded-[1.75rem] overflow-hidden hover:border-white/14 transition-all duration-300 group hover:-translate-y-1 cursor-default">
                    {/* image/video header */}
                    <div className="relative overflow-hidden" style={{ height:200 }}>
                      {i === 0
                        ? <Vid src={a.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        : <Img src={a.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      }
                      <div className="absolute inset-0" style={{ background:"linear-gradient(to bottom, transparent 40%, rgba(5,8,20,0.8) 100%)" }} />
                    </div>
                    <div className="p-6">
                      <h3 className="font-display font-semibold text-base text-white mb-2">{a.title}</h3>
                      <p className="font-body text-sm text-white/55 leading-relaxed">{a.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-20 px-6 border-t border-white/[0.06]" id="community">
          <div className="max-w-5xl mx-auto">
            <Reveal style={{ textAlign:"center", marginBottom:52 }}>
              <span className="kicker mb-5 inline-block">Founders love it</span>
              <h2 className="font-display font-bold tracking-tight text-white"
                style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                The CEO feeling<br />
                <span className="text-gradient">is real now.</span>
              </h2>
            </Reveal>
            <div className="grid sm:grid-cols-2 gap-5 mb-12">
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={t.name} delay={i * 0.08}>
                  <div className="glass rounded-2xl p-7">
                    <div className="text-brand-purple text-sm mb-3 tracking-widest">★★★★★</div>
                    <p className="font-body text-sm text-white/72 leading-relaxed italic mb-4">"{t.q}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-xs font-display font-bold text-brand-purple flex-shrink-0">
                        {t.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-display font-semibold text-sm text-white">{t.name}</p>
                        <p className="font-body text-xs text-white/42 mt-0.5">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.2}>
              <div className="text-center">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/28 mb-5">Trusted by the community</p>
                <div className="flex flex-wrap gap-8 justify-center">
                  {TRUST.map((l) => (
                    <span key={l} className="font-display font-semibold text-sm text-white/22">{l}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FINAL CTA — full bleed video background
        ══════════════════════════════════════════ */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-[2rem] overflow-hidden border border-white/10">

              {/* background video */}
              <div className="absolute inset-0 z-0">
                <Vid src={M.withAgents} className="w-full h-full object-cover" style={{ opacity:0.22 }} />
                <div className="absolute inset-0" style={{ background:"radial-gradient(circle at top, rgba(96,92,255,0.28), rgba(5,8,20,0.85) 65%)" }} />
              </div>

              <div className="relative z-10 px-8 md:px-12 py-16 text-center">
                <Reveal>
                  <h2 className="font-display font-bold tracking-tight text-white mb-4"
                    style={{ fontSize:"clamp(32px,4vw,56px)" }}>
                    Be the CEO<br />
                    <span className="text-gradient">your future self needs.</span>
                  </h2>
                  <p className="font-body text-white/60 mt-4 max-w-2xl mx-auto leading-relaxed mb-8">
                    Join the founders building their invisible empire — the hardware, agents, and OS that future founders will take for granted.
                  </p>
                  <Link to="/waitlist" className="btn-primary !py-4 !px-10 !text-base uppercase tracking-wide">
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