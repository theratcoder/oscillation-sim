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