import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, CheckCircle2, Search, Plus, Trophy, Bookmark, Hash, Layers, Users, Star, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { juzStarts, surahStarts } from './data/quranMapping';

const WAQT_LIST = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const App = () => {
    const [activeTab, setActiveTab] = useState('quran');
    const [targetDay, setTargetDay] = useState(29); // 27 or 29

    // Quran Logic State
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
        if (p === '') {
            setQuranState(prev => ({ ...prev, page: '' }));
            return;
        }
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
        if (j === '') {
            setQuranState(prev => ({ ...prev, juz: '' }));
            return;
        }
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
        if (s === '') {
            setQuranState(prev => ({ ...prev, surah: '' }));
            return;
        }
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

    const updateByAyat = (a) => {
        if (a === '') {
            setQuranState(prev => ({ ...prev, ayat: '' }));
            return;
        }
        const val = parseInt(a);
        if (isNaN(val)) return;
        setQuranState(prev => ({ ...prev, ayat: val }));
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

    const [installPrompt, setInstallPrompt] = useState(null);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
        };

        const checkIOS = () => {
            const userAgent = window.navigator.userAgent.toLowerCase();
            return /iphone|ipad|ipod/.test(userAgent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        setIsIOS(checkIOS());

        const handleMouseMove = (e) => {
            const cards = document.getElementsByClassName('premium-card');
            for (const card of cards) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const handleInstall = async () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
            setInstallPrompt(null);
        }
    };

    return (
        <div className="relative min-h-screen text-slate-200 selection:bg-primary/30 selection:text-primary pb-10">
            {/* Background Ornaments */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-32 -left-32 text-primary/5"
                >
                    <Moon size={500} />
                </motion.div>
                <div className="absolute top-1/4 right-[10%] text-primary/10 animate-float"><Star size={100} fill="currentColor" /></div>
                <div className="absolute bottom-1/4 left-[5%] text-primary/10 animate-float" style={{ animationDelay: '3s' }}><Star size={60} fill="currentColor" /></div>
            </div>

            {/* Install Prompt Overlay */}
            <AnimatePresence>
                {(installPrompt) && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-6 left-4 right-4 z-[100] sm:left-auto sm:right-6 sm:w-80"
                    >
                        <div className="premium-card p-6 !bg-neutral-900/90 backdrop-blur-2xl border-primary/30 shadow-[0_20px_50px_-20px_rgba(212,175,55,0.4)]">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                                    <Bookmark size={24} />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-lg leading-tight uppercase tracking-tight">Personal App</h3>
                                    <p className="text-slate-400 text-xs font-medium">Add to your home screen for quick daily tracking</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setInstallPrompt(null)}
                                    className="flex-1 py-3 px-4 rounded-xl border border-white/5 text-slate-500 font-black text-xs uppercase hover:bg-white/5 transition-all"
                                >
                                    Later
                                </button>
                                <button
                                    onClick={handleInstall}
                                    className="flex-[2] py-3 px-4 rounded-xl bg-primary text-neutral-950 font-black text-xs uppercase shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                                >
                                    Install Now
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 relative z-10">
                <header className="mb-12 md:mb-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block mb-6"
                    >
                        <span className="px-5 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.4em] backdrop-blur-md">
                            Sacred Month • 1447 AH
                        </span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
                        className="text-5xl sm:text-7xl md:text-8xl font-black text-gradient mb-4 tracking-tighter leading-tight"
                    >
                        RAMADAN COMPASS
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-slate-400 font-medium tracking-wide text-sm md:text-base max-w-lg mx-auto"
                    >
                        Elevate your spiritual journey with precision tracking and minimalist design for the modern believer.
                    </motion.p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8 mb-12 md:mb-20">
                    <StatCard
                        icon={<BookOpen className="text-primary w-7 h-7 md:w-8 md:h-8" />}
                        label="Tilawat Flow"
                        value={`${quranProgressPercent}%`}
                        subValue={`Page ${quranState.page || 0} • Juz ${quranState.juz || 0}`}
                    />
                    <StatCard
                        icon={<Users className="text-blue-400 w-7 h-7 md:w-8 md:h-8" />}
                        label="Jamah Target"
                        value={prayerStats.performed > 0 ? `${Math.round((prayerStats.jamah / prayerStats.performed) * 100)}%` : '0%'}
                        subValue={prayerStats.jamah === 1 ? '1 Congregation' : `${prayerStats.jamah} Congregations`}
                    />
                    <StatCard
                        icon={<Trophy className="text-orange-400 w-7 h-7 md:w-8 md:h-8" />}
                        label="Goal Countdown"
                        value={pace.daysLeft > 0 ? pace.daysLeft : 0}
                        subValue={`Days till Day ${targetDay}`}
                    />
                </div>

                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-12 md:mb-20">
                    <TabButton
                        active={activeTab === 'quran'}
                        onClick={() => setActiveTab('quran')}
                        icon={<Bookmark size={20} />}
                        label="Tilawat Hub"
                    />
                    <TabButton
                        active={activeTab === 'prayer'}
                        onClick={() => setActiveTab('prayer')}
                        icon={<Clock size={20} />}
                        label="Prayer Center"
                    />
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'quran' ? (
                        <motion.div
                            key="quran"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.4 }}
                            className="max-w-5xl mx-auto"
                        >
                            <div className="premium-card p-6 sm:p-10 md:p-16 relative overflow-hidden group">
                                <div className="absolute -top-20 -right-20 text-primary/5 transition-transform group-hover:scale-110 duration-1000">
                                    <BookOpen size={400} />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-16 items-start relative z-10">
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center gap-5 mb-12">
                                            <div className="p-4 bg-primary/20 rounded-2xl text-primary shadow-lg shadow-primary/5"><Layers size={32} /></div>
                                            <div>
                                                <h2 className="text-2xl sm:text-3xl font-black text-white">Smart Input</h2>
                                                <p className="text-slate-400 font-medium text-sm">Synchronized Quranic tracking</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10 mb-12">
                                            <SmartInput label="Juz / Para" value={quranState.juz} max={30} onChange={updateByJuz} icon={<Hash size={16} />} />
                                            <SmartInput label="Page (Hafezi)" value={quranState.page} max={604} onChange={updateByPage} icon={<Bookmark size={16} />} />
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] ml-1">Surah</label>
                                                <div className="relative group">
                                                    <select
                                                        value={quranState.surah}
                                                        onChange={(e) => updateBySurah(e.target.value)}
                                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4.5 outline-none focus:border-primary/50 focus:bg-white/[0.06] transition-all text-white font-bold appearance-none cursor-pointer group-hover:border-white/20"
                                                    >
                                                        {surahStarts.map(s => <option key={s.n} value={s.n} className="bg-neutral-900">{s.n}. {s.s}</option>)}
                                                    </select>
                                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-primary transition-colors"><Plus size={20} /></div>
                                                </div>
                                            </div>
                                            <SmartInput label="Ayat" value={quranState.ayat} max={286} onChange={updateByAyat} icon={<Plus size={16} />} />
                                        </div>

                                        <div className="p-6 sm:p-10 bg-gradient-to-br from-white/[0.06] to-transparent rounded-[2.5rem] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-8 backdrop-blur-sm">
                                            <div className="flex items-center gap-6">
                                                <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary text-4xl font-black shadow-inner border border-primary/20">
                                                    {quranState.juz || '—'}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-1.5 opacity-80">Current Station</p>
                                                    <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                                        {surahStarts.find(s => s.n === Math.max(1, parseInt(quranState.surah) || 1))?.s}
                                                    </p>
                                                    <p className="text-slate-500 font-bold text-sm">Page {quranState.page || '—'} of 604</p>
                                                </div>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => updateByPage((parseInt(quranState.page) || 0) + 1)}
                                                className="w-full sm:w-auto px-10 py-5 bg-primary text-neutral-950 font-black rounded-[1.5rem] shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-3 text-lg"
                                            >
                                                Next Page <Plus size={24} />
                                            </motion.button>
                                        </div>
                                    </div>

                                    <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 lg:mt-6 backdrop-blur-md">
                                        <h3 className="text-xl font-black text-white mb-10 flex items-center gap-3">
                                            <Star className="text-primary" size={20} fill="currentColor" />
                                            Reading Pace
                                        </h3>
                                        <div className="space-y-6">
                                            <PaceCard label="Daily Goal" val={pace.daily} unit="Pages" />
                                            <PaceCard label="Per Waqt" val={pace.perWaqt} unit="Pages" />

                                            <div className="pt-8 border-t border-white/10 mt-10">
                                                <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-5 text-center">Completion Goal</p>
                                                <div className="flex bg-neutral-950/50 p-1.5 rounded-2xl border border-white/5">
                                                    {[27, 29].map(d => (
                                                        <button
                                                            key={d}
                                                            onClick={() => setTargetDay(d)}
                                                            className={`flex-1 py-3.5 rounded-xl text-xs font-black transition-all ${targetDay === d ? 'bg-primary text-dark shadow-lg shadow-primary/20 scale-100' : 'text-slate-500 hover:text-white'}`}
                                                        >
                                                            RAMADAN {d}
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
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
                placeholder="—"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4.5 outline-none focus:border-primary/50 focus:bg-white/[0.06] transition-all text-white font-bold tracking-widest group-hover:border-white/20 placeholder-slate-700"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] text-slate-600 font-black uppercase tracking-widest hidden sm:block">Max {max}</span>
        </div>
    </div>
);

const PaceCard = ({ label, val, unit }) => (
    <div className="flex justify-between items-center p-6 bg-white/[0.04] rounded-2xl border border-white/5 group hover:bg-white/[0.06] transition-all">
        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest group-hover:text-slate-300 transition-colors">{label}</span>
        <div className="text-right">
            <span className="text-3xl font-black text-primary mr-1 bg-clip-text drop-shadow-sm">{val}</span>
            <span className="text-[10px] font-black text-slate-500 uppercase">{unit}</span>
        </div>
    </div>
);

const StatCard = ({ icon, label, value, subValue }) => (
    <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        className="premium-card p-6 md:p-8 flex items-center gap-6 md:gap-8 group"
    >
        <div className="p-4 md:p-5 bg-white/[0.03] rounded-[1.5rem] border border-white/10 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-500 shadow-xl">
            {icon}
        </div>
        <div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">{label}</p>
            <p className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-1 leading-none">{value}</p>
            <p className="text-[10px] md:text-xs text-slate-500 font-bold tracking-tight">{subValue}</p>
        </div>
    </motion.div>
);

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 rounded-[1.5rem] sm:rounded-[2rem] font-black transition-all duration-500 border relative overflow-hidden group ${active
            ? 'bg-primary text-dark shadow-[0_10px_40px_-10px_rgba(212,175,55,0.4)] border-primary scale-105'
            : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10'
            }`}
    >
        {icon}
        <span className="tracking-[0.1em] uppercase text-xs sm:text-sm">{label}</span>
        {active && (
            <motion.div
                layoutId="activeTabGlow"
                className="absolute inset-0 bg-white/20 mix-blend-overlay"
                initial={false}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
        )}
    </button>
);

const PrayerDay = ({ day, logs, onToggle, isToday }) => {
    const performedCount = WAQT_LIST.filter(w => logs[w]).length;
    const jamahCount = WAQT_LIST.filter(w => logs[w + '_jamah']).length;

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.01 }}
            className={`premium-card p-6 sm:p-7 relative ${isToday ? 'ring-2 ring-primary/40 border-primary/50 before:bg-primary/5 shadow-[0_20px_50px_-20px_rgba(212,175,55,0.2)]' : ''}`}
        >
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl border transition-all ${isToday ? 'bg-primary text-neutral-950 border-primary shadow-lg shadow-primary/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                        {day.ramadanDay}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">{day.date}</p>
                        {isToday ? (
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">Current Day</span>
                        ) : (
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Blessed Day</span>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-black text-white leading-none mb-1">{performedCount}<span className="text-slate-600 text-lg">/5</span></p>
                    <p className="text-[9px] font-black text-primary/80 uppercase tracking-widest">{jamahCount} Jamah</p>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-3 md:gap-4">
                {WAQT_LIST.map(waqt => {
                    const isDone = logs[waqt];
                    const isJamah = logs[waqt + '_jamah'];
                    return (
                        <div key={waqt} className="flex flex-col gap-2.5">
                            <button
                                onClick={() => onToggle(waqt, 'done')}
                                className={`flex flex-col items-center py-4 rounded-2xl transition-all duration-300 border relative group/btn ${isDone
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                    : 'bg-white/[0.02] border-white/5 text-slate-700 hover:text-slate-400 hover:bg-white/5'
                                    }`}
                                title={`Mark ${waqt} Done`}
                            >
                                <span className={`text-[9px] font-black mb-2 uppercase tracking-tighter ${isDone ? 'text-emerald-400' : 'text-slate-600'}`}>{waqt[0]}</span>
                                <CheckCircle2 size={20} className={isDone ? 'scale-110' : 'scale-90 opacity-40'} />
                                {isDone && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />}
                            </button>
                            <button
                                onClick={() => onToggle(waqt, 'jamah')}
                                className={`flex items-center justify-center py-3 rounded-2xl transition-all duration-300 border ${isJamah
                                    ? 'bg-primary border-primary text-neutral-950 shadow-lg shadow-primary/30 scale-105'
                                    : 'bg-neutral-950 border-white/5 text-slate-700 hover:text-primary hover:border-primary/40'
                                    }`}
                                title={`${waqt} in Congregation`}
                            >
                                <Users size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default App;
