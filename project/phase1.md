---
---

# Phase 1: Basics

This is the first phase of the semester-long project. It serves as a good litmus test--if you struggle implementing it once you understand the problem, you're likely to flounder in the rest of the class.

The problem description can be found [here](overview.md); **you'll need to read through it before understanding this assignment**. Most students will find the [C++ resources](../resources.md#c) helpful.



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

...your job is to [solve](overview.md#running-the-simulation) these initial conditions and print the simulation time to stdout followed by a newline; nothing else should be printed to stdout, and no input should be taken. The answer should be 157.77, but I care more about the means of getting this answer than the answer itself. You'll turn in a C++20 source file named `wavesolve.cpp` and (optionally) any headers required by it.

The file(s) you create will be [compiled and run](../resources.md#compilation) by the latest version of GCC installed on the [supercomputer](https://rc.byu.edu) with the following:

```shell
module load gcc/14.1
g++ -std=c++20 -o wavesolve wavesolve.cpp
./wavesolve
```

You can test your implementation in the same way. You'll probably want to [set up VS Code](https://rc.byu.edu/wiki/index.php?page=Remote+Development+with+VS+Code) on the supercomputer to develop your code unless you're familiar with vim or emacs. If you have no experience with [Linux](../lessons/2.md), you can also [test with an online C++ compiler](../resources.md#compilation) for this assignment. Future assignments will need to be completed on the supercomputer.



## C++

We recommend following the pattern demonstratated in the [example code](https://github.com/BYUHPC/sci-comp-course-example-cxx/blob/main/src/MountainRange.hpp). A [simplified sequence diagram](https://github.com/BYUHPC/sci-comp-course-example-cxx/blob/main/docs/MountainRange-simplified-sequence-diagram.md) is available to illustrate the evaluation of the program.

If you follow the pattern of the example code to create a `WaveOrthotope` class with `solve` and `sim_time` functions and a constructor taking rows, columns, and damping coefficient, your `main` can be very simple:

```c++
#include <iostream>
#include "whatever_your_header_is_called.hpp"

int main() {
    // Create WaveOrthotope
    auto rows = 25, cols = 50;
    auto c = 0.01;
    auto w = WaveOrthotope(rows, cols, c);
    // Set interior cells of v to 0.1
    // TODO
    // Solve and print result
    w.solve();
    std::cout << w.sim_time() << std::endl;
    return 0;
}
```

The most challenging part of the assignment for most students is using [2-dimensional arrays of runtime size in C++](https://stackoverflow.com/a/32279494). I recommend using a one-dimensional `std::vector` to store your data, then using a function to pretend it's two-dimensional. Here's a simple interface class with everything you should need for this phase, including `displacement` and `velocity` functions for 2-dimensional array access:

```c++
class WaveOrthotope {
protected:
    const size_t rows, cols;  // size
    const double c;           // damping coefficient
    double t;                 // simulation time
    std::vector<double> u, v; // displacement and velocity; size is rows*cols

public:
    WaveOrthotope(auto rows, auto cols, auto damping_coefficient);

    auto &displacement(auto i, auto j) { return u[i*cols+j]; }
    auto &velocity(    auto i, auto j) { return v[i*cols+j]; }

    auto sim_time() const { return t; }

    double energy(); // optional, to be used in solve

    double step(double dt); // optional, to be used in solve

    double solve();
}

// Example velocity function usage:
auto wo = WaveOrthotope(/*...*/);
wo.velocity(1, 2) = 1.5; // set v[1, 2] to 1.5
```

No matter what you do, your life will be much easier in subsequent assignments if the data in `u` and `v` is contiguous.

Not everything in the [example mountain range class](https://github.com/BYUHPC/sci-comp-course-example-cxx/blob/main/src/MountainRange.hpp) is needed at this stage--for example, everything having to do with reading and writing files won't be relevant until the [next phase of the project](phase2.md).



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
