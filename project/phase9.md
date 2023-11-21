---
---

# Phase 9: Differential Equation Solver

This phase is meant to be a more accurate representation of what you might actually do if the [project problem](overview.md) came up in the course of your research. Rather than manually writing a rudimentary leapfrog algorithm, you'll leverage existing infrastructure, taking advantage of the huge amount of time and research that others have put into fast, flexible differential equation solvers. You'll modify [`WaveSim.jl`](https://github.com/BYUHPC/WaveSim.jl) to replace the [leapfrog algorithm](https://byuhpc.github.io/sci-comp-course/project/overview.html#moving-the-simulation-forward-in-time) with a [`SecondOrderODEProblem`](https://docs.sciml.ai/DiffEqDocs/stable/types/dynamical_types/) (or [whichever "problem" you'd like](https://docs.sciml.ai/DiffEqDocs/stable/types/ode_types/)) from [SciML](https://docs.sciml.ai/Overview/stable/)'s [`DifferentialEquations`](https://docs.sciml.ai/DiffEqDocs/stable/) package. Since this means a much [higher performance](https://docs.sciml.ai/DiffEqDocs/stable/tutorials/faster_ode_example/) ceiling than a fixed-time-step leapfrog algorithm, it will be required to run on `2d-medium-in.wo` in 20 seconds. I recommend using your [phase 4](phase4.md) code as a starting point since you've already done some of the optimization work you'll need.



## Using an ODE Problem

The self-contained [example code](https://github.com/BYUHPC/sci-comp-course-example-cxx/blob/main/src/initial.jl) uses the one-dimensional [mountain range example problem](https://github.com/BYUHPC/sci-comp-course-example-cxx/tree/main#the-problem-orogeny); it's similar to what you'll do, but there are a couple of tricks to using a second order ODE problem.

### The Derivative Function

Defining the function that you'll pass to `SecondOrderODEProblem` itself isn't too bad, and `dhdt!` in the [example](https://github.com/BYUHPC/sci-comp-course-example-cxx/blob/main/src/initial.jl) offers some guidance. Notice that `dhdt!`'s main computation is just the [differential equation that defines the example problem](https://github.com/BYUHPC/sci-comp-course-example-cxx/tree/main#appendix-a-mathematical-justification)--you'll do something similar with the [damped wave equation differential equation](overview.md#appendix-b-mathematical-justification). Here's the gist:

```julia
function dvdt!(a, v, u, c, t) # u: displacement; v: velocity; a: acceleration
    a = laplacian(u) - c*v # just pseudo-code, needs significant overhaul
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

### SecondOrderODEProblem

A [`SecondOrderODEProblem`](https://docs.sciml.ai/DiffEqDocs/stable/types/dynamical_types/#SciMLBase.SecondOrderODEProblem) is only slightly different from [`ODEProblem`](https://docs.sciml.ai/DiffEqDocs/stable/types/ode_types/)--in addition to specifying an initial value (displacement in your case), you'll pass in its initial derivative (velocity):

```julia
ODEProblem{true}(           derivative!, u0,     timespan, c, callback=cb)
SecondOrderODEProblem{true}(derivative!, u0, v0, timespan, c, callback=cb)
```

You can pass `save_on=false` and `save_start=false` to `SecondOrderODEProblem` to save time and memory at the expense of diagnostic information.



## Results

Given the improved accuracy of the iteration methods provided by `DifferentialEquations`, the answers will be a bit different--`2d-tiny-in.wo` should finish at `0.577`, `2d-small-in.wo` at `11.43`, and `2d-medium-in.wo` at `98.43`.



## Submission

You'll submit a tarball named `WaveSim.jl.tar.gz` that I'll grade exactly as I did in [phase 4](phase4.md#submission).



## Grading

This phase is worth 20 points. The following deductions, up to 20 points total, will apply for a program that doesn't work as laid out by the spec:

| Defect | Deduction |
| --- | --- |
| Failure to run correctly on `2d-medium-in.wo` in 20 seconds on `m9` | 5 points |
| Failure to run correctly on `2d-medium-in.wo` in 50 seconds on `m9` | 5 points |
| Failure of your `WaveSim.jl` to work correctly on each of 3 2-dimensional test files | 4 points each |
| `WaveSim.jl` doesn't use an external differential equation solver from `DifferentialEquations` | 1-20 points |
