import React, { useState } from 'react';

// Define the two sub-tabs
type PaymentTab = 'pedir' | 'pagar';

interface PaymentsPageProps {
  onBack?: () => void;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<PaymentTab>('pedir');

  return (
    <div className="bg-[#f7f9fb] font-sans text-[#191c1e] antialiased selection:bg-[#0762ff] selection:text-[#f3f3ff] relative min-h-[100dvh] flex flex-col pb-32 overflow-hidden">

      
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col z-10 relative">

        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/40 backdrop-blur-3xl flex items-center justify-between px-6 py-4 w-full border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f2f4f6] overflow-hidden shadow-[0px_4px_12px_rgba(25,28,30,0.06)] border border-white/50">
              <img 
                alt="User Profile" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbxHyvikR036qGLLKbh6-jWY4oGanl0k264sJvdV5uRponStKldE2Ou-PPmqmJMJf4UM6UFo-5AIJ8a-0cUBbbRb_gyePXeojW-LdS5JW2lrYZ3rheT6L_8rEM6arYgjYamhERKRSPyerUgEwsRgADRd8jEx5NKgGpdriMKDyDzK_rDgECc7s2cLluETjaapDMYzerAKjyIJWMN8IwcVm--yOjTskBD5gjI1dTGiwC4sm8U8qn6czKQaJK9CI6UXv2G-m7Q5vvv_k"
              />
            </div>
          </div>
          <h1 className="font-bold tracking-tight text-3xl text-[#495770]">Payments</h1>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-[#191c1e] hover:opacity-80 transition-opacity shadow-[0px_4px_12px_rgba(25,28,30,0.06)]">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </header>

        {/* Segmented Control */}
        <div className="px-6 pt-4 pb-6 z-10 relative">
          <div className="bg-[#e6e8ea]/80 p-1.5 rounded-full flex gap-1 w-full backdrop-blur-md shadow-inner">
            <button 
              onClick={() => setActiveTab('pedir')}
              className={`flex-1 font-semibold text-sm py-3 px-6 rounded-full transition-all duration-300 ${activeTab === 'pedir' ? 'bg-white text-[#191c1e] shadow-[0px_8px_20px_rgba(25,28,30,0.06)]' : 'text-[#424656] hover:bg-white/40'}`}
            >
              Pedir
            </button>
            <button 
              onClick={() => setActiveTab('pagar')}
              className={`flex-1 font-semibold text-sm py-3 px-6 rounded-full transition-all duration-300 ${activeTab === 'pagar' ? 'bg-white text-[#191c1e] shadow-[0px_8px_20px_rgba(25,28,30,0.06)]' : 'text-[#424656] hover:bg-white/40'}`}
            >
              Pagar
            </button>
          </div>
        </div>

        {/* Content based on Active Tab */}
        <div className="flex-1 px-6 pb-32 z-10 relative overflow-y-auto w-full">
          {activeTab === 'pedir' ? (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Smart Scan Action */}
              <button className="w-full group relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#004ccc] to-[#616f89] p-[2px] transition-transform active:scale-[0.98] shadow-[0px_16px_32px_rgba(0,76,204,0.15)]">
                <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-white/10 backdrop-blur-md w-full h-full rounded-[30px] p-8 flex flex-col items-center justify-center gap-4 border border-white/20">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-white text-3xl">document_scanner</span>
                  </div>
                  <div className="text-center">
                    <h2 className="text-white font-bold text-xl tracking-tight mb-1 flex items-center justify-center gap-2">
                       Escaneo Inteligente
                    </h2>
                    <p className="text-white/80 text-sm font-medium leading-tight">Sube un ticket y la IA hará el resto</p>
                  </div>
                </div>
              </button>

              {/* AI Hint */}
              <div className="flex items-center gap-3 bg-[#0762ff]/10 border border-[#0762ff]/20 px-4 py-3 rounded-2xl">
                <span className="material-symbols-outlined text-[#004ccc] text-lg">auto_awesome</span>
                <p className="text-xs font-medium text-[#004ccc] leading-snug">La IA detectará automáticamente el comercio, precio y categoría.</p>
              </div>

              {/* Secondary Actions Grid */}
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center justify-center gap-3 bg-white p-6 rounded-[24px] shadow-[0px_8px_24px_rgba(25,28,30,0.04)] hover:bg-[#f2f4f6] transition-colors border border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-[#f2f4f6] flex items-center justify-center text-[#495770]">
                    <span className="material-symbols-outlined">add_photo_alternate</span>
                  </div>
                  <span className="font-semibold text-[#191c1e] text-sm">Subir Captura</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-3 bg-white p-6 rounded-[24px] shadow-[0px_8px_24px_rgba(25,28,30,0.04)] hover:bg-[#f2f4f6] transition-colors border border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-[#f2f4f6] flex items-center justify-center text-[#495770]">
                    <span className="material-symbols-outlined">edit_document</span>
                  </div>
                  <span className="font-semibold text-[#191c1e] text-sm">Entrada Manual</span>
                </button>
              </div>

              {/* Section Preview Pending */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#191c1e] text-lg">Pedir / Pendiente</h3>
                  <span className="text-sm font-medium text-[#004ccc] cursor-pointer hover:underline">Ver todo</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="bg-white p-4 rounded-[20px] shadow-[0px_8px_24px_rgba(25,28,30,0.04)] border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-[#e6e8ea]">
                        <img alt="Carlos" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG4Qde9vHnBqgVqkrMC4BJhmTPncfbH7qvnaNzcAiVu7hEedu9iHHDhAHwtjICC6zHWSjf34G_bqKepqDUP5lps9Otu_Vod_2N3ksBa1HN1MDol7Hi_zf4NsG3VQ36d6_LgB7uwcH69FlZVceI4QCd6htQ5IcN8vnjTm73N5RvUfj03m8ataECESJO7phXk2UW4viuI2tunlvAl7s1Waq1YAi2EKSYPPDJNg28ruKV0VvCmB3S-TETLt9ZmMFbWR5haNqRG6Nm0ok"/>
                      </div>
                      <div>
                        <p className="font-bold text-[#191c1e] text-[15px]">Cena Pizzería</p>
                        <p className="text-xs text-[#424656] font-medium">De Carlos M.</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-extrabold text-[#191c1e] text-[17px]">24,50€</span>
                      <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">Bizum</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col gap-6 animate-scaleUp">
              {/* Debt Card 1 */}
              <div className="bg-white rounded-[24px] p-5 shadow-[0px_12px_32px_rgba(25,28,30,0.06)] border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#d4e4f6]">
                      <img alt="Marc" className="w-full h-full object-cover pointer-events-none" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAW31tXKsknFRhhn1xjVf1zG-fmvAV6Wyk-zHFDBs4vZJFYPey9b6yS0lfL9dNFimaIdXtuzMW4sduNaf8yn__BujeNpy13p6o1YgS83gso9OQYlByD4MC2uVb6KK72v_IXxx1YPhbpSag1MWQAzktjZLZhJEihoEpLWzm3eHkdWWhJfk_O9-mcQO64Liz-5OGnMiwq6y3OqWlei0ABWKeFjeq1L7pcrlkx-UdvbeUtMpagoKh2vMQjoN3Fo_MqR9PRb4i5iGTwaX8"/>
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-[#191c1e] text-[17px] tracking-tight">Marc</h3>
                      <p className="text-[13px] font-medium text-[#424656]">Cena Pizzería</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-sans font-extrabold text-[#ba1a1a] text-[22px] tracking-tight">-24,50€</span>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button className="flex-[0.8] flex items-center justify-center gap-2 py-3 rounded-xl bg-[#f2f4f6] text-[#495770] hover:bg-[#e6e8ea] transition-colors font-bold text-sm">
                    <span className="material-symbols-outlined text-[18px]">payments</span>
                    Efectivo
                  </button>
                  <button className="flex-[1.2] flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#004ccc] to-[#0762ff] text-white shadow-[0px_8px_16px_rgba(0,76,204,0.15)] hover:opacity-90 active:scale-95 transition-all font-bold text-sm">
                    <span className="material-symbols-outlined text-[18px]">contactless</span>
                    Pagar con Bizum
                  </button>
                </div>
              </div>
              
              {/* Debt Card 2 */}
              <div className="bg-white rounded-[24px] p-5 shadow-[0px_12px_32px_rgba(25,28,30,0.06)] border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#d6e3ff]">
                      <img alt="Elena" className="w-full h-full object-cover pointer-events-none" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqpZKZfgwGXMlOFU5EgETcZpxg5k47mhSErcKBfyWy439WiGAM6GaxlMHkQd0Mi44LosTRrtCATuJ82NxgZ_SamRgxiiAccVhQrhRaW4QUzBxrQkljYH-VVmyqKAhWimymvx18MFj8DKuabfRUM5q3o7y8mZLOyuwSFP-AWiSjuWsgDYWByVoIu9S5a78OPaccKeFvd3MnyBsS0Kj_vSnR0vvQZBngBw829QxjFwYolfAlwv3LGPmVvQAg1mGON7QYM0sdxAMbyUc"/>
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-[#191c1e] text-[17px] tracking-tight">Elena</h3>
                      <p className="text-[13px] font-medium text-[#424656]">Taxi Aeropuerto</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-sans font-extrabold text-[#ba1a1a] text-[22px] tracking-tight">-120,70€</span>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button className="flex-[0.8] flex items-center justify-center gap-2 py-3 rounded-xl bg-[#f2f4f6] text-[#495770] hover:bg-[#e6e8ea] transition-colors font-bold text-sm">
                    <span className="material-symbols-outlined text-[18px]">payments</span>
                    Efectivo
                  </button>
                  <button className="flex-[1.2] flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#004ccc] to-[#0762ff] text-white shadow-[0px_8px_16px_rgba(0,76,204,0.15)] hover:opacity-90 active:scale-95 transition-all font-bold text-sm">
                    <span className="material-symbols-outlined text-[18px]">contactless</span>
                    Pagar con Bizum
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Total Banner */}
        <div className="fixed bottom-[96px] left-0 w-full px-6 z-40 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto bg-[#191c1e]/90 backdrop-blur-xl rounded-[20px] p-4 shadow-[0px_16px_32px_rgba(25,28,30,0.15)] border border-white/10 flex justify-between items-center">
            <span className="font-sans text-xs font-bold text-[#eff1f3] uppercase tracking-widest">{activeTab === 'pagar' ? 'Total por liquidar' : 'Total a recibir'}</span>
            <span className="font-sans font-extrabold text-[22px] tracking-tight text-white">{activeTab === 'pagar' ? '-145,20€' : '+24,50€'}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
