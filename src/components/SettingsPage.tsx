import React from 'react';
import { User } from 'firebase/auth';

interface SettingsPageProps {
  user: User;
  onLogout: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, onLogout }) => {
  return (
    <>
      <header className="w-full sticky top-0 z-50 bg-[#f7f9fb]/80 backdrop-blur-xl flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#495770] text-2xl">travel_explore</span>
          <h1 className="font-['Inter'] font-bold tracking-tight text-lg text-[#495770]">TravelSplit AI</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-slate-200/50 transition-colors">
            <span className="material-symbols-outlined text-[#616f89]">notifications</span>
          </button>
        </div>
      </header>
      
      <main className="pt-8 px-6 max-w-md mx-auto pb-32">
        <section className="mb-12 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[#004ccc] to-[#616f89]">
              <div className="w-full h-full rounded-full border-4 border-[#f7f9fb] bg-slate-800 flex items-center justify-center text-white text-5xl font-bold">
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            <button className="absolute bottom-0 right-0 bg-[#004ccc] text-white p-2 rounded-full shadow-lg border-2 border-[#f7f9fb]">
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#495770] mb-1">Perfil de Usuario</h2>
          <p className="text-[#424656] font-medium">{user.email}</p>
          <div className="mt-4">
            <span className="bg-[#004ccc]/10 text-[#004ccc] text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Pro Member</span>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-[0px_12px_32px_rgba(25,28,30,0.04)] flex flex-col items-start gap-2">
            <span className="material-symbols-outlined text-[#004ccc]">flight_takeoff</span>
            <div>
              <p className="text-2xl font-bold tracking-tighter text-slate-800">4</p>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Viajes</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-[0px_12px_32px_rgba(25,28,30,0.04)] flex flex-col items-start gap-2">
            <span className="material-symbols-outlined text-[#004ccc]">payments</span>
            <div>
              <p className="text-2xl font-bold tracking-tighter text-slate-800">12</p>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Gastos</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[11px] font-bold text-[#004ccc] uppercase tracking-[0.15em] ml-2 mb-2">Ajustes de Cuenta</h3>
          
          <div className="group cursor-pointer bg-white hover:bg-slate-50 transition-all duration-200 p-5 rounded-2xl flex items-center justify-between border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[#495770]">person</span>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Detalles de Cuenta</p>
                <p className="text-sm text-slate-500">Información personal, preferencias</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
          </div>

          <div className="group cursor-pointer bg-white hover:bg-slate-50 transition-all duration-200 p-5 rounded-2xl flex items-center justify-between border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[#495770]">shield</span>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Seguridad</p>
                <p className="text-sm text-slate-500">Contraseña, 2FA</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
          </div>

          <div className="mt-8 pt-4">
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 p-4 text-[#ba1a1a] font-bold tracking-wide hover:bg-red-50 rounded-2xl transition-colors">
              <span className="material-symbols-outlined">logout</span>
              Cerrar sesión
            </button>
          </div>
        </div>
      </main>
    </>
  );
};
