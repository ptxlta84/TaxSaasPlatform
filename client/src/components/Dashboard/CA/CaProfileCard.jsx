import React from 'react';
import { Star, MapPin, Briefcase, Clock, CheckCircle } from 'lucide-react';
import Button from '../../Button/Button';

const CaProfileCard = ({ ca, onBook }) => {
  const { 
    name, 
    image, 
    rating, 
    reviews, 
    specializations, 
    experience, 
    location, 
    languages,
    price 
  } = ca;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5 flex gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          <img 
            src={image || "https://ui-avatars.com/api/?name=" + name + "&background=random"} 
            alt={name} 
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{name}</h3>
              <div className="flex items-center gap-1 text-sm text-yellow-500 font-medium">
                <Star size={14} fill="currentColor" />
                <span>{rating}</span>
                <span className="text-gray-400 font-normal">({reviews} reviews)</span>
              </div>
            </div>
            <div className="text-right">
                <span className="block text-lg font-bold text-blue-600">₹{price}</span>
                <span className="text-xs text-gray-400">per session</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
             <div className="flex items-center gap-1">
               <Briefcase size={14} />
               <span>{experience} Exp</span>
             </div>
             <div className="flex items-center gap-1">
               <MapPin size={14} />
               <span>{location}</span>
             </div>
          </div>

           {/* Specializations */}
           <div className="mt-3 flex flex-wrap gap-2">
             {specializations.map((spec, index) => (
               <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                 {spec}
               </span>
             ))}
           </div>
        </div>
      </div>

      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
         <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock size={14} /> Next Available: Today, 4 PM
         </span>
         <Button size="sm" onClick={() => onBook(ca)}>
           Book Consultation
         </Button>
      </div>
    </div>
  );
};

export default CaProfileCard;
