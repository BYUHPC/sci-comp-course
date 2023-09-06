---
---

# Processes

Any program running on a Linux machine is a **process**. These processes have a parent-child organization that forms a tree-like hierarchy.

New processes are created when you run a command in your bash shell. For example, if you run `top`, the bash program will run `fork()` to create a new process. In this case, bash is the parent process and top is the child process. We commonly phrase it such that a parent "forks" a new process.

### Process Tree

`init` is the first process in the tree. Each process has a user id (UID), a process ID (PID), and a parent process ID (PPID). The UID determines what the process is allowed to do. If a process dies, but already forked children, then any children are reparented to `init`.

When you log into the supercomputer, how many processes are created? The supercomputing login server has an SSH server program called `sshd` (SSH Daemon), which listens for incoming connections. When you first run `ssh`, you're establishing a connection with that program. `sshd` then forks off a child process that handles authentication and data exchange for your session. Once authenticated, the `sshd` that handles your connection forks off another child which becomes the shell. If someone else were to connect, the process is the same.



## Shell Commands

You should become familiar with `ps` and `htop`--run the following examples to see what results:

| Command | Purpose | Examples |
| --- | --- | --- |
| `ps` | Shows currently running processes | `ps -u $USER`<br/>`ps -aux` |
| `htop` | Dynamically display running processes | `htop`<br/>`htop -u $USER` |
