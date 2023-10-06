---
---

# OpenMP Threading

[OpenMP](https://www.openmp.org/) is an API for multi-platform, shared-memory, parallel programming in C, C++, and Fortran. OpenMP commands take the form of special comments called pragmas. Threads will spawn where instances of `#pragma omp parallel` are.

```c++
// There's a race condition here, we'll talk about it below
#pragma omp parallel for
for (long i{0}; i < 20'000'000l; ++i) {
   counter += 1;
}
```

If a compiler doesn't understand OpenMP's special comments, then this code will still compile and will run on a single thread. If it does understand OpenMP, then where the OMP parallel directive is, this will spawn threads for the next block. This allows serial and parallel code to be generated from the same program with very little effort.

[HPC Tutorials volume 1 has an OpenMP section](EijkhoutHPCTutorialsVol1.pdf#subsection.2.6.2) that you can reference for further information if you'd like.



## Compiling with OpenMP

`g++ -fopenmp ...` will compile with OpenMP; it's usually easy to find the required flag on the `man` page or the internet for any compiler. `CMakeLists.txt` requires two things: finding OpenMP, and linking it to a target:

```cmake
find_package(OpenMP REQUIRED)
add_executable(blah blah.cpp)
target_link_libraries(blah PRIVATE OpenMP::OpenMP_CXX)
```



## Running with OpenMP

`export OMP_NUM_THREADS=N` (where `N` is some integer) will set the number of threads that OpenMP programs run with. Otherwise, OpenMP programs are executed just as any other would be.



## Directives

The most useful [directives](https://www.openmp.org/spec-html/5.1/openmpch2.html#x30-290002) (which come after `#pragma omp`) are:

- [`parallel`](https://www.openmp.org/spec-html/5.1/openmpse14.html#x59-590002.6): create a team of OpenMP threads that execute a region
- [`for`](https://www.openmp.org/spec-html/5.1/openmpsu73.html#x103-1130002.16.1): create a parallel for loop
- [`barrier`](https://www.openmp.org/spec-html/5.1/openmpsu100.html#x133-1430002.19.2): create an explicit barrier; there are implied barriers at the end of `for`, `parallel`, and `single` blocks, which can be removed with [`nowait`](https://www.openmp.org/spec-html/5.2/openmpse94.html)
- [`atomic`](https://www.openmp.org/spec-html/5.1/openmpsu105.html#x138-1480002.19.7): ensure that a specific storage location is accessed atomically
- [`critical`](https://www.openmp.org/spec-html/5.1/openmpsu100.html#x133-1430002.19.2): restrict execution of a block to a single thread at a time
- [`single`](https://www.openmp.org/spec-html/5.1/openmpsu43.html#x67-670002.10.2): specify that a block is executed by only one thread
- [`simd`](https://www.openmp.org/spec-html/5.1/openmpsu49.html#x74-750002.11.5): indicate that a loop can be vectorized



## Reductions

Reductions use the commutative property of an operation to be able to parallelize those operations by doing them out of order. For example, the following two problems are equivalent:

$$1 + 2 + 3 + 4 + 5 + 6 = 21$$

$$4 + 1 + 3 + 2 + 6 + 5 = 21$$

Because of that, we could have thread A do the sum of 1, 2, and 3 and thread B do the sum of 4, 5, and 6, then sum the results of both threads. Only that last sum, the one where the sums of threads A and B are added together will need to be synchronized. 

OpenMP comes with these built-in reduction operators in C and C++:

|                |     |      |     |       |       |
| ---            | --- | ---  | --- | ---   | ---   |
| **Arithmetic** | `+` | `*`  | `-` | `min` | `max` |
| **Logical**    | `&` | `&&` | `|` | `||`  | `^`   |

The race condition in the [first example](#openmp-threading), which results from multiple threads trying to simultaneously modify `counter`, can be fixed with a sum reduction:

```c++
#pragma omp parallel for reduction(+:counter)
for (long i{0}; i < 20'000'000l; ++i) {
   counter += 1;
}
```
