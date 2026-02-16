import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Aurora from "../Aurora Background/Aurora";
import "./LegalPages.css";
import "../Aurora Background/Aurora.css";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      <div className="legal-aurora-wrapper">
        <div className="aurora-container">
          <Aurora
            colorStops={["#ffcc00", "#ffffff", "#2969ff"]}
            blend={0.5}
            amplitude={1.0}
            speed={0.5}
          />
        </div>
      </div>
      <div className="legal-overlay" />

      <motion.div
        className="legal-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>

        <h1 className="legal-title">Privacy Policy</h1>
        <span className="legal-date">Last updated: January 2026</span>

        <h2 className="legal-section-title">Introduction</h2>
        <p className="legal-text">
          We value your privacy. This Policy explains what data we collect and how we use it.
        </p>

        <h2 className="legal-section-title">1. Information We Collect</h2>
        <p className="legal-text">
          • Account data (name, email) <br />
          • Uploaded handwriting images or files <br />
          • Generated fonts or documents <br />
          • Payment information processed by third-party gateways (we never store card details)
        </p>

        <h2 className="legal-section-title">2. How We Use Information</h2>
        <p className="legal-text">
          • To generate handwriting fonts and documents <br />
          • To personalize the user experience <br />
          • To communicate important updates
        </p>

        <h2 className="legal-section-title">3. Data Storage and Security</h2>
        <p className="legal-text">
          We use trusted third-party services such as Firebase, PhonePe, and Calligraphr for secure data handling.  
          All files are stored securely and deleted upon user request.
        </p>

        <h2 className="legal-section-title">4. Sharing and Disclosure</h2>
        <p className="legal-text">
          We do not sell or share your personal information with advertisers.  
          We may disclose information only if required by law.
        </p>

        <h2 className="legal-section-title">5. Cookies</h2>
        <p className="legal-text">
          We may use cookies to maintain sessions and improve usability.
        </p>

        {/* <h2 className="legal-section-title">6. Your Rights</h2>
        <p className="legal-text">
          You can request deletion of your account or data at any time by emailing us at  
          <strong> support@yourdomain.com</strong>.
        </p> */}
      </motion.div>
    </div>
  );
}
