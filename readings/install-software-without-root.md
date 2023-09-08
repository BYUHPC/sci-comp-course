---
---

# Installing Software without Root

As mentioned in the [environment variables](environment-variables.md#defining-environment-variables) reading, the shell searches `PATH` for commands you type if they aren't <a href="https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html" title="See the 'SHELL BUILTIN COMMANDS' section of the bash man page">shell built-ins</a>.

```shell
$ echo $PATH
/usr/local/bin:/usr/bin:/usr/sbin:/bin
# looking for make in the path variable:
# /usr/local/bin -- searched and not found
# /usr/bin -- searched and found
# /usr/sbin -- not searched
# /bin -- not searched
```

The executable may need to be linked to shared libraries at runtime. On GNU/Linux, this is actually quite common because shared libraries are usually the default. A shared library is an excutable file that contains pieces that lots of other executables use. For example, `libquadmath.so.0` contains quad-precision math functions that many computational programs require. Instead of each of these programs containing the functions they need (which would take up space and mean multiple headaches when `libquadmath` gets an update), they just link to `libquadmath.so.0`.

There are paths like `/lib`, `/usr/lib`, `/lib64`, etc., that are searched for shared libraries by default. When you install software as root, usually the associated shared libraries are put in a default library path.

```shell
$ ldd $(which make)
linuxvdso.so.1 =>  (0x00007fffacdf1000)
libdl.so.2 => /lib/x86_64-linux-gnu/libdl.so.2 (0x00007f0c080a5000)
libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007f0c07cde000)
/lib64/ld-linux-x86-64.so.2 (0x000055f59a567000)
```

## RUNPATH

Files stored in the Executable and Linkable Format (ELF) store the names of the needed libraries and possibly a `RUNPATH` (or its deprecated cousin, `RPATH`). `RUNPATH` and `RPATH` are mutually exclusive, and `RUNPATH` should be used when possible.

The `RUNPATH` is a list of system paths to be searched, each path separated by a colon just like `PATH`. This is part of the executable file and is not an environment variable.

The environment variable `LD_LIBRARY_PATH` (which should only be used for testing purposes, never in production) will be searched before `RUNPATH`. It has the same format as `RUNPATH`: a colon-delimited list of paths.

You'll often see suggestions to use `LD_LIBRARY_PATH` to fix linking issues, but that's bad practice–don't do it except as a last resort. There is a lot of disinformation out there about `LD_LIBRARY_PATH`, and almost no information about the correct way to link, to the extent that reputable websites will give incorrect advice about how to solve linking issues. **[Don't use `LD_LIBRARY_PATH` if you can help it](https://rc.byu.edu/wiki/index.php?page=Levi%27s+RUN_PATH+article)**. The tutorials and instructions that suggest doing so are almost always wrong. This cannot be stressed enough–using `LD_LIBRARY_PATH` can get you in a world of hurt and make debugging linking issues a nightmare if you don't know what you're doing.



## Installing Software without Root

If you have root access, installing software usually entails putting the binaries into `/usr/bin` and its supporting libraries into `/usr/lib` or `/usr/lib64`. This is what package managers (e.g. `apt`, `yum`, `pacman`) do. 

If you don't have root access you can put the directory that contains the executable into the `PATH` and, if necessary, put the directories that contain supporting libraries into the executable's `RUNPATH`.

Generally installing software this way will involve downloading source code and building it with [CMake](make-and-cmake.md#cmake) or [autoconf](https://www.gnu.org/software/autoconf/) (`configure`). For example, Python 3.11.4 can be downloaded and installed thus:

```shell
# Download and extract
wget https://www.python.org/ftp/python/3.11.4/Python-3.11.4.tgz -O python.tgz
tar xf python.tgz
# Go into a build directory and set up
mkdir bld
cd bld
../Python-3.11.4/configure --prefix=$HOME/python/3.11.4
# Build and install
make -j
make install
```

To modify `PATH` and any other environment variables required for your software to function on the supercomputer, take a look at our [Lmod documentation](https://rc.byu.edu/wiki/?id=Environment+Modules) (especially the "Make Your Own Modulefiles" section) to see how to make a modulefile.
