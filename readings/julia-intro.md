# Introduction to Julia

Julia is a hybrid language--a language that combines some characteristics from interpreted languages and some from compiled languages--that was designed from the ground up for HPC. It's easy to use, more [expressive](https://en.wikipedia.org/wiki/Expressive_power_(computer_science)) than Python (and *far* more expressive than R), and fast due to its just-in-time compilation, type stability, multiple dispatch. We thus encourage most users of the supercomputer who aren't tied to legacy code or a language-specific library to write new code for the supercomputer in Julia.

## What Makes Julia Easy To Use

### Easy to Run
#### REPL
Julia has a very powerful [REPL](https://docs.julialang.org/en/v1/stdlib/REPL/) (Read-Evaluate-Print-Loop) that can run code interactively, provide documentation, give you shell access, manage packages, and allow history searching. You can access it with `module load julia; julia` and exit the REPL with `exit()` or `Ctrl+D`.

The REPL defaults to Julian mode on start up and is characterized by the `julia>` command prompt. You can run code here much like you'd run Bash commands in a Bash shell. Expressions will output the results, and this can be suppressed by ending the expression with a `;` (very helpful for verbose output).

If you're unsure about functionality, `?` will put you in help mode characterized by `help?>` at the start of the prompt. This can provide information about symbols, functions and more. Backspace will return you to Julian mode.

Shell mode is accessed by pressing `;` and characterized by `shell>`. From here you can run shell commands without having to exit Julia. This is extremely helpful when you need to change your working directory and don't want to wait for Julia to restart.

Pkg mode is accessed by pressing `]` and characterized by `pkg>`. This provides an easy way to manage packages and a projects dependencies. We will discuss this greater detail below.

Search mode lets you search look for previous commands with `Ctrl+R` and search forward with `Ctrl+S`. `Ctrl+C` will end the search. The `Enter` key will execute the current expression.

#### Scripts
Scripts written with Julia can be run with `julia script_name.jl`.

### Project Environment

Package managers help developers automate installing, upgrading, configuiring, and removing software packages and libraries for different projects. Ever wonder why code with dependencies (`import`/`#include`/etc.) works on one person's machine and not the other? It's probably related to incorrect versions or missing packages. In Python, pip and conda are the most common package managers. Julia has its own builtin package manager. It's accessed in the REPL with the `]` key. From there, you're put in the default environment characterized by the current Julia version (ex: `(@v1.10) pkg>` is the default environment for Julia version 1.10).

Let's walk through creating a new environment. From the package manager (`]`), running `generate ExampleProject` will create this project structure:
```
ExampleProject/
├── Project.toml
└── src
    └── ExampleProject.jl
```
Your code should be written under `src` in `.jl` files. A well structured environment, will need more directories and files. It's recommend to have your project structured like so:
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
This file also keeps track of the top level dependencies your project has. Let's add some extra dependencies. First, we'll navigate inside our project (very imporantant as this is where Julia looks for the `Project.toml`!) and switch from the default environment to our specifc environment.

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
`LinarAlegebra`'s UUID is noted so that someone copying this file could recreate the environment on their own machine (`instantiate` is the command they'd use after activating the environment).`Manifest.toml` is created after the first install (or `instantiate`) and contains the full list of dependencies that enable `LinearAlgebra` to work. It should NOT be manually altered. In a `.jl` file, we could now access `LinearAlgebra` tools by adding `using LinearAlgebra` at the top of the file.

When we generated our project, `src/ExampleProject.jl` was filled with a generic `greet` function:
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

### Syntax
The general syntax of Julia is generally easy for experienced programmers to pick up. If you want to look at some of the basics there are plenty of online resources collected [here](https://julialang.org/learning/tutorials/). Slightly more advanced, but probably more useful is [this documentation](https://juliadatascience.io/data_structures) that covers the native data structures in Julia. We'll focus on a few those areas that will be most useful in this course and that you might not have seen before.

It's far easier to write Julia code than C++ code. There are many [noteworthy differences from C++](https://docs.julialang.org/en/v1/manual/noteworthy-differences/#Noteworthy-differences-from-C/C), but some the most revelant ones are:
 - **Indexing in Julia starts at 1**, not 0.
 - Julia is **column major** which means that columns are stored next to each other in memory. You'll want to iterate over `j` and then `i` to take advantage of this. C++ is row major and stores rows next to each other.
 - Multiple values can be returned from functions.
 - `->` creates an anonymous function (nothing like C++ pointers).

#### Broadcasting Operators and Functions
Vectorization is the process of take an operation that's performed one-at-a-time on multiple pieces of data and instead doing it on the entire dataset at once (or at least larger chunks depending on hardware constraints). On CPUs, this is achieved with a microarchitecture technique called [SIMD](https://en.wikipedia.org/wiki/Single_instruction,_multiple_data) (Single Instruction, Multiple Data) that is often implement with the [AVX instruction set](https://en.wikipedia.org/wiki/Advanced_Vector_Extensions).

Without vectorization, you would write a `for` loop that iterates over all the elements and applies your opperation to each element when it gets there. It might look something like this:
```
julia> arr = [1, 2, 3];
julia> for i in 1:length(arr)
           arr[i] += 1
       end
julia> print(arr)
[2, 3, 4]
```

Julia uses calls vectorization "broadcasting" and uses the "dot" operator, `.`, to signal that the operation should be applied to all fields or properties. The example would now look like this:

```
julia> arr = [1, 2, 3];
julia> arr .+= 1;
julia> print(arr)
[2, 3, 4]
```
It's both cleaner and more efficient. This can also be used with functions:
```
julia> arr = [1, 2, 3];
julia> function add_1(x)
           x + 1
       end
julia> arr .= add_1.(arr);
julia> print(arr)
[2, 3, 3]
```
Using just `=` would cause a copy of the results to be save to `arr` whereas `.=` modifies the elements of `arr` in place. Thus, `.=` is more memory efficient. The `.` in `add_2.(arr)` is needed in either case to indicate it's taking an element of `arr` as a an argument. If you find yourself doing mutliple `.` operations on a single line, the `@.` operator can be especially useful as it will apply `.` to all operations. For example, the above becomes
```
julia> @. arr = add_1(arr);
```
and removes the `.` from two locations. As your calculations become more complex, this becomes more powerful.

#### Functions that Modify Arguments
In Julia, it's a convention to add a bang, `!`, at the end of function names that modify at least one of their arguements. We could rewrite our `add_1` function to modify an entire array in place like so:
```
julia> arr = [1, 2, 3];
julia> function add_1!(a)
           @. a += 1
        end
julia> add_1!(arr);
julia> print(arr)
[2, 3, 4]
```

#### Tuples, Anonymous Functions, and map()

Maybe we don't ever plan to add one to each element an array elsewhere in our code, so we don't want to write a full fledge function for it. That's where anonymous functions really shine. The syntax is
```
arguments -> function
```
so we could add one to a single element like so
```
x -> x + 1
```
If we want to sum two numbers, you'd need to pass the arguments in as a tuple. You can think of tuples exactly like an array (which can have multiple data types in Julia even if it does hurt performance), but you cannot modify their contents after instantiation. They can be declared with `()` and might look like this `(1, "one", 1.0)`.

So passing two arguments to an anonymous function would look like this:
```
(x, y) > x + y
```
More arguments can be passed by adding more variables in the tuple.

Anonymous functions are most useful when a function expects another functions as an argument. Let's take a look at `map(f, c...)` which applies a function, `f`, on each element of the collection, `c`. Using tuples, anonymous functions, and `map()`, we can easily sum together corresponding elements of two arrays and save the results.
```
julia> arr1 = [1, 2, 3];
julia> arr2 = [4, 5, 6];
julia> arr3 = map((x, y) -> x + y, arr1, arr2);
julia> print(arr3)
[5, 7, 9]
```

#### `...` Operator
When `...` is used in a function call, it is called the `splat` operator. Let's create a function that takes in `x` and `y` and returns them as a tuple.
```
julia> tuplifier(x, y) = (x, y)
tuplifier (generic function with 1 method)

julia> tuplifier(1, 2)
(1, 2)
```
If we have an array with two elements we want to convert to a tuple, the splatter operator can break up the array and pass the elements in for us.
```
julia> arr = [1, 2];
julia> tuplifier(arr...)
(1, 2)
```
If we want to make a tuple with `x` number of arguements, we can add another method to tuplifier that will create a tuple with `x` elements.
```
julia> tuplifier(x...) = (x)
tuplifier (generic function with 2 methods)
julia> tuplifier(1, 2, 3, 4, 5)
(1, 2, 3, 4, 5)
```

`...` can also be used as the slurp operator. In Julia, multiple values can be returned. Consider the following:

```
julia> return_many() = return 1, 2, 3
return_many (generic function with 1 method)

julia> a, b, c = return_many();

julia> print(a)
1
julia> print(b)
2
julia> print(c)
3
```
But what if we don't know the quantity of what's being returned? You can "slurp" results into one variable.
```
julia> x, y... = return_many();
julia> print(x)
1
julia> print(y)
(2, 3)
```
It doesn't even need to be the last variable!
```
julia> s..., t = return_many();

julia> print(s)
(1, 2)
julia> print(t)
3
```

`...` works on more than just arrays. It can operate on anything that is a collection. For example:
```
julia> greeting..., punctuation = tuplifier("hello!"...);
julia> print(greeting)
('h', 'e', 'l', 'l', 'o')
julia> print(punctuation)
!
```

#### Types
Typing in Julia is optional, but recommended for performance reasons. [This](https://docs.julialang.org/en/v1/manual/types/) is Julia's full documentation on it, but for the most part if you see `::` or `<:` that's the way to declare a type. There's actually a lot of niffty tricks you can do with them, but the basic understanding that it's optional and represented by `::` or `<:` is all that's needed for our class.


### Libraries
Julia has a rich standard library installed by default. Handling dates and timestamps often requires other libraries like in Python ('pandas' uses 'dateime`) or R (`tidyverse` uses `libridate`). Julia doesn't require installation of something like `pandas` or `tidyverse` as there are pleanty of builtin libraries. You just need to import it at the top of your file (`using Dates`). The same thing applies to random numbers (`using Random`), downloads (`using Downloads`), and more.


## Julia is Fast

### Just-In-Time Compilation
A Just-In-Time (JIT) compiler is a powerful technique that bridges the gap between compiled and interpreted programming languages. Traditional compiled languages convert source code to machine code before execution (like when we use `g++` or `make` to compile C++ code), while interpreted languages translate and run code line by line during runtime (like Python). JIT compilation takes a hybrid approach: it initially interprets code, but dynamically compiles frequently used code segments into highly optimized machine code at runtime. This means the program can start quickly like an interpreted language, but gain performance boosts by converting hot code paths into native machine instructions tailored to the specific hardware and current execution context. Julia's JIT compiler goes a step further by performing type specialization, which means it generates machine code that is specifically optimized for the exact data types being used in a particular function call. Because of this, calling `my_function()` might take 10 seconds the first time you use it and only 5 seconds the second time. That's because it was being optimized during the first call and the second call utilized the optimize code. `@time my_function()` can help you see these differences.

However, Julia cannot natively detect when you change source code. If you've been running `my_function()` and alter what it does, the REPL cannot detect this and recompile `my_function()` appropriately. The Revise.jl package provides an additional development workflow enhancement, allowing developers to modify code and have those changes immediately reflected in a running Julia session without requiring a full restart. By integrating with Julia's JIT compilation, Revise.jl enables a more dynamic and responsive programming experience, reducing friction in the development process and allowing developers to quickly iterate and test their code. It's not always a perfect solution, so an occasional restart of Julia might be needed in some cases.

### Type Stability
While declaring types in Julia is optional, it's incredibly useful for the JIT and helps speed up your code. If your program will always return a certain type (ex: `Int`, `Ffloat64`, `Bool`, etc.), the JIT can reduce runtime type checking, create a predictable memory layout, and use more efficient machine code. `@code_warntype` can help identify where changing types occur in your code.

### Multiple Dispatch
One of the reasons Jula is so fast is because it implements multiple dispatch. This gives it flexibility with method calls and optimizations. Read below [Fig 2](https://juliadatascience.io/julia_accomplish#fig:language_comparison) until the start of Section 2.3.
