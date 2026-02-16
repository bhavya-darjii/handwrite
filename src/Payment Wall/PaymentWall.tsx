// PaymentWall.tsx
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // IMPORTED NAVIGATE
import Aurora from "../Aurora Background/Aurora";
import "../Aurora Background/Aurora.css";
import "./PaymentWall.css";

const PLANS = [
  {
    id: "small",
    price: 49,
    credits: 10,
    label: "Starter",
    features: [
      "2 Handwritten Pages",
      "Use your own handwriting",
      "Extends page expiry by 30 days",
      "Ideal for quick tasks",
      "Mobile + Desktop Access",
    ],
    recommended: false,
  },
  {
    id: "medium",
    price: 199,
    credits: 50,
    label: "Pro Value",
    features: [
      "25 Handwritten Pages",
      "Personalized handwriting included",
      "Page rollover protection",
      "Faster processing speed",
      "Perfect for weekly assignments & journals",
    ],
    recommended: true,
  },
  {
    id: "large",
    price: 399,
    credits: 120,
    label: "Power User",
    features: [
      "60 Handwritten Pages",
      "Perfect multi-page generation",
      "Extended 30-day rollover on repurchase",
      "Bulk assignment support",
      "Lowest cost per page",
    ],
    recommended: false,
  },
];

export default function PaymentWall() {
  const navigate = useNavigate(); // INITIALIZED NAVIGATE
  const [loading, setLoading] = useState<string | null>(null);
  const [activeCardId, setActiveCardId] = useState("medium");
  const uid = localStorage.getItem("authToken");
  
  const cardsContainerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
    // 1. Force the browser window to the very top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const container = cardsContainerRef.current;
    const isMobile = window.innerWidth <= 768;

    if (container && isMobile) {
      // 2. Observer for active card highlighting
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute("data-id");
              if (id) setActiveCardId(id);
            }
          });
        },
        { root: container, threshold: 0.6 }
      );

      const cards = container.querySelectorAll(".payment-wall-card");
      cards.forEach((card) => observer.observe(card));

      // 3. FIXED MOBILE SCROLL: 
      // We calculate the horizontal center of the recommended card 
      // and scroll the container ONLY, not the whole window.
      setTimeout(() => {
        const recommendedCard = container.querySelector('.payment-wall-card-recommended') as HTMLElement;
        if (recommendedCard) {
          const scrollPos = recommendedCard.offsetLeft - (container.offsetWidth / 2) + (recommendedCard.offsetWidth / 2);
          container.scrollTo({
            left: scrollPos,
            behavior: 'smooth'
          });
        }
      }, 100);

      return () => observer.disconnect();
    }
  }, []);

  const handleSubscribe = async (planId: string) => {
    // Check if User is Logged In
    if (!uid) {
      alert("Please login to proceed with the purchase.");
      return;
    }

    setLoading(planId);
    
    try {
      // Find the selected plan object
      const selectedPlan = PLANS.find((p) => p.id === planId);
      
      // Redirect to Checkout Page passing the plan data
      // We use a slight delay so the user sees the button 'loading' state briefly
      setTimeout(() => {
        setLoading(null);
        navigate("/checkout", { state: { plan: selectedPlan } });
      }, 500);

    } catch (err: any) {
      console.error(err);
      alert("Redirect failed. Please try again.");
      setLoading(null);
    }
  };

  return (
    <div className="payment-wall-page">
      <div className="payment-wall-aurora-wrapper">
        <div className="payment-wall-aurora-container">
          <Aurora
            colorStops={["#ffcc00", "#FFffff", "#2969ff"]}
            blend={0.5}
            amplitude={1.0}
            speed={0.5}
          />
        </div>
      </div>

      <div className="payment-wall-aurora-overlay" />

      <div className="payment-wall-center-wrapper">
        <motion.h2
          className="payment-wall-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          HANDWRITE
        </motion.h2>

        <motion.h1
          className="payment-wall-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Choose Your <span className="payment-wall-highlight">Credit Pack</span>
        </motion.h1>
        
        <motion.div 
          className="payment-wall-info-pill"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span>📄 5 Page Credits = 1 PDF Page</span>
        </motion.div>

        <motion.div
          className="payment-wall-rollover-box"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <p className="payment-wall-rollover-text">
            <strong>Note on Expiry:</strong> Credits are valid for 30 days. <br/>
            Unused credits roll over only if you purchase a new pack before they expire.
          </p>
        </motion.div>

        {/* CARDS CONTAINER */}
        <motion.div
          className="payment-wall-cards-container"
          ref={cardsContainerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {PLANS.map((plan) => {
            const isActive = activeCardId === plan.id;
            
            return (
              <div 
                key={plan.id}
                data-id={plan.id}
                className={`payment-wall-card ${plan.recommended ? 'payment-wall-card-recommended' : ''}`}
              >
                {plan.recommended && <div className="payment-wall-badge">Best Value</div>}
                
                <div className="payment-wall-card-header">
                  <h3 className="payment-wall-plan-label">{plan.label}</h3>
                  <div className="payment-wall-price-row">
                    <span className="payment-wall-currency">₹</span>
                    <span className="payment-wall-amount">{plan.price}</span>
                  </div>
                  <p className="payment-wall-credits-info">{plan.credits} Page Credits</p>
                </div>

                <ul className="payment-wall-benefits-list small-list">
                  {plan.features.map((feat, index) => (
                    <li key={index}>{feat}</li>
                  ))}
                </ul>

                {/* ANIMATED BUTTON */}
                <motion.button 
                  className="payment-wall-subscribe-button"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  layout
                  animate={{
                    backgroundColor: isActive ? "#ffcc00" : "rgba(255, 255, 255, 0.1)",
                    color: isActive ? "#000000" : "#ffffff",
                    borderColor: isActive ? "#ffcc00" : "rgba(255, 255, 255, 0.2)",
                    scale: isActive ? 1.02 : 1,
                    boxShadow: "none" 
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading === plan.id ? "Select Plan" : "Select Plan"}
                </motion.button>
              </div>
            );
          })}
        </motion.div>

        <motion.p
          className="payment-wall-footer-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.5 }}
        >
          Secure payment. Instant activation.
        </motion.p>
      </div>
    </div>
  );
}