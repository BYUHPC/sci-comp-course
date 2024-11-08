---
---

# Phase 7: MPI

In this assignment you'll parallelize your solver with [MPI](../readings/mpi.md). You can use [MPL](https://github.com/rabauke/mpl) [like in the example code](https://github.com/BYUHPC/sci-comp-course-example-cxx/blob/main/src/MountainRangeMPI.hpp), or the C bindings if you're more familiar with them.

Performance requirements are less stringent than in previous phases to account for inter-node communication--the program must run on `2d-medium-in.wo` in 30 seconds given 4 processes on one full `m9` node and 4 processes on another. In a job with two full `m9` nodes, you can launch 4 processes per node with:

```shell
mpirun --npernode 4 wavesolve_mpi ...
```

**This phase is significantly more challenging than previous phases for most students**. I strongly recommend that you break it into two steps:

1. Get your I/O working--make an MPI program that reads in a [wave orthotope file](phase2.md#data-format) with [MPI I/O](../readings/mpi.md#io), prints the header and any other debug information you need, and writes back out an identical file with MPI I/O
1. Once the I/O is working, figure out the [exchange of halos](#division-of-labor) and your `solve` function

When you run with multiple processes, **put your output files in `~/nobackup/archive`**--NFS (the rest of your home directory) is astonishingly slow to allow MPI I/O writes.

Load `gcc/14.1` and `openmpi/5.0` to get access to a recent MPI compiler, and `mpl` to use MPL.



## Division of Labor

Much as in the [previous phase](phase6.md), you'll split work roughly evenly among processes. I recommend an approach similar to in the [example code](https://github.com/BYUHPC/sci-comp-course-example-cxx/blob/main/src/MountainRangeMPI.hpp), with each process being in charge of about $$\frac{R}{N}$$ whole rows (where $$R$$ is the number of rows and $$N$$ is the number of processes). Block partitioning is more efficient from a communications standpoint, but is harder to implement.

Since updating a cell of `u` requires data from the rows above and below it, the processes will need to store [ghost rows](https://sites.cs.ucsb.edu/~gilbert/cs140resources/notes/GhostCells.pdf) and exchange them on each iteration (see `exchange_halos` in the [example code](https://github.com/BYUHPC/sci-comp-course-example-cxx/blob/main/src/MountainRangeMPI.hpp)).

## Recommended Development Process

1. Disable (comment out) wave solving.
    1. For each of the following steps, 
    1. verify correctness of a single node **and**
    1. verify correctness on multiple nodes with multiple processes (2 nodes x 4 processes each)
    1. Verify that header data can be read in properly using MPI
1. Read in the header data 
    1. COUT the results to the screen
    1. Verify correctness
1. Check that **all** data can be read and written properly using MPI (without halos)
    1. Read the header data and vector data from MPI
    1. Write the results
    1. Manually inspect the result with `waveshow` or `wavediff`
1. Check that **all** data can be read and written properly using MPI (with halos)
    1. Read the header data and vector data from MPI
    1. Fill in the appropriate U/V rows with halos with the **rank** of the current process
    1. Write the results
    1. Manually inspect the result with `waveshow` or `hexdump`
    1. By visualizing the rank, you can verify:
        1. Each process is writing to only the rows it should
        1. Halo rows are not appearing in the result
1. Check your code for actual functionality
    1. Remove the code that populates junk values
    1. Verify that the result is saved properly
1. Check your wave energy
    1. Find the energy of the initial wave
    1. Print out the result
    1. Verify correctness
1. Check your wave solve
    1. Reenable wave solving 
    1. Hardcode the program to solve only a single iteration
    1. Perform another version of your program to solve a single iteration (`wavesolve_threaded` or `wavesolve_original`)
    1. Manually inspect the result with `waveshow` or `wavediff` 
    1. Verify correctness
1. Try solving the entire wave
    1. Compare results with the answer files (`wavefiles/*D/*-out.wo` files) using `wavediff`
1. If some end result is not correct, consider the following resources:
    1. Try increasing the solve limit to solve 2 iterations, then 4…
    1. Watch this video on [Debugging MPI](https://youtu.be/SGo3Aqz_54o)

## Submission

Update your `CMakeLists.txt` to create `wavesolve_mpi` (making sure to [compile with MPI](../readings/mpi.md#compilation)), develop in a branch named `phase7` or tag the commit you'd like me to grade from `phase7`, and push it.



## Grading

This phase is worth 30 points. The following deductions, up to 30 points total, will apply for a program that doesn't work as laid out by the spec:

| Defect | Deduction |
| --- | --- |
| Failure to compile `wavesolve_mpi` | 5 points |
| Failure of `wavesolve_mpi` to work on each of 3 test files | 5 points each |
| Failure of `wavesolve_mpi` to checkpoint correctly | 5 points |
| Failure of `wavesolve_mpi` to run on `2d-medium-in.wo` on two `m9` nodes with 4 threads each in 30 seconds | 5 points |
| ...in 60 seconds | 5 points |
| `wavesolve_mpi` isn't an MPI program, or doesn't distribute work evenly among processes | 1-30 points |
