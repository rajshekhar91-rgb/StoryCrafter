document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections ---
    const generateBtn = document.getElementById('generate-btn');
    const wordInput = document.getElementById('word-input');
    const surpriseBtn = document.getElementById('surprise-btn');
    const themeToggle = document.getElementById('theme-toggle');
    
    const storyModal = document.getElementById('story-output-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const storyContent = document.getElementById('story-content');
    const loadingIndicator = document.getElementById('loading-indicator');

    const copyBtn = document.getElementById('copy-btn');
    const saveBtn = document.getElementById('save-btn');
    const shareBtn = document.getElementById('share-btn');
    
    const historyList = document.getElementById('history-list');

    // --- API & Config ---
    const GEMINI_API_KEY = 'AIzaSyD5t4YqfB6AkF49TNtceBDMLdCviHH5wXM'; // Replace with your key
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    const randomWords = ["moon", "river", "whisper", "key", "shadow", "clock", "dream", "forest", "star", "phoenix", "labyrinth", "mirror", "ocean", "journey", "silence"];

    // --- Event Listeners ---
    generateBtn.addEventListener('click', handleGenerateStory);
    surpriseBtn.addEventListener('click', fillWithRandomWords);
    themeToggle.addEventListener('click', toggleTheme);
    closeModalBtn.addEventListener('click', hideModal);
    copyBtn.addEventListener('click', copyStory);
    saveBtn.addEventListener('click', () => alert('Story saved to your history!'));
    shareBtn.addEventListener('click', shareStory);

    // --- Core Functions ---
    async function handleGenerateStory() {
        const words = wordInput.value.trim();
        if (!words) {
            alert('Please enter some words to generate a story.');
            return;
        }

        showModal();
        storyContent.innerHTML = '';
        loadingIndicator.style.display = 'flex';

        try {
            const prompt = `Write a creative, engaging, and well-structured short story that prominently features these words: ${words}.`;
            const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            
            const data = await response.json();
            const generatedText = data.candidates[0].content.parts[0].text;
            
            displayStory(generatedText);
            addToHistory(words, generatedText);
        } catch (error) {
            console.error('Error generating story:', error);
            storyContent.innerHTML = `<p class="text-red-500">Sorry, something went wrong. Please check your API key and network connection.</p>`;
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }
    
    function displayStory(story) {
        storyContent.innerHTML = story.replace(/\n/g, '<br>');
    }

    function fillWithRandomWords() {
        const selectedWords = randomWords.sort(() => 0.5 - Math.random()).slice(0, 3).join(', ');
        wordInput.value = selectedWords;
    }

    // --- Modal Functions ---
    function showModal() {
        storyModal.classList.add('visible');
    }
    function hideModal() {
        storyModal.classList.remove('visible');
    }
    
    // --- Utility Functions ---
    function toggleTheme() {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        lucide.createIcons();
    }

    function copyStory() {
        navigator.clipboard.writeText(storyContent.innerText)
            .then(() => alert('Story copied to clipboard!'))
            .catch(err => console.error('Failed to copy: ', err));
    }

    async function shareStory() {
        if (navigator.share) {
            await navigator.share({ title: 'A Story from StoryCrafter', text: storyContent.innerText });
        } else {
            alert('Web Share API is not supported in your browser.');
        }
    }

    // --- History Functions ---
    function addToHistory(words, story) {
        let history = JSON.parse(localStorage.getItem('storyHistory')) || [];
        history.unshift({ words, story, date: new Date().toISOString() });
        if (history.length > 6) history.pop();
        localStorage.setItem('storyHistory', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        const history = JSON.parse(localStorage.getItem('storyHistory')) || [];
        historyList.innerHTML = history.map(item => `
            <div class="history-card p-4 cursor-pointer">
                <h4 class="font-bold truncate">${item.words}</h4>
                <p class="text-sm opacity-70 truncate">${item.story}</p>
            </div>
        `).join('');

        // Add event listeners to new history items
        historyList.querySelectorAll('.history-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                showModal();
                loadingIndicator.style.display = 'none';
                displayStory(history[index].story);
            });
        });
    }

    // --- Initialization ---
    function init() {
        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.classList.add('dark');
        }
        renderHistory();
        lucide.createIcons();

        // PWA Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch(err => console.error('Service worker registration failed:', err));
            });
        }
    }

    init();
});