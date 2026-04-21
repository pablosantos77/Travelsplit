
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface BottomNavProps {
  currentTab: 'trips' | 'payments' | 'insights' | 'settings';
  onChange: (tab: 'trips' | 'payments' | 'insights' | 'settings') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onChange }) => {
  const { t } = useLanguage();
  const labels = t.nav;

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pt-3 pb-8 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl z-50 rounded-t-3xl shadow-[0px_-12px_32px_rgba(25,28,30,0.06)]">
      
      <button 
        onClick={() => onChange('trips')}
        className={`flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-90 px-3 py-1 rounded-xl ${currentTab === 'trips' ? 'text-[#004ccc] bg-[#004ccc]/10 font-bold' : 'text-[#495770] opacity-70 hover:opacity-100'}`}
      >
        <span className="material-symbols-outlined mb-1 text-[24px]">explore</span>
        <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase">{labels.trips}</span>
      </button>

      <button 
        onClick={() => onChange('payments')}
        className={`flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-90 px-3 py-1 rounded-xl ${currentTab === 'payments' ? 'text-[#004ccc] bg-[#004ccc]/10 font-bold' : 'text-[#495770] opacity-70 hover:opacity-100'}`}
      >
        <span className="material-symbols-outlined mb-1 text-[24px]" style={{fontVariationSettings: currentTab === 'payments' ? "'FILL' 1" : "'FILL' 0"}}>payments</span>
        <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase">{labels.payments}</span>
      </button>

      <button 
        onClick={() => onChange('insights')}
        className={`flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-90 px-3 py-1 rounded-xl ${currentTab === 'insights' ? 'text-[#004ccc] bg-[#004ccc]/10 font-bold' : 'text-[#495770] opacity-70 hover:opacity-100'}`}
      >
        <span className="material-symbols-outlined mb-1 text-[24px]">insights</span>
        <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase">{labels.insights}</span>
      </button>

      <button 
        onClick={() => onChange('settings')}
        className={`flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-90 px-3 py-1 rounded-xl ${currentTab === 'settings' ? 'text-[#004ccc] bg-[#004ccc]/10 font-bold' : 'text-[#495770] opacity-70 hover:opacity-100'}`}
      >
        <span className="material-symbols-outlined mb-1 text-[24px]">settings</span>
        <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase">{labels.settings}</span>
      </button>

    </nav>
  );
};
