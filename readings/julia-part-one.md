# Introduction to Julia

Julia is a hybrid language--a language that combines some characteristics from interpreted languages and some from compiled languages--that was designed from the ground up for HPC. It's easy to use, more [expressive](https://en.wikipedia.org/wiki/Expressive_power_(computer_science)) than Python (and *far* more expressive than R), and fast due to its just-in-time compilation, type stability, and multiple dispatch. We thus encourage most users of the supercomputer who aren't tied to legacy code or language-specific libraries to write new code for the supercomputer in Julia.

## What Makes Julia Easy To Use

### Easy to Run
#### REPL
Julia has a very powerful [REPL](https://docs.julialang.org/en/v1/stdlib/REPL/) (Read-Evaluate-Print-Loop) that can run code interactively, provide documentation, give you shell access, manage packages, and allow history searching. You can access it with `module load julia; julia` and exit the REPL with `exit()` or `Ctrl+D`.

The REPL defaults to Julian mode on startup and is characterized by the `julia>` command prompt. You can run code here much like you'd run Bash commands in a Bash shell. Expressions will output the results, and this can be suppressed by ending the expression with a `;` (very helpful for verbose output).

If you're unsure about functionality, `?` will put you in help mode characterized by `help?>` at the start of the prompt. This can provide information about symbols, functions, and more. Backspace will return you to Julian mode.

Shell mode is accessed by pressing `;` and characterized by `shell>`. From here you can run shell commands without having to exit Julia. This is extremely helpful when you need to change your working directory and don't want to wait for Julia to restart.

Pkg mode is accessed by pressing `]` and characterized by `pkg>`. This provides an easy way to manage packages and a project's dependencies. We will discuss this in greater detail below.

Search mode lets you search look for previous commands with `Ctrl+R` and search forward with `Ctrl+S`. `Ctrl+C` will end the search. The `Enter` key will execute the current expression.

#### Scripts
Scripts written with Julia can be run with `julia script_name.jl`.

### Project Environment

Package managers help developers automate installing, upgrading, configuring, and removing software packages and libraries for different projects. Ever wonder why code with dependencies (`import`/`#include`/etc.) works on one person's machine and not another's? It's probably related to incorrect versions or missing packages. In Python, pip and conda are the most common package managers. Julia has its own built-in package manager. It's accessed in the REPL with the `]` key. From there, you're put in the default environment characterized by the current Julia version (e.g., `(@v1.10) pkg>` is the default environment for Julia version 1.10).

Let's walk through creating a new environment. From the package manager (`]`), running `generate ExampleProject` will create this project structure:
```
ExampleProject/
├── Project.toml
└── src
    └── ExampleProject.jl
```
Your code should be written under `src` in `.jl` files. A well-structured environment, will need more directories and files. It's recommended to have your project structured like so:
```
ExampleProject/
├── Project.toml     # Dependency and metadata
├── src/             # Source code
├── test/            # Unit tests
├── docs/            # Documentation
└── README.md        # Project description
````

The `Project.toml` file is where Julia's package manager really shines. The first four lines contain information specific to the project you created. 
```
name = "ExampleProject"
uuid = "e41b9a79-b46e-43cd-9cab-11adccbaab2c"
authors = ["Redacted <redacted@byu.edu>"]
version = "0.1.0"
```
This file also keeps track of the top level dependencies your project has. Let's add some extra dependencies. First, we'll navigate inside our project (very important as this is where Julia looks for the `Project.toml`!) and switch from the default environment to our specifc environment.

```
shell> cd ExampleProject/
~/ExampleProject

shell> ls
Project.toml  src

(@v1.10) pkg> activate .
  Activating project at `~/ExampleProject`
```
Then we add the `LinearAlgebra` package to our environment.
```
(exampleProject) pkg> add LinearAlgebra
  Installing known registries into `~/.julia`
    Updating registry at `~/.julia/registries/General.toml`
   Resolving package versions...
    Updating `~/ExampleProject/Project.toml`
  [37e2e46d] + LinearAlgebra
    Updating `~/ExampleProject/Manifest.toml`
  [56f22d72] + Artifacts
  [8f399da3] + Libdl
  [37e2e46d] + LinearAlgebra
  [e66e0078] + CompilerSupportLibraries_jll v1.1.1+0
  [4536629a] + OpenBLAS_jll v0.3.23+4
  [8e850b90] + libblastrampoline_jll v5.8.0+1
Precompiling project...
  2 dependencies successfully precompiled in 2 seconds
```
Julia recognizes that you added this package and noted it automatically for you in `Project.toml`.
```
[deps]
LinearAlgebra = "37e2e46d-f89d-539d-b4ee-838fcccc9c8e"
```
`LinearAlgebra`'s UUID is noted so that someone copying this file could recreate the environment on their own machine (`instantiate` is the command they'd use after activating the environment).`Manifest.toml` is created after the first install (or `instantiate`) and contains the full list of dependencies that enable `LinearAlgebra` to work. It should NOT be manually altered. In a `.jl` file, we could now access `LinearAlgebra` tools by adding `using LinearAlgebra` at the top of the file.

When we generated our project, `src/ExampleProject.jl` was filled with a generic `greet()` function:
```
module ExampleProject

greet() = print("Hello World!")

end # module ExampleProject
```

We can run this function by telling Julia to use ExampleProject.
```
julia> using ExampleProject
julia> ExampleProject.greet()
Hello World!
```

### Syntax Part I
The general syntax of Julia is easy for experienced programmers to pick up. If you want to look at some of the basics, there are plenty of online resources collected [here](https://julialang.org/learning/tutorials/). Slightly more advanced, but probably more useful is [this documentation](https://juliadatascience.io/data_structures) that covers the native data structures in Julia. We'll focus on a few those areas that will be most useful in this course and that you might not have seen before.

It's far easier to write Julia code than C++ code. There are many [noteworthy differences from C++](https://docs.julialang.org/en/v1/manual/noteworthy-differences/#Noteworthy-differences-from-C/C), but some the most revelant ones are:
 - **Indexing in Julia starts at 1**, not 0.
 - Julia is **column-major** which means that columns are stored next to each other in memory. You'll want to iterate over `j` and then `i` to take advantage of this. C++ is row major and stores rows next to each other.
 - Multiple values can be returned from functions.
 - `->` creates an anonymous function (nothing like C++ pointers).

#### Functions that Modify Arguments
In Julia, it's a convention to add a bang, `!`, at the end of function names that modify at least one of their arguments. We could rewrite an `add_1` function to modify an entire array in place like so:
```
julia> arr = [1, 2, 3];
julia> for i in 1:length(arr)
           arr[i] += 1
       end
julia> add_1!(arr);
julia> print(arr)
[2, 3, 4]
```

#### Symbols
In Julia, symbols are lightweight, immutable identifiers that represent a fixed string, denoted by a `:` prefix, such as `:total`, `:dynamic`, or `:potential`. Symbols are unique and can be used efficiently for comparisons, as a symbol with the same name always refers to the same object in memory. They're commonly used in function arguments, as keys in dictionaries, for specifying options or modes, and in metaprogramming. Symbols provide a memory-efficient and fast way to represent constant string-like values, making them particularly useful in scenarios where you need a unique, immutable identifier that can be quickly compared and doesn't require the full overhead of a string.


#### Types
Typing in Julia is optional, but recommended for performance reasons. [This](https://docs.julialang.org/en/v1/manual/types/) is Julia's full documentation on it, but for the most part if you see `::` or `<:` that's the way to declare a type. There's actually a lot of nifty tricks you can do with them, but the basic understanding that it's optional and represented by `::` or `<:` is all that's needed for our class.


#### Libraries
Julia has a rich standard library installed by default. Handling dates and timestamps often requires other libraries like in Python ('pandas' uses 'datetime`) or R (`tidyverse` uses `lubridate`). Julia doesn't require installation of something like `pandas` or `tidyverse` as there are plenty of built-in libraries. You just need to import it at the top of your file (`using Dates`). The same thing applies to random numbers (`using Random`), downloads (`using Downloads`), and more.


## Julia is Fast

### Just-In-Time Compilation
A Just-In-Time (JIT) compiler is a powerful technique that bridges the gap between compiled and interpreted programming languages. Traditional compiled languages convert source code to machine code before execution (like when we use `g++` or `make` to compile C++ code), while interpreted languages translate and run code line by line during runtime (like Python). JIT compilation takes a hybrid approach: it initially interprets code, but dynamically compiles frequently used code segments into highly optimized machine code at runtime. This means the program can start quickly like an interpreted language, but gain performance boosts by converting hot code paths into native machine instructions tailored to the specific hardware and current execution context. Julia's JIT compiler goes a step further by performing type specialization, which means it generates machine code that is specifically optimized for the exact data types being used in a particular function call. Because of this, calling `my_function()` might take 10 seconds the first time you use it and only 5 seconds the second time. That's because it was being optimized during the first call, and the second call utilized the optimize code. `@time my_function()` can help you see these differences.

However, Julia cannot natively detect when you change source code. If you've been running `my_function()` and alter what it does, the REPL cannot detect this and recompile `my_function()` appropriately. The Revise.jl package provides an additional development workflow enhancement, allowing developers to modify code and have those changes immediately reflected in a running Julia session without requiring a full restart. By integrating with Julia's JIT compilation, Revise.jl enables a more dynamic and responsive programming experience, reducing friction in the development process and allowing developers to quickly iterate and test their code. It's not always a perfect solution, so an occasional restart of Julia might be needed in some cases.

### Type Stability
While declaring types in Julia is optional, it's incredibly useful for the JIT and helps speed up your code. If your program will always return a certain type (e.g., `Int`, `Float64`, `Bool`, etc.), the JIT can reduce runtime type checking, create a predictable memory layout, and use more efficient machine code. `@code_warntype` can help identify where changing types occur in your code.

### Multiple Dispatch
One of the reasons Julia is so fast is because it implements multiple dispatch. This gives it flexibility with method calls and optimizations. Read below [Fig 2](https://juliadatascience.io/julia_accomplish#fig:language_comparison) until the start of Section 2.3.
