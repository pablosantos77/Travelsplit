import React from 'react';

export const InsightsPage: React.FC = () => {
  return (
    <>
      <header className="w-full sticky top-0 z-50 bg-[#f7f9fb]/80 backdrop-blur-xl flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#495770] text-2xl">analytics</span>
          <h1 className="font-['Inter'] font-bold text-2xl tracking-tight text-[#495770]">Insights</h1>
        </div>
      </header>
      
      <main className="max-w-md mx-auto px-6 pt-6 space-y-8 pb-32">
        <div className="bg-white rounded-xl p-6 shadow-[0px_12px_32px_rgba(25,28,30,0.06)] flex flex-col gap-4 text-center items-center py-12">
            <div className="w-16 h-16 bg-[#eaf3ff] rounded-full flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[#004ccc] text-3xl">query_stats</span>
            </div>
            <h3 className="text-xl font-bold text-[#495770]">Estadísticas de Viajes</h3>
            <p className="text-slate-500 text-sm">Próximamente podrás ver aquí un desglose detallado de tus gastos y balance de deudas entre todos tus viajes.</p>
            <button className="mt-4 py-3 px-6 bg-[#004ccc] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#004ccc]/30">Descubrir más</button>
        </div>
      </main>
    </>
  );
};
