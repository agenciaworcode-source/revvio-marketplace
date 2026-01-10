import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { VehicleDetails } from './pages/VehicleDetails';
import { VehicleEdit } from './pages/VehicleEdit';
import { Owners } from './pages/Owners';
import { Login } from './pages/Login';
import { TestLP } from './pages/TestLP';
import { VehicleProvider } from './context/VehicleContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Toaster } from 'sonner';
import './App.css';

function App() {
  return (
    <VehicleProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vehicle/:id" element={<VehicleDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/test-lp" element={<TestLP />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="owners" element={<Owners />} />
            <Route path="vehicle/new" element={<VehicleEdit />} />
            <Route path="vehicle/:id/edit" element={<VehicleEdit />} />
          </Route>
        </Routes>
        <Toaster position="top-right" richColors />
      </Router>
    </VehicleProvider>
  );
}

export default App;
