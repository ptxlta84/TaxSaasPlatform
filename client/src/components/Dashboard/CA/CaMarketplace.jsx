import React, { useState } from 'react';
import CaProfileCard from './CaProfileCard';
import BookingModal from './BookingModal';
import { Search, Filter } from 'lucide-react';

const CaMarketplace = () => {
  const [selectedCa, setSelectedCa] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock Data
  const caList = [
      // ... (keep existing data)
    {
      id: 1,
      name: "CA Rahul Sharma",
      image: "", 
      rating: 4.9,
      reviews: 120,
      specializations: ["Income Tax", "GST Filing", "Startup Advisory"],
      experience: "8+ Years",
      location: "Mumbai",
      price: 999
    },
    {
      id: 2,
      name: "CA Priya Verma",
      image: "",
      rating: 4.8,
      reviews: 85,
      specializations: ["Tax Audit", "Company Registration", "NRI Tax"],
      experience: "5+ Years",
      location: "Bangalore",
      price: 1499
    },
    {
      id: 3,
      name: "CA Amit Patel",
      image: "",
      rating: 4.7,
      reviews: 210,
      specializations: ["GST Compliance", "Bookkeeping", "Litigation"],
      experience: "12+ Years",
      location: "Ahmedabad",
      price: 799
    }
  ];

  const handleBook = (ca) => {
    setSelectedCa(ca);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto">
       <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
         <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Talk to an Expert</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Book a 1-on-1 consultation with top Chartered Accountants.</p>
         </div>
         
         <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search by name or skill..." 
                    className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            <button className="p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                <Filter size={20} />
            </button>
         </div>
       </div>

       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {caList.map(ca => (
            <CaProfileCard key={ca.id} ca={ca} onBook={handleBook} />
          ))}
       </div>

       <BookingModal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         ca={selectedCa} 
       />
    </div>
  );
};

export default CaMarketplace;
