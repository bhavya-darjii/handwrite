import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Aurora from "../Aurora Background/Aurora";
import "./LegalPages.css";
import "../Aurora Background/Aurora.css";

export default function TermsOfUse() {
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

        <h1 className="legal-title">Terms of Use</h1>
        <span className="legal-date">Last Updated: January 2026</span>

        <h2 className="legal-section-title">Welcome</h2>
        <p className="legal-text">
          Welcome to Handwrite (“we”, “our”, “us”). By accessing or using our website or app (“Service”), you agree to these Terms of Use.
        </p>

        <h2 className="legal-section-title">1. Purpose</h2>
        <p className="legal-text">
          Our Service allows users to digitize and stylize their own handwriting for personal, educational, or creative uses.
        </p>

        <h2 className="legal-section-title">2. User Responsibilities</h2>
        <p className="legal-text">
          You agree not to use the Service for any unlawful purpose. In particular, you may not use generated handwriting to falsify documents, impersonate others, or violate academic integrity policies of your institution.
        </p>

        <h2 className="legal-section-title">3. Ownership</h2>
        <p className="legal-text">
          You retain ownership of your handwriting data and uploaded content. We only process it to generate your handwriting font or visual output.
        </p>

        <h2 className="legal-section-title">4. Payments & Credits</h2>
        <p className="legal-text">
          All fees are shown clearly before checkout. Page credits are issued upon successful payment.
          <br /><br />
          • <strong>Every 1 generated page deducts 5 credits</strong> from your account.<br />
          • If you wish to <strong>change or update your handwriting style</strong> in the future, this service
            deducts <strong>30 credits</strong> from your account.<br />
          • Refunds are handled according to our Refund & Correction Policy listed below.
        </p>

        <h2 className="legal-section-title">5. Handwriting Quality & Correction Policy</h2>
        <p className="legal-text">
          After we deliver your handwriting output, you have <strong>24 hours</strong> to review it.
          If the handwriting does not closely match your real handwriting:
        </p>

        <p className="legal-text">
          • You may request corrections <strong>up to 2 times</strong> at no additional credit cost.<br />
          • If after two correction attempts you still feel the handwriting does not match your style, we will
            issue a <strong>full refund within 5 working days</strong>.<br />
          • Correction requests after 24 hours may require paying the <strong>30 - page credit handwriting update fee</strong>.
        </p>

        <h2 className="legal-section-title">6. Limitation of Liability</h2>
        <p className="legal-text">
          The Service is provided “as is.” We are not responsible for misuse of the handwriting outputs.
        </p>

        <h2 className="legal-section-title">7. Termination</h2>
        <p className="legal-text">
          We may suspend or terminate accounts for abuse, fraud, or violation of these Terms.
        </p>

        <h2 className="legal-section-title">8. Contact</h2>
        <p className="legal-text">
          For questions, email us at <strong>support@yourdomain.com</strong>.
        </p>
      </motion.div>
    </div>
  );
}
