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
import Order       from './pages/Order'
import Checkout    from './pages/Checkout'
import OSPage from './pages/os'
import YATI from './pages/yAtI'
import PrivacyPolicy from './pages/PrivacyPolicy'
import CookiePolicy from './pages/CookiePolicy'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { AuthProvider, RequireAuth } from './lib/auth'
import { CartProvider } from './lib/cart'
import CartDrawer from './components/CartDrawer'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
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
          <Route path="/order"        element={<Order />}       />
          <Route path="/checkout"     element={<Checkout />}    />
          <Route path="/yAtI" element={<YATI />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
           <Route path="/founder-os" element={<OSPage />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
        </Routes>
        <CartDrawer />
      </CartProvider>
    </AuthProvider>
  )
}
