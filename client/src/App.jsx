import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ClientRegistration from './pages/auth/ClientRegistration';
import OTPVerification from './pages/auth/OTPVerification';
import DashboardLayout from './components/Layout/DashboardLayout';
import TaxOverview from './components/Dashboard/TaxOverview';
import IncomeTaxCalculatorDashboard from './components/Dashboard/Tools/IncomeTaxCalculatorDashboard';
import DeductionsTracker from './components/Dashboard/Tools/DeductionsTracker';
import Form16Upload from './components/Dashboard/Tools/Form16Upload';
import ITRWizard from './components/Dashboard/Wizard/ITRWizard';
import CaMarketplace from './components/Dashboard/CA/CaMarketplace';
import MyBookings from './components/Dashboard/CA/MyBookings';
import GSTRegistrationWizard from './components/Dashboard/GST/GSTRegistrationWizard';
import CapitalGains from './components/Dashboard/Tools/CapitalGains';
import HousePropertyCalculator from './components/Dashboard/Tools/HousePropertyCalculator';
import ForeignAssetsReporting from './components/Dashboard/Tools/ForeignAssetsReporting';
import ITR2Wizard from './components/Dashboard/Wizard/ITR2/ITR2Wizard';
import NotificationCenter from './components/Dashboard/Notifications/NotificationCenter';
import NotificationPreferences from './components/Dashboard/Notifications/NotificationPreferences';
import MyDocuments from './pages/MyDocuments'; // [NEW] Using new Proxy-enabled Page
import DocumentDiagnostic from './pages/DocumentDiagnostic'; // [NEW] Diagnostic Page
import TaxValidationDashboard from './components/Dashboard/Admin/TaxValidationDashboard';
import TaxProfile from './components/Dashboard/Profile/TaxProfile';
import TaxEstimator from './components/Dashboard/Tools/TaxEstimator';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/Layout/AdminLayout';
import AdminDashboard from './components/Dashboard/Admin/AdminDashboard';
import UserManagement from './components/Dashboard/Admin/UserManagement';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/register/client" element={<ClientRegistration />} />
          <Route path="/otp-verify" element={<OTPVerification />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
             <Route index element={<TaxOverview />} />
             <Route path="profile" element={<TaxProfile />} />
             <Route path="estimate" element={<TaxEstimator />} />
             <Route path="income-tax" element={<IncomeTaxCalculatorDashboard />} />
             <Route path="deductions" element={<DeductionsTracker />} />
             <Route path="upload-form16" element={<Form16Upload />} />
             <Route path="filing" element={<ITRWizard />} />
             <Route path="ca-services" element={<CaMarketplace />} />
             <Route path="my-bookings" element={<MyBookings />} />
             <Route path="gst-registration" element={<GSTRegistrationWizard />} />
             <Route path="capital-gains" element={<CapitalGains />} />
             <Route path="house-property" element={<HousePropertyCalculator />} />
             <Route path="foreign-assets" element={<ForeignAssetsReporting />} />
             <Route path="itr-2-filing" element={<ITR2Wizard />} />
             <Route path="documents" element={<MyDocuments />} />
             <Route path="diagnostic" element={<DocumentDiagnostic />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
