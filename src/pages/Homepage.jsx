import { useEffect, useMemo, useState } from 'react'
import { Link }    from 'react-router-dom'
import { motion }  from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO   from '../components/SEO'
import { fadeUp } from '../lib/motion'

const SIGNALS = ['Identity synced', 'Launch plan ready', '3 agent tasks complete', 'Founder workflow active']
const METRICS = [{ v:'Identity', l:'starts here' }, { v:'Agents', l:'work beside you' }, { v:'OS', l:'keeps it moving' }]

const AGENTS_MINI = [
  { t:'Launch',  c:'#605CFF', img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=40&q=80' },
  { t:'Network', c:'#C86DD7', img:'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=40&q=80' },
  { t:'Focus',   c:'#4ECDC4', img:'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=40&q=80' },
  { t:'Brand',   c:'#FF6B8A', img:'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=40&q=80' },
]

const JOURNEY = [
  { n:'01', title:'Claim your yAtI',  text:'Start with one identity layer for your goals, brand, tools, and builder context.' },
  { n:'02', title:'Open the OS',      text:'Turn scattered tasks into one daily command center for priorities and progress.' },
  { n:'03', title:'Activate agents',  text:'Delegate launch, network, content, and operations to AI that knows your build.' },
  { n:'04', title:'Start up right',   text:'Ship consistently, build trust, and grow inside a system that compounds.' },
]

const PRODUCTS = [
  { name:'yAtI Identity', eyebrow:'Core',        text:'A living profile for your founder context, brand signal, and goals.',         accent:'#605CFF', img:'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80' },
  { name:'AI-1 Layer',    eyebrow:'Intelligence', text:'One AI layer connecting your tools, context, agents, and next actions.',      accent:'#C86DD7', img:'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80' },
  { name:'yAtI OS',       eyebrow:'Workspace',    text:'A command center for goals, launches, workflows, metrics, and clarity.',      accent:'#4ECDC4', img:'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=600&q=80' },
  { name:'AI Agents',     eyebrow:'Execution',    text:'Specialized operators for launch, network, content, and focus workflows.',    accent:'#FF6B8A', img:'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80' },
]

const TESTIMONIALS = [
  { q:'yAtI feels like a home base for the business I am becoming. Identity, plans, and execution in one rhythm.', name:'Neha P.',   role:'Co-founder, Studio Arc', av:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=80&q=80' },
  { q:'The best part is not another dashboard. The system remembers what I am building and helps me move.',        name:'Marcus L.', role:'Indie founder',           av:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80' },
]

const TRUST = ['Product Hunt','Indie Hackers','foundr','Notion','Reforge']

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=60&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=60&q=80',
]

const HERO_DEVICES = {
  ring:    'ring1.jpeg',
  pendant: 'pendant1.jpeg',
}

const QUICK_LINKS = [
  { title:'Wearables', text:'Signal Ring and Thread Pendant',          href:'/wearables' },
  { title:'yAtI OS',   text:'Founder workflows and command center',    href:'/'          },
  { title:'AI Agents', text:'Launch, Network, Focus, and Brand',       href:'/agents'    },
  { title:'Community', text:'Stories, social proof, and updates',      href:'/community' },
]

const TIMELINE_CARDS = [
  { time:'09:00', title:'Deep work sprint',  text:'Notifications held. Top task loaded. Focus agent tracking progress.' },
  { time:'12:30', title:'Launch review',     text:'Market notes summarized and next experiments queued.' },
  { time:'16:00', title:'Audience loop',     text:'Brand agent prepared three posts from today\'s build notes.' },
]

export default function Homepage() {
  const [sig,            setSig]            = useState(0)
  const [activeTimeline, setActiveTimeline] = useState(0)
  const signal = useMemo(() => SIGNALS[sig], [sig])

  useEffect(() => {
    const id = setInterval(() => setSig(p => (p + 1) % SIGNALS.length), 2500)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setActiveTimeline(p => (p + 1) % TIMELINE_CARDS.length), 2800)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <SEO path="/" />
      <div className="bg-brand-bg text-white min-h-screen">
        <Navbar />

        {/* ── HERO ── */}
        <section className="min-h-screen px-6 flex items-center pt-16">
          <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-14 items-center">
            {/* Left copy */}
            <div className="max-w-2xl">
              <Link to="/agents"
                className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-mono font-medium tracking-wide border border-white/10 bg-white/[0.05] text-[#F5C542]  hover:text-white transition-colors">
                Introducing yAtI AI-1 <span className="text-brand-purple font-semibold">Explore the system →</span>
              </Link>

              <h1 className="font-display font-bold leading-[1.02] tracking-[-0.03em] text-white mb-6"
                style={{ fontSize:'clamp(40px,5.5vw,76px)' }}>
                Start Up Right!
                <br />
                <span className="text-gradient">Build what matters.</span>
              </h1>

              <p className="font-body text-lg text-white/65 max-w-xl leading-relaxed mb-7">
                Smart devices and AI agents that help you build with more leverage.
                Start with the ring, then grow into the full ecosystem.
              </p>

              {/* Social proof */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex">
                  {AVATARS.map((s,i) => (
                    <img key={i} src={s} alt="" className="w-7 h-7 rounded-full object-cover border-2 border-brand-bg -ml-2 first:ml-0" />
                  ))}
                </div>
                <span className="text-xs text-white/48 font-body">
                  <span className="text-white/75 font-semibold">1,200+ founders</span> on the waitlist
                </span>
              </div>

              {/* Ecosystem tabs */}
              <div className="flex flex-wrap gap-2.5 mb-8">
                {[
                  { dot:'#605CFF', label:'Smart Ring — First Device'        },
                  { dot:'#C86DD7', label:'Smart Earbuds — Next'             },
                  { dot:'#FF6B8A', label:'AI Agent Platform — Coming Next'  },
                ].map(tab => (
                  <div key={tab.label}
                    className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] px-3.5 py-1.5 rounded-full text-xs font-body text-white/60">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background:tab.dot, boxShadow:`0 0 6px ${tab.dot}` }} />
                    {tab.label}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/waitlist"    className="btn-primary">Join Waitlist →</Link>
                <Link to="/signal-ring" className="btn-ghost">Watch Vision Video →</Link>
              </div>

              <p className="text-xs text-white/45 mt-6 font-body">500+ founders on the waitlist.</p>
            </div>

            {/* Right — OS preview card */}
            <div className="relative">
              <div className="absolute -inset-8 pointer-events-none"
                style={{ background:'radial-gradient(circle, rgba(96,92,255,0.14), transparent 55%)', filter:'blur(24px)' }} />

              <div className="relative glass rounded-[2rem] border border-white/10 p-4">
                {/* Hero image */}
                <div className="relative w-full h-[300px] rounded-[1.5rem] overflow-hidden mb-4">
                  <img src={HERO_DEVICES.ring} alt="Founder ecosystem visual"
                    className="w-full h-full object-cover" />
                </div>

                {/* OS panel */}
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-white/35">yAtI OS</p>
                      <p className="text-sm font-semibold font-display text-white mt-0.5">Identity command</p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
                  </div>

                  {/* Live signal */}
                  <div className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 mb-3">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-white/35 mb-1">Live signal</p>
                    <motion.p key={signal}
                      initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}
                      className="text-sm font-semibold font-body text-brand-teal">
                      {signal}
                    </motion.p>
                  </div>

                  {/* Agent rows */}
                  <div className="flex flex-col gap-1.5">
                    {AGENTS_MINI.map(a => (
                      <div key={a.t} className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                        <img src={a.img} alt={a.t} className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                        <span className="text-xs font-medium font-body text-white flex-1">{a.t}</span>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:a.c }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overlay caption */}
                <div className="absolute bottom-6 left-6 right-6 glass border border-white/10 rounded-2xl p-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/45 mb-1">Founder OS</p>
                  <p className="text-sm font-body text-white/85 leading-relaxed">
                    One ecosystem. Multiple devices. AI agents that grow with you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── QUICK LINKS ── */}
        <section className="border-t border-white/[0.06]">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/[0.06]">
            {QUICK_LINKS.map(item => (
              <Link key={item.title} to={item.href}
                className="px-6 py-5 hover:bg-white/[0.03] transition-colors group">
                <p className="font-display font-semibold text-sm text-white mb-1 group-hover:text-brand-purple transition-colors">{item.title}</p>
                <p className="text-xs font-body text-white/42">{item.text}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── JOURNEY ── */}
        <section className="py-20 px-6 border-t border-white/[0.06]" id="journey">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start mb-14">
              <div>
                <motion.span {...fadeUp(0)} className="kicker mb-5 inline-block">The path</motion.span>
                <motion.h2 {...fadeUp(0.07)} className="font-display font-bold leading-tight tracking-tight text-white"
                  style={{ fontSize:'clamp(28px,3.5vw,44px)' }}>
                  From idea energy to an operating eco-system that compounds.
                </motion.h2>
              </div>
              <motion.p {...fadeUp(0.1)} className="font-body text-base text-white/58 leading-relaxed lg:pt-14">
                yAtI gives your ambition a place to live, then adds the workflow and agent support to keep it moving.
              </motion.p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {JOURNEY.map((item, i) => (
                <motion.div key={item.title} {...fadeUp(i * 0.07)}
                  className="glass rounded-2xl p-6 hover:border-white/14 transition-colors duration-300">
                  <p className="font-mono text-xs text-white/28 tracking-widest mb-3">{item.n}</p>
                  <h3 className="font-display font-semibold text-base text-white mb-2">{item.title}</h3>
                  <p className="font-body text-sm text-white/50 leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRODUCTS ── */}
        <section className="py-20 px-6 border-t border-white/[0.06]" id="identity">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <motion.span {...fadeUp(0)} className="kicker mb-5 inline-block">The ecosystem</motion.span>
              <motion.h2 {...fadeUp(0.07)} className="font-display font-bold tracking-tight text-white"
                style={{ fontSize:'clamp(28px,3.5vw,44px)' }}>
                Every tool a founder needs,<br />
                <span className="text-gradient">in one place.</span>
              </motion.h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRODUCTS.map((p, i) => (
                <motion.div key={p.name} {...fadeUp(i * 0.07)}
                  className="glass rounded-[1.25rem] overflow-hidden border border-white/[0.08] hover:border-white/16 transition-colors duration-300 cursor-pointer group">
                  <div className="h-36 overflow-hidden">
                    <img src={p.img} alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-mono font-semibold uppercase tracking-widest mb-1.5" style={{ color:p.accent }}>{p.eyebrow}</p>
                    <p className="font-display font-semibold text-sm text-white mb-2">{p.name}</p>
                    <p className="font-body text-xs text-white/48 leading-relaxed mb-3">{p.text}</p>
                    <span className="text-xs font-medium font-body" style={{ color:p.accent }}>Explore →</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── OS SECTION ── */}
        <section className="py-20 px-6 border-t border-white/[0.06]" id="os">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Timeline cards */}
            <div className="flex flex-col gap-3">
              {TIMELINE_CARDS.map((card, i) => (
                <div key={card.time}
                  onClick={() => setActiveTimeline(i)}
                  className={`rounded-2xl p-5 cursor-pointer transition-all duration-500 border ${
                    i === activeTimeline
                      ? 'bg-white/[0.07] border-white/20'
                      : 'bg-white/[0.02] border-white/[0.06] opacity-55'
                  }`}>
                  <p className="font-mono text-xs text-white/45 mb-1">{card.time}</p>
                  <p className="font-display font-semibold text-sm text-white mb-1">{card.title}</p>
                  <p className="font-body text-xs text-white/55 leading-relaxed">{card.text}</p>
                </div>
              ))}
            </div>

            {/* Copy */}
            <div>
              <motion.span {...fadeUp(0)} className="kicker mb-5 inline-block">yAtI OS</motion.span>
              <motion.h2 {...fadeUp(0.07)} className="font-display font-bold tracking-tight text-white mb-5"
                style={{ fontSize:'clamp(28px,3.5vw,44px)' }}>
                A command center for building the impossible, one workflow at a time.
              </motion.h2>
              <motion.p {...fadeUp(0.12)} className="font-body text-base text-white/55 leading-relaxed mb-8 max-w-md">
                yAtI replaces tab-hopping with a daily rhythm: know what matters, let agents prep the next move, and see progress without wrestling your tools.
              </motion.p>
              <motion.div {...fadeUp(0.17)}>
                <Link to="/waitlist" className="btn-ghost">Request early access →</Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── AGENTS ── */}
        <section className="py-20 px-6 border-t border-white/[0.06]" id="agents">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <motion.span {...fadeUp(0)} className="kicker mb-5 inline-block">AI agents</motion.span>
              <motion.h2 {...fadeUp(0.07)} className="font-display font-bold tracking-tight text-white"
                style={{ fontSize:'clamp(28px,3.5vw,44px)' }}>
                Your AI-1 team, connected to<br />
                <span className="text-gradient">your identity and workflows.</span>
              </motion.h2>
              <motion.p {...fadeUp(0.12)} className="font-body text-base text-white/55 mt-4 leading-relaxed">
                Each agent owns a practical founder workflow — research faster, schedule smarter, publish more, follow up on time.
              </motion.p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title:'Launch',  text:'Validates ideas, maps competitors, and turns raw concepts into launch plans.',       tasks:['Market scan','MVP path','Launch checklist'], img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80', color:'#605CFF' },
                { title:'Network', text:'Finds aligned mentors, customers, creators, and investors with useful context.',     tasks:['Lead lists','Warm intros','Follow-up prompts'], img:'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=600&q=80', color:'#C86DD7' },
                { title:'Focus',   text:'Protects deep work and keeps your highest-leverage actions visible.',                 tasks:['Time blocks','Priority reset','Weekly review'], img:'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=600&q=80', color:'#4ECDC4' },
                { title:'Brand',   text:'Builds a content engine around your voice, offers, and audience signals.',           tasks:['Post drafts','Campaign ideas','Repurposing'],   img:'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80', color:'#FF6B8A' },
              ].map((a, i) => (
                <motion.div key={a.title} {...fadeUp(i * 0.07)}
                  className="glass rounded-2xl overflow-hidden hover:border-white/14 transition-colors duration-300">
                  <div className="h-32 overflow-hidden">
                    <img src={a.img} alt={a.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-5">
                    <span className="inline-block text-[10px] font-mono font-medium tracking-widest uppercase px-2.5 py-1 rounded-full mb-3"
                      style={{ background:`${a.color}18`, color:a.color, border:`1px solid ${a.color}30` }}>
                      {a.title}
                    </span>
                    <p className="font-body text-xs text-white/55 leading-relaxed mb-3">{a.text}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {a.tasks.map(t => (
                        <span key={t} className="text-[10px] font-body px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/50">{t}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AUDIENCE ── */}
        <section className="py-20 px-6 border-t border-white/[0.06]">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start mb-14">
              <div>
                <motion.span {...fadeUp(0)} className="kicker mb-5 inline-block">Who it serves</motion.span>
                <motion.h2 {...fadeUp(0.07)} className="font-display font-bold tracking-tight text-white"
                  style={{ fontSize:'clamp(28px,3.5vw,44px)' }}>
                  Built for real builders,<br />
                  <span className="text-gradient">not just tech tourists.</span>
                </motion.h2>
              </div>
              <motion.p {...fadeUp(0.1)} className="font-body text-base text-white/55 leading-relaxed lg:pt-14">
                The brand hint stays simple: a yAtI identity layer at the center, with OS and agents orbiting around it.
              </motion.p>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { title:'First-time founders',    text:'Shape an idea, organize the work, and move from scattered effort to a repeatable launch rhythm.', img:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80' },
                { title:'Operators and builders', text:'Connect strategy, execution, content, and follow-up without adding another messy tool layer.',      img:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80' },
                { title:'Vision-led creators',    text:'Keep identity, audience, product, and momentum aligned as your personal brand becomes a business.', img:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80' },
              ].map((a, i) => (
                <motion.div key={a.title} {...fadeUp(i * 0.08)}
                  className="glass rounded-[1.75rem] overflow-hidden hover:border-white/14 transition-colors duration-300">
                  <img src={a.img} alt={a.title} className="w-full h-44 object-cover object-[30%_40%]" loading="lazy" />
                  <div className="p-6">
                    <h3 className="font-display font-semibold text-base text-white mb-2">{a.title}</h3>
                    <p className="font-body text-sm text-white/55 leading-relaxed">{a.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-20 px-6 border-t border-white/[0.06]" id="community">
          <div className="max-w-5xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-5 mb-12">
              {TESTIMONIALS.map((t, i) => (
                <motion.div key={t.name} {...fadeUp(i * 0.08)}
                  className="glass rounded-2xl p-7 flex gap-4">
                  <img src={t.av} alt={t.name} className="w-11 h-11 rounded-full object-cover flex-shrink-0" loading="lazy" />
                  <div>
                    <p className="font-body text-sm text-white/72 leading-relaxed italic mb-4">"{t.q}"</p>
                    <p className="font-display font-semibold text-sm text-white">{t.name}</p>
                    <p className="font-body text-xs text-white/42 mt-0.5">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust logos */}
            <div className="text-center">
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/28 mb-5">Trusted by the community</p>
              <div className="flex flex-wrap gap-8 justify-center">
                {TRUST.map(l => <span key={l} className="font-display font-semibold text-sm text-white/22">{l}</span>)}
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="glass rounded-[2rem] border border-white/10 px-8 md:px-12 py-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none"
                style={{ background:'radial-gradient(circle at top, rgba(96,92,255,0.16), transparent 55%)' }} />
              <div className="relative z-10">
                <motion.h2 {...fadeUp(0)} className="font-display font-bold tracking-tight text-white mb-4"
                  style={{ fontSize:'clamp(32px,4vw,56px)' }}>
                  Be early to the<br />
                  <span className="text-gradient">founder ecosystem era.</span>
                </motion.h2>
                <motion.p {...fadeUp(0.08)} className="font-body text-white/60 mt-4 max-w-2xl mx-auto leading-relaxed mb-8">
                  We are building the hardware, agents, and OS that future founders will take for granted. You get to help shape it.
                </motion.p>
                <motion.div {...fadeUp(0.14)}>
                  <Link to="/waitlist" className="btn-primary !py-4 !px-10 !text-base uppercase tracking-wide">
                    Join Ecosystem Waitlist →
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
