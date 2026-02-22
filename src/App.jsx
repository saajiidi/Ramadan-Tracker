import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, CheckCircle2, Search, Plus, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { surahData } from './data/surahData';

const WAQT_LIST = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const App = () => {
    const [activeTab, setActiveTab] = useState('quran');
    const [quranProgress, setQuranProgress] = useState(() =>
        JSON.parse(localStorage.getItem('quranProgress')) || {}
    );
    const [prayerLogs, setPrayerLogs] = useState(() =>
        JSON.parse(localStorage.getItem('prayerLogs')) || {}
    );
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        localStorage.setItem('quranProgress', JSON.stringify(quranProgress));
    }, [quranProgress]);

    useEffect(() => {
        localStorage.setItem('prayerLogs', JSON.stringify(prayerLogs));
    }, [prayerLogs]);

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

    // Calculations
    const totalAyats = surahData.reduce((acc, s) => acc + s.ayats, 0);
    const completedAyats = surahData.reduce((acc, s) => acc + (quranProgress[s.number] || 0), 0);
    const quranPercent = Math.round((completedAyats / totalAyats) * 100);

    const totalPossibleWaqt = Object.keys(prayerLogs).length * 5;
    const performedWaqt = Object.values(prayerLogs).reduce((acc, day) => acc + Object.values(day).filter(Boolean).length, 0);
    const prayerPercent = totalPossibleWaqt > 0 ? Math.round((performedWaqt / totalPossibleWaqt) * 100) : 0;

    // Handlers
    const handleAyatChange = (surahNum, val, max) => {
        let num = parseInt(val) || 0;
        if (num > max) num = max;
        if (num < 0) num = 0;
        setQuranProgress(prev => ({ ...prev, [surahNum]: num }));
    };

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
            {/* Header */}
            <header className="mb-12 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-black text-gradient mb-2"
                >
                    RAMADAN HUB
                </motion.h1>
                <p className="text-slate-400 font-medium">Perfect Tracking for a Blessed Month</p>
            </header>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard
                    icon={<BookOpen className="text-primary" />}
                    label="Quran Progress"
                    value={`${quranPercent}%`}
                    subValue={`${completedAyats}/${totalAyats} Ayats`}
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

            {/* Navigation */}
            <div className="flex justify-center gap-4 mb-8">
                <TabButton
                    active={activeTab === 'quran'}
                    onClick={() => setActiveTab('quran')}
                    icon={<BookOpen size={20} />}
                    label="Quran Tracker"
                />
                <TabButton
                    active={activeTab === 'prayer'}
                    onClick={() => setActiveTab('prayer')}
                    icon={<Calendar size={20} />}
                    label="Ramadan Calendar"
                />
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'quran' ? (
                    <motion.div
                        key="quran"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <div className="mb-8 max-w-xl mx-auto relative">
                            <Search className="absolute left-4 top-3 text-slate-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search Surah by name or number..."
                                className="w-full bg-card border border-white/10 rounded-full py-3 pl-12 pr-6 outline-none focus:border-primary transition-colors"
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {surahData
                                .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.number.toString().includes(searchQuery))
                                .map(surah => (
                                    <SurahCard
                                        key={surah.number}
                                        surah={surah}
                                        progress={quranProgress[surah.number] || 0}
                                        onChange={(val) => handleAyatChange(surah.number, val, surah.ayats)}
                                    />
                                ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="prayer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
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
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${active ? 'bg-primary text-dark shadow-xl' : 'bg-card text-slate-400 hover:text-white'
            }`}
    >
        {icon}
        {label}
    </button>
);

const SurahCard = ({ surah, progress, onChange }) => {
    const percent = Math.round((progress / surah.ayats) * 100);
    return (
        <div className="premium-card p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 text-7xl font-black opacity-5 group-hover:opacity-10 transition-opacity">
                {surah.number}
            </div>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-primary">{surah.name}</h3>
                    <p className="text-sm text-slate-500">{surah.englishName}</p>
                </div>
                <div className="text-right">
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">
                        {surah.ayats} Ayats
                    </span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 bg-white/5 rounded-lg p-2 flex items-center">
                        <input
                            type="number"
                            value={progress}
                            onChange={(e) => onChange(e.target.value)}
                            className="bg-transparent w-full text-center font-bold text-primary outline-none"
                        />
                        <span className="text-slate-600 px-2">/</span>
                        <span className="text-slate-400 font-medium">{surah.ayats}</span>
                    </div>
                    <button
                        onClick={() => onChange(progress === surah.ayats ? 0 : surah.ayats)}
                        className={`p-2 rounded-lg transition-colors ${progress === surah.ayats ? 'bg-primary text-dark' : 'bg-white/5 text-slate-400'}`}
                    >
                        <CheckCircle2 size={24} />
                    </button>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        className="h-full bg-primary"
                    />
                </div>
            </div>
        </div>
    );
};

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
