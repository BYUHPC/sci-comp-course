---
---

# Bash Treasure Hunt

For this assignment, you will use several tools you've learned throughout [this lesson](../lessons/2.md) to find a file and filter it to see the message it contains. 



## Prepare

On a Linux machine (preferably the supercomputer), use `wget https://rc.byu.edu/course/treasure_hunt.tar.gz` to download the assignment to a location where you have write permissions such as your home directory. Then extract it using `tar xf treasure_hunt.tar.gz`.

Once you have done so, navigate into `treasure_hunt` and modify the permissions of `which-file` to allow you to execute it.

You will need to load a Julia environment module (e.g. `julia/1.9`) to successfully run `which-file`.



## Find the Hash Seed

`which-file` will fail if the environment variable `TH_SALT` isn't set, or yield an incorrect result if it isn't set correctly. The correct salt is determined by totaling the byte counts of all files in the directory `noisy_files` ending with "`.gz`"

You can find this total using `wc` (word count), giving the glob representing all "`.gz`" files in `noisy_files` as the last argument; search `wc`'s man page for "bytes" to see which flag to use to count bytes. The output of wc will end with something like "`1234 total`"–this is the total byte count. As a quick check, the last 4 digits of the total form a palindrome. 

Set `TH_SALT` to this total, making sure it is available to child processes.



## Get the File Name

With `TH_SALT` set, `which-file` will print the correct filename to stdout, but the result will be muddied by random characters printed to stderr interspersed with the correct filename. To see the unsullied filename, run `which-file`, sending stderr to `/dev/null`.

**Make sure not to modify `which-file`**-–it hashes itself to get the answer, so changing even a character will yield the wrong filename.



## Check Your Work

To ensure that you found the correct file, run `zcat` on the file (located in `noisy_files`) and filter out all lines containing the word "noise". This can be done by piping the output of `zcat` to `grep` and selecting lines not matching "noise;" search the man page on `grep` for 'invert" to see which flag to use. This will result in a message affirming that you have selected the right file. If it doesn't, you probably have the wrong hash seed--it may be worth re-downloading `which-file`, since even an extra space will invalidate its result.



## Submission

Your [assignment submission](https://byu.instructure.com/courses/25261/assignments) will constitute the name of the file and the message contained therein.



## Grading

10 points for a correct answer, 5 points for the correct file but an incorrect message, 0 points otherwise.
