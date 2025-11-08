// App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Onboarding/Login";
import Signup from "./Onboarding/Signup";
import ProtectedRoute from "./ProtectedRoute";
// Placeholder for your main app components (replace with actual imports as you build)
import Dashboard from "./Dashboard"; // Example: Import your main dashboard or home component
import PaymentWall from "./Payment Wall/PaymentWall";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} /> {/* Main protected route */}
          <Route path="/dashboard" element={<Dashboard />} /> {/* Example protected route */}
          <Route path="/payment-wall" element={<PaymentWall />} />
        </Route>
        {/* Catch-all redirect to login if not authenticated */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;