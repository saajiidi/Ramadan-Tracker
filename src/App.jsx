import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, CheckCircle2, Search, Plus, Trophy, Bookmark, Hash, Layers, Users, Star, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { juzStarts, surahStarts } from './data/quranMapping';

const WAQT_LIST = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const App = () => {
    const [activeTab, setActiveTab] = useState('quran');
    const [targetDay, setTargetDay] = useState(29); // 27 or 29

    // Quran Logic State
    const [quranState, setQuranState] = useState(() =>
        JSON.parse(localStorage.getItem('quranState')) || { juz: 1, page: 1, surah: 1, ayat: 1 }
    );

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
        const page = Math.max(1, Math.min(604, parseInt(p) || 1));
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
        const juz = Math.max(1, Math.min(30, parseInt(j) || 1));
        const page = juzStarts[juz - 1];
        let surah = 1;
        for (let i = 0; i < surahStarts.length; i++) {
            if (page >= surahStarts[i].p) surah = surahStarts[i].n;
            else break;
        }
        setQuranState(prev => ({ ...prev, juz, page, surah, ayat: 1 }));
    };

    const updateBySurah = (s) => {
        const surah = Math.max(1, Math.min(114, parseInt(s) || 1));
        const surahInfo = surahStarts.find(item => item.n === surah);
        const page = surahInfo.p;
        let juz = 1;
        for (let i = 0; i < juzStarts.length; i++) {
            if (page >= juzStarts[i]) juz = i + 1;
            else break;
        }
        setQuranState(prev => ({ ...prev, surah, page, juz, ayat: 1 }));
    };

    const updateByAyat = (a) => {
        setQuranState(prev => ({ ...prev, ayat: parseInt(a) || 1 }));
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
        const daily = (pagesLeft / daysLeft).toFixed(1);
        const perWaqt = (pagesLeft / (daysLeft * 5)).toFixed(1);
        return { daily, perWaqt, daysLeft };
    };

    const pace = getTilawatPace();
    const quranProgressPercent = Math.round((quranState.page / 604) * 100);
    const prayerStats = Object.values(prayerLogs).reduce((acc, day) => {
        WAQT_LIST.forEach(w => {
            if (day[w]) acc.performed++;
            if (day[w + '_jamah']) acc.jamah++;
        });
        return acc;
    }, { performed: 0, jamah: 0 });

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
        <div className="relative min-h-screen text-slate-100 selection:bg-primary/30 selection:text-primary">
            {/* Background Ornaments */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-24 -left-24 text-primary/10"
                >
                    <Moon size={400} />
                </motion.div>
                <div className="absolute top-1/4 right-10 text-primary/5 animate-float"><Star size={120} fill="currentColor" /></div>
                <div className="absolute bottom-1/4 left-10 text-primary/5 animate-float" style={{ animationDelay: '2s' }}><Star size={80} fill="currentColor" /></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
                <header className="mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block mb-4"
                    >
                        <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-[0.3em]">
                            Blessed Month 2026
                        </span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-7xl font-black text-gradient mb-4 tracking-tighter"
                    >
                        RAMADAN COMPASS
                    </motion.h1>
                    <p className="text-slate-400 font-medium tracking-wide">Elite Spiritual Tracking for the Modern Mu'min</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <StatCard
                        icon={<BookOpen className="text-primary w-8 h-8" />}
                        label="Tilawat Flow"
                        value={`${quranProgressPercent}%`}
                        subValue={`Page ${quranState.page} • Juz ${quranState.juz}`}
                    />
                    <StatCard
                        icon={<Users className="text-blue-400 w-8 h-8" />}
                        label="Jamah Target"
                        value={prayerStats.performed > 0 ? `${Math.round((prayerStats.jamah / prayerStats.performed) * 100)}%` : '0%'}
                        subValue={`${prayerStats.jamah} Congregations`}
                    />
                    <StatCard
                        icon={<Trophy className="text-orange-400 w-8 h-8" />}
                        label="Goal Countdown"
                        value={pace.daysLeft > 0 ? pace.daysLeft : 0}
                        subValue={`Days till Day ${targetDay}`}
                    />
                </div>

                <div className="flex flex-wrap justify-center gap-6 mb-16">
                    <TabButton
                        active={activeTab === 'quran'}
                        onClick={() => setActiveTab('quran')}
                        icon={<Bookmark size={22} />}
                        label="Tilawat Hub"
                    />
                    <TabButton
                        active={activeTab === 'prayer'}
                        onClick={() => setActiveTab('prayer')}
                        icon={<Clock size={22} />}
                        label="Prayer Center"
                    />
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'quran' ? (
                        <motion.div
                            key="quran"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-5xl mx-auto"
                        >
                            <div className="premium-card p-8 md:p-12 relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 text-primary/5 transition-transform group-hover:scale-110 duration-1000">
                                    <BookOpen size={300} />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start relative z-10">
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center gap-4 mb-10">
                                            <div className="p-3 bg-primary/20 rounded-2xl text-primary"><Layers size={32} /></div>
                                            <div>
                                                <h2 className="text-3xl font-black text-white">Smart Tilawat Input</h2>
                                                <p className="text-slate-400 font-medium">Auto-tracing your Quranic journey</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                                            <SmartInput label="Juz / Para" value={quranState.juz} max={30} onChange={updateByJuz} icon={<Hash size={16} />} />
                                            <SmartInput label="Page (Hafezi)" value={quranState.page} max={604} onChange={updateByPage} icon={<Bookmark size={16} />} />
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] ml-1">Surah</label>
                                                <div className="relative">
                                                    <select
                                                        value={quranState.surah}
                                                        onChange={(e) => updateBySurah(e.target.value)}
                                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all text-white font-bold appearance-none cursor-pointer"
                                                    >
                                                        {surahStarts.map(s => <option key={s.n} value={s.n} className="bg-neutral-900">{s.n}. {s.s}</option>)}
                                                    </select>
                                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><Plus size={20} /></div>
                                                </div>
                                            </div>
                                            <SmartInput label="Ayat" value={quranState.ayat} max={286} onChange={updateByAyat} icon={<Plus size={16} />} />
                                        </div>

                                        <div className="p-8 bg-gradient-to-br from-white/[0.05] to-transparent rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center text-primary text-3xl font-black shadow-inner">
                                                    {quranState.juz}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-1">Current Station</p>
                                                    <p className="text-2xl font-black text-white">
                                                        {surahStarts.find(s => s.n === quranState.surah)?.s}
                                                    </p>
                                                    <p className="text-slate-500 font-bold">Page {quranState.page} of 604</p>
                                                </div>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => updateByPage(quranState.page + 1)}
                                                className="w-full md:w-auto px-10 py-5 bg-primary text-neutral-950 font-black rounded-3xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-3"
                                            >
                                                Next Page <Plus size={24} />
                                            </motion.button>
                                        </div>
                                    </div>

                                    <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 lg:mt-6">
                                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                                            <Star className="text-primary" size={20} fill="currentColor" />
                                            Reading Pace
                                        </h3>
                                        <div className="space-y-6">
                                            <PaceCard label="Daily Goal" val={pace.daily} unit="Pages" />
                                            <PaceCard label="Per Waqt" val={pace.perWaqt} unit="Pages" />

                                            <div className="pt-6 border-t border-white/10 mt-8">
                                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Complete by</p>
                                                <div className="flex bg-neutral-900/50 p-1.5 rounded-2xl border border-white/5">
                                                    {[27, 29].map(d => (
                                                        <button
                                                            key={d}
                                                            onClick={() => setTargetDay(d)}
                                                            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${targetDay === d ? 'bg-primary text-dark shadow-lg shadow-primary/20 scale-100' : 'text-slate-500 hover:text-white'}`}
                                                        >
                                                            Day {d}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="prayer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {ramadanDays.map(day => (
                                <PrayerDay
                                    key={day.ramadanDay}
                                    day={day}
                                    isToday={day.fullDate === today}
                                    logs={prayerLogs[day.fullDate] || {}}
                                    onToggle={(waqt, type) => toggleWaqt(day.fullDate, waqt, type)}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const SmartInput = ({ label, value, max, onChange, icon }) => (
    <div className="space-y-3">
        <label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] ml-1 flex items-center gap-2">
            {icon} {label}
        </label>
        <div className="relative group">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                min={1}
                max={max}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all text-white font-bold tracking-widest group-hover:border-white/20"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] text-slate-600 font-black uppercase tracking-widest">Max {max}</span>
        </div>
    </div>
);

const PaceCard = ({ label, val, unit }) => (
    <div className="flex justify-between items-center p-5 bg-white/[0.03] rounded-2xl border border-white/5">
        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{label}</span>
        <div className="text-right">
            <span className="text-2xl font-black text-primary mr-1">{val}</span>
            <span className="text-[10px] font-black text-slate-500 uppercase">{unit}</span>
        </div>
    </div>
);

const StatCard = ({ icon, label, value, subValue }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="premium-card p-8 flex items-center gap-8 group"
    >
        <div className="p-5 bg-white/[0.03] rounded-3xl border border-white/10 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-500">
            {icon}
        </div>
        <div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className="text-4xl font-black text-white tracking-tighter mb-1">{value}</p>
            <p className="text-xs text-slate-500 font-bold">{subValue}</p>
        </div>
    </motion.div>
);

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-10 py-5 rounded-[2rem] font-black transition-all duration-500 border ${active
                ? 'bg-primary text-dark shadow-2xl shadow-primary/30 border-primary scale-105'
                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10'
            }`}
    >
        {icon}
        <span className="tracking-wide">{label}</span>
    </button>
);

const PrayerDay = ({ day, logs, onToggle, isToday }) => {
    const performedCount = WAQT_LIST.filter(w => logs[w]).length;
    const jamahCount = WAQT_LIST.filter(w => logs[w + '_jamah']).length;

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`premium-card p-6 ${isToday ? 'ring-2 ring-primary border-primary/40' : ''}`}
        >
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl border border-primary/20">
                        {day.ramadanDay}
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{day.date}</p>
                        {isToday && <span className="text-[10px] font-black text-primary uppercase">Current Day</span>}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black text-white">{performedCount}/5</p>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{jamahCount} Jamah</p>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-3">
                {WAQT_LIST.map(waqt => {
                    const isDone = logs[waqt];
                    const isJamah = logs[waqt + '_jamah'];
                    return (
                        <div key={waqt} className="flex flex-col gap-2">
                            <button
                                onClick={() => onToggle(waqt, 'done')}
                                className={`flex flex-col items-center py-3 rounded-2xl transition-all duration-300 border ${isDone
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10'
                                        : 'bg-white/5 border-white/5 text-slate-700 hover:text-slate-400'
                                    }`}
                                title={`Mark ${waqt} Done`}
                            >
                                <span className="text-[10px] font-black mb-1.5 uppercase">{waqt[0]}</span>
                                <CheckCircle2 size={18} />
                            </button>
                            <button
                                onClick={() => onToggle(waqt, 'jamah')}
                                className={`flex items-center justify-center py-2.5 rounded-2xl transition-all duration-300 border ${isJamah
                                        ? 'bg-primary border-primary text-neutral-950 shadow-lg shadow-primary/20'
                                        : 'bg-neutral-900 border-white/5 text-slate-700 hover:text-primary hover:border-primary/30'
                                    }`}
                                title={`${waqt} in Congregation`}
                            >
                                <Users size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default App;
