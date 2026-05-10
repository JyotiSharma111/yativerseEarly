import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Homepage    from './pages/Homepage'
import Wearables   from './pages/Wearables'
import Agents      from './pages/Agents'
import Journey     from './pages/Journey'
import Community   from './pages/Community'
import Waitlist    from './pages/Waitlist'
import SignalRing  from './pages/SignalRing'
import EarlyAccess from './pages/EarlyAccess'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/"             element={<Homepage />}    />
        <Route path="/wearables"    element={<Wearables />}   />
        <Route path="/agents"       element={<Agents />}      />
        <Route path="/journey"      element={<Journey />}     />
        <Route path="/community"    element={<Community />}   />
        <Route path="/waitlist"     element={<Waitlist />}    />
        <Route path="/signal-ring"  element={<SignalRing />}  />
        <Route path="/early-access" element={<EarlyAccess />} />
      </Routes>
    </>
  )
}
