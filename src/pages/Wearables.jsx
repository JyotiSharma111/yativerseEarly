import { Link }   from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Navbar  from '../components/Navbar'
import Footer  from '../components/Footer'
import SEO     from '../components/SEO'
import { fadeUp, fadeLeft, fadeRight, scaleIn } from '../lib/motion'

const T = { purple:'#605CFF', pink:'#C86DD7', teal:'#4ECDC4', rose:'#FF6B8A' }

const PRODUCTS = [
  { id:'ring',    name:'Signal Ring',    tagline:'Subtle intelligence. Powerful presence.',      tag:'Available now', tagColor:T.teal,   price:'From $149', color:T.purple, img:'ring1.jpeg', specs:['Focus tracking','Haptic alerts','Agent sync','5-day battery','Titanium body'], desc:'The Signal Ring is your always-on identity layer. It syncs with Yati OS to surface focus scores, meeting signals, and agent alerts — without ever pulling out your phone.' },
  { id:'pendant', name:'Thread Pendant', tagline:'Your AI. Close to heart.',                    tag:'Pre-order',     tagColor:T.pink,   price:'From $199', color:T.pink,   img:'pendant1.jpeg', specs:['Voice capture','AI context sync','Ambient mode','Wireless charge','Surgical steel'], desc:'Thread is a wearable intelligence pendant designed to sit close to you. It acts as a passive AI interface — capturing ambient context, surfacing insights, and connecting silently to your agent ecosystem.' },
  { id:'earbuds', name:'Yati Earbuds',   tagline:'Ambient intelligence. Always listening.',     tag:'Coming soon',   tagColor:T.rose,   price:'TBA',       color:T.rose,   img:'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1200&q=80', specs:['Agent audio feed','Focus mode','Noise filtering','Call coaching','All-day wear'], desc:'Future earbuds built for founders — not music, but clarity. They surface agent briefings, coach your focus, and filter the noise so you can stay in flow.' },
]

const ECO = [
  { icon:'🧬', title:'Identity sync',     desc:'Every device knows who you are and what you\'re building.' },
  { icon:'🤖', title:'Agent integration', desc:'Your agents push smart alerts without distracting you.'     },
  { icon:'🎯', title:'Focus intelligence',desc:'Track deep work sessions, energy, and momentum over time.'  },
  { icon:'🌐', title:'Ambient OS',         desc:'Wearables feed context into Yati OS automatically.'         },
]

export default function Wearables() {
  return (
    <>
      <SEO title="Wearables — Signal Ring & Thread Pendant" description="AI-connected wearables for founders. Signal Ring and Thread Pendant keep you connected to your ecosystem without living on your phone." path="/wearables" />
      <div className="bg-brand-bg text-white min-h-screen">
        <Navbar />

        {/* Hero */}
        <section className="relative pt-40 pb-24 text-center overflow-hidden px-4">
          <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(96,92,255,.14), transparent 65%)' }} />
          <motion.span {...fadeUp(0)} className="kicker mb-6 inline-block">Hardware</motion.span>
          <motion.h1 {...fadeUp(0.07)} className="font-display font-bold tracking-[-0.04em] leading-[0.96] mb-6 text-white" style={{ fontSize:'clamp(44px,7vw,92px)' }}>
            Wear your<br /><span className="text-gradient">intelligence.</span>
          </motion.h1>
          <motion.p {...fadeUp(0.13)} className="font-body text-lg text-white/58 max-w-lg mx-auto mb-10 leading-relaxed">
            Devices designed for founders. Wearables that connect identity, focus, and AI into one ambient layer.
          </motion.p>
          <motion.div {...fadeUp(0.18)} className="flex gap-3 justify-center flex-wrap">
            <Link to="/signal-ring" className="btn-primary">Shop Signal Ring <ArrowRight className="w-4 h-4" /></Link>
            <Link to="/waitlist"    className="btn-ghost">Pre-order Pendant</Link>
          </motion.div>
        </section>

        {/* Products */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          {PRODUCTS.map((p, i) => {
            const even = i % 2 !== 0
            return (
              <motion.div key={p.id} id={p.id}
                {...fadeUp(0.05)}
                className={`grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-28 last:mb-0`}>
                {/* Image */}
                <div className={`relative rounded-3xl overflow-hidden aspect-[4/3] group ${even ? 'md:order-2' : ''}`}>
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" />
                  <div className="absolute inset-0" style={{ background:'linear-gradient(to top, rgba(5,8,20,.5), transparent 50%)' }} />
                  <span className="absolute top-4 left-4 text-[11px] font-semibold font-mono px-3 py-1.5 rounded-full"
                    style={{ background:`${p.tagColor}22`, color:p.tagColor, border:`1px solid ${p.tagColor}40` }}>
                    {p.tag}
                  </span>
                </div>
                {/* Copy */}
                <div className={even ? 'md:order-1' : ''}>
                  <h2 className="font-display font-bold tracking-tight leading-none mb-3 text-white" style={{ fontSize:'clamp(32px,3.5vw,52px)' }}>{p.name}</h2>
                  <p className="font-body text-lg text-white/48 mb-4">{p.tagline}</p>
                  <p className="font-body text-sm text-white/58 leading-relaxed mb-6 max-w-sm">{p.desc}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {p.specs.map(s => (
                      <span key={s} className="text-xs font-body text-white/55 bg-white/[0.05] border border-white/[0.09] px-3 py-1.5 rounded-full">{s}</span>
                    ))}
                  </div>
                  <p className="text-xs font-mono text-white/35 mb-5 tracking-wider">{p.price}</p>
                  <div className="flex gap-3 flex-wrap">
                    <Link to={p.id === 'ring' ? '/signal-ring' : '/waitlist'} className="btn-primary"
                      style={{ background:`linear-gradient(135deg, ${p.color}, #C86DD7)` }}>
                      {p.tag === 'Coming soon' ? 'Join waitlist' : p.tag === 'Pre-order' ? 'Pre-order now' : 'Order now'} <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link to="/waitlist" className="btn-ghost">Learn more</Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </section>

        {/* Ecosystem strip */}
        <section className="py-20 px-4 border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <motion.span {...fadeUp(0)} className="kicker mb-4 inline-block">Why wearables</motion.span>
              <motion.h2 {...fadeUp(0.07)} className="font-display font-bold tracking-tight text-white" style={{ fontSize:'clamp(28px,3.5vw,48px)' }}>
                Every device connects to<br /><span className="text-gradient">the same intelligence.</span>
              </motion.h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ECO.map((f, i) => (
                <motion.div key={f.title} {...fadeUp(i * 0.07)}
                  className="glass rounded-2xl p-6 hover:border-white/14 transition-colors duration-300">
                  <div className="text-2xl mb-3">{f.icon}</div>
                  <p className="font-display font-semibold text-sm text-white mb-2">{f.title}</p>
                  <p className="font-body text-xs text-white/48 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 text-center px-4">
          <motion.h2 {...fadeUp(0)} className="font-display font-bold tracking-tight text-white mb-4" style={{ fontSize:'clamp(32px,4vw,56px)' }}>
            Start with<br /><span className="text-gradient">the ring.</span>
          </motion.h2>
          <motion.p {...fadeUp(0.08)} className="font-body text-white/52 mb-8 text-lg">Your first step into the Yativerse ecosystem.</motion.p>
          <motion.div {...fadeUp(0.14)}>
            <Link to="/signal-ring" className="btn-primary">Get early access <ArrowRight className="w-4 h-4" /></Link>
          </motion.div>
        </section>

        <Footer />
      </div>
    </>
  )
}
