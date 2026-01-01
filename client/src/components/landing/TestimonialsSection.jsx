import React from 'react';
import { Star } from 'lucide-react';
import Container from '../Layout/Container';

const TestimonialsSection = () => {
  const reviews = [
    {
      name: 'Amit Verma',
      role: 'IT Professional, Bangalore',
      text: 'I used to pay a CA ₹2000 just to file a simple return. TaxSaas did it automatically from my Form 16 in 5 minutes. Best part? The recommendation to switch to Old Regime saved me ₹12k!',
      rating: 5
    },
    {
      name: 'Sarah D\'Souza',
      role: 'Freelance Designer',
      text: 'For freelancers, taxes are a headache. This platform suggested expenses I didn\'t identify and handled my GST invoicing perfectly. The dark mode is a nice touch for late night work!',
      rating: 5
    },
    {
      name: 'Rajesh Kumar & Co.',
      role: 'Chartered Accountants',
      text: 'We switched our entire firm to TaxSaas Pro. The bulk filing utility helps us crush the July 31st deadline without the usual overtime stress. Highly recommended for practice scaling.',
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">India Trusts TaxSaas</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">Join 5 Million taxpayers who file with confidence</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl relative">
              {/* Quote icon/decoration */}
              <div className="text-6xl text-primary-200 dark:text-gray-700 absolute top-4 left-6 font-serif opacity-50">"</div>
              
              <div className="relative z-10">
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, r) => (
                    <Star key={r} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed">
                  {review.text}
                </p>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{review.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{review.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default TestimonialsSection;
