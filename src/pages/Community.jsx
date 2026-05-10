import { Link }   from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Navbar  from '../components/Navbar'
import Footer  from '../components/Footer'
import SEO     from '../components/SEO'
import { fadeUp } from '../lib/motion'

const T = { purple:'#605CFF', pink:'#C86DD7', teal:'#4ECDC4', rose:'#FF6B8A' }

const STORIES = [
  { q:'Yati feels like a home base for the business I am becoming. Identity, plans, and execution in one rhythm.', name:'Neha P.',   role:'Co-founder, Studio Arc', av:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=100&q=80', tag:'Founder',  color:T.purple },
  { q:'The best part is not another dashboard. The system remembers what I\'m building and helps me move.',       name:'Marcus L.', role:'Indie founder',           av:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', tag:'Builder',  color:T.pink   },
  { q:'I went from scattered ideas to a real operating rhythm in two weeks. The agents do what a team of three used to.', name:'Priya S.',  role:'Solo operator',     av:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', tag:'Operator', color:T.teal   },
  { q:'Yativerse made me feel like a real startup even before I had a team. That confidence changed everything.',  name:'Jordan K.', role:'First-time founder',      av:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80', tag:'Founder',  color:T.rose   },
]

const LAYERS = [
  { icon:'💬', title:'Discord',         desc:'A live community of builders, operators, and founders. Share progress and find your people.', cta:'Join Discord',    color:T.purple },
  { icon:'📖', title:'Founder Stories', desc:'Real stories from people using Yativerse to build. Honest, documented progress.',              cta:'Read stories',    color:T.pink   },
  { icon:'🌟', title:'Ambassadors',     desc:'Become a Yativerse Ambassador. Share the ecosystem, earn perks, shape what gets built next.', cta:'Apply now',       color:T.teal   },
  { icon:'⚡', title:'Live Events',     desc:'Monthly founder sprints, agent workshops, and community builds. Online and in-person.',         cta:'See events',      color:T.rose   },
]

const STATS  = [{ v:'1,200+', l:'Founders on waitlist' },{ v:'40+', l:'Countries represented' },{ v:'4', l:'AI agents live' },{ v:'∞', l:'Ambition, no ceiling' }]
const TRUST  = ['Product Hunt','Indie Hackers','foundr','Notion','Reforge','X / Twitter']

export default function Community() {
  return (
    <>
      <SEO title="Community — Build Together" description="A global community of founders, builders, and operators inside the Yativerse ecosystem. Stories, Discord, events, and more." path="/community" />
      <div className="bg-brand-bg text-white min-h-screen">
        <Navbar />

        {/* Hero */}
        <section className="relative pt-40 pb-20 text-center overflow-hidden px-4">
          <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(96,92,255,.13), transparent 65%)' }} />
          <motion.span {...fadeUp(0)} className="kicker mb-6 inline-block">Community</motion.span>
          <motion.h1 {...fadeUp(0.07)} className="font-display font-bold tracking-[-0.04em] leading-[0.96] mb-6 text-white" style={{ fontSize:'clamp(44px,7vw,88px)' }}>
            You are not<br /><span className="text-gradient">building alone.</span>
          </motion.h1>
          <motion.p {...fadeUp(0.13)} className="font-body text-lg text-white/55 max-w-lg mx-auto mb-10 leading-relaxed">
            A global community of founders, builders, and operators — all inside the same ecosystem.
          </motion.p>
          <motion.div {...fadeUp(0.18)}>
            <Link to="/waitlist" className="btn-primary">Join the community <ArrowRight className="w-4 h-4" /></Link>
          </motion.div>
        </section>

        {/* Stats */}
        <div className="border-y border-white/[0.06] py-12 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/[0.06]">
            {STATS.map((s, i) => (
              <motion.div key={s.l} {...fadeUp(i * 0.07)} className="text-center px-6 py-2">
                <p className="font-display font-bold tracking-tight text-gradient" style={{ fontSize:'clamp(28px,4vw,52px)' }}>{s.v}</p>
                <p className="text-xs font-body text-white/38 mt-1">{s.l}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <motion.span {...fadeUp(0)} className="kicker mb-4 inline-block">Founder stories</motion.span>
              <motion.h2 {...fadeUp(0.07)} className="font-display font-bold tracking-tight text-white" style={{ fontSize:'clamp(28px,3.5vw,48px)' }}>
                Heard from <span className="text-gradient">real builders.</span>
              </motion.h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {STORIES.map((s, i) => (
                <motion.div key={s.name} {...fadeUp(i * 0.08)}
                  className="glass rounded-2xl p-6 hover:border-white/14 transition-colors duration-300"
                  style={{ borderColor:`${s.color}18` }}>
                  <span className="inline-block text-[10px] font-mono font-medium tracking-wider uppercase px-2.5 py-1 rounded-full mb-4"
                    style={{ background:`${s.color}18`, color:s.color, border:`1px solid ${s.color}30` }}>{s.tag}</span>
                  <p className="font-body text-sm text-white/70 leading-relaxed italic mb-5">"{s.q}"</p>
                  <div className="flex items-center gap-3">
                    <img src={s.av} alt={s.name} className="w-9 h-9 rounded-full object-cover" loading="lazy" />
                    <div>
                      <p className="text-sm font-semibold font-body text-white leading-none">{s.name}</p>
                      <p className="text-xs text-white/38 mt-0.5 font-body">{s.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Community layers */}
        <section className="py-20 px-4 border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <motion.span {...fadeUp(0)} className="kicker mb-4 inline-block">Get involved</motion.span>
              <motion.h2 {...fadeUp(0.07)} className="font-display font-bold tracking-tight text-white" style={{ fontSize:'clamp(28px,3.5vw,48px)' }}>
                Four ways to <span className="text-gradient">connect.</span>
              </motion.h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {LAYERS.map((l, i) => (
                <motion.div key={l.title} {...fadeUp(i * 0.07)}
                  className="glass rounded-2xl p-6 flex flex-col hover:border-white/14 transition-colors duration-300">
                  <div className="text-2xl mb-3">{l.icon}</div>
                  <p className="font-display font-bold text-base text-white mb-2">{l.title}</p>
                  <p className="font-body text-xs text-white/48 leading-relaxed mb-4 flex-1">{l.desc}</p>
                  <Link to="/waitlist" className="text-sm font-medium font-body transition-colors hover:opacity-75" style={{ color:l.color }}>{l.cta} →</Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust */}
        <div className="py-14 px-4 text-center border-t border-white/[0.06]">
          <p className="font-mono text-[10px] tracking-widest uppercase text-white/26 mb-6">Trusted by the community</p>
          <div className="flex flex-wrap gap-8 justify-center">
            {TRUST.map(l => <span key={l} className="font-display font-semibold text-sm text-white/22">{l}</span>)}
          </div>
        </div>

        {/* CTA */}
        <section className="py-24 text-center px-4">
          <motion.h2 {...fadeUp(0)} className="font-display font-bold tracking-tight text-white mb-4" style={{ fontSize:'clamp(32px,4vw,56px)' }}>
            Find your<br /><span className="text-gradient">people here.</span>
          </motion.h2>
          <motion.p {...fadeUp(0.08)} className="font-body text-white/52 mb-8 text-lg">Over 1,200 founders already on the waitlist.</motion.p>
          <motion.div {...fadeUp(0.14)}>
            <Link to="/waitlist" className="btn-primary">Join YATIVerse <ArrowRight className="w-4 h-4" /></Link>
          </motion.div>
        </section>

        <Footer />
      </div>
    </>
  )
}
