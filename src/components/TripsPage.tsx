import React from 'react';

interface Trip {
  id: string;
  name: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
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
      <header className="w-full top-0 sticky z-40 bg-[#f7f9fb] text-[#495770] font-sans tracking-tight flex justify-between items-center px-6 py-4 bg-gradient-to-b from-[#f7f9fb] to-transparent">
        <div className="flex items-center gap-3">
          <img 
            alt="Profile" 
            className="w-10 h-10 rounded-full object-cover border border-slate-200/50 hover:bg-slate-100 transition-colors active:scale-95 cursor-pointer" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVnT0B_AhtHM9ZlP209V4SKbPatWmaejCOtU-mMfzcB3P9ktb_GbdpISmaAe2HJd-YzD6EFGErt5KGyy7JZ38qnG5L0_sL68m53kYVJlKwUU-9Ef5YtDF7fncDrnjFcGSOu8eiCsmwW01nVKuxrMUj46ARXC3zaIDKxxsGibSAPY9nTx_yRPxuHnJHXPW50ZbtcNgB8v73pvD0qiaxl5huSD27gvxda2_fioSM9Oag_lbowFrghpLqQmbKiYIqS27eixBnPwhDA3k"
          />
        </div>
        <div className="text-xl font-bold tracking-tighter text-[#495770]">TravelSplit AI</div>
        <div className="flex items-center">
          <button className="w-10 h-10 flex items-center justify-center text-[#495770] hover:bg-slate-200/50 rounded-full transition-colors active:scale-95">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>notifications</span>
          </button>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-4 flex flex-col gap-8 z-10 relative pb-32">
        
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold text-[#495770] tracking-tight font-sans">Mis Viajes</h1>
          <p className="text-slate-500 font-sans text-sm">Your digital itineraries and expense folios.</p>
        </div>

        <div className="flex flex-col gap-8 w-full mt-2">
          {trips.length === 0 ? (
            <div className="w-full border-[1.5px] border-dashed border-slate-300 bg-[#f2f4f6] rounded-[1.25rem] p-1.5 relative z-10 opacity-70">
              <div className="w-full bg-white/90 backdrop-blur-md rounded-[1rem] p-10 flex flex-col items-center justify-center gap-4 text-center border border-slate-200/50">
                <span className="material-symbols-outlined text-slate-400 text-4xl">travel_explore</span>
                <p className="text-slate-500 font-medium">Aún no tienes viajes. ¡Crea el primero!</p>
              </div>
            </div>
          ) : (
            trips.map((trip, index) => {
              const folderColors = [
                { tabBg: 'bg-[#004ccc]', tabText: 'text-white', sleeveBg: 'bg-[#004ccc]', shadow: 'shadow-[0px_12px_32px_rgba(0,76,204,0.15)]', tabTitle: 'Upcoming', icon: 'flight_takeoff' },
                { tabBg: 'bg-[#616f89]', tabText: 'text-white', sleeveBg: 'bg-[#616f89]', shadow: 'shadow-[0px_12px_32px_rgba(97,111,137,0.15)]', tabTitle: 'Planned', icon: 'restaurant' },
              ];
              const c = folderColors[index % folderColors.length];

              const isOdd = index % 2 !== 0;

              return (
                <article key={trip.id} onClick={() => onManageTrip(trip)} className="w-full relative group cursor-pointer">
                  {/* Folder Tab */}
                  <div className={`w-32 h-9 ${c.tabBg} rounded-t-xl ml-6 flex items-center justify-center shadow-sm relative z-0 translate-y-2`}>
                    <span className={`text-[10px] font-bold ${c.tabText} uppercase tracking-widest font-sans`}>{c.tabTitle}</span>
                  </div>
                  {/* Folder Body / Sleeve */}
                  <div className={`w-full ${c.sleeveBg} rounded-[1.25rem] rounded-tl-none ${c.shadow} p-1.5 relative z-10 transition-all duration-300`}>
                    {/* Paper Content */}
                    <div className={`w-full bg-white rounded-[1rem] p-6 transition-transform duration-500 ease-out transform group-hover:-translate-y-4 shadow-[0px_12px_32px_rgba(25,28,30,0.06)] flex flex-col gap-5 border border-slate-200/50 ${isOdd ? 'group-hover:-rotate-[0.5deg]' : 'group-hover:rotate-[0.5deg]'}`}>
                      <div className="flex justify-between items-start w-full">
                        <div>
                          <h2 className="text-2xl font-bold text-[#495770] tracking-tight font-sans">{trip.name}</h2>
                          <p className={`text-xs font-medium uppercase tracking-wider mt-1 ${isOdd ? 'text-[#616f89]' : 'text-[#004ccc]'}`}>{trip.destination || 'Pending destination'}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-full bg-[#f2f4f6] flex items-center justify-center ${isOdd ? 'text-[#616f89]' : 'text-[#004ccc]'}`}>
                          <span className="material-symbols-outlined text-2xl">{c.icon}</span>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-2 bg-[#f2f4f6] px-3 py-1.5 rounded-full">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">calendar_month</span>
                          <span className="text-sm font-medium text-slate-500">
                            {trip.startDate ? `${new Date(trip.startDate + 'T00:00:00').toLocaleDateString('es-ES', {month: 'short', day: 'numeric'})}` : 'Select dates'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-[#f2f4f6] px-3 py-1.5 rounded-full">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">group</span>
                          <span className="text-sm font-medium text-slate-500">{trip.participants?.length || 0} Guests</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </main>

      <button 
        onClick={onOpenNewTripModal}
        className="fixed bottom-24 md:bottom-10 right-6 w-[56px] h-[56px] bg-gradient-to-br from-[#004ccc] to-[#616f89] text-white rounded-2xl shadow-[0px_12px_32px_rgba(25,28,30,0.06)] flex items-center justify-center z-40 active:scale-95 transition-transform hover:shadow-lg"
      >
        <span className="material-symbols-outlined text-[28px] font-bold">add</span>
      </button>
    </>
  );
};
