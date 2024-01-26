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

Put these scripts into a tar file. Compress the tar file using gzip. Submit this `.tar.gz` file through [Canvas](https://byu.instructure.com/courses/25261/assignments).

## Grading

This assignment is worth 15 points. The following deductions, up to 15 points total, will apply:

| Deficiency | Points |
|------------|--------|
| `energize.sh` fails to print the correct information to the right file | 3 |
| `analyze.sh` fails to run `awk` on the correct (and only the correct) `*.nrg` files | 3 |
| `submit.sh` doesn't submit `energize.sh` and `analyze.sh` jobs appropriately | 3 |
| The job ID for the `energize.sh` job isn't passed to `analyze.sh` | 3 |
| Incorrect results | 3 |
| Your tarball isn't organized correctly or doesn't contain each file needed to successfully run | 3 |
