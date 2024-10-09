---
---

# Shell and Slurm Practice

This assignment will provide practice for various Slurm commands and features such as job arrays and job dependencies. You will write 3 or 4 small scripts for this assignment: 

- `energize.sh`
- `analyze.sh`
- `submit.sh`
- `analyze.awk` (optional)

## `energize.sh`

The first script, `energize.sh`, will be a bash script that gets submitted as a job array in Slurm. It will print the following information to a file named `$SLURM_ARRAY_JOB_ID.$SLURM_ARRAY_TASK_ID.nrg`: the `$SLURM_ARRAY_TASK_ID`, followed by a space, followed by a random integer (which can be obtained with `$RANDOM`), hence referred to as that task's "energy."

Note that Slurm has an option to control the name of the output file–you are not required to use it, but it may be helpful. Search the sbatch man page for `--output` and `filename pattern`; you'll want the symbols `%A` and `%a` for this job script.

## `analyze.sh`

The second script, `analyze.sh`, will be a bash script that gets submitted as a job dependency in Slurm. It will be dependent on the job id from submitting the `energize.sh` script. This script will read all the files from a given job array and pipe the output to `awk`. The output from `awk` should be a single task id and value pair. This should be the pair that has the smallest "energy" value from all tasks of the array. The `analyze.sh` script must have no other output. The fourth script, `analyze.awk`, is optional. If you decide that your call to `awk` is too large to embed directly in the bash script, then you may put it in `analyze.awk` instead.

## `submit.sh`

The third script, `submit.sh`, will be run on the login nodes (with `bash`, not `sbatch`) and submit a job array of size 10 that runs `energize.sh`, once per array task. It will then parse the job id from running sbatch (search the `sbatch` man page for "parsable") and submit a second job that is dependent on the first completing successfully; if the first job fails, the second job should not run. The second job will run `analyze.sh`. You will need to pass the job id from the first job to the `analyze.sh` either as a command line argument or an environment variable.

**Make sure not to run `submit.sh` from a node-local directory like `/tmp` or `/dev/shm`**--if you do so, no outfile will show up since the job will try to write it to the compute node's storage rather than the storage of the node you're on.

## Submission
Turn in all of the shell scripts created during this exercise by commiting them to your repo with an object (a branch or tag) named `shell-and-slurm-practice`. Make sure **all** the script files are available at the root directory and **none** of the generated `slurm-*.out` or `*.nrg` files are included in the commit.

While you could include all your other files from the `wave_orthotope` project in this branch, that is both _less than ideal_ and _not necessary_. Consider creating a new branch not based off of the original development for this project. This can be easily done with the command `git switch --orphan NEW_BRANCH_NAME`.

Here is one sequence of `git` commands which can be used to submit the files in the appropriate format (see the [git readings](../readings/git.md) for convenience methods):
```bash
git config push.autoSetupRemote true                # This is a one-time command that will automatically create branches on the remote based on the local branch name

git switch --orphan shell-and-slurm-practice        # Creates a new branch without the files nor history from the previous branch
git add *.sh                                        # Adds all shell script files in the root directory to the staging area (don't include other unrelated files)
git commit -m "Submit shell and slurm practice"     # (Or your own commit message.) Commits the changes to the branch
git push                                            # Push the changes to the remote server
git switch main                                     # (Or "master"). Return to your main project branch
```


## Grading

This assignment is worth 15 points. The following deductions, up to 15 points total, will apply:

| Deficiency | Points |
|------------|--------|
| `energize.sh` fails to print the correct information to the right file | 3 |
| `analyze.sh` fails to run `awk` on the correct (and only the correct) `*.nrg` files | 3 |
| `submit.sh` doesn't submit `energize.sh` and `analyze.sh` jobs appropriately | 3 |
| The job ID for the `energize.sh` job isn't passed to `analyze.sh` | 3 |
| Incorrect results | 3 |
| Your repo isn't organized correctly or doesn't contain each file needed to successfully run | 3 |
