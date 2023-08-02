---
---

# Damped Wave Simulation

For the project, your job is to simulate the [damped](https://en.wikipedia.org/wiki/Damping) [wave equation](https://en.wikipedia.org/wiki/Wave_equation) with [fixed boundary conditions](https://en.wikipedia.org/wiki/Dirichlet_boundary_condition) in two dimensions. This is most easily imagined as the evolution in time of a rectangular drum head. The [first phase's simulation](1-basics.md), for example, looks like this when visualized as an elastic membrane:

![Elastic Membrane](../img/phase-1-animation-2D.gif)

## Setup

Some aspects of the wave equation are ignored and a rudimentary algorithm is used to simulate it; this comes at the expense of accuracy but keeps complexity to a level appropriate for this course. 4 parameters fully describe the state of this basic simulation:

- `c`: the **damping coefficient**, which determines how quickly energy dissipates--higher `c` means faster dissipation.
- `t`: the amount of **time** that the simulation has progressed. Given a time step `dt`, this is the amount of iterations multiplied by `dt`, which will be fixed at `0.01` for most phases of the project to ensure simulation accuracy.
- `u`: an array in which each element represents the **displacement** at the corresponding point on the plane. If visualizing as a drum head, this is the height of a point on the head relative to the height at its edges.
- `v`: an array in which each element represents the rate of change with respect to time of the displacement (its **velocity**) at the corresponding point on the plane. If visualizing as a drum head, this is the velocity of a point on the head.

## Moving the Simulation Forward in Time

To step interior cell $\left(i, j\right)$ from time $t$ to time $t+dt$, given displacement $u$ and velocity $v$, the following algorithm is used:

$$L_{i,j}^{(t)} \lArr \frac{u_{i,j-1}^{(t)} + u_{i,j+1}^{(t)} + u_{i-1,j}^{(t)} + u_{i+1,j}^{(t)}}{2} - 2 \space u_{i,j}^{(t)}$$

$$v_{i,j}^{(t+dt)} \lArr (1-dt \space c) v_{i,j}^{(t)} + dt \space L_{i,j}^{(t)}$$

$$u_{i,j}^{(t+dt)} \lArr u_{i,j}^{(t)} + dt \space v_{i,j}^{(t+dt)}$$

To enforce the fixed boundary condition, cells at the edge of the array are never updated.

Here's how one step of `dt` for the whole wave plane might look in [Julia](../programming-resources.md#julia) given displacement `u` and velocity `v`:

```julia
function step(u, v, dt)
    m, n = size(u)
    # Update v
    for i in 2:m-1, j in 2:n-1
        L = (u[i-1,j] + u[i+1,j] + u[i,j-1] + u[i,j+1]) / 2 - 2 * u[i,j]
        v[i,j] = (1 - dt * c) * v[i,j] + dt * L
    end
    # Update u
    for i in 2:m-1, j in 2:n-1
        u[i,j] += v[i,j] * dt
    end
end
```

## Stopping Criterion: Energy

The simulation proceeds in time steps of `dt` until the energy in the grid falls below an average of 0.001 per interior cell. The total energy constitutes two parts, which we'll call **dynamic energy** and **potential energy**.

Dynamic energy is the energy stored within each cell, and is defined for cell $(i, j)$ as:

$$D_{i,j} = \frac{v_{i,j}^2}{2}$$

Potential energy is the energy stored in the boundaries between adjacent cells, and is defined for cells $(i, j)$ and $(I, J)$ as:

$$P_{i,j,I,J} = \frac{\left( u_{i,j} - u_{I,J} \right)^2}{4}$$

Here's how the total energy might be determined in [Julia](../programming-resources.md#julia) given `u` and `v`:

```julia
function energy(u, v)
    m, n = size(u)
    E = 0
    # Dynamic
    for i in 2:m-1, j in 2:n-1
        E += v[i,j]^2 / 2
    end
    # Potential
    for i in 1:m-1, j in 2:n-1 # along x axis (note i range)
        E += (u[i,j] - u[i+1,j])^2 / 4;
    end
    for i in 2:m-1, j in 1:n-1 { # along y axis (note j range)
        E += (u[i,j] - u[i,j+1])^2 / 4;
    end
    # Return the total
    return E
end
```

## Running the Simulation

Given damping coefficient `c`, time step `dt`, initial simulation time `t0`, initial displacement `u0`, and initial velocify `v0`, your job is to repeatedly step the simulation forward in time by steps of `dt` until the total energy falls below an average of 0.001 per interior cell. Given the [`step`](#moving-the-simulation-forward-in-time) and [`energy`](#stopping-criterion:-energy) functions defined above, here is a Julia function that would do so and return the final time, displacement, and velocity:

```julia
function solve(c, dt, t0, u0, v0)
    # Initialize
    t = t0
    u, v = deepcopy.(u0, v0)
    # Constants
    m, n = size(u)
    stopping_energy = (m - 2) * (n - 2) / 1000
    # Solve
    while energy(u, v) > stopping_energy
        step(u, v, dt)
    end
    # Return updated state as a tuple
    return t, u, v
end
```
