// ZenDash Application Logic

// Quotes database
const QUOTES = [
    { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
    { text: "Focus is a matter of deciding what things you're not going to do.", author: "John Carmack" },
    { text: "Mindfulness isn't difficult, we just need to remember to do it.", author: "Sharon Salzberg" },
    { text: "Your mind is for having ideas, not holding them.", author: "David Allen" },
    { text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", author: "Buddha" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca" },
    { text: "Muddy water is best cleared by leaving it alone.", author: "Alan Watts" },
    { text: "Flow is being completely involved in an activity for its own sake.", author: "Mihaly Csikszentmihalyi" }
];

// App State
let tasks = [];
let timerInterval = null;
let timerSecondsLeft = 25 * 60;
let timerTotalSeconds = 25 * 60;
let isTimerRunning = false;
let currentTimerMode = 'focus'; // 'focus' or 'break'

// Selectors
const docEl = document.documentElement;
const greetingText = document.getElementById('greeting-text');
const clockTime = document.getElementById('clock-time');
const clockDate = document.getElementById('clock-date');

// Navigation
const tabButtons = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');

// Themes
const themeButtons = document.querySelectorAll('.theme-btn');

// Quotes
const quoteTextEl = document.getElementById('quote-text');
const quoteAuthorEl = document.getElementById('quote-author');
const nextQuoteBtn = document.getElementById('next-quote-btn');

// Timer
const miniTimerDisplay = document.getElementById('mini-timer');
const fullTimerDisplay = document.getElementById('full-timer-display');
const quickTimerToggle = document.getElementById('quick-timer-toggle');
const quickTimerReset = document.getElementById('quick-timer-reset');
const fullTimerToggle = document.getElementById('full-timer-toggle');
const fullTimerReset = document.getElementById('full-timer-reset');
const btnModeFocus = document.getElementById('timer-btn-mode-focus');
const btnModeBreak = document.getElementById('timer-btn-mode-break');
const timerModeLabel = document.getElementById('timer-mode-label');
const timerProgress = document.getElementById('timer-progress');
const quickTimerStatus = document.getElementById('quick-timer-status');

// Tasks
const quickTaskForm = document.getElementById('quick-task-form');
const quickTaskInput = document.getElementById('quick-task-input');
const quickTaskList = document.getElementById('quick-task-list');
const fullTaskForm = document.getElementById('full-task-form');
const taskTitleInput = document.getElementById('task-title');
const taskPriorityInput = document.getElementById('task-priority');
const fullTaskList = document.getElementById('full-task-list');
const tasksCountBadge = document.getElementById('tasks-count');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const filterButtons = document.querySelectorAll('.filter-btn');

// Circle SVG setup
let circleCircumference = 0;
if (timerProgress) {
    const radius = timerProgress.r.baseVal.value;
    circleCircumference = radius * 2 * Math.PI;
    timerProgress.style.strokeDasharray = `${circleCircumference} ${circleCircumference}`;
    timerProgress.style.strokeDashoffset = circleCircumference;
}

// ----------------------------------------------------
// 1. Initializers & Setup
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initTheme();
    initQuotes();
    initTabs();
    initTasks();
    initTimerDisplay();
});

// Clock & Date Logic
function initClock() {
    function updateClock() {
        const now = new Date();
        
        // Time
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();
        
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        
        clockTime.textContent = `${hours}:${minutes}:${seconds}`;

        // Date
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        clockDate.textContent = now.toLocaleDateString('en-US', options);

        // Greeting
        const currentHour = now.getHours();
        let greeting = "Good evening, Guest";
        if (currentHour < 12) {
            greeting = "Good morning, Guest";
        } else if (currentHour < 18) {
            greeting = "Good afternoon, Guest";
        }
        greetingText.textContent = greeting;
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

// Themes setup
function initTheme() {
    const savedTheme = localStorage.getItem('zendash-theme') || 'aurora';
    setTheme(savedTheme);

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedTheme = btn.getAttribute('data-theme');
            setTheme(selectedTheme);
        });
    });
}

function setTheme(themeName) {
    docEl.setAttribute('data-theme-style', themeName);
    localStorage.setItem('zendash-theme', themeName);

    themeButtons.forEach(btn => {
        if (btn.getAttribute('data-theme') === themeName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Tab Switching
function initTabs() {
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    tabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    tabContents.forEach(content => {
        if (content.id === `tab-${tabName}`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// ----------------------------------------------------
// 2. Quotes Logic
// ----------------------------------------------------

function initQuotes() {
    displayNewQuote();
    nextQuoteBtn.addEventListener('click', displayNewQuote);
}

function displayNewQuote() {
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    const quote = QUOTES[randomIndex];
    
    // Smooth transition
    quoteTextEl.style.opacity = '0';
    quoteAuthorEl.style.opacity = '0';
    
    setTimeout(() => {
        quoteTextEl.textContent = `"${quote.text}"`;
        quoteAuthorEl.textContent = `— ${quote.author}`;
        quoteTextEl.style.opacity = '1';
        quoteAuthorEl.style.opacity = '1';
    }, 250);
}

// ----------------------------------------------------
// 3. Tasks Logic
// ----------------------------------------------------

let currentTaskFilter = 'all';

function initTasks() {
    // Load from local storage
    const storedTasks = localStorage.getItem('zendash-tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    } else {
        // Sample tasks for initial aesthetic feel
        tasks = [
            { id: 1, text: "Explore ZenDash themes", priority: "low", completed: true },
            { id: 2, text: "Start a 25-minute focus session", priority: "medium", completed: false },
            { id: 3, text: "Finish daily planning exercise", priority: "high", completed: false }
        ];
        saveTasks();
    }

    // Task adding listeners
    quickTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addTask(quickTaskInput.value, 'medium');
        quickTaskInput.value = '';
    });

    fullTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addTask(taskTitleInput.value, taskPriorityInput.value);
        taskTitleInput.value = '';
    });

    // Clear completed task list
    clearCompletedBtn.addEventListener('click', () => {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
    });

    // Task filtering
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTaskFilter = btn.getAttribute('data-filter');
            renderTasks();
        });
    });

    renderTasks();
}

function addTask(text, priority) {
    if (!text.trim()) return;
    const newTask = {
        id: Date.now(),
        text: text.trim(),
        priority: priority,
        completed: false
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
}

function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

function saveTasks() {
    localStorage.setItem('zendash-tasks', JSON.stringify(tasks));
}

function renderTasks() {
    // Render Quick task list (dashboard tab)
    quickTaskList.innerHTML = '';
    const activeTasks = tasks.filter(t => !t.completed);
    
    // Quick list only shows uncompleted tasks (max 4)
    activeTasks.slice(0, 4).forEach(task => {
        const li = createTaskElement(task, false);
        quickTaskList.appendChild(li);
    });

    // Update badges
    tasksCountBadge.textContent = `${activeTasks.length} task${activeTasks.length !== 1 ? 's' : ''} left`;

    // Render Full task list (tasks tab)
    fullTaskList.innerHTML = '';
    
    let filteredTasks = tasks;
    if (currentTaskFilter === 'active') {
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (currentTaskFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    }

    filteredTasks.forEach(task => {
        const li = createTaskElement(task, true);
        fullTaskList.appendChild(li);
    });
}

function createTaskElement(task, showDetails = true) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;

    const left = document.createElement('div');
    left.className = 'task-left';

    const checkbox = document.createElement('div');
    checkbox.className = `task-checkbox ${task.completed ? 'checked' : ''}`;
    checkbox.innerHTML = '<i class="fa-solid fa-check"></i>';
    checkbox.addEventListener('click', () => toggleTask(task.id));

    const span = document.createElement('span');
    span.className = 'task-text';
    
    if (showDetails) {
        const priorityDot = document.createElement('span');
        priorityDot.className = `priority-indicator priority-${task.priority}`;
        left.appendChild(priorityDot);
    }
    
    span.textContent = task.text;

    left.appendChild(checkbox);
    left.appendChild(span);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-delete';
    deleteBtn.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
    deleteBtn.title = "Delete Task";
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(left);
    li.appendChild(deleteBtn);

    return li;
}

// ----------------------------------------------------
// 4. Custom Timer Logic (Pomodoro)
// ----------------------------------------------------

function initTimerDisplay() {
    updateTimerUI();

    quickTimerToggle.addEventListener('click', toggleTimer);
    fullTimerToggle.addEventListener('click', toggleTimer);
    quickTimerReset.addEventListener('click', resetTimer);
    fullTimerReset.addEventListener('click', resetTimer);

    btnModeFocus.addEventListener('click', () => setTimerMode('focus'));
    btnModeBreak.addEventListener('click', () => setTimerMode('break'));
}

function setTimerMode(mode) {
    if (isTimerRunning) {
        clearInterval(timerInterval);
        isTimerRunning = false;
    }
    
    currentTimerMode = mode;
    
    if (mode === 'focus') {
        timerTotalSeconds = 25 * 60;
        timerModeLabel.textContent = "Focus Time";
        btnModeFocus.classList.add('active');
        btnModeBreak.classList.remove('active');
    } else {
        timerTotalSeconds = 5 * 60;
        timerModeLabel.textContent = "Break Time";
        btnModeBreak.classList.add('active');
        btnModeFocus.classList.remove('active');
    }
    
    timerSecondsLeft = timerTotalSeconds;
    updateTimerUI();
}

function toggleTimer() {
    if (isTimerRunning) {
        // Pause
        clearInterval(timerInterval);
        isTimerRunning = false;
        quickTimerStatus.textContent = "Paused";
        updatePlayIcons(false);
    } else {
        // Start
        isTimerRunning = true;
        quickTimerStatus.textContent = currentTimerMode === 'focus' ? "Focusing..." : "Resting...";
        updatePlayIcons(true);
        
        timerInterval = setInterval(() => {
            timerSecondsLeft--;
            if (timerSecondsLeft <= 0) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                playZenBell();
                quickTimerStatus.textContent = "Finished";
                updatePlayIcons(false);
                
                // Swap mode automatically
                if (currentTimerMode === 'focus') {
                    alert("Focus session complete! Take a well-deserved break.");
                    setTimerMode('break');
                } else {
                    alert("Break completed! Ready to focus?");
                    setTimerMode('focus');
                }
            }
            updateTimerUI();
        }, 1000);
    }
}

function resetTimer() {
    if (isTimerRunning) {
        clearInterval(timerInterval);
        isTimerRunning = false;
    }
    timerSecondsLeft = timerTotalSeconds;
    quickTimerStatus.textContent = "Ready";
    updatePlayIcons(false);
    updateTimerUI();
}

function updatePlayIcons(running) {
    const playIcon = '<i class="fa-solid fa-play"></i>';
    const pauseIcon = '<i class="fa-solid fa-pause"></i>';
    
    quickTimerToggle.innerHTML = running ? pauseIcon : playIcon;
    
    if (running) {
        fullTimerToggle.innerHTML = pauseIcon + ' Pause Session';
        fullTimerToggle.classList.add('btn-secondary');
        fullTimerToggle.classList.remove('btn-primary');
    } else {
        fullTimerToggle.innerHTML = playIcon + ' Start Session';
        fullTimerToggle.classList.add('btn-primary');
        fullTimerToggle.classList.remove('btn-secondary');
    }
}

function updateTimerUI() {
    const minutes = Math.floor(timerSecondsLeft / 60);
    const seconds = timerSecondsLeft % 60;
    
    const displayStr = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    
    miniTimerDisplay.textContent = displayStr;
    fullTimerDisplay.textContent = displayStr;
    
    // Update SVG progress ring
    if (timerProgress && circleCircumference) {
        const percentage = (timerTotalSeconds - timerSecondsLeft) / timerTotalSeconds;
        const offset = circleCircumference - (percentage * circleCircumference);
        timerProgress.style.strokeDashoffset = offset;
    }
}

// Gentle Web Audio API synthesizer for Zen Ring Bell sound (no assets needed!)
function playZenBell() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        
        // Bell chime using subtractive FM synthesis logic or multiple sine frequencies
        const frequencies = [440, 554.37, 659.25, 880]; // Major triad chime
        
        frequencies.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            
            // Gain envelope (long decaying ring)
            gainNode.gain.setValueAtTime(0.08 / frequencies.length, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.0 + index * 0.5);
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 4.0);
        });
    } catch (e) {
        console.error("Audio Context could not start:", e);
    }
}
