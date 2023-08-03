---
---

# Phase 1: Basics

This is the first phase of the semester-long project. It serves as a good litmus test--if you struggle implementing it once you understand the problem, you're likely to flounder in the rest of the class.

The problem description can be found [here](overview.md); you'll need to read through it before understanding this assignment.



## The Assignment

Given a damping coefficient of 0.01, an initial grid of size 25x50 with [edges fixed at zero](https://en.wikipedia.org/wiki/Dirichlet_boundary_condition), displacement $$u$$ initialized to all zeros, and the interior of displacement velocity $$v$$ initialized to 0.1:

$$u_0 = \begin{bmatrix}
    0      & \dots  & 0      \\
    \vdots & \ddots & \vdots \\
    0      & \dots  & 0      \\
\end{bmatrix}$$

$$v_0 = \begin{bmatrix}
    0      & 0      & \dots  & 0      & 0      \\
    0      & 0.1    & \dots  & 0.1    & 0      \\
    \vdots & \vdots & \ddots & \vdots & \vdots \\
    0      & 0.1    & \dots  & 0.1    & 0      \\
    0      & 0      & \dots  & 0      & 0      \\
\end{bmatrix}$$

...your job is to [solve](overview.md#running-the-simulation) these initial conditions and print the simulation time to stdout followed by a newline. The answer should be 155.77; I care more about the means of getting this answer than the answer itself, though. The C++20 file (or files) you'll create will be compiled by the latest version of GCC with the following invocation:

```shell
g++ -std=c++20 -o wave_solve wave_solve.cpp
```

If you don't have access to and practice with a C++20 compiler for testing, [the supercomputer](../programming-resources.md#compilation) or an online C++ compiler such as [OnlineGDB](https://www.onlinegdb.com/online_c++_compiler) will work. For online compilers, usually you'll have to find a menu that allows you to use C++20; in the case of OnlineGDB, it's the dropdown at the upper right that says "C++".

The [skeleton class in the overview](overview.md#appendix-a-skeleton-wave-simulation-class) and the `main` below constitute a good starting point, and I recommend using them as a scaffold for your program unless you have extensive experience with modern C++.

```c++
int main() {
    // Create WaveOrthotope
    auto m = 25, n = 50;
    auto c = 0.01;
    auto w = WaveOrthotope(25, 50, 0.01);
    // TODO: set interior cells of v to 0.1
    // Solve and print result
    std::cout << w.solve() << std::endl;
    return 0;
}
```
