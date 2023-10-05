---
---

# Threading

A quick review of relevant CPU architecture and operating systems:

- Modern CPUs typically have more than one core
- Each core executes independently from the other cores
- Each core has its own small cache
- All cores usually have a shared cache as well
- Each OS process has at least one thread
- All threads in a process share memory and other resources
- Processes and threads may move around to different cores over their lifetimes.

The main motivation for multi-processing/multi-threading is to take advantage of those multi-core processors. In general, when we refer to a thread, we are talking about an operating system thread. But what is a thread? A thread executes a sequence of CPU instructions inside of a process space. Each thread in a process executes independently from other threads. Each thread has its own private stack and has a shared address space (heap).

## Pros and Cons of Threading

Threads are nice:

- It takes less time to create a new thread than it does to create a new process.
- It takes less time for a CPU to switch to another thread within the same process.
- It takes less time for a thread-to-thread communication to complete than a process-to-process communication. (Not necessarily always true, but as a generalization, it's good enough)

...but they have some drawbacks:

- If a single thread dies, then the whole process dies. This means you may not be able to clean up the other tasks nicely. If we choose processes, then maybe the other processes can continue with their job (e.g., Google Chrome using a process per tab).
- There is no automatic shared memory protection.

The second is critical: what happens if two processes try to write to the same memory address? We'll use the following code for this example:Consider these two threads that share the variable `count`, which has been set to 4. What happens when `++count` is executed?

```c++
void inc(int &count) {
   ++count;
}
```

The assembly that results from compiling this might look something like:

```asm
inc(int &):
  movl   (%rdi), %eax ; fetch
  addl   $1, %eax     ; increment
  movl   (%eax), %rdi ; store
  ret
```


NOT DONE YET