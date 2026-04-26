import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { ShineBorder } from './magicui/ShineBorder';
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

  // Payment method modal: null | 'bizum'
  const [paymentModal, setPaymentModal] = useState<null | 'bizum'>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'bizum'>('bizum');

  // Manual expense entry (Pedir tab)
  const [showManualExpense, setShowManualExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', tripId: '' });
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

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
            if (paidMap[e.paidBy] !== undefined) paidMap[e.paidBy] += amt;
          }
        });

        const balances: Record<string, number> = {};
        members.forEach((m: string) => { balances[m] = paidMap[m] - share; });

        const creditors = members.map((m: string) => ({ email: m, balance: balances[m] })).filter((m: any) => m.balance > 0.01);
        const debtorsArr = members.map((m: string) => ({ email: m, balance: balances[m] })).filter((m: any) => m.balance < -0.01);

        creditors.sort((a: any, b: any) => b.balance - a.balance);
        debtorsArr.sort((a: any, b: any) => a.balance - b.balance);

        for (let c of creditors) {
          for (let d of debtorsArr) {
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

              if (c.email === user.email) toMe.push({ ...debtObj, name: d.email.split('@')[0] });
              if (d.email === user.email) iOwe.push({ ...debtObj, name: c.email.split('@')[0] });
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

  useEffect(() => { calculateDebts(); }, [user, trips]);

  const handleRegisterPayment = async (method: 'cash' | 'card' = 'cash') => {
    const combinedDebts = [...debtsIOwe, ...mockDebtsIOwe];
    const currentDebt = combinedDebts[selectedDebtIndex] ?? combinedDebts[0];
    if (!currentDebt || !user?.email || isSubmitting || currentDebt.isMock) return;

    const val = manualAmount ? parseFloat(manualAmount) : currentDebt.amount;
    if (isNaN(val) || val <= 0) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'trips', currentDebt.tripId, 'expenses'), {
        type: 'payment',
        description: `Pago a ${currentDebt.name} (${method === 'card' ? 'tarjeta' : 'efectivo'})`,
        amount: val,
        paidBy: user.email,
        paidTo: currentDebt.creditorEmail,
        createdAt: new Date().toISOString()
      });

      setIsPayingManual(false);
      setManualAmount('');
      setPaymentModal(null);
      showToast(`✓ €${val.toFixed(2)} liquidado con ${currentDebt.name}`);
      await calculateDebts();
    } catch (err) {
      console.error('Error registering payment:', err);
      showToast('Error al registrar el pago', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBizumOpen = () => {
    const combinedDebts = [...debtsIOwe, ...mockDebtsIOwe];
    const currentDebt = combinedDebts[selectedDebtIndex] ?? combinedDebts[0];
    if (!currentDebt) return;
    const amount = currentDebt.amount.toFixed(2);
    // Attempt Bizum deep link (Spain)
    try {
      window.location.href = `bizum://transfer?amount=${amount}`;
    } catch (_) {}
    // After deep link attempt, show manual confirmation fallback
    setTimeout(() => {
      setPaymentModal(null);
      setIsPayingManual(true);
    }, 1500);
  };

  const handleAddManualExpense = async () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.tripId || !user?.email) return;
    const val = parseFloat(newExpense.amount);
    if (isNaN(val) || val <= 0) return;

    setIsAddingExpense(true);
    try {
      await addDoc(collection(db, 'trips', newExpense.tripId, 'expenses'), {
        description: newExpense.description,
        amount: val,
        paidBy: user.email,
        currency: '€',
        createdAt: new Date().toISOString()
      });
      setNewExpense({ description: '', amount: '', tripId: '' });
      setShowManualExpense(false);
      showToast('✓ Gasto añadido correctamente');
    } catch (err) {
      console.error('Error adding expense:', err);
      showToast('Error al añadir el gasto', 'error');
    } finally {
      setIsAddingExpense(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Trigger OCR scan via parent modal or handle here
    onOpenScanModal?.();
    e.target.value = '';
  };

  const totalIOwe = debtsIOwe.reduce((acc, curr) => acc + curr.amount, 0) + mockDebtsIOwe.reduce((a, b) => a + b.amount, 0);
  const combinedDebtsIOwe = [...debtsIOwe, ...mockDebtsIOwe];
  const safeDebtIndex = combinedDebtsIOwe[selectedDebtIndex] ? selectedDebtIndex : 0;
  const currentDebt = combinedDebtsIOwe[safeDebtIndex];

  const getAvatarColor = (char: string) => {
    const variants = ['bg-primary-fixed text-on-primary-fixed', 'bg-tertiary-fixed text-on-tertiary-fixed', 'bg-error-container text-on-error-container'];
    return variants[(char.charCodeAt(0) || 0) % variants.length];
  };

  const userInitial = user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  return (
    <div className="bg-background font-body text-on-background antialiased min-h-screen flex flex-col relative pb-32">
      {/* Ambient Gradient */}
      <div className="fixed inset-0 z-[0] opacity-40 mix-blend-multiply bg-gradient-to-br from-tertiary-fixed-dim via-primary-fixed to-secondary-fixed blur-3xl pointer-events-none" />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[500] px-6 py-3.5 rounded-2xl text-white text-sm font-black shadow-2xl transition-all animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-2.5 max-w-xs text-center ${toast.type === 'success' ? 'bg-[#004ccc]' : 'bg-[#ba1a1a]'}`}>
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toast.msg}
        </div>
      )}

      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col flex-1">

        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#f7f9fb] dark:bg-[#000000]/80 backdrop-blur-xl border-b border-[#f2f4f6] dark:border-white/5">
          <div className="flex justify-between items-center px-6 h-16">
            <button className="text-[#495770] dark:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors rounded-full p-2 active:scale-95 duration-200">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="font-headline font-black tracking-tighter text-2xl text-[#004ccc]">
              {t.hubTitle}
            </h1>
            <div className="w-9 h-9 rounded-full overflow-hidden bg-[#d6e3ff] dark:bg-[#004ccc]/30 flex items-center justify-center border-2 border-white dark:border-white/10 shadow-sm">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={userInitial} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#004ccc] dark:text-blue-300 font-black text-sm">{userInitial}</span>
              )}
            </div>
          </div>
        </header>

        {/* Segmented Control */}
        <div className="px-6 pt-6 pb-4">
          <div className="bg-[#e6e8ea]/50 dark:bg-white/5 p-1.5 rounded-[24px] flex gap-2 w-full backdrop-blur-sm">
            {(['pedir', 'pagar'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setIsPayingManual(false); }}
                className={`flex-1 font-bold py-4 px-6 rounded-[20px] transition-all text-sm uppercase tracking-wider ${
                  activeTab === tab
                    ? 'bg-white dark:bg-[#1a1d24] text-[#004ccc] shadow-[0px_8px_16px_rgba(0,0,0,0.06)]'
                    : 'text-[#495770] dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                {tab === 'pedir' ? t.tabs.ask : t.tabs.pay}
              </button>
            ))}
          </div>
        </div>

        {/* ── PEDIR TAB ── */}
        {activeTab === 'pedir' && (
          <div className="flex-1 flex flex-col gap-5 px-6 pb-32 animate-in fade-in duration-300">

            {/* Smart Scan CTA */}
            <button onClick={onOpenScanModal} className="w-full group relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#004ccc] to-[#616f89] p-[2px] transition-transform active:scale-[0.98] shadow-[0px_16px_32px_rgba(0,76,204,0.18)]">
              <div className="relative bg-gradient-to-br from-[#004ccc] to-[#616f89] w-full h-full rounded-[30px] p-8 flex flex-col items-center justify-center gap-4">
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors rounded-[30px]" />
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-white">document_scanner</span>
                </div>
                <div className="text-center">
                  <h2 className="text-white font-black text-xl tracking-tight mb-1 flex items-center justify-center gap-2">
                    <span className="text-sm opacity-70">✦</span> {t.scanTitle}
                  </h2>
                  <p className="text-white/80 text-sm font-semibold">{t.scanFast}</p>
                </div>
              </div>
            </button>

            {/* AI Hint */}
            <div className="flex items-center gap-3 bg-[#e8edf5]/60 dark:bg-white/5 px-4 py-3 rounded-[20px] border border-[#d6e3ff]/50 dark:border-white/10">
              <span className="material-symbols-outlined text-[#004ccc] text-lg">auto_awesome</span>
              <p className="text-xs font-semibold text-[#424656] dark:text-slate-300 leading-snug">{t.scanAIHint}</p>
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-4">
              {/* Upload Capture */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#1a1d24] p-6 rounded-[24px] shadow-[0px_8px_24px_rgba(25,28,30,0.05)] dark:shadow-none border border-[#eceef0] dark:border-white/5 hover:translate-y-[-2px] active:scale-95 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-[#f2f4f6] dark:bg-[#2e3440] flex items-center justify-center text-[#004ccc]">
                  <span className="material-symbols-outlined">add_photo_alternate</span>
                </div>
                <span className="font-black text-[#495770] dark:text-slate-100 text-xs uppercase tracking-wider">{t.uploadCapture}</span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

              {/* Manual Entry */}
              <button
                onClick={() => setShowManualExpense(true)}
                className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#1a1d24] p-6 rounded-[24px] shadow-[0px_8px_24px_rgba(25,28,30,0.05)] dark:shadow-none border border-[#eceef0] dark:border-white/5 hover:translate-y-[-2px] active:scale-95 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-[#f2f4f6] dark:bg-[#2e3440] flex items-center justify-center text-[#004ccc]">
                  <span className="material-symbols-outlined">edit_document</span>
                </div>
                <span className="font-black text-[#495770] dark:text-slate-100 text-xs uppercase tracking-wider">{t.manualEntry}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── PAGAR TAB ── */}
        {activeTab === 'pagar' && (
          <div className="px-6 flex flex-col gap-7 pb-32 pt-2 animate-in fade-in duration-300">

            {/* Total Pending Card — Premium with ShineBorder */}
            <section className="relative bg-white dark:bg-[#1a1d24] rounded-[32px] p-8 shadow-[0px_24px_48px_rgba(25,28,30,0.08)] dark:shadow-none overflow-hidden">
              <ShineBorder borderRadius={32} borderWidth={2} duration={10} shineColor={["#004ccc", "#a5c0ff", "#616f89"]} />
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[#424656] dark:text-slate-400 font-black text-[10px] tracking-widest uppercase mb-2">{t.totalPending}</p>
                    <h2 className="text-5xl font-black tracking-tighter text-[#191c1e] dark:text-white">€{totalIOwe.toFixed(2)}</h2>
                  </div>
                  <div className="bg-[#d6e3ff] dark:bg-[#004ccc]/20 p-3 rounded-2xl text-[#004ccc] shadow-sm">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-[#004ccc] text-[11px] font-black tracking-widest uppercase bg-[#f0f4ff] dark:bg-[#004ccc]/15 w-fit px-3 py-1.5 rounded-full">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  {t.aiSummary}
                </div>
              </div>
            </section>

            {/* Pending List */}
            <section className="space-y-4">
              <p className="text-[#191c1e] dark:text-white font-black tracking-tight text-xl px-1">{t.pendingRequests}</p>

              {combinedDebtsIOwe.length === 0 ? (
                <div className="bg-white dark:bg-[#1a1d24] rounded-[28px] p-10 text-center border-2 border-dashed border-[#eceef0] dark:border-white/10 flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-[#f0f4ff] dark:bg-[#004ccc]/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#004ccc] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                  <p className="text-[#191c1e] dark:text-white font-black text-base">¡Todo al día!</p>
                  <p className="text-[#424656] dark:text-slate-400 text-sm font-medium">No tienes deudas pendientes</p>
                </div>
              ) : (
                <div className="bg-[#f2f4f6] dark:bg-[#1a1d24]/60 rounded-[32px] p-2.5 space-y-2">
                  {combinedDebtsIOwe.map((debt, idx) => {
                    const isSelected = idx === safeDebtIndex;
                    return (
                      <div
                        key={idx}
                        onClick={() => { setSelectedDebtIndex(idx); setIsPayingManual(false); }}
                        className={`cursor-pointer transition-all flex items-center justify-between p-5 rounded-[24px] ${
                          isSelected
                            ? 'bg-white dark:bg-[#1a1d24] shadow-[0px_12px_32px_rgba(25,28,30,0.07)] border border-[#eceef0] dark:border-white/8 relative overflow-hidden'
                            : 'opacity-50 hover:opacity-80 hover:bg-white/60 dark:hover:bg-white/5'
                        }`}
                      >
                        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#004ccc] to-[#616f89] rounded-l-[24px]" />}
                        <div className="flex items-center space-x-4">
                          {debt.avatarUrl ? (
                            <img src={debt.avatarUrl} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0" alt={debt.name} />
                          ) : (
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-black flex-shrink-0 ${getAvatarColor(debt.name.toUpperCase())}`}>
                              {debt.name[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-black text-[#191c1e] dark:text-white tracking-tight">{debt.name}</p>
                            <p className="text-[11px] font-bold text-[#424656] dark:text-slate-400 uppercase tracking-wide truncate">{debt.concept}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className={`font-black tracking-tighter ${isSelected ? 'text-[#004ccc] text-2xl' : 'text-[#191c1e] dark:text-white text-xl'}`}>
                            €{debt.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Payment Methods */}
            {currentDebt && !isPayingManual && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                <p className="text-[10px] font-black text-[#424656] dark:text-slate-400 tracking-widest uppercase mb-4 px-1">{t.selectMethod}</p>
                <div className="grid grid-cols-2 gap-4">

                  {/* Cash */}
                  <button
                    onClick={() => setSelectedPaymentMethod('cash')}
                    className={`rounded-[24px] p-5 flex flex-col items-center justify-center gap-3 hover:translate-y-[-2px] active:scale-95 transition-all ${
                      selectedPaymentMethod === 'cash'
                        ? 'bg-[#004ccc] shadow-[0px_16px_32px_rgba(0,76,204,0.25)] ring-4 ring-[#004ccc]/10'
                        : 'bg-white dark:bg-[#1a1d24] border border-[#eceef0] dark:border-white/8 shadow-sm'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedPaymentMethod === 'cash' ? 'bg-black/20 text-white' : 'bg-[#f2f4f6] dark:bg-[#2e3440] text-[#191c1e] dark:text-white'}`}>
                      <span className="material-symbols-outlined text-2xl">payments</span>
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-wider ${selectedPaymentMethod === 'cash' ? 'text-white' : 'text-[#191c1e] dark:text-white'}`}>{t.payCash}</span>
                  </button>

                  {/* Bizum */}
                  <button
                    onClick={() => setSelectedPaymentMethod('bizum')}
                    className={`rounded-[24px] p-5 flex flex-col items-center justify-center gap-3 hover:translate-y-[-2px] active:scale-95 transition-all ${
                      selectedPaymentMethod === 'bizum'
                        ? 'bg-[#004ccc] shadow-[0px_16px_32px_rgba(0,76,204,0.25)] ring-4 ring-[#004ccc]/10'
                        : 'bg-white dark:bg-[#1a1d24] border border-[#eceef0] dark:border-white/8 shadow-sm'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black italic text-xl ${selectedPaymentMethod === 'bizum' ? 'bg-black/20 text-white' : 'bg-[#f2f4f6] dark:bg-[#2e3440] text-[#191c1e] dark:text-white'}`}>
                      B
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-wider ${selectedPaymentMethod === 'bizum' ? 'text-white' : 'text-[#191c1e] dark:text-white'}`}>Bizum</span>
                  </button>
                </div>
              </section>
            )}

            {/* Manual Amount Form (Cash/Card) */}
            {currentDebt && isPayingManual && (
              <section className="bg-white dark:bg-[#1a1d24] p-7 rounded-[32px] space-y-6 border border-[#eceef0] dark:border-white/8 shadow-[0px_24px_48px_rgba(0,0,0,0.06)] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-sm font-black text-[#191c1e] dark:text-white text-center uppercase tracking-widest">{t.registerManual}</p>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#004ccc] font-black text-2xl">€</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualAmount}
                    onChange={e => setManualAmount(e.target.value)}
                    placeholder={currentDebt.amount.toFixed(2)}
                    className="w-full bg-[#f2f4f6] dark:bg-[#2e3440] rounded-2xl py-6 pl-12 pr-6 text-[#191c1e] dark:text-white font-black text-3xl outline-none ring-2 ring-transparent focus:ring-[#004ccc] transition-all caret-[#004ccc]"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    disabled={isSubmitting}
                    onClick={() => { setIsPayingManual(false); setManualAmount(''); }}
                    className="flex-1 bg-[#f2f4f6] dark:bg-[#2e3440] py-4 rounded-2xl text-xs font-black text-[#424656] dark:text-slate-300 uppercase tracking-widest active:scale-95 transition-all"
                  >
                    {allTranslations.modals.cancel}
                  </button>
                  <button
                    disabled={isSubmitting || currentDebt.isMock}
                    onClick={() => handleRegisterPayment('cash')}
                    className="flex-1 bg-gradient-to-r from-[#004ccc] to-[#616f89] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-[0px_12px_24px_rgba(0,76,204,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      currentDebt.isMock ? t.demoMode : t.settleNow
                    )}
                  </button>
                </div>
              </section>
            )}
          </div>
        )}

        {/* Floating Settle Button */}
        {activeTab === 'pagar' && !isPayingManual && currentDebt && (
          <div className="fixed bottom-28 left-0 w-full px-6 z-40 flex justify-center pointer-events-none">
            <button
              onClick={() => selectedPaymentMethod === 'bizum' ? setPaymentModal('bizum') : setIsPayingManual(true)}
              className="pointer-events-auto bg-[#004ccc] text-white font-black text-xs uppercase tracking-[0.18em] w-full max-w-sm py-5 rounded-[24px] shadow-[0px_24px_48px_rgba(0,76,204,0.3)] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              <span>{t.settleNow} €{currentDebt.amount.toFixed(2)}</span>
            </button>
          </div>
        )}
      </div>

      {/* ── BIZUM MODAL ── */}
      {paymentModal === 'bizum' && currentDebt && (
        <div className="fixed inset-0 bg-[#0d1c32]/60 backdrop-blur-md flex items-end justify-center z-[300] animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1d24] w-full max-w-md rounded-t-[36px] p-8 space-y-7 animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-10 h-1 bg-[#eceef0] dark:bg-white/10 rounded-full mx-auto" />

            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-[#191c1e] dark:text-white tracking-tight">Pagar con Bizum</h3>
              <button onClick={() => setPaymentModal(null)} className="w-9 h-9 rounded-full bg-[#f2f4f6] dark:bg-[#2e3440] flex items-center justify-center text-[#424656] dark:text-slate-300 active:scale-90 transition-all">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Amount display */}
            <div className="bg-gradient-to-br from-[#004ccc] to-[#616f89] rounded-[28px] p-7 text-center space-y-1">
              <p className="text-white/70 text-xs font-black uppercase tracking-widest">Importe a enviar</p>
              <p className="text-5xl font-black text-white tracking-tighter">€{currentDebt.amount.toFixed(2)}</p>
              <p className="text-white/80 text-sm font-bold">a {currentDebt.name}</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleBizumOpen}
                className="w-full bg-[#004ccc] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-[0px_12px_24px_rgba(0,76,204,0.2)] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <span className="font-black italic text-base bg-white/20 w-7 h-7 rounded-full flex items-center justify-center">B</span>
                Abrir Bizum
              </button>
              <button
                onClick={() => { setPaymentModal(null); setIsPayingManual(true); }}
                className="w-full bg-[#f2f4f6] dark:bg-[#2e3440] py-4 rounded-2xl font-black text-xs text-[#424656] dark:text-slate-300 uppercase tracking-widest active:scale-[0.98] transition-all"
              >
                Registrar manualmente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MANUAL EXPENSE MODAL (Pedir tab) ── */}
      {showManualExpense && (
        <div className="fixed inset-0 bg-[#0d1c32]/60 backdrop-blur-md flex items-end justify-center z-[300] animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1d24] w-full max-w-md rounded-t-[36px] p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-10 h-1 bg-[#eceef0] dark:bg-white/10 rounded-full mx-auto" />

            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-[#191c1e] dark:text-white tracking-tight">{t.manualEntry}</h3>
              <button onClick={() => setShowManualExpense(false)} className="w-9 h-9 rounded-full bg-[#f2f4f6] dark:bg-[#2e3440] flex items-center justify-center text-[#424656] dark:text-slate-300 active:scale-90 transition-all">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {trips.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <span className="material-symbols-outlined text-4xl text-[#424656] dark:text-slate-400">luggage</span>
                <p className="text-sm font-bold text-[#424656] dark:text-slate-400">Crea un viaje primero para añadir gastos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Trip selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Viaje</label>
                  <select
                    value={newExpense.tripId}
                    onChange={e => setNewExpense({ ...newExpense, tripId: e.target.value })}
                    className="w-full bg-[#f2f4f6] dark:bg-[#2e3440] text-[#191c1e] dark:text-white rounded-2xl px-5 py-4 font-bold text-sm outline-none ring-2 ring-transparent focus:ring-[#004ccc] transition-all"
                  >
                    <option value="">Seleccionar viaje...</option>
                    {trips.map((trip: any) => (
                      <option key={trip.id} value={trip.id}>{trip.name || trip.destination || trip.id}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                  <input
                    type="text"
                    placeholder="Ej: Cena, Taxi, Hotel..."
                    value={newExpense.description}
                    onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="w-full bg-[#f2f4f6] dark:bg-[#2e3440] text-[#191c1e] dark:text-white rounded-2xl px-5 py-4 font-bold text-sm outline-none ring-2 ring-transparent focus:ring-[#004ccc] transition-all placeholder-slate-400"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Importe</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#004ccc] font-black text-xl">€</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={newExpense.amount}
                      onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                      className="w-full bg-[#f2f4f6] dark:bg-[#2e3440] text-[#191c1e] dark:text-white rounded-2xl py-4 pl-10 pr-5 font-black text-2xl outline-none ring-2 ring-transparent focus:ring-[#004ccc] transition-all caret-[#004ccc]"
                    />
                  </div>
                </div>
              </div>
            )}

            {trips.length > 0 && (
              <div className="flex gap-4">
                <button
                  disabled={isAddingExpense}
                  onClick={() => setShowManualExpense(false)}
                  className="flex-1 bg-[#f2f4f6] dark:bg-[#2e3440] py-4 rounded-2xl text-xs font-black text-[#424656] dark:text-slate-300 uppercase tracking-widest active:scale-95 transition-all"
                >
                  {allTranslations.modals.cancel}
                </button>
                <button
                  disabled={isAddingExpense || !newExpense.description || !newExpense.amount || !newExpense.tripId}
                  onClick={handleAddManualExpense}
                  className="flex-1 bg-gradient-to-r from-[#004ccc] to-[#616f89] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-[0px_12px_24px_rgba(0,76,204,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {isAddingExpense ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">add</span>
                      Añadir Gasto
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
