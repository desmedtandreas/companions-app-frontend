import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MapsSearch from './pages/MapsSearch'
import Company from './pages/Company'
import CompanySearch from './pages/CompanySearch'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/company/:enterprise_number" element={<Company />} />
        <Route path="/maps-search" element={<MapsSearch />} />
        <Route path="/company-search" element={<CompanySearch />} />
      </Routes>
    </Router>
  )
}

export default App