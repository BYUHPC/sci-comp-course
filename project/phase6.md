---
---

# Phase 6: C++ Threads

In this assignment you'll parallelize your solver with [`std::jthread`s](../readings/jthread.md). You can use any threading paradigm you'd like, but the number of threads spawned must be constant regardless of simulation time--you may *not* spawn threads on each iteration. Functionality and performance requirements are the same as they were for the [first optimization assignment](phase3.md)--given 8 threads on a whole `m9` node, `wavesolve_thread` must run in 20 seconds on `2d-medium-in.wo`, and checkpointing must still work.

The environment variable `SOLVER_NUM_THREADS` will control how many threads are used. If it is not set or isn't a positive integer, one thread should be used.



## Division of Labor

The first choice you'll have to make is how to split work among threads. The [example code](https://github.com/BYUHPC/sci-comp-course-example-cxx/blob/main/src/MountainRangeThreaded.hpp) divides work into [evenly-sized chunks](https://github.com/BYUHPC/sci-comp-course-example-cxx/blob/main/src/utils.hpp) and assigns each thread one such chunk. Some people find it easier to split work into chunks, put these chunks on a [shared queue](https://github.com/cameron314/concurrentqueue), and have a pool of worker threads that pull chunks from said queue on each iteration. Choose whichever method makes the most sense to you--performance will be comparable assuming sane work splitting.



## Submission

Update your `CMakeLists.txt` to create `wavesolve_thread` (making sure to [compile with C++ threads](../readings/jthread.md#compiling-with-c-threads)), tag the commit you'd like me to grade from `phase6`, and push it.



## Grading

This phase is worth 20 points. The following deductions, up to 20 points total, will apply for a program that doesn't work as laid out by the spec:

| Defect | Deduction |
| --- | --- |
| Failure to compile `wavesolve_thread` | 4 points |
| Failure of `wavesolve_thread` to work on each of 3 test files | 4 points each |
| Failure of `wavesolve_thread` to checkpoint correctly | 4 points |
| Failure of `wavesolve_thread` to run on `2d-medium-in.wo` on `m9` with 8 threads in 20 seconds | 4 points |
| ...in 60 seconds | 4 points |
