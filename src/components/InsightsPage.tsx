
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface InsightsPageProps {
  user: any;
  trips: any[];
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ user, trips }) => {
  const { t: allTranslations } = useLanguage();
  const t = allTranslations.insights;

  return (
    <div className="bg-[#f7f9fb] dark:bg-[#000000] min-h-screen pb-32">
      <header className="p-6 pb-2">
        <h1 className="text-3xl font-extrabold text-[#495770] dark:text-slate-100 tracking-tight">{t.title}</h1>
        <p className="text-slate-500 text-sm mt-1">{t.subtitle}</p>
      </header>

      <main className="px-6 py-4 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#1a1d24] p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.totalSpent}</p>
            <p className="text-2xl font-extrabold text-[#495770] dark:text-slate-100">1.240€</p>
          </div>
          <div className="bg-white dark:bg-[#1a1d24] p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.personalSpent}</p>
            <p className="text-2xl font-extrabold text-[#004ccc]">412€</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#004ccc] to-[#616f89] p-6 rounded-3xl text-white shadow-lg">
          <div className="flex justify-between items-start">
             <div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">{t.savings}</p>
                <p className="text-3xl font-bold">85,20€</p>
             </div>
             <span className="material-symbols-outlined text-white/30 text-4xl">trending_down</span>
          </div>
          <p className="text-xs text-white/80 mt-4 leading-relaxed">
            {t.savingsDesc}
          </p>
        </div>

        {/* Charts Mock */}
        <div className="bg-white dark:bg-[#1a1d24] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-[#495770] dark:text-slate-100 mb-4">{t.summary}</h3>
          <div className="space-y-4">
            {[
              { label: t.categories.food, val: 65, color: 'bg-[#004ccc]' },
              { label: t.categories.transport, val: 25, color: 'bg-[#616f89]' },
              { label: t.categories.leisure, val: 10, color: 'bg-slate-200' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5 px-0.5">
                   <span>{item.label}</span>
                   <span>{item.val}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div className={`${item.color} h-full rounded-full transition-all duration-1000`} style={{width: `${item.val}%`}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
