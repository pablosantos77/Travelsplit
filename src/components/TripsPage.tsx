import React from 'react';

interface Trip {
  id: string;
  name: string;
  participants: string[];
}

interface TripsPageProps {
  trips: Trip[];
  onOpenNewTripModal: () => void;
  onManageTrip: (trip: Trip) => void;
}

export const TripsPage: React.FC<TripsPageProps> = ({ trips, onOpenNewTripModal, onManageTrip }) => {
  return (
    <>
      <header className="w-full sticky top-0 z-50 no-border bg-[#f7f9fb] dark:bg-slate-900 flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center p-2">
			      <span className="material-symbols-outlined text-white">travel_explore</span>
          </div>
          <h1 className="font-['Inter'] font-bold text-2xl tracking-tight text-[#495770] dark:text-slate-200">TravelSplit AI</h1>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-xl text-[#495770] dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors active:scale-95 duration-200">
          <span className="material-symbols-outlined text-[24px]">notifications</span>
        </button>
      </header>
      
      <main className="max-w-md mx-auto px-6 pt-6 space-y-8 pb-32">
        <section className="space-y-1">
          <span className="text-secondary font-bold text-[11px] tracking-widest uppercase mb-1 block text-[#004ccc]">Your Intelligence Panel</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#495770]">Mis Viajes</h2>
          <p className="text-slate-500 text-sm">Managing {trips.length} active itineraries</p>
        </section>

        <div className="space-y-6">
          {trips.length === 0 ? (
            <div className="bg-surface-container-low rounded-xl p-5 border-2 border-dashed border-slate-300 flex flex-col gap-4 items-center justify-center py-10 opacity-70">
                <span className="material-symbols-outlined text-slate-400 text-4xl">travel_explore</span>
                <p className="text-slate-500 font-medium">Aún no tienes viajes. ¡Crea el primero!</p>
            </div>
          ) : (
             trips.map(trip => (
              <div key={trip.id} className="bg-white rounded-xl p-5 shadow-[0px_12px_32px_rgba(25,28,30,0.06)] flex flex-col gap-4 relative overflow-hidden group">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200 flex items-center justify-center relative">
                    <img alt={trip.name} className="w-full h-full object-cover absolute inset-0" src={`https://source.unsplash.com/random/200x200/?${encodeURIComponent(trip.name)},city`} />
                    <div className="absolute inset-0 bg-slate-900/10 mix-blend-multiply"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#495770] mb-1">{trip.name}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        <span>Dates Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {trip.participants.slice(0, 3).map((p, i) => (
                                <div key={p} className="w-6 h-6 rounded-full border-2 border-white bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold z-10" style={{ zIndex: 10 - i }}>
                                    {p.charAt(0).toUpperCase()}
                                </div>
                            ))}
                            {trip.participants.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold z-0 text-slate-600">
                                    +{trip.participants.length - 3}
                                </div>
                            )}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{trip.participants.length} participants</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => onManageTrip(trip)}
                    className="flex-1 py-3 px-4 bg-[#dbe1ff] text-[#00174b] rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                    Manage
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <button 
        onClick={onOpenNewTripModal}
        className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-tr from-[#004ccc] to-[#0762ff] text-white rounded-2xl shadow-[0px_12px_32px_rgba(0,76,204,0.3)] flex items-center justify-center z-40 active:scale-90 transition-transform duration-300"
      >
        <span className="material-symbols-outlined text-3xl font-bold">add</span>
      </button>
    </>
  );
};
