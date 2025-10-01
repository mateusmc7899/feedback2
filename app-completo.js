console.log('🚀 MedStudy iniciando...');

// DADOS DA APLICAÇÃO
const APP = {
    studies: [],
    disciplines: [
        {id: 1, nome: "Cardiologia", assuntos: ["Arritmias", "ICC", "HAS", "Coronariopatias"], isCustom: false},
        {id: 2, nome: "Pneumologia", assuntos: ["Asma", "DPOC", "Pneumonias"], isCustom: false},
        {id: 3, nome: "Neurologia", assuntos: ["AVC", "Epilepsia", "Cefaléias"], isCustom: false},
        {id: 4, nome: "Endocrinologia", assuntos: ["Diabetes", "Tireoide", "Obesidade"], isCustom: false},
        {id: 5, nome: "Gastroenterologia", assuntos: ["DRGE", "Úlcera", "Hepatites"], isCustom: false}
    ],
    dailyGoal: 3
};

// FUNÇÃO PARA MOSTRAR TOAST
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// NAVEGAÇÃO - A FUNÇÃO MAIS IMPORTANTE!
function setupNavigation() {
    console.log('🔧 Configurando navegação...');
    
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log('Botões encontrados:', navButtons.length);
    console.log('Abas encontradas:', tabContents.length);
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            console.log('🖱️ Clicou em:', targetTab);
            
            // Remove classe active de todos os botões
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adiciona classe active no botão clicado
            this.classList.add('active');
            
            // Esconde todas as abas
            tabContents.forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Mostra a aba correspondente
            const targetElement = document.getElementById(targetTab);
            if (targetElement) {
                targetElement.classList.add('active');
                console.log('✅ Aba ativada:', targetTab);
                
                // Atualiza conteúdo específico da aba
                if (targetTab === 'configuracoes') {
                    updateDisciplinesList();
                }
            } else {
                console.error('❌ Elemento não encontrado:', targetTab);
            }
        });
    });
}

// FORMULÁRIO DE CADASTRO
function setupStudyForm() {
    const disciplineSelect = document.getElementById('discipline');
    const topicSelect = document.getElementById('topic');
    const customTopicGroup = document.getElementById('custom-topic-group');
    const studyForm = document.getElementById('study-form');
    const studyDate = document.getElementById('study-date');
    
    // Preenche disciplinas
    updateDisciplineSelect();
    
    // Data padrão (hoje)
    const today = new Date().toISOString().split('T')[0];
    studyDate.value = today;
    
    // Mudança de disciplina
    disciplineSelect.addEventListener('change', function() {
        const disciplineId = parseInt(this.value);
        const discipline = APP.disciplines.find(d => d.id === disciplineId);
        
        topicSelect.innerHTML = '<option value="">Selecione um tópico</option>';
        customTopicGroup.classList.add('hidden');
        
        if (discipline) {
            discipline.assuntos.forEach(topic => {
                const option = document.createElement('option');
                option.value = topic;
                option.textContent = topic;
                topicSelect.appendChild(option);
            });
            
            // Adiciona opção "Outro"
            const otherOption = document.createElement('option');
            otherOption.value = 'outro';
            otherOption.textContent = 'Outro...';
            topicSelect.appendChild(otherOption);
        }
    });
    
    // Mudança de tópico
    topicSelect.addEventListener('change', function() {
        if (this.value === 'outro') {
            customTopicGroup.classList.remove('hidden');
        } else {
            customTopicGroup.classList.add('hidden');
        }
    });
    
    // Envio do formulário
    studyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        let topic = formData.get('topic');
        
        if (topic === 'outro') {
            topic = formData.get('custom-topic');
        }
        
        const totalQuestions = parseInt(formData.get('total-questions'));
        const correctAnswers = parseInt(formData.get('correct-answers'));
        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        
        const study = {
            id: Date.now(),
            discipline: formData.get('discipline'),
            topic: topic,
            totalQuestions: totalQuestions,
            correctAnswers: correctAnswers,
            percentage: percentage,
            date: formData.get('study-date'),
            nextReview: formData.get('study-date'), // Primeira revisão é no mesmo dia
            interval: 1
        };
        
        APP.studies.push(study);
        console.log('📚 Novo estudo:', study);
        
        showToast('✅ Estudo cadastrado com sucesso!');
        this.reset();
        studyDate.value = today;
        customTopicGroup.classList.add('hidden');
        
        updateDashboard();
        updateReviews();
        updateHistory();
        saveToLocalStorage();
    });
}

// CADASTRO DE NOVAS DISCIPLINAS
function setupCustomDisciplineForm() {
    const form = document.getElementById('custom-discipline-form');
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const name = formData.get('discipline-name').trim();
        const topicsString = formData.get('discipline-topics').trim();
        
        // Validações
        if (!name || !topicsString) {
            showToast('❌ Nome e tópicos são obrigatórios');
            return;
        }
        
        // Verifica se já existe disciplina com esse nome
        const existingDiscipline = APP.disciplines.find(d => 
            d.nome.toLowerCase() === name.toLowerCase()
        );
        
        if (existingDiscipline) {
            showToast('❌ Já existe uma disciplina com esse nome');
            return;
        }
        
        // Processa tópicos
        const topics = topicsString.split(',')
            .map(topic => topic.trim())
            .filter(topic => topic.length > 0);
        
        if (topics.length === 0) {
            showToast('❌ Adicione pelo menos um tópico válido');
            return;
        }
        
        // Cria nova disciplina
        const newId = Math.max(...APP.disciplines.map(d => d.id)) + 1;
        const newDiscipline = {
            id: newId,
            nome: name,
            assuntos: topics,
            isCustom: true
        };
        
        APP.disciplines.push(newDiscipline);
        console.log('✅ Nova disciplina criada:', newDiscipline);
        
        showToast(`✅ Disciplina "${name}" adicionada com sucesso!`);
        
        // Limpa o formulário
        this.reset();
        
        // Atualiza as listas
        updateDisciplineSelect();
        updateDisciplinesList();
        saveToLocalStorage();
    });
}

// ATUALIZAR SELECT DE DISCIPLINAS
function updateDisciplineSelect() {
    const disciplineSelect = document.getElementById('discipline');
    if (!disciplineSelect) return;
    
    disciplineSelect.innerHTML = '<option value="">Selecione uma disciplina</option>';
    
    APP.disciplines.forEach(disc => {
        const option = document.createElement('option');
        option.value = disc.id;
        option.textContent = disc.nome + (disc.isCustom ? ' (Customizada)' : '');
        disciplineSelect.appendChild(option);
    });
}

// ATUALIZAR LISTA DE DISCIPLINAS CADASTRADAS
function updateDisciplinesList() {
    const container = document.getElementById('disciplines-list');
    if (!container) return;
    
    if (APP.disciplines.length === 0) {
        container.innerHTML = '<p>Nenhuma disciplina cadastrada</p>';
        return;
    }
    
    container.innerHTML = APP.disciplines.map(discipline => `
        <div class="discipline-item">
            <div class="discipline-info">
                <h4>${discipline.nome} ${discipline.isCustom ? '(Customizada)' : ''}</h4>
                <p><strong>Tópicos:</strong> ${discipline.assuntos.join(', ')}</p>
            </div>
            <div class="discipline-actions">
                ${discipline.isCustom ? `
                    <button class="btn btn-danger" onclick="deleteDiscipline(${discipline.id})">
                        🗑️ Excluir
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// EXCLUIR DISCIPLINA CUSTOMIZADA
function deleteDiscipline(disciplineId) {
    // Verifica se a disciplina está sendo usada em algum estudo
    const isUsed = APP.studies.some(study => study.discipline == disciplineId);
    
    if (isUsed) {
        showToast('❌ Não é possível excluir disciplina que possui estudos cadastrados');
        return;
    }
    
    if (!confirm('Tem certeza que deseja excluir esta disciplina?')) {
        return;
    }
    
    // Remove a disciplina
    APP.disciplines = APP.disciplines.filter(d => d.id !== disciplineId);
    
    console.log('🗑️ Disciplina excluída:', disciplineId);
    showToast('✅ Disciplina excluída com sucesso!');
    
    // Atualiza as listas
    updateDisciplineSelect();
    updateDisciplinesList();
    saveToLocalStorage();
}

// ATUALIZAR DASHBOARD
function updateDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const todayStudies = APP.studies.filter(s => s.date === today);
    const progress = Math.min(100, (todayStudies.length / APP.dailyGoal) * 100);
    
    document.getElementById('daily-progress').style.width = progress + '%';
    document.getElementById('daily-text').textContent = `${todayStudies.length} / ${APP.dailyGoal} estudos concluídos hoje`;
    document.getElementById('total-studies').textContent = APP.studies.length;
    
    if (APP.studies.length > 0) {
        const avgPerformance = Math.round(APP.studies.reduce((sum, s) => sum + s.percentage, 0) / APP.studies.length);
        document.getElementById('avg-performance').textContent = avgPerformance + '%';
        
        const lastStudy = APP.studies[APP.studies.length - 1];
        document.getElementById('last-activity').textContent = new Date(lastStudy.date).toLocaleDateString('pt-BR');
    }
}

// ATUALIZAR REVISÕES
function updateReviews() {
    const today = new Date().toISOString().split('T')[0];
    const todayReviews = APP.studies.filter(s => s.nextReview === today);
    
    const todayContainer = document.getElementById('today-reviews');
    
    if (todayReviews.length === 0) {
        todayContainer.innerHTML = '<p>✅ Nenhuma revisão programada para hoje</p>';
    } else {
        todayContainer.innerHTML = todayReviews.map(study => `
            <div class="review-item">
                <div>
                    <strong>${study.topic}</strong> (${study.percentage}%)
                    <br><small>📅 Estudado em: ${new Date(study.date).toLocaleDateString('pt-BR')}</small>
                    <br><small>📚 ${getDisciplineName(study.discipline)}</small>
                </div>
                <button class="btn" onclick="markReviewDone(${study.id})">✅ Revisão Feita</button>
            </div>
        `).join('');
    }
    
    // Próximas revisões
    const futureReviews = APP.studies.filter(s => s.nextReview > today).slice(0, 5);
    const upcomingContainer = document.getElementById('upcoming-reviews');
    
    if (futureReviews.length === 0) {
        upcomingContainer.innerHTML = '<p>📅 Nenhuma revisão futura programada</p>';
    } else {
        upcomingContainer.innerHTML = futureReviews.map(study => `
            <div class="review-item">
                <div>
                    <strong>${study.topic}</strong>
                    <br><small>📅 Próxima revisão: ${new Date(study.nextReview).toLocaleDateString('pt-BR')}</small>
                    <br><small>📚 ${getDisciplineName(study.discipline)}</small>
                </div>
            </div>
        `).join('');
    }
}

// BUSCAR NOME DA DISCIPLINA
function getDisciplineName(disciplineId) {
    const discipline = APP.disciplines.find(d => d.id == disciplineId);
    return discipline ? discipline.nome : 'Disciplina não encontrada';
}

// MARCAR REVISÃO COMO FEITA
function markReviewDone(studyId) {
    const study = APP.studies.find(s => s.id === studyId);
    if (!study) return;
    
    // Algoritmo de repetição espaçada baseado na performance
    let newInterval = study.interval;
    if (study.percentage >= 80) {
        newInterval = Math.round(study.interval * 2.5);
    } else if (study.percentage >= 60) {
        newInterval = Math.round(study.interval * 1.3);
    } else {
        newInterval = Math.max(1, Math.round(study.interval * 0.6));
    }
    
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);
    
    study.nextReview = nextDate.toISOString().split('T')[0];
    study.interval = newInterval;
    
    console.log('✅ Revisão marcada como feita:', study);
    showToast(`✅ Revisão concluída! Próxima em ${newInterval} dia(s)`);
    
    updateReviews();
    updateDashboard();
    saveToLocalStorage();
}

// ATUALIZAR HISTÓRICO
function updateHistory() {
    const studiesList = document.getElementById('studies-list');
    
    if (APP.studies.length === 0) {
        studiesList.innerHTML = '<p>📚 Nenhum estudo cadastrado ainda</p>';
        return;
    }
    
    const sortedStudies = [...APP.studies].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    studiesList.innerHTML = sortedStudies.map(study => {
        const disciplineName = getDisciplineName(study.discipline);
        const performanceClass = study.percentage >= 80 ? 'high' : study.percentage >= 60 ? 'medium' : 'low';
        
        return `
            <div class="review-item">
                <div>
                    <strong>${study.topic}</strong> <span class="discipline-tag">(${disciplineName})</span>
                    <br>📊 Performance: <span class="performance-${performanceClass}">${study.percentage}%</span> (${study.correctAnswers}/${study.totalQuestions})
                    <br>📅 Data: ${new Date(study.date).toLocaleDateString('pt-BR')}
                    <br>🔄 Próxima revisão: ${new Date(study.nextReview).toLocaleDateString('pt-BR')}
                </div>
            </div>
        `;
    }).join('');
}

// CONFIGURAÇÕES
function setupSettings() {
    // Configurar formulário de disciplina customizada
    setupCustomDisciplineForm();
    
    // Copiar dados
    document.getElementById('copy-data').addEventListener('click', function() {
        const data = JSON.stringify({
            studies: APP.studies,
            disciplines: APP.disciplines,
            settings: { dailyGoal: APP.dailyGoal }
        }, null, 2);
        
        navigator.clipboard.writeText(data).then(() => {
            showToast('📋 Dados copiados para a área de transferência!');
            console.log('📋 Dados copiados');
        }).catch(() => {
            showToast('❌ Erro ao copiar dados');
        });
    });
    
    // Download
    document.getElementById('download-data').addEventListener('click', function() {
        const data = JSON.stringify({
            studies: APP.studies,
            disciplines: APP.disciplines,
            settings: { dailyGoal: APP.dailyGoal }
        }, null, 2);
        
        const blob = new Blob([data], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medstudy-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showToast('💾 Download iniciado!');
        console.log('💾 Download realizado');
    });
    
    // Salvar meta
    document.getElementById('save-goal').addEventListener('click', function() {
        const newGoal = parseInt(document.getElementById('daily-goal').value);
        if (newGoal && newGoal > 0) {
            APP.dailyGoal = newGoal;
            showToast('🎯 Meta diária atualizada!');
            updateDashboard();
            saveToLocalStorage();
        }
    });
}

// PERSISTÊNCIA DE DADOS
function saveToLocalStorage() {
    localStorage.setItem('medstudyAppCompleto', JSON.stringify({
        studies: APP.studies,
        disciplines: APP.disciplines,
        dailyGoal: APP.dailyGoal
    }));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('medstudyAppCompleto');
    if (saved) {
        const data = JSON.parse(saved);
        APP.studies = data.studies || [];
        APP.disciplines = data.disciplines || APP.disciplines; // Mantém as padrões se não tiver customizadas
        APP.dailyGoal = data.dailyGoal || 3;
        document.getElementById('daily-goal').value = APP.dailyGoal;
    }
}

// INICIALIZAÇÃO
function init() {
    console.log('🎯 Inicializando aplicação...');
    
    // Carregar dados salvos
    loadFromLocalStorage();
    
    // Configurar navegação (MAIS IMPORTANTE!)
    setupNavigation();
    
    // Configurar formulário
    setupStudyForm();
    
    // Configurar configurações
    setupSettings();
    
    // Atualizar interfaces
    updateDashboard();
    updateReviews();
    updateHistory();
    updateDisciplinesList();
    
    console.log('✅ Aplicação inicializada com sucesso!');
}

// TORNAR FUNÇÕES GLOBAIS PARA onClick
window.markReviewDone = markReviewDone;
window.deleteDiscipline = deleteDiscipline;

// INICIAR QUANDO DOM ESTIVER PRONTO
document.addEventListener('DOMContentLoaded', init);