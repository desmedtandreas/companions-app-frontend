import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/ToastProvider';
import Home from './pages/Home'
import MapsSearch from './pages/MapsSearch'
import Company from './pages/Company'
import CompanySearch from './pages/CompanySearch'
import List from './pages/List'
import ListOverview from './pages/ListOverview';


function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/company/:enterprise_number" element={<Company />} />
          <Route path="/maps-search" element={<MapsSearch />} />
          <Route path="/company-search" element={<CompanySearch />} />
          <Route path="/list/:slug" element={<List />} />
          <Route path="/list-overview" element={<ListOverview />} />
        </Routes>
      </Router>
    </ToastProvider>
  )
}

export default App