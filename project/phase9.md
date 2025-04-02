---
---

# Phase 9: Differential Equation Solver

This phase is meant to be a more accurate representation of what you might actually do if the [project problem](overview.md) came up in the course of your research. Rather than manually writing a rudimentary leapfrog algorithm like we've been doing, you'll leverage existing infrastructure, taking advantage of the huge amount of time and research that others have put into fast, flexible differential equation solvers. You'll modify [`WaveSim.jl`](https://github.com/BYUHPC/WaveSim.jl) to replace the [leapfrog algorithm](overview.html#moving-the-simulation-forward-in-time) with a [`SecondOrderODEProblem`](https://docs.sciml.ai/DiffEqDocs/stable/types/dynamical_types/) (or a different ["problem" solver](https://docs.sciml.ai/DiffEqDocs/stable/types/ode_types/)) from SciML's [`DifferentialEquations`](https://docs.sciml.ai/DiffEqDocs/stable/) package. Since this means a [higher performance](https://docs.sciml.ai/DiffEqDocs/stable/tutorials/faster_ode_example/) ceiling than a fixed-time-step leapfrog algorithm, it will be required to run on `2d-medium-in.wo` in 30 seconds. I recommend using your [phase 4](phase4.md) code as a starting point since you've already done some of the optimization work you'll need.


## Mathematical Background

An ODE (ordinary differential equation) problem involves finding a function that satisfies an equation formulated in terms of the function’s derivatives. A second order ODE specifically involves the highest derivative being the second derivative. In our problem, this idea translates into displacement (the function itself), velocity (the first derivative), and acceleration (the second derivative). By incorporating a damping term related to velocity, the equation accurately represents the loss of energy over time. Consequently, solving the second order ODE allows us to predict how the displacement of the wave evolves, how quickly the motion slows due to damping, and how the acceleration adjusts, thereby capturing the essential dynamics of a dampened system.

Don't fret if the above sounds like gibberish. Just know that this is the second order ODE equation for our case:

$$ a = \nabla^2 u - c \space v$$

...where $$c$$ is the damping coefficient, $$u$$ represents displacement from equilibrium, $$v$$ represents the first derivative of $$u$$ with respect to time (velocity), $$a$$ represents the second derivative of $$u$$ with respect to time (acceleration), and $$\nabla^2$$ is the [Laplace operator](https://en.wikipedia.org/wiki/Laplace_operator) (the same one we've been using).


## Preparation (~25 Minutes of Downloading and Precompiling)

You'll need to add `DifferentialEquations` as a dependency of your project. First, [activate `WaveSim.jl`](phase4.md#downloading-and-using-a-modified-wavesimjl) and run `add DifferentialEquations` in the package manager while on a login node. This installation is extensive—it downloads and precompiles around 280 packages, which can take approximately 10 minutes. This step must be completed on a login node because Julia needs to download all required packages and artifacts. The full list is determined during precompilation time. Unfortunately, Julia targets the precompilation for the login node, whereas our goal is to run on an `m9` node. Once precompilation on the login node is complete, start an salloc session on an `m9` node. Then, import WaveSim (`using WaveSim`), at which point you will observe a second precompilation phase lasting around 10 minutes. Although the necessary packages and artifacts have already been downloaded, this second precompilation is still required. It is recommended to continue working exclusively on an `m9` node to avoid triggering this process again.

## Using an ODE Problem

The self-contained [example code](https://github.com/BYUHPC/sci-comp-course-example-cxx/blob/main/src/initial.jl) uses the one-dimensional mountain range example problem. It's very similar to what you'll do, so feel free to copy the structure. However, there are a couple of tricks to using a second order ODE problem instead of the first order.


### SecondOrderODEProblem

A [`SecondOrderODEProblem`](https://docs.sciml.ai/DiffEqDocs/stable/types/dynamical_types/#SciMLBase.SecondOrderODEProblem) is only slightly different from [`ODEProblem`](https://docs.sciml.ai/DiffEqDocs/stable/types/ode_types/)--in addition to specifying an initial value (displacement in your case), you'll pass in its initial derivative (velocity):

```julia
ODEProblem{true}(           derivative!,     u0, timespan, c, callback=cb)
SecondOrderODEProblem{true}(derivative!, v0, u0, timespan, c, callback=cb)
```
We'll need to define the derivative function and callback object. You can define `timespan` as `(0.0, 1000.0)` since none of our simulation times will be longer than 1000.0. Once we have this information, we'll pass the SecondOrderODEProblem into the [solve function](https://docs.sciml.ai/DiffEqDocs/stable/basics/common_solver_opts/). You can specify a [specific type of solver](https://docs.sciml.ai/DiffEqDocs/stable/getting_started/#Choosing-a-Solver-Algorithm) if you want, but the default one is acceptable. You don't need to know the underlying math any of the algorithms use. That's what makes leveraging existing, vetted, and quality solutions so powerful. 

You can pass `save_on=false` and `save_start=false` to `SecondOrderODEProblem` to save time and memory at the expense of diagnostic information.

### The Derivative Function

Defining the function that you'll pass to `SecondOrderODEProblem` itself isn't too bad, and `dhdt!` in the [example](https://github.com/BYUHPC/sci-comp-course-example-cxx/blob/main/src/initial.jl) offers some guidance. Notice that `dhdt!`'s main computation is just the [differential equation that defines the example problem](https://github.com/BYUHPC/sci-comp-course-example-cxx/tree/main#appendix-a-mathematical-justification)--you'll do something similar with the [dampened wave differential equation](phase9.md#mathematical-background) that defines our problem. Here's the gist:

```julia
function dvdt!(a, v, u, c, t) # u: displacement; v: velocity; a: acceleration
    @. a = laplacian(u) - c*v # just pseudo-code, needs significant overhaul
    return nothing
end
```

### ContinuousCallback

The function you provide to [`ContinuousCallback`](https://docs.sciml.ai/DiffEqDocs/stable/features/callback_functions/#ContinuousCallback) is a bit tricky since what's passed to the function is an object that holds both the displacement and the velocity in its member `x`. To compensate for this, you can [overload](https://docs.julialang.org/en/v1/manual/methods/#Defining-Methods) [`energy`](https://github.com/BYUHPC/WaveSim.jl/blob/main/src/energy_2d.jl) to take `u` and `v`, then do a callback along the lines of:

```julia
# When this returns 0, iteration stops
terminationcondition(vu, args...) = energy(vu.x[2], vu.x[1])-energythreshold
cb = ContinuousCallback(terminationcondition, terminate!)
```

`vu` in the example is an [`ArrayPartition`](https://docs.sciml.ai/DiffEqDocs/stable/features/diffeq_arrays/#ArrayPartitions) which contains two arrays in its `x` member; the first element (`vu.x[1]`) is velocity, the second (`vu.x[2]`) displacement.

Since energy decays consistently for the wave plates you'll be dealing with, you can pass `interp_points=0` to `ContinuousCallback` to prevent `energy` from being evaluated so much--this often results in dramatic speedups.


### Updating the Wave Orthotope

Once you get a solution using `SecondOrderODEProblem`, you'll need to update your wave orthotope with the results. That will look something like:

```julia
solution = solve(problem)
w.t[] += last(solution.t)
w.u   .= last(solution.u).x[2] # get displacement from ArrayPartition
w.v   .= last(solution.u).x[1] # get velocity from ArrayPartition
```



## Results

Different solving algorithms will yield slightly different results, but they shouldn't differ from previous results by more than a few percent. As an example, using the [default solver](https://docs.sciml.ai/DiffEqDocs/stable/getting_started/#Choosing-a-Solver-Algorithm) should result in a final simulation time of `104.04739848380657` for `2d-medium-in.wo`. Again, if you're close, don't worry about the exact number.



## Submission

You'll submit a tarball named `WaveSim.jl.tar.gz` that I'll grade exactly as I did in [phase 4](phase4.md#submission).



## Grading

This phase is worth 20 points. The following deductions, up to 20 points total, will apply for a program that doesn't work as laid out by the spec:

| Defect | Deduction |
| --- | --- |
| Failure to run correctly on `2d-medium-in.wo` in 30 seconds on `m9` | 5 points |
| Failure to run correctly on `2d-medium-in.wo` in 60 seconds on `m9` | 5 points |
| Failure of your `WaveSim.jl` to work correctly on each of 3 2-dimensional test files | 4 points each |
| `WaveSim.jl` doesn't use an external differential equation solver from `DifferentialEquations` | 1-20 points |
