var mainCanvas;
var positionGraphCanvas;
var velocityGraphCanvas;
var accelerationGraphCanvas;
var mainCtx;
var positionGraphCtx;
var velocityGraphCtx;
var accelerationGraphCtx;
var simType = "SMD";
var time = 0;
const FPS = 60;
var mass = 10;
var k = 10;
var c = 0;
var s0 = 200;
var SHMParams = {};
var positonData = [];
var velocityData = [];
var accelerationData = [];

function updateMSD() {
    const pos = getDampedSHMPosition(SHMParams.omega, SHMParams.zeta, SHMParams.R, time);
    const vel = getDampedSHMVelocity(SHMParams.omega, SHMParams.zeta, SHMParams.R, time);
    const acc = getDampedSHMAcceleration(SHMParams.omega, SHMParams.zeta, SHMParams.R, time);

    positonData.push(pos);
    velocityData.push(vel);
    accelerationData.push(acc);

    drawMSDSystem(mainCtx, pos);

    plot(positionGraphCtx, 0, time, -SHMParams.R*1.2, SHMParams.R*1.2, equallySpacedArray(0, time, positonData.length), positonData);
    plot(velocityGraphCtx, 0, time, -SHMParams.omega*SHMParams.R*1.2, SHMParams.omega*SHMParams.R*1.2, equallySpacedArray(0, time, velocityData.length), velocityData);
    plot(accelerationGraphCtx, 0, time, -SHMParams.omega*SHMParams.omega*SHMParams.R*1.2, SHMParams.omega*SHMParams.omega*SHMParams.R*1.2, equallySpacedArray(0, time, accelerationData.length), accelerationData);

    time += 1/FPS;
}

window.onload = () => {
    mainCanvas = document.querySelector('#mainCanvas');
    positionGraphCanvas = document.querySelector('#positionGraphCanvas');
    velocityGraphCanvas = document.querySelector('#velocityGraphCanvas');
    accelerationGraphCanvas = document.querySelector('#accelerationGraphCanvas');

    mainCtx = prepareCanvas(mainCanvas);
    positionGraphCtx = prepareCanvas(positionGraphCanvas);
    velocityGraphCtx = prepareCanvas(velocityGraphCanvas);
    accelerationGraphCtx = prepareCanvas(accelerationGraphCanvas);

    if (simType === "SMD") {
        SHMParams = getSHMParameters({k: k, m: mass, c: c, s0: s0});
        drawMSDSystem(mainCtx, 0);

        setInterval(updateMSD, 1000 / FPS);
    }
}