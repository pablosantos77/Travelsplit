
import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc, setDoc } from 'firebase/firestore';

import LoginPage from './components/LoginPage';
import { BottomNav } from './components/BottomNav';
import { TripsPage } from './components/TripsPage';
import { SettingsPage } from './components/SettingsPage';
import { InsightsPage } from './components/InsightsPage';
import { PaymentsPage } from './components/PaymentsPage';
import { NewTripModal } from './components/NewTripModal';
import { useLanguage } from './contexts/LanguageContext';
import { ShineBorder } from './components/magicui/ShineBorder';

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
      <div className="bg-white dark:bg-[#1a1d24] w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold mb-4 text-[#495770] dark:text-slate-100">{t.modals.scanTitle}</h2>
        
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
          <button onClick={() => { stopCamera(); onClose(); }} className="flex-1 bg-slate-100 py-3 rounded-2xl font-bold text-[#495770] dark:text-slate-100">{t.modals.close}</button>
          {isCameraActive && (
            <button onClick={captureAndScan} className="flex-1 bg-gradient-to-tr from-[#004ccc] to-[#0762ff] text-white py-3 rounded-2xl font-bold">{t.modals.analyze}</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const { language, t } = useLanguage();
  const at = t.auth;
  const tt = t.trips;
  const mt = t.modals;
  const nt = t.nav;
  
  const [user, setUser] = useState<User | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', paidBy: '' });
  
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  
  const [currentTab, setCurrentTab] = useState<'trips' | 'payments' | 'insights' | 'settings'>('trips');
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
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
        const tripId = typeof selectedTrip === 'string' ? selectedTrip : selectedTrip.id;
        if (!tripId) return;
        const q = query(collection(db, 'trips', tripId, 'expenses'));
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
    
    const tripId = typeof selectedTrip === 'string' ? selectedTrip : selectedTrip.id;
    if (!tripId) return;

    try {
        await addDoc(collection(db, 'trips', tripId, 'expenses'), {
            description: newExpense.description,
            amount: parseFloat(newExpense.amount),
            paidBy: newExpense.paidBy,
            currency: '€',
            createdAt: new Date().toISOString()
        });
        setNewExpense({ description: '', amount: '', paidBy: '' });
    } catch (err) {
        console.error('Error adding expense:', err);
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
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Google auth failed', error);
      setAuthError(error.message);
    }
  };

  const handleEmailAuth = async () => {
    if (!authEmail || !authPassword) { setAuthError(at?.errorFields || 'Error'); return; }
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
    return (
      <LoginPage
        email={authEmail}
        setEmail={setAuthEmail}
        password={authPassword}
        setPassword={setAuthPassword}
        onEmailAuth={handleEmailAuth}
        onGoogleLogin={handleGoogleLogin}
        authError={authError}
        authLoading={authLoading}
        authMode={authMode}
        setAuthMode={setAuthMode}
        translations={t}
      />
    );
  }

  // --- Selected Trip View ---
  if (selectedTrip) {
    const tripId = typeof selectedTrip === 'string' ? selectedTrip : selectedTrip.id;
    const trip = trips.find(tr => tr.id === tripId) || (typeof selectedTrip === 'object' ? (selectedTrip as any) : null);

    return (
      <div className="min-h-[100dvh] bg-[#f7f9fb] dark:bg-[#000000] flex flex-col font-sans relative">
        <header className="sticky top-0 z-[100] bg-[#f7f9fb] dark:bg-[#000000]/80 backdrop-blur-xl px-4 py-4 flex items-center justify-between">
          <button onClick={() => setSelectedTrip(null)} className="w-10 h-10 flex items-center justify-center text-[#495770] dark:text-slate-100 hover:bg-slate-200/50 rounded-full">
            <span className="material-symbols-outlined absolute translate-x-[-1px]">arrow_back_ios</span>
          </button>
          <h1 className="text-xl font-bold text-[#495770] dark:text-slate-100 truncate px-4 flex-1 text-center">{trip?.name || '...'}</h1>
          <div onClick={() => tripId && setTripToDelete(tripId)} className="w-12 h-12 flex items-center justify-center text-[#ba1a1a] hover:bg-red-50 rounded-full cursor-pointer">
            <span className="material-symbols-outlined text-[28px]">delete</span>
          </div>
        </header>

        {tripToDelete && (
          <div className="fixed inset-0 bg-[#0d1c32]/60 backdrop-blur-md flex items-center justify-center p-6 z-[250] animate-fadeIn">
            <div className="bg-white dark:bg-[#1a1d24] w-full max-w-xs rounded-[32px] p-8 shadow-2xl">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-3xl">delete_forever</span>
              </div>
              <h3 className="text-xl font-bold text-[#191c1e] dark:text-white text-center mb-2">{mt.deleteTrip}</h3>
              <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">{mt.deleteDesc}</p>
              <div className="space-y-3">
                <button onClick={() => handleDeleteTrip(tripToDelete)} className="w-full bg-[#ba1a1a] text-white py-4 rounded-2xl font-bold">{mt.confirmDelete}</button>
                <button onClick={() => setTripToDelete(null)} className="w-full bg-slate-100 text-[#495770] dark:text-slate-100 py-4 rounded-2xl font-bold">{mt.cancel}</button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 max-w-md mx-auto w-full px-6 py-6 pb-24 space-y-8">
            <div className="bg-white dark:bg-[#1a1d24] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="mb-6">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{tt.budget}</div>
                    <div className="text-5xl font-extrabold text-[#495770] dark:text-slate-100 tracking-tighter">{trip?.budget || 0}€</div>
                </div>
                <div className="mb-6">
                   <h3 className="text-[22px] font-extrabold text-[#191c1e] dark:text-white tracking-tight">{trip?.destination || tt.pendingDest}</h3>
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
                    <div className="bg-white dark:bg-[#1a1d24]/20 p-2.5 rounded-xl">
                        <span className="material-symbols-outlined text-white">document_scanner</span>
                    </div>
                    <div className="text-left">
                        <h2 className="text-lg font-bold leading-tight">{mt.scanTitle}</h2>
                    </div>
                </div>
                <span className="material-symbols-outlined text-white/50 group-hover:text-white transition-all">center_focus_strong</span>
            </button>

            <div>
                <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-2 mb-3">{tt.manualExpense}</h2>
                <div className="bg-white dark:bg-[#1a1d24] rounded-2xl shadow-sm p-5 border border-slate-100 dark:border-slate-800">
                    <form onSubmit={handleAddExpense} className="space-y-4">
                        <input type="text" placeholder={tt.descPlaceholder} className="w-full px-4 py-3 bg-[#f7f9fb] dark:bg-[#000000] rounded-xl focus:ring-2 focus:ring-[#004ccc]/20 focus:outline-none" value={newExpense.description} onChange={(e) => setNewExpense({...newExpense, description: e.target.value})} required />
                        <div className="flex gap-4">
                            <input type="number" step="0.01" placeholder={tt.amountPlaceholder} className="flex-1 px-4 py-3 bg-[#f7f9fb] dark:bg-[#000000] rounded-xl focus:ring-2 focus:ring-[#004ccc]/20 focus:outline-none" value={newExpense.amount} onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} required />
                            <select className="w-32 px-4 py-3 bg-[#f7f9fb] dark:bg-[#000000] rounded-xl focus:ring-2 focus:ring-[#004ccc]/20 focus:outline-none" value={newExpense.paidBy} onChange={(e) => setNewExpense({...newExpense, paidBy: e.target.value})} required>
                                <option value="" disabled>{tt.paidBy}</option>
                                {trip?.participants?.map((p: string) => (
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
                        <div className="bg-white dark:bg-[#1a1d24] rounded-2xl p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 opacity-70">
                             <p className="text-[#495770] dark:text-slate-100 text-sm font-medium">{tt.noExpenses}</p>
                        </div>
                    ) : (
                        expenses.map(exp => (
                            <div key={exp.id} className="bg-white dark:bg-[#1a1d24] p-4 rounded-2xl shadow-sm flex justify-between items-center border border-slate-50">
                                <div className="flex gap-4 items-center">
                                    <div className="w-10 h-10 bg-[#eaf3ff] text-[#004ccc] rounded-xl flex items-center justify-center font-bold">
                                         <span className="material-symbols-outlined text-[18px]">restaurant</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#495770] dark:text-slate-100">{exp.description}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wide font-bold">{exp?.paidBy?.split('@')[0] || '?'}</p>
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
            setNewExpense({...newExpense, description: data.description || tt.scannedExpense, amount: data.amount ? data.amount.toString() : '0'});
        }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#1a1d24] overflow-hidden text-slate-800 font-sans selection:bg-[#004ccc]/20">
      <div className="flex-1 w-full bg-[#f7f9fb] dark:bg-[#000000] overflow-y-auto">
        {currentTab === 'trips' && <TripsPage trips={trips} onOpenNewTripModal={() => setIsNewTripModalOpen(true)} onManageTrip={(trip) => setSelectedTrip(trip)} />}
        {currentTab === 'payments' && <PaymentsPage user={user} trips={trips} onOpenScanModal={() => setIsScanModalOpen(true)} />}
        {currentTab === 'insights' && <InsightsPage user={user} trips={trips} />}
        {currentTab === 'settings' && <SettingsPage user={user} onLogout={() => signOut(auth)} />}
      </div>
      <BottomNav currentTab={currentTab} onChange={setCurrentTab} />
      <NewTripModal isOpen={isNewTripModalOpen} onClose={() => setIsNewTripModalOpen(false)} onSave={() => {}} />
      <ScanTicketModal isOpen={isScanModalOpen} onClose={() => setIsScanModalOpen(false)} onScan={(data) => {
          setIsScanModalOpen(false);
          setNewExpense({...newExpense, description: data.description || tt.scannedExpense, amount: data.amount ? data.amount.toString() : '0'});
      }} />
    </div>
  );
}
