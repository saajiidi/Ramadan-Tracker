import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, CheckCircle2, Search, Plus, Trophy, Bookmark, Hash, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { juzStarts, surahStarts } from './data/quranMapping';

const WAQT_LIST = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const App = () => {
    const [activeTab, setActiveTab] = useState('quran');

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

    // Tracing Logic
    const updateByPage = (p) => {
        const page = Math.max(1, Math.min(604, parseInt(p) || 1));

        // Find Juz
        let juz = 1;
        for (let i = 0; i < juzStarts.length; i++) {
            if (page >= juzStarts[i]) juz = i + 1;
            else break;
        }

        // Find Surah
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

        // Find Surah
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

        // Find Juz
        let juz = 1;
        for (let i = 0; i < juzStarts.length; i++) {
            if (page >= juzStarts[i]) juz = i + 1;
            else break;
        }

        setQuranState(prev => ({ ...prev, surah, page, juz, ayat: 1 }));
    };

    const updateByAyat = (a) => {
        setQuranState(prev => ({ ...prev, ayat: parseInt(a) || 1 }));
    }

    // Ramadan Calendar Data
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

    // Stats
    const quranProgressPercent = Math.round((quranState.page / 604) * 100);
    const totalPossibleWaqt = Object.keys(prayerLogs).length * 5;
    const performedWaqt = Object.values(prayerLogs).reduce((acc, day) => acc + Object.values(day).filter(Boolean).length, 0);
    const prayerPercent = totalPossibleWaqt > 0 ? Math.round((performedWaqt / totalPossibleWaqt) * 100) : 0;

    const toggleWaqt = (date, waqt) => {
        setPrayerLogs(prev => ({
            ...prev,
            [date]: {
                ...prev[date],
                [waqt]: !prev[date]?.[waqt]
            }
        }));
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <header className="mb-12 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-black text-gradient mb-2"
                >
                    RAMADAN HUB
                </motion.h1>
                <p className="text-slate-400 font-medium">Smart Hifz & Prayer Tracking</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard
                    icon={<BookOpen className="text-primary" />}
                    label="Quran Progress"
                    value={`${quranProgressPercent}%`}
                    subValue={`Page ${quranState.page} / 604`}
                />
                <StatCard
                    icon={<Clock className="text-emerald-400" />}
                    label="Prayer Sincerity"
                    value={`${prayerPercent}%`}
                    subValue={`${performedWaqt} Waqt Performed`}
                />
                <StatCard
                    icon={<Trophy className="text-orange-400" />}
                    label="Ramadan Day"
                    value={ramadanDays.find(d => d.fullDate === today)?.ramadanDay || '--'}
                    subValue="Day of Mercy"
                />
            </div>

            <div className="flex justify-center gap-4 mb-12">
                <TabButton
                    active={activeTab === 'quran'}
                    onClick={() => setActiveTab('quran')}
                    icon={<Bookmark size={20} />}
                    label="Hifz Tracker"
                />
                <TabButton
                    active={activeTab === 'prayer'}
                    onClick={() => setActiveTab('prayer')}
                    icon={<Calendar size={20} />}
                    label="Ramadan Calendar"
                />
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'quran' ? (
                    <motion.div
                        key="quran"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="premium-card p-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <BookOpen size={120} />
                            </div>

                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                <Layers className="text-primary" />
                                Smart Tracking Input
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <SmartInput
                                    label="Juz / Para"
                                    value={quranState.juz}
                                    max={30}
                                    onChange={updateByJuz}
                                    icon={<Hash size={16} />}
                                />
                                <SmartInput
                                    label="Page (Hafezi)"
                                    value={quranState.page}
                                    max={604}
                                    onChange={updateByPage}
                                    icon={<Bookmark size={16} />}
                                />
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Surah Name</label>
                                    <select
                                        value={quranState.surah}
                                        onChange={(e) => updateBySurah(e.target.value)}
                                        className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all text-primary font-bold appearance-none cursor-pointer"
                                    >
                                        {surahStarts.map(s => (
                                            <option key={s.n} value={s.n} className="bg-dark">{s.n}. {s.s}</option>
                                        ))}
                                    </select>
                                </div>
                                <SmartInput
                                    label="Ayat Number"
                                    value={quranState.ayat}
                                    max={286}
                                    onChange={updateByAyat}
                                    icon={<Plus size={16} />}
                                />
                            </div>

                            <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-black">
                                        {quranState.juz}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400">Current Position</p>
                                        <p className="text-xl font-black text-gradient uppercase tracking-wide">
                                            {surahStarts.find(s => s.n === quranState.surah)?.s} • Page {quranState.page}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => updateByPage(quranState.page + 1)}
                                    className="px-8 py-3 bg-primary text-dark font-black rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2"
                                >
                                    Next Page <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="prayer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {ramadanDays.map(day => (
                            <CalendarDay
                                key={day.ramadanDay}
                                day={day}
                                isToday={day.fullDate === today}
                                logs={prayerLogs[day.fullDate] || {}}
                                onToggle={(waqt) => toggleWaqt(day.fullDate, waqt)}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SmartInput = ({ label, value, max, onChange, icon }) => (
    <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
            {icon} {label}
        </label>
        <div className="relative group">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                min={1}
                max={max}
                className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all text-primary font-bold group-hover:border-white/20"
            />
            <span className="absolute right-4 top-3 text-[10px] text-slate-600 font-bold">MAX {max}</span>
        </div>
    </div>
);

const StatCard = ({ icon, label, value, subValue }) => (
    <div className="premium-card p-6 flex items-center gap-6">
        <div className="p-4 bg-white/5 rounded-2xl">{icon}</div>
        <div>
            <p className="text-slate-400 text-sm font-medium">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{subValue}</p>
        </div>
    </div>
);

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all ${active ? 'bg-primary text-dark shadow-xl shadow-primary/20 scale-105' : 'bg-card text-slate-400 hover:text-white'
            }`}
    >
        {icon}
        {label}
    </button>
);

const CalendarDay = ({ day, logs, onToggle, isToday }) => {
    const count = Object.values(logs).filter(Boolean).length;
    return (
        <div className={`premium-card p-5 ${isToday ? 'ring-2 ring-primary/50' : ''}`}>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-primary">#{day.ramadanDay}</span>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{day.date}</p>
                        {isToday && <span className="text-[10px] bg-primary/20 text-primary px-1 rounded">TODAY</span>}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xl font-bold">{count}/5</p>
                    <p className="text-[10px] text-slate-500 uppercase">Waqt Performed</p>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
                {WAQT_LIST.map(waqt => (
                    <button
                        key={waqt}
                        onClick={() => onToggle(waqt)}
                        className={`flex flex-col items-center p-2 rounded-lg transition-all ${logs[waqt] ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-600 hover:text-slate-400'
                            }`}
                    >
                        <span className="text-[10px] font-bold mb-1">{waqt[0]}</span>
                        <CheckCircle2 size={16} />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default App;
