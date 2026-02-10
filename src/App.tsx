import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { VehicleDetails } from './pages/VehicleDetails';
import { VehicleEdit } from './pages/VehicleEdit';
import { Owners } from './pages/Owners';
import { Login } from './pages/Login';
import { ConfirmEmail } from './pages/ConfirmEmail';
import { TestLP } from './pages/TestLP';
import { FipeDealsPage } from './pages/FipeDealsPage';
import { LeadsPage } from './pages/LeadsPage';
import { WhatsAppGenerator } from './pages/WhatsAppGenerator';
import { VehicleProvider } from './context/VehicleContext';
import { AuthProvider } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Toaster } from 'sonner';


function App() {
  return (
    <AuthProvider>
      <VehicleProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/carros-baratos" element={<FipeDealsPage />} />
            <Route path="/vehicle/:id" element={<VehicleDetails />} />
            <Route path="/controle" element={<Login />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            <Route path="/test-lp" element={<TestLP />} />

            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="owners" element={<Owners />} />
              <Route path="vehicle/new" element={<VehicleEdit />} />
              <Route path="vehicle/:id/edit" element={<VehicleEdit />} />
              <Route path="whatsapp-generator" element={<WhatsAppGenerator />} />
            </Route>
          </Routes>
          <Toaster position="top-right" richColors />
        </Router>
      </VehicleProvider>
    </AuthProvider>
  );
}

export default App;
