let chaptersData = null;
let questionsData = null;
let currentChapter = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;

// Load data on startup
async function loadData() {
    try {
        const [chaptersRes, questionsRes] = await Promise.all([
            fetch('Chapters.json'),
            fetch('questions.json')
        ]);
        
        chaptersData = await chaptersRes.json();
        questionsData = await questionsRes.json();
        
        // Debug: Check how many chapters loaded
        console.log("Total chapters loaded:", chaptersData.chapters.length);
        
        showChaptersList();
    } catch (error) {
        document.getElementById('app').innerHTML = '<div class="loader">Error loading data. Check files!</div>';
        console.error(error);
    }
}

// Show all chapters (NOW SHOWS ALL 24)
function showChaptersList() {
    let html = `
        <div class="header">
            <h1>📚 Physics Syllabus</h1>
            <p>Complete NEET/JEE Preparation | 24 Chapters</p>
        </div>
    `;
    
    // Loop through ALL chapters - no limit now
    chaptersData.chapters.forEach(chapter => {
        html += `
            <div class="chapter-card" onclick="showChapterDetail(${chapter.id})">
                <h2>${chapter.id}. ${chapter.name}</h2>
                <div class="topics">
                    ${chapter.topics.map(t => `<span class="topic-tag">${t}</span>`).join('')}
                </div>
            </div>
        `;
    });
    
    // Add formulas button
    html += `<button class="back-btn" onclick="showFormulas()" style="margin-top:20px;">📖 View All Formulas (24 Chapters)</button>`;
    
    document.getElementById('app').innerHTML = html;
}

// Show chapter detail
function showChapterDetail(chapterId) {
    currentChapter = chaptersData.chapters.find(c => c.id === chapterId);
    
    if (!currentChapter) {
        console.error("Chapter not found:", chapterId);
        return;
    }
    
    let html = `
        <button class="back-btn" onclick="showChaptersList()">← Back to Chapters</button>
        
        <div class="header">
            <h1>${currentChapter.name}</h1>
            <p>${currentChapter.topics.join(' • ')}</p>
        </div>
        
        <div class="theory-box">
            <h3>📖 Theory</h3>
            <p>${currentChapter.theory}</p>
        </div>
        
        <div class="theory-box">
            <h3>📝 Key Formulas</h3>
            ${currentChapter.formulas.map(f => `
                <div class="formula">
                    <div>${f.name}</div>
                    <div style="font-size:18px; margin-top:8px;">${f.formula}</div>
                </div>
            `).join('')}
        </div>
        
        <button class="submit-btn" onclick="startQuiz(${chapterId})">📝 Take Chapter Quiz →</button>
    `;
    
    document.getElementById('app').innerHTML = html;
}

// Start quiz
function startQuiz(chapterId) {
    // Check if questions exist for this chapter
    const chapterKey = `chapter_${chapterId}`;
    
    if (!questionsData[chapterKey] || questionsData[chapterKey].length === 0) {
        alert(`No questions available for ${currentChapter.name} yet. Adding soon!`);
        return;
    }
    
    currentQuestions = questionsData[chapterKey];
    currentQuestionIndex = 0;
    userAnswers = new Array(currentQuestions.length).fill(null);
    score = 0;
    showQuestion();
}

// Show current question
function showQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        showResults();
        return;
    }
    
    const q = currentQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    
    let html = `
        <button class="back-btn" onclick="showChapterDetail(${currentChapter.id})">← Exit Quiz</button>
        
        <div class="header">
            <h3>Quiz: ${currentChapter.name}</h3>
            <p>Question ${currentQuestionIndex + 1} of ${currentQuestions.length}</p>
        </div>
        
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        
        <div class="quiz-question">
            <div class="question-text">${q.question}</div>
    `;
    
    q.options.forEach((option, idx) => {
        const isSelected = userAnswers[currentQuestionIndex] === idx;
        html += `
            <div class="option ${isSelected ? 'selected' : ''}" onclick="selectAnswer(${idx})">
                ${String.fromCharCode(65+idx)}. ${option}
            </div>
        `;
    });
    
    html += `
        </div>
        <button class="next-btn" onclick="nextQuestion()">
            ${currentQuestionIndex === currentQuestions.length - 1 ? 'Submit Quiz' : 'Next Question →'}
        </button>
    `;
    
    document.getElementById('app').innerHTML = html;
}

// Select answer
function selectAnswer(answerIndex) {
    userAnswers[currentQuestionIndex] = answerIndex;
    showQuestion();
}

// Next question
function nextQuestion() {
    if (userAnswers[currentQuestionIndex] === null) {
        alert('Please select an answer before continuing!');
        return;
    }
    
    currentQuestionIndex++;
    showQuestion();
}

// Show results
function showResults() {
    score = 0;
    for (let i = 0; i < currentQuestions.length; i++) {
        if (userAnswers[i] === currentQuestions[i].answer) {
            score++;
        }
    }
    
    let html = `
        <button class="back-btn" onclick="showChapterDetail(${currentChapter.id})">← Back to Chapter</button>
        
        <div class="result">
            <div class="header">
                <h2>Quiz Completed! 🎉</h2>
            </div>
            
            <div class="score">${score} / ${currentQuestions.length}</div>
            <div class="score" style="font-size:24px;">${Math.round((score/currentQuestions.length)*100)}%</div>
            
            <div class="theory-box">
                <h3>📊 Performance Analysis</h3>
    `;
    
    for (let i = 0; i < currentQuestions.length; i++) {
        const q = currentQuestions[i];
        const userCorrect = userAnswers[i] === q.answer;
        
        html += `
            <div class="formula-card" style="margin-top:15px; ${userCorrect ? 'border-left: 4px solid #4CAF50;' : 'border-left: 4px solid #e94560;'}">
                <div>Q${i+1}: ${q.question}</div>
                <div style="font-size:14px; margin-top:8px;">
                    ${userCorrect ? '✅ Correct' : `❌ Wrong. Correct: ${q.options[q.answer]}`}
                </div>
                <div style="font-size:12px; color:#aaa; margin-top:5px;">💡 ${q.explanation}</div>
            </div>
        `;
    }
    
    html += `
            </div>
            <button class="submit-btn" onclick="startQuiz(${currentChapter.id})">🔄 Retry Quiz</button>
        </div>
    `;
    
    document.getElementById('app').innerHTML = html;
}

// Show all formulas from all chapters
function showFormulas() {
    let html = `
        <button class="back-btn" onclick="showChaptersList()">← Back to Chapters</button>
        
        <div class="header">
            <h1>📖 Complete Formula Sheet</h1>
            <p>All 24 Chapters - Quick Revision</p>
        </div>
    `;
    
    chaptersData.chapters.forEach(chapter => {
        html += `
            <div class="theory-box">
                <h3>${chapter.id}. ${chapter.name}</h3>
                ${chapter.formulas.map(f => `
                    <div class="formula-card">
                        <div class="formula-name">${f.name}</div>
                        <div style="font-size:16px; margin-top:5px;">${f.formula}</div>
                    </div>
                `).join('')}
            </div>
        `;
    });
    
    document.getElementById('app').innerHTML = html;
}

// Start the app
loadData();
