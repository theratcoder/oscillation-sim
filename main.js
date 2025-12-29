var mainCanvas;
var positionGraphCanvas;
var velocityGraphCanvas;
var accelerationGraphCanvas;
var mainCtx;
var positionGraphCtx;
var velocityGraphCtx;
var accelerationGraphCtx;
var positionGraphLabel;
var velocityGraphLabel;
var accelerationGraphLabel;
var massInput;
var kInput;
var cInput;
var s0Input;
var startBtn;
var stopBtn;
var resetBtn;
var MSDTabBtn;
var LCRTabBtn;
var MSDTab;
var LCRTab;
var MSDTabSelect;
var MSDBasicTab;
var MSDAdvancedTab;
var forcingTypeSelect;
var sinForcedTab;
var stepForcedTab;

var simType = "MSD";
var MSDSimMode = "basic";
var forcingType = "none";
var time = 0;
const FPS = 60;
var SHMParams = {};
var mass = 1;
var sinForceAmplitude = 0;
var sinForceNaturalFrequency = 2*Math.PI;
var sinForcePhase = 0;
var stepForceMagnitude = 0;
var positionData = [];
var velocityData = [];
var accelerationData = [];
var maxPos = 0;
var minPos = 0;
var maxVel = 0;
var minVel = 0;
var maxAcc = 0;
var minAcc = 0;
var timer = null;

function updateMSD() {
    var pos = getDampedSHMPosition(SHMParams.omega, SHMParams.zeta, SHMParams.R, time);
    var vel = getDampedSHMVelocity(SHMParams.omega, SHMParams.zeta, SHMParams.R, time);
    var acc = getDampedSHMAcceleration(SHMParams.omega, SHMParams.zeta, SHMParams.R, time);

    if (forcingType === "sin") {
        pos += getSinForcedResponsePosition(SHMParams.omega, SHMParams.zeta, sinForceAmplitude, mass, sinForceNaturalFrequency, sinForcePhase, time);
        vel += getSinForcedResponseVelocity(SHMParams.omega, SHMParams.zeta, sinForceAmplitude, mass, sinForceNaturalFrequency, sinForcePhase, time);
        acc += getSinForcedResponseAcceleration(SHMParams.omega, SHMParams.zeta, sinForceAmplitude, mass, sinForceNaturalFrequency, sinForcePhase, time);
    }
    else if (forcingType === "step") {
        pos += getConstantForcedResponsePosition(SHMParams.omega, SHMParams.zeta, stepForceMagnitude, mass);
    }

    positionData.push(pos);
    velocityData.push(vel);
    accelerationData.push(acc);

    drawMSDSystem(mainCtx, pos);

    if (pos > maxPos) maxPos = pos;
    if (pos < minPos) minPos = pos;
    if (vel > maxVel) maxVel = vel;
    if (vel < minVel) minVel = vel;
    if (acc > maxAcc) maxAcc = acc;
    if (acc < minAcc) minAcc = acc;

    const posRange = maxPos - minPos;
    const lowerPosBound = minPos - 0.1 * posRange;
    const upperPosBound = maxPos + 0.1 * posRange;
    const velRange = maxVel - minVel;
    const lowerVelBound = minVel - 0.1 * velRange;
    const upperVelBound = maxVel + 0.1 * velRange;
    const accRange = maxAcc - minAcc;
    const lowerAccBound = minAcc - 0.1 * accRange;
    const upperAccBound = maxAcc + 0.1 * accRange;

    plot(positionGraphCtx, 0, time, lowerPosBound, upperPosBound, equallySpacedArray(0, time, positionData.length), positionData);
    plot(velocityGraphCtx, 0, time, lowerVelBound, upperVelBound, equallySpacedArray(0, time, velocityData.length), velocityData);
    plot(accelerationGraphCtx, 0, time, lowerAccBound, upperAccBound, equallySpacedArray(0, time, accelerationData.length), accelerationData);

    time += 1/FPS;
}

function updateLCR() {
    const charge = getDampedSHMPosition(SHMParams.omega, SHMParams.zeta, SHMParams.R, time);
    const current = getDampedSHMVelocity(SHMParams.omega, SHMParams.zeta, SHMParams.R, time);
    const dCurrent = getDampedSHMAcceleration(SHMParams.omega, SHMParams.zeta, SHMParams.R, time);

    positionData.push(charge);
    velocityData.push(current);
    accelerationData.push(dCurrent);

    if (charge > maxPos) maxPos = charge;
    if (charge < minPos) minPos = charge;
    if (current > maxVel) maxVel = current;
    if (current < minVel) minVel = current;
    if (dCurrent > maxAcc) maxAcc = dCurrent;
    if (dCurrent < minAcc) minAcc = dCurrent;

    const chargeRange = maxPos - minPos;
    const lowerChargeBound = minPos - 0.1 * chargeRange;
    const upperChargeBound = maxPos + 0.1 * chargeRange;
    const currentRange = maxVel - minVel;
    const lowerCurrentBound = minVel - 0.1 * currentRange;
    const upperCurrentBound = maxVel + 0.1 * currentRange;
    const dCurrentRange = maxAcc - minAcc;
    const lowerdCurrentBound = minAcc - 0.1 * dCurrentRange;
    const upperdCurrentBound = maxAcc + 0.1 * dCurrentRange;

    plot(positionGraphCtx, 0, time, lowerChargeBound, upperChargeBound, equallySpacedArray(0, time, positionData.length), positionData);
    plot(velocityGraphCtx, 0, time, lowerCurrentBound, upperCurrentBound, equallySpacedArray(0, time, velocityData.length), velocityData);
    plot(accelerationGraphCtx, 0, time, lowerdCurrentBound, upperdCurrentBound, equallySpacedArray(0, time, accelerationData.length), accelerationData);
    time += 1/FPS;
}

window.onload = () => {
    mainCanvas = document.querySelector('#mainCanvas');
    positionGraphCanvas = document.querySelector('#positionGraphCanvas');
    velocityGraphCanvas = document.querySelector('#velocityGraphCanvas');
    accelerationGraphCanvas = document.querySelector('#accelerationGraphCanvas');
    positionGraphLabel = document.querySelector('#positionGraphLabel');
    velocityGraphLabel = document.querySelector('#velocityGraphLabel');
    accelerationGraphLabel = document.querySelector('#accelerationGraphLabel');
    startBtn = document.querySelector('#startBtn');
    stopBtn = document.querySelector('#stopBtn');
    resetBtn = document.querySelector('#resetBtn');
    MSDTabBtn = document.querySelector('#MSDTabBtn');
    LCRTabBtn = document.querySelector('#LCRTabBtn');
    MSDTab = document.querySelector('#MSDTab');
    LCRTab = document.querySelector('#LCRTab');
    MSDTabSelect = document.querySelector('#MSDTabSelect');
    MSDBasicTab = document.querySelector('#MSDBasicTab');
    MSDAdvancedTab = document.querySelector('#MSDAdvancedTab');
    forcingTypeSelect = document.querySelector('#forcingTypeSelect');
    sinForcedTab = document.querySelector('#sinForcedTab');
    stepForcedTab = document.querySelector('#stepForcedTab');

    mainCtx = prepareCanvas(mainCanvas);
    positionGraphCtx = prepareCanvas(positionGraphCanvas);
    velocityGraphCtx = prepareCanvas(velocityGraphCanvas);
    accelerationGraphCtx = prepareCanvas(accelerationGraphCanvas);

    simType = new URLSearchParams(window.location.search).get('simtype') || "MSD";

    if (simType === "LCR") {
        MSDTab.style.display = "none";
        LCRTab.style.display = "block";
        positionGraphLabel.textContent = "Charge in capactitor (C)";
        velocityGraphLabel.textContent = "Current (A)";
        accelerationGraphLabel.textContent = "Rate of change of current (A/s)";
    }

    MSDTabBtn.onclick = () => {
        if (simType === "MSD") return;
        simType = "MSD";
        MSDTab.style.display = "block";
        LCRTab.style.display = "none";
        positionGraphLabel.textContent = "Position (m)";
        velocityGraphLabel.textContent = "Velocity (m/s)";
        accelerationGraphLabel.textContent = "Acceleration (m/s²)";

        let params = new URLSearchParams(window.location.search);
        params.set('simtype', 'MSD');
        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    }

    LCRTabBtn.onclick = () => {
        if (simType === "LCR") return;
        simType = "LCR";
        MSDTab.style.display = "none";
        LCRTab.style.display = "block";
        positionGraphLabel.textContent = "Charge in capactitor (C)";
        velocityGraphLabel.textContent = "Current (A)";
        accelerationGraphLabel.textContent = "Rate of change of current (A/s)";

        let params = new URLSearchParams(window.location.search);
        params.set('simtype', 'LCR');
        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    }

    MSDTabSelect.onchange = () => {
        if (MSDSimMode === MSDTabSelect.value) return;
        MSDSimMode = MSDTabSelect.value;
        if (MSDSimMode === "basic") {
            MSDBasicTab.style.display = "block";
            MSDAdvancedTab.style.display = "none";
        }
        else {
            MSDBasicTab.style.display = "none";
            MSDAdvancedTab.style.display = "block";
        }
    }

    forcingTypeSelect.onchange = () => {
        if (forcingType === forcingTypeSelect.value) return;
        forcingType = forcingTypeSelect.value;

        if (forcingType === "sin") {
            sinForcedTab.style.display = "block";
            stepForcedTab.style.display = "none";
        }
        else if (forcingType === "step") {
            sinForcedTab.style.display = "none";
            stepForcedTab.style.display = "block";
        }
        else {
            sinForcedTab.style.display = "none";
            stepForcedTab.style.display = "none";
        }
    }

    startBtn.onclick = () => {
        if (simType === "MSD") {
            if (MSDSimMode === "basic") {
                mass = parseFloat(document.querySelector("#massInputBasic").value);
                const k = parseFloat(document.querySelector("#springConstantInputBasic").value);
                const c = parseFloat(document.querySelector("#dampingCoefficientInputBasic").value);
                const s0 = parseFloat(document.querySelector("#initialDisplacementInputBasic").value);
                SHMParams = getSHMParameters({k: k, m: mass, c: c, s0: s0});
            }
            else {
                mass = parseFloat(document.querySelector("#massInputAdvanced").value);
                const E = parseFloat(document.querySelector("#elasticModulusInputAdvanced").value);
                const A = parseFloat(document.querySelector("#crossSectionalAreaInputAdvanced").value);
                const L0 = parseFloat(document.querySelector("#lengthInputAdvanced").value);
                const c = parseFloat(document.querySelector("#dampingCoefficientInputAdvanced").value);
                const s0 = parseFloat(document.querySelector("#initialDisplacementInputAdvanced").value);
                SHMParams = getSHMParameters({E: E, A: A, L0: L0, m: mass, c: c, s0: s0});
            }

            if (forcingType === "sin") {
                sinForceAmplitude = parseFloat(document.querySelector("#sinForceAmplitudeInput").value);
                sinForceNaturalFrequency = parseFloat(document.querySelector("#sinForceFrequencyInput").value) * 2 * Math.PI;
                sinForcePhase = parseFloat(document.querySelector("#sinForcePhaseInput").value) * Math.PI / 180;
            }
            else if (forcingType === "step") {
                stepForceMagnitude = parseFloat(document.querySelector("#stepForceMagnitudeInput").value);
            }

            timer = setInterval(updateMSD, 1000 / FPS);
        }
        else {
            const L = parseFloat(document.querySelector("#inductanceInput").value);
            const C = parseFloat(document.querySelector("#capacitanceInput").value);
            const R = parseFloat(document.querySelector("#resistanceInput").value);
            const V0 = parseFloat(document.querySelector("#initialVoltageInput").value);
            SHMParams = getSHMParameters({L: L, C: C, R: R, V0: V0});

            drawLCRCircuit(mainCtx);

            timer = setInterval(updateLCR, 1000 / FPS);
        }
    }

    stopBtn.onclick = () => {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    resetBtn.onclick = () => {
        time = 0;
        positionData = [];
        velocityData = [];
        accelerationData = [];
        maxPos = 0;
        minPos = 0;
        maxVel = 0;
        minVel = 0;
        maxAcc = 0;
        minAcc = 0;

        if (simType === "MSD") {
            drawMSDSystem(mainCtx, 0);
        }
        else {
            drawLCRCircuit(mainCtx);
        }

        plot(positionGraphCtx, 0, 1, -1, 1, [], []);
        plot(velocityGraphCtx, 0, 1, -1, 1, [], []);
        plot(accelerationGraphCtx, 0, 1, -1, 1, [], []);
    }
}