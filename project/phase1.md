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

...your job is to [solve](overview.md#running-the-simulation) these initial conditions and print the simulation time to stdout followed by a newline. The answer should be 157.77, but I care more about the means of getting this answer than the answer itself. You'll turn in a C++20 source file named `wavesolve.cpp` and (optionally) any headers required by it.

The file(s) you create will be [compiled and run](../resources.md#compilation) by the latest version of GCC installed on the [supercomputer](../assignments/get-account.md) with the following:

```shell
module load gcc/latest
g++ -std=c++20 -o wavesolve wavesolve.cpp
./wavesolve
```

You can test your implementation in the same way. You'll probably want to [set up VS Code](../resources.md#programming) on the supercomputer to develop your code unless you're familiar with vim or emacs. If you have no experience with [Linux](../lessons/2-linux.md), you can also [test with an online C++ compiler](../resources.md#compilation).

The [skeleton class in the overview](overview.md#appendix-b-skeleton-wave-simulation-class) and the `main` below constitute a good starting point, and I recommend using them as a scaffold for your program unless you have extensive experience with modern C++. There's not much need to worry about the [example code](https://github.com/BYUHPC/sci-comp-course-example-cxx) for this phase; it'll be more useful for structuring subsequent phases.

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



## Submission

Submit your `wavesolve.cpp` and any associated headers on [Canvas](https://byu.instructure.com/courses/21221/assignments/810940).



## Grading

This phase is worth 20 points. The following deductions, up to 20 points total, will apply for a program that doesn't work as laid out by the spec:

| Defect | Deduction |
| --- | --- |
| Failure to compile | 5 points |
| Failure to output a result between 157 and 158 | 2 points |
| Failure to output exactly 157.77 | 3 points |
| Failure to run successfully (e.g. due to a segmentation fault or hang) | 5 points |
| Code isn't relevant to the assignment, or just prints "157.77" or similar | 20 points |

As an example, code that looks about right but fails to compile would receive 5 points--deductions for failure to compile, failure to run successfully, and failure to output a correct result all apply.
