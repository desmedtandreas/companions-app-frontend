import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MapsSearch from './pages/MapsSearch'
import Company from './pages/Company'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/company" element={<Company />} />
        <Route path="/maps-search" element={<MapsSearch />} />
      </Routes>
    </Router>
  )
}

export default App