
import React, { useRef, useState } from 'react';
import { User, updateProfile } from 'firebase/auth';
import { useLanguage, LANGUAGES } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsPageProps {
  user: User;
  onLogout: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, onLogout }) => {
  const { language, setLanguage, t: allTranslations } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const t = allTranslations.settings;
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
      
      try {
        await updateProfile(user, { photoURL: newUrl });
      } catch (err) {
        console.error("Error updating profile", err);
      }
    }
  };

  const handleActionableClick = (actionName: string) => {
    alert(`Interaction with: ${actionName}`);
  };

  return (
    <div className="bg-[#f7f9fb] dark:bg-[#000000] text-[#191c1e] dark:text-white min-h-screen flex flex-col pb-32 w-full font-sans">
      <header className="w-full sticky top-0 z-50 bg-[#f7f9fb] dark:bg-[#000000]/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="font-sans font-bold text-2xl tracking-tight text-[#495770] dark:text-slate-100">{t.headerTitle}</h1>
        </div>
        <div className="flex items-center">
          <button 
            className="p-2 rounded-full hover:bg-slate-200/50 transition-colors text-[#495770] dark:text-slate-100 active:scale-95 duration-200"
            onClick={() => handleActionableClick(t.help)}
          >
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>
      </header>

      <main className="flex-grow px-6 py-8 max-w-md mx-auto w-full space-y-8">
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
          <h2 className="text-xl font-bold tracking-tight text-[#495770] dark:text-slate-100">{user.displayName || user.email?.split('@')[0] || 'User'}</h2>
          <p className="text-[#424656] dark:text-slate-300 text-sm">{user.email}</p>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#495770] dark:text-slate-100 tracking-tight px-1">{t.accessControl}</h2>
          <div className="bg-white dark:bg-[#1a1d24] rounded-xl p-1 shadow-[0px_12px_32px_rgba(25,28,30,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800">
            <button onClick={() => handleActionableClick(t.changePassword)} className="w-full flex items-center justify-between p-4 hover:bg-[#f2f4f6] dark:bg-[#2e3440] transition-colors rounded-lg group text-left">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f2f4f6] dark:bg-[#2e3440] flex items-center justify-center text-[#424656] dark:text-slate-300 group-hover:bg-[#004ccc] group-hover:text-white transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">key</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#191c1e] dark:text-white">{t.changePassword}</h3>
                  <p className="text-sm text-[#424656] dark:text-slate-300">{t.lastUpdated}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#424656] dark:text-slate-300 group-hover:text-[#004ccc] transition-colors">chevron_right</span>
            </button>
            <div className="h-px w-[calc(100%-4rem)] mx-auto bg-slate-100"></div>
            <button onClick={() => handleActionableClick(t.twoFactor)} className="w-full flex items-center justify-between p-4 hover:bg-[#f2f4f6] dark:bg-[#2e3440] transition-colors rounded-lg group text-left">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f2f4f6] dark:bg-[#2e3440] flex items-center justify-center text-[#424656] dark:text-slate-300 group-hover:bg-[#004ccc] group-hover:text-white transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">security</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#191c1e] dark:text-white">{t.twoFactor}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#004ccc]"></span>
                    <p className="text-sm text-[#004ccc] font-medium">{t.active}</p>
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#424656] dark:text-slate-300 group-hover:text-[#004ccc] transition-colors">chevron_right</span>
            </button>
            <div className="h-px w-[calc(100%-4rem)] mx-auto bg-slate-100"></div>
            <div className="w-full flex items-center justify-between p-4 hover:bg-[#f2f4f6] dark:bg-[#2e3440] transition-colors rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f2f4f6] dark:bg-[#2e3440] flex items-center justify-center text-[#424656] dark:text-slate-300 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">fingerprint</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#191c1e] dark:text-white">{t.biometricLogin}</h3>
                  <p className="text-sm text-[#424656] dark:text-slate-300">{t.biometricDesc}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={biometricEnabled} onChange={() => setBiometricEnabled(!biometricEnabled)} />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#1a1d24] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004ccc]"></div>
              </label>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#495770] dark:text-slate-100 tracking-tight px-1">{t.appearance}</h2>
          <div className="bg-white dark:bg-[#000000] rounded-[2rem] p-12 shadow-[0px_12px_32px_rgba(25,28,30,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex items-center justify-center transition-all duration-500">
            <label className="theme-switch">
              <input 
                type="checkbox" 
                className="theme-switch__checkbox" 
                checked={isDarkMode} 
                onChange={toggleTheme} 
              />
              <div className="theme-switch__container">
                <div className="theme-switch__shooting-star"></div>
                <div className="theme-switch__shooting-star-2"></div>
                <div className="theme-switch__meteor"></div>
                <div className="theme-switch__clouds"></div>
                <div className="theme-switch__aurora"></div>
                <div className="theme-switch__comets">
                  <div className="comet"></div>
                  <div className="comet"></div>
                </div>
                <div className="theme-switch__stars-container">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 55" fill="none">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M135.831 3.00688C135.055 3.85027 134.111 4.29946 133 4.35447C134.111 4.40947 135.055 4.85867 135.831 5.71123C136.607 6.55462 136.996 7.56303 136.996 8.72727C136.996 7.95722 137.172 7.25134 137.525 6.59129C137.886 5.93124 138.372 5.39954 138.98 5.00535C139.598 4.60199 140.268 4.39114 141 4.35447C139.88 4.2903 138.936 3.85027 138.16 3.00688C137.384 2.16348 136.996 1.16425 136.996 0C136.996 1.16425 136.607 2.16348 135.831 3.00688ZM31 23.3545C32.1114 23.2995 33.0551 22.8503 33.8313 22.0069C34.6075 21.1635 34.9956 20.1642 34.9956 19C34.9956 20.1642 35.3837 21.1635 36.1599 22.0069C36.9361 22.8503 37.8798 23.2903 39 23.3545C38.2679 23.3911 37.5976 23.602 36.9802 24.0053C36.3716 24.3995 35.8864 24.9312 35.5248 25.5913C35.172 26.2513 34.9956 26.9572 34.9956 27.7273C34.9956 26.563 34.6075 25.5546 33.8313 24.7112C33.0551 23.8587 32.1114 23.4095 31 23.3545ZM0 36.3545C1.11136 36.2995 2.05513 35.8503 2.83131 35.0069C3.6075 34.1635 3.99559 33.1642 3.99559 32C3.99559 33.1642 4.38368 34.1635 5.15987 35.0069C5.93605 35.8503 6.87982 36.2903 8 36.3545C7.26792 36.3911 6.59757 36.602 5.98015 37.0053C5.37155 37.3995 4.88644 37.9312 4.52481 38.5913C4.172 39.2513 3.99559 39.9572 3.99559 40.7273C3.99559 39.563 3.6075 38.5546 2.83131 37.7112C2.05513 36.8587 1.11136 36.4095 0 36.3545ZM56.8313 24.0069C56.0551 24.8503 55.1114 25.2995 54 25.3545C55.1114 25.4095 56.0551 25.8587 56.8313 26.7112C57.6075 27.5546 57.9956 28.563 57.9956 29.7273C57.9956 28.9572 58.172 28.2513 58.5248 27.5913C58.8864 26.9312 59.3716 26.3995 59.9802 26.0053C60.5976 25.602 61.2679 25.3911 62 25.3545C60.8798 25.2903 59.9361 24.8503 59.1599 24.0069C58.3837 23.1635 57.9956 22.1642 57.9956 21C57.9956 22.1642 57.6075 23.1635 56.8313 24.0069ZM81 25.3545C82.1114 25.2995 83.0551 24.8503 83.8313 24.0069C84.6075 23.1635 84.9956 22.1642 84.9956 21C84.9956 22.1642 85.3837 23.1635 86.1599 24.0069C86.9361 24.8503 87.8798 25.2903 89 25.3545C88.2679 25.3911 87.5976 25.602 86.9802 26.0053C86.3716 26.3995 85.8864 26.9312 85.5248 27.5913C85.172 28.2513 84.9956 28.9572 84.9956 29.7273C84.9956 28.563 84.6075 27.5546 83.8313 26.7112C83.0551 25.8587 82.1114 25.4095 81 25.3545ZM136 36.3545C137.111 36.2995 138.055 35.8503 138.831 35.0069C139.607 34.1635 139.996 33.1642 139.996 32C139.996 33.1642 140.384 34.1635 141.16 35.0069C141.936 35.8503 142.88 36.2903 144 36.3545C143.268 36.3911 142.598 36.602 141.98 37.0053C141.372 37.3995 140.886 37.9312 140.525 38.5913C140.172 39.2513 139.996 39.9572 139.996 40.7273C139.996 39.563 139.607 38.5546 138.831 37.7112C138.055 36.8587 137.111 36.4095 136 36.3545ZM101.831 49.0069C101.055 49.8503 100.111 50.2995 99 50.3545C100.111 50.4095 101.055 50.8587 101.831 51.7112C102.607 52.5546 102.996 53.563 102.996 54.7273C102.996 53.9572 103.172 53.2513 103.525 52.5913C103.886 51.9312 104.372 51.3995 104.98 51.0053C105.598 50.602 106.268 50.3911 107 50.3545C105.88 50.2903 104.936 49.8503 104.16 49.0069C103.384 48.1635 102.996 47.1642 102.996 46C102.996 47.1642 102.607 48.1635 101.831 49.0069Z" fill="currentColor"></path>
                    </svg>
                </div>
                <div className="theme-switch__stars-cluster">
                  <div className="star"></div>
                  <div className="star"></div>
                  <div className="star"></div>
                  <div className="star"></div>
                  <div className="star"></div>
                </div>
                <div className="theme-switch__circle-container">
                  <div className="theme-switch__sun-moon-container">
                    <div className="theme-switch__moon">
                      <div className="theme-switch__spot"></div>
                      <div className="theme-switch__spot"></div>
                      <div className="theme-switch__spot"></div>
                    </div>
                  </div>
                </div>
              </div>
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#495770] dark:text-slate-100 tracking-tight px-1">{t.language}</h2>
          <div className="bg-white dark:bg-[#1a1d24] rounded-xl p-4 shadow-[0px_12px_32px_rgba(25,28,30,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800">
            <p className="text-sm text-[#424656] dark:text-slate-300 mb-4 px-1">{t.languageDesc}</p>
            <div className="grid grid-cols-2 gap-2.5">
              {LANGUAGES.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 text-left group ${
                      isSelected ? 'border-[#004ccc] bg-[#eaf3ff] shadow-sm' : 'border-slate-100 dark:border-slate-800 bg-[#f7f9fb] dark:bg-[#000000] hover:border-slate-200 dark:border-slate-800 hover:bg-white dark:bg-[#1a1d24]'
                    }`}
                  >
                    <span className="text-2xl leading-none" role="img">{lang.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm leading-tight truncate ${isSelected ? 'text-[#004ccc]' : 'text-[#191c1e] dark:text-white'}`}>{lang.nativeName}</p>
                      <p className="text-[11px] text-slate-400 font-medium truncate">{lang.name}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-[#004ccc] rounded-full flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-white text-[14px]">check</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#495770] dark:text-slate-100 tracking-tight px-1">{t.activeSessions}</h2>
          <div className="bg-white dark:bg-[#1a1d24] rounded-xl p-4 shadow-[0px_12px_32px_rgba(25,28,30,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800">
            <div className="flex items-start justify-between py-2">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#eaf3ff] flex items-center justify-center text-[#004ccc] shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">smartphone</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#191c1e] dark:text-white">iPhone 14 Pro</h4>
                  <p className="text-sm text-[#424656] dark:text-slate-300">Madrid, ES • App</p>
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-[#004ccc]/10 text-[#004ccc] text-[10px] font-bold uppercase tracking-widest">{t.currentSession}</span>
                </div>
              </div>
            </div>
            <div className="h-px w-full bg-slate-100 my-4"></div>
            <div className="flex items-start justify-between py-2">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f2f4f6] dark:bg-[#2e3440] flex items-center justify-center text-[#424656] dark:text-slate-300 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">laptop_mac</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#191c1e] dark:text-white">MacBook Air M2</h4>
                  <p className="text-sm text-[#424656] dark:text-slate-300">Madrid, ES • Chrome</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{t.activeAgo}</p>
                </div>
              </div>
              <button onClick={() => handleActionableClick(t.revoke)} className="text-[#ba1a1a] text-sm font-bold hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">{t.revoke}</button>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={onLogout} className="text-[#ba1a1a] font-bold text-sm hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">logout</span>
              {t.logout}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
