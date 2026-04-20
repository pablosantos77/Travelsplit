import React, { useState, useEffect, useRef, MouseEvent } from 'react';
import { Plane, Camera, Plus, X } from 'lucide-react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc, setDoc } from 'firebase/firestore';

import { BottomNav } from './components/BottomNav';
import { TripsPage } from './components/TripsPage';
import { SettingsPage } from './components/SettingsPage';
import { InsightsPage } from './components/InsightsPage';
import { PaymentsPage } from './components/PaymentsPage';
import { Background } from './components/Background';
import { NewTripModal } from './components/NewTripModal';


// Componente Modal de Escaneo
const ScanTicketModal = ({ isOpen, onClose, onScan }: { isOpen: boolean, onClose: () => void, onScan: (data: any) => void }) => {
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
        alert('No se pudo acceder a la cámara. Asegúrate de haber dado permiso.');
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
          alert('Error al procesar el ticket.');
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
    <div className="fixed inset-0 bg-[#0d1c32]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200">
        <h2 className="text-xl font-bold mb-4 text-[#495770]">Escanear Ticket IA</h2>
        
        {!isCameraActive ? (
          <button onClick={() => setIsCameraActive(true)} className="w-full bg-[#191c1e] text-white py-4 rounded-2xl font-bold mb-4 flex items-center justify-center gap-2">
            <Camera className="w-5 h-5" /> Iniciar Cámara
          </button>
        ) : (
          <div className="relative w-full h-80 bg-black rounded-3xl mb-4 overflow-hidden shadow-inner">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 border-[4px] border-white/20 m-6 rounded-2xl"></div>
          </div>
        )}

        <div className="flex gap-4">
          <button onClick={() => { stopCamera(); onClose(); }} className="flex-1 bg-slate-100 py-3 rounded-2xl font-bold text-[#495770]">Cerrar</button>
          {isCameraActive && (
            <button onClick={captureAndScan} className="flex-1 bg-gradient-to-tr from-[#004ccc] to-[#0762ff] text-white py-3 rounded-2xl font-bold shadow-lg shadow-[#004ccc]/20">Analizar Ticket</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
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
      if (mounted) setAuthError(`Error de redirección: ${err.message}`);
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
            console.error('Error al sincronizar collection users:', err);
          }
        }
      }
    });
    return () => {
      mounted = false;
      unsubscribe();
    }
  }, []);

  // Fetch Trips
  useEffect(() => {
    if (user && user.email) {
      try {
        const q = query(collection(db, 'trips'), where('participants', 'array-contains', user.email));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          setTrips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
           console.error('Firestore trips error:', error);
        });
        return () => unsubscribe();
      } catch (err) {
        console.error('Firestore query failed', err);
      }
    } else {
        setTrips([]);
    }
  }, [user]);

  // Fetch Expenses when a selectedTrip changes
  useEffect(() => {
    if (selectedTrip) {
        const q = query(collection(db, 'trips', selectedTrip.id, 'expenses'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const exps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // sort by createdAt if we had one, for now it's unordered
            setExpenses(exps);
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
      console.log("Confirmado: Iniciando borrado de:", tripId);
      await deleteDoc(doc(db, 'trips', tripId));
      setTripToDelete(null);
      setSelectedTrip(null);
      console.log("Viaje borrado satisfactoriamente");
    } catch (error) {
      console.error('Error deleting trip: ', error);
      alert('Error al eliminar: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      setTripToDelete(null);
    }
  };




  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error('Google auth failed', error);
      setAuthError(`Error Google: ${error?.code || error?.message || 'Desconocido'}`);
    }
  };

  const handleEmailAuth = async () => {
    if (!authEmail || !authPassword) { setAuthError('Completa todos los campos.'); return; }
    setAuthLoading(true);
    setAuthError('');
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      } else {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      }
    } catch (error: any) {
      const msgs: Record<string, string> = {
        'auth/user-not-found': 'Usuario no encontrado.',
        'auth/wrong-password': 'Contraseña incorrecta.',
        'auth/email-already-in-use': 'El email ya está registrado.',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
        'auth/invalid-email': 'Email no válido.',
        'auth/invalid-credential': 'Credenciales incorrectas.',
      };
      setAuthError(msgs[error.code] || 'Error al iniciar sesión.');
    } finally {
      setAuthLoading(false);
    }
  };

  // --- Auth View ---
  if (!user) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col bg-slate-50 relative overflow-hidden text-slate-800 font-sans selection:bg-[#004ccc]/20">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-400/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex-1 flex flex-col justify-center px-6 py-12 z-10 w-full max-w-md mx-auto">
          <div className="mb-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-[28px] mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-blue-500/30 rotate-3">
              <span className="material-symbols-outlined text-white text-[40px] -rotate-12">airline_stops</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">TravelSplit <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">AI</span></h1>
            <p className="text-slate-500 text-[15px] font-medium px-4">Inteligencia y diseño para dividir los gastos de tu viaje.</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[32px] shadow-[0_12px_40px_rgb(0,0,0,0.06)] border border-white/50 space-y-5">
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-[#191c1e] text-white h-[56px] rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-transform shadow-lg shadow-slate-900/20"
            >
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24">
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>

            <div className="flex items-center gap-4 py-1">
              <div className="flex-1 h-[1px] bg-slate-200"></div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">o usa tu email</span>
              <div className="flex-1 h-[1px] bg-slate-200"></div>
            </div>

            <div className="space-y-3">
              <input
                type="email"
                placeholder="ejemplo@email.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full bg-[#f7f9fb] border border-slate-200 text-[#495770] px-5 h-[56px] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004ccc]/20 focus:border-[#004ccc] transition-all font-medium placeholder:text-slate-400"
              />
              <input
                type="password"
                placeholder="Tu contraseña"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
                className="w-full bg-[#f7f9fb] border border-slate-200 text-[#495770] px-5 h-[56px] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004ccc]/20 focus:border-[#004ccc] transition-all font-medium placeholder:text-slate-400"
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
              className="w-full bg-gradient-to-r from-[#004ccc] to-[#0762ff] text-white h-[56px] rounded-2xl font-bold flex items-center justify-center shadow-lg shadow-[#004ccc]/25 active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                authMode === 'login' ? 'Iniciar sesión' : 'Crear mi cuenta'
              )}
            </button>

            <button
              onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}
              className="w-full text-center text-[14px] font-semibold text-slate-500 mt-2 hover:text-[#495770] transition-colors"
            >
              {authMode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              <span className="text-[#004ccc]">{authMode === 'login' ? 'Regístrate' : 'Inicia sesión'}</span>
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
    
    console.log("Rendering SelectedTrip View. ID:", tripId);

    return (
      <div className="min-h-[100dvh] bg-[#f7f9fb] flex flex-col font-sans relative">
        <header className="sticky top-0 z-[100] bg-[#f7f9fb]/80 backdrop-blur-xl px-4 py-4 flex items-center justify-between border-b border-transparent">
          <button onClick={() => setSelectedTrip(null)} className="w-10 h-10 flex items-center justify-center text-[#495770] hover:bg-slate-200/50 rounded-full transition-all active:scale-95">
            <span className="material-symbols-outlined absolute translate-x-[-1px]">arrow_back_ios</span>
          </button>
          <h1 className="text-xl font-bold text-[#495770] truncate px-4 flex-1 text-center">{trip?.name || 'Cargando...'}</h1>
          <div 
            onClick={() => {
              if (tripId) setTripToDelete(tripId);
            }} 
            className="w-12 h-12 flex items-center justify-center text-[#ba1a1a] hover:bg-red-50 rounded-full cursor-pointer active:bg-red-100 z-[110]"
            style={{ pointerEvents: 'auto', WebkitTapHighlightColor: 'transparent' }}
          >
            <span className="material-symbols-outlined text-[28px] pointer-events-none">delete</span>
          </div>
        </header>

        {/* Delete Confirmation Modal */}
        {tripToDelete && (
          <div className="fixed inset-0 bg-[#0d1c32]/60 backdrop-blur-md flex items-center justify-center p-6 z-[200] animate-fadeIn">
            <div className="bg-white w-full max-w-xs rounded-[32px] p-8 shadow-2xl animate-scaleUp">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-3xl">delete_forever</span>
              </div>
              <h3 className="text-xl font-bold text-[#191c1e] text-center mb-2">¿Borrar viaje?</h3>
              <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">
                Esta acción es irreversible y se perderán todos los gastos registrados.
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => handleDeleteTrip(tripToDelete)}
                  className="w-full bg-[#ba1a1a] text-white py-4 rounded-2xl font-bold active:scale-[0.98] transition-all"
                >
                  Sí, eliminar viaje
                </button>
                <button 
                  onClick={() => setTripToDelete(null)}
                  className="w-full bg-slate-100 text-[#495770] py-4 rounded-2xl font-bold active:scale-[0.98] transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}




        <main className="flex-1 max-w-md mx-auto w-full px-6 py-6 pb-24 space-y-8">
            <div className="bg-white rounded-3xl p-6 shadow-[0_12px_32px_rgba(25,28,30,0.06)] relative overflow-hidden">
                <div className="mb-6">

                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Presupuesto Estimado</div>
                    <div className="text-5xl font-extrabold text-[#495770] tracking-tighter">{trip?.budget || 0}€</div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {trip?.participants?.slice(0,3).map((p: string, i: number) => (
                            <div key={p} className="w-8 h-8 rounded-full bg-[#004ccc] text-white border-2 border-white flex items-center justify-center text-[10px] font-bold z-10" style={{zIndex: 10 - i}}>
                                {p.charAt(0).toUpperCase()}
                            </div>
                        ))}
                        {trip?.participants?.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 border-2 border-white flex items-center justify-center text-[10px] font-bold z-0">
                                +{trip.participants.length - 3}
                            </div>
                        )}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">{trip?.participants?.length || 0} personas participan</div>
                </div>
            </div>

            <button className="w-full bg-gradient-to-tr from-[#004ccc] to-[#0762ff] text-white p-5 rounded-2xl shadow-lg shadow-[#004ccc]/30 flex items-center justify-between active:scale-[0.98] transition-all group hover:opacity-90" onClick={() => setIsScanModalOpen(true)}>
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-white">document_scanner</span>
                    </div>
                    <div className="text-left">
                        <h2 className="text-lg font-bold leading-tight drop-shadow-sm">Escanear Ticket IA</h2>
                        <p className="text-blue-100/90 text-[11px] font-semibold tracking-wide uppercase mt-0.5">Capturar y procesar</p>
                    </div>
                </div>
                <span className="material-symbols-outlined text-white/50 group-hover:text-white group-hover:-rotate-12 transition-all">center_focus_strong</span>
            </button>

            <div>
                <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-2 mb-3">Añadir Gasto Manual</h2>
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(25,28,30,0.04)] p-5">
                    <form onSubmit={handleAddExpense} className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Descripción (ej. Cena, Taxi...)" 
                            className="w-full px-4 py-3 bg-[#f7f9fb] border-none rounded-xl focus:ring-2 focus:ring-[#004ccc]/20 focus:outline-[#004ccc] transition-colors font-medium text-[#495770] placeholder:text-slate-400"
                            value={newExpense.description}
                            onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                            required
                        />
                        <div className="flex gap-4">
                            <input 
                                type="number" 
                                step="0.01"
                                placeholder="Total (€)" 
                                className="flex-1 px-4 py-3 bg-[#f7f9fb] border-none rounded-xl focus:ring-2 focus:ring-[#004ccc]/20 focus:outline-[#004ccc] transition-colors font-medium text-[#495770] placeholder:text-slate-400"
                                value={newExpense.amount}
                                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                                required
                            />
                            <select 
                                className="w-32 px-4 py-3 bg-[#f7f9fb] border-none rounded-xl focus:ring-2 focus:ring-[#004ccc]/20 focus:outline-[#004ccc] transition-colors text-[#495770] font-medium appearance-none"
                                value={newExpense.paidBy}
                                onChange={(e) => setNewExpense({...newExpense, paidBy: e.target.value})}
                                required
                            >
                                <option value="" disabled>Pagó...</option>
                                {trip?.participants.map((p: string) => (
                                    <option key={p} value={p}>{p.split('@')[0]}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-[#191c1e] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 mt-2 hover:bg-[#39475f] active:scale-[0.98] transition-all">
                            <span className="material-symbols-outlined text-[18px]">add_circle</span>
                            Añadir al Viaje
                        </button>
                    </form>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between ml-2 mb-3">
                    <h3 className="font-bold text-[11px] text-slate-400 uppercase tracking-widest">Historial de Gastos</h3>
                </div>
                
                <div className="space-y-3">
                    {expenses.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-slate-200 opacity-70">
                             <span className="material-symbols-outlined text-[#616f89] text-3xl mb-2">receipt_long</span>
                             <p className="text-[#495770] text-sm font-medium">No hay gastos en este viaje aún.</p>
                        </div>
                    ) : (
                        expenses.map(exp => (
                            <div key={exp.id} className="bg-white p-4 rounded-2xl shadow-[0_4px_20px_rgba(25,28,30,0.02)] flex py-4 px-5 justify-between items-center group cursor-pointer hover:border-slate-300 transition-colors">
                                <div className="flex gap-4 items-center">
                                    <div className="w-10 h-10 bg-[#eaf3ff] text-[#004ccc] rounded-xl flex items-center justify-center font-bold">
                                         <span className="material-symbols-outlined text-[18px]">restaurant</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#495770]">{exp.description}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-semibold uppercase tracking-wide">
                                            {exp.paidBy.split('@')[0]}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-extrabold text-lg text-slate-800 tracking-tight">{Number(exp.amount).toFixed(2)}{exp.currency || '€'}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
        
        <ScanTicketModal isOpen={isScanModalOpen} onClose={() => setIsScanModalOpen(false)} onScan={(data) => {
            setNewExpense({...newExpense, description: data.description || 'Gasto Escaneado', amount: data.amount ? data.amount.toString() : '0'});
        }} />
      </div>
    );
  }

  // --- APP MAIN LAYOUT (Tabs) ---
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-hidden text-slate-800 font-sans selection:bg-[#004ccc]/20 relative">
      <Background />
      <div className="flex-1 w-full bg-transparent overflow-y-auto relative z-10">

        {currentTab === 'trips' && (
            <TripsPage 
              trips={trips} 
              onOpenNewTripModal={() => setIsNewTripModalOpen(true)} 
              onManageTrip={(trip) => setSelectedTrip(trip)} 
            />
        )}
        
        {currentTab === 'payments' && (
            <PaymentsPage />
        )}


        {currentTab === 'insights' && <InsightsPage user={user} trips={trips} />}

        {currentTab === 'settings' && <SettingsPage user={user} onLogout={() => signOut(auth)} />}
      </div>

      <BottomNav currentTab={currentTab} onChange={setCurrentTab} />

      <NewTripModal isOpen={isNewTripModalOpen} onClose={() => setIsNewTripModalOpen(false)} onSave={() => { /* Realtime will update list */ }} />
      <ScanTicketModal isOpen={isScanModalOpen} onClose={() => setIsScanModalOpen(false)} onScan={(data) => {
          console.log("Global OCR data", data);
          setIsScanModalOpen(false);
          alert(`OCR Result: ${data.description} - ${data.amount}€`);
      }} />
    </div>
  );
}
