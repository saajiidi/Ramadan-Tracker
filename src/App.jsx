import React, { useState, useEffect } from 'react';
import { juzStarts, surahStarts } from './data/quranMapping';

const WAQT_LIST = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// Inline SVG components for zero dependency icons
const MoonIcon = ({ className, size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

const PlusIcon = ({ className, size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const UsersIcon = ({ className, size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const App = () => {
    const [activeTab, setActiveTab] = useState('quran');
    const [targetDay, setTargetDay] = useState(29);

    const [quranState, setQuranState] = useState(() => {
        const saved = JSON.parse(localStorage.getItem('quranState'));
        return saved || { juz: 1, page: 1, surah: 1, ayat: 1 };
    });

    const [prayerLogs, setPrayerLogs] = useState(() =>
        JSON.parse(localStorage.getItem('prayerLogs')) || {}
    );

    useEffect(() => {
        localStorage.setItem('quranState', JSON.stringify(quranState));
    }, [quranState]);

    useEffect(() => {
        localStorage.setItem('prayerLogs', JSON.stringify(prayerLogs));
    }, [prayerLogs]);

    const updateByPage = (p) => {
        if (p === '') { setQuranState(prev => ({ ...prev, page: '' })); return; }
        const val = parseInt(p);
        if (isNaN(val)) return;
        const page = Math.max(1, Math.min(604, val));
        let juz = 1;
        for (let i = 0; i < juzStarts.length; i++) {
            if (page >= juzStarts[i]) juz = i + 1;
            else break;
        }
        let surah = 1;
        for (let i = 0; i < surahStarts.length; i++) {
            if (page >= surahStarts[i].p) surah = surahStarts[i].n;
            else break;
        }
        setQuranState(prev => ({ ...prev, page, juz, surah, ayat: 1 }));
    };

    const updateByJuz = (j) => {
        if (j === '') { setQuranState(prev => ({ ...prev, juz: '' })); return; }
        const val = parseInt(j);
        if (isNaN(val)) return;
        const juz = Math.max(1, Math.min(30, val));
        const page = juzStarts[juz - 1];
        let surah = 1;
        for (let i = 0; i < surahStarts.length; i++) {
            if (page >= surahStarts[i].p) surah = surahStarts[i].n;
            else break;
        }
        setQuranState(prev => ({ ...prev, juz, page, surah, ayat: 1 }));
    };

    const updateBySurah = (s) => {
        if (s === '') { setQuranState(prev => ({ ...prev, surah: '' })); return; }
        const val = parseInt(s);
        if (isNaN(val)) return;
        const surah = Math.max(1, Math.min(114, val));
        const surahInfo = surahStarts.find(item => item.n === surah);
        const page = surahInfo.p;
        let juz = 1;
        for (let i = 0; i < juzStarts.length; i++) {
            if (page >= juzStarts[i]) juz = i + 1;
            else break;
        }
        setQuranState(prev => ({ ...prev, surah, page, juz, ayat: 1 }));
    };

    const getRamadanDays = () => {
        const days = [];
        const startDate = new Date('2026-02-19');
        for (let i = 0; i < 30; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            days.push({
                ramadanDay: i + 1,
                date: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
                fullDate: date.toISOString().split('T')[0]
            });
        }
        return days;
    };

    const ramadanDays = getRamadanDays();
    const today = new Date().toISOString().split('T')[0];

    const getTilawatPace = () => {
        const todayObj = new Date();
        const ramadanStart = new Date('2026-02-19');
        const d1 = new Date(todayObj.getFullYear(), todayObj.getMonth(), todayObj.getDate());
        const d2 = new Date(ramadanStart.getFullYear(), ramadanStart.getMonth(), ramadanStart.getDate());
        const diffDays = Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));
        const currentRamadanDay = diffDays + 1;
        const daysLeft = targetDay - (currentRamadanDay > 0 ? currentRamadanDay - 1 : 0);
        const pagesLeft = 605 - quranState.page;
        if (daysLeft <= 1) return { daily: pagesLeft, perWaqt: (pagesLeft / 5).toFixed(1), daysLeft: Math.max(0, daysLeft) };
        return {
            daily: (pagesLeft / daysLeft).toFixed(1),
            perWaqt: (pagesLeft / (daysLeft * 5)).toFixed(1),
            daysLeft: Math.max(0, daysLeft)
        };
    };

    const pace = getTilawatPace();
    const quranProgressPercent = Math.round((quranState.page / 604) * 100);
    const prayerStats = Object.values(prayerLogs).reduce((acc, day) => {
        WAQT_LIST.forEach(w => { if (day[w + '_jamah']) acc.jamah++; });
        return acc;
    }, { jamah: 0 });

    const toggleWaqt = (date, waqt, type = 'done') => {
        setPrayerLogs(prev => {
            const dayLogs = prev[date] || {};
            const updates = {};
            if (type === 'done') {
                const newState = !dayLogs[waqt];
                updates[waqt] = newState;
                if (!newState) updates[waqt + '_jamah'] = false;
            } else {
                const newState = !dayLogs[waqt + '_jamah'];
                updates[waqt + '_jamah'] = newState;
                if (newState) updates[waqt] = true;
            }
            return { ...prev, [date]: { ...dayLogs, ...updates } };
        });
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <header className="mb-8 border-b border-white/5 pb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <MoonIcon className="text-primary" size={32} />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Ramadan Compass</h1>
                        <p className="text-xs text-slate-500 font-medium">1447 AH • Ultra Lightweight</p>
                    </div>
                </div>
                <div className="flex bg-neutral-900 border border-white/5 p-1 rounded-xl">
                    <button onClick={() => setActiveTab('quran')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'quran' ? 'bg-primary text-neutral-950' : 'text-slate-500 hover:text-slate-300'}`}>Quran</button>
                    <button onClick={() => setActiveTab('prayer')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'prayer' ? 'bg-primary text-neutral-950' : 'text-slate-500 hover:text-slate-300'}`}>Prayers</button>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <StatBox label="Quran Flow" val={`${quranProgressPercent}%`} sub={`Page ${quranState.page}`} />
                <StatBox label="Jamah" val={prayerStats.jamah} sub="Congregations" />
                <StatBox label="Countdown" val={pace.daysLeft} sub={`To Day ${targetDay}`} />
            </div>

            {activeTab === 'quran' ? (
                <div className="space-y-6">
                    <div className="card space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <InputField label="Juz / Para" value={quranState.juz} max={30} onChange={updateByJuz} />
                            <InputField label="Page (Hafezi)" value={quranState.page} max={604} onChange={updateByPage} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">Surah</label>
                            <select
                                value={quranState.surah}
                                onChange={(e) => updateBySurah(e.target.value)}
                                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-white font-semibold cursor-pointer"
                            >
                                {surahStarts.map(s => <option key={s.n} value={s.n} className="bg-neutral-900">{s.n}. {s.s}</option>)}
                            </select>
                        </div>
                        <div className="bg-neutral-900 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/5">
                            <div className="text-center sm:text-left">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Current Progress</p>
                                <p className="text-xl font-bold text-white">{surahStarts.find(s => s.n === Math.max(1, parseInt(quranState.surah) || 1))?.s}</p>
                                <p className="text-xs text-slate-500 font-medium">Page {quranState.page} of 604</p>
                            </div>
                            <button
                                onClick={() => updateByPage((parseInt(quranState.page) || 0) + 1)}
                                className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2"
                            >
                                Next Page <PlusIcon size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="text-sm font-bold uppercase text-slate-500 mb-4 tracking-widest">Pace Insights</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <SmallStat label="Daily Goal" val={pace.daily} unit="Pages" />
                            <SmallStat label="Per Prayer" val={pace.perWaqt} unit="Pages" />
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/5 flex gap-2">
                            {[27, 29].map(d => (
                                <button key={d} onClick={() => setTargetDay(d)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${targetDay === d ? 'bg-white/10 text-primary' : 'text-slate-500 hover:bg-white/5'}`}>Target Day {d}</button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ramadanDays.map(day => (
                        <div key={day.ramadanDay} className={`card ${day.fullDate === today ? 'border-primary/50 bg-primary/5' : ''}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${day.fullDate === today ? 'bg-primary text-neutral-950' : 'bg-white/5 text-primary'}`}>{day.ramadanDay}</div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{day.date}</p>
                                        <p className="text-xs font-bold text-white">{day.fullDate === today ? 'Today' : 'Blessed Day'}</p>
                                    </div>
                                </div>
                                <p className="text-xl font-black text-white">{WAQT_LIST.filter(w => (prayerLogs[day.fullDate] || {})[w]).length}/5</p>
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {WAQT_LIST.map(waqt => {
                                    const logs = prayerLogs[day.fullDate] || {};
                                    return (
                                        <div key={waqt} className="flex flex-col gap-1.5">
                                            <button onClick={() => toggleWaqt(day.fullDate, waqt, 'done')} className={`py-2 rounded-lg flex items-center justify-center border text-[10px] font-black ${logs[waqt] ? 'bg-emerald-500 border-emerald-500 text-neutral-950' : 'bg-neutral-900 border-white/5 text-slate-700'}`}>{waqt[0]}</button>
                                            <button onClick={() => toggleWaqt(day.fullDate, waqt, 'jamah')} className={`py-1.5 rounded-lg flex items-center justify-center border ${logs[waqt + '_jamah'] ? 'bg-primary border-primary text-neutral-950' : 'bg-neutral-900 border-white/5 text-slate-700 hover:text-primary'}`}><UsersIcon size={12} /></button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <footer className="mt-12 pt-8 border-t border-white/5 text-center">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">Privacy First • Local Storage Only</p>
            </footer>
        </div>
    );
};

const StatBox = ({ label, val, sub }) => (
    <div className="card text-center">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-white">{val}</p>
        <p className="text-[10px] text-slate-500 font-bold mt-1">{sub}</p>
    </div>
);

const InputField = ({ label, value, max, onChange }) => (
    <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">{label}</label>
        <div className="relative">
            <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-white font-bold" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-slate-600 font-bold uppercase">Max {max}</span>
        </div>
    </div>
);

const SmallStat = ({ label, val, unit }) => (
    <div>
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className="text-xl font-black text-primary">{val} <span className="text-[10px] text-slate-500">{unit}</span></p>
    </div>
);

export default App;
