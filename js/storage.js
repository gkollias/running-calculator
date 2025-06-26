// ===== STORAGE MODULE =====
// Handles all localStorage operations

const Storage = {
    // Keys
    FORM_DATA_KEY: 'formData',
    RETURNING_VISITOR_KEY: 'returningVisitor',
    RUNNING_STATS_KEY: 'runningStats',
    
    // Form data management
    saveFormData() {
        const formData = {
            vdotDistance: document.getElementById('vdot-distance').value,
            vdotMinutes: document.getElementById('vdot-minutes').value,
            vdotSeconds: document.getElementById('vdot-seconds').value,
            paceDistance: document.getElementById('pace-distance').value,
            paceHours: document.getElementById('pace-hours').value,
            paceMinutes: document.getElementById('pace-minutes').value,
            paceSeconds: document.getElementById('pace-seconds').value,
            weight: document.getElementById('weight').value
        };
        localStorage.setItem(this.FORM_DATA_KEY, JSON.stringify(formData));
    },

    restoreFormData() {
        const savedData = localStorage.getItem(this.FORM_DATA_KEY);
        if (savedData) {
            const formData = JSON.parse(savedData);
            if (formData.vdotDistance) document.getElementById('vdot-distance').value = formData.vdotDistance;
            if (formData.vdotMinutes) document.getElementById('vdot-minutes').value = formData.vdotMinutes;
            if (formData.vdotSeconds) document.getElementById('vdot-seconds').value = formData.vdotSeconds;
            if (formData.paceDistance) document.getElementById('pace-distance').value = formData.paceDistance;
            if (formData.paceHours) document.getElementById('pace-hours').value = formData.paceHours;
            if (formData.paceMinutes) document.getElementById('pace-minutes').value = formData.paceMinutes;
            if (formData.paceSeconds) document.getElementById('pace-seconds').value = formData.paceSeconds;
            if (formData.weight) document.getElementById('weight').value = formData.weight;
        }
    },

    // Stats management
    getUserStats() {
        const stats = localStorage.getItem(this.RUNNING_STATS_KEY);
        return stats ? JSON.parse(stats) : {
            calculations: 0,
            firstVisit: new Date().toISOString()
        };
    },

    saveUserStats(stats) {
        localStorage.setItem(this.RUNNING_STATS_KEY, JSON.stringify(stats));
    },

    // Visitor tracking
    isReturningVisitor() {
        return localStorage.getItem(this.RETURNING_VISITOR_KEY) === 'true';
    },

    setReturningVisitor() {
        localStorage.setItem(this.RETURNING_VISITOR_KEY, 'true');
    }
};