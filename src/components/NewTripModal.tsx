import React, { useState } from 'react';
import { MapPin, Edit3, X, Sparkles, ArrowRight, Plus, ChevronDown, Check, Calendar } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

interface NewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trip: any) => void;
}

export const NewTripModal = ({ isOpen, onClose, onSave }: NewTripModalProps) => {
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [currency, setCurrency] = useState('USD');
  const [notes, setNotes] = useState('');
  const [showCalendarOverlay, setShowCalendarOverlay] = useState(false);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);

  const popularDestinations = [
    "Paris, France", "London, UK", "Tokyo, Japan", "New York, USA",
    "Barcelona, Spain", "Madrid, Spain", "Rome, Italy", "Venice, Italy",
    "Kyoto, Japan", "Osaka, Japan", "Berlin, Germany", "Amsterdam, Netherlands",
    "Lisbon, Portugal", "Bali, Indonesia", "Sydney, Australia", "Toronto, Canada",
    "Prague, Czech Republic", "Vienna, Austria", "Seoul, South Korea",
    "Singapore", "Dubai, UAE", "Bangkok, Thailand", "Hokkaido, Japan",
    "Miami, USA", "Los Angeles, USA", "Chicago, USA", "San Francisco, USA",
    "Mexico City, Mexico", "Buenos Aires, Argentina", "Rio de Janeiro, Brazil",
    "Cape Town, South Africa", "Marrakech, Morocco", "Istanbul, Turkey",
    "Santorini, Greece", "Athens, Greece", "Zurich, Switzerland", "Geneva, Switzerland",
  ];

  const handleDestinationChange = (val: string) => {
    setDestination(val);
    if (val.length > 1) {
      const filtered = popularDestinations
        .filter(d => d.toLowerCase().includes(val.toLowerCase()))
        .slice(0, 5);
      setDestinationSuggestions(filtered);
    } else {
      setDestinationSuggestions([]);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    const budgetVal = parseFloat(budget) || 0;
    const tripData = {
      name: name || 'Viaje sin nombre',
      destination,
      budget: budgetVal,
      currency,
      startDate,
      endDate,
      notes,
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

  const handleNotesKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const lines = notes.split('\n');
      const lastLine = lines[lines.length - 1].trim();
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (emailRegex.test(lastLine)) {
        if (!participants.includes(lastLine)) {
          setParticipants([...participants, lastLine]);
          setNotes(lines.slice(0, -1).join('\n') + (lines.length > 1 ? '\n' : ''));
          e.preventDefault();
        }
      } else if (lastLine.length > 2 && lastLine.length < 30) {
        if (!participants.includes(lastLine)) {
          setParticipants([...participants, lastLine]);
          setNotes(lines.slice(0, -1).join('\n') + (lines.length > 1 ? '\n' : ''));
          e.preventDefault();
        }
      }
    }
  };

  if (!isOpen) return null;

  const aiSuggestions = ["Tokyo, Japan", "Barcelona, Spain", "Bali, Indonesia"];

  const numDays = startDate && endDate
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24))
    : null;

  return (
    <div className="fixed inset-0 bg-[#0d1c32]/40 backdrop-blur-md flex items-center justify-center sm:p-4 z-50">
      <div className="bg-[#f7f9fb] w-full sm:max-w-[480px] h-full sm:h-auto sm:max-h-[90vh] sm:rounded-[32px] shadow-2xl flex flex-col relative overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-center p-6 bg-[#f7f9fb] shadow-sm sticky top-0 z-10">
          <button
            onClick={onClose}
            className="absolute left-6 text-[#495770] hover:bg-slate-200/50 p-2 rounded-full transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-[17px] font-bold text-[#495770]">New Trip</h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-8">

          {/* ── Step 1: Where to? ── */}
          <div>
            <div className="flex items-center gap-3 mb-4 pt-4">
              <div className="w-8 h-8 rounded-full bg-[#d6e3ff] text-[#004ccc] flex items-center justify-center font-bold text-sm">1</div>
              <h3 className="text-[22px] font-extrabold text-[#191c1e] tracking-tight">Where to?</h3>
            </div>

            {/* Card with autocomplete */}
            <div className="relative">
              <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(25,28,30,0.03)] border border-slate-100/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#004ccc] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <input
                    type="text"
                    placeholder="Destination"
                    className="w-full bg-transparent border-none p-0 text-[18px] font-bold text-[#191c1e] placeholder:text-slate-300 focus:ring-0 focus:outline-none"
                    value={destination}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                  />
                </div>

                <div className="h-[1px] bg-slate-100 mb-4 ml-12 opacity-50" />

                <div className="flex items-center gap-4 ml-1">
                  <Edit3 className="w-5 h-5 text-slate-300 flex-shrink-0 ml-1" />
                  <input
                    type="text"
                    placeholder="Trip Name (e.g. Autumn Leaves Tour)"
                    className="w-full bg-transparent border-none p-0 text-[15px] font-medium text-[#495770] placeholder:text-slate-400 focus:ring-0 focus:outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Autocomplete dropdown */}
              {destinationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.1)] border border-slate-100 z-50 overflow-hidden">
                  {destinationSuggestions.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => {
                        setDestination(s);
                        setDestinationSuggestions([]);
                      }}
                      className={`w-full px-5 py-3.5 flex items-center gap-4 text-left hover:bg-blue-50 transition-colors ${i !== destinationSuggestions.length - 1 ? 'border-b border-slate-50' : ''}`}
                    >
                      <div className="w-7 h-7 rounded-full bg-[#f0f4ff] flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-[#004ccc]" />
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-[#191c1e]">{s}</div>
                        <div className="text-[11px] font-medium text-slate-400">Popular destination</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>


          {/* ── Step 2: When? ── */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-[#495770] flex items-center justify-center font-bold text-sm">2</div>
              <h3 className="text-[22px] font-extrabold text-[#191c1e] tracking-tight">When?</h3>
            </div>

            <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(25,28,30,0.03)] border border-slate-100/50">
              <div className="flex items-center justify-between mb-5">
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">START DATE</div>
                  <div
                    onClick={() => setShowCalendarOverlay(true)}
                    className="text-[16px] font-bold text-[#191c1e] cursor-pointer hover:text-[#004ccc] transition-colors"
                  >
                    {startDate ? new Date(startDate + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'dd/mm/aaaa'}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 mx-4" />
                <div className="flex-1 text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">END DATE</div>
                  <div
                    onClick={() => setShowCalendarOverlay(true)}
                    className="text-[16px] font-bold text-[#191c1e] cursor-pointer hover:text-[#004ccc] transition-colors"
                  >
                    {endDate ? new Date(endDate + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'dd/mm/aaaa'}
                  </div>
                </div>
              </div>

              <div className="bg-[#f2f4f6] rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#495770]" />
                  <span className="text-[14px] font-medium text-[#495770]">
                    {numDays !== null ? `${numDays} Day${numDays !== 1 ? 's' : ''}` : 'Select dates'}
                  </span>
                </div>
                <button
                  onClick={() => setShowCalendarOverlay(true)}
                  className="text-[13px] font-bold text-[#004ccc] hover:opacity-70 active:scale-95 transition-all"
                >
                  Change
                </button>
              </div>
            </div>
          </div>

          {/* ── Step 3: Details ── */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-[#495770] flex items-center justify-center font-bold text-sm">3</div>
              <h3 className="text-[22px] font-extrabold text-[#191c1e] tracking-tight">Details</h3>
            </div>

            {/* Who's going */}
            <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(25,28,30,0.03)] border border-slate-100/50 mb-4">
              <div className="text-[14px] font-bold text-[#495770] mb-4">Who's going?</div>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-[#00174b] flex items-center justify-center text-white text-xs font-bold z-30 shadow-sm">
                    Me
                  </div>
                  {participants.map((p, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm"
                      style={{ zIndex: 20 - i }}
                    >
                      {p.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  <div className="relative z-10 w-10 h-10 rounded-full border-2 border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400 hover:border-[#004ccc] transition-colors cursor-pointer">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
                {participants.length > 0 && (
                  <span className="text-[12px] font-medium text-slate-500">You + {participants.length} others</span>
                )}
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] font-bold text-[#495770]">Trip Notes</span>
                <span className="text-[10px] text-slate-400 font-medium">Enter name/email → adds participant</span>
              </div>
              <textarea
                placeholder="Type a name or email, press Enter to add them to the trip..."
                className="w-full bg-[#f7f9fb] border border-slate-100 rounded-xl p-4 text-[14px] font-medium text-[#191c1e] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004ccc]/10 focus:border-[#004ccc] min-h-[100px] resize-none transition-all"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onKeyDown={handleNotesKeyDown}
              />
            </div>

            {/* Budget */}
            <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(25,28,30,0.03)] border border-slate-100/50">
              <div className="text-[14px] font-bold text-[#495770] mb-3">Total Budget</div>
              <div className="flex items-center gap-3">
                <div className="relative overflow-hidden bg-[#f2f4f6] rounded-xl px-4 py-3 min-w-[90px] flex items-center justify-between cursor-pointer active:scale-95 transition-all">
                  <span className="text-[15px] font-bold text-[#191c1e] mr-2">{currency}</span>
                  <ChevronDown className="w-4 h-4 text-[#495770]" />
                  <select
                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="USD">USD – Dollar</option>
                    <option value="EUR">EUR – Euro</option>
                    <option value="GBP">GBP – Pound</option>
                    <option value="JPY">JPY – Yen</option>
                  </select>
                </div>
                <input
                  type="number"
                  placeholder="5,000"
                  className="flex-1 bg-transparent border border-slate-200 rounded-xl px-4 py-3 text-[18px] font-bold text-[#191c1e] focus:border-[#004ccc] focus:ring-0 focus:outline-none"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Floating CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#f7f9fb] via-[#f7f9fb] to-transparent">
          <button
            onClick={handleSave}
            className="w-full bg-[#191c1e] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-[0_8px_24px_rgba(25,28,30,0.2)] hover:bg-black"
          >
            Create Trip <Check className="w-5 h-5 ml-1" />
          </button>
        </div>

        {/* ── Calendar Overlay ── */}
        {showCalendarOverlay && (
          <div className="absolute inset-0 bg-white z-[60] flex flex-col" style={{ animation: 'slideUp 0.3s ease-out' }}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <button
                onClick={() => setShowCalendarOverlay(false)}
                className="text-[#495770] p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-center">
                <h3 className="text-[17px] font-bold text-[#191c1e]">Select dates</h3>
                {startDate && !endDate && (
                  <p className="text-[12px] text-slate-400 mt-0.5">Now pick an end date</p>
                )}
                {startDate && endDate && (
                  <p className="text-[12px] text-[#004ccc] font-semibold mt-0.5">{numDays} days selected</p>
                )}
              </div>
              <button
                onClick={() => setShowCalendarOverlay(false)}
                className="text-[14px] font-bold text-[#004ccc] px-3 py-1 rounded-xl hover:bg-blue-50 transition-colors"
              >
                Done
              </button>
            </div>

            {/* Selected range summary */}
            {startDate && (
              <div className="flex items-center gap-4 px-6 py-3 bg-[#f7f9fb] border-b border-slate-100">
                <div className="flex-1 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">CHECK-IN</div>
                  <div className="text-[14px] font-bold text-[#191c1e]">
                    {new Date(startDate + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300" />
                <div className="flex-1 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">CHECK-OUT</div>
                  <div className="text-[14px] font-bold text-[#191c1e]">
                    {endDate
                      ? new Date(endDate + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
                      : '—'}
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {[0, 1, 2, 3].map(offset => {
                const base = new Date();
                base.setDate(1);
                base.setMonth(base.getMonth() + offset);
                const year = base.getFullYear();
                const month = base.getMonth();
                const monthName = base.toLocaleString('default', { month: 'long' });
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();

                return (
                  <div key={offset}>
                    <h4 className="text-[15px] font-bold text-[#191c1e] capitalize mb-4">{monthName} {year}</h4>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map(d => (
                        <div key={d} className="text-[11px] font-bold text-slate-400 py-2">{d}</div>
                      ))}
                      {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isStart = iso === startDate;
                        const isEnd = iso === endDate;
                        const isInRange = !!(startDate && endDate && iso > startDate && iso < endDate);
                        const isSelected = isStart || isEnd;

                        return (
                          <button
                            key={day}
                            onClick={() => {
                              if (!startDate || (startDate && endDate)) {
                                setStartDate(iso);
                                setEndDate('');
                              } else if (iso < startDate) {
                                setStartDate(iso);
                              } else {
                                setEndDate(iso);
                              }
                            }}
                            className={[
                              'h-10 w-full flex items-center justify-center text-[14px] font-semibold rounded-xl transition-all',
                              isSelected ? 'bg-[#004ccc] text-white shadow-md scale-105' : '',
                              isInRange ? 'bg-blue-50 text-[#004ccc] rounded-none' : '',
                              !isSelected && !isInRange ? 'hover:bg-slate-100 text-[#495770]' : '',
                            ].join(' ')}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
