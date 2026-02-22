import surahData from './surah-data.js';

class QuranTracker {
    constructor() {
        this.surahs = surahData;
        this.progress = JSON.parse(localStorage.getItem('quranProgress')) || {};
        this.init();
    }

    init() {
        this.renderStats();
        this.renderSurahs();
        this.setupEventListeners();
    }

    renderStats() {
        const totalAyats = this.surahs.reduce((sum, s) => sum + s.ayats, 0);
        let completedAyats = 0;
        let completedSurahs = 0;

        this.surahs.forEach(s => {
            const prog = this.progress[s.number] || 0;
            if (typeof prog === 'number') {
                completedAyats += prog;
                if (prog === s.ayats) completedSurahs++;
            } else if (prog === true) {
                completedAyats += s.ayats;
                completedSurahs++;
            }
        });

        document.getElementById('completed-surahs').textContent = `${completedSurahs}/114`;
        document.getElementById('total-progress').textContent = `${Math.round((completedAyats / totalAyats) * 100)}%`;
    }

    renderSurahs(filter = '') {
        const grid = document.getElementById('surah-grid');
        grid.innerHTML = '';

        const filteredSurahs = this.surahs.filter(s =>
            s.name.toLowerCase().includes(filter.toLowerCase()) ||
            s.englishName.toLowerCase().includes(filter.toLowerCase()) ||
            s.number.toString().includes(filter)
        );

        filteredSurahs.forEach(surah => {
            const currentAyat = this.progress[surah.number] || 0;
            const isCompleted = currentAyat === surah.ayats;
            const progressPercent = Math.round((currentAyat / surah.ayats) * 100);

            const card = document.createElement('div');
            card.className = 'surah-card';
            card.dataset.number = surah.number;

            card.innerHTML = `
                <div class="surah-number">${surah.number}</div>
                <div class="surah-name">${surah.name}</div>
                <span class="surah-english">${surah.englishName}</span>
                <span class="surah-ayats">${surah.ayats} Ayats</span>
                
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                
                <div class="tracking-controls">
                    <div class="ayat-input-group">
                        <input type="number" 
                               class="ayat-input" 
                               value="${currentAyat}" 
                               max="${surah.ayats}" 
                               min="0"
                               data-number="${surah.number}">
                        <span class="ayat-total">/ ${surah.ayats}</span>
                    </div>
                    <button class="btn-quick-add" data-number="${surah.number}">+1</button>
                    <button class="btn-complete ${isCompleted ? 'active' : ''}" data-number="${surah.number}">
                        ${isCompleted ? 'Done' : 'All'}
                    </button>
                </div>
            `;

            grid.appendChild(card);
        });
    }

    setupEventListeners() {
        const grid = document.getElementById('surah-grid');
        const searchInput = document.getElementById('surah-search');

        searchInput.addEventListener('input', (e) => {
            this.renderSurahs(e.target.value);
        });

        grid.addEventListener('input', (e) => {
            if (e.target.classList.contains('ayat-input')) {
                this.updateAyatProgress(e.target.dataset.number, e.target.value);
            }
        });

        grid.addEventListener('click', (e) => {
            const number = e.target.dataset.number;
            if (e.target.classList.contains('btn-quick-add')) {
                this.quickAddAyat(number);
            } else if (e.target.classList.contains('btn-complete')) {
                this.toggleFullCompletion(number);
            }
        });
    }

    updateAyatProgress(number, value) {
        const surah = this.surahs.find(s => s.number == number);
        let val = parseInt(value) || 0;
        if (val > surah.ayats) val = surah.ayats;
        if (val < 0) val = 0;

        this.progress[number] = val;
        this.saveAndRefresh(number, val, surah.ayats);
    }

    quickAddAyat(number) {
        const surah = this.surahs.find(s => s.number == number);
        let current = this.progress[number] || 0;
        if (current < surah.ayats) {
            current++;
            this.progress[number] = current;
            this.saveAndRefresh(number, current, surah.ayats);
        }
    }

    toggleFullCompletion(number) {
        const surah = this.surahs.find(s => s.number == number);
        const current = this.progress[number] || 0;

        if (current === surah.ayats) {
            this.progress[number] = 0;
        } else {
            this.progress[number] = surah.ayats;
        }

        this.saveAndRefresh(number, this.progress[number], surah.ayats);
    }

    saveAndRefresh(number, current, total) {
        localStorage.setItem('quranProgress', JSON.stringify(this.progress));

        const card = document.querySelector(`.surah-card[data-number="${number}"]`);
        const input = card.querySelector('.ayat-input');
        const fill = card.querySelector('.progress-fill');
        const btn = card.querySelector('.btn-complete');

        input.value = current;
        fill.style.width = `${Math.round((current / total) * 100)}%`;

        if (current === total) {
            btn.classList.add('active');
            btn.textContent = 'Done';
        } else {
            btn.classList.remove('active');
            btn.textContent = 'All';
        }

        this.renderStats();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QuranTracker();
});
