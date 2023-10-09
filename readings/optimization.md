---
---

# Optimization

First, read [this article](http://gameprogrammingpatterns.com/data-locality.html). **This is probably the best reading you'll come across in this class.** The specifics of game programming aren't important, but coming away with an understanding of how hardware realities force us to use data-oriented programming for performance is critical.

Now that you've read that, a few words of advice before we talk about specific optimizations for programs:

- Measure, measure, measure! Attempting to optimize code without knowing how it impacts performance is a misguided effort at best. Document it well and make sure you can easily go back to this version for future tests if you need them. 
- Do not *assume* that something is faster.
- Don't spend 14 hours to get your runtime down to 2:50 from 2:55 unless it's running *a lot*.
- Do not sacrifice code correctness. If you can prove that the error introduced is acceptable and within bounds, then maybe you can do it. This also means you should not optimize a piece of code until it can be considered functional. As an example, sometimes you can add a fast math flag when you compile, but you might end up using single-precision floats when you need doubles. 
- Always recheck correctness when optimizing. Whenever you change your program, you should check it again for correctness. This is why unit tests are necessary for anything but a trivial project. 
- Almost everything is a trade-off. Be aware that optimizing something for runtime performance will often make it worse in some other way. Maybe the code is easier to break or is more difficult to read. Maybe it means that if there are changes to features in the future, it will be more difficult to change. Don't make your code brittle if you can help it. 




## Methods

### Compiler Optimization

The easiest way to optimize when writing in a compiled language is to let the compiler do it for you. The compiler can't fix stupid--you have to give it something reasonable to work with--but it can help a lot.

In compiled languages, it's best to think of your code as a rough guide for the compiler. The compiler is free to eliminate redundancies and inefficiencies as long as the results are identical to your described algorithm. The more rich and abstract your description of what you want, the more freedom the compiler has to make it fast. As an example, using [`std::transform`](https://en.cppreference.com/w/cpp/algorithm/transform) rather than a for loop that does the same thing is usually a better idea since it's giving a higher level description of what the code is meant to accomplish.

In `g++` (and most compilers on Linux), you can use `-O` (the letter, not the number) to specify an optimization level when compiling:

```shell
g++ -O3 -o myprogram main.cpp
```

You can use `-DCMAKE_BUILD_TYPE=release` to build optimized binaries with CMake:

```shell
cmake -DCMAKE_BUILD_TYPE=release /path/to/dir/with/cmakelists/
```

### Algorithm

Make sure your algorithm is efficient--for example, don't [use bubble sort over quicksort](https://www.youtube.com/watch?v=ZZuD6iUe3Pc) unless you have a reason. Sometimes you know something special about the data you're working with that allows you to beat the "normal" algorithms, but there's a reason the fast generic algorithms are generic.

### Unnecessary Work

Unneeded copies are the most common form of extra work we see in students' code. In languages like C++ that allow fine control over how variables are passed, this is easy to fix:

```c++
auto slow_product(auto x) { // passes by value--makes an unnecessary copy, slow
    decltype(x.front()) prod = 1;
    for (auto elem: x) prod *= elem;
    return prod;
}

auto fast_product(const auto &x) { // passes by const reference--no copy, fast
    decltype(x.front()) prod = 1;
    for (auto elem: x) prod *= elem;
    return prod;
}
```

### Hardware

Vector instructions, like [SSE](http://sci.tuomastonteri.fi/programming/sse) and [AVX](https://en.wikipedia.org/wiki/Advanced_Vector_Extensions), allow multiple floating point operations to happen in one clock cycle. For example, AVX2 provides 256-bit wide registers, allowing 4 double precision float operations to happen in a single clock cycle. You usually don't need to explicitly call vector instructions, but you can enable the compiler to emit code that uses them by giving it tight inner for loops free from [branches](https://en.wikipedia.org/wiki/Branch_(computer_science)). [This](http://walkingrandomly.com/?p=3378) is a good guide on squeezing out performance using vector instructions.

As mentioned in the [important reading above](http://gameprogrammingpatterns.com/data-locality.html), programming with memory and cache access in mind is vital. Keep your data compact, and iterate over it in the order it's laid out in memory to the extent possible.

### Overlap Waiting

When practical, overlap waiting with computation. For example, if we send off 1,000 web requests at once some will return sooner than others. We can probably begin processing the result while we are still waiting for the remainder. Accessing memory and storage also has high latency; in some contexts, doing computation while waiting is worth it.



## Tools

### C++

Optimization in C++ is an art that takes a lot of learning; you won't get good at it as a result of this course since we can't devote 100% of class time to optimization.

[`perf`](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/monitoring_and_managing_system_status_and_performance/recording-and-analyzing-performance-profiles-with-perf_monitoring-and-managing-system-status-and-performance) measures the time taken by each call in your program. `perf record --call-graph=dwarf ./your-program && perf report` is a good place to start.

[`valgrind`](https://valgrind.org/docs/manual/quick-start.html) has a ton of uses; it's probably most commonly used for finding segmentation faults. `valgrind --tool=callgrind ./your-program` and `valgrind --tool=cachegrind ./your-program` are particularly useful for optimization. Access a newer version on the supercomputer with `module load valgrind`.

Whichever debugger you use is a decent profiler--just make a program that executes in an endless loop, launch it in the debugger, and interrupt it several times. Wherever it stops a lot can probably use some optimization.

### Julia

Compared to C++, optimizing Julia code is a dream. The [performance tips page](https://docs.julialang.org/en/v1/manual/performance-tips/) has everything you'll need for common use. [`BenchmarkTools`](https://github.com/JuliaCI/BenchmarkTools.jl) and [`ProfileView`](https://github.com/timholy/ProfileView.jl) are great.

<!-- TODO: add that profiling video, but updated with code that doesn't just give away the answer -->
