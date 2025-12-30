# Oscillation simulator

This simulator uses differential equations to investigate simple harmonic motion. It currently allows users to simulate two applications of SHM.

The generated data can then be exported to CSV for futher analysis.

## Mass-spring-damper system

This is the classic mass on a spring. The simulator allows you to set:
- mass
- spring stiffness
- damping
- initial displacement

In addition to showing a visual of the spring, the simulator also plots graphs of position, velocity, and acceleration of the mass against time.

The simulator also allows you to investigate this system using material properties instead of the typcial parameters, which can be useful in investigating Young's modulus.

Additionally, the simulator allows you to apply a driving force to the mass. This can either be a step (constant) force or a sinusoidal force. This is useful for investigating forced oscillations.

## LCR circuit

This is another application of oscillations. The simulator allows you to specify:
- inductance
- capacitance
- resistance

It then plots graphs of the charge in the capactior, current in the circuit, and the rate of change of current.