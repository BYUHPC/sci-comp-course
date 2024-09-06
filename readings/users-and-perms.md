---
---

# Users and Permissions

## What are Permissions?

Permissions grant others the ability to read, write, and execute files. Linux file permissions are important to understand as you collaborate with fellow researchers on the supercomputer. It is quite easy to modify the permissions of files you own. Read, write, and execute permissions have different meanings depending on whether the listed item is a file or a directory.

### Permissions for Files and Directories

Bolded attributes are essential to know; others are good to know.

| Attribute | Abbreviated | File meaning | Directory meaning |
| --- | --- | --- | --- |
| **readable** | `r` | can view | can list with `ls` |
| **writeable** | `w` | can edit | can delete, rename, add files |
| **executable** | `x` | can run | can access |
| `suid` | `s` | all users can execute with owner's privileges | N/A |
| `sgid` | `s` | all users can execute with group's privileges | newly created directories will mimic parent permissions |
| sticky bit | `t` | N/A | only file owner can delete or rename |

Being able to 'access' a directory with executable permissions means being able to enter into the directory and access the files inside. 



## User Sets

User sets define who has which permissions for a file. The letters r, w, x, - represent the permissions read, write, execute, and no permissions in that order. Each user set will have some combination of those letters to represent their permissions for a specific file. For example:

```shell
$ ls -l # performs a long listing of files in a directory
total 24
drwxr-xr-x 2 root root 4096 Oct 9 16:28 cataction
drwxr-xr-x 2 root root 4096 Oct 9 16:28 catcomedies
drwxr-xr-x 2 root root 4096 Oct 9 16:28 catdocumentaries
drwxr-xr-x 2 root root 4096 Oct 9 16:28 catdramas
drwxr-xr-x 2 root root 4096 Oct 9 16:28 cathorror
drwxr-xr-x 2 root root 4096 Oct 9 16:28 catnovels 
```

At the beginning of each line, you can see the letter combinations of `rwx`, `r-x`, and `r-x`. These combinations represent the permissions for three distinct user sets: user (`u`), group (`g`), and other (`o`).

The user sets are in order of user, group, and other. Let's break down an example with the directory cataction where pipes ( `|` ) have been added to more clearly see the distinction between user sets:

```
 | u | g | o |
d|rwx|r-x|r-x| 2 root root 4096 Oct 9 16:28 cataction
```

As an example, the following user has read access to `file_a` and `file_b`, and write access to `file_a`:

```shell
$ whoami
user
$ groups
g1 g3
$ ls -l
total 0
-rw-r----- 1 user g1 0 Sep  5 15:50 file_a
-rw-r----- 1 abc  g3 0 Sep  5 15:50 file_b
-rw-rw-r-- 1 abc  g2 0 Sep  5 15:50 file_c
```



## Changing Permissions

The command chmod will allow you to change permissions for user sets. The user, group, and other categories each represent their permissions with a single octal value–a value ranging from 0 to 7 (8 possible values). Values are then added together to define the permissions for each user group (e.g., a value of 7 would represent `rwx` whereas a value of 5 represents `r-x`). When you use chmod to change permissions, it takes three octal values. The first value represents the user's permissions, the second is the group's permissions, and the third is the other permissions.

| Attribute | Abbreviation | Value |
| --- | --- | --- |
| read | `r` | 4 |
| write | `w` | 2 |
| execute | `x` | 1 |

An example of how to use octal values with `chmod`:

```shell
$ chmod 750 myfile
rwxr-x---
# user can read/write/execute (4+2+1); group can read/execute (4+1); other can do nothing (0)
```

The letter representations can also be used, at the expense of brevity:

```shell
chmod u+rwx,g+rx-w,o-rwx myfile # equivalent to above
```

`+` adds permissions; `-` subtracts permissions.



## Changing Ownership

Let's revisit `user`'s access:

```shell
$ whoami
user
$ groups
g1 g3
$ ls -l
total 0
-rw-r----- 1 user g1 0 Sep  5 15:50 file_a
-rw-r----- 1 abc  g3 0 Sep  5 15:50 file_b
-rw-rw-r-- 1 abc  g2 0 Sep  5 15:50 file_c
```

What if `user` wants to give read permission on `file_a` to `person`, another member of the group `g3`?

`chown` can be used to change ownership of the file (requires root):

```shell
chown person file_a
```

Since root access is not guaranteed, changing groups with `chgrp` is often a better option:

```shell
$ groups person # which groups is person a member of?
g2 g3
$ chgrp g3 file_a
```



## Warning: Opening Permissions

Opening permissions to `777` will allow anyone to do anything to a given file; it can make life easier, but consider the security risk before doing so.
