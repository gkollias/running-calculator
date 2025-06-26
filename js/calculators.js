// ===== CALCULATORS MODULE =====
// All calculation logic

let paceUnit = 'km';
let userStats = {};

// VDOT Calculator
function calculateVDOT() {
    const button = event.target;
    UI.showLoading(button);
    
    Analytics.trackCalculator('vdot');
    
    const distance = parseFloat(document.getElementById('vdot-distance').value);
    const minutes = parseInt(document.getElementById('vdot-minutes').value);
    const seconds = parseInt(document.getElementById('vdot-seconds').value);
    
    const totalMinutes = minutes + seconds / 60;
    const velocityMeterPerMin = distance / totalMinutes;
    
    // VDOT formula
    const vo2 = -4.60 + 0.182258 * velocityMeterPerMin + 0.000104 * velocityMeterPerMin * velocityMeterPerMin;
    const percentMax = 0.8 + 0.1894393 * Math.exp(-0.012778 * totalMinutes) + 0.2989558 * Math.exp(-0.1932605 * totalMinutes);
    const vdot = vo2 / percentMax;
    
    // Update stats
    userStats.calculations = (userStats.calculations || 0) + 1;
    userStats.lastVDOT = vdot.toFixed(1);
    Storage.saveUserStats(userStats);
    UI.updateStatsBar(userStats);
    
    Analytics.trackCalculatorComplete('vdot', Math.round(vdot));
    
    // Calculate training paces
    const easyPace = calculatePaceFromVDOT(vdot, 0.59, 0.74);
    const marathonPace = calculatePaceFromVDOT(vdot, 0.75, 0.84);
    const thresholdPace = calculatePaceFromVDOT(vdot, 0.83, 0.88);
    const intervalPace = calculatePaceFromVDOT(vdot, 0.95, 0.98);
    const repetitionPace = calculatePaceFromVDOT(vdot, 1.05, 1.20);
    
    const resultHTML = `
        <h3>Your VDOT: ${vdot.toFixed(1)}</h3>
        <div class="result-item"><strong>Easy Pace:</strong> ${formatPace(easyPace.min)} - ${formatPace(easyPace.max)} per km</div>
        <div class="result-item"><strong>Marathon Pace:</strong> ${formatPace(marathonPace.min)} - ${formatPace(marathonPace.max)} per km</div>
        <div class="result-item"><strong>Threshold Pace:</strong> ${formatPace(thresholdPace.min)} - ${formatPace(thresholdPace.max)} per km</div>
        <div class="result-item"><strong>Interval Pace:</strong> ${formatPace(intervalPace.min)} - ${formatPace(intervalPace.max)} per km</div>
        <div class="result-item"><strong>Repetition Pace:</strong> ${formatPace(repetitionPace.min)} - ${formatPace(repetitionPace.max)} per km</div>
        <button onclick="showShareModal('VDOT Score: ${vdot.toFixed(1)}')" style="margin-top: 15px; background: #4267B2;">Share Results</button>
    `;
    
    UI.displayResult('vdot-result', resultHTML);
}

function calculatePaceFromVDOT(vdot, minPercent, maxPercent) {
    const minVO2 = vdot * minPercent;
    const maxVO2 = vdot * maxPercent;
    
    function velocityFromVO2(vo2) {
        const a = 0.000104;
        const b = 0.182258;
        const c = -4.60 - vo2;
        const velocity = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
        return velocity;
    }
    
    const minVelocity = velocityFromVO2(minVO2);
    const maxVelocity = velocityFromVO2(maxVO2);
    
    return {
        min: (1000 / maxVelocity) * 60,
        max: (1000 / minVelocity) * 60
    };
}

function formatPace(secondsPerKm) {
    const minutes = Math.floor(secondsPerKm / 60);
    const seconds = Math.round(secondsPerKm % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Pace Calculator
function togglePaceUnit(unit) {
    paceUnit = unit;
    document.getElementById('pace-unit').textContent = unit;
    document.querySelectorAll('.unit-toggle button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function calculatePace() {
    const button = event.target;
    UI.showLoading(button);
    
    Analytics.trackCalculator('pace', paceUnit);
    
    const distance = parseFloat(document.getElementById('pace-distance').value);
    const hours = parseInt(document.getElementById('pace-hours').value) || 0;
    const minutes = parseInt(document.getElementById('pace-minutes').value) || 0;
    const seconds = parseInt(document.getElementById('pace-seconds').value) || 0;
    
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const paceSeconds = totalSeconds / distance;
    
    const paceMinutes = Math.floor(paceSeconds / 60);
    const paceSecondsRemainder = Math.round(paceSeconds % 60);
    
    // Update stats
    userStats.calculations = (userStats.calculations || 0) + 1;
    userStats.lastPace = `${paceMinutes}:${paceSecondsRemainder.toString().padStart(2, '0')}`;
    Storage.saveUserStats(userStats);
    UI.updateStatsBar(userStats);
    
    const speedKmh = (distance / totalSeconds) * 3600;
    const speedMph = speedKmh * 0.621371;
    
    let resultHTML = `
        <h3>Pace Analysis</h3>
        <div class="result-item"><strong>Pace:</strong> ${paceMinutes}:${paceSecondsRemainder.toString().padStart(2, '0')} per ${paceUnit}</div>
        <div class="result-item"><strong>Speed:</strong> ${speedKmh.toFixed(2)} km/h (${speedMph.toFixed(2)} mph)</div>
    `;
    
    if (paceUnit === 'km') {
        const milePaceSeconds = paceSeconds * 1.60934;
        const milePaceMinutes = Math.floor(milePaceSeconds / 60);
        const milePaceSecondsRemainder = Math.round(milePaceSeconds % 60);
        resultHTML += `<div class="result-item"><strong>Mile Pace:</strong> ${milePaceMinutes}:${milePaceSecondsRemainder.toString().padStart(2, '0')} per mile</div>`;
    } else {
        const kmPaceSeconds = paceSeconds / 1.60934;
        const kmPaceMinutes = Math.floor(kmPaceSeconds / 60);
        const kmPaceSecondsRemainder = Math.round(kmPaceSeconds % 60);
        resultHTML += `<div class="result-item"><strong>Kilometer Pace:</strong> ${kmPaceMinutes}:${kmPaceSecondsRemainder.toString().padStart(2, '0')} per km</div>`;
    }
    
    resultHTML += `<button onclick="showShareModal('Pace: ${paceMinutes}:${paceSecondsRemainder.toString().padStart(2, '0')} per ${paceUnit}')" style="margin-top: 15px; background: #4267B2;">Share Results</button>`;
    
    UI.displayResult('pace-result', resultHTML);
}

// Split Calculator
function calculateSplits() {
    const button = event.target;
    UI.showLoading(button);
    
    Analytics.trackCalculator('splits');
    
    const paceMin = parseInt(document.getElementById('split-pace-min').value);
    const paceSec = parseInt(document.getElementById('split-pace-sec').value);
    const distance = parseFloat(document.getElementById('split-distance').value);
    
    const paceSeconds = paceMin * 60 + paceSec;
    
    let resultHTML = '<h3>Race Splits</h3><div class="pace-splits">';
    
    const splitDistances = [1, 5, 10, 15, 20, 21.0975, 25, 30, 35, 40, 42.195];
    
    splitDistances.forEach(splitDist => {
        if (splitDist <= distance) {
            const splitTime = splitDist * paceSeconds;
            const hours = Math.floor(splitTime / 3600);
            const minutes = Math.floor((splitTime % 3600) / 60);
            const seconds = Math.round(splitTime % 60);
            
            let timeStr = '';
            if (hours > 0) {
                timeStr = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            } else {
                timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            
            resultHTML += `
                <div class="pace-split">
                    <div class="pace-split-distance">${splitDist}km</div>
                    <div class="pace-split-time">${timeStr}</div>
                </div>
            `;
        }
    });
    
    resultHTML += '</div>';
    
    const totalTime = distance * paceSeconds;
    const totalHours = Math.floor(totalTime / 3600);
    const totalMinutes = Math.floor((totalTime % 3600) / 60);
    const totalSeconds = Math.round(totalTime % 60);
    
    let totalTimeStr = '';
    if (totalHours > 0) {
        totalTimeStr = `${totalHours}:${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
    } else {
        totalTimeStr = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
    }
    
    resultHTML += `<div class="result-item" style="margin-top: 15px;"><strong>Total Time:</strong> ${totalTimeStr}</div>`;
    
    UI.displayResult('split-result', resultHTML);
}

// Heart Rate Zones Calculator
function calculateHRZones() {
    const button = event.target;
    UI.showLoading(button);
    
    Analytics.trackCalculator('heart_rate_zones');
    
    const maxHR = parseInt(document.getElementById('max-hr').value);
    const restHR = parseInt(document.getElementById('rest-hr').value) || 0;
    
    let resultHTML = '<h3>Training Zones</h3>';
    
    const zones = [
        { name: 'Zone 1 - Easy', min: 0.5, max: 0.6, description: 'Recovery, warm-up' },
        { name: 'Zone 2 - Aerobic', min: 0.6, max: 0.7, description: 'Base building' },
        { name: 'Zone 3 - Tempo', min: 0.7, max: 0.8, description: 'Marathon pace' },
        { name: 'Zone 4 - Threshold', min: 0.8, max: 0.9, description: 'Lactate threshold' },
        { name: 'Zone 5 - VO2 Max', min: 0.9, max: 1.0, description: 'Maximum effort' }
    ];
    
    zones.forEach(zone => {
        let minHR, maxHR_zone;
        
        if (restHR > 0) {
            const hrReserve = maxHR - restHR;
            minHR = Math.round(restHR + (hrReserve * zone.min));
            maxHR_zone = Math.round(restHR + (hrReserve * zone.max));
        } else {
            minHR = Math.round(maxHR * zone.min);
            maxHR_zone = Math.round(maxHR * zone.max);
        }
        
        resultHTML += `
            <div class="result-item">
                <strong>${zone.name}:</strong> ${minHR} - ${maxHR_zone} bpm
                <br><small style="color: #666;">${zone.description}</small>
            </div>
        `;
    });
    
    UI.displayResult('hr-result', resultHTML);
}

// Race Predictor
function predictRaceTimes() {
    const button = event.target;
    UI.showLoading(button);
    
    Analytics.trackCalculator('race_predictor');
    
    const knownDistance = parseFloat(document.getElementById('known-distance').value);
    const hours = parseInt(document.getElementById('known-hours').value) || 0;
    const minutes = parseInt(document.getElementById('known-minutes').value) || 0;
    const seconds = parseInt(document.getElementById('known-seconds').value) || 0;
    
    const knownTime = hours * 3600 + minutes * 60 + seconds;
    
    const distances = [
        { name: '5K', meters: 5000 },
        { name: '10K', meters: 10000 },
        { name: 'Half Marathon', meters: 21097.5 },
        { name: 'Marathon', meters: 42195 }
    ];
    
    let resultHTML = '<h3>Predicted Race Times</h3>';
    
    distances.forEach(race => {
        if (race.meters !== knownDistance) {
            const predictedTime = knownTime * Math.pow(race.meters / knownDistance, 1.06);
            const predHours = Math.floor(predictedTime / 3600);
            const predMinutes = Math.floor((predictedTime % 3600) / 60);
            const predSeconds = Math.round(predictedTime % 60);
            
            let timeStr = '';
            if (predHours > 0) {
                timeStr = `${predHours}:${predMinutes.toString().padStart(2, '0')}:${predSeconds.toString().padStart(2, '0')}`;
            } else {
                timeStr = `${predMinutes}:${predSeconds.toString().padStart(2, '0')}`;
            }
            
            resultHTML += `<div class="result-item"><strong>${race.name}:</strong> ${timeStr}</div>`;
        }
    });
    
    UI.displayResult('predict-result', resultHTML);
}

// Calorie Calculator
function calculateCalories() {
    const button = event.target;
    UI.showLoading(button);
    
    Analytics.trackCalculator('calories');
    
    const weight = parseFloat(document.getElementById('weight').value);
    const distance = parseFloat(document.getElementById('cal-distance').value);
    const time = parseInt(document.getElementById('cal-time').value);
    
    const speedKmh = (distance / time) * 60;
    let met;
    
    if (speedKmh < 6.4) met = 6.0;
    else if (speedKmh < 8.0) met = 8.3;
    else if (speedKmh < 9.7) met = 9.8;
    else if (speedKmh < 11.3) met = 11.0;
    else if (speedKmh < 12.9) met = 12.8;
    else if (speedKmh < 14.5) met = 14.5;
    else if (speedKmh < 16.1) met = 16.0;
    else met = 19.0;
    
    const calories = met * weight * (time / 60);
    const simpleCalories = weight * distance;
    const avgCalories = Math.round((calories + simpleCalories) / 2);
    
    // Update stats
    userStats.calculations = (userStats.calculations || 0) + 1;
    userStats.totalCalories = (userStats.totalCalories || 0) + avgCalories;
    Storage.saveUserStats(userStats);
    UI.updateStatsBar(userStats);
    
    let resultHTML = `
        <h3>Calorie Burn Estimate</h3>
        <div class="result-item"><strong>Speed:</strong> ${speedKmh.toFixed(1)} km/h</div>
        <div class="result-item"><strong>MET-based estimate:</strong> ${Math.round(calories)} calories</div>
        <div class="result-item"><strong>Simple estimate:</strong> ${Math.round(simpleCalories)} calories</div>
        <div class="result-item"><strong>Average:</strong> ${avgCalories} calories</div>
        <button onclick="showShareModal('Burned ${avgCalories} calories in ${distance}km run!')" style="margin-top: 15px; background: #4267B2;">Share Results</button>
    `;
    
    UI.displayResult('calorie-result', resultHTML);
}