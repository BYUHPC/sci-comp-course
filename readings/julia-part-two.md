# Julia Continues

## Julia Syntax Part II

We discussed some basic syntax earlier, but here's some very convenient syntax tools built right into the language.

#### Broadcasting Operators and Functions
Vectorization is the process of taking an operation that's performed one-at-a-time on multiple pieces of data and instead doing it on the entire dataset at once (or at least larger chunks depending on hardware constraints). On CPUs, this is achieved with a microarchitecture technique called [SIMD](https://en.wikipedia.org/wiki/Single_instruction,_multiple_data) (Single Instruction, Multiple Data) that is often implemented with the [AVX instruction set](https://en.wikipedia.org/wiki/Advanced_Vector_Extensions).

Without vectorization, you would write a `for` loop that iterates over all the elements and applies your operation to each element when it gets there. It might look something like this:
```
julia> arr = [1, 2, 3];
julia> for i in 1:length(arr)
           arr[i] += 1
       end
julia> print(arr)
[2, 3, 4]
```

Julia calls vectorization "broadcasting" and uses the "dot" operator, `.`, to signal that the operation should be applied to all fields or properties. The example would now look like this:

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
[2, 3, 4]
```
Using just `=` would cause a copy of the results to be saved to `arr` whereas `.=` modifies the elements of `arr` in place. Thus, `.=` is more memory efficient. The `.` in `add_1.(arr)` is needed in either case to indicate it's taking an element of `arr` as an argument. If you find yourself doing mutliple `.` operations on a single line, the `@.` operator can be especially useful as it will apply `.` to all operations. For example, the above becomes
```
julia> @. arr = add_1(arr);
```
and removes the `.` from two locations. As your calculations become more complex, this becomes more powerful.

#### Tuples, Anonymous Functions, and map()

Maybe we don't ever plan to add one to each element an array elsewhere in our code, so we don't want to write a full-fledge function for it. That's where anonymous functions really shine. The syntax is
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
(x, y) -> x + y
```
More arguments can be passed by adding more variables in the tuple.

Anonymous functions are most useful when a function expects another function as an argument. Let's take a look at `map(f, c...)` which applies a function, `f`, on each element of the collection, `c`. Using tuples, anonymous functions, and `map()`, we can easily sum together corresponding elements of two arrays and save the results.
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
If we have an array with two elements we want to convert to a tuple, the splat operator can break up the array and pass the elements in for us.
```
julia> arr = [1, 2];
julia> tuplifier(arr...)
(1, 2)
```
If we want to make a tuple with `x` number of arguments, we can add another method to tuplifier that will create a tuple with `x` elements.
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
But what if we don't know the quantity of what's being returned? You can "slurp" results into one variable. In this case, `...` becomes the `slurp` operator.
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
