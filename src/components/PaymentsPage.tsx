
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const PaymentsPage: React.FC = () => {
  const { t: allTranslations } = useLanguage();
  const t = allTranslations.payments;

  return (
    <div className="bg-[#f7f9fb] min-h-screen pb-32">
      <header className="p-6 pb-2">
        <h1 className="text-3xl font-extrabold text-[#495770] tracking-tight">{t.title}</h1>
        <p className="text-slate-500 text-sm mt-1">{t.subtitle}</p>
      </header>

      <main className="px-6 py-4 space-y-6">
        <section>
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-2 mb-4">{t.members}</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {['Pablo', 'Ana', 'Carlos', 'Elena'].map(name => (
              <div key={name} className="flex-shrink-0 flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-[#004ccc] font-bold text-lg">
                  {name[0]}
                </div>
                <span className="text-xs font-bold text-slate-500">{name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-2">{t.balances}</h2>
          <div className="space-y-3">
            {[
              { debtor: 'Pablo', creditor: 'Ana', amount: 45.50 },
              { debtor: 'Carlos', creditor: 'Elena', amount: 12.80 },
            ].map((pay, i) => (
              <div key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-[#f2f4f6] flex items-center justify-center text-[#495770]">
                      <span className="material-symbols-outlined text-[20px]">send</span>
                   </div>
                   <div>
                      <p className="text-sm font-bold text-[#495770]">{pay.debtor} <span className="text-slate-400 font-normal">{t.owes}</span> {pay.creditor}</p>
                      <p className="text-xs text-slate-400 font-medium">{t.suggestedSettlement}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-lg font-extrabold text-[#ba1a1a]">{pay.amount.toFixed(2)}€</p>
                   <button className="text-[10px] font-extrabold text-[#004ccc] uppercase tracking-wider mt-1">{t.settle}</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
