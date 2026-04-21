
import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc, setDoc } from 'firebase/firestore';

import { BottomNav } from './components/BottomNav';
import { TripsPage } from './components/TripsPage';
import { SettingsPage } from './components/SettingsPage';
import { InsightsPage } from './components/InsightsPage';
import { PaymentsPage } from './components/PaymentsPage';
import { NewTripModal } from './components/NewTripModal';
import { useLanguage } from './contexts/LanguageContext';

const ScanTicketModal = ({ isOpen, onClose, onScan }: { isOpen: boolean, onClose: () => void, onScan: (data: any) => void }) => {
  const { t } = useLanguage();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera', error);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      } catch (fallbackError) {
        console.error('Fallback camera access failed', fallbackError);
        alert(t.modals.errorCamera || 'Error');
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const captureAndScan = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const image = canvasRef.current.toDataURL('image/jpeg');
        
        try {
          const response = await fetch('/api/ocr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image })
          });
          const data = await response.json();
          onScan(data);
          stopCamera();
          onClose();
        } catch (error) {
          console.error('OCR failed', error);
          alert(t.modals.errorOCR || 'Error');
        }
      }
    }
  };

  useEffect(() => {
    if (isOpen && isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen, isCameraActive]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0d1c32]/50 backdrop-blur-sm flex items-center justify-center p-4 z-[200]">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200">
        <h2 className="text-xl font-bold mb-4 text-[#495770]">{t.modals.scanTitle}</h2>
        
        {!isCameraActive ? (
          <button onClick={() => setIsCameraActive(true)} className="w-full bg-[#191c1e] text-white py-4 rounded-2xl font-bold mb-4 flex items-center justify-center gap-2">
            <Camera className="w-5 h-5" /> {t.modals.startCamera}
          </button>
        ) : (
          <div className="relative w-full h-80 bg-black rounded-3xl mb-4 overflow-hidden shadow-inner">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 border-[4px] border-white/20 m-6 rounded-2xl"></div>
          </div>
        )}

        <div className="flex gap-4">
          <button onClick={() => { stopCamera(); onClose(); }} className="flex-1 bg-slate-100 py-3 rounded-2xl font-bold text-[#495770]">{t.modals.close}</button>
          {isCameraActive && (
            <button onClick={captureAndScan} className="flex-1 bg-gradient-to-tr from-[#004ccc] to-[#0762ff] text-white py-3 rounded-2xl font-bold">{t.modals.analyze}</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', paidBy: '' });
  
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  
  const [currentTab, setCurrentTab] = useState<'trips' | 'payments' | 'insights' | 'settings'>('trips');
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getRedirectResult(auth).then((result) => {
      if (mounted && result?.user) setUser(result.user);
    }).catch((err) => {
      console.error('Redirect result error:', err);
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (mounted) {
        setUser(currentUser);
        if (currentUser && currentUser.email) {
          try {
            await setDoc(doc(db, 'users', currentUser.uid), {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || ''
            }, { merge: true });
          } catch (err) {
            console.error('Error syncing user:', err);
          }
        }
      }
    });
    return () => {
      mounted = false;
      unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (user && user.email) {
      const q = query(collection(db, 'trips'), where('participants', 'array-contains', user.email));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setTrips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    } else {
        setTrips([]);
    }
  }, [user]);

  useEffect(() => {
    if (selectedTrip) {
        const q = query(collection(db, 'trips', selectedTrip.id, 'expenses'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    } else {
        setExpenses([]);
    }
  }, [selectedTrip]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip || !newExpense.description || !newExpense.amount || !newExpense.paidBy) return;
    
    try {
        await addDoc(collection(db, 'trips', selectedTrip.id, 'expenses'), {
            description: newExpense.description,
            amount: parseFloat(newExpense.amount),
            paidBy: newExpense.paidBy,
            currency: '€',
            createdAt: new Date().toISOString()
        });
        setNewExpense({ description: '', amount: '', paidBy: '' });
    } catch(err) {
        console.error("Error adding expense", err);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      await deleteDoc(doc(db, 'trips', tripId));
      setTripToDelete(null);
      setSelectedTrip(null);
    } catch (error) {
      console.error('Error deleting trip: ', error);
      setTripToDelete(null);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error('Google auth failed', error);
    }
  };

  const handleEmailAuth = async () => {
    if (!authEmail || !authPassword) { setAuthError(t.auth.errorFields || 'Error'); return; }
    setAuthLoading(true);
    setAuthError('');
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      } else {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      }
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  if (!user) {
    const at = t.auth;
    return (
      <div className="min-h-[100dvh] w-full flex flex-col bg-slate-50 relative overflow-hidden text-slate-800 font-sans selection:bg-[#004ccc]/20">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-400/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex-1 flex flex-col justify-center px-6 py-12 z-10 w-full max-w-md mx-auto">
          <div className="mb-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-[28px] mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-blue-500/30 rotate-3">
              <span className="material-symbols-outlined text-white text-[40px] -rotate-12">airline_stops</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">{at.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">AI</span></h1>
            <p className="text-slate-500 text-[15px] font-medium px-4">{at.subtitle}</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[32px] shadow-[0_12px_40px_rgb(0,0,0,0.06)] border border-white/50 space-y-5">
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-[#191c1e] text-white h-[56px] rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20"
            >
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24">
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {at.google}
            </button>

            <div className="flex items-center gap-4 py-1">
              <div className="flex-1 h-[1px] bg-slate-200"></div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{at.orEmail}</span>
              <div className="flex-1 h-[1px] bg-slate-200"></div>
            </div>

            <div className="space-y-3">
              <input
                type="email"
                placeholder={at.emailPlaceholder}
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full bg-[#f7f9fb] border border-slate-200 text-[#495770] px-5 h-[56px] rounded-2xl focus:outline-none focus:border-[#004ccc] transition-all font-medium"
              />
              <input
                type="password"
                placeholder={at.passPlaceholder}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
                className="w-full bg-[#f7f9fb] border border-slate-200 text-[#495770] px-5 h-[56px] rounded-2xl focus:outline-none focus:border-[#004ccc] transition-all font-medium"
              />
            </div>

            {authError && (
              <div className="bg-[#ba1a1a]/10 text-[#ba1a1a] text-[13px] font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <p className="leading-tight">{authError}</p>
              </div>
            )}

            <button
              onClick={handleEmailAuth}
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-[#004ccc] to-[#0762ff] text-white h-[56px] rounded-2xl font-bold flex items-center justify-center shadow-lg active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                authMode === 'login' ? at.login : at.register
              )}
            </button>

            <button
              onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}
              className="w-full text-center text-[14px] font-semibold text-slate-500 mt-2"
            >
              {authMode === 'login' ? at.noAccount : at.hasAccount}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Selected Trip View ---
  if (selectedTrip) {
    const tripId = typeof selectedTrip === 'string' ? selectedTrip : selectedTrip.id;
    const trip = trips.find(t => t.id === tripId) || (typeof selectedTrip === 'object' ? selectedTrip : null);
    const tt = t.trips;
    const tm = t.modals;

    return (
      <div className="min-h-[100dvh] bg-[#f7f9fb] flex flex-col font-sans relative">
        <header className="sticky top-0 z-[100] bg-[#f7f9fb]/80 backdrop-blur-xl px-4 py-4 flex items-center justify-between">
          <button onClick={() => setSelectedTrip(null)} className="w-10 h-10 flex items-center justify-center text-[#495770] hover:bg-slate-200/50 rounded-full">
            <span className="material-symbols-outlined absolute translate-x-[-1px]">arrow_back_ios</span>
          </button>
          <h1 className="text-xl font-bold text-[#495770] truncate px-4 flex-1 text-center">{trip?.name || '...'}</h1>
          <div onClick={() => tripId && setTripToDelete(tripId)} className="w-12 h-12 flex items-center justify-center text-[#ba1a1a] hover:bg-red-50 rounded-full cursor-pointer">
            <span className="material-symbols-outlined text-[28px]">delete</span>
          </div>
        </header>

        {tripToDelete && (
          <div className="fixed inset-0 bg-[#0d1c32]/60 backdrop-blur-md flex items-center justify-center p-6 z-[250] animate-fadeIn">
            <div className="bg-white w-full max-w-xs rounded-[32px] p-8 shadow-2xl">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-3xl">delete_forever</span>
              </div>
              <h3 className="text-xl font-bold text-[#191c1e] text-center mb-2">{tm.deleteTrip}</h3>
              <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">{tm.deleteDesc}</p>
              <div className="space-y-3">
                <button onClick={() => handleDeleteTrip(tripToDelete)} className="w-full bg-[#ba1a1a] text-white py-4 rounded-2xl font-bold">{tm.confirmDelete}</button>
                <button onClick={() => setTripToDelete(null)} className="w-full bg-slate-100 text-[#495770] py-4 rounded-2xl font-bold">{tm.cancel}</button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 max-w-md mx-auto w-full px-6 py-6 pb-24 space-y-8">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="mb-6">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{tt.budget}</div>
                    <div className="text-5xl font-extrabold text-[#495770] tracking-tighter">{trip?.budget || 0}€</div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {trip?.participants?.slice(0,3).map((p: string, i: number) => (
                            <div key={p} className="w-8 h-8 rounded-full bg-[#004ccc] text-white border-2 border-white flex items-center justify-center text-[10px] font-bold" style={{zIndex: 10 - i}}>
                                {p.charAt(0).toUpperCase()}
                            </div>
                        ))}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">{trip?.participants?.length || 0} {tt.guests}</div>
                </div>
            </div>

            <button className="w-full bg-gradient-to-tr from-[#004ccc] to-[#616f89] text-white p-5 rounded-2xl shadow-lg flex items-center justify-between group" onClick={() => setIsScanModalOpen(true)}>
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-2.5 rounded-xl">
                        <span className="material-symbols-outlined text-white">document_scanner</span>
                    </div>
                    <div className="text-left">
                        <h2 className="text-lg font-bold leading-tight">{tm.scanTitle}</h2>
                    </div>
                </div>
                <span className="material-symbols-outlined text-white/50 group-hover:text-white transition-all">center_focus_strong</span>
            </button>

            <div>
                <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-2 mb-3">{tt.manualExpense}</h2>
                <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
                    <form onSubmit={handleAddExpense} className="space-y-4">
                        <input type="text" placeholder={tt.descPlaceholder} className="w-full px-4 py-3 bg-[#f7f9fb] rounded-xl focus:ring-2 focus:ring-[#004ccc]/20 focus:outline-none" value={newExpense.description} onChange={(e) => setNewExpense({...newExpense, description: e.target.value})} required />
                        <div className="flex gap-4">
                            <input type="number" step="0.01" placeholder={tt.amountPlaceholder} className="flex-1 px-4 py-3 bg-[#f7f9fb] rounded-xl focus:ring-2 focus:ring-[#004ccc]/20 focus:outline-none" value={newExpense.amount} onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} required />
                            <select className="w-32 px-4 py-3 bg-[#f7f9fb] rounded-xl focus:ring-2 focus:ring-[#004ccc]/20 focus:outline-none" value={newExpense.paidBy} onChange={(e) => setNewExpense({...newExpense, paidBy: e.target.value})} required>
                                <option value="" disabled>{tt.paidBy}</option>
                                {trip?.participants.map((p: string) => (
                                    <option key={p} value={p}>{p.split('@')[0]}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-[#191c1e] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 mt-2">{tt.addExpense}</button>
                    </form>
                </div>
            </div>

            <div>
                <h3 className="font-bold text-[11px] text-slate-400 uppercase tracking-widest ml-2 mb-3">{tt.history}</h3>
                <div className="space-y-3">
                    {expenses.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-slate-200 opacity-70">
                             <p className="text-[#495770] text-sm font-medium">{tt.noExpenses}</p>
                        </div>
                    ) : (
                        expenses.map(exp => (
                            <div key={exp.id} className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center border border-slate-50">
                                <div className="flex gap-4 items-center">
                                    <div className="w-10 h-10 bg-[#eaf3ff] text-[#004ccc] rounded-xl flex items-center justify-center font-bold">
                                         <span className="material-symbols-outlined text-[18px]">restaurant</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#495770]">{exp.description}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wide font-bold">{exp.paidBy.split('@')[0]}</p>
                                    </div>
                                </div>
                                <p className="font-extrabold text-lg text-slate-800">{Number(exp.amount).toFixed(2)}{exp.currency || '€'}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
        
        <ScanTicketModal isOpen={isScanModalOpen} onClose={() => setIsScanModalOpen(false)} onScan={(data) => {
            setNewExpense({...newExpense, description: data.description || t.trips.scannedExpense, amount: data.amount ? data.amount.toString() : '0'});
        }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden text-slate-800 font-sans selection:bg-[#004ccc]/20">
      <div className="flex-1 w-full bg-[#f7f9fb] overflow-y-auto">
        {currentTab === 'trips' && <TripsPage trips={trips} onOpenNewTripModal={() => setIsNewTripModalOpen(true)} onManageTrip={(trip) => setSelectedTrip(trip)} />}
        {currentTab === 'payments' && <PaymentsPage user={user} trips={trips} onOpenScanModal={() => setIsScanModalOpen(true)} />}
        {currentTab === 'insights' && <InsightsPage user={user} trips={trips} />}
        {currentTab === 'settings' && <SettingsPage user={user} onLogout={() => signOut(auth)} />}
      </div>
      <BottomNav currentTab={currentTab} onChange={setCurrentTab} />
      <NewTripModal isOpen={isNewTripModalOpen} onClose={() => setIsNewTripModalOpen(false)} onSave={() => {}} />
      <ScanTicketModal isOpen={isScanModalOpen} onClose={() => setIsScanModalOpen(false)} onScan={(data) => {
          setIsScanModalOpen(false);
          // Localize the success message if needed, or just set it
          setNewExpense({...newExpense, description: data.description || t.trips.scannedExpense, amount: data.amount ? data.amount.toString() : '0'});
      }} />
    </div>
  );
}
