// Medical Studies Application - Complete Implementation
class MedStudyApp {
    constructor() {
        this.studies = [];
        this.disciplines = [];
        this.dailyGoal = 5;
        this.currentTimer = {
            isRunning: false,
            isPaused: false,
            startTime: null,
            pausedTime: 0,
            totalTime: 0,
            intervalId: null
        };
        this.charts = {};
        this.init();
    }

    init() {
        this.loadData();
        this.setupNavigation();
        this.setupEventListeners();
        this.setupModal();
        this.updateAllViews();
        this.setTodayDate();
    }

    // Data Management
    loadData() {
        // Load initial disciplines
        const initialDisciplines = [
            {
                id: 1,
                nome: "Cardiologia",
                assuntos: ["Arritmias", "Insuficiência Cardíaca", "Coronariopatias", "Hipertensão", "Valvopatias"],
                isCustom: false
            },
            {
                id: 2,
                nome: "Pneumologia", 
                assuntos: ["Asma", "DPOC", "Pneumonias", "Derrame Pleural", "Embolia Pulmonar"],
                isCustom: false
            },
            {
                id: 3,
                nome: "Gastroenterologia",
                assuntos: ["DRGE", "Úlcera Péptica", "Hepatites", "Cirrose", "Pancreatite"],
                isCustom: false
            },
            {
                id: 4,
                nome: "Neurologia",
                assuntos: ["AVC", "Epilepsia", "Cefaléias", "Demências", "Parkinson"],
                isCustom: false
            },
            {
                id: 5,
                nome: "Endocrinologia",
                assuntos: ["Diabetes", "Tireoidopatias", "Obesidade", "Osteoporose", "Adrenal"],
                isCustom: false
            }
        ];

        // Load saved data or use initial data
        const savedStudies = localStorage.getItem('medStudyStudies');
        const savedDisciplines = localStorage.getItem('medStudyDisciplines');
        const savedGoal = localStorage.getItem('medStudyDailyGoal');

        this.studies = savedStudies ? JSON.parse(savedStudies) : [];
        this.disciplines = savedDisciplines ? JSON.parse(savedDisciplines) : initialDisciplines;
        this.dailyGoal = savedGoal ? parseInt(savedGoal) : 5;
    }

    saveData() {
        localStorage.setItem('medStudyStudies', JSON.stringify(this.studies));
        localStorage.setItem('medStudyDisciplines', JSON.stringify(this.disciplines));
        localStorage.setItem('medStudyDailyGoal', this.dailyGoal.toString());
    }

    // Navigation Setup
    setupNavigation() {
        const navTabs = document.querySelectorAll('.nav-tab');
        const tabContents = document.querySelectorAll('.tab-content');

        navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = tab.dataset.tab;
                
                // Update active tab
                navTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update active content
                tabContents.forEach(content => content.classList.remove('active'));
                const targetContent = document.getElementById(`${targetTab}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
                
                // Update data when switching tabs
                setTimeout(() => {
                    this.updateTabContent(targetTab);
                }, 100);
            });
        });
    }

    updateTabContent(tab) {
        switch(tab) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'revisoes':
                this.updateReviews();
                break;
            case 'historico':
                this.updateHistory();
                break;
            case 'configuracoes':
                this.updateCustomDisciplines();
                break;
        }
    }

    // Modal Setup
    setupModal() {
        const modal = document.getElementById('confirmation-modal');
        const backdrop = modal.querySelector('.modal-backdrop');
        const cancelBtn = document.getElementById('modal-cancel');

        backdrop.addEventListener('click', () => this.hideModal());
        cancelBtn.addEventListener('click', () => this.hideModal());
    }

    showModal(title, message, onConfirm) {
        const modal = document.getElementById('confirmation-modal');
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').textContent = message;
        
        const confirmBtn = document.getElementById('modal-confirm');
        confirmBtn.onclick = () => {
            this.hideModal();
            onConfirm();
        };
        
        modal.classList.remove('hidden');
    }

    hideModal() {
        document.getElementById('confirmation-modal').classList.add('hidden');
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Study form
        document.getElementById('study-form').addEventListener('submit', (e) => this.handleStudySubmit(e));
        document.getElementById('discipline').addEventListener('change', (e) => this.handleDisciplineChange(e));
        document.getElementById('topic').addEventListener('change', (e) => this.handleTopicChange(e));
        
        // Timer controls
        document.getElementById('toggle-timer').addEventListener('click', () => this.toggleTimerDisplay());
        document.getElementById('start-timer').addEventListener('click', () => this.startTimer());
        document.getElementById('pause-timer').addEventListener('click', () => this.pauseTimer());
        document.getElementById('reset-timer').addEventListener('click', () => this.resetTimer());

        // History filters
        document.getElementById('filter-search').addEventListener('input', () => this.updateHistory());
        document.getElementById('filter-discipline').addEventListener('change', () => this.updateHistory());
        document.getElementById('filter-date-from').addEventListener('change', () => this.updateHistory());
        document.getElementById('filter-date-to').addEventListener('change', () => this.updateHistory());
        document.getElementById('filter-performance').addEventListener('change', () => this.updateHistory());
        document.getElementById('clear-filters').addEventListener('click', () => this.clearFilters());

        // Settings
        document.getElementById('add-discipline').addEventListener('click', () => this.addCustomDiscipline());
        document.getElementById('new-discipline-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addCustomDiscipline();
        });

        // Backup and Import
        document.getElementById('download-json').addEventListener('click', () => this.downloadJSON());
        document.getElementById('copy-data').addEventListener('click', () => this.copyData());
        document.getElementById('view-data').addEventListener('click', () => this.viewData());
        document.getElementById('import-data').addEventListener('click', () => document.getElementById('import-file').click());
        document.getElementById('import-file').addEventListener('change', (e) => this.importData(e));
        document.getElementById('clear-all-data').addEventListener('click', () => this.clearAllData());

        // Goals
        document.getElementById('set-goal').addEventListener('click', () => this.setDailyGoal());
        document.getElementById('daily-goal').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setDailyGoal();
        });
    }

    // Utility Functions
    setTodayDate() {
        document.getElementById('study-date').value = this.getDateString(new Date());
    }

    getDateString(date) {
        return date.toISOString().split('T')[0];
    }

    updateAllViews() {
        this.populateDisciplineSelects();
        this.updateDashboard();
        this.updateReviews();
        this.updateHistory();
        this.updateCustomDisciplines();
        this.updateCurrentGoal();
    }

    // Study Form Handlers
    handleDisciplineChange(e) {
        const disciplineId = e.target.value;
        const topicSelect = document.getElementById('topic');
        const customTopicGroup = document.getElementById('custom-topic-group');
        
        topicSelect.innerHTML = '<option value="">Selecione um tópico</option>';
        customTopicGroup.style.display = 'none';
        document.getElementById('custom-topic').value = '';
        document.getElementById('custom-topic').required = false;
        
        if (disciplineId) {
            const discipline = this.disciplines.find(d => d.id.toString() === disciplineId);
            if (discipline) {
                topicSelect.disabled = false;
                
                discipline.assuntos.forEach(topic => {
                    const option = document.createElement('option');
                    option.value = topic;
                    option.textContent = topic;
                    topicSelect.appendChild(option);
                });
                
                const otherOption = document.createElement('option');
                otherOption.value = 'outro';
                otherOption.textContent = 'Outro';
                topicSelect.appendChild(otherOption);
            }
        } else {
            topicSelect.disabled = true;
            topicSelect.innerHTML = '<option value="">Selecione primeiro uma disciplina</option>';
        }
    }

    handleTopicChange(e) {
        const selectedTopic = e.target.value;
        const customTopicGroup = document.getElementById('custom-topic-group');
        const customTopicInput = document.getElementById('custom-topic');
        
        if (selectedTopic === 'outro') {
            customTopicGroup.style.display = 'block';
            customTopicInput.required = true;
            setTimeout(() => customTopicInput.focus(), 100);
        } else {
            customTopicGroup.style.display = 'none';
            customTopicInput.required = false;
            customTopicInput.value = '';
        }
    }

    handleStudySubmit(e) {
        e.preventDefault();
        
        const disciplineId = document.getElementById('discipline').value;
        const selectedTopic = document.getElementById('topic').value;
        const customTopic = document.getElementById('custom-topic').value;
        const correctAnswers = parseInt(document.getElementById('correct-answers').value);
        const totalQuestions = parseInt(document.getElementById('total-questions').value);
        const studyDate = document.getElementById('study-date').value || this.getDateString(new Date());
        const studyTimeInput = document.getElementById('study-time').value;
        const observations = document.getElementById('observations').value;
        
        // Validation
        if (!disciplineId || !selectedTopic) {
            this.showToast('Por favor, selecione disciplina e tópico', 'error');
            return;
        }
        
        if (selectedTopic === 'outro' && !customTopic.trim()) {
            this.showToast('Por favor, digite o nome do novo tópico', 'error');
            return;
        }
        
        if (correctAnswers > totalQuestions) {
            this.showToast('O número de questões corretas não pode ser maior que o total', 'error');
            return;
        }
        
        const finalTopic = selectedTopic === 'outro' ? customTopic.trim() : selectedTopic;
        
        let studyTime = 0;
        if (this.currentTimer.totalTime > 0) {
            studyTime = Math.floor(this.currentTimer.totalTime / 60);
        } else if (studyTimeInput) {
            studyTime = parseInt(studyTimeInput);
        }
        
        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        
        const study = {
            id: Date.now(),
            discipline: disciplineId,
            topic: finalTopic,
            correctAnswers,
            totalQuestions,
            percentage,
            studyDate,
            studyTime: studyTime * 60,
            observations,
            createdAt: new Date().toISOString(),
            nextReview: this.calculateNextReview(new Date(studyDate), percentage, 1),
            repetition: 1,
            easeFactor: this.calculateInitialEaseFactor(percentage)
        };
        
        // Add custom topic to discipline
        if (selectedTopic === 'outro') {
            const discipline = this.disciplines.find(d => d.id.toString() === disciplineId);
            if (discipline && !discipline.assuntos.includes(finalTopic)) {
                discipline.assuntos.push(finalTopic);
            }
        }
        
        this.studies.unshift(study);
        this.saveData();
        
        // Reset form
        e.target.reset();
        this.resetTimer();
        this.setTodayDate();
        document.getElementById('topic').disabled = true;
        document.getElementById('topic').innerHTML = '<option value="">Selecione primeiro uma disciplina</option>';
        document.getElementById('custom-topic-group').style.display = 'none';
        document.getElementById('timer-display').style.display = 'none';
        
        this.updateAllViews();
        this.showToast('Estudo cadastrado com sucesso!', 'success');
    }

    // Timer Functions
    toggleTimerDisplay() {
        const timerDisplay = document.getElementById('timer-display');
        const toggleBtn = document.getElementById('toggle-timer');
        const studyTimeInput = document.getElementById('study-time');
        
        if (timerDisplay.style.display === 'none' || !timerDisplay.style.display) {
            timerDisplay.style.display = 'block';
            toggleBtn.textContent = 'Ocultar Timer';
            studyTimeInput.style.display = 'none';
        } else {
            timerDisplay.style.display = 'none';
            toggleBtn.textContent = 'Usar Timer';
            studyTimeInput.style.display = 'block';
            this.resetTimer();
        }
    }

    startTimer() {
        if (!this.currentTimer.isRunning) {
            this.currentTimer.isRunning = true;
            this.currentTimer.isPaused = false;
            this.currentTimer.startTime = Date.now() - this.currentTimer.pausedTime;
            
            this.currentTimer.intervalId = setInterval(() => {
                this.updateTimerDisplay();
            }, 1000);
            
            document.getElementById('start-timer').textContent = 'Continuar';
            document.getElementById('pause-timer').disabled = false;
        } else if (this.currentTimer.isPaused) {
            this.currentTimer.isPaused = false;
            this.currentTimer.startTime = Date.now() - this.currentTimer.pausedTime;
            
            this.currentTimer.intervalId = setInterval(() => {
                this.updateTimerDisplay();
            }, 1000);
            
            document.getElementById('start-timer').textContent = 'Continuar';
            document.getElementById('pause-timer').disabled = false;
        }
    }

    pauseTimer() {
        if (this.currentTimer.isRunning && !this.currentTimer.isPaused) {
            this.currentTimer.isPaused = true;
            clearInterval(this.currentTimer.intervalId);
            document.getElementById('pause-timer').disabled = true;
        }
    }

    resetTimer() {
        this.currentTimer = {
            isRunning: false,
            isPaused: false,
            startTime: null,
            pausedTime: 0,
            totalTime: 0,
            intervalId: null
        };
        
        clearInterval(this.currentTimer.intervalId);
        document.getElementById('timer-minutes').textContent = '00';
        document.getElementById('timer-seconds').textContent = '00';
        document.getElementById('start-timer').textContent = 'Iniciar';
        document.getElementById('pause-timer').disabled = false;
    }

    updateTimerDisplay() {
        if (this.currentTimer.isRunning && !this.currentTimer.isPaused) {
            this.currentTimer.totalTime = Date.now() - this.currentTimer.startTime;
            this.currentTimer.pausedTime = this.currentTimer.totalTime;
        }
        
        const minutes = Math.floor(this.currentTimer.totalTime / 60000);
        const seconds = Math.floor((this.currentTimer.totalTime % 60000) / 1000);
        
        document.getElementById('timer-minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('timer-seconds').textContent = seconds.toString().padStart(2, '0');
    }

    // SM-2 Algorithm
    calculateInitialEaseFactor(percentage) {
        if (percentage >= 90) return 2.6;
        if (percentage >= 80) return 2.5;
        if (percentage >= 70) return 2.3;
        if (percentage >= 60) return 2.0;
        return 1.3;
    }

    calculateNextReview(date, percentage, repetition = 1, currentEaseFactor = 2.5) {
        let easeFactor = currentEaseFactor;
        let interval = 1;
        
        // Adjust ease factor based on performance
        if (percentage >= 90) {
            easeFactor = Math.min(easeFactor + 0.1, 2.8);
        } else if (percentage >= 80) {
            easeFactor = Math.max(easeFactor, 2.5);
        } else if (percentage >= 70) {
            easeFactor = Math.max(easeFactor - 0.1, 1.3);
        } else if (percentage >= 60) {
            easeFactor = Math.max(easeFactor - 0.2, 1.3);
        } else {
            easeFactor = Math.max(easeFactor - 0.3, 1.3);
            repetition = 1; // Reset repetition for poor performance
        }
        
        // Calculate interval
        if (repetition === 1) {
            interval = 1;
        } else if (repetition === 2) {
            interval = 6;
        } else {
            interval = Math.round(interval * easeFactor);
        }
        
        const nextReviewDate = new Date(date);
        nextReviewDate.setDate(nextReviewDate.getDate() + interval);
        
        return this.getDateString(nextReviewDate);
    }

    // Dashboard Functions
    updateDashboard() {
        this.updateDashboardStats();
        this.updateDailyGoalProgress();
        this.updateStreakCards();
        this.updateDashboardCharts();
    }

    updateDashboardStats() {
        const totalStudies = this.studies.length;
        const totalTime = this.studies.reduce((sum, study) => sum + (study.studyTime || 0), 0);
        const avgPerformance = totalStudies > 0 
            ? Math.round(this.studies.reduce((sum, study) => sum + study.percentage, 0) / totalStudies)
            : 0;
        
        const today = this.getDateString(new Date());
        const overdueReviews = this.studies.filter(study => 
            study.nextReview && study.nextReview < today
        ).length;
        
        const todayReviews = this.studies.filter(study => 
            study.nextReview && study.nextReview === today
        ).length;

        const avgTime = totalStudies > 0 ? Math.round(totalTime / totalStudies / 60) : 0;
        
        document.getElementById('total-studies').textContent = totalStudies;
        document.getElementById('overdue-reviews-stat').textContent = overdueReviews;
        document.getElementById('today-reviews-stat').textContent = todayReviews;
        document.getElementById('avg-performance').textContent = `${avgPerformance}%`;
        document.getElementById('total-time').textContent = `${Math.floor(totalTime / 3600)}h`;
        document.getElementById('avg-time').textContent = `${avgTime}min`;
    }

    updateDailyGoalProgress() {
        const today = this.getDateString(new Date());
        const todayStudies = this.studies.filter(study => study.studyDate === today).length;
        
        const progressPercentage = this.dailyGoal > 0 ? Math.min((todayStudies / this.dailyGoal) * 100, 100) : 0;
        
        document.getElementById('daily-progress').textContent = todayStudies;
        document.getElementById('daily-target').textContent = this.dailyGoal;
        document.getElementById('progress-fill').style.width = `${progressPercentage}%`;
        document.getElementById('progress-percentage').textContent = `${Math.round(progressPercentage)}%`;
    }

    updateStreakCards() {
        const streak = this.calculateCurrentStreak();
        const bestStreak = this.calculateBestStreak();
        
        document.getElementById('current-streak').textContent = streak.current;
        document.getElementById('best-streak').textContent = bestStreak;
    }

    calculateCurrentStreak() {
        const sortedDates = [...new Set(this.studies.map(s => s.studyDate))].sort().reverse();
        let currentStreak = 0;
        const today = this.getDateString(new Date());
        
        for (let i = 0; i < sortedDates.length; i++) {
            const date = new Date(sortedDates[i]);
            const expectedDate = new Date();
            expectedDate.setDate(expectedDate.getDate() - i);
            const expectedDateStr = this.getDateString(expectedDate);
            
            if (sortedDates[i] === expectedDateStr) {
                currentStreak++;
            } else {
                break;
            }
        }
        
        return { current: currentStreak, dates: sortedDates };
    }

    calculateBestStreak() {
        const sortedDates = [...new Set(this.studies.map(s => s.studyDate))].sort();
        let bestStreak = 0;
        let currentStreak = 1;
        
        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = new Date(sortedDates[i - 1]);
            const currentDate = new Date(sortedDates[i]);
            const dayDiff = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
            
            if (dayDiff === 1) {
                currentStreak++;
            } else {
                bestStreak = Math.max(bestStreak, currentStreak);
                currentStreak = 1;
            }
        }
        
        return Math.max(bestStreak, currentStreak);
    }

    updateDashboardCharts() {
        this.updateDisciplinesChart();
        this.updatePerformanceChart();
        this.updateActivityHeatmap();
        this.updateStreakChart();
    }

    updateDisciplinesChart() {
        const ctx = document.getElementById('disciplines-chart').getContext('2d');
        
        const disciplineData = {};
        this.studies.forEach(study => {
            const discipline = this.disciplines.find(d => d.id.toString() === study.discipline);
            const disciplineName = discipline ? discipline.nome : 'Desconhecida';
            disciplineData[disciplineName] = (disciplineData[disciplineName] || 0) + 1;
        });
        
        const labels = Object.keys(disciplineData);
        const data = Object.values(disciplineData);
        
        if (this.charts.disciplines) {
            this.charts.disciplines.destroy();
        }
        
        this.charts.disciplines = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updatePerformanceChart() {
        const ctx = document.getElementById('performance-chart').getContext('2d');
        
        const last10Studies = this.studies.slice(0, 10).reverse();
        const labels = last10Studies.map((study, index) => `#${index + 1}`);
        const data = last10Studies.map(study => study.percentage);
        
        if (this.charts.performance) {
            this.charts.performance.destroy();
        }
        
        this.charts.performance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Performance (%)',
                    data: data,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    updateActivityHeatmap() {
        const container = document.getElementById('activity-heatmap');
        const today = new Date();
        const days = [];
        
        // Generate last 30 days
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            days.push(date);
        }
        
        // Count studies per day
        const studyCount = {};
        this.studies.forEach(study => {
            const date = study.studyDate;
            studyCount[date] = (studyCount[date] || 0) + 1;
        });
        
        // Create heatmap HTML
        container.innerHTML = days.map(date => {
            const dateStr = this.getDateString(date);
            const count = studyCount[dateStr] || 0;
            let level = 0;
            
            if (count > 0) level = 1;
            if (count >= 2) level = 2;
            if (count >= 3) level = 3;
            if (count >= 5) level = 4;
            
            return `<div class="heatmap-day level-${level}" title="${dateStr}: ${count} estudos"></div>`;
        }).join('');
    }

    updateStreakChart() {
        const ctx = document.getElementById('streak-chart').getContext('2d');
        
        const last7Days = [];
        const streakData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = this.getDateString(date);
            last7Days.push(date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }));
            
            const dayStudies = this.studies.filter(study => study.studyDate === dateStr).length;
            streakData.push(dayStudies);
        }
        
        if (this.charts.streak) {
            this.charts.streak.destroy();
        }
        
        this.charts.streak = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Estudos por Dia',
                    data: streakData,
                    backgroundColor: '#1FB8CD',
                    borderColor: '#1FB8CD',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    // Reviews Functions
    updateReviews() {
        const today = this.getDateString(new Date());
        const overdueReviews = [];
        const todayReviews = [];
        const upcomingReviews = [];
        
        this.studies.forEach(study => {
            if (study.nextReview) {
                if (study.nextReview < today) {
                    overdueReviews.push(study);
                } else if (study.nextReview === today) {
                    todayReviews.push(study);
                } else {
                    upcomingReviews.push(study);
                }
            }
        });
        
        overdueReviews.sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview));
        upcomingReviews.sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview));
        
        document.getElementById('overdue-count').textContent = overdueReviews.length;
        document.getElementById('today-count').textContent = todayReviews.length;
        document.getElementById('upcoming-count').textContent = Math.min(upcomingReviews.length, 10);
        
        this.renderReviewsList('overdue-reviews', overdueReviews);
        this.renderReviewsList('today-reviews', todayReviews);
        this.renderReviewsList('upcoming-reviews', upcomingReviews.slice(0, 10));
    }

    renderReviewsList(containerId, reviews) {
        const container = document.getElementById(containerId);
        
        if (reviews.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📚</div><div class="empty-state-description">Nenhuma revisão encontrada</div></div>';
            return;
        }
        
        container.innerHTML = reviews.map(review => {
            const discipline = this.disciplines.find(d => d.id.toString() === review.discipline);
            const disciplineName = discipline ? discipline.nome : 'Desconhecida';
            const reviewDate = new Date(review.nextReview).toLocaleDateString('pt-BR');
            
            return `
                <div class="review-item">
                    <div class="review-content">
                        <div class="review-title">${disciplineName} - ${review.topic}</div>
                        <div class="review-details">
                            Último resultado: ${review.percentage}% (${review.correctAnswers}/${review.totalQuestions})
                        </div>
                    </div>
                    <div class="review-actions">
                        <button class="btn btn--primary btn--sm" onclick="app.markReviewDone(${review.id})">
                            Revisão Feita
                        </button>
                    </div>
                    <div class="review-date">${reviewDate}</div>
                </div>
            `;
        }).join('');
    }

    markReviewDone(studyId) {
        this.showModal(
            'Revisão Concluída',
            'Qual foi seu desempenho nesta revisão?',
            () => this.processReview(studyId)
        );
    }

    processReview(studyId) {
        const study = this.studies.find(s => s.id === studyId);
        if (!study) return;
        
        // Simple approach: assume good performance for demo
        const newPerformance = 85;
        const newRepetition = (study.repetition || 1) + 1;
        
        study.nextReview = this.calculateNextReview(
            new Date(),
            newPerformance,
            newRepetition,
            study.easeFactor || 2.5
        );
        study.repetition = newRepetition;
        study.easeFactor = this.calculateInitialEaseFactor(newPerformance);
        
        this.saveData();
        this.updateReviews();
        this.updateDashboard();
        this.showToast('Revisão reagendada com sucesso!', 'success');
    }

    // History Functions
    updateHistory() {
        const searchFilter = document.getElementById('filter-search').value.toLowerCase();
        const disciplineFilter = document.getElementById('filter-discipline').value;
        const dateFromFilter = document.getElementById('filter-date-from').value;
        const dateToFilter = document.getElementById('filter-date-to').value;
        const performanceFilter = document.getElementById('filter-performance').value;
        
        let filteredStudies = [...this.studies];
        
        // Apply filters
        if (searchFilter) {
            filteredStudies = filteredStudies.filter(study => 
                study.topic.toLowerCase().includes(searchFilter) ||
                (study.observations && study.observations.toLowerCase().includes(searchFilter))
            );
        }
        
        if (disciplineFilter) {
            filteredStudies = filteredStudies.filter(study => study.discipline === disciplineFilter);
        }
        
        if (dateFromFilter) {
            filteredStudies = filteredStudies.filter(study => study.studyDate >= dateFromFilter);
        }
        
        if (dateToFilter) {
            filteredStudies = filteredStudies.filter(study => study.studyDate <= dateToFilter);
        }
        
        if (performanceFilter) {
            switch(performanceFilter) {
                case 'excellent':
                    filteredStudies = filteredStudies.filter(study => study.percentage >= 90);
                    break;
                case 'good':
                    filteredStudies = filteredStudies.filter(study => study.percentage >= 80 && study.percentage < 90);
                    break;
                case 'average':
                    filteredStudies = filteredStudies.filter(study => study.percentage >= 70 && study.percentage < 80);
                    break;
                case 'poor':
                    filteredStudies = filteredStudies.filter(study => study.percentage < 70);
                    break;
            }
        }
        
        const totalFiltered = filteredStudies.length;
        const averageFiltered = totalFiltered > 0 
            ? Math.round(filteredStudies.reduce((sum, study) => sum + study.percentage, 0) / totalFiltered)
            : 0;
        
        document.getElementById('history-total').textContent = totalFiltered;
        document.getElementById('history-average').textContent = `${averageFiltered}%`;
        
        this.renderHistoryList(filteredStudies);
    }

    renderHistoryList(studies) {
        const container = document.getElementById('history-list');
        
        if (studies.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-title">Nenhum estudo encontrado</div><div class="empty-state-description">Tente ajustar os filtros ou cadastre um novo estudo</div></div>';
            return;
        }
        
        container.innerHTML = studies.map(study => {
            const discipline = this.disciplines.find(d => d.id.toString() === study.discipline);
            const disciplineName = discipline ? discipline.nome : 'Desconhecida';
            const studyDate = new Date(study.studyDate).toLocaleDateString('pt-BR');
            const studyTime = study.studyTime ? `${Math.floor(study.studyTime / 60)}min` : '';
            
            let performanceClass = 'performance-poor';
            if (study.percentage >= 90) performanceClass = 'performance-excellent';
            else if (study.percentage >= 80) performanceClass = 'performance-good';
            else if (study.percentage >= 70) performanceClass = 'performance-average';
            
            return `
                <div class="history-item">
                    <div class="history-content">
                        <div class="history-title">${disciplineName} - ${study.topic}</div>
                        <div class="history-details">
                            ${study.observations || 'Sem observações'} ${studyTime ? `• ${studyTime}` : ''}
                        </div>
                    </div>
                    <div class="history-score">
                        <div class="score-percentage ${performanceClass}">${study.percentage}%</div>
                        <div class="score-fraction">${study.correctAnswers}/${study.totalQuestions}</div>
                    </div>
                    <div class="history-date">${studyDate}</div>
                </div>
            `;
        }).join('');
    }

    clearFilters() {
        document.getElementById('filter-search').value = '';
        document.getElementById('filter-discipline').value = '';
        document.getElementById('filter-date-from').value = '';
        document.getElementById('filter-date-to').value = '';
        document.getElementById('filter-performance').value = '';
        this.updateHistory();
    }

    // Settings Functions
    addCustomDiscipline() {
        const nameInput = document.getElementById('new-discipline-name');
        const name = nameInput.value.trim();
        
        if (!name) {
            this.showToast('Por favor, digite o nome da disciplina', 'error');
            return;
        }
        
        const exists = this.disciplines.some(d => 
            d.nome.toLowerCase() === name.toLowerCase()
        );
        
        if (exists) {
            this.showToast('Esta disciplina já existe', 'error');
            return;
        }
        
        const newDiscipline = {
            id: Date.now(),
            nome: name,
            assuntos: [],
            isCustom: true
        };
        
        this.disciplines.push(newDiscipline);
        this.saveData();
        this.populateDisciplineSelects();
        this.updateCustomDisciplines();
        
        nameInput.value = '';
        this.showToast('Disciplina adicionada com sucesso!', 'success');
    }

    updateCustomDisciplines() {
        const container = document.getElementById('custom-disciplines-list');
        const customDisciplines = this.disciplines.filter(d => d.isCustom);
        
        if (customDisciplines.length === 0) {
            container.innerHTML = '<div class="empty-state-description">Nenhuma disciplina customizada criada</div>';
            return;
        }
        
        container.innerHTML = customDisciplines.map(discipline => `
            <div class="discipline-item">
                <span>${discipline.nome} (${discipline.assuntos.length} tópicos)</span>
                <button class="btn btn--outline btn--sm" onclick="app.removeCustomDiscipline(${discipline.id})">
                    Remover
                </button>
            </div>
        `).join('');
    }

    removeCustomDiscipline(disciplineId) {
        this.showModal(
            'Remover Disciplina',
            'Tem certeza que deseja remover esta disciplina? Todos os estudos relacionados serão mantidos.',
            () => {
                this.disciplines = this.disciplines.filter(d => d.id !== disciplineId);
                this.saveData();
                this.populateDisciplineSelects();
                this.updateCustomDisciplines();
                this.showToast('Disciplina removida com sucesso!', 'success');
            }
        );
    }

    populateDisciplineSelects() {
        const selects = ['discipline', 'filter-discipline'];
        
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            const currentValue = select.value;
            
            const firstOption = select.firstElementChild;
            select.innerHTML = '';
            select.appendChild(firstOption);
            
            this.disciplines.forEach(discipline => {
                const option = document.createElement('option');
                option.value = discipline.id.toString();
                option.textContent = discipline.nome;
                select.appendChild(option);
            });
            
            if (currentValue && this.disciplines.some(d => d.id.toString() === currentValue)) {
                select.value = currentValue;
            }
        });
    }

    setDailyGoal() {
        const goalInput = document.getElementById('daily-goal');
        const goal = parseInt(goalInput.value);
        
        if (!goal || goal < 1) {
            this.showToast('Por favor, digite um número válido', 'error');
            return;
        }
        
        this.dailyGoal = goal;
        this.saveData();
        this.updateCurrentGoal();
        this.updateDailyGoalProgress();
        
        goalInput.value = '';
        this.showToast('Meta diária definida com sucesso!', 'success');
    }

    updateCurrentGoal() {
        const goalElement = document.getElementById('current-goal');
        goalElement.textContent = this.dailyGoal > 0 ? `${this.dailyGoal} estudos por dia` : 'Não definida';
    }

    // Data Management Functions
    downloadJSON() {
        const data = {
            studies: this.studies,
            disciplines: this.disciplines,
            dailyGoal: this.dailyGoal,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `medstudy-backup-${this.getDateString(new Date())}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        this.showToast('Dados exportados com sucesso!', 'success');
    }

    copyData() {
        const data = {
            studies: this.studies,
            disciplines: this.disciplines,
            dailyGoal: this.dailyGoal,
            exportDate: new Date().toISOString()
        };
        
        navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
            this.showToast('Dados copiados para a área de transferência!', 'success');
        }).catch(() => {
            this.showToast('Erro ao copiar dados', 'error');
        });
    }

    viewData() {
        const dataViewer = document.getElementById('data-viewer');
        const textarea = document.getElementById('data-textarea');
        
        if (dataViewer.classList.contains('hidden')) {
            const data = {
                studies: this.studies,
                disciplines: this.disciplines,
                dailyGoal: this.dailyGoal,
                exportDate: new Date().toISOString()
            };
            
            textarea.value = JSON.stringify(data, null, 2);
            dataViewer.classList.remove('hidden');
            document.getElementById('view-data').textContent = 'Ocultar Dados';
        } else {
            dataViewer.classList.add('hidden');
            document.getElementById('view-data').textContent = 'Ver Dados';
        }
    }

    importData(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (data.studies && data.disciplines) {
                    this.showModal(
                        'Importar Dados',
                        'Importar dados irá substituir todos os dados atuais. Deseja continuar?',
                        () => {
                            this.studies = data.studies || [];
                            this.disciplines = data.disciplines || [];
                            this.dailyGoal = data.dailyGoal || 5;
                            
                            this.saveData();
                            this.updateAllViews();
                            
                            this.showToast('Dados importados com sucesso!', 'success');
                        }
                    );
                } else {
                    this.showToast('Arquivo inválido', 'error');
                }
            } catch (error) {
                this.showToast('Erro ao ler o arquivo', 'error');
            }
        };
        
        reader.readAsText(file);
        e.target.value = '';
    }

    clearAllData() {
        this.showModal(
            'Limpar Todos os Dados',
            'Esta ação irá remover TODOS os dados salvos. Esta ação não pode ser desfeita. Tem CERTEZA ABSOLUTA?',
            () => {
                localStorage.removeItem('medStudyStudies');
                localStorage.removeItem('medStudyDisciplines');
                localStorage.removeItem('medStudyDailyGoal');
                
                location.reload();
            }
        );
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        toast.innerHTML = `
            <div class="toast-header">${this.getToastTitle(type)}</div>
            <div class="toast-body">${message}</div>
        `;
        
        document.getElementById('toast-container').appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }

    getToastTitle(type) {
        const titles = {
            success: 'Sucesso!',
            error: 'Erro!',
            warning: 'Atenção!',
            info: 'Informação'
        };
        return titles[type] || titles.info;
    }
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MedStudyApp();
});
