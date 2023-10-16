---
---

# Phase 6: C++ Threads

In this assignment you'll parallelize your solver with [`std::jthread`s](../readings/jthread.md). You can use any threading paradigm you'd like (e.g. pushing work onto a [shared queue](https://github.com/cameron314/concurrentqueue) instead of following the [example code](https://github.com/BYUHPC/sci-comp-course-example-cxx/blob/main/src/MountainRangeThreaded.hpp)), but the number of threads spawned must be a low, constant number regardless of simulation time--you may *not* spawn threads on each iteration. Functionality and performance requirements are the same as they were for the [first optimization assignment](phase3.md)--given 8 threads on a whole `m9` node, `wavesolve_thread` must run in 20 seconds on `2d-medium-in.wo`, and checkpointing must still work.



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
