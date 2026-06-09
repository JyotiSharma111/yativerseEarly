import { useState } from 'react'
import { Link }     from 'react-router-dom'
import { motion }   from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Navbar  from '../components/Navbar'
import Footer  from '../components/Footer'
import SEO     from '../components/SEO'
import { fadeUp, fadeLeft, fadeRight } from '../lib/motion'

const T = { purple:'#605CFF', pink:'#C86DD7', teal:'#4ECDC4', rose:'#FF6B8A' }

const AGENTS = [
  { id:'launch',  name:'Launch Agent',  tagline:'From idea to launch plan in minutes.',         color:T.purple, icon:'🚀', img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80', desc:'The Launch Agent is your strategic co-founder. It validates your concept against market signals, maps competitors, and builds an executable launch plan tailored to your resources and timeline.', tasks:['Market & competitor research','MVP scope definition','Go-to-market planning','Launch checklist generation','Risk identification'], workflow:['Drop in your idea or product concept.','Launch Agent scans market and competitor data.','Returns a prioritized MVP path and validation checklist.','You approve and it builds a structured launch plan.','Weekly progress updates as you execute.'] },
  { id:'network', name:'Network Agent', tagline:'Right people. Right time. Right context.',      color:T.pink,   icon:'🤝', img:'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=80', desc:'Network Agent finds aligned mentors, investors, collaborators, and early customers — then helps you reach out with context-aware introductions that actually land.',                             tasks:['Lead list building','Warm intro drafting','Investor radar','Mentor matching','Follow-up sequences'],                                          workflow:['Define your current stage and networking goals.','Network Agent maps relevant people in your space.','Drafts personalized outreach for each contact.','You review and approve before any send.','Agent tracks responses and schedules follow-ups.'] },
  { id:'focus',   name:'Focus Agent',   tagline:'Protect your deep work. Guard your time.',     color:T.teal,   icon:'🎯', img:'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1000&q=80', desc:'Focus Agent structures your day around your highest-leverage actions, holds distractions at bay, and reviews progress weekly so momentum compounds without burning out.',                       tasks:['Daily priority setting','Deep work scheduling','Distraction blocking','Weekly retrospectives','Energy pattern tracking'],                        workflow:['Set your weekly goals in yAtI OS each Monday.','Focus Agent structures time blocks around them.','Notifications held during deep work sessions.','End-of-day summary of what actually moved.','Weekly reset and next-week planning.'] },
  { id:'brand',   name:'Brand Agent',   tagline:'A content engine built around your voice.',    color:T.rose,   icon:'✏️', img:'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1000&q=80', desc:'Brand Agent learns your tone, audience, and offers — then builds a consistent content engine across every platform, drafting, scheduling, repurposing, and tracking what resonates.',           tasks:['Content calendar creation','Post drafting in your voice','Multi-platform repurposing','Campaign ideation','Audience signal tracking'],            workflow:['Define your brand voice, audience, and content goals.','Brand Agent builds a 30-day content strategy.','Drafts posts across platforms for your review.','You approve. Agent schedules and publishes.','Weekly performance summary and content pivots.'] },
]

const HOW = [
  { n:'01', title:'Agents learn your context', desc:'When you set up yAtI OS, each agent absorbs your identity, goals, stage, and preferences.' },
  { n:'02', title:'You assign work, not tasks', desc:'Tell Launch Agent to find your first 10 customers. It handles research, outreach, and tracking.' },
  { n:'03', title:'Agents collaborate',         desc:'Brand Agent and Network Agent can work together — finding audiences and creating content simultaneously.' },
  { n:'04', title:'You stay in control',         desc:'Every major action needs your approval. Agents surface options, never surprises.' },
]

export default function Agents() {
  const [active, setActive] = useState('launch')
  const ag = AGENTS.find(a => a.id === active)

  return (
    <>
      <SEO title="AI Agents — Your Invisible Executive Team" description="Four specialized AI agents — Launch, Network, Focus, Brand — that own workflows, execute tasks, and collaborate so you never build alone." path="/agents" />
      <div className="bg-brand-bg text-white min-h-screen">
        <Navbar />

        {/* Hero */}
        <section className="relative pt-40 pb-24 text-center overflow-hidden px-4">
          <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(200,109,215,.13), transparent 65%)' }} />
          <motion.span {...fadeUp(0)} className="kicker mb-6 inline-block">Your AI C-Suite</motion.span>
          <motion.h1 {...fadeUp(0.07)} className="font-display font-bold tracking-[-0.04em] leading-[0.96] mb-6 text-white" style={{ fontSize:'clamp(44px,7vw,92px)' }}>
            Your invisible<br /><span className="text-gradient">executive team.</span>
          </motion.h1>
          <motion.p {...fadeUp(0.13)} className="font-body text-lg text-white/55 max-w-lg mx-auto mb-10 leading-relaxed">
            Specialized AI agents that own workflows, execute tasks, and collaborate — so you can focus on building.
          </motion.p>
          <motion.div {...fadeUp(0.18)}>
            <Link to="/waitlist" className="btn-primary">Activate your agents <ArrowRight className="w-4 h-4" /></Link>
          </motion.div>
        </section>

        {/* Tabs + detail */}
        <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto">
          {/* Tabs */}
          <motion.div {...fadeUp(0)} className="flex gap-2 justify-center flex-wrap mb-14">
            {AGENTS.map(a => (
              <button key={a.id}
                onClick={() => setActive(a.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium font-body transition-all duration-200 border
                  ${active === a.id ? 'text-white' : 'text-white/55 border-white/10 bg-white/[0.04] hover:text-white hover:border-white/20'}`}
                style={active === a.id ? { background:`${a.color}20`, borderColor:`${a.color}50`, color:a.color } : {}}>
                <span>{a.icon}</span>{a.name}
              </button>
            ))}
          </motion.div>

          {/* Detail */}
          {ag && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-start">
              <motion.div key={ag.id} initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.35 }}
                className="relative rounded-3xl overflow-hidden aspect-[4/3]">
                <img src={ag.img} alt={ag.name} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0" style={{ background:'linear-gradient(to top, rgba(5,8,20,.55), transparent 50%)' }} />
              </motion.div>

              <motion.div key={ag.id + '-copy'} initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.38 }}>
                <h2 className="font-display font-bold tracking-tight mb-2" style={{ fontSize:'clamp(28px,3.5vw,46px)', color:ag.color }}>{ag.name}</h2>
                <p className="font-body text-lg text-white/48 mb-4">{ag.tagline}</p>
                <p className="font-body text-sm text-white/58 leading-relaxed mb-7">{ag.desc}</p>

                <p className="text-[10px] font-mono uppercase tracking-[0.13em] text-white/32 mb-3">What it handles</p>
                <div className="flex flex-wrap gap-2 mb-7">
                  {ag.tasks.map(t => (
                    <span key={t} className="text-xs font-body px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.09] text-white/62">{t}</span>
                  ))}
                </div>

                <p className="text-[10px] font-mono uppercase tracking-[0.13em] text-white/32 mb-3">How it works</p>
                <div className="flex flex-col gap-2 mb-8">
                  {ag.workflow.map((w, i) => (
                    <div key={i} className="flex gap-3 items-start p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                      style={{ borderColor:`${ag.color}18` }}>
                      <span className="text-[10px] font-mono text-white/28 mt-0.5 flex-shrink-0">0{i+1}</span>
                      <span className="text-xs font-body text-white/62 leading-relaxed">{w}</span>
                    </div>
                  ))}
                </div>

                <Link to="/waitlist" className="btn-primary" style={{ background:`linear-gradient(135deg, ${ag.color}, #C86DD7)` }}>
                  Activate {ag.name} <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          )}
        </section>

        {/* How it works */}
        <section className="py-20 px-4 border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <motion.span {...fadeUp(0)} className="kicker mb-4 inline-block">The system</motion.span>
              <motion.h2 {...fadeUp(0.07)} className="font-display font-bold tracking-tight text-white" style={{ fontSize:'clamp(28px,3.5vw,48px)' }}>
                Agents that <span className="text-gradient">work together.</span>
              </motion.h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {HOW.map((h, i) => (
                <motion.div key={h.n} {...fadeUp(i * 0.07)} className="glass rounded-2xl p-6 hover:border-white/14 transition-colors duration-300">
                  <p className="font-mono text-[10px] text-white/26 tracking-widest mb-3">{h.n}</p>
                  <p className="font-display font-semibold text-sm text-white mb-2">{h.title}</p>
                  <p className="font-body text-xs text-white/48 leading-relaxed">{h.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 text-center px-4">
          <motion.h2 {...fadeUp(0)} className="font-display font-bold tracking-tight text-white mb-4" style={{ fontSize:'clamp(32px,4vw,56px)' }}>
            Stop doing it<br /><span className="text-gradient">alone.</span>
          </motion.h2>
          <motion.p {...fadeUp(0.08)} className="font-body text-white/52 mb-8 text-lg">Your agents are ready. Your ecosystem is waiting.</motion.p>
          <motion.div {...fadeUp(0.14)}>
            <Link to="/waitlist" className="btn-primary">Join the waitlist <ArrowRight className="w-4 h-4" /></Link>
          </motion.div>
        </section>

        <Footer />
      </div>
    </>
  )
}
