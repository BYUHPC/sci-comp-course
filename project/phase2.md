---
---

# Phase 2: I/O, Checkpointing, and Version Control

In this phase you'll make your [wave simulation program](overview.md) more capable and versatile by reading from arbitrary data files to determine initial state, writing to data files to indicate final state, and implementing [checkpointing](../readings/checkpointing.md) for resilience against unexpected program termination. You'll check in your work via [git](../readings/git.md) and build it with [CMake](../readings/make-and-cmake.md), which will make life easier for this and subsequent assignments.

It's a good idea to break your wave orthotope class over multiple classes in such a way that it'll be maximally useful for subsequent phases. I recommend a structure very similar to [`solver_serial` in the example code](https://github.com/BYUHPC/sci-comp-course-example-cxx#usage)--two abstract classes and one concrete one:

- `WaveOrthotope`: an abstract class containing the simulation state (damping coefficient, simulation time, displacement, and velocity) and any common utilities you find a need for
- `WaveOrthotopeSharedMem`: an abstract class inheriting from `WaveOrthotope` with I/O functionality
- `WaveOrthotopeOpenMP`: a concrete class inheriting from `WaveOrthotopeSharedMem` containing the infrastructure required to solve wave orthotopes; you'll add OpenMP functionality later



## I/O

In [phase 1](phase1.md), you created and solved a specific wave plane; in this assignment, you'll read in an arbitrary wave plane, solve it, and write the solved wave plane out. The input file will be specified as the first command line argument, and the output file as the second. Running it might look something like:

```shell
./wavesolve_serial initial.wo solved.wo
```

### Data Format

The input files are binary--the bytes written there are the same literal bytes the machine uses to represent floats and integers. They aren't human-readable without translation--for example, when the double precision float 1.23 is "printed" in binary as a Unicode string, it looks like nonsense:

```julia
julia> join(Char.(reinterpret(UInt8, [1.23])))
"®Gáz\x14®ó?"
```

The format of these files is as follows:

1. `N`: the number of dimensions as a 64-bit unsigned integer; unless you're doing the extra credit, this will always be 2.
1. `m`: the size of the wave orthotope, `N` 64-bit unsigned integers.
1. `c`: the damping coefficient, a 64-bit float.
1. `t`: the simulation time, a 64-bit float.
1. `u`: the displacement array, an array of size `m` in C array order (the first row is written/read in its entirety, then the second, etc.).
1. `v`: the velocity array, in the same format as `u`.

To make abundantly clear the order of `u` and `v`, here is a 3x4 array where elements are numbered in the order in which they would be read or written:

$$\begin{bmatrix}
    1 &  2 &  3 &  4 \\
    5 &  6 &  7 &  8 \\
    9 & 10 & 11 & 12 \\
\end{bmatrix}$$

I recommend adding a constructor and a `write` function to your class, each of which take a filename as their sole argument; see the [example C++ shared memory I/O](https://github.com/BYUHPC/sci-comp-course-example-cxx/blob/main/src/MountainRangeSharedMem.hpp) for an idea of how to do so.

You can check whether your input and output files are correct with [`WaveSim`](https://github.com/BYUHPC/WaveSim.jl)--see `?WaveOrthotope` and `?write` after loading the `WaveSim` module. You can try to read `infile.wo` gracefully thus:

```julia
w = try
    WaveOrthotope("infile.wo")
catch e
    print("Failed to read")
    e isa WaveSim.WaveOrthotopeException ? e : rethrow(e)
end
```

If there was an exception that the `WaveOrthotope` constructor is equipped to handle, `w` will be a [`WaveOrthotopeReadException`](https://github.com/BYUHPC/WaveSim.jl/blob/main/src/io.jl#L20), which will contain useful data about the nature of the read failure.

### Reading and Writing Binary in C++

I highly recommend using [`binary_io.hpp`](https://github.com/BYUHPC/simple-cxx-binary-io), which I wrote specifically to alleviate the suffering of students who would otherwise have to use C++'s [terrible binary I/O](https://martincmartin.com/2015/02/02/writing-to-a-binary-stream-in-cc-harder-than-it-should-be/) without protection.

If you insist, though, you can read and write manually:

```c++
// Read x from istream is:
is.read(reinterpret_cast<char *const>(&x), sizeof(x));
// Write x to ostream os:
os.write(reinterpret_cast<const char *const>(&x), sizeof(x));
```

### Resilience to Bad Data

Since this isn't a class about parsing or error handling, you aren't required to deal with bad arguments or bad data files gracefully. That said, sanity checks help with debugging; mimicking the bad input handling from [the](https://github.com/BYUHPC/sci-comp-course-example-cxx/blob/main/src/run_solver.hpp#L42) [example](https://github.com/BYUHPC/sci-comp-course-example-cxx/blob/main/src/MountainRange.hpp#L155) [code](https://github.com/BYUHPC/sci-comp-course-example-cxx/blob/main/src/MountainRangeSharedMem.hpp#L26) is encouraged.



## Checkpointing

In addition to the final state, the program will also write [checkpoint](../readings/checkpointing.md) files at regular intervals. The **interval** will be determined by the [environment variable](../readings/environment-variables.md) `INTVL`, which if it exists will be a positive value that will be parsed as a float. During the course of the solve, if the interval is set to a positive value, the simulation time of the wave orthotope after a step divided by the interval is less than 0.002 (to account for floating point imprecision), a checkpoint file should be written, unless it hasn't been stepped yet. Said file should be named `chk-<time>.wo`, where `<time>` is the simulation time formatted as 4 digits, then the decimal point, then 2 digits. The solve loop that does this might look something like:

```c++
#include <format>
#include <math.h>
while (w.energy() > stop_energy) {
    w.step();
    if (interval > 0 && fmod(w.time(), interval) < 0.002) {
        auto check_file_name = std::format("chk-{:07.2f}.wo", w.time());
        w.write(check_file_name);
    }
}
```

As an example, if `INTVL` is set to `1.23` and a simulation runs for 3 seconds, two checkpoint files, `chk-0001.23.wo` and `chk-0002.46.wo`, should be created.

You can read `INTVL` from the environment into a float with [`std::getenv`](https://en.cppreference.com/w/cpp/utility/program/getenv) and [`std::stof`](https://en.cppreference.com/w/cpp/string/basic_string/stof)



## CMake

You'll create a `CMakeLists.txt` to abstract the building of your `wavesolve_serial` away from the user. This will also allow you to name and organize your files however you would like, and makes grading much easier for me.

I recommend setting up tests as well. The [example `CMakeLists.txt`](https://github.com/BYUHPC/sci-comp-course-example-cxx/blob/main/CMakeLists.txt#L79) is a good example of how to do so, if a bit overwrought for this assignment; your project will grow to similar scale, though, so it's not a bad idea to mirror that setup. You can also set up [Catch2](https://github.com/catchorg/Catch2/blob/devel/docs/cmake-integration.md) if you'd like to do unit testing; `module load catch2` will make it available on the supercomputer.

Assuming you have two source files, `wavesolve_serial.cpp` and `WaveOrthotope.hpp`, a minimal `CMakeLists.txt` might look like:

```cmake
cmake_minimum_required(VERSION 3.19)
project(wavesolve CXX)

# Use C++20
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_EXTENSIONS FALSE)
set(CMAKE_CXX_STANDARD_REQUIRED TRUE)

# Build wavesolve_serial
add_executable(wavesolve_serial wavesolve_serial.cpp WaveOrthotope.hpp)
```



## Submission: Git

You'll submit your work via [git](../readings/git.md). Clone your empty repository from our homework server, replacing `netid` with your net ID:

```shell
git clone netid@homework.rc.byu.edu:scicomp
```

Put your `CMakeLists.txt` and source files in the resulting `scicomp` directory, commit, and [tag](https://git-scm.com/book/en/v2/Git-Basics-Tagging) the commit you would like me to use for grading "`phase1`."

After making sure your code looks right, I'll build it on the supercomputer with the following:

```shell
git clone YOURNETID@homework.rc.byu.edu:scicomp
cd scicomp
git checkout phase1
module load gcc/latest cmake catch2
mkdir bld
cd bld
cmake -DCMAKE_BUILD_TYPE=RelWithDebInfo ..
cmake --build . --parallel
```

I recommend doing the same when you're finished to ensure that everything is in its place within the repo.

I'll also test that the generated `wavesolve_serial` produces correct results; you should [do so](../resources.md#the-project) as well.



## Grading

This phase is worth 20 points. The following deductions, up to 20 points total, will apply for a program that doesn't work as laid out by the spec:

| Defect | Deduction |
| --- | --- |
| Failure to compile | 5 points |
| Failure to work on each of 4 test files | 2.5 points each |
| Failure to run successfully (e.g. due to a segmentation fault or hang) | 5 points |
