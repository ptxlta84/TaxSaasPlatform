import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Container from '../Layout/Container';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button 
        className="w-full py-6 text-left flex justify-between items-center focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {question}
        </span>
        {isOpen ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
};

const FAQSection = () => {
  const faqs = [
    {
      q: "Is my data safe with TaxSaas?",
      a: "Absolutely. We use bank-grade 128-bit SSL encryption. We are ISO 27001 certified and strictly adhere to data privacy laws. Your data is only used for tax filing and nothing else."
    },
    {
      q: "Can I file taxes if I have multiple Form 16s?",
      a: "Yes! Our intelligent system detects multiple employers and consolidates your income automatically when you upload your Form 16 PDFs."
    },
    {
      q: "Which regime is better for me?",
      a: "It depends on your deductions. Use our free calculator (above) to compare. Generally, if you have deductions > ₹3.75 Lakhs, Old Regime works better. Otherwise, New Regime is simpler."
    },
    {
      q: "Do you support GST filing for freelancers?",
      a: "Yes, we have a dedicated module for freelancers and small businesses to generate invoices, track expenses, and file GSTR-1 & GSTR-3B seamlessly."
    },
    {
      q: "What if I get a notice from the IT Department?",
      a: "Don't worry. Our 'Notice Management' service (available in Pro plan) helps you understand and reply to notices with expert CA assistance."
    }
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800/30">
      <Container>
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Can't find the answer you're looking for? Chat with our support team.
            </p>
            <button className="text-primary-600 font-semibold hover:text-primary-700 underline">
              Visit Help Center
            </button>
          </div>
          
          <div className="md:col-span-8">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default FAQSection;
