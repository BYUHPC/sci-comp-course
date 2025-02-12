---
---

# Phase 4: Julia Optimization

This project is meant to help you see that optimization is different (sometimes dramatically so) in every language--**what you learned in the last phase was "the basics of optimizing C++," not "how to optimize."** The guiding principles (using efficient algorithms, vectorizing, eliminating unnecessary work, etc.) remain the same, but the method of implementing them varies widely. Since you have at least a bit of [experience](phase3.md), this phase will be more open-ended than the last.

Your job is to make [WaveSim.jl](https://github.com/BYUHPC/WaveSim.jl) faster while keeping it correct. Specifically, solving `2d-medium-in.wo` should complete in less than 60 seconds on an `m9` node:

```julia
# Read in the 2D wave orthotope files from wavefiles.tar.gz
using WaveSim
tiny2din, small2din, medium2din = (WaveOrthotope(wavefiles(2, s, :in))
                                   for s in (:tiny, :small, :medium));
solve!(tiny2din); # compile
@time solve!(medium2din); # should be under 60s
```

## Setting up Julia

In a shell on the supercomputer, run `module load julia; module save`. That will make the most recent Julia available by default when you login from a terminal.

Julia integrates nicely with VSCode. We have the Julia extension installed on the supercomputer, so if you are using the `Remote Explorer` extension and connected to our system, you can use it without downloading anything. Make sure you are in the WaveSim.jl directory (not just in the terminal, but the only thing open)! Once there, you can **[run the REPL via the extension](https://github.com/julia-vscode/julia-vscode/wiki/REPL) with Alt+j, Alt+o or via the [command pallette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette)**. The instructions in the rest of this assignment assume you launch the REPL thus.

## Downloading and Using a Modified WaveSim.jl

`git clone https://github.com/BYUHPC/WaveSim.jl.git` will download the `WaveSim.jl` [package](https://pkgdocs.julialang.org/v1/) to your current directory. [Open that directory in VS Code](https://code.visualstudio.com/docs/editor/workspaces#_how-do-i-open-a-vs-code-workspace) and [launch the REPL](#setting-up-julia). Activate [package mode](https://docs.julialang.org/en/v1/stdlib/REPL/#Pkg-mode) by typing `]`, and then run `activate .` (if you aren't in the `WaveSim` environment). If this is your first time running, `instantiate` will download most of the dependencies; you only need to `instantiate` once to download. That done, you can use `WaveSim`:

```julia
using WaveSim # this will now load the WaveSim.jl in this directory
w = WaveOrthotope(wavefiles(2, :small, :in))
@profview solve!(w);
```

I strongly recommend using [`Revise`](https://timholy.github.io/Revise.jl/stable/) by [default](https://timholy.github.io/Revise.jl/stable/config/#Using-Revise-by-default)--it will enable you to test changes that you make live. Otherwise, you'll need to [quit Julia](https://docs.julialang.org/en/v1/base/base/#Base.exit), [re-launch the REPL](#setting-up-julia), and run again to see your changes reflected there.

There is [extra credit](../assignments/extra-credit.md#project) available for this phase, but you'll likely need do a [future reading assignment](../readings/julia-part-two.md) about Julia's syntax in order to understand what's happening. The only files you'll need to modify are [`energy.jl`](https://github.com/BYUHPC/WaveSim.jl/blob/main/src/energy.jl) and [`solve.jl`](https://github.com/BYUHPC/WaveSim.jl/blob/main/src/step.jl) to get the extra credit.

If you opt not to do the extra credit, you'll need to modify the default `implementation` from `ND` to `2D` in [`WaveSim.jl`](https://github.com/BYUHPC/WaveSim.jl/blob/main/src/WaveSim.jl). After that, only [`energy_2d.jl`](https://github.com/BYUHPC/WaveSim.jl/blob/main/src/energy_2d.jl) and [`solve_2d.jl`](https://github.com/BYUHPC/WaveSim.jl/blob/main/src/step_2d.jl) will need to be altered.

For most students, optimizing in 2 dimensions will be significantly easier.

## Performance in Julia

As mentioned in the [resources](../resources.md#julia), Julia's [performance tips page](https://docs.julialang.org/en/v1/manual/performance-tips/) has everything most users will need to squeeze performance out of Julia. Use [`@profview`](https://github.com/timholy/ProfileView.jl) liberally to see where time is being taken; if you're using VS Code, you don't need to install `ProfileView` since the Julia extension includes a custom `@profview`.

### Eliminating Unnecessary Work

By default, Julia does bound checking to avoid segmentation faults. You can wrap expressions (e.g. functions, while loops, for loops, etc.) with [`@inbounds`](https://docs.julialang.org/en/v1/base/base/#Base.@inbounds) to prevent bounds checking, but be aware that you are promising that the block following won't attempt out-of-bounds memory access.

Julia [allows dynamic typing](https://docs.julialang.org/en/v1/manual/types/); this is convenient, but causes severe performance problems when a variable's type changes. [Avoid changing the types of variables](https://docs.julialang.org/en/v1/manual/performance-tips/#Avoid-changing-the-type-of-a-variable); you can track down such changes with [`@code_warntype`](https://docs.julialang.org/en/v1/manual/performance-tips/#man-code-warntype). You may notice that one member of `WaveOrthotope`, `t`, will trigger warnings--don't worry about it, it has a negligible performance impact in this particular case. You'll need to call the "base" function for `@code_warntype` to give meaningful output--e.g. `@code_warntype energy(w, :total)` will give lots of information while `@code_warntype energy(w)` will not.

Unneeded allocations are harder to track down and eliminate in Julia than they are in C++; you can use [`julia --track-allocation=user`](https://docs.julialang.org/en/v1/manual/profile/#Line-by-Line-Allocation-Tracking) for thorough tracking, or see how many allocations a function commits with [`@time`](https://docs.julialang.org/en/v1/manual/profile/#@time).

### Vectorization

Along with the usual need to iterate in memory order (**which is [opposite of C++](https://docs.julialang.org/en/v1/manual/performance-tips/#man-performance-column-major)**) and remove branches from inner loops, you can help Julia vectorize with [`@simd` and `@fastmath`](https://docs.julialang.org/en/v1/manual/performance-tips/#man-performance-annotations).



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
        solve!(WaveOrthotope(wavefiles(2, :tiny, :in))) # compile
        @time solve!(WaveOrthotope(wavefiles(2, :medium, :in)))"'
```

You should do so as well to ensure that it works as intended. Note that you can request less resources to hasten job submission (e.g. `--mem 2G -N 1 -n 1`)--if your code runs fast enough when sharing resources, it'll run fast enough when it has a node to itself.



## Grading

This phase is worth 20 points. The following deductions, up to 20 points total, will apply for a program that doesn't work as laid out by the spec:

| Defect | Deduction |
| --- | --- |
| Failure to run correctly on `2d-medium-in.wo` in 60 seconds on `m9` | 5 points |
| Failure to run correctly on `2d-medium-in.wo` in 120 seconds on `m9` | 5 points |
| Failure of your `WaveSim.jl` to work correctly on each of 3 2-dimensional test files | 4 points each |
