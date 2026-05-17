// ===== ENGAGEMENT MODULE =====
// Features to improve user engagement and reduce bounce rate

const Engagement = {
    calculatorFlows: {
        'vdot': {
            nextSteps: [
                { id: 'hr-zones', text: 'Get your heart rate zones', icon: '❤️' },
                { id: 'race-predictor', text: 'Predict race times', icon: '🏆' },
                { id: 'split-calculator', text: 'Plan race splits', icon: '📈' }
            ],
            insight: 'Your VDOT unlocks personalized training paces. Use them to train smarter!'
        },
        'pace': {
            nextSteps: [
                { id: 'calorie-calculator', text: 'Calories at this pace', icon: '🔥' },
                { id: 'split-calculator', text: 'Generate race splits', icon: '📈' },
                { id: 'vdot-calculator', text: 'Find your VDOT', icon: '📊' }
            ],
            insight: 'Knowing your pace helps plan workouts and race strategy.'
        },
        'splits': {
            nextSteps: [
                { id: 'hr-zones', text: 'Train at right intensity', icon: '❤️' },
                { id: 'calorie-calculator', text: 'Race day calories', icon: '🔥' }
            ],
            insight: 'Even pacing or slight negative splits lead to better performances.'
        },
        'hr': {
            nextSteps: [
                { id: 'vdot-calculator', text: 'Calculate VDOT score', icon: '📊' },
                { id: 'calorie-calculator', text: 'Track calorie burn', icon: '🔥' }
            ],
            insight: 'Training in the right zones prevents overtraining.'
        },
        'predictor': {
            nextSteps: [
                { id: 'split-calculator', text: 'Plan goal race splits', icon: '📈' },
                { id: 'vdot-calculator', text: 'Get training paces', icon: '📊' }
            ],
            insight: 'Predictions assume similar training. Longer races need specific prep.'
        },
        'calories': {
            nextSteps: [
                { id: 'pace-calculator', text: 'Analyze your pace', icon: '⏱️' },
                { id: 'vdot-calculator', text: 'Find fitness level', icon: '📊' }
            ],
            insight: 'Fuel properly: 30-60g carbs/hour for runs over 60 minutes.'
        }
    },

    completedCalculators: new Set(),

    init() {
        this.addCalculatorIds();
        this.createStickyNav();
        this.setupScrollSpy();
        this.wrapResultDisplay();
    },

    addCalculatorIds() {
        const calculators = document.querySelectorAll('.calculators-grid .calculator-card');
        const ids = ['vdot-calculator', 'pace-calculator', 'split-calculator', 'hr-zones', 'race-predictor', 'calorie-calculator'];
        calculators.forEach((calc, index) => {
            if (ids[index]) calc.id = ids[index];
        });
    },

    createStickyNav() {
        const nav = document.createElement('div');
        nav.id = 'calculator-sticky-nav';
        nav.innerHTML = \`
            <div class="sticky-nav-container">
                <span class="sticky-nav-label">Calculators:</span>
                <div class="sticky-nav-buttons">
                    <button onclick="Engagement.scrollToCalculator('vdot-calculator')" data-calc="vdot-calculator" title="VDOT">📊</button>
                    <button onclick="Engagement.scrollToCalculator('pace-calculator')" data-calc="pace-calculator" title="Pace">⏱️</button>
                    <button onclick="Engagement.scrollToCalculator('split-calculator')" data-calc="split-calculator" title="Splits">📈</button>
                    <button onclick="Engagement.scrollToCalculator('hr-zones')" data-calc="hr-zones" title="HR Zones">❤️</button>
                    <button onclick="Engagement.scrollToCalculator('race-predictor')" data-calc="race-predictor" title="Predictor">🏆</button>
                    <button onclick="Engagement.scrollToCalculator('calorie-calculator')" data-calc="calorie-calculator" title="Calories">🔥</button>
                </div>
                <div class="sticky-nav-progress"><span id="calc-progress">0/6</span></div>
            </div>
        \`;
        document.body.appendChild(nav);
        this.addStyles();
    },

    addStyles() {
        const styles = document.createElement('style');
        styles.textContent = \`
            #calculator-sticky-nav {
                position: fixed; bottom: 0; left: 0; right: 0;
                background: rgba(255,255,255,0.98); backdrop-filter: blur(10px);
                box-shadow: 0 -4px 20px rgba(0,0,0,0.15); padding: 12px 20px;
                z-index: 1000; transform: translateY(100%); transition: transform 0.3s ease;
            }
            #calculator-sticky-nav.visible { transform: translateY(0); }
            .sticky-nav-container { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: center; gap: 15px; }
            .sticky-nav-label { font-weight: 600; color: #667eea; font-size: 14px; }
            .sticky-nav-buttons { display: flex; gap: 8px; }
            .sticky-nav-buttons button {
                width: 44px; height: 44px; border-radius: 50%; border: 2px solid #e0e0e0;
                background: white; font-size: 18px; cursor: pointer; transition: all 0.2s ease; padding: 0; margin: 0;
            }
            .sticky-nav-buttons button:hover { border-color: #667eea; transform: scale(1.1); box-shadow: 0 4px 12px rgba(102,126,234,0.3); }
            .sticky-nav-buttons button.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-color: transparent; }
            .sticky-nav-buttons button.completed { border-color: #4CAF50; position: relative; }
            .sticky-nav-buttons button.completed::after {
                content: '✓'; position: absolute; top: -4px; right: -4px;
                background: #4CAF50; color: white; width: 16px; height: 16px;
                border-radius: 50%; font-size: 10px; display: flex; align-items: center; justify-content: center;
            }
            .sticky-nav-progress span { background: #f0f0f0; padding: 6px 12px; border-radius: 15px; font-size: 13px; font-weight: 600; color: #666; }
            .next-steps-prompt { margin-top: 20px; padding: 15px; background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%); border-radius: 10px; border: 1px solid rgba(102,126,234,0.2); }
            .next-steps-prompt h4 { margin: 0 0 8px 0; color: #667eea; font-size: 14px; }
            .next-steps-insight { font-size: 13px; color: #666; margin-bottom: 12px; line-height: 1.4; }
            .next-steps-buttons { display: flex; flex-wrap: wrap; gap: 8px; }
            .next-step-btn {
                display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px;
                background: white; border: 2px solid #667eea; border-radius: 20px;
                color: #667eea; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s ease;
            }
            .next-step-btn:hover { background: #667eea; color: white; transform: translateY(-2px); }
            @media (max-width: 600px) {
                .sticky-nav-label { display: none; }
                .sticky-nav-buttons button { width: 38px; height: 38px; font-size: 16px; }
                .sticky-nav-progress span { padding: 4px 8px; font-size: 11px; }
            }
        \`;
        document.head.appendChild(styles);
    },

    scrollToCalculator(id) {
        const element = document.getElementById(id);
        if (element) {
            const offset = 20;
            window.scrollTo({ top: element.getBoundingClientRect().top + window.pageYOffset - offset, behavior: 'smooth' });
            element.style.transition = 'box-shadow 0.3s ease';
            element.style.boxShadow = '0 0 0 4px rgba(102,126,234,0.5), 0 15px 40px rgba(0,0,0,0.25)';
            setTimeout(() => { element.style.boxShadow = ''; }, 1500);
        }
    },

    setupScrollSpy() {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) { window.requestAnimationFrame(() => { this.handleScroll(); ticking = false; }); ticking = true; }
        });
        setTimeout(() => this.handleScroll(), 500);
    },

    handleScroll() {
        const nav = document.getElementById('calculator-sticky-nav');
        if (!nav) return;
        if (window.scrollY > 300) { nav.classList.add('visible'); } else { nav.classList.remove('visible'); }
        this.updateActiveCalculator();
    },

    updateActiveCalculator() {
        const buttons = document.querySelectorAll('.sticky-nav-buttons button');
        const viewportMiddle = window.innerHeight / 2;
        buttons.forEach(btn => {
            const calc = document.getElementById(btn.dataset.calc);
            if (calc) {
                const rect = calc.getBoundingClientRect();
                if (rect.top < viewportMiddle && rect.bottom > viewportMiddle) { btn.classList.add('active'); }
                else { btn.classList.remove('active'); }
            }
        });
    },

    wrapResultDisplay() {
        const originalDisplayResult = UI.displayResult.bind(UI);
        UI.displayResult = (elementId, html) => { originalDisplayResult(elementId, html); this.onCalculatorComplete(elementId); };
    },

    onCalculatorComplete(resultId) {
        const resultToCalc = {
            'vdot-result': { type: 'vdot', navId: 'vdot-calculator' },
            'pace-result': { type: 'pace', navId: 'pace-calculator' },
            'split-result': { type: 'splits', navId: 'split-calculator' },
            'hr-result': { type: 'hr', navId: 'hr-zones' },
            'predict-result': { type: 'predictor', navId: 'race-predictor' },
            'calorie-result': { type: 'calories', navId: 'calorie-calculator' }
        };
        const calcInfo = resultToCalc[resultId];
        if (!calcInfo) return;
        
        this.completedCalculators.add(calcInfo.navId);
        const navBtn = document.querySelector(\`[data-calc="\${calcInfo.navId}"]\`);
        if (navBtn) navBtn.classList.add('completed');
        
        const progressEl = document.getElementById('calc-progress');
        if (progressEl) {
            const count = this.completedCalculators.size;
            if (count === 6) { progressEl.innerHTML = '🎉 All!'; progressEl.style.background = '#4CAF50'; progressEl.style.color = 'white'; }
            else { progressEl.textContent = \`\${count}/6\`; }
        }
        this.addNextStepsPrompt(resultId, calcInfo.type);
    },

    addNextStepsPrompt(resultId, calcType) {
        const resultEl = document.getElementById(resultId);
        if (!resultEl) return;
        const flow = this.calculatorFlows[calcType];
        if (!flow) return;
        
        const existing = resultEl.querySelector('.next-steps-prompt');
        if (existing) existing.remove();
        
        const availableSteps = flow.nextSteps.filter(step => !this.completedCalculators.has(step.id));
        if (availableSteps.length === 0) return;
        
        const promptHTML = \`
            <div class="next-steps-prompt">
                <h4>💡 What's Next?</h4>
                <p class="next-steps-insight">\${flow.insight}</p>
                <div class="next-steps-buttons">
                    \${availableSteps.map(step => \`<button class="next-step-btn" onclick="Engagement.scrollToCalculator('\${step.id}')">\${step.icon} \${step.text}</button>\`).join('')}
                </div>
            </div>
        \`;
        resultEl.insertAdjacentHTML('beforeend', promptHTML);
    }
};

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', () => Engagement.init()); }
else { setTimeout(() => Engagement.init(), 100); }
