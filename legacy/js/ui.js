// ===== UI MODULE =====
// Handles all UI interactions and updates

const UI = {
    // Running tips
    runningTips: [
        "For optimal performance, aim to do 80% of your training at an easy pace and 20% at higher intensities.",
        "Stay hydrated! Drink 16-24 oz of water 2-3 hours before running, and 6-8 oz every 20 minutes during long runs.",
        "Replace your running shoes every 300-500 miles to prevent injuries and maintain proper support.",
        "Include dynamic stretching before runs and static stretching after. Hold stretches for 30-60 seconds.",
        "Increase your weekly mileage by no more than 10% to avoid overtraining and reduce injury risk.",
        "Focus on your breathing: Try the 2:2 pattern (breathe in for 2 steps, out for 2 steps) for moderate runs.",
        "Proper running form: Keep your head up, shoulders relaxed, and land midfoot under your hips.",
        "Cross-training activities like cycling, swimming, or yoga can improve your running performance.",
        "Sleep is crucial for recovery. Aim for 7-9 hours per night, especially during heavy training periods.",
        "Fuel properly: Eat a balanced meal 2-3 hours before running, and refuel within 30 minutes post-run.",
        "Listen to your body. Rest days are just as important as training days for improvement.",
        "Vary your running surfaces. Mix roads, trails, and tracks to work different muscles and reduce repetitive stress.",
        "Set SMART goals: Specific, Measurable, Achievable, Relevant, and Time-bound.",
        "Use the talk test: During easy runs, you should be able to hold a conversation comfortably.",
        "Strength training 2-3 times per week can improve running economy and reduce injury risk.",
        "Practice race pace during training to prepare your body and mind for race day.",
        "Negative splits (running the second half faster) can lead to better race performances.",
        "Warm up with 5-10 minutes of easy jogging before speedwork or races.",
        "Ice baths or cold showers after long runs can help reduce inflammation and speed recovery.",
        "Track your runs in a training log to monitor progress and identify patterns."
    ],

    lastResult: '',

    // Initialize UI - create share modal if it doesn't exist
    init() {
        this.createShareModal();
    },

    // Create the share modal HTML
    createShareModal() {
        if (document.getElementById('share-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'share-modal';
        modal.className = 'share-modal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        modal.innerHTML = `
            <div class="share-modal-content" style="
                background: white;
                padding: 30px;
                border-radius: 15px;
                max-width: 400px;
                width: 90%;
                text-align: center;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            ">
                <h3 style="margin-bottom: 15px; color: #667eea;">Share Your Results</h3>
                <p id="share-content" style="
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    font-weight: 500;
                "></p>
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="shareOnTwitter()" style="
                        background: #1DA1F2;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                    ">🐦 Twitter</button>
                    <button onclick="copyShareLink()" style="
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                    ">📋 Copy</button>
                    <button onclick="closeShareModal()" style="
                        background: #e0e0e0;
                        color: #333;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                    ">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeShareModal();
            }
        });
    },

    // Update stats bar
    updateStatsBar(stats) {
        const statsBar = document.getElementById('stats-bar');
        const calcCount = document.getElementById('calculations-count');
        const currentPace = document.getElementById('current-pace');
        const vdotScore = document.getElementById('vdot-score');
        const caloriesBurned = document.getElementById('calories-burned');

        if (statsBar) statsBar.style.display = 'grid';
        if (calcCount) calcCount.textContent = stats.calculations || 0;
        if (currentPace) currentPace.textContent = stats.lastPace || '--:--';
        if (vdotScore) vdotScore.textContent = stats.lastVDOT || '--';
        if (caloriesBurned) caloriesBurned.textContent = stats.totalCalories || 0;
    },

    // Show loading animation
    showLoading(button) {
        if (!button) return;
        
        const originalText = button.innerHTML;
        button.innerHTML = '<span class="loading"></span> Calculating...';
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 500);
    },

    // Display result
    displayResult(elementId, html) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
            element.style.display = 'block';
        }
    },

    // Scroll to top
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // Show/hide FAB based on scroll
    handleFABVisibility() {
        const fab = document.querySelector('.fab');
        if (fab) {
            if (window.scrollY > 300) {
                fab.style.display = 'flex';
            } else {
                fab.style.display = 'none';
            }
        }
    },

    // Share functionality
    showShareModal(resultText) {
        this.createShareModal(); // Ensure modal exists
        this.lastResult = resultText;
        
        const shareContent = document.getElementById('share-content');
        const shareModal = document.getElementById('share-modal');
        
        if (shareContent) shareContent.textContent = resultText;
        if (shareModal) shareModal.style.display = 'flex';
    },

    closeShareModal() {
        const shareModal = document.getElementById('share-modal');
        if (shareModal) shareModal.style.display = 'none';
    },

    shareOnTwitter() {
        const text = encodeURIComponent(`Check out my running stats! ${this.lastResult} Calculate yours at`);
        const url = encodeURIComponent('https://www.runningpacecalculator.fit');
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
        this.closeShareModal();
    },

    copyShareLink() {
        const text = `Check out my running stats! ${this.lastResult}\nCalculate yours at: https://www.runningpacecalculator.fit`;
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
            this.closeShareModal();
        }).catch(() => {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('Copied to clipboard!');
            this.closeShareModal();
        });
    }
};

// Initialize UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});

// Global functions that are called from HTML
function getNewTip() {
    const tipText = document.getElementById('tip-text');
    if (tipText) {
        const randomIndex = Math.floor(Math.random() * UI.runningTips.length);
        tipText.textContent = UI.runningTips[randomIndex];
    }

    if (typeof gtag !== 'undefined') {
        gtag('event', 'view_tip', {
            'event_category': 'engagement',
            'event_label': 'running_tips'
        });
    }
}

function scrollToTop() {
    UI.scrollToTop();
}

function showShareModal(text) {
    UI.showShareModal(text);
}

function closeShareModal() {
    UI.closeShareModal();
}

function shareOnTwitter() {
    UI.shareOnTwitter();
}

function copyShareLink() {
    UI.copyShareLink();
}
