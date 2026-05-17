// ===== MAIN APP MODULE =====
// Initializes the application and coordinates all modules

const App = {
    // Initialize the application
    init() {
        console.log('Running Calculator App initialized successfully');
        
        // Initialize storage and restore data
        this.initializeStorage();
        
        // Initialize analytics
        Analytics.init();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Show welcome message
        this.showWelcomeMessage();
        
        // Initialize floating action button
        this.initializeFAB();
    },

    // Initialize storage and restore data
    initializeStorage() {
        // Restore form data
        Storage.restoreFormData();
        
        // Load user stats if available
        const userStats = Storage.getUserStats();
        if (userStats.calculations > 0) {
            document.getElementById('stats-bar').style.display = 'grid';
            document.getElementById('calculations-count').textContent = userStats.calculations || 0;
            document.getElementById('current-pace').textContent = userStats.lastPace || '--:--';
            document.getElementById('vdot-score').textContent = userStats.lastVDOT || '--';
            document.getElementById('calories-burned').textContent = userStats.totalCalories || 0;
        }
    },

    // Setup event listeners
    setupEventListeners() {
        // Auto-save form data on input change
        document.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', () => {
                Storage.saveFormData();
            });
        });

        // Handle floating action button scroll visibility
        window.addEventListener('scroll', () => {
            const fab = document.querySelector('.fab');
            if (fab) {
                if (window.scrollY > 300) {
                    fab.style.display = 'flex';
                } else {
                    fab.style.display = 'none';
                }
            }
        });

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to calculate (on focused calculator)
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const focusedElement = document.activeElement;
                const calculatorCard = focusedElement.closest('.calculator-card');
                if (calculatorCard) {
                    const button = calculatorCard.querySelector('button[onclick]');
                    if (button) button.click();
                }
            }
        });
    },

    // Initialize floating action button
    initializeFAB() {
        // Create FAB if it doesn't exist
        if (!document.querySelector('.fab')) {
            const fab = document.createElement('div');
            fab.className = 'fab';
            fab.innerHTML = '↑';
            fab.style.display = 'none';
            fab.onclick = () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
            document.body.appendChild(fab);
        }
    },

    // Show welcome message for first-time visitors
    showWelcomeMessage() {
        if (!Storage.isReturningVisitor()) {
            Storage.setReturningVisitor();
            // Commented out to match original behavior
            // setTimeout(() => {
            //     alert('Welcome to Running Pace Calculator! 🏃‍♂️\n\nCalculate your VDOT, pace, splits, and more. Your data is automatically saved for convenience!');
            // }, 1000);
        }
    },

    // Show error message
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    },

    // Show success message
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(successDiv);

        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
};

// Global utility functions
window.showError = (message) => App.showError(message);
window.showSuccess = (message) => App.showSuccess(message);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Initialize app if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}