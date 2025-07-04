import { Link } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <>
      <div className="page-container">
        <div className="landing-hero">
          <div className="hero-content">
            <div className="hero-badge">
              <span>✨ AI-Powered Learning</span>
            </div>
            <h1 className="hero-title">
              Master Any Topic
              <span className="hero-title-accent"> in Minutes</span>
            </h1>
            <p className="hero-tagline">
              Transform your learning experience with instant AI-generated lessons and interactive quizzes. 
              From coding to history, get personalized content tailored to your needs.
            </p>
            <div className="hero-actions">
              <Link to="/learn" className="hero-cta primary">Start Learning</Link>
              <Link to="/learn" className="hero-cta secondary">Try Demo</Link>
            </div>

          </div>
          <div className="hero-illustration">
            <div className="hero-illustration-container">
              {/* Modern AI Learning Illustration */}
              <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="hero-svg">
                {/* Background gradient circle */}
                <defs>
                  <radialGradient id="heroGradient" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0%" stopColor="#f8fafc"/>
                    <stop offset="50%" stopColor="#e0e7ff"/>
                    <stop offset="100%" stopColor="#a1c4fd"/>
                  </radialGradient>
                  <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff"/>
                    <stop offset="100%" stopColor="#f1f5ff"/>
                  </linearGradient>
                </defs>
                
                {/* Animated background elements */}
                <circle cx="120" cy="120" r="100" fill="url(#heroGradient)" opacity="0.8" className="hero-bg"/>
                
                {/* Floating particles */}
                <circle cx="60" cy="80" r="3" fill="#a1c4fd" opacity="0.6" className="particle particle-1"/>
                <circle cx="180" cy="60" r="2" fill="#7f53ac" opacity="0.5" className="particle particle-2"/>
                <circle cx="200" cy="160" r="2.5" fill="#4f8cff" opacity="0.4" className="particle particle-3"/>
                <circle cx="40" cy="180" r="2" fill="#bdb4fe" opacity="0.5" className="particle particle-4"/>
                
                {/* Main book */}
                <rect x="80" y="90" width="80" height="60" rx="12" fill="url(#bookGradient)" className="hero-book"/>
                <rect x="90" y="105" width="60" height="8" rx="4" fill="#e0e7ff" className="hero-line"/>
                <rect x="90" y="120" width="45" height="8" rx="4" fill="#e0e7ff" className="hero-line"/>
                <rect x="90" y="135" width="35" height="8" rx="4" fill="#e0e7ff" className="hero-line"/>
                
                {/* AI brain/neural network */}
                <circle cx="160" cy="160" r="15" fill="#a1c4fd" opacity="0.8" className="hero-brain"/>
                <circle cx="155" cy="155" r="3" fill="#ffffff"/>
                <circle cx="165" cy="155" r="3" fill="#ffffff"/>
                <circle cx="155" cy="165" r="3" fill="#ffffff"/>
                <circle cx="165" cy="165" r="3" fill="#ffffff"/>
                <circle cx="160" cy="160" r="3" fill="#ffffff"/>
                
                {/* Connection lines */}
                <path d="M155 155 L165 155 L165 165 L155 165 L155 155" stroke="#ffffff" strokeWidth="1" opacity="0.6" className="hero-connections"/>
                <path d="M160 160 L155 155" stroke="#ffffff" strokeWidth="1" opacity="0.6" className="hero-connections"/>
                <path d="M160 160 L165 155" stroke="#ffffff" strokeWidth="1" opacity="0.6" className="hero-connections"/>
                <path d="M160 160 L155 165" stroke="#ffffff" strokeWidth="1" opacity="0.6" className="hero-connections"/>
                <path d="M160 160 L165 165" stroke="#ffffff" strokeWidth="1" opacity="0.6" className="hero-connections"/>
              </svg>
            </div>
          </div>
        </div>
        
        <section className="landing-benefits">
          <div className="section-header">
            <h2 className="section-title">Why Choose AI Learning Assistant?</h2>
            <p className="section-subtitle">Experience the future of personalized education</p>
          </div>
          <div className="benefit-cards">
            <div className="benefit-card">
              <div className="benefit-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#4f8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(79,140,255,0.1)"/>
                </svg>
              </div>
              <h3>Lightning Fast</h3>
              <p>Generate comprehensive lessons and quizzes in seconds, not hours.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4" stroke="#7f53ac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(127,83,172,0.1)"/>
                  <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z" stroke="#7f53ac" strokeWidth="2" fill="rgba(127,83,172,0.1)"/>
                  <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z" stroke="#7f53ac" strokeWidth="2" fill="rgba(127,83,172,0.1)"/>
                </svg>
              </div>
              <h3>Smart Assessment</h3>
              <p>Test your knowledge with AI-generated quizzes that adapt to your learning level.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="#a1c4fd" strokeWidth="2" fill="rgba(161,196,253,0.1)"/>
                  <circle cx="12" cy="12" r="3" stroke="#a1c4fd" strokeWidth="2" fill="rgba(161,196,253,0.2)"/>
                </svg>
              </div>
              <h3>Personalized Learning</h3>
              <p>Focus on what matters to you with customized content and pacing.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#bdb4fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(189,180,254,0.1)"/>
                </svg>
              </div>
              <h3>Beautiful Experience</h3>
              <p>Enjoy a distraction-free, visually stunning learning environment.</p>
            </div>
          </div>
        </section>
        
        <section className="landing-how">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Three simple steps to transform your learning</p>
          </div>
          <div className="how-steps">
            <div className="how-step">
              <div className="step-number">1</div>
              <div className="how-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="#4f8cff" strokeWidth="2" fill="rgba(79,140,255,0.1)"/>
                  <path d="m21 21-4.35-4.35" stroke="#4f8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Choose Your Topic</h3>
              <p>Enter any subject you want to learn about - from quantum physics to cooking.</p>
            </div>
            <div className="how-step">
              <div className="step-number">2</div>
              <div className="how-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="#7f53ac" strokeWidth="2" fill="rgba(127,83,172,0.1)"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="#7f53ac" strokeWidth="2" fill="rgba(127,83,172,0.1)"/>
                </svg>
              </div>
              <h3>Get Your Lesson</h3>
              <p>Receive a comprehensive, AI-generated lesson tailored to your topic.</p>
            </div>
            <div className="how-step">
              <div className="step-number">3</div>
              <div className="how-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17l-5-5" stroke="#a1c4fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(161,196,253,0.1)"/>
                </svg>
              </div>
              <h3>Test & Learn</h3>
              <p>Take an interactive quiz to reinforce your understanding and track progress.</p>
            </div>
          </div>
        </section>
        
        <section className="landing-cta">
          <div className="cta-content">
            <h2>Ready to Transform Your Learning?</h2>
            <p>Join thousands of learners who are already mastering new topics with AI</p>
            <Link to="/learn" className="hero-cta primary">Start Your Learning Journey</Link>
          </div>
        </section>
      </div>
    </>
  );
} 