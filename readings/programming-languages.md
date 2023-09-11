---
---

# Programming Languages

There are [many ways](https://www.techtarget.com/searchapparchitecture/tip/Functional-vs-object-oriented-programming-The-basics) [to categorize](https://en.wikipedia.org/wiki/Data-oriented_design) [programming languages](https://www.freecodecamp.org/news/compiled-versus-interpreted-languages/). For the purposes of this lesson, the focus is on how a user interacts with the tools for a language from a workflow viewpoint. As such, the programming languages will be split into three categories: interpreted, compiled, and a hybrid of the two.

There are a few steps that code of any language has to go through before being run by a machine:

- [Lexical analysis](https://en.wikipedia.org/wiki/Lexical_analysis): the process of converting a sequence of characters into a sequence of tokens
- [Syntax analysis](https://en.wikipedia.org/wiki/Parsing): the process of ensuring that the lexed tokens conform to the rules of the language
- [Semantic analysis](https://en.wikipedia.org/wiki/Compiler#Front_end): the process of ensuring that the relationships between the lexed tokens are valid.



## Interpreted Languages

Once semantic analysis is complete, interpreted languages immediately execute your code. This usually allows them to have an [interactive interpreter](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop) and makes them friendly to development, where repeatedly tweaking then testing code needs to be fast and easy.



## Compiled Languages

Compilers take a couple more steps after semantic analysis:

- [Optimization](https://en.wikipedia.org/wiki/Optimizing_compiler): the process of minimizing the expected runtime and/or memory footprint of the resulting program
- [Code generation](https://en.wikipedia.org/wiki/Code_generation_%28compiler%29): converting the [intermediate representation](https://en.wikipedia.org/wiki/Intermediate_representation) resulting from optimization to machine code for a specific platform

As an example, the following C++ code:

```c++
int square(int n) {
    return n * n;
}
```

...might be transformed into the following [machine code](https://en.wikipedia.org/wiki/Assembly_language) by the compiler without optimization:

```nasm
square(int):
   pushq      %rbp           ; rbp: bottom of frame pointer
   movq       %rsp, %rbp     ; rsp: top of frame pointer
   movl       %edi, -4(%rbp) ; edi: general purpose register
   movl       -4(%rbp), %eax ; eax: general-purpose accumulator
   imull      -4(%rbp), %eax
   popq       %rbp
   ret
```

If optimization is turned on, the compiler will realize that the same thing can be accomplished with less redundant instructions--rather than directly translating your code, it will emit machine code that will have identical results in as optimal a way as it can find. This has less than half of the instructions, but will give the same answer:

```nasm
square(int):
   movl       %edi, %eax
   imull      %edi, %eax
   ret
```

Since compilation only has to happen once, workflows with one compilation and many executions favor compiled languages since execution of compiled code is usually faster than running an interpreter.



## Which is Better?

### Interpreted Language Advantages

- Programs can be evaluated immediately--code does not need to be recompiled after each change
- Generally more portable between platforms and operating systems
- Usually more user-friendly; if developer time is more valuable than compute time, an interpreted language is usually a better choice

### Compiled Language Advantages

- Many errors that an interpreted language would find while running can be caught at compile time
- Low level programming (e.g. GPU kernels) is possible
- Usually faster, often much faster; if compute time is more valuable than development time, a compiled language is usually the way to go



## HPC, Hybrid Languages, and Language Choice

Since computation time usually dwarfs developer time in the context of high performance computing, compiled languages are favored for writing programs for supercomputers; [C++](../resources.md#c) and Fortran are very popular, which is partly why much of this course is taught in C++.

Developers with less programming experience will often choose an "easier," interpreted language for use on the supercomputer. This can be an acceptable choice assuming that the interpreted language is used as glue code, calling optimized compiled code for heavy computation, but is generally a bad choice otherwise. For example, a Python program whose main computation is done with [vectorized numpy](https://www.askpython.com/python-modules/numpy/numpy-vectorization) is okay, while an R program without special tuning [is not](http://adv-r.had.co.nz/Performance.html#why-is-r-slow).

[Julia](../resources.md#julia) is a hybrid language--a language that combines some characteristics from interpreted languages and some from compiled languages--that was designed from the ground up for HPC. It's [easy to use](https://docs.julialang.org/en/v1/stdlib/REPL/), more [expressive](https://en.wikipedia.org/wiki/Expressive_power_(computer_science)) than Python (and *far* more expressive than R), and fast due to its [just-in-time compilation](https://en.wikipedia.org/wiki/Just-in-time_compilation), [type stability](https://docs.julialang.org/en/v1/manual/types/), and [multiple dispatch](https://towardsdatascience.com/how-julia-perfected-multiple-dispatch-16675db772c2?gi=0e100e40c3c3). We thus encourage most users of the supercomputer who aren't tied to legacy code or a language-specific library to write new code for the supercomputer in Julia. In this class, we'll use Julia to teach concepts that are hard to learn with C++.