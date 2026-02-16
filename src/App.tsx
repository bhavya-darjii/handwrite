import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Onboarding/Login";
import Signup from "./Onboarding/Signup";
import ProtectedRoute from "./ProtectedRoute";

// Main App Components
import Dashboard from "./Dashboard/Dashboard";
import PaymentWall from "./Payment Wall/PaymentWall";
import Checkout from "./Payment Wall/Checkout";
import Success from "./Payment Wall/Success";
import NewProject from "./New Project/New-Project";

// Legal Pages Imports
import Disclaimer from "./Legal Pages/Disclaimer";
import PrivacyPolicy from "./Legal Pages/PrivacyPolicy";
import TermsOfUse from "./Legal Pages/TermsOfUse";
import ContactUs from "./Legal Pages/ContactUs";
import AdminDashboard from "./AdminDashboard/AdminDashboard";


function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Legal Pages (Accessible to everyone) */}
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/contact-us" element={<ContactUs />} />

        {/* --- Protected Routes (Login Required) --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/payment-wall" element={<PaymentWall />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<Success />} />
          <Route path="/new-project" element={<NewProject />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Catch-all redirect to login */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;