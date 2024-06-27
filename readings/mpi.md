---
---

# Distributed Programming and MPI



## Distributed Programming

Read [subsections 2.6.3.1-6](EijkhoutHPCTutorialsVol1.pdf#subsection.2.6.3) of Eijkhout's *Science of Computing*.



## MPI

The [Message Passing Interface (MPI)](https://en.wikipedia.org/wiki/Message_Passing_Interface) is an interface for passing data between processes using messages. It allows for **distributed memory** programming, unlike OpenMP or C++ threads which require **shared memory**; this means that an MPI program can span multiple nodes. These processes can be on the same machine or across nodes. Conventionally, MPI programs begin with a call to `MPI_Init` and end with `MPI_Finalize`. The MPI functions are defined in `mpi.h`.

```c++
#include <iostream>
#include <mpi.h>

int main(int argc, char *argv[]) {
    MPI_Init(&argc, &argv);
    int rank, size;
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_rank(MPI_COMM_WORLD, &size);
    std::cout << "Hi from process " << rank+1 << " of " << size+1 << std::endl;
    MPI_Finalize();
    return 0;
}
```

Many modern C++ programs (including the [example code](https://github.com/BYUHPC/sci-comp-course-example-cxx/blob/main/src/MountainRangeMPI.hpp)) use [MPL](https://github.com/rabauke/mpl), which provides a more idiomatic C++ interface to MPI. Among other conveniences, it doesn't require initialize and finalize calls:

```c++
#include <iostream>
#include <mpl/mpl.hpp>

int main(int argc, char *argv[]) {
    auto rank = mpl::environment::comm_world().rank();
    auto size = mpl::environment::comm_world().size();
    std::cout << "Hi from process " << rank+1 << " of " << size+1 << std::endl;
    return 0;
}
```

To use `MPL` on the supercomputer, use `module load mpl`.

Since MPI is such a broad topic, we'll only cover the basics here. Idiomatic style has been sacrificed for clarity and simplicity in some cases, so if you know a better way, feel free to use it.

## Compilation

With most MPI compilers, you can use `mpic++` in the place of a C++ compiler like `g++` to compile MPI C++ code:

```shell
module load gcc/14.1 openmpi/5.0 # and maybe mpl
mpicxx -std=c++20 -o myprog myprog.cpp
```

The partial `CMakeLists.txt` below will build an MPI program only if the MPI compiler for C++ is found; this allows building the other executables even if MPI isn't available. 

```cmake
cmake_minimum_required(VERSION 3.9)
find_package(MPI)
if(MPI_CXX_FOUND)
    find_package(mpl REQUIRED) # if you're using MPL
    add_executable(hello hello.cc)
    target_link_libraries(hello PRIVATE MPI::MPI_CXX)
    target_link_libraries(hello PRIVATE mpl::mpl) # if you're using MPL
endif()
```

Read [chapter 1](EijkhoutHPCTutorialsVol2.pdf#chapter.1) and [sections 2.3-2.5](EijkhoutHPCTutorialsVol2.pdf#section.2.3) Eijkhout's *Parallel Programming*.

## Finding Documentation

There is enough breadth to MPI that we couldn't cover it all even if we dedicated the entire semester to doing so, which means that knowing how to find documentation on what we don't explicitly cover is vital--being able to quickly look up a function that we mention in a video can help you understand it better, and using a different approach than the [example code](https://github.com/BYUHPC/sci-comp-course-example-cxx/blob/main/src/MountainRangeMPI.hpp) might take you into territory that we haven't talked about. Unfortunately, the documentation situation for both MPI and MPL is bleak.

### MPL

[MPL's documentation](https://rabauke.github.io/mpl/html/index.html) is centralized, but there doesn't seem to be any high-level information that discusses the idiomatic approach to problems in prose--rather, functions are documented and [examples](https://rabauke.github.io/mpl/html/examples/index.html) are provided. The example that seems most related to the problem at hand is, unfortunately, as good as you'll get.

### MPI

As is often the case, the `man` pages are a good place to start. Once you have a compiler and MPI module loaded (e.g. `gcc/14.1` and `openmpi/5.0`), you can run `man 3 MPI_Function_name` to get the details on that function. For example, to find out more about `MPI_Allreduce`, you could use `module load gcc/14.1 openmpi/5.0; man 3 MPI_Allreduce`. You can also take advantage of your shell's tab completion to get a full listing of all available MPI functions by typing `man 3 MPI_` then pressing the tab key.

[Online documentation](https://www.open-mpi.org/doc/current/) is also available but generally contains no more information than do the `man` pages. [Microsoft's online MPI documentation](https://docs.microsoft.com/en-us/message-passing-interface/mpi-reference) is reasonably well organized and concise (partly because it doesn't include Fortran information), although it is possible that there are subtle differences between it and OpenMPI, MPICH, etc. When you know a function name or have an idea of what it might be called, `man` pages and online documentation should be the first place you turn.

Not knowing the name of the function that you are looking for, though, renders said documentation a vast sea of (often poorly organized) information in which you need to find a small drop of truth. As you get more familiar with MPI, you'll be able to find a handful of functions that look right and see which one is suited for what you want to do, but until then the best way to quickly find what you're looking for is usually to search something along the lines of "How to ____ with MPI" and try to pick a recent, relevant result.

## Communication

The central object of inter-process communication with MPL is a [communicator](https://rabauke.github.io/mpl/html/communicator.html). For most HPC problems, the world communicator (which contains all processes) is what you'll want:

```c++
auto comm_world = mpl::environment::comm_world();
```

Sends and receives are [tagged](https://rabauke.github.io/mpl/html/tags.html) to differentiate between communications. To exchange data between each pair of even and odd processes, one would need two tags:

```c++
auto even_tag = mpl::tag_t{0};
auto odd_tag  = mpl::tag_t{1};
```

[`send` and `recv`](https://rabauke.github.io/mpl/html/communicator.html) pass data between processes; `sendrecv` does both at once, and prepending `i` to a function name makes it execute asynchronously. Given the `comm_world`, `even_tag`, and `odd_tag` above, exchanging rank numbers between pairs of even and odd process can be done thus:

```c++
auto process_rank = comm_world.rank();
auto world_size = comm_world.size();
bool am_odd_process = rank%2;
auto partner = am_odd_process ? process_rank-1 : process_rank+1;

if (partner < world_size) { // don't try exchanging with non-existent process
    int send_data = process_rank;
    int recv_data; // don't need to set, sendrecv will update it

    auto process_tag = am_odd_process ? odd_tag : even_tag;
    auto partner_tag = am_odd_process ? even_tag : odd_tag;

    comm_world.sendrecv(send_data, partner, process_tag,
                        recv_data, partner, partner_tag);

    std::cout <<   "My rank: "      << rank
              << "; partner rank: " << partner_rank << std::endl;
}
```

Sending a non-integral type is accomplished with [data layouts](https://rabauke.github.io/mpl/html/layouts.html). For example, sending the last 15 elements of the vector `v` (of `double`s) to the process `partner` might look like:

```c++
auto layout = mpl::vector_layout<double>(15);
comm_world.send(v.data()+v.size()-15, layout, partner);
```

## Reduction

[Reductions](https://rabauke.github.io/mpl/html/reduction_operations.html) are simple with MPL. To sum `a` from [all processes](https://rabauke.github.io/mpl/html/communicator.html#_CPPv4I00ENK3mpl12communicator9allreduceEv1FR1T):

```c++
auto a = whatever();
decltype(a) global_a; // result is stored here
comm_world.allreduce([](auto x, auto y){ return x+y; }, a, global_a);
```

The first argument to `reduce` or `allreduce` is a function that takes two arguments--in this case, `[](auto x, auto y){ return x+y; }` to perform a sum. Reductions can optionally take a layout just like the sending and receiving function.

## I/O

File I/O is done with [`mpl::file`](https://rabauke.github.io/mpl/html/file.html). To open the file `myfile` for reading:

```c++
auto f = mpl::file(comm_world, "myfile", mpl::file::access_mode::read_only);
```

Operations with `all` in their names will perform the same operation across all processes. For example, to read an `int32_t` from the beginning of `f` into the variable `h` in each process:

```c++
int32_t h;
f.read_all(h);
```

A single process can read or write any number of bytes starting at a specific spot in a file, given as an offset from the beginning of the file in bytes. To write the first 100 elements of the `std::vector` of `float`s `v`, starting at 400*`process_rank` bytes into the file, one can use:

```c++
size_t offset = 400 * comm_world.rank();
auto layout = mpl::vector_layout<float>(100);
f.write_at(offset, v.data(), layout);
```

Errors related to an `mpl::file` will throw an [`mpl::io_failure`](https://rabauke.github.io/mpl/html/file.html#error-handling), which can be caught and printed:

```c++
try {
    return mpl::file(comm_world, "notafile", mpl::file::access_mode::write_only);
} catch (const mpl::io_failure &e) {
    std::cerr << e.what() << std::endl;
}
```