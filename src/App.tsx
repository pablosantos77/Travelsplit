/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, MouseEvent } from 'react';
import { Folder, Plus, ChevronRight, Plane, LogIn, X, Trash2, Camera } from 'lucide-react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc } from 'firebase/firestore';

// Componente Modal
const NewTripModal = ({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (trip: any) => void }) => {
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState('');

  const handleSave = async () => {
    if (!auth.currentUser) return;
    
    const tripData = {
      name,
      destination,
      budget: parseFloat(budget),
      startDate,
      endDate,
      participants: [...participants, auth.currentUser.email],
      createdBy: auth.currentUser.uid
    };

    try {
      const docRef = await addDoc(collection(db, 'trips'), tripData);
      onSave({ ...tripData, id: docRef.id });
      onClose();
    } catch (error) {
      console.error('Error adding trip: ', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-50 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Nuevo Viaje</h2>
          <button onClick={onClose}><X className="w-6 h-6 text-slate-400" /></button>
        </div>
        
        <div className="space-y-4">
          <input type="text" placeholder="Nombre del viaje" className="w-full p-3 rounded-2xl border border-slate-200" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="text" placeholder="Destino" className="w-full p-3 rounded-2xl border border-slate-200" value={destination} onChange={(e) => setDestination(e.target.value)} />
          <input type="number" placeholder="Presupuesto total (€)" className="w-full p-3 rounded-2xl border border-slate-200" value={budget} onChange={(e) => setBudget(e.target.value)} />
          
          <div className="grid grid-cols-2 gap-4">
            <input type="date" className="p-3 rounded-2xl border border-slate-200" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" className="p-3 rounded-2xl border border-slate-200" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <div className="flex gap-2">
            <input type="text" placeholder="Añadir participante (email)" className="flex-1 p-3 rounded-2xl border border-slate-200" value={newParticipant} onChange={(e) => setNewParticipant(e.target.value)} />
            <button onClick={() => { setParticipants([...participants, newParticipant]); setNewParticipant(''); }} className="bg-slate-200 p-3 rounded-2xl"><Plus /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {participants.map((p, i) => <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{p}</span>)}
          </div>
        </div>

        <button onClick={handleSave} className="w-full mt-6 bg-[#0066ff] text-white py-4 rounded-2xl font-bold">Crear Viaje</button>
      </div>
    </div>
  );
};


// Componente Modal de Escaneo
const ScanTicketModal = ({ isOpen, onClose, onScan }: { isOpen: boolean, onClose: () => void, onScan: (data: any) => void }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      // Try to get any video input device first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefer back camera
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera', error);
      // Fallback to any camera if 'environment' fails
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-50 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200">
        <h2 className="text-xl font-bold mb-4">Escanear Ticket</h2>
        
        {!isCameraActive ? (
          <button onClick={() => setIsCameraActive(true)} className="w-full bg-slate-800 text-white py-3 rounded-2xl font-bold mb-4 flex items-center justify-center gap-2">
            <Camera className="w-5 h-5" /> Usar Cámara
          </button>
        ) : (
          <div className="relative w-full h-64 bg-black rounded-2xl mb-4 overflow-hidden">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        <div className="flex gap-4">
          <button onClick={() => { stopCamera(); onClose(); }} className="flex-1 bg-slate-200 py-3 rounded-2xl font-bold">Cancelar</button>
          {isCameraActive && (
            <button onClick={captureAndScan} className="flex-1 bg-[#0066ff] text-white py-3 rounded-2xl font-bold">Capturar y Procesar</button>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsScreen = () => (
  <div className="min-h-screen bg-[#f4f7f9] text-[#1a1c1e] flex flex-col pb-24">
    <header className="h-[70px] bg-white border-b border-[#e9ecef] flex items-center justify-between px-6">
        <div className="font-bold text-lg">Settings</div>
        <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
    </header>
    <main className="flex-1 p-6">
        <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-white text-3xl font-bold mb-4">
                {auth.currentUser?.email?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold">Perfil de Usuario</h2>
            <p className="text-slate-500">{auth.currentUser?.email}</p>
            <div className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-bold mt-2">PREMIUM MEMBER</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                <div className="text-blue-600 mb-2">✈</div>
                <div className="text-2xl font-bold">24</div>
                <div className="text-xs text-slate-500">TRIPS JOINED</div>
            </div>
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                <div className="text-blue-600 mb-2">💰</div>
                <div className="text-2xl font-bold">$12,450</div>
                <div className="text-xs text-slate-500">TOTAL SETTLED</div>
            </div>
        </div>

        <div className="text-sm font-bold text-slate-500 mb-4">ACCOUNT SETTINGS</div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 divide-y divide-slate-100">
            <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">👤</div>
                <div className="flex-1">
                    <div className="font-bold">Account Details</div>
                    <div className="text-xs text-slate-500">Personal info, passport, preferences</div>
                </div>
                <ChevronRight className="text-slate-400" />
            </div>
            <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">🛡️</div>
                <div className="flex-1">
                    <div className="font-bold">Security</div>
                    <div className="text-xs text-slate-500">2FA, Password, Session management</div>
                </div>
                <ChevronRight className="text-slate-400" />
            </div>
            <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">🔔</div>
                <div className="flex-1">
                    <div className="font-bold">Notifications</div>
                    <div className="text-xs text-slate-500">Trip alerts, Split updates, OCR alerts</div>
                </div>
                <ChevronRight className="text-slate-400" />
            </div>
        </div>

        <button onClick={() => signOut(auth)} className="w-full mt-8 text-red-600 font-bold flex items-center justify-center gap-2">
            <LogIn className="w-5 h-5 rotate-180" /> Sign Out
        </button>
    </main>
  </div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState('TRIPS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [lastScan, setLastScan] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);

  useEffect(() => {
    // Handle Google redirect result on page load
    getRedirectResult(auth).then((result) => {
      if (result?.user) setUser(result.user);
    }).catch((err) => console.error('Redirect result error:', err));

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'trips'), where('participants', 'array-contains', user.email));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setTrips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [user]);

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Volvemos a usar el popup que es más rápido y fluido ahora que el dominio está autorizado
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google auth failed', error);
      setAuthError('Error al iniciar sesión con Google. Revisa que no haya bloqueadores de pop-ups.');
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

  const deleteTrip = async (e: MouseEvent, tripId: string) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que quieres eliminar este viaje?')) {
      try {
        await deleteDoc(doc(db, 'trips', tripId));
      } catch (error) {
        console.error('Error deleting trip: ', error);
        alert('Error al eliminar el viaje: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9] p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
          <h1 className="text-3xl font-extrabold mb-1 text-[#0066ff]">TravelSplit AI</h1>
          <p className="text-sm text-[#6c757d] mb-6">Organiza y divide gastos de viaje con IA.</p>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-[#1a1c1e] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 mb-6 hover:bg-[#333] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative text-center"><span className="bg-white px-3 text-xs text-slate-400 font-semibold">O CON EMAIL</span></div>
          </div>

          {/* Email/Password */}
          <div className="space-y-3 mb-4">
            <input
              type="email"
              placeholder="tu@email.com"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-400 text-sm"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-400 text-sm"
            />
          </div>

          {authError && <p className="text-red-500 text-xs mb-3 text-center">{authError}</p>}

          <button
            onClick={handleEmailAuth}
            disabled={authLoading}
            className="w-full bg-[#0066ff] text-white py-3 rounded-xl font-bold mb-4 hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {authLoading ? 'Cargando...' : authMode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>

          <p className="text-center text-xs text-slate-500">
            {authMode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button
              onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}
              className="text-blue-600 font-bold"
            >
              {authMode === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  if (selectedTrip) {
    const trip = trips.find(t => t.id === selectedTrip);
    return (
      <div className="min-h-screen bg-[#f4f7f9] p-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setSelectedTrip(null)} className="p-2 hover:bg-slate-200 rounded-full">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <h1 className="text-xl font-bold">{trip?.name}</h1>
          <button className="p-2 hover:bg-slate-200 rounded-full">
            <div className="w-1 h-5 flex flex-col justify-between">
                <div className="w-1 h-1 bg-black rounded-full"></div>
                <div className="w-1 h-1 bg-black rounded-full"></div>
                <div className="w-1 h-1 bg-black rounded-full"></div>
            </div>
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
                <div className="text-sm text-slate-500">Resumen de Gastos</div>
                <div className="text-5xl font-extrabold">{trip?.budget || 0}€</div>
            </div>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span> IA OPTIMIZED
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-slate-400 border-2 border-white"></div>
            </div>
            <div className="text-sm font-bold text-slate-700">+{trip?.participants?.length - 2 || 0}</div>
            <div className="text-sm text-slate-500 ml-2">{trip?.participants?.length || 0} personas activas</div>
          </div>
        </div>

        <div className="bg-[#0052cc] text-white p-6 rounded-3xl shadow-lg mb-8 cursor-pointer" onClick={() => setIsScanModalOpen(true)}>
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-white/20 p-3 rounded-2xl">
                <Folder className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold">Escanear Ticket</h2>
          </div>
          <p className="text-blue-100 text-sm">✦ Procesamiento inteligente OCR instantáneo</p>
        </div>

        <h2 className="text-lg font-bold mb-4">Participantes</h2>
        <div className="space-y-3 mb-8">
            {trip?.participants?.map((p: string, i: number) => (
                <div key={i} className="bg-white p-4 rounded-2xl flex justify-between items-center border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                            {p.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="font-bold text-sm">{p}</div>
                            <div className="text-xs text-slate-500">{i === 0 ? 'Organizador' : 'Viajero'}</div>
                        </div>
                    </div>
                    <div className="font-bold text-sm text-blue-700">{(trip.budget / (trip.participants.length || 1)).toFixed(0)}€</div>
                </div>
            ))}
        </div>

        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Actividad Reciente</h2>
            <button className="text-sm font-bold text-blue-700">Ver todo</button>
        </div>
        
        <div className="space-y-4 mb-8">
            <div className="bg-white p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Restauración</span>
                    <span>HOY 14:20</span>
                </div>
                <div className="font-bold mb-1">Le Comptoir de la Gastronomie</div>
                <div className="text-2xl font-bold text-blue-700 mb-3">124.50€</div>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Pagado por Elena</span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] font-bold">CONFIRMADO</span>
                </div>
            </div>
        </div>

        <div className="bg-blue-100 p-4 rounded-2xl flex gap-3 items-start">
            <div className="text-blue-700">✦</div>
            <div className="text-sm text-blue-900">
                <span className="font-bold">AI Insight:</span> Marc ha cubierto la mayoría de las comidas. Elena podría encargarse de la próxima cena para equilibrar el presupuesto.
            </div>
        </div>
        
        <ScanTicketModal isOpen={isScanModalOpen} onClose={() => setIsScanModalOpen(false)} onScan={(data) => setLastScan(data)} />
      </div>
    );
  }

  if (currentScreen === 'SETTINGS') {
    return <SettingsScreen />;
  }

  return (
    <div className="min-h-screen bg-[#f4f7f9] text-[#1a1c1e] flex flex-col pb-24">
      <header className="h-[70px] bg-white border-b border-[#e9ecef] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">
                {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="font-extrabold text-lg tracking-tighter text-[#1a1c1e]">TravelSplit AI</div>
        </div>
        <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <div className="w-5 h-5 bg-slate-400 rounded-full"></div>
            </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="text-sm font-bold text-blue-700 mb-1">YOUR INTELLIGENCE PANEL</div>
        <h2 className="text-3xl font-extrabold mb-2">Mis Viajes</h2>
        <div className="text-slate-500 mb-8">Managing {trips.length} active itineraries</div>

        <div className="grid grid-cols-1 gap-6">
          {trips.map((trip) => (
            <div 
              key={trip.id}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
            >
              <div className="flex gap-4 mb-6">
                <div className="w-20 h-20 bg-slate-200 rounded-2xl flex items-center justify-center">
                    <Plane className="w-8 h-8 text-slate-500" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div className="font-bold text-xl">{trip.name}</div>
                        <button onClick={(e) => deleteTrip(e, trip.id)} className="text-slate-400 hover:text-red-500">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                        <div className="w-4 h-4 bg-slate-200 rounded"></div>
                        {trip.startDate} - {trip.endDate}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"></div>
                            <div className="w-6 h-6 rounded-full bg-slate-400 border-2 border-white"></div>
                            <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white text-[10px] flex items-center justify-center font-bold">+1</div>
                        </div>
                        <div className="text-xs text-slate-500">{trip.participants?.length || 0} participants</div>
                    </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTrip(trip.id)} 
                className="w-full bg-indigo-50 text-indigo-700 py-3 rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                <div className="w-4 h-4 bg-indigo-700 rounded-full"></div> Manage
              </button>
            </div>
          ))}
          
          <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 flex gap-4 items-center">
            <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center">
                <div className="text-2xl text-slate-400">✦</div>
            </div>
            <div className="flex-1">
                <div className="font-bold text-lg">Tokyo Dreams</div>
                <div className="text-sm text-slate-500 flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-300 rounded-full"></div>
                    Pending Date Range
                </div>
            </div>
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">AI DRAFT</div>
          </div>
        </div>
      </main>

      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-24 right-6 bg-[#0066ff] text-white p-4 rounded-full shadow-lg">
        <Plus className="w-8 h-8" />
      </button>

      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-100 flex justify-around p-4 z-50">
        <button onClick={() => setCurrentScreen('TRIPS')} className={`flex flex-col items-center gap-1 ${currentScreen === 'TRIPS' ? 'text-[#0066ff]' : 'text-slate-400'}`}>
            <div className={`${currentScreen === 'TRIPS' ? 'bg-blue-100' : ''} p-2 rounded-full`}><div className={`w-5 h-5 ${currentScreen === 'TRIPS' ? 'bg-blue-600' : 'bg-slate-400'} rounded-full`}></div></div>
            <span className="text-xs font-bold">TRIPS</span>
        </button>
        <button onClick={() => setCurrentScreen('CALCULATOR')} className={`flex flex-col items-center gap-1 ${currentScreen === 'CALCULATOR' ? 'text-[#0066ff]' : 'text-slate-400'}`}>
            <div className={`${currentScreen === 'CALCULATOR' ? 'bg-blue-100' : ''} p-2 rounded-full`}><div className={`w-5 h-5 ${currentScreen === 'CALCULATOR' ? 'bg-blue-600' : 'bg-slate-400'} rounded-full`}></div></div>
            <span className="text-xs font-bold">CALCULADORA</span>
        </button>
        <button onClick={() => setCurrentScreen('INSIGHTS')} className={`flex flex-col items-center gap-1 ${currentScreen === 'INSIGHTS' ? 'text-[#0066ff]' : 'text-slate-400'}`}>
            <div className={`${currentScreen === 'INSIGHTS' ? 'bg-blue-100' : ''} p-2 rounded-full`}><div className={`w-5 h-5 ${currentScreen === 'INSIGHTS' ? 'bg-blue-600' : 'bg-slate-400'} rounded-full`}></div></div>
            <span className="text-xs font-bold">INSIGHTS</span>
        </button>
        <button onClick={() => setCurrentScreen('SETTINGS')} className={`flex flex-col items-center gap-1 ${currentScreen === 'SETTINGS' ? 'text-[#0066ff]' : 'text-slate-400'}`}>
            <div className={`${currentScreen === 'SETTINGS' ? 'bg-blue-100' : ''} p-2 rounded-full`}><div className={`w-5 h-5 ${currentScreen === 'SETTINGS' ? 'bg-blue-600' : 'bg-slate-400'} rounded-full`}></div></div>
            <span className="text-xs font-bold">SETTINGS</span>
        </button>
      </nav>
      <NewTripModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={(trip) => setTrips([...trips, trip])} />
    </div>
  );
}





