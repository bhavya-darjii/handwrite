import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Aurora from "../Aurora Background/Aurora";
import "./LegalPages.css"; // Assuming this is where the CSS is located

export default function ContactUs() {
  const navigate = useNavigate();
  
  // Form State
  const [reason, setReason] = useState("General Inquiry");
  const [message, setMessage] = useState("");

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();

    const recipient = "handwrite.omega@gmail.com";
    const subject = encodeURIComponent(`Handwrite Support: ${reason}`);
    const body = encodeURIComponent(
      `Reason: ${reason}\n\nMessage:\n${message}\n\n----------------\nSent from Handwrite App Contact Form`
    );

    // This opens the default mail client with fields pre-filled
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="legal-page">
      {/* Background */}
      <div className="legal-aurora-wrapper">
        <Aurora
          colorStops={["#ffcc00", "#FFffff", "#2969ff"]}
          blend={0.5}
          speed={0.5}
        />
      </div>
      <div className="legal-overlay" />

      {/* Main Content */}
      <motion.div
        className="legal-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>

        <h1 className="legal-title">Contact Us</h1>
        <p className="legal-text">
          We are here to help. Fill out the form below to open your email client
          and send us a message directly.
        </p>

        <form className="contact-form-wrapper" onSubmit={handleSendEmail}>
          {/* Reason Dropdown */}
          <div>
            <label className="contact-label">Reason for Contact</label>
            <select
              className="contact-select"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="General Inquiry">General Inquiry</option>
              <option value="Technical Issue">Technical Issue</option>
              <option value="Handwriting Request Update">
                Handwriting Request Update
              </option>
              <option value="Feedback / Feature Request">
                Feedback / Feature Request
              </option>
              <option value="Business / Partnership">
                Business / Partnership
              </option>
            </select>
          </div>

          {/* Message Textbox */}
          <div>
            <label className="contact-label">Your Message</label>
            <textarea
              className="contact-textarea"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="contact-btn-submit">
            Send Email
          </button>
        </form>
      </motion.div>
    </div>
  );
}