import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
        <Globe size={20} />
        <span className="text-sm font-medium uppercase">{i18n.language.split('-')[0]}</span>
      </button>

      <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 hidden group-hover:block z-50">
        <button
          onClick={() => changeLanguage('en')}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${i18n.language === 'en' ? 'text-blue-600 font-bold' : 'text-gray-700 dark:text-gray-300'}`}
        >
          English
        </button>
        <button
          onClick={() => changeLanguage('hi')}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${i18n.language === 'hi' ? 'text-blue-600 font-bold' : 'text-gray-700 dark:text-gray-300'}`}
        >
          हिन्दी (Hindi)
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
