import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface InsightsPageProps {
  user: User;
  trips: any[];
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ user, trips }) => {
  const [totalOwedToMe, setTotalOwedToMe] = useState(0);
  const [totalIOwe, setTotalIOwe] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const calculateBalances = async () => {
      let owed = 0;
      let owe = 0;
      
      for (const trip of trips) {
        try {
          // Fetch expenses for this trip
          const expensesSnapshot = await getDocs(collection(db, 'trips', trip.id, 'expenses'));
          const numParticipants = trip.participants?.length || 1;
          
          expensesSnapshot.forEach((doc) => {
            const exp = doc.data();
            const amount = Number(exp.amount) || 0;
            const splitAmount = amount / numParticipants;
            
            if (user.email && exp.paidBy?.toLowerCase() === user.email.toLowerCase()) {
              // I paid for it. The group owes me everything minus my share.
              owed += (amount - splitAmount);
            } else {
              // Someone else paid for it.
              // Am I a participant in this trip? Yes, by definition of feeling trips.
              // So I owe my split share to whoever paid.
              owe += splitAmount;
            }
          });
        } catch (err) {
          console.error("Error fetching expenses for trip", trip.id, err);
        }
      }
      
      if (mounted) {
        setTotalOwedToMe(owed);
        setTotalIOwe(owe);
        setLoading(false);
      }
    };
    
    if (trips.length > 0) {
      calculateBalances();
    } else {
      setLoading(false);
    }
    
    return () => { mounted = false; };
  }, [user, trips]);

  const netBalance = totalOwedToMe - totalIOwe;

  return (
    <>
      <header className="w-full sticky top-0 z-50 bg-[#f7f9fb]/80 backdrop-blur-xl flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#004ccc]/10 flex items-center justify-center">
             <span className="material-symbols-outlined text-[#004ccc]">analytics</span>
          </div>
          <h1 className="font-['Inter'] font-bold text-2xl tracking-tight text-[#495770]">Insights</h1>
        </div>
      </header>
      
      <main className="max-w-md mx-auto px-6 pt-6 space-y-8 pb-32">
        <section className="space-y-1">
          <span className="text-secondary font-bold text-[11px] tracking-widest uppercase mb-1 block text-[#004ccc]">Balance Global</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#495770]">Tu resumen</h2>
          <p className="text-slate-500 text-sm">Visión general entre tus {trips.length} viajes activos.</p>
        </section>

        {loading ? (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#eaf3ff] border-t-[#004ccc] rounded-full animate-spin"></div>
            </div>
        ) : (
            <>
                <div className="bg-white rounded-3xl p-6 shadow-[0px_12px_32px_rgba(25,28,30,0.06)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                         {netBalance >= 0 ? 
                            <span className="material-symbols-outlined text-green-500">trending_up</span> : 
                            <span className="material-symbols-outlined text-red-500">trending_down</span>
                         }
                    </div>
                    <div className="mb-2">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Balance Neto</div>
                        <div className={`text-5xl font-extrabold tracking-tighter ${netBalance >= 0 ? 'text-[#004ccc]' : 'text-red-500'}`}>
                            {netBalance > 0 ? '+' : ''}{netBalance.toFixed(2)}€
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 mt-4">
                        {netBalance >= 0 ? '¡Estás en positivo! Tus amigos te deben dinero globalmente.' : 'Estás en negativo. Debes más dinero del que te deben tus amigos.'}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-[0px_4px_20px_rgba(25,28,30,0.04)] border border-green-50">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mb-3">
                            <span className="material-symbols-outlined text-green-600 text-[18px]">south_west</span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Te deben</div>
                        <div className="text-2xl font-bold text-slate-800">{totalOwedToMe.toFixed(2)}€</div>
                    </div>
                    
                    <div className="bg-white p-5 rounded-2xl shadow-[0px_4px_20px_rgba(25,28,30,0.04)] border border-red-50">
                         <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mb-3">
                            <span className="material-symbols-outlined text-red-600 text-[18px]">north_east</span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tú debes</div>
                        <div className="text-2xl font-bold text-slate-800">{totalIOwe.toFixed(2)}€</div>
                    </div>
                </div>

                <div className="bg-[#eaf3ff] p-5 rounded-2xl flex gap-4 items-start">
                    <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-[#004ccc]">
                        <span className="material-symbols-outlined">auto_awesome</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-[#00174b] text-sm mb-1">AI Suggestion</h4>
                        <p className="text-sm text-[#003ea8] opacity-80 leading-snug">
                            {netBalance > 0 
                                ? 'Es un buen momento para pedir que te envíen dinero (Bizum/Revolut) para saldar cuentas en tus viajes.' 
                                : 'Deberías ponerte al día con tus deudas pronto para mantener el equilibrio del grupo en los viajes activos.'}
                        </p>
                    </div>
                </div>
            </>
        )}
      </main>
    </>
  );
};
