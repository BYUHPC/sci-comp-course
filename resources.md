---
---

# Resources

This page is meant to bridge the gap between your skills and those required to thrive in the course. At its core, it's a glorified collection of links; the most helpful way to use it is to find what you're confused about and check out all the links in the relevant paragraph.



## Linux

Software on the supercomputer is generally accessed with [modules](https://rc.byu.edu/wiki/?id=Environment+Modules).



## Programming

You're expected to come into the class with either some C++ experience or the ability to [pick up languages quickly](https://prirai.github.io/books/unix-koans.html#recruiter), so we don't teach programming in general or C++ specifically.

Unless you have an established workflow for programming on the supercomputer, we strongly recommend [setting up VS Code for remote editing](https://rc.byu.edu/wiki/index.php?page=Remote+Development+with+VS+Code). You'll find the [C++](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) and [Julia](https://marketplace.visualstudio.com/items?itemName=julialang.language-julia) [extensions](https://marketplace.visualstudio.com/) helpful. The enlightened will love the [Vim extension](https://marketplace.visualstudio.com/items?itemName=vscodevim.vim).

Since this is a class about *high performance* computing you'll do some [optimization](https://viralinstruction.com/posts/hardware/). An [efficient algorithm](https://youtu.be/ZZuD6iUe3Pc) is of course vital for speed, but [data locality is critical](http://gameprogrammingpatterns.com/data-locality.html) and not talked about enough--for example, linked lists are theoretically faster than arrays for some algorithms, but [the hardware realities mean they're almost never actually the right choice](https://youtu.be/YQs6IC-vgmo).

Keep in mind that [C++ indexes from 0](https://www.w3schools.com/cpp/cpp_arrays.asp) and Julia [(mostly)](https://juliaarrays.github.io/OffsetArrays.jl/stable/) indexes from 1, although you [usually shouldn't need to worry about that in Julia](https://docs.julialang.org/en/v1/manual/arrays/#man-array-indexing).



## C++

[C++](https://en.cppreference.com) is more [expressive](https://en.wikipedia.org/wiki/Expressive_power_%28computer_science%29) than C while retaining most of its benefits, but it is complex and carries a lot of baggage from its long history. It's easy enough to get a grasp of the basics, but mastery and learning [good style](http://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines) require more time and effort than most languages you're likely to encounter. [Bjarne Stroustrup](https://www.stroustrup.com/)'s ["The C++ Programming Language"](https://www.stroustrup.com/4th.html) is the definitive guide to using C++, but it's probably overkill to buy it just for this class when acceptable online tutorials like [the one offered by W3 Schools](https://www.w3schools.com/cpp/) are available. Most online tutorials (including the W3 Schools one), though, should be taken with a grain of salt--they often encourage bad style, so it's best to be guided by our [example code](https://github.com/BYUHPC/sci-comp-course-example-cxx) and [expert opinion](http://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines) when possible.

### Compilation

C++ is a [compiled language](https://www.freecodecamp.org/news/compiled-versus-interpreted-languages/#compiled-languages)--before the code can run, the human-readable code (a text file) must be translated to an executable (a binary machine code file). This is accomplished with a [compiler](https://en.wikipedia.org/wiki/Compiler) like [GCC](https://gcc.gnu.org/) or [LLVM](https://llvm.org/). If you don't yet have access to the supercomputer and don't have a compiler installed locally, you can try [OnlineGDB's C++ compiler](https://www.onlinegdb.com/online_c++_compiler); to use C++20, select it from the dropdown at the upper right. On the supercomputer, writing, compiling, and running a hello world program in C++ looks something like:

```bash
cat > hello.cpp << EOF
#include <iostream>
int main() {
	std::cout << "Hello, world!" << std::endl;
}
EOF
module load gcc/latest
g++ -g -std=c++20 -o hello hello.cpp
./hello
```

### Typical Knowledge Gaps

Many students have been taught to use C++ like C, so they aren't familiar with any of the features that make C++ more bearable to use for non-trivial projects. In particular:

- They don't use (and in some cases haven't even heard of) `auto` as [liberally as they should](https://herbsutter.com/2013/08/12/gotw-94-solution-aaa-style-almost-always-auto/).
- They aren't familiar with [templates](https://en.cppreference.com/w/cpp/language/templates), which are [vital](https://cplusplus.com/doc/oldtutorial/templates/) for [writing flexible code](https://hackernoon.com/c-template-a-quick-review-of-c11141720-version-ipg3uqy/). In particular, most of the extra credit for the project is extremely challenging without [template metaprogramming](https://en.wikibooks.org/wiki/C++_Programming/Templates/Template_Meta-Programming).
- They've never used [closures](https://learn.microsoft.com/en-us/cpp/cpp/lambda-expressions-in-cpp?view=msvc-170), which are essential for the more functional programming C++ is evolving toward.
- They fail to use [standard algorithms](https://en.cppreference.com/w/cpp/algorithm) when they should, resulting in excess boilerplate and duplication of effort.

One aspect of C++ that trips up many students is fact that '`&`' is used for so many things: to [obtain pointers](https://cplusplus.com/doc/tutorial/pointers/#reference), [declare](https://en.cppreference.com/w/cpp/language/reference_initialization) and [pass arguments by](https://www.geeksforgeeks.org/cpp-functions-pass-by-reference/) [reference](https://learn.microsoft.com/en-us/cpp/cpp/references-cpp?view=msvc-170), perform [logical](https://en.cppreference.com/w/cpp/language/operator_logical) and [bitwise](https://en.cppreference.com/w/cpp/language/operator_arithmetic) `AND` operations, and [more](https://dev.to/sandordargo/how-to-use-ampersands-in-c-3kga). It's in the running for the most cursed character in any programming language.

### Debugging, Profiling, and Optimization

[GDB](https://www.bitdegree.org/learn/gdb-debugger) is ubiquitous for debugging C++ programs; you'll want to `module load gdb` to [get access to a recent version](https://rc.byu.edu/wiki/?id=Environment+Modules) on the supercomputer. If you prefer a graphical debugger, you can [integrate GDB into VS Code](https://youtu.be/G9gnSGKYIg4). If you do so, make sure to set [`miDebuggerPath`](https://youtu.be/G9gnSGKYIg4?t=109) to the path returned by `module load gdb && which gdb`; you'll probably also want to modify `tasks.json` by changing `command` to the result of `module load gcc/12 && which g++` and adding `-std=c++20` to `args`. [Valgrind](https://valgrind.org/docs/manual/quick-start.html) is essential for [tracking down memory problems](https://prajankya.me/valgrind-on-linux/); again, you'll want to `module load valgrind` for a recent version.

There are [many tools available for profiling in C++](https://hackingcpp.com/cpp/tools/profilers.html); [perf]() is a good, simple choice in combination with Valgrind. Profiling and [optimization](https://www.agner.org/optimize/optimizing_cpp.pdf) in C++ are hard--this class will be the start of a long journey.

[Catch2](https://github.com/catchorg/Catch2) is a ubiquitous C++ testing framework that [integrates with CMake](https://github.com/catchorg/Catch2/blob/4dd6e81d0f4b6f88058e7b71f3f672aa478161ef/docs/cmake-integration.md). `module load catch2` makes it available on the supercomputer.



## Julia

[Julia](https://julialang.org/) is like Python on steroids--it's more [expressive](https://docs.julialang.org/en/v1/manual/metaprogramming/), [faster](https://julialang.org/benchmarks/), and was [designed from the ground up for HPC](https://julialang.org/blog/2012/02/why-we-created-julia/). It [has its quirks](https://viralinstruction.com/posts/badjulia/) and isn't the right tool for everything, but [it's probably the best widely-used language available to write programs for supercomputers](https://viralinstruction.com/posts/goodjulia/).

[Revise](https://timholy.github.io/Revise.jl/stable/) makes development in Julia (especially [packages](https://pkgdocs.julialang.org/v1/creating-packages/)) a breeze. [Pluto notebooks](https://github.com/fonsp/Pluto.jl) are nice if you're used to a Jupyter-like interface.

[Profiling](https://docs.julialang.org/en/v1/manual/profile/), [optimization](https://docs.julialang.org/en/v1/manual/performance-tips/), and [debugging](https://www.julia-vscode.org/docs/stable/userguide/debugging/) in Julia is much easier than in C++. [ProfileView](https://github.com/timholy/ProfileView.jl) and [BenchmarkTools](https://github.com/JuliaCI/BenchmarkTools.jl) in particular are very helpful. [Unit testing](https://docs.julialang.org/en/v1/stdlib/Test/) is easy, especially for [packages](https://pkgdocs.julialang.org/dev/creating-packages/#Adding-tests-to-the-package).
