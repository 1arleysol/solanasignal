import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import AgentConfig from './pages/AgentConfig'
import History from './pages/History'
import OnChain from './pages/OnChain'
import { AgentProvider } from './context/AgentContext'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AgentProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="agent" element={<AgentConfig />} />
            <Route path="history" element={<History />} />
            <Route path="onchain" element={<OnChain />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AgentProvider>
    </BrowserRouter>
  )
}
