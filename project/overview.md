---
---

# Course Project: Damped Wave Simulation

For the project, your job is to simulate the [damped](https://en.wikipedia.org/wiki/Damping) [wave equation](https://en.wikipedia.org/wiki/Wave_equation) with [fixed boundary conditions](https://en.wikipedia.org/wiki/Dirichlet_boundary_condition) in two dimensions. This is most easily imagined as the evolution in time of a rectangular drum head. The [first phase's simulation](phase1.md), for example, looks like this when visualized as an elastic membrane:

![Elastic Membrane](../img/phase-1-animation-2D.gif)



## Setup

Some aspects of the wave equation are ignored and a rudimentary algorithm is used to simulate it; this comes at the expense of accuracy and versatility but keeps complexity to a level appropriate for this course. 4 parameters fully describe the state of this basic simulation:

- `c`: the **damping coefficient**, which determines how quickly energy dissipates--higher `c` means faster dissipation.
- `t`: the amount of **time** that the simulation has progressed. Given a time step `dt`, this is the amount of iterations multiplied by `dt`, which will be fixed at `0.01` for most phases of the project to ensure simulation accuracy.
- `u`: an array in which each element represents the **displacement** at the corresponding point on the plane. If visualizing as a drum head, this is the height of a point on the head relative to the height at its edges.
- `v`: an array in which each element represents the rate of change with respect to time of the displacement (its **velocity**) at the corresponding point on the plane. If visualizing as a drum head, this is the velocity of a point on the head.

This state will hence be called a **wave [orthotope](https://en.wikipedia.org/wiki/Hyperrectangle)**. In two dimensions it is a **wave rectangle**, but there is [extra credit](../assignments/extra-credit.md#project) for generalizing to an arbitrary number of dimensions.



## Moving the Simulation Forward in Time

To **step** interior cell $$(i, j)$$ from time $$t$$ to time $$t+dt$$, given displacement $$u$$ and velocity $$v$$, the following [leapfrog algorithm](https://en.wikipedia.org/wiki/Leapfrog_integration) is used:

$$L_{i,j}^{(t)} = \frac{u_{i,j-1}^{(t)} + u_{i,j+1}^{(t)} + u_{i-1,j}^{(t)} + u_{i+1,j}^{(t)}}{2} - 2 \space u_{i,j}^{(t)}$$

$$v_{i,j}^{(t+dt)} = (1-dt \space c) v_{i,j}^{(t)} + dt \space L_{i,j}^{(t)}$$

$$u_{i,j}^{(t+dt)} = u_{i,j}^{(t)} + dt \space v_{i,j}^{(t+dt)}$$

To enforce the fixed boundary condition, cells at the edge of the array are never updated.

Here's how one step of `dt` for the whole wave rectangle might look in [Julia](../resources.md#julia) given displacement `u` and velocity `v`:

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

The simulation proceeds in time steps of `dt` until the **energy** in the grid falls below an average of 0.001 per interior cell. The total energy constitutes two parts, which we'll call dynamic energy and potential energy.

Dynamic energy is the energy stored within each cell, and is defined for cell $$(i, j)$$ as:

$$D_{i,j} = \frac{v_{i,j}^2}{2}$$

Potential energy is the energy stored in the boundaries between adjacent cells, and is defined for cells $$(i, j)$$ and $$(I, J)$$ as:

$$P_{i,j;I,J} = \frac{\left( u_{i,j} - u_{I,J} \right)^2}{4}$$

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
    for i in 2:m-1, j in 1:n-1 # along y axis (note j range)
        E += (u[i,j] - u[i,j+1])^2 / 4;
    end
    # Return the total
    return E
end
```



## Running the Simulation

Your job is to determine an initial state (the specifics of which vary phase to phase), repeatedly step the simulation forward until total energy falls below an average of 0.001 per interior cell (i.e. **solve** the simulation), and do something with the resultant final state (again, the specifics vary by phase). Given damping coefficient `c`, time step `dt`, initial simulation time `t0`, initial displacement `u0`, and initial velocify `v0`, and functions [`step`](#moving-the-simulation-forward-in-time) and [`energy`](#stopping-criterion-energy) defined above, here is a Julia function that would solve the wave rectangle defined by `c`, `t0`, `u0`, and `v0` and return the changed elements of the final state.

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
        t += dt
    end
    # Return updated state as a tuple
    return t, u, v
end
```



## Appendix A: Tips and Tricks

The foundation you lay in the first phases will be used for the rest of the course. It's thus a good idea to skim over future [phases of the project](../assignments.html) often to ensure that your code maintains the flexibility to easily accomodate future requirements. Pay down [technical debt](https://en.wikipedia.org/wiki/Technical_debt) early.

Get familiar with [`WaveSim.jl`](TODOhttps://github.com/BYUHPC/WaveSim.jl) early, ideally by [phase 2](phase2.md)--you'll be modifying it in phases [4](phase4.md) and [8](phase8.md), so you may as well take advantage of its utility early on.

Look at the example [code often](https://github.com/BYUHPC/sci-comp-course-example-cxx), as there's usually very little difference (outside of the algorithm) between it and what you'll be required to do.



## Appendix B: Skeleton Wave Simulation Class

Below is a class that contains the state of a wave simulation. It's provided since this isn't a programming class--we want you to learn relavant general concepts, not the painful ins and outs of C++. The parts you'll need to implement (for the [first phase](phase1.md), at least) are marked with `// TODO` comments. You'll likely need to modify it and split it into separate headers for each phase; look to the [example code](https://github.com/BYUHPC/sci-comp-course-example-cxx) for ideas on how to do so.

```c++
#include <array>
#include <vector>
#include <iostream>

// Class representing a rectangular plane with Dirichlet boundary conditions over which waves propagate
// Called "orthotope" rather than "rectangle" since extra credit is given for generalizing to arbitrary dimension
class WaveOrthotope {
    // Types
    using size_type = size_t;
    using value_type = double;

    // Members
    const size_type m, n;              // size
    const value_type c;                // damping coefficient
    value_type t;                      // simulation time
    std::vector<value_type> disp, vel; // displacement and velocity arrays

public:
    // Constructor
    // USAGE: auto my_wave_orthotope = WaveOrthotope(20, 30, 0.1, 0);
    // SEE: https://www.learncpp.com/cpp-tutorial/constructor-member-initializer-lists/
    WaveOrthotope(const auto m, const auto n, const auto c, const value_type t=0): m(m), n(n), c(c), t(t), disp(m*n), vel(m*n) {}

    // Return the size as a std::array
    // USAGE: const auto [rows, cols] = my_wave_orthotope.size();
    // SEE: https://codeburst.io/c-17-structural-binding-180696f7a678#63b1
    constexpr const auto size() const { return std::array{m, n}; }

    // Displacement indexing
    // USAGE: my_wave_orthotope.u(1, 2) = 1.0;
    constexpr const value_type  u(const auto i, const auto j) const { return disp[i*n+j]; }
    constexpr       value_type& u(const auto i, const auto j)       { return disp[i*n+j]; }

    // Displacement velocity indexing
    // USAGE: const auto v12 = my_wave_orthotope.v(1, 2);
    constexpr const value_type  v(const auto i, const auto j) const { return vel [i*n+j]; }
    constexpr       value_type& v(const auto i, const auto j)       { return vel [i*n+j]; }

    // Return the energy contained in this WaveOrthotope
    // USAGE: const auto E = my_wave_orthotope.energy();
    const value_type energy() const {
        value_type E{};
        // TODO: calculate total energy
        return E;
    }

    // Advance the membrane in time by dt
    // USAGE: my_wave_orthotope.step();
    const value_type step() {
        const value_type dt = 0.01;
        // TODO: update u and v by one time step
        t += dt;
        return t;
    }

    // Advance the membrane in time by steps of dt until the average interior cell energy drops below 0.001
    // USAGE: const auto sim_time = my_wave_orthotope.solve();
    const value_type solve() {
        while (energy() > (m-2)*(n-2)*0.001) {
            step();
        }
        return t;
    }
};
```



## Appendix C: Mathematical Justification

You don't need to read any of the following, but [some of it](#laplacian) is helpful for the extra credit.

The damped wave equation is defined as:

$$\ddot u = \nabla^2 u - c \space \dot u$$

...where $$c$$ is the damping coefficient, $$u$$ represents displacement from equilibrium, $$\dot u$$ represents the first derivative of $$u$$ with respect to time (and $$\ddot u$$ the second), and $$\nabla^2$$ is the [Laplace operator](https://en.wikipedia.org/wiki/Laplace_operator).

Although some of the equations and justifications in this document are specific to an elastic membrane and/or to 2 dimensions, the same equations can (if appropriately modified for the number of dimensions) represent other wave phenomena in different dimensions. For example, light bouncing around in a perfectly reflective box containing an opaque medium could be simulated, as could longitudinal pulses traveling through a stiff rod.

### Laplacian

The $$L$$ equation defined [above](#moving-the-simulation-forward-in-time) is a 2-dimensional [approximation of the Laplacian](https://en.wikipedia.org/wiki/Discrete_Laplace_operator#Finite_differences), the general form of which is:

$$\nabla^2 x_{I} \approx \left( \sum_n^{2N} \frac{x_{n}}{2} \right) - N \space x$$

...where $$N$$ is the dimension of the problem and each of $$n$$ are indices adjacent to $$I$$ in positive and negative directions along each axis.

### Energy

To determine the energy stored in a 2-dimensional rectangular wave plane, we imagine each cell as a particle of unit mass, each connected to the four adjacent particles by springs of unit spring coefficient constrained to move along the axis orthogonal to the plane.

Since each particle is of unit mass, the kinetic energy (which is generalized as "dynamic" energy above) for a cell is:

$$KE_{i,j} = \frac{v_{i,j}^2}{2}$$

The potential energy is held in the springs. Given unit spring coefficient, the potential energy between two adjacent cells is:

$$PE_{i,j;I,J} = \frac{\left( u_{i,j} - u_{I,J} \right)^2}{4}$$

Division is by 4 rather than two because both ends of each spring are free; it can thus be modeled as a central point with springs of half length on each side, with half the potential energy of a system with only one free end. The potential of the boundaries at the edges is made identical (and, importantly, the simulation is simplified) by considering these "springs" to have half the spring coefficient of interior "springs."
