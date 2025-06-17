import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ShopPage from './pages/ShopPage';
import AiAnalysisPage from './pages/AiAnalysisPage';
import BillingPage from './pages/BillingPage';
import InventoryPage from './pages/InventoryPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/shop/:shopId" element={<ShopPage />} />
        <Route path="/shop/:shopId/inventory" element={<InventoryPage />} />
        <Route path="/shop/:shopId/analysis" element={<AiAnalysisPage />} />
        <Route path="/shop/:shopId/billing" element={<BillingPage />} />
        <Route path="/shop/:shopId/inventory" element={<InventoryPage />} /> 


      </Routes>
    </Router>
  );
}
