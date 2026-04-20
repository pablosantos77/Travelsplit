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
    <div className="bg-[#f7f9fb] text-[#191c1e] antialiased min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="sticky top-0 left-0 w-full z-40 flex justify-between items-center px-6 py-4 bg-[#f7f9fb]/60 backdrop-blur-xl shadow-[0px_12px_32px_rgba(25,28,30,0.04)]">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e6e8ea] border-2 border-white">
          <img 
            alt="User Avatar" 
            src={user.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuCbxHyvikR036qGLLKbh6-jWY4oGanl0k264sJvdV5uRponStKldE2Ou-PPmqmJMJf4UM6UFo-5AIJ8a-0cUBbbRb_gyePXeojW-LdS5JW2lrYZ3rheT6L_8rEM6arYgjYamhERKRSPyerUgEwsRgADRd8jEx5NKgGpdriMKDyDzK_rDgECc7s2cLluETjaapDMYzerAKjyIJWMN8IwcVm--yOjTskBD5gjI1dTGiwC4sm8U8qn6czKQaJK9CI6UXv2G-m7Q5vvv_k"} 
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="font-sans text-2xl tracking-tight font-bold text-[#495770]">Smart Insights</h1>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:opacity-80 transition-opacity active:scale-95 duration-200 text-[#495770]">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <main className="px-6 max-w-md mx-auto space-y-8 mt-6">
        {/* Filter Dropdown */}
        <section>
          <div className="relative w-full max-w-[200px]">
             <select className="w-full appearance-none bg-white text-[#191c1e] font-semibold py-3 pl-4 pr-10 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#004ccc]/20 transition-colors">
              <option>Balance Global</option>
              {trips.map(t => <option key={t.id}>{t.name}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">expand_more</span>
          </div>
        </section>

        {loading ? (
             <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center justify-center py-12">
                 <div className="w-8 h-8 border-4 border-[#eaf3ff] border-t-[#004ccc] rounded-full animate-spin"></div>
             </div>
         ) : (
            <>
                {/* Budget Health */}
                <section className="bg-white rounded-xl p-6 shadow-[0px_12px_32px_rgba(25,28,30,0.06)] relative overflow-hidden">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-500 mb-1">Balance Neto Gobal</h2>
                            <p className={`text-3xl font-extrabold tracking-tight ${netBalance >= 0 ? 'text-[#004ccc]' : 'text-red-500'}`}>
                                {netBalance > 0 ? '+' : ''}{netBalance.toFixed(2)}€
                            </p>
                        </div>
                        <div className="bg-[#f2f4f6] px-3 py-1 rounded-full text-sm font-semibold text-[#191c1e]">
                            {netBalance >= 0 ? 'A favor' : 'Deuda'}
                        </div>
                    </div>
                    <div className="h-3 w-full bg-[#e6e8ea] rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-gradient-to-r from-[#004ccc] to-[#607080] w-[65%] rounded-full"></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Te deben</span>
                            <span className="text-lg font-bold text-[#191c1e]">{totalOwedToMe.toFixed(2)}€</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Tú debes</span>
                            <span className="text-lg font-bold text-[#191c1e]">{totalIOwe.toFixed(2)}€</span>
                        </div>
                    </div>
                </section>

                {/* Distribution (Donut Chart representation) */}
                <section className="bg-[#f2f4f6] rounded-xl p-6 relative">
                    <h2 className="text-lg font-bold text-[#191c1e] mb-6">Distribución</h2>
                    <div className="flex flex-col items-center">
                        {/* CSS Donut approximation */}
                        <div className="relative w-48 h-48 rounded-full flex items-center justify-center mb-8" style={{
                            background: `conic-gradient(
                                  #004ccc 0% 35%, 
                                  #616f89 35% 63%, 
                                  #b8c8da 63% 85%, 
                                  #d8dadc 85% 100%
                                )`
                            }}>
                            <div className="w-32 h-32 bg-[#f2f4f6] rounded-full flex flex-col items-center justify-center">
                                <span className="text-xs text-slate-500 font-semibold">Total</span>
                                <span className="text-xl font-bold text-[#191c1e]">€1,240</span>
                            </div>
                        </div>
                        <div className="w-full space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#004ccc]"></div>
                                    <span className="text-sm font-medium text-[#191c1e]">Alojamiento</span>
                                </div>
                                <span className="text-sm font-semibold text-[#191c1e]">35%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#616f89]"></div>
                                    <span className="text-sm font-medium text-[#191c1e]">Comida</span>
                                </div>
                                <span className="text-sm font-semibold text-[#191c1e]">28%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#b8c8da]"></div>
                                    <span className="text-sm font-medium text-[#191c1e]">Transporte</span>
                                </div>
                                <span className="text-sm font-semibold text-[#191c1e]">22%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#d8dadc]"></div>
                                    <span className="text-sm font-medium text-[#191c1e]">Ocio</span>
                                </div>
                                <span className="text-sm font-semibold text-[#191c1e]">15%</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Smart Alerts */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-[#004ccc] text-sm font-bold uppercase tracking-wider">✦ Smart Alerts</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-6 px-6 snap-x">
                        {/* Alert 1 */}
                        <div className="snap-center shrink-0 w-64 bg-white rounded-xl p-5 shadow-[0px_12px_32px_rgba(25,28,30,0.06)] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#004ccc]/5 to-transparent opacity-50"></div>
                            <div className="relative z-10">
                                <div className="w-10 h-10 bg-[#004ccc]/10 text-[#004ccc] rounded-full flex items-center justify-center mb-3">
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                </div>
                                <h3 className="font-bold text-[#191c1e] mb-1">Análisis IA</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    {netBalance > 0 
                                      ? 'Es un buen momento para pedir que te envíen dinero (Bizum) para saldar cuentas.' 
                                      : 'Deberías ponerte al día con tus deudas pronto para mantener el equilibrio.'}
                                </p>
                            </div>
                        </div>
                        {/* Alert 2 */}
                        <div className="snap-center shrink-0 w-64 bg-white rounded-xl p-5 shadow-[0px_12px_32px_rgba(25,28,30,0.06)] relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#495770]/5 to-transparent opacity-50"></div>
                            <div className="relative z-10">
                                <div className="w-10 h-10 bg-[#495770]/10 text-[#495770] rounded-full flex items-center justify-center mb-3">
                                    <span className="material-symbols-outlined">handshake</span>
                                </div>
                                <h3 className="font-bold text-[#191c1e] mb-1">Netting Suggestion</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">Simplifica las deudas de tu grupo cruzando los saldos de {trips.length} viajes.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Top 3 Expenses */}
                <section className="bg-[#f2f4f6] rounded-xl p-6">
                    <h2 className="text-lg font-bold text-[#191c1e] mb-4">Top 3 Gastos</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm">
                            <div className="w-10 h-10 bg-[#004ccc]/10 text-[#004ccc] rounded-full flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>hotel</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-[#191c1e] text-sm">Hotel Madrid</h3>
                                <p className="text-xs text-slate-500">Alojamiento</p>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-[#191c1e]">€450.00</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm">
                            <div className="w-10 h-10 bg-[#b8c8da]/20 text-[#485867] rounded-full flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>flight</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-[#191c1e] text-sm">Vuelo a Londres</h3>
                                <p className="text-xs text-slate-500">Transporte</p>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-[#191c1e]">€320.00</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm">
                            <div className="w-10 h-10 bg-[#616f89]/20 text-[#495770] rounded-full flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>restaurant</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-[#191c1e] text-sm">Cena Pizzería</h3>
                                <p className="text-xs text-slate-500">Comida</p>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-[#191c1e]">€180.00</span>
                            </div>
                        </div>
                    </div>
                </section>
            </>
         )}
      </main>
    </div>
  );
};
