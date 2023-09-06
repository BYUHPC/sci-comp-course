---
---

# Shell Aliases, Functions, and Scripts

Aliases, functions, and scripts save effort and prevent code duplication in bash. Aliases are abbreviations that are primarily used to save typing in interactive shells, while functions are powerful, general-purpose [subroutines](https://en.wikipedia.org/wiki/Subroutine). Scripts are text files with shell commands that can be executed.



## Aliases

An alias is an abbreviation that is expanded every time it is typed. For example, running `alias hi='echo "Hello, $USER!"'` will result in each `'hi'` typed on the command line being replaced by `echo "Hello, $USER"`. The purpose of an alias is to save typing in an interactive shell.

```shell
$ hi
bash hi: command not found
$ alias hi='echo hello'
$ hi
hello
```

Aliases are commonly used to make well-used commands friendlier, for example by coloring output when commands are used interactively:

```shell
$ alias ls
alias ls='ls --color=auto'
$ alias grep
alias grep='grep --color=auto'
```

Aliases can only be used interactively, not in scripts–if you find yourself wanting to use an alias in a script, you should probably be using a function instead.

```shell
$ cat test-aliases.sh
alias hi='echo hello'
hi
$ bash test-aliases.sh
test-aliases.sh: line 2: hi command not found
```



## Functions

A [function](https://tldp.org/LDP/abs/html/functions.html) is a subroutine containing arbitrary code that is executed on arguments that the caller of the function provides. If you ever find yourself repeating code or executing very similar code in multiple places, you should replace the repetitive code with a function. Unlike aliases, functions can be used in scripts, and are much more powerful and versatile than aliases in general. Here is a function that takes one argument and prints "Hello, [first argument], how are you?":

```shell
$ hello() {
>     echo "Hello, $1, how are you?"
> }
$ hello
Hello, , how are you?
$ hello class
Hello, class, how are you?
```

Arguments are referenced with `$` and a number–the first argument is `$1`, the second `$2`, etc. The special [array](https://tldp.org/LDP/abs/html/arrays.html) `$@` can be used to reference all arguments. Notice above that if an argument isn't provided, it is not set to any value within the function.

There are a few formats available for declaring functions:

```bash
hello() {
     echo "Hello, $1, how are you?"
}
function hello {
     echo "Hello, $1, how are you?"
}
function hello() {
     echo "Hello, $1, how are you?"
}
```

Prefer the first syntax. It's the most portable and it will result in a syntax error if there is already an alias of the same name, which is likely a mistake that should not be silently ignored.

```shell
$ alias hi='echo hello'
$ function hi {
>     echo "Hi, $1"
> } # no error :(
$ hi() { # errors as it should
bash: syntax error near unexpected token '('
```

It is often useful to define variables within a function to explicate the meaning of arguments or for internal use. By default, variables declared within a function will have global scope, meaning that they will be defined even after the function finishes executing.

```shell
$ hello() {
>     name="$1"
>     echo "Hello, $name, how are you?"
> }
$ echo "$name" # not defined yet

$ hello class
Hello, class, how are you?
$ echo "$name" # oops, $name escaped the function
class
```

This can be solved by using **local variables** which don't remain defined after the function executes.

```shell
$ hello() {
>     local name="$1" # no more leaking!
>     echo "Hello, $name, how are you?"
> }
$ echo "$name" # not defined yet

$ hello class
Hello, class, how are you?
$ echo "$name" # still not defined
```

Functions are recursive. While this increases their versatility, it can trip up the unaware:

```shell
$ unalias ls
$ ls() {
>     ls -color=auto
> }
$ ls # takes a while, then...
Warning: Program '/bin/bash' crashed.
```

When `ls` was called after the function was defined, it called the function `ls`, which called the function `ls`, etc. Aliases, since they are just abbreviations and thus aren't recursive, are best for uses like this.



## Scripts

Scripts are simply text files with shell code--just write the series of commands you'd like run:

```shell
$ cat > myscript.sh << EOF
echo "This is a script!"
echo "I know who you are, $USER..."
EOF
$ bash myscript.sh
This is a script!
I know who you are, netid...
```

Command line arguments are used almost exactly as they are in functions; you can also get the number of arguments with `$#`:

```shell
$ cat > takestwoargs.sh << EOF
if [ \$# != 2 ]; then
    echo "This script takes two arguments"
    exit 2
fi
echo "First argument:  \$1"
echo "Second argument: \$2"
EOF
$ bash takestwoargs.sh
This script takes two arguments
$ echo $?
2
$ bash takestwoargs.sh 'arg 1' arg2
First argument:  arg 1
Second argument: arg2
```

Almost anything you can do in the shell can be done in a script, including creating functions but not including defining aliases.



## Exit Status

Read the [exit status section](https://rc.byu.edu/course/EijkhoutHPCtutorials.pdf#subsection.1.5.4) of HPC Tutorials.
