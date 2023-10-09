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
- It generally takes less time for a thread-to-thread communication to complete than a process-to-process communication.

...but they have some drawbacks:

- If a single thread dies, then the whole process dies. This means you may not be able to clean up the other tasks nicely. If we choose processes, then maybe the other processes can continue with their job (e.g., Google Chrome using a process per tab).
- There is no automatic shared memory protection.

The second is critical: what happens if two processes try to write to the same memory address? We'll use the following code for this example:

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

Imagine that two threads share the variable `count`, which has been set to 4. What happens when `++count` is executed by each thread?

This depends on when the threads execute each operation relative to each other. In the case where they happen to execute sequentially:

```shell
# Thread 1      # Thread 2
fetch
increment
store
                fetch
                increment
                store
```

...`count` will end up as 6 like we expect. If the threads overlap in time while executing, though, there's a problem:

```shell
# Thread 1      # Thread 2
fetch
increment       fetch
store           increment
                store
```

The issue is that thread 2 fetches the value for count before thread 1 stores the new value. The end result is 5 which is not what we want. This is called a **race condition**.



## Coordination

### Race Conditions, Atomic Operations, and Reductions

The video below makes use of OpenMP, which we don't go over until the [next lesson](openmp.md), but you don't need to understand much about it to follow what's happening.

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/cxAKr9-5YqU?si=_rwhviI11TPQyXyc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

If any task is writing to a resource (e.g., memory or disk), then no other tasks should be reading from or writing to that same resource. This is true whether your task is a process or a thread. In either case, if someone is writing, nobody should be reading.

What about parallel reads of the same resource? Is that safe assuming no tasks are writing to it? Yes, these parallel reads are safe because if the value is not being changed by any other task, then the reads will obtain the same value.

How can we fix that race condition from above? One way is to use atomic operations. **Atomic operations** (or atomics) are operations that appear to the rest of the system to happen instantaneously.

### Mutexes and Semaphores

You may run into a situation where the operations you need to do aren't atomic or if your hardware doesn't have all the atomics you need. This is where other synchronization primitives come in–you have to coordinate manually.

A **mutex** can be used to control access to a critical section (i.e., a section of code which must be serialized, meaning it is executed by only one worker at a time). A mutex supports lock and unlock operations. Think of a mutex like a [talking stick](https://en.wikipedia.org/wiki/Talking_stick)--just as only the one holding the stick may speak, only the thread that holds the mutex may access a given section of code.

A **semaphore** can be thought of as an $$n$$-mutex--it allows up to $$n$$ threads to access a section of code at once, rather than just 1.

### Barriers

When a thread hits a **barrier**, it will wait until all the other threads subject to the barrier arrive before proceeding. Allowing the threads to sync up in this way can be used to ensure that variables mutated by all threads (e.g. a large array) are in a consistent state before the program proceeds.

### Deadlock

**Deadlock** is a situation where progress cannot be made. In computing, it generally refers to when a task is waiting for an action that will never occur. Deadlock is part of what makes debugging threaded programs a bit more intense than scalar programs.

A good way to visualize this is the [dining philosophers problem](https://en.wikipedia.org/wiki/Dining_philosophers_problem), where $$n$$ philosophers are at a table with $$n$$ utensils between them. Each philosopher needs two utensils to eat. If every philosopher picks up their left utensil and waits for the right to become available, then deadlock will be achieved: all philosophers will have only one utensil and all will be waiting for their right which won't occur.

Deadlocks can be avoided by taking care to lock and unlock semaphores and mutexes in the right order and by using barriers to ensure consistent state.
