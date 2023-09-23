---
---

# Checkpointing

Checkpointing is a technique to save a program's state so that it can be restarted again later. This is a form of [fault tolerance](https://en.wikipedia.org/wiki/Fault_tolerance), the property that enables a system to continue properly in the event of the failure of some of its components.

Checkpointing is not a particularly effective form of fault tolerance. In its basic form, when the system faults the work does not continue, but can be picked up from the last checkpoint which means not all work is lost. However, in a batch-scheduled environment that is common in HPC, checkpointing is still an important form of fault tolerance.

Consider a job that uses 100 nodes (somewhere around 3,000 cores). It is significantly more likely that hardware failure will happen in such a job than in a node which only uses 1 node (24-128 cores). What if hardware failure happens 50 hours into the 100 node job? 5,000 CPU hours would be wasted without checkpointing.

Some HPC sites have requirements that all code that runs on their system must be able to checkpoint every X hours. Checkpointing can help researchers run programs longer than the maximum walltime set by system administrators. For example, on the Fulton Supercomputing Lab systems, we have walltimes set at 1 day, 3 days, and 7 days. you are partially restricted where you can run based on the time you request for your job. However, no job can run more than 7 days on our system without special permission (which is granted infrequently).



## Reproducing Bugs

Checkpointing can also be helpful when reproducing bugs. If a checkpoint can be obtained just before the bug happens, it can make reproducing it much easier.

Consider a program which has an issue 60 minutes into runtime under normal job execution. Now, imagine starting from scratch under a debugger which is slower, often much slower. Instead, start the program without the debugger, save a checkpoint closer to the actual issue, and terminate the program. Then start from the checkpoint under the debugger.

The checkpoint file can also be shared so other developers can observe the bug themselves.



## How Checkpointing Works

There are two forms of checkpointing: internal and external.

**Internal checkpointing** (or application checkpointing) is done by the application itself. It is aware of which state must be preserved and what format it should be saved in.

**External checkpointing** is done by another application. It is unaware of which state must be preserved and preserves the entire program state. 

What benefits can you see from each method? It may be helpful to consider our solver program. At what point(s) during execution does it make sense to checkpoint? After each iteration? After every N iterations? How would internal and external checkpointing look different in this case?

External checkpointing is harder since saving everything is usually overkill. It's especially difficult for multi-node jobs.



## External Checkpointing

External checkpointing is not aware of what data is essential to save and so it must attempt to save everything it can, including:

- File descriptors and state of open files
- Signal handlers, masks and pending signals
- Virtual address space and registers
- Thread and process state of multi-process and multi-node programs
- Process ids (PIDs) and relationships between them

There are 3 common tools for doing external checkpoints: [BLCR](https://crd.lbl.gov/divisions/amcr/computer-science-amcr/class/research/past-projects/BLCR/) (Berkeley Lab Checkpoint/Restart), [CRIU](https://criu.org/Main_Page) (Checkpoint/Restore in Userspace), and [DMTCP](https://dmtcp.sourceforge.io/) (Distributed MultiThreaded Checkpointing). BLCR requires Linux Kernel 2.6-3.7. It's historically popular, but its development is in decline, so it is not recommended. CRIU is far more popular with Docker containers than large-scale HPC because it does not support checkpointing MPI programs. Finally, DMTCP is the least widely used solution, but does support MPI programs. This is the currently recommended solution for external checkpointing in HPC.



## DMTCP Example

`count.py` is a demo python script that simply outputs a number, sleeps, then increments the number all in a loop:

```python
import time

i = 0
while True:
   print(i)
   time.sleep(1)
   i += 1
```

Here's how one might run this with DMTCP so `count.py` could resume after failure:

```bash
module load dmtcp
dmtcp_launch python3 count.py &
dmtcp_command --checkpoint -k
./dmtcp_restart_script.sh
```

Notice the '`&`' at the end of the launch command—it's started in the background, then the checkpoint command checkpoints, then kills it (the `-k` flag). A script called `dmtcp_restart_script.sh` will be created by the checkpoint command; it resumes the process from where it was last checkpointed.

You can also checkpoint at a fixed interval:

```bash
# interval is in seconds (6 seconds)
dmtcp_launch --interval 6 python count.py

# when restarting from checkpoint
./dmtcp_restart_script.sh --interval 6
```

In a scheduled environment, it can be a little tricky to call the right commands at the right time. Signal handlers may be helpful. For additional information, [this article on system signals](https://rc.byu.edu/wiki/index.php?page=How+can+I+handle+system+signals+in+my+job%3F) and [this article on using the local hard drive on the node](https://rc.byu.edu/wiki/index.php?page=How+do+I+use+the+local+hard+drive+on+the+node%3F) may be helpful.
