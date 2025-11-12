// --- Element References (Global) ---
const body = document.body;
const textInput = document.getElementById('text-input');
const charCountSpan = document.getElementById('char-count');
const humanizeBtn = document.getElementById('humanize-btn');
const spellcheckBtn = document.getElementById('spellcheck-btn');
const humanScoreSpan = document.getElementById('human-score');
const aiScoreSpan = document.getElementById('ai-score');
const humanProgressFill = document.getElementById('human-progress');
const aiProgressFill = document.getElementById('ai-progress');
const statusCard = document.getElementById('status-card');
const statusLabel = document.getElementById('status-label');
const statusDescription = document.getElementById('status-description');
const homePage = document.getElementById('home-page');
const contactPage = document.getElementById('contact-page');
const navHome = document.getElementById('nav-home');
const navContact = document.getElementById('nav-contact');
const moonIcon = document.getElementById('moon-icon');
const sunIcon = document.getElementById('sun-icon');
const humanizeSpinner = document.getElementById('humanize-spinner');
const humanizeIcon = document.getElementById('humanize-icon');
const humanizeTextSpan = document.getElementById('humanize-text');

// --- Helper Functions ---

/**
 * Calculates a pseudo-random human/AI score based on a basic complexity check.
 * This is a placeholder for a real AI detection model.
 * @param {string} text - The input text.
 * @returns {{human: number, ai: number}} Scores from 0 to 100.
 */
function calculateScore(text) {
    if (text.length === 0) {
        return { human: 50, ai: 50 }; // Neutral for empty input
    }
    
    // Simple heuristic: Count complex words, average sentence length, use of professional jargon.
    const words = text.match(/\b\w+\b/g) || [];
    const sentences = text.split(/[.!?]\s*/).filter(s => s.length > 0);
    const complexWordsCount = words.filter(word => word.length >= 8).length;
    const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;

    // Use a placeholder for "jargon" detection (e.g., words in the placeholder text)
    const jargon = ["efficacy", "paradigm", "necessitates", "robust", "scalable", "infrastructure", "synergistic", "optimization", "concurrent", "processes"];
    const jargonCount = words.filter(word => jargon.includes(word.toLowerCase())).length;

    // A higher score indicates more AI-like patterns (uniform complexity/jargon)
    let aiScoreBase = (complexWordsCount * 0.5) + (avgSentenceLength * 2) + (jargonCount * 5);

    // Normalize and clamp the AI score between 0 and 100 (simple scaling)
    const maxAiScore = 150; // Arbitrary max score for normalization
    let aiScore = Math.min(100, Math.max(0, Math.round((aiScoreBase / maxAiScore) * 100)));
    
    // Reverse the score for the "Human" score
    let humanScore = 100 - aiScore;

    // Introduce slight randomness for a more dynamic feel
    const variance = Math.floor(Math.random() * 10) - 5; // -5 to +4
    aiScore = Math.min(100, Math.max(0, aiScore + variance));
    humanScore = 100 - aiScore;
    
    return { human: humanScore, ai: aiScore };
}

/**
 * Updates the UI with the calculated human and AI scores.
 * @param {number} humanScore 
 * @param {number} aiScore 
 */
function updateProgressUI(humanScore, aiScore) {
    // Update progress bar fills and text
    humanScoreSpan.textContent = `${humanScore}%`;
    aiScoreSpan.textContent = `${aiScore}%`;
    humanProgressFill.style.width = `${humanScore}%`;
    aiProgressFill.style.width = `${aiScore}%`;

    // Update status card
    statusCard.className = 'status-card';
    if (textInput.value.length === 0) {
        statusCard.classList.remove('high-ai', 'low-ai');
        statusLabel.textContent = 'Awaiting Input';
        statusDescription.textContent = 'Start typing or paste your text above to begin the analysis.';
    } else if (aiScore >= 70) {
        statusCard.classList.add('high-ai');
        statusLabel.textContent = 'High AI Detection';
        statusDescription.textContent = 'Your text is highly predictable and may be flagged by detectors. Click "Humanize Text" or apply the quick tips!';
    } else if (aiScore < 30) {
        statusCard.classList.add('low-ai');
        statusLabel.textContent = 'Low AI Detection';
        statusDescription.textContent = 'Great job! Your text sounds natural and human-like.';
    } else {
        statusCard.classList.remove('high-ai', 'low-ai');
        statusLabel.textContent = 'Moderate AI Detection';
        statusDescription.textContent = 'Your text shows some AI patterns. Consider applying the tips to increase your Human Score.';
    }
}

/**
 * Displays a toast notification.
 * @param {string} message - The message to display.
 * @param {string} type - 'success' or 'error'.
 */
function showToast(message, type) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        ${type === 'success' ? '<svg class="icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' : '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'}
        <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'none'; // Stop slideIn
        toast.style.opacity = 0;
        toast.style.transform = 'translateX(400px)';
        
        setTimeout(() => {
            container.removeChild(toast);
        }, 300); // Wait for fade out
    }, 4000);
}


// --- Main Functions (Bound to UI) ---

/**
 * Toggles the light/dark theme.
 */
function toggleTheme() {
    body.classList.toggle('dark');
    body.classList.toggle('light');

    const isDark = body.classList.contains('dark');
    moonIcon.classList.toggle('hidden', isDark);
    sunIcon.classList.toggle('hidden', !isDark);

    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

/**
 * Handles real-time text analysis on input.
 */
function analyzeText() {
    const text = textInput.value.trim();
    const charCount = text.length;
    
    charCountSpan.textContent = `${charCount} characters`;

    const isDisabled = charCount < 20;
    humanizeBtn.disabled = isDisabled;
    spellcheckBtn.disabled = isDisabled;

    const scores = calculateScore(text);
    updateProgressUI(scores.human, scores.ai);
}

/**
 * Simulates the humanization process.
 */
function humanizeText() {
    if (humanizeBtn.disabled) return;

    // UI state for loading
    humanizeBtn.disabled = true;
    humanizeIcon.classList.add('hidden');
    humanizeSpinner.classList.remove('hidden');
    humanizeTextSpan.textContent = 'Humanizing...';

    // Simulation of a backend request
    setTimeout(() => {
        const originalText = textInput.value;
        let humanizedText = originalText;
        
        // Very basic text transformation simulation
        if (originalText.includes("In conclusion, the efficacy of this paradigm shift necessitates a robust and scalable infrastructure")) {
            humanizedText = humanizedText.replace("In conclusion, the efficacy of this paradigm shift necessitates a robust and scalable infrastructure, thereby enabling a synergistic optimization of concurrent processes.", 
            "To wrap things up, making this big change work requires a strong and dependable system that can handle everything at once. This simply means we need good technology to make all the parts work together smoothly.");
        } else if (originalText.length > 50) {
             humanizedText = humanizedText.split(' ').map((word, index) => {
                // Occasionally swap a formal word for a less formal one or add a contraction
                if (index % 10 === 0 && word.toLowerCase() === 'therefore') return 'so';
                if (word.toLowerCase() === 'is not') return 'isn\'t';
                return word;
            }).join(' ');
        }
        
        textInput.value = humanizedText;
        analyzeText(); // Re-analyze the humanized text (should result in a higher human score)

        // Reset UI state
        humanizeIcon.classList.remove('hidden');
        humanizeSpinner.classList.add('hidden');
        humanizeTextSpan.textContent = 'Humanize Text';
        humanizeBtn.disabled = false;
        
        showToast('Text successfully humanized!', 'success');

    }, 2000); // 2-second delay to simulate processing time
}

/**
 * Simulates a spell-check feature.
 */
function checkSpelling() {
    if (spellcheckBtn.disabled) return;
    
    // Simple simulation: count a few known typos
    const text = textInput.value;
    const typos = (text.match(/definately|recieve|occured/gi) || []).length;

    if (typos > 0) {
        showToast(`Found ${typos} potential spelling errors.`, 'error');
    } else {
        showToast('No obvious spelling errors found.', 'success');
    }
}

/**
 * Switches between home and contact pages.
 * @param {string} page - 'home' or 'contact'.
 */
function showPage(page) {
    if (page === 'home') {
        homePage.classList.remove('hidden');
        contactPage.classList.add('hidden');
        navHome.classList.add('active');
        navContact.classList.remove('active');
    } else if (page === 'contact') {
        homePage.classList.add('hidden');
        contactPage.classList.remove('hidden');
        navHome.classList.remove('active');
        navContact.classList.add('active');
    }
    // Scroll to the top when changing pages
    window.scrollTo(0, 0);
}

/**
 * Handles the submission of the contact form.
 * @param {Event} event - The form submission event.
 */
function handleContactForm(event) {
    event.preventDefault(); // Prevent default form submission

    const form = document.getElementById('contact-form');
    // Get form data (can be used for AJAX submission in a real app)
    const formData = {
        name: form.elements['name'].value,
        email: form.elements['email'].value,
        subject: form.elements['subject'].value,
        message: form.elements['message'].value
    };

    // Simulate sending the message
    setTimeout(() => {
        console.log('Contact form submitted:', formData);
        showToast('Message sent successfully! We will be in touch soon.', 'success');
        form.reset(); // Clear the form
        showPage('home'); // Redirect back to home
    }, 1500);
}

// --- Initialization ---

// Check for saved theme preference on load
(function init() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.remove('light');
        body.classList.add('dark');
        moonIcon.classList.add('hidden');
        sunIcon.classList.remove('hidden');
    } else {
        body.classList.add('light');
        body.classList.remove('dark');
        moonIcon.classList.remove('hidden');
        sunIcon.classList.add('hidden');
    }
    
    // Initial analysis for the empty state
    analyzeText();

    // Ensure the initial page view is correct
    if (window.location.hash === '#contact') {
         showPage('contact');
    } else {
         showPage('home');
    }

})();

// Attach listeners that aren't inline
textInput.addEventListener('input', analyzeText);

// Optional: Add event listener for hash changes (for basic navigation history)
window.addEventListener('hashchange', () => {
    if (window.location.hash === '#contact') {
        showPage('contact');
    } else {
        showPage('home');
    }
});