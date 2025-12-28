var mainCanvas;
var positionGraphCanvas;
var velocityGraphCanvas;
var accelerationGraphCanvas;
var mainCtx;
var positionGraphCtx;
var velocityGraphCtx;
var accelerationGraphCtx;
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
        pos += getConstantForcedResponsePosition(SHMParams.omega, SHMParams.zeta, stepForceMagnitude);
    }

    positionData.push(pos);
    velocityData.push(vel);
    accelerationData.push(acc);

    drawMSDSystem(mainCtx, pos);

    plot(positionGraphCtx, 0, time, -SHMParams.R*1.2, SHMParams.R*1.2, equallySpacedArray(0, time, positionData.length), positionData);
    plot(velocityGraphCtx, 0, time, -SHMParams.omega*SHMParams.R*1.2, SHMParams.omega*SHMParams.R*1.2, equallySpacedArray(0, time, velocityData.length), velocityData);
    plot(accelerationGraphCtx, 0, time, -SHMParams.omega*SHMParams.omega*SHMParams.R*1.2, SHMParams.omega*SHMParams.omega*SHMParams.R*1.2, equallySpacedArray(0, time, accelerationData.length), accelerationData);

    time += 1/FPS;
}

window.onload = () => {
    mainCanvas = document.querySelector('#mainCanvas');
    positionGraphCanvas = document.querySelector('#positionGraphCanvas');
    velocityGraphCanvas = document.querySelector('#velocityGraphCanvas');
    accelerationGraphCanvas = document.querySelector('#accelerationGraphCanvas');
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

    MSDTabBtn.onclick = () => {
        if (simType === "MSD") return;
        simType = "MSD";
        MSDTab.style.display = "block";
        LCRTab.style.display = "none";
    }

    LCRTabBtn.onclick = () => {
        if (simType === "LCR") return;
        simType = "LCR";
        MSDTab.style.display = "none";
        LCRTab.style.display = "block";
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
            // TODO: LCR simulation
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
        drawMSDSystem(mainCtx, 0);
        plot(positionGraphCtx, 0, 1, -1, 1, [], []);
        plot(velocityGraphCtx, 0, 1, -1, 1, [], []);
        plot(accelerationGraphCtx, 0, 1, -1, 1, [], []);
    }
}