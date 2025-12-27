function getDampedSHMPosition(omega, zeta, R, t) {
    const b = 2*zeta*omega;
    const c = omega * omega;
    const discriminant = b * b - 4*c;
    if (discriminant < 0) {
        const alpha = -b/2;
        const beta = Math.sqrt(-discriminant)/2;
        return Math.exp(alpha*t)*(R*Math.cos(beta*t) + (-alpha*R/beta)*Math.sin(beta*t));
    }
    else if (Math.abs(discriminant) < 1e-12) {
        const alpha = -b/2;
        return -alpha*R*t*Math.exp(alpha*t) + R*Math.exp(alpha*t);
    }
    else {
        const alpha = (-b + Math.sqrt(discriminant))/2;
        const beta = (-b - Math.sqrt(discriminant))/2;
        return (R*beta/(beta - alpha))*Math.exp(alpha*t) + (R*alpha/(alpha - beta))*Math.exp(beta*t);
    }
}

function getDampedSHMVelocity(omega, zeta, R, t) {
    const b = 2*zeta*omega;
    const c = omega * omega;
    const discriminant = b * b - 4*c;
    if (discriminant < 0) {
        const alpha = -b/2;
        const beta = Math.sqrt(-discriminant)/2;
        return Math.exp(alpha*t)*((-alpha*R)*Math.cos(beta*t) + (R*beta + alpha*alpha*R/beta)*Math.sin(beta*t));
    }
    else if (Math.abs(discriminant) < 1e-12) {
        const alpha = -b/2;
        return Math.exp(alpha*t)*(-alpha*R + (-alpha*-alpha*R*t + -alpha*R));
    }
    else {
        const alpha = (-b + Math.sqrt(discriminant))/2;
        const beta = (-b - Math.sqrt(discriminant))/2;
        return (R*beta*alpha/(beta - alpha))*Math.exp(alpha*t) + (R*alpha*beta/(alpha - beta))*Math.exp(beta*t);
    }
}

function getDampedSHMAcceleration(omega, zeta, R, t) {
    const x = getDampedSHMPosition(omega, zeta, R, t);
    const v = getDampedSHMVelocity(omega, zeta, R, t);
    return -2*zeta*omega*v - omega*omega*x;
}

function getSHMParameters(args) {
    let params = {omega: 1, zeta: 0, R: 1};
    // spring-mass-damper system
    if ('k' in args && 'm' in args && 's0' in args) {
        params.omega = Math.sqrt(args.k / args.m);
        if ('c' in args) {
            params.zeta = args.c / (2 * Math.sqrt(args.k * args.m));
        }
        params.R = args.s0;
    }
    // spring-mass-damper with spring material properties
    else if ('E' in args && 'm' in args && 's0' in args && 'A' in args && 'L0' in args) {
        const k = (args.E * args.A) / args.L0;
        params.omega = Math.sqrt(k / args.m);
        params.R = args.s0;
    }
    // LCR circuit
    else if ('L' in args && 'C' in args) {
        params.omega = 1 / Math.sqrt(args.L * args.C);
        if ('R' in args) {
            params.zeta = args.R / (2 * Math.sqrt(args.L / args.C));
        }
        params.R = args.V0 / params.omega;
    }
    else {
        throw new Error("Insufficient parameters to determine SHM characteristics.");
    }
    return params;
}

function getSinForcedResponsePosition(omega, zeta, F0, m, omegaF, phiF, t) {
    const X = F0 / (m * Math.sqrt((omega * omega - omegaF * omegaF) ** 2 + (2 * zeta * omega * omegaF) ** 2));
    const phi = Math.atan((2 * zeta * omega * omegaF) / (omega * omega - omegaF * omegaF));
    return X * Math.sin(omegaF * t - phi + phiF);
}

function getSinForcedResponseVelocity(omega, zeta, F0, m, omegaF, phiF, t) {
    const X = F0 / (m * Math.sqrt((omega * omega - omegaF * omegaF) ** 2 + (2 * zeta * omega * omegaF) ** 2));
    const phi = Math.atan((2 * zeta * omega * omegaF) / (omega * omega - omegaF * omegaF));
    return X * omegaF * Math.cos(omegaF * t - phi + phiF);
}

function getSinForcedResponseAcceleration(omega, zeta, F0, m, omegaF, phiF, t) {
    const X = F0 / (m * Math.sqrt((omega * omega - omegaF * omegaF) ** 2 + (2 * zeta * omega * omegaF) ** 2));
    const phi = Math.atan((2 * zeta * omega * omegaF) / (omega * omega - omegaF * omegaF));
    return -X * omegaF * omegaF * Math.sin(omegaF * t - phi + phiF);
}

function getConstantForcedResponsePosition(omega, zeta, F0, m) {
    return F0 / (m * omega * omega);
}

function equallySpacedArray(start, end, numPoints) {
    const arr = [];
    const step = (end - start) / (numPoints - 1);
    for (let i = 0; i < numPoints; i++) {
        arr.push(start + i * step);
    }
    return arr;
}