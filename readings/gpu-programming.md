---
---

# GPU Programming

We usually think of CPUs as executing commands in sequence when programming--for the program `a(); b(); c();`, we expect the computer to execute `a`, then `b`, then `c`. GPUs are fundamentally parallel, so you have to approach programming them differently.



## Memory

GPUs have their own memory, and for modern hardware as of this writing, data needs to be transferred from main memory to the GPU's memory before computation. These transfers between main memory and GPU memory are expensive, and should be minimized to the extent possible--it's best to move data to the GPU, do all of your computation, and move it back only when the heavy lifting has been done.



## GPU Kernels

A [GPU kernel](https://en.wikipedia.org/wiki/Compute_kernel) is a piece of code that is executed on a GPU in parallel--the same piece of code, the kernel, is executed simultaneously across multiple GPU cores.

When a kernel is launched, it runs in parallel across many threads. Each thread executes the same kernel code but works on different data. For instance, in a task like vector addition, where each element in two arrays is added to produce a third array, each thread could be responsible for adding one pair of elements. In this way, if you have an array of 1000 elements, 1000 threads could potentially be adding pairs of elements at the same time.

Languages have different ways of describing and executing GPU kernels, but usually the programmer will provide a function describing the GPU kernel, and execute it by providing that function to another function which will execute the kernel on the GPU. For example, in the following code (which we'll discuss in more detail below), the kernel is the function `[](auto a, auto b){ return a + b; }`:

```c++
#include <vector>
#include <algorithm>
#include <execution>

int main() {
    std::vector<float> vecA = {1.0, 2.0, 3.0};
    std::vector<float> vecB = {4.0, 5.0, 6.0};
    std::vector<float> result(vecA.size());

    // Run `result[i] = vecA[i] + vecB[i]` for each element in each vector
    std::transform(std::execution::par_unseq, 
                   vecA.begin(), vecA.end(), vecB.begin(), result.begin(), 
                   [](auto a, auto b) { return a + b; });

    return 0;
}
```



## GPU Programming in C++

The C++ standard library offers a [collection of algorithms](https://en.cppreference.com/w/cpp/algorithm) that are designed to operate on sequences of elements. These include operations like sorting, transforming, and accumulating. For instance, `std::transform` applies a function to each element of one or more sequences. Typically, these algorithms are applied to data structures that provide access to their elements through iterators, like `std::vector`.

Since C++ 17, programmers can use `std::execution` policies to specify an execution model. By default, the standard algorithms will run sequentially. Specifying `std::execution::par` or `std::execution::par_unseq` as the first argument to these algorithms, however, tells the compiler that the algorithm can be parallelized or vectorized, respectively. This allows the compiler to take these high level abstractions and automatically parallelize them or offload them to a GPU.

The `std::transform` call in the example code above will produce results equivalent to:

```c++
for (size_t i=0; i<vecA.size(); i++) {
    result[i] = vecA[i] + vecB[i];
}
```

...but, since it uses a higher level of abstraction, can be compiled to serial code, parallel code, or GPU code **without any modification to the source code**. This is a big deal--rather than having to maintain separate CPU and GPU codebases, it allows developers to use the same source code to generate serial, parallel, and GPU binaries. **You should do as much of your coding as possible with the [standard algorithms](https://en.cppreference.com/w/cpp/algorithm) to take advantage of this**.



### Compiling

As of this writing, compiling standard C++ code for GPUs is cutting edge and isn't yet well-supported by most compilers. For now, you can compile for the P100s of `m9g` with [NVIDIA's HPC SDK](https://developer.nvidia.com/hpc-sdk):

```shell
module load nvhpc/24.5
nvc++ -stdpar=gpu -gpu=sm_60 -std=c++20 -o whatever whatever.cpp
```

Read [this NVIDIA blog post](https://developer.nvidia.com/blog/accelerating-standard-c-with-gpus-using-stdpar/) on compiling standard C++ for GPUs.
