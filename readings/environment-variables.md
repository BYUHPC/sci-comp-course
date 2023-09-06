---
---

# Environment Variables

Environment variables are defined in a shell session and are a set of names and values. Often, they're used to set configuration settings. 

Environment variables are used extensively on the supercomputer for setting up parallel processing, the scheduler, and the software that you run. Many examples here assume that you use the `bash` shell. Using `fish` or some other shell will require different commands.

### Defining Environment Variables

Some environment variables are already defined form the moment you open a shell--for example:

- `$USER`: your username
- `$HOME`: your home directory
- `$PWD`: the current directory
- `$PATH`: where utilities are located

Here's how to define an environment variable for the current process only:

```shell
$ CATFOOD='Whiskas' # no spaces around the equal sign!
$ echo $CATFOOD
Whiskas
```

Defined this way, the variable will not carry over into child processes' environments. Running `script.sh` forks a new process which tries to print out `$CATFOOD`, but `CATFOOD` isn't defined in its environment:

```shell
$ CATFOOD='Whiskas'
$ echo $CATFOOD
Whiskas
$ ./script.sh
CATFOOD is set to ''
```

If you want child processes to have access to an environment variable, use `export`:

```shell
$ export CATFOOD='Fancy Feast'
$ echo $CATFOOD
Fancy Feast
$ ./script.sh
CATFOOD is set to 'Fancy Feast'
```

### `PATH`

The `PATH` environment variable is a colon-delimited list of paths on the system. When we attempt to run `ls`, the shell will try to locate the `ls` utility in the first listed directory of path:

```shell
ls ---> PATH=/usr/local/bin:/usr/bin:/bin
             /usr/local/bin/ls
```

In this case, `ls` is not a utility in `/usr/local/bin`. So, the shell moves on and checks the next listed directory for `ls`:

```shell
ls ---> PATH=/usr/local/bin:/usr/bin:/bin
             /usr/local/bin/ls # not found
                            /usr/bin/ls
```

It's not there either, so the shell will continue along `PATH`, finding `ls` in the next directory:

```shell
ls ---> PATH=/usr/local/bin:/usr/bin:/bin
             /usr/local/bin/ls # not found
                            /usr/bin/ls # not found
                                     /bin/ls
```

The shell then runs `/bin/ls`, although all you typed was `ls`. If you have the same tool installed in multiple places, your `PATH` will determine which to run.



## Environment Modules

Environment modules allow us to install many versions of the same piece of software without chaos. Read the first section of [the page about them on our website](https://rc.byu.edu/wiki/?id=Environment+Modules), and skim over the rest to get familiar with what's possible.



## Shell Commands

You should be familiar with the following commands; run the examples to see what they do:

| Command | Purpose | Examples |
| --- | --- | --- |
| `echo` | print to stdout | `echo "My netid is $USER"` |
| `env` | print all environment variables | `env | grep $USER` |
| `which` | find a command within `$PATH` | `which cat`<br/>`which fake_command` |
