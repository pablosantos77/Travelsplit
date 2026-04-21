import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { User } from 'firebase/auth';

interface PaymentsPageProps {
  user: User | null;
  trips: any[];
  onOpenScanModal?: () => void;
}

interface Debt {
  name: string;
  concept: string;
  amount: number;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({ user, trips, onOpenScanModal }) => {
  const { t: allTranslations } = useLanguage();
  const t = allTranslations.payments;
  const [activeTab, setActiveTab] = useState<'pedir' | 'pagar'>('pedir');
  
  const [debtsToMe, setDebtsToMe] = useState<Debt[]>([]);
  const [debtsIOwe, setDebtsIOwe] = useState<Debt[]>([]);

  useEffect(() => {
    let mounted = true;
    const calculateDebts = async () => {
      if (!user?.email) return;

      const toMe: Debt[] = [];
      const iOwe: Debt[] = [];

      for (const trip of trips) {
        try {
          const snap = await getDocs(collection(db, 'trips', trip.id, 'expenses'));
          const expenses = snap.docs.map(d => d.data());
          
          let total = 0;
          expenses.forEach(e => {
             total += (typeof e.amount === 'number') ? e.amount : parseFloat(e.amount || '0');
          });

          if (total === 0) continue;

          const members = trip.participants || [];
          if (members.length === 0) continue;

          const share = total / members.length;
          
          const paidMap: Record<string, number> = {};
          members.forEach((m: string) => paidMap[m] = 0);
          
          expenses.forEach(e => {
            if (paidMap[e.paidBy] !== undefined) {
              paidMap[e.paidBy] += (typeof e.amount === 'number') ? e.amount : parseFloat(e.amount || '0');
            }
          });

          const balances: Record<string, number> = {};
          members.forEach((m: string) => {
            balances[m] = paidMap[m] - share;
          });

          const creditors = members.map((m: string) => ({ email: m, balance: balances[m] })).filter((m: any) => m.balance > 0.01);
          const debtors = members.map((m: string) => ({ email: m, balance: balances[m] })).filter((m: any) => m.balance < -0.01);

          creditors.sort((a: any, b: any) => b.balance - a.balance);
          debtors.sort((a: any, b: any) => a.balance - b.balance);

          for (let c of creditors) {
            for (let d of debtors) {
              if (c.balance > 0.01 && d.balance < -0.01) {
                const amount = Math.min(c.balance, Math.abs(d.balance));
                c.balance -= amount;
                d.balance += amount;

                if (c.email === user.email) {
                  toMe.push({ name: d.email.split('@')[0], concept: trip.destination || 'Viaje', amount });
                }
                if (d.email === user.email) {
                  iOwe.push({ name: c.email.split('@')[0], concept: trip.destination || 'Viaje', amount });
                }
              }
            }
          }
        } catch (err) {
          console.error('Error fetching expenses for trip:', trip.id, err);
        }
      }

      if (mounted) {
        setDebtsToMe(toMe);
        setDebtsIOwe(iOwe);
      }
    };

    calculateDebts();

    return () => {
      mounted = false;
    };
  }, [user, trips]);

  const totalToMe = debtsToMe.reduce((acc, curr) => acc + curr.amount, 0);
  const totalIOwe = debtsIOwe.reduce((acc, curr) => acc + curr.amount, 0);

  const getAvatarColor = (char: string) => {
     const variants = ['bg-primary-fixed text-on-primary-fixed', 'bg-tertiary-fixed text-on-tertiary-fixed', 'bg-error-container text-on-error-container'];
     const code = char.charCodeAt(0) || 0;
     return variants[code % variants.length];
  };

  return (
    <div className="bg-background font-body text-on-background antialiased min-h-screen flex flex-col relative pb-32">
      {/* Ambient Gradient Background */}
      <div className="fixed inset-0 z-[0] opacity-40 mix-blend-multiply bg-gradient-to-br from-tertiary-fixed-dim via-primary-fixed to-secondary-fixed blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col flex-1">
        {/* TopAppBar */}
        <header className="sticky top-0 z-50 bg-[#f7f9fb]/80 backdrop-blur-xl">
          <div className="flex justify-between items-center px-6 py-4">
            <button className="w-10 h-10 rounded-full overflow-hidden bg-surface-container shadow-[0px_12px_32px_rgba(25,28,30,0.06)] hover:bg-slate-200/50 transition-colors active:scale-95 duration-150 flex items-center justify-center">
               <span className="material-symbols-outlined text-[#495770]">person</span>
            </button>
            <h1 className="font-headline font-bold tracking-tight text-3xl text-[#495770]">{t.title}</h1>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200/50 transition-colors active:scale-95 duration-150 text-[#495770]">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        {/* Segmented Control */}
        <div className="px-6 pt-2 pb-6">
          <div className="bg-surface-container-high/80 p-1.5 rounded-[20px] flex gap-2 w-full backdrop-blur-md shadow-sm">
            <button 
                onClick={() => setActiveTab('pedir')}
                className={`flex-1 font-semibold py-3 px-6 rounded-2xl transition-all ${activeTab === 'pedir' ? 'bg-surface-container-lowest text-on-surface shadow-[0px_4px_16px_rgba(25,28,30,0.08)]' : 'text-on-surface-variant hover:bg-surface-container-lowest/50'}`}>
              {t.tabs?.ask || 'Pedir'}
            </button>
            <button 
                onClick={() => setActiveTab('pagar')}
                className={`flex-1 font-semibold py-3 px-6 rounded-2xl transition-all ${activeTab === 'pagar' ? 'bg-surface-container-lowest text-on-surface shadow-[0px_4px_16px_rgba(25,28,30,0.08)]' : 'text-on-surface-variant hover:bg-surface-container-lowest/50'}`}>
              {t.tabs?.pay || 'Pagar'}
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        {activeTab === 'pedir' && (
          <div className="flex-1 flex flex-col gap-6 px-6 pb-32">
            {/* Smart Scan Action */}
            <button onClick={onOpenScanModal} className="w-full group relative overflow-hidden rounded-[32px] bg-gradient-to-br from-secondary to-primary-container p-[2px] transition-transform active:scale-[0.98] shadow-[0px_16px_32px_rgba(0,76,204,0.15)]">
              <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-white/10 backdrop-blur-sm w-full h-full rounded-[30px] p-8 flex flex-col items-center justify-center gap-4 outline outline-1 outline-white/20">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-white text-3xl">document_scanner</span>
                </div>
                <div className="text-center">
                  <h2 className="text-white font-bold text-xl tracking-tight mb-1 flex items-center justify-center gap-2">
                    <span className="text-sm">✦</span> {t.scanTitle}
                  </h2>
                  <p className="text-white/80 text-sm font-medium leading-tight">{t.scanDesc}</p>
                </div>
              </div>
            </button>

            {/* AI Hint */}
            <div className="flex items-center gap-3 bg-secondary-container/20 px-4 py-3 rounded-[20px]">
              <span className="material-symbols-outlined text-secondary text-lg">auto_awesome</span>
              <p className="text-xs font-medium text-secondary leading-snug">{t.scanAIHint}</p>
            </div>

            {/* Secondary Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center gap-3 bg-surface-container-lowest p-6 rounded-[24px] shadow-[0px_8px_24px_rgba(25,28,30,0.04)] hover:bg-surface-container-low transition-colors">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">add_photo_alternate</span>
                </div>
                <span className="font-semibold text-on-surface text-sm">{t.uploadCapture}</span>
              </button>
              
              <button className="flex flex-col items-center justify-center gap-3 bg-surface-container-lowest p-6 rounded-[24px] shadow-[0px_8px_24px_rgba(25,28,30,0.04)] hover:bg-surface-container-low transition-colors">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">edit_document</span>
                </div>
                <span className="font-semibold text-on-surface text-sm">{t.manualEntry}</span>
              </button>
            </div>

            {/* Preview Pendiente */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-on-surface text-lg">{t.pendingCollection}</h3>
                {debtsToMe.length > 0 && <span className="text-sm font-medium text-secondary cursor-pointer hover:underline">{t.viewAll}</span>}
              </div>
              <div className="flex flex-col gap-3">
                {debtsToMe.length === 0 ? (
                  <p className="text-sm font-medium text-on-surface-variant italic opacity-70 p-4 pb-12">No hay nadie que te deba dinero.</p>
                ) : debtsToMe.map((debt, idx) => (
                  <div key={idx} className="bg-surface-container-lowest p-4 rounded-2xl shadow-[0px_4px_16px_rgba(25,28,30,0.04)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarColor(debt.name.toUpperCase())}`}>
                         {debt.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface text-sm">{debt.concept}</p>
                        <p className="text-xs text-on-surface-variant">De {debt.name.charAt(0).toUpperCase() + debt.name.slice(1)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-on-surface">{debt.amount.toFixed(2)}€</span>
                      <span className="text-[10px] font-semibold text-outline tracking-wider uppercase">Reclamar</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section Pagar (Debts list) */}
        {activeTab === 'pagar' && (
           <div className="px-6 flex flex-col gap-6 pb-32">
              {debtsIOwe.length === 0 ? (
                  <p className="text-sm font-medium text-on-surface-variant italic opacity-70 p-4">¡Genial! No debes dinero a nadie.</p>
              ) : debtsIOwe.map((debt, idx) => (
                <div key={idx} className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_12px_32px_rgba(25,28,30,0.06)]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full overflow-hidden flex flex-col items-center justify-center text-xl font-bold ${getAvatarColor(debt.name.toUpperCase())}`}>
                        {debt.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-headline font-semibold text-on-surface text-base tracking-tight">{debt.name.charAt(0).toUpperCase() + debt.name.slice(1)}</h3>
                        <p className="font-body text-sm text-on-surface-variant">{debt.concept}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-headline font-bold text-xl text-error tracking-tight">{debt.amount.toFixed(2)}€</span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-surface-container-low text-primary hover:bg-surface-container transition-colors font-label font-semibold text-sm">
                      <span className="material-symbols-outlined text-[18px]">payments</span>
                      {t.payCash}
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-secondary to-primary-container text-white shadow-[0px_8px_16px_rgba(0,76,204,0.15)] hover:opacity-90 transition-opacity font-label font-semibold text-sm">
                      {t.payBizum}
                    </button>
                  </div>
                </div>
              ))}
           </div>
        )}

        {/* Sticky Total Banner */}
        <div className="fixed bottom-[100px] left-0 w-full px-6 z-40 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto bg-surface-container-lowest/90 backdrop-blur-xl rounded-xl p-5 shadow-[0px_12px_32px_rgba(25,28,30,0.1)] border border-outline-variant/15 flex justify-between items-center">
            <span className="font-label text-sm font-medium text-on-surface-variant uppercase tracking-wide">{t.totalToSettle}</span>
            <span className="font-headline font-bold text-2xl tracking-tight text-secondary">
              {activeTab === 'pedir' ? totalToMe.toFixed(2) : totalIOwe.toFixed(2)}€
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
