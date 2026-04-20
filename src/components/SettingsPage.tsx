import React, { useRef, useState } from 'react';
import { User, updateProfile } from 'firebase/auth';

interface SettingsPageProps {
  user: User;
  onLogout: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, onLogout }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoURL, setPhotoURL] = useState(user.photoURL || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbxHyvikR036qGLLKbh6-jWY4oGanl0k264sJvdV5uRponStKldE2Ou-PPmqmJMJf4UM6UFo-5AIJ8a-0cUBbbRb_gyePXeojW-LdS5JW2lrYZ3rheT6L_8rEM6arYgjYamhERKRSPyerUgEwsRgADRd8jEx5NKgGpdriMKDyDzK_rDgECc7s2cLluETjaapDMYzerAKjyIJWMN8IwcVm--yOjTskBD5gjI1dTGiwC4sm8U8qn6czKQaJK9CI6UXv2G-m7Q5vvv_k');
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newUrl = URL.createObjectURL(file);
      setPhotoURL(newUrl);
      
      // In a real app we'd upload to Firebase Storage then:
      try {
        await updateProfile(user, { photoURL: newUrl });
      } catch (err) {
        console.error("Error updating profile", err);
      }
    }
  };

  const handleActionableClick = (actionName: string) => {
    alert(`Acaba de interactuar con: ${actionName}`);
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col pb-32 w-full font-sans">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-[#f7f9fb]/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="font-sans font-bold text-2xl tracking-tight text-[#495770]">Security Settings</h1>
        </div>
        <div className="flex items-center">
          <button 
            className="p-2 rounded-full hover:bg-slate-200/50 transition-colors text-[#495770] active:scale-95 duration-200"
            onClick={() => handleActionableClick('Help')}
          >
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>
      </header>

      <main className="flex-grow px-6 py-8 max-w-md mx-auto w-full space-y-8">
        
        {/* Profile Editor Section */}
        <section className="flex flex-col items-center mb-8">
          <div className="relative mb-4 cursor-pointer group" onClick={handlePhotoClick}>
            <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-[#004ccc] to-[#616f89] shadow-md transition-transform group-hover:scale-105 duration-300">
              <div className="w-full h-full rounded-full border-4 border-[#f7f9fb] bg-slate-200 flex items-center justify-center overflow-hidden relative">
                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="material-symbols-outlined text-white">photo_camera</span>
                </div>
              </div>
            </div>
            <button className="absolute bottom-0 right-0 bg-[#004ccc] text-white p-2.5 rounded-full shadow-lg border-2 border-[#f7f9fb] hover:bg-[#0762ff] transition-colors">
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#495770]">{user.email?.split('@')[0] || 'User'}</h2>
          <p className="text-[#424656] text-sm">{user.email}</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange}
          />
        </section>

        {/* Access Control Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#495770] tracking-tight px-1">Access Control</h2>
          <div className="bg-white rounded-xl p-1 shadow-[0px_12px_32px_rgba(25,28,30,0.04)] border border-slate-100">
            {/* Password Item */}
            <button 
              onClick={() => handleActionableClick('Change Password')}
              className="w-full flex items-center justify-between p-4 hover:bg-[#f2f4f6] transition-colors rounded-lg group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f2f4f6] flex items-center justify-center text-[#424656] group-hover:bg-[#004ccc] group-hover:text-white transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">key</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#191c1e]">Change Password</h3>
                  <p className="text-sm text-[#424656]">Last updated 3 months ago</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#424656] group-hover:text-[#004ccc] transition-colors">chevron_right</span>
            </button>
            
            <div className="h-px w-[calc(100%-4rem)] mx-auto bg-slate-100"></div>
            
            {/* 2FA Item */}
            <button 
              onClick={() => handleActionableClick('Two-Factor Authentication')}
              className="w-full flex items-center justify-between p-4 hover:bg-[#f2f4f6] transition-colors rounded-lg group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f2f4f6] flex items-center justify-center text-[#424656] group-hover:bg-[#004ccc] group-hover:text-white transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">security</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#191c1e]">Two-Factor Authentication</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#004ccc]"></span>
                    <p className="text-sm text-[#004ccc] font-medium">Active</p>
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#424656] group-hover:text-[#004ccc] transition-colors">chevron_right</span>
            </button>
            
            <div className="h-px w-[calc(100%-4rem)] mx-auto bg-slate-100"></div>
            
            {/* Biometrics Toggle */}
            <div className="w-full flex items-center justify-between p-4 hover:bg-[#f2f4f6] transition-colors rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f2f4f6] flex items-center justify-center text-[#424656] shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">fingerprint</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#191c1e]">Biometric Login</h3>
                  <p className="text-sm text-[#424656]">Use Face ID or Touch ID</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={biometricEnabled}
                  onChange={() => setBiometricEnabled(!biometricEnabled)}
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004ccc]"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Active Sessions Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#495770] tracking-tight px-1">Active Sessions</h2>
          <div className="bg-white rounded-xl p-4 shadow-[0px_12px_32px_rgba(25,28,30,0.04)] border border-slate-100">
            {/* Current Session */}
            <div className="flex items-start justify-between py-2">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#eaf3ff] flex items-center justify-center text-[#004ccc] shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">smartphone</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#191c1e]">iPhone 14 Pro</h4>
                  <p className="text-sm text-[#424656]">Madrid, ES • App</p>
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-[#004ccc]/10 text-[#004ccc] text-[10px] font-bold uppercase tracking-widest">Current Session</span>
                </div>
              </div>
            </div>
            
            <div className="h-px w-full bg-slate-100 my-4"></div>
            
            {/* Other Session */}
            <div className="flex items-start justify-between py-2">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f2f4f6] flex items-center justify-center text-[#424656] shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">laptop_mac</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#191c1e]">MacBook Air M2</h4>
                  <p className="text-sm text-[#424656]">Madrid, ES • Chrome</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Active 2 days ago</p>
                </div>
              </div>
              <button 
                onClick={() => handleActionableClick('Revoke Session')}
                className="text-[#ba1a1a] text-sm font-bold hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-100"
              >
                Revoke
              </button>
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button 
              onClick={() => {
                handleActionableClick('Log out of all devices');
                onLogout();
              }}
              className="text-[#ba1a1a] font-bold text-sm hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Cerrar sesión
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

