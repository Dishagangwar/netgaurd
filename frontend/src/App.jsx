import { useEffect, useState } from 'react'
import LandingPage from './pages/LandingPage'
import PredictPage from './pages/PredictPage'

const ROUTES = ['home', 'predict']

const readHash = () => {
  const raw = window.location.hash.replace(/^#\/?/, '')
  return ROUTES.includes(raw) ? raw : 'home'
}

/**
 * Hash based routing, so the browser back button works and a page can be
 * linked directly (#/predict) without pulling in a router dependency.
 */
function App() {
  const [route, setRoute] = useState(readHash)

  useEffect(() => {
    const onHashChange = () => {
      setRoute(readHash())
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = (next) => {
    if (next === route) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    window.location.hash = `#/${next}`
  }

  if (route === 'predict') return <PredictPage onNavigate={navigate} />
  return <LandingPage onNavigate={navigate} />
}

export default App
