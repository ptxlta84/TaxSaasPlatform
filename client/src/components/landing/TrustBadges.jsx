import React from 'react';
import { ShieldCheck, Lock, Award, Server } from 'lucide-react';
import Container from '../Layout/Container';

const TrustBadges = () => {
  const features = [
    { icon: Lock, title: '128-bit Encryption', desc: 'Bank-grade security' },
    { icon: Server, title: 'Direct Integration', desc: 'Official ERI License' },
    { icon: ShieldCheck, title: 'ISO 27001', desc: 'Certified Platform' },
    { icon: Award, title: 'Expert Reviewed', desc: 'Verified by CAs' },
  ];

  const partners = [
    { name: 'Income Tax Department', type: 'Official Partner' },
    { name: 'GST Network', type: 'GSP Connected' },
    { name: 'DigiLocker', type: 'Verified Docs' },
    { name: 'Major Banks', type: 'Netbanking' }
  ];

  return (
    <section className="py-12 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
      <Container>
        {/* Security Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 justify-center md:justify-start">
              <div className="text-green-600 bg-green-50 dark:bg-green-900/30 p-2 rounded-lg">
                <f.icon size={20} />
              </div>
              <div>
                <div className="font-bold text-sm text-gray-900 dark:text-white">{f.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Integration Partners */}
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Integrations & Partners</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {partners.map((p, i) => (
              <div key={i} className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-full border border-gray-200 dark:border-gray-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default TrustBadges;
