import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import ProcessFlow from '../components/landing/ProcessFlow';
import TaxCalculatorIndia from '../components/landing/TaxCalculatorIndia';
import TrustBadges from '../components/landing/TrustBadges';
import CAToolkit from '../components/landing/CAToolkit';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FAQSection from '../components/landing/FAQSection';
import Container from '../components/Layout/Container';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero with User Type Selector */}
      <HeroSection />

      {/* Trust Indicators */}
      <TrustBadges />

      {/* Calculator Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <Container>
          <div className="max-w-5xl mx-auto">
             <TaxCalculatorIndia />
          </div>
        </Container>
      </section>

      {/* 4-Step Process */}
      <ProcessFlow />

      {/* CA Toolkit - For Professionals */}
      <CAToolkit />

      {/* Testimonials */}
      <TestimonialsSection />
      
      {/* FAQ */}
      <FAQSection />

      {/* Simple Footer for now */}
      <footer className="py-8 bg-gray-900 text-gray-400 text-center text-sm border-t border-gray-800">
        <Container>
          <p>&copy; {new Date().getFullYear()} TaxSaas Platform. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-4">
             <a href="#" className="hover:text-white">Privacy Policy</a>
             <a href="#" className="hover:text-white">Terms of Service</a>
             <a href="#" className="hover:text-white">Contact Us</a>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;
