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

    // Update stats bar
    updateStatsBar(stats) {
        document.getElementById('stats-bar').style.display = 'grid';
        document.getElementById('calculations-count').textContent = stats.calculations || 0;
        document.getElementById('current-pace').textContent = stats.lastPace || '--:--';
        document.getElementById('vdot-score').textContent = stats.lastVDOT || '--';
        document.getElementById('calories-burned').textContent = stats.totalCalories || 0;
    },

    // Show loading animation
    showLoading(button) {
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
        element.innerHTML = html;
        element.style.display = 'block';
    },

    // Scroll to top
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // Show/hide FAB based on scroll
    handleFABVisibility() {
        const fab = document.querySelector('.fab');
        if (window.scrollY > 300) {
            fab.style.display = 'flex';
        } else {
            fab.style.display = 'none';
        }
    },

    // Share functionality
    showShareModal(resultText) {
        this.lastResult = resultText;
        document.getElementById('share-content').textContent = resultText;
        document.getElementById('share-modal').style.display = 'flex';
    },

    closeShareModal() {
        document.getElementById('share-modal').style.display = 'none';
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
        });
    }
};

// Global functions that are called from HTML
function getNewTip() {
    const randomIndex = Math.floor(Math.random() * UI.runningTips.length);
    document.getElementById('tip-text').textContent = UI.runningTips[randomIndex];

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