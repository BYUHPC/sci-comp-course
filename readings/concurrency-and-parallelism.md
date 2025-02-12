---
---
# Concurrency and Parallelism

## Introduction

Many large tasks can be broken into smaller, manageable pieces to improve efficiency. In computing, concurrency and parallelism allow multiple tasks to be divided in a way that they can progress independently, making better use of available resources.

For example, consider preparing a breakfast consisting of scrambled eggs, muffins, and sliced fruit. Some steps must happen sequentially:

- Cheese must be shredded before being added to the eggs.
- Muffin batter must be prepared before it is baked.

However, many tasks can overlap in progress:

- While waiting for the muffins to bake, eggs can be cooked.
- While waiting for the eggs to cook, fruit can be sliced.

For the sake of the following discussions, a chef in the kitchen is comparable to a CPU core, and a cooking task is comparable to a process or thread.

## Concurrency

[Concurrency](https://en.wikipedia.org/wiki/Concurrency_(computer_science)) is the ability of a system to manage multiple tasks at the same time. These tasks may not necessarily execute simultaneously but are interleaved by the [kernel](https://en.wikipedia.org/wiki/Kernel_(operating_system)) so that no task unfairly hoards all of the time on the processor.

Consider a single chef working in the kitchen to prepare breakfast. The chef may leave the muffins to bake and switch to cooking eggs, but the chef is never physically working on both tasks at once. Similarly, a computer with a single core interleaves multiple processes by rapidly switching execution between them. This is concurrency: multiple tasks making progress without necessarily running simultaneously.

Furthermore, the chef never spends a long, consecutive time on a single task in the kitchen. If the chef were to stay blissfully ignorant of the other items while watching the muffins bake, then the eggs may burn and the fruit would never be sliced. Instead, the chef frequently "checks in" on each task and spends a few moments with each before moving on to the next.

Physically, the switching of contexts and movement between the stove with the eggs to the cutting board with the fruit "wastes" some time where the chef is working on neither of the tasks. In a really busy kitchen, this movement could be constricted by extra bodies in the isles that slow down the time to change from one end of the kitchen to the other end. However, the nature of different tasks in the kitchen and also different kinds of computations on a computer necessitate this kind of rapid context switching to keep many different tasks moving forward with limited computational resources. 

### Concurrency on Computers

<img width="884" alt="image" src="https://github.com/user-attachments/assets/b45e685e-d992-4865-9d95-5c73bd09074e" />

<!-- REPLACING THIS DIAGRAM WITH A SCREENSHOT
```mermaid
---
displayMode: compact
---
%%{ init: { "themeVariables": { "disableZoom": true } } }%%
gantt
    title Concurrency on a Single-Core CPU
    dateFormat  X
    axisFormat %s
    tickInterval 1second

    section Task A
    TA  : taskA1, 0, 3
    TA  : taskA2, 6, 9
    A Complete :milestone, 9,

    section Task B
    TB  : taskB1, 3, 4
    TB  : taskB2, 12, 13
    TB  : taskB3, 15, 18
    B Complete :milestone, 18,

    section Task C
    TC  : taskC1, 4, 6
    TC  : taskC2, 9, 12
    TC  : taskC3, 13, 15
    C Complete :milestone, 15,
```
-->

A computer system is described as "executing concurrently" when a single CPU core is assigned multiple tasks. In this case, the core is only ever working on a single task at a time, although multiple tasks are overlapping in progress.

### Concurrent Eligibility

In the breakfast example, the muffins, eggs, and fruit can each be handled concurrently because they are independent of each other.

Mathematically, operations that follow the [associative property](https://en.wikipedia.org/wiki/Associative_property) (e.g., addition and multiplication) lend themselves well to concurrency:

$$1 + (2 + 3) = (1 + 2) + 3$$

$$1 \times (2 \times 3) = (1 \times 2) \times 3$$

These operations can be structured in a way that different segments of a computation can make progress without requiring strict ordering. However, not all kinds of computation can be reordered and cannot be broken into concurrent parts. For example:

$$1 \div (2 \div 3) \ne (1 \div 2) \div 3$$

Therefore, in order to make tasks compute faster, the designer must first find creative ways to break the task into smaller chunks while preserving the correct answer.

### Example

A classic computing example of concurrency is the `make` build system. A Makefile specifies dependencies between targets, forming a partial order. If certain targets are independent, `make` can schedule them to be built concurrently. However, if a system has only one CPU core, these independent tasks will not truly run at the same time; rather, the system will switch between them rapidly.

## Parallelism

Parallelism is a specific form of concurrency in which multiple tasks execute at the same time, requiring multiple CPU cores. While concurrency often requires structuring tasks to allow independent progress, parallelism is about physically executing multiple tasks simultaneously.

Returning to the breakfast example, concurrency allows the tasks to be interleaved, but true parallelism occurs if multiple people are cooking at the same time—one person frying eggs while another slices fruit and another bakes muffins. The work is not just structured efficiently; it is actually happening simultaneously.

Importantly, **parallelism requires concurrency, but not all concurrency leads to parallel execution**. A concurrent algorithm can execute in parallel if the hardware allows it, but on a single-core processor, it will still rely on task switching rather than true simultaneous execution.

### Parallelism on Computers

<img width="868" alt="image" src="https://github.com/user-attachments/assets/2ba29142-d8b1-4b29-9471-df62f6a2dd8d" />

<!-- REPLACING THIS DIAGRAM WITH A SCREENSHOT
```mermaid
---
displayMode: compact
---
%%{ init: { "themeVariables": { "disableZoom": true } } }%%
gantt
    title Parallelism on a Multi-Core CPU
    dateFormat  X
    axisFormat %s
    tickInterval 1second
    
    section Task A
    TA  : taskA1, 0, 3
    TA  : taskA2, 3, 6
    A Complete :milestone, 6,

    section Task B
    TB  : taskB1, 0, 1
    TB  : taskB2, 1, 2
    TB  : taskB3, 2, 5
    B Complete :milestone, 5,

    section Task C
    TC  : taskC1, 0, 2
    TC  : taskC2, 2, 5
    TC  : taskC3, 5, 7
    C Complete :milestone, 7,
```
-->

In computing, parallelism occurs when multiple cores or processors execute independent tasks at the same time.

A system is described as "executing in parallel" when multiple cores are simultaneously computing different tasks.

Even when a computer has multiple cores, it may still be "executing concurrently" when there are more active processes than cores available. In this case, each of the cores individually handles multiple processes concurrently.

### Example

For example, in array summation, a concurrent approach might involve breaking the array into sections and scheduling computations to interleave on a single-core processor. A parallel approach, in contrast, would assign different sections to multiple CPU cores, where each core performs computations simultaneously before combining the results.

For more details, refer to [section 2.1 of HPC Tutorials volume 1](EijkhoutHPCTutorialsVol1.pdf#chapter.2).


