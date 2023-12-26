---
---

# Phase 4: Julia Optimization

This project is meant to help you see that optimization is different (sometimes dramatically so) in every language--**what you learned in the last phase was "the basics of optimizing C++," not "how to optimize."** The guiding principles (using efficient algorithms, vectorizing, eliminating unnecessary work, etc.) remain the same, but the method of implementing them varies widely. Since you have at least a bit of [experience](phase3.md), this phase will be more open-ended than the last.

Your job is to make [WaveSim.jl](https://github.com/BYUHPC/WaveSim.jl) faster while keeping it correct. Specifically, solving `2d-medium-in.wo` with it should complete in less than 50 seconds on an `m9` node:

```julia
# Run this in the julia interpreter: `module load julia; julia`
# Read in the 2D wave orthotope files from wavefiles.tar.gz
using WaveSim
tiny2din, small2din, medium2din = (WaveOrthotope(open(wavefiles(2, s, :in)))
                                   for s in (:tiny, :small, :medium));
# Compile on 2d-tiny-in.wo
@time solve!(tiny2din);
# Time solve on 2d-medium-in.wo
@time solve!(medium2din); # should be under 50s
```

Depending on whether you want to try for the [extra credit](../assignments/extra-credit.md#project), you'll need to modify [`energy_2d.jl`](https://github.com/BYUHPC/WaveSim.jl/blob/main/src/energy_2d.jl) and [`solve_2d.jl`](https://github.com/BYUHPC/WaveSim.jl/blob/main/src/step_2d.jl) (2D) or [`energy.jl`](https://github.com/BYUHPC/WaveSim.jl/blob/main/src/energy.jl) and [`solve.jl`](https://github.com/BYUHPC/WaveSim.jl/blob/main/src/step.jl) (ND). You'll also need to **change the default `implementation` in [`WaveSim.jl` itself](https://github.com/BYUHPC/WaveSim.jl/blob/main/src/WaveSim.jl) from `ND` to `2D` if you are going to use the 2D files**. You can modify any other files you like as well, but you won't need to do so to attain the required performance.

For most students, optimizing in 2 dimensions will be significantly easier.



## Setting up Julia

In a shell on the supercomputer, run `module restore; module load julia; module save`. That will make the most recent Julia available by default, which will enable VS Code to use it.

Julia integrates nicely with VS Code; you can do without, but you'll need to do some extra work (e.g. [using viz](https://viz.rc.byu.edu:3443/) and specifying [`--project`](https://docs.julialang.org/en/v1/manual/command-line-interface/#command-line-interface-1)). [Install](https://code.visualstudio.com/learn/get-started/extensions) and [enable](https://code.visualstudio.com/docs/editor/extension-marketplace#_enable-an-extension) the [Julia extension](https://code.visualstudio.com/docs/languages/julia) on the [supercomputer](https://rc.byu.edu/wiki/index.php?page=Remote+Development+with+VS+Code). That done, you can **[run the REPL via the extension](https://github.com/julia-vscode/julia-vscode/wiki/REPL) with Alt+j, Alt+o or via the [command pallette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette)**. The instructions in the rest of this assignment assume you launch the REPL thus.



## Downloading and Using a Modified WaveSim.jl

`git clone https://github.com/BYUHPC/WaveSim.jl.git` will download the `WaveSim.jl` [package](https://pkgdocs.julialang.org/v1/) to your current directory. If you're using the 2D implementation, change `implementation`'s default in `src/WaveSim.jl` from `ND` to `2D`. [Open that directory in VS Code](https://code.visualstudio.com/docs/editor/workspaces#_how-do-i-open-a-vs-code-workspace) and [launch the REPL](#setting-up-julia). Activate [package mode](https://docs.julialang.org/en/v1/stdlib/REPL/#Pkg-mode) by typing `]`, then run `activate .` (if the listed package isn't already `WaveSim`) followed by `instantiate`; you only need to `instantiate` once, and `WaveSim` should be active by default. That done, you can use `WaveSim`:

```julia
using WaveSim # this will now load the WaveSim.jl in this directory
w = WaveOrthotope(open(wavefiles(2, :small, :in)))
@profview solve!(w);
```

I strongly recommend using [`Revise`](https://timholy.github.io/Revise.jl/stable/)--it will enable you to test changes that you make live. Otherwise, you'll need to [quit Julia](https://docs.julialang.org/en/v1/base/base/#Base.exit), [re-launch the REPL](#setting-up-julia), and run again to see your changes reflected there.



## Performance in Julia

As mentioned in the [resources](../resources.md#julia), Julia's [performance tips page](https://docs.julialang.org/en/v1/manual/performance-tips/) has everything most users will need to squeeze performance out of Julia. Use [`@profview`](https://github.com/timholy/ProfileView.jl) liberally to see where time is being taken; if you're using VS Code, you don't need to install `ProfileView` since the Julia extension includes a custom `@profview`.

### Eliminating Unnecessary Work

By default, Julia does bound checking to avoid segmentation faults. You can wrap expressions (e.g. functions, while loops, for loops, etc.) with [`@inbounds`](https://docs.julialang.org/en/v1/base/base/#Base.@inbounds) to prevent bounds checking, but be aware that you are promising that the block following won't attempt out-of-bounds memory access.

Julia [allows dynamic typing](https://docs.julialang.org/en/v1/manual/types/); this is convenient, but causes severe performance problems when a variable's type changes. [Avoid changing the types of variables](https://docs.julialang.org/en/v1/manual/performance-tips/#Avoid-changing-the-type-of-a-variable); you can track down such changes with [`@code_warntype`](https://docs.julialang.org/en/v1/manual/performance-tips/#man-code-warntype). You may notice that one member of `WaveOrthotope`, `t`, will trigger warnings--don't worry about it, it has a negligible performance impact in this particular case. You'll need to call the "base" function for `@code_warntype` to give meaningful output--e.g. `@code_warntype energy(w, :total)` will give lots of information while `@code_warntype energy(w)` will not.

Unneeded allocations are harder to track down and eliminate in Julia than they are in C++; you can use [`julia --track-allocation=user`](https://docs.julialang.org/en/v1/manual/profile/#Line-by-Line-Allocation-Tracking) for thorough tracking, or see how many allocations a function commits with [`@time`](https://docs.julialang.org/en/v1/manual/profile/#@time).

### Vectorization

Along with the usual need to iterate in memory order (**which is [opposite of C++](https://docs.julialang.org/en/v1/manual/performance-tips/#man-performance-column-major)**) and remove branches from inner loops, you can help Julia vectorize with [`@simd`](https://docs.julialang.org/en/v1/manual/performance-tips/#man-performance-annotations) and [`@fastmath`](https://docs.julialang.org/en/v1/manual/performance-tips/#man-performance-annotations).



## Submission

You'll submit a tarball named `WaveSim.jl.tar.gz` containing a modified `WaveSim.jl` directory at the top level--when I run `tar tf WaveSim.jl.tar.gz | head -n 1` on it, I should see `WaveSim.jl/`. I'll test its speed thus:

```shell
# Extract your package
tar xf WaveSim.jl.tar.gz
cd WaveSim.jl
# Instantiate your package and force download of wavefiles.tar.gz
julia --project=. -e "using Pkg; Pkg.instantiate(); using WaveSim; wavefiles()"
# Time within a job on an m9 node
sbatch -t 10 --mem 16G -N 1 -n 28 -p m9 --wrap 'julia --project=. -e \
       "using WaveSim
        solve!(WaveOrthotope(wavefiles(2, :tiny, :in)))
        @time solve!(WaveOrthotope((wavefiles(2, :medium, :in)))"'
```

You should do so as well to ensure that it works as intended. Note that you can request less resources to hasten job submission (e.g. `--mem 2G -N 1 -n 1`)--if your code runs fast enough when sharing resources, it'll run fast enough when it has a node to itself.



## Grading

This phase is worth 20 points. The following deductions, up to 20 points total, will apply for a program that doesn't work as laid out by the spec:

| Defect | Deduction |
| --- | --- |
| Failure to run correctly on `2d-medium-in.wo` in 50 seconds on `m9` | 5 points |
| Failure to run correctly on `2d-medium-in.wo` in 100 seconds on `m9` | 5 points |
| Failure of your `WaveSim.jl` to work correctly on each of 3 2-dimensional test files | 4 points each |
