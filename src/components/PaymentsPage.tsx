import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
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
  tripId: string;
  creditorEmail: string; 
  debtorEmail: string;   
  avatarUrl?: string;
  isMock?: boolean;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({ user, trips, onOpenScanModal }) => {
  const { t: allTranslations } = useLanguage();
  const t = allTranslations.payments;
  
  const [activeTab, setActiveTab] = useState<'pedir' | 'pagar'>('pagar');
  
  const [debtsToMe, setDebtsToMe] = useState<Debt[]>([]);
  const [debtsIOwe, setDebtsIOwe] = useState<Debt[]>([]);
  
  const [selectedDebtIndex, setSelectedDebtIndex] = useState<number>(0);
  const [isPayingManual, setIsPayingManual] = useState<boolean>(false);
  const [manualAmount, setManualAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // MOCK DATA from Stitch screen to ensure the page is never empty and looks premium
  const mockDebtsIOwe: Debt[] = [
    {
      name: 'Carlos D.',
      concept: 'Paris Trip - Dinner',
      amount: 45.00,
      tripId: 'mock-1',
      creditorEmail: 'carlos@example.com',
      debtorEmail: 'me@example.com',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNR9BVtXREhlAQqHsH6Ks4Z_bPXCn_IbrbmAuwh5NOL2LFz6aVSgODjI2QrQAGHoJk7PIB2wqz9kEG6H-0JaAUFmGYkMsrfM-mjPYv4CdkMBB3bIsN12c9bAdETirfwkYxtMXeYLTAQbHadwh8gGSKiCUBGk_qfBlAwUDEJiD9MP-8YGjbO__rTpjnsmAN16xacqMeYcbDrZRcCMdLh-bjqkhMrCsMXn8CVJXw2t5Lmn2hRd2LIRXrVqnXtY3tExK4waQuvFIdKZ0',
      isMock: true
    },
    {
      name: 'Elena M.',
      concept: 'Paris Trip - Taxi',
      amount: 40.50,
      tripId: 'mock-2',
      creditorEmail: 'elena@example.com',
      debtorEmail: 'me@example.com',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDz2apUElF_8UFCmBXSriXeEcaxA04lmLlSzxzFucpBF8zM8WSP4H2vqJliIdVPg-ULiQplC5_7ig-qgtAmZqulj4iMMuIl8TXGUS5508Hwkcm4LUVD0j1gwegV_C6N5xzX8I0JbcMbn62NX3aOoF4HID6-KIbxygFBOYsDp291k8GQZlF7HN0UlvQtdyfix9mKSIvfzVzUIPQhlAMf27bfSVY98jMJmeRaK42kYTzMFpm1f9oGYcHxtHQHi7p4JMKTnSKWwwfJWH4',
      isMock: true
    }
  ];

  const calculateDebts = async () => {
    if (!user?.email) return;

    const toMe: Debt[] = [];
    const iOwe: Debt[] = [];

    for (const trip of trips) {
      try {
        const snap = await getDocs(collection(db, 'trips', trip.id, 'expenses'));
        const expenses = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
        
        let total = 0;
        expenses.forEach(e => {
           if (e.type !== 'payment') {
              total += (typeof e.amount === 'number') ? e.amount : parseFloat(e.amount || '0');
           }
        });

        const members = trip.participants || [];
        if (members.length === 0) continue;

        const share = total / members.length;
        
        const paidMap: Record<string, number> = {};
        members.forEach((m: string) => paidMap[m] = 0);
        
        expenses.forEach(e => {
          const amt = (typeof e.amount === 'number') ? e.amount : parseFloat(e.amount || '0');
          if (e.type === 'payment') {
            if (paidMap[e.paidBy] !== undefined) paidMap[e.paidBy] += amt;
            if (paidMap[e.paidTo] !== undefined) paidMap[e.paidTo] -= amt;
          } else {
            if (paidMap[e.paidBy] !== undefined) {
              paidMap[e.paidBy] += amt;
            }
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

              const debtObj: Debt = { 
                name: '', 
                concept: trip.destination || 'Viaje', 
                amount,
                tripId: trip.id,
                creditorEmail: c.email,
                debtorEmail: d.email
              };

              if (c.email === user.email) {
                toMe.push({ ...debtObj, name: d.email.split('@')[0] });
              }
              if (d.email === user.email) {
                iOwe.push({ ...debtObj, name: c.email.split('@')[0] });
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching expenses for trip:', trip.id, err);
      }
    }

    setDebtsToMe(toMe);
    setDebtsIOwe(iOwe);
  };

  useEffect(() => {
    calculateDebts();
  }, [user, trips]);

  const handleRegisterPayment = async () => {
    const combinedDebts = [...debtsIOwe, ...mockDebtsIOwe];
    const safeIndex = combinedDebts[selectedDebtIndex] ? selectedDebtIndex : 0;
    const currentDebt = combinedDebts[safeIndex];
    if (!currentDebt || !user?.email || isSubmitting || currentDebt.isMock) return;

    const val = manualAmount ? parseFloat(manualAmount) : currentDebt.amount;
    if (isNaN(val) || val <= 0) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'trips', currentDebt.tripId, 'expenses'), {
        type: 'payment',
        description: `Pago a ${currentDebt.name}`,
        amount: val,
        paidBy: user.email,
        paidTo: currentDebt.creditorEmail,
        createdAt: new Date().toISOString()
      });
      
      setIsPayingManual(false);
      setManualAmount('');
      await calculateDebts();
    } catch (err) {
      console.error("Error registering payment:", err);
      alert("Error al registrar el pago.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalToMe = debtsToMe.reduce((acc, curr) => acc + curr.amount, 0);
  const totalIOwe = debtsIOwe.reduce((acc, curr) => acc + curr.amount, 0) + mockDebtsIOwe.reduce((a, b) => a + b.amount, 0);

  const getAvatarColor = (char: string) => {
     const variants = ['bg-primary-fixed text-on-primary-fixed', 'bg-tertiary-fixed text-on-tertiary-fixed', 'bg-error-container text-on-error-container'];
     const code = char.charCodeAt(0) || 0;
     return variants[code % variants.length];
  };

  const combinedDebtsIOwe = [...debtsIOwe, ...mockDebtsIOwe];
  const safeDebtIndex = combinedDebtsIOwe[selectedDebtIndex] ? selectedDebtIndex : 0;
  const currentDebt = combinedDebtsIOwe[safeDebtIndex];

  return (
    <div className="bg-background font-body text-on-background antialiased min-h-screen flex flex-col relative pb-32">
      {/* Ambient Gradient Background */}
      <div className="fixed inset-0 z-[0] opacity-40 mix-blend-multiply bg-gradient-to-br from-tertiary-fixed-dim via-primary-fixed to-secondary-fixed blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col flex-1">
        
        {/* HEADER IDENTICAL TO STITCH */}
        <header className="sticky top-0 z-50 bg-[#f7f9fb] dark:bg-[#000000]/80 backdrop-blur-xl border-b border-[#f2f4f6]">
          <div className="flex justify-between items-center px-6 h-16">
            <button className="text-[#495770] dark:text-slate-100 hover:bg-slate-200/50 transition-colors rounded-full p-2 active:scale-95 duration-200">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="font-headline font-black tracking-tighter text-2xl text-[#004ccc]">
               {t.hubTitle}
            </h1>
            <div className="w-9 h-9 rounded-full overflow-hidden bg-[#d6e3ff] flex items-center justify-center border border-white shadow-sm">
               <span className="material-symbols-outlined text-[#0d1c32] text-xl">person</span>
            </div>
          </div>
        </header>

        {/* Segmented Control */}
        <div className="px-6 pt-6 pb-6">
          <div className="bg-[#e6e8ea]/50 p-1.5 rounded-[24px] flex gap-2 w-full backdrop-blur-sm">
            <button 
                onClick={() => setActiveTab('pedir')}
                className={`flex-1 font-bold py-4 px-6 rounded-[20px] transition-all text-sm uppercase tracking-wider ${activeTab === 'pedir' ? 'bg-white dark:bg-[#1a1d24] text-[#004ccc] shadow-[0px_8px_16px_rgba(0,0,0,0.05)]' : 'text-[#495770] dark:text-slate-100/60 hover:bg-white dark:bg-[#1a1d24]/50'}`}>
              {t.tabs.ask}
            </button>
            <button 
                onClick={() => {
                  setActiveTab('pagar');
                  setIsPayingManual(false);
                }}
                className={`flex-1 font-bold py-4 px-6 rounded-[20px] transition-all text-sm uppercase tracking-wider ${activeTab === 'pagar' ? 'bg-white dark:bg-[#1a1d24] text-[#004ccc] shadow-[0px_8px_16px_rgba(0,0,0,0.05)]' : 'text-[#495770] dark:text-slate-100/60 hover:bg-white dark:bg-[#1a1d24]/50'}`}>
              {t.tabs.pay}
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        {activeTab === 'pedir' && (
          <div className="flex-1 flex flex-col gap-6 px-6 pb-32">
            {/* Smart Scan Action */}
            <button onClick={onOpenScanModal} className="w-full group relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#004ccc] to-[#616f89] p-[2px] transition-transform active:scale-[0.98] shadow-[0px_16px_32px_rgba(0,76,204,0.15)]">
              <div className="absolute inset-0 bg-white dark:bg-[#1a1d24]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-white dark:bg-[#1a1d24]/10 backdrop-blur-sm w-full h-full rounded-[30px] p-8 flex flex-col items-center justify-center gap-4 outline outline-1 outline-white/20">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-[#1a1d24]/20 backdrop-blur-md flex items-center justify-center shadow-inner text-white">
                  <span className="material-symbols-outlined text-3xl">document_scanner</span>
                </div>
                <div className="text-center">
                  <h2 className="text-white font-bold text-xl tracking-tight mb-1 flex items-center justify-center gap-2">
                    <span className="text-sm">✦</span> {t.scanTitle}
                  </h2>
                  <p className="text-white/80 text-sm font-medium leading-tight">{t.scanFast}</p>
                </div>
              </div>
            </button>

            {/* AI Hint */}
            <div className="flex items-center gap-3 bg-[#e0e3e5]/50 px-4 py-3 rounded-[20px] border border-white/50">
              <span className="material-symbols-outlined text-[#004ccc] text-lg">auto_awesome</span>
              <p className="text-xs font-medium text-[#424656] dark:text-slate-300 leading-snug">{t.scanAIHint}</p>
            </div>

            {/* Secondary Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#1a1d24] p-6 rounded-[24px] shadow-[0px_8px_24px_rgba(25,28,30,0.04)] dark:shadow-none border border-[#eceef0]">
                <div className="w-12 h-12 rounded-full bg-[#f2f4f6] dark:bg-[#2e3440] flex items-center justify-center text-[#004ccc]">
                  <span className="material-symbols-outlined">add_photo_alternate</span>
                </div>
                <span className="font-bold text-[#495770] dark:text-slate-100 text-xs">{t.uploadCapture}</span>
              </button>
              
              <button className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#1a1d24] p-6 rounded-[24px] shadow-[0px_8px_24px_rgba(25,28,30,0.04)] dark:shadow-none border border-[#eceef0]">
                <div className="w-12 h-12 rounded-full bg-[#f2f4f6] dark:bg-[#2e3440] flex items-center justify-center text-[#004ccc]">
                  <span className="material-symbols-outlined">edit_document</span>
                </div>
                <span className="font-bold text-[#495770] dark:text-slate-100 text-xs">{t.manualEntry}</span>
              </button>
            </div>
          </div>
        )}

        {/* Section Pagar (Payment Requests Hub - STITCH EXACT UI) */}
        {activeTab === 'pagar' && (
           <div className="px-6 flex flex-col gap-8 pb-32 pt-2 animate-in fade-in duration-500">
              {/* Total Pending Card */}
              <section className="bg-white dark:bg-[#1a1d24] rounded-[32px] p-8 shadow-[0px_24px_48px_rgba(25,28,30,0.08)] dark:shadow-none relative overflow-hidden ring-1 ring-[#f2f4f6]">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#004ccc] to-[#616f89]"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[#424656] dark:text-slate-300 font-bold text-xs tracking-widest uppercase mb-2 opacity-60">{t.totalPending}</p>
                    <h2 className="text-5xl font-black tracking-tighter text-[#191c1e] dark:text-white">€{totalIOwe.toFixed(2)}</h2>
                  </div>
                  <div className="bg-[#d6e3ff] p-2.5 rounded-2xl text-[#004ccc] shadow-sm">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                  </div>
                </div>
                <div className="mt-8 flex items-center gap-2 text-[#004ccc] text-[11px] font-black tracking-widest uppercase bg-[#f2f4f6] dark:bg-[#2e3440] w-fit px-3 py-1.5 rounded-full">
                  <span className="material-symbols-outlined text-[14px]">magic_button</span>
                  {t.aiSummary}
                </div>
              </section>

              {/* Pending Requests List */}
              <section className="space-y-5">
                <div className="flex items-center justify-between px-2 text-[#191c1e] dark:text-white font-black tracking-tight text-xl">
                    {t.pendingRequests}
                </div>
                <div className="bg-[#f2f4f6] dark:bg-[#2e3440]/50 rounded-[32px] p-2.5 space-y-2.5">
                   {combinedDebtsIOwe.map((debt, idx) => {
                      const isSelected = idx === selectedDebtIndex;
                      return (
                         <div 
                            key={idx} 
                            onClick={() => {
                              setSelectedDebtIndex(idx);
                              setIsPayingManual(false);
                            }}
                            className={`cursor-pointer transition-all flex items-center justify-between p-5 ${isSelected ? 'bg-white dark:bg-[#1a1d24] rounded-[24px] shadow-[0px_12px_32px_rgba(25,28,30,0.06)] dark:shadow-none border border-[#eceef0] relative overflow-hidden' : 'bg-transparent rounded-[24px] opacity-50 hover:opacity-100 hover:bg-white dark:bg-[#1a1d24]/40'}`}
                         >
                            {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#004ccc] rounded-l-[24px]"></div>}
                            <div className="flex items-center space-x-4">
                              {debt.avatarUrl ? (
                                <img src={debt.avatarUrl} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" alt={debt.name} />
                              ) : (
                                <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center text-xl font-black ${getAvatarColor(debt.name.toUpperCase())}`}>
                                  {debt.name[0]?.toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-black text-[#191c1e] dark:text-white tracking-tight">{debt.name}</p>
                                <p className="text-xs font-semibold text-[#424656] dark:text-slate-300 opacity-60 uppercase tracking-wide">{debt.concept}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-black tracking-tighter ${isSelected ? 'text-[#004ccc] text-2xl' : 'text-[#191c1e] dark:text-white text-xl'}`}>€{debt.amount.toFixed(2)}</p>
                            </div>
                         </div>
                      );
                   })}
                </div>
              </section>

              {/* Payment Methods */}
              {currentDebt && (
                <section className="animate-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-[10px] font-black text-[#424656] dark:text-slate-300 tracking-widest uppercase mb-4 px-2 opacity-60">{t.selectMethod}</h3>
                  
                  {!isPayingManual ? (
                    <div className="grid grid-cols-3 gap-4">
                      {/* Cash */}
                      <button 
                        onClick={() => setIsPayingManual(true)}
                        className="bg-white dark:bg-[#1a1d24] rounded-[24px] p-5 flex flex-col items-center justify-center gap-3 border border-[#eceef0] hover:translate-y-[-2px] transition-all shadow-sm active:scale-95"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#f2f4f6] dark:bg-[#2e3440] flex items-center justify-center text-[#191c1e] dark:text-white">
                          <span className="material-symbols-outlined text-2xl">payments</span>
                        </div>
                        <span className="text-[11px] font-black text-[#191c1e] dark:text-white uppercase tracking-wider">{t.payCash}</span>
                      </button>

                      {/* Bizum */}
                      <button className="bg-[#004ccc] rounded-[24px] p-5 flex flex-col items-center justify-center gap-3 shadow-[0px_16px_32px_rgba(0,76,204,0.2)] hover:translate-y-[-2px] transition-all ring-4 ring-[#004ccc]/10 active:scale-95 text-white">
                         <div className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center font-black italic text-lg">
                           B
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-wider">Bizum</span>
                      </button>

                      {/* Card */}
                      <button className="bg-white dark:bg-[#1a1d24] rounded-[24px] p-5 flex flex-col items-center justify-center gap-3 border border-[#eceef0] hover:translate-y-[-2px] transition-all shadow-sm active:scale-95">
                        <div className="w-12 h-12 rounded-full bg-[#f2f4f6] dark:bg-[#2e3440] flex items-center justify-center text-[#191c1e] dark:text-white">
                          <span className="material-symbols-outlined text-2xl">credit_card</span>
                        </div>
                        <span className="text-[11px] font-black text-[#191c1e] dark:text-white uppercase tracking-wider">{t.payCard}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-[#1a1d24] p-7 rounded-[32px] space-y-6 border border-[#eceef0] shadow-[0px_24px_48px_rgba(0,0,0,0.06)] scale-in-center">
                      <p className="text-sm font-black text-[#191c1e] dark:text-white text-center uppercase tracking-widest">{t.registerManual}</p>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#004ccc] font-black text-2xl">€</span>
                        <input 
                          type="number"
                          min="0"
                          step="0.01"
                          value={manualAmount}
                          onChange={(e) => setManualAmount(e.target.value)}
                          placeholder={currentDebt.amount.toFixed(2)}
                          className="w-full bg-[#f2f4f6] dark:bg-[#2e3440] border-none rounded-2xl py-6 pl-12 pr-6 text-[#191c1e] dark:text-white font-black text-3xl outline-none ring-2 ring-transparent focus:ring-[#004ccc] transition-all caret-[#004ccc]"
                        />
                      </div>
                      <div className="flex gap-4">
                        <button 
                          disabled={isSubmitting}
                          onClick={() => {
                            setIsPayingManual(false);
                            setManualAmount('');
                          }} 
                          className="flex-1 bg-[#eceef0] py-4 rounded-2xl text-xs font-black text-[#424656] dark:text-slate-300 uppercase tracking-widest active:scale-95 transition-all"
                        >
                          {allTranslations.modals.cancel}
                        </button>
                        <button 
                          disabled={isSubmitting || currentDebt.isMock}
                          onClick={handleRegisterPayment}
                          className="flex-1 bg-gradient-to-r from-[#004ccc] to-[#616f89] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-[0px_16px_32px_rgba(0,76,204,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? '...' : (currentDebt.isMock ? t.demoMode : t.settleNow)}
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              )}
              
              {/* Floating Action Button (Exact Stitch Style) */}
              {!isPayingManual && currentDebt && (
                <div className="fixed bottom-28 left-0 w-full px-6 z-40 flex justify-center pointer-events-none">
                  <button 
                    onClick={() => setIsPayingManual(true)}
                    className="pointer-events-auto bg-gradient-to-r from-[#004ccc] to-[#616f89] text-white font-black text-xs uppercase tracking-[0.2em] w-full max-w-sm py-5 rounded-[24px] shadow-[0px_24px_48px_rgba(0,76,204,0.3)] hover:opacity-90 transition-all flex items-center justify-center space-x-3 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-xl">lock</span>
                    <span>{t.settleNow} €{currentDebt.amount.toFixed(2)}</span>
                  </button>
                </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
};
