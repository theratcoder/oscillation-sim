const springAnchorDim = {width: 20, height: 50};
const massDim = {width: 60, height: 60};
const springCoils = 10;
const coilWidth = 20;

function prepareCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return ctx;
}

function drawMSDSystem(ctx, position) {
    const width = ctx.canvas.width / (window.devicePixelRatio || 1);
    const height = ctx.canvas.height / (window.devicePixelRatio || 1);
    const equilibriumX = (width - massDim.width) / 2;
    const x = equilibriumX + position;
    const y = height / 2;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#888';
    ctx.fillRect(0, y - springAnchorDim.height/2, springAnchorDim.width, springAnchorDim.height);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(springAnchorDim.width, y);
    const springLength = x - springAnchorDim.width - massDim.width/2;
    for (let i = 0; i < springCoils; i++) {
        const coilX = springAnchorDim.width + (springLength / springCoils) * (i + 0.5);
        const coilY = y + (i % 2 === 0 ? coilWidth : -coilWidth);
        ctx.lineTo(coilX, coilY);
    }
    ctx.lineTo(x - massDim.width/2, y);
    ctx.stroke();

    ctx.fillStyle = '#00f';
    ctx.fillRect(x - massDim.width/2, y - massDim.height/2, massDim.width, massDim.height);
}

function drawLCRCircuit(ctx) {
    const width = ctx.canvas.width / (window.devicePixelRatio || 1);
    const height = ctx.canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, width, height);

    const circuitX = width * 0.2;
    const circuitY = height * 0.3;
    const circuitWidth = width * 0.6;
    const circuitHeight = height * 0.4;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#fff';

    // Inductor (left side)
    const indHeight = 60;
    const indX = circuitX;
    const indY = circuitY + circuitHeight * 0.5 + indHeight/2;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
        ctx.arc(indX, indY - i * indHeight/4, 7, Math.PI/2, 3*Math.PI/2);
    }
    ctx.stroke();

    // Resistor (top)
    const resWidth = 30;
    const resHeight = 15;
    const resX = circuitX + circuitWidth * 0.5 - resWidth / 2;
    const resY = circuitY - resHeight/2;
    ctx.strokeRect(resX, resY, resWidth, resHeight);

    // Capacitor (right side)
    const capX = circuitX + circuitWidth;
    const capY = circuitY + circuitHeight * 0.5;
    const capGap = 10;
    ctx.beginPath();
    ctx.moveTo(capX - 15, capY);
    ctx.lineTo(capX + 15, capY);
    ctx.moveTo(capX - 15, capY + capGap);
    ctx.lineTo(capX + 15, capY + capGap);
    ctx.stroke();

    // Connecting wires
    ctx.beginPath();
    ctx.moveTo(circuitX, circuitY);
    ctx.lineTo(resX, circuitY);
    ctx.moveTo(resX + resWidth, circuitY);
    ctx.lineTo(circuitX + circuitWidth, circuitY);
    ctx.lineTo(circuitX + circuitWidth, capY);
    ctx.moveTo(circuitX + circuitWidth, capY + capGap);
    ctx.lineTo(circuitX + circuitWidth, circuitY + circuitHeight);
    ctx.lineTo(circuitX, circuitY + circuitHeight);
    ctx.lineTo(circuitX, indY + indHeight/8);
    ctx.moveTo(circuitX, indY - indHeight + indHeight/8);
    ctx.lineTo(circuitX, circuitY);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.fillText('L', indX - 20, indY - indHeight/2);
    ctx.fillText('R', resX + resWidth/2, resY - 5);
    ctx.fillText('C', capX + 20, capY + capGap/2);
}

function plot(ctx, xMin, xMax, yMin, yMax, x, y) {
    const width = ctx.canvas.width / (window.devicePixelRatio || 1);
    const height = ctx.canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    
    // draw axes
    ctx.beginPath();
    // x-axis
    const yZero = height - ((0 - yMin) / (yMax - yMin)) * height;
    ctx.moveTo(0, yZero);
    ctx.lineTo(width, yZero);
    // y-axis
    const xZero = ((0 - xMin) / (xMax - xMin)) * width;
    ctx.moveTo(xZero, 0);
    ctx.lineTo(xZero, height);
    ctx.stroke();

    // plot data
    ctx.strokeStyle = '#f00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < x.length; i++) {
        const px = ((x[i] - xMin) / (xMax - xMin)) * width;
        const py = height - ((y[i] - yMin) / (yMax - yMin)) * height;
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.stroke();
}