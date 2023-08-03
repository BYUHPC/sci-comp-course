---
---

# Phase 2: I/O, Checkpointing, and Version Control

In this phase you'll make your wave simulation program more capable and versatile by reading from arbitrary data files to determine initial state, writing to data files to indicate final state, and implementing [checkpointing](../readings/checkpointing.md) for resilience against unexpected program termination. You'll check in your work via [git](../readings/version-control.md#git), which will make life easier for this and subsequent assignments.



## I/O

In [phase 1](basics.md), you [created and solved a specific wave plane](basics.md#the-simulation); in this assignment, you'll read in an arbitrary wave plane, solve it, and write the solved wave plane out. The input file will be specified as the first command line argument, and the output file as the second. Running it might look something like:

```shell
./wave_solve initial.dat solved.dat
```

### Data Format

The input files are binary--the bytes written there are the same literal bytes the machine uses to represent floats and integers. They aren't human-readable without translation--for example, when the double precision float 1.23 is "printed" as a Unicode string, it looks like nonsense:

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

I recommend adding a constructor and a `write` function to your class, each of which take a filename as their sole argument; see the [example code](TODO) for an idea of how to do so.

You can check whether your input and output files are correct with [`WaveSim`](TODO)--see `?WaveOrthotope` and `?write` after loading the `WaveSim` module.

TODO: explain this:

```julia
w = try
    WaveOrthotope("infile")
catch e
    print("Failed to read")
    e isa WaveSim.WaveOrthotopeException ? e : rethrow(e)
end
```

### Reading and Writing Binary in C++

I highly recommend using [`binary_io.hpp`](TODO), which I wrote specifically to alleviate the suffering of students who would otherwise have to use C++'s [terrible binary I/O](https://martincmartin.com/2015/02/02/writing-to-a-binary-stream-in-cc-harder-than-it-should-be/) without protection. Read the documentation comment at the top of `binary_io.hh` for usage.

If you insist, you can read and write manually:

```c++
// Read x from istream is:
is.read(reinterpret_cast<char *const>(&x), sizeof(x));
// Write x to ostream os:
os.write(reinterpret_cast<const char *const>(&x), sizeof(x));
```

### Resilience to Bad Data

Since this isn't a class about parsing or error handling, you aren't required to deal with bad arguments or bad data files gracefully. That said, sanity checks help with debugging; mimicking the bad input handling from the [example code](TODO) is encouraged.



## Checkpointing

In addition to the final state, the program will also write checkpoint files at regular intervals. The **interval** will be determined by the [environment variable](TODO) `INTVL`, which if it exists will be a positive value that will be parsed as a float. During the course of the solve, if the interval is set to a positive value, the simulation time of the wave orthotope after a step divided by the interval is less than 0.002 (to account for floating point imprecision), a checkpoint file should be written, unless it hasn't been stepped yet. Said file should be named `chk-<time>.dat`, where `<time>` is the simulation time formatted as 4 digits, then the decimal point, then 2 digits. The solve loop that does this might look something like:

```c++
#include <format>
// ...
while (w.energy() > stop_energy) {
    w.step();
    if (interval > 0 && w.time() / interval < 0.002) {
        auto check_file_name = std::format("chk-{:07.2f}.dat", w.time());
        w.write(check_file_name);
    }
}
```

As an example, if `INTVL` is set to `1.23` and a simulation runs for 3 seconds, two checkpoint files, `chk-0001.23.dat` and `chk-0002.46.dat`, will be created.
