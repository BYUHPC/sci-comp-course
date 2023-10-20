---
---

# Concurrency and Parallelism

## Concurrency

[Concurrency](https://en.wikipedia.org/wiki/Concurrency_(computer_science)) is the property of a system which enables units of the program, algorithm, or problem to be executed out-of-order or in partial order without affecting the final outcome.

Preparing a breakfast of cheesy eggs, muffins, and sliced fruit is a concurrent process. Each task has some ordering:

- Cheese has to be shredded before it's added to the eggs
- Muffin dough must be made before it's baked

...but there is some independence as well:

- Cheese can be shredded simultaneously with the slicing of fruit
- Muffin dough can be made while the eggs are being cooked

`make` also takes advantage of concurrency. Makefiles state which targets exist and what dependencies each target has. When targets depend on other targets, this creates a partial ordering. If the recipes are written correctly, they can be executed independently. These two aspects, the partial ordering and their ability to be executed independently, establish concurrency.

Any [associative](https://en.wikipedia.org/wiki/Associative_property) operation is concurrent. Addition and multiplication are concurrent:

$$1 + (2 + 3) = (1 + 2) + 3$$

$$1 \times (2 \times 3) = (1 \times 2) \times 3$$

...while division is not:

$$1 \div (2 \div 3) \ne (1 \div 2) \div 3$$



## Parallelism

Parallel processing is computation where multiple units of work happen simultaneously. **Parallel processing is enabled by concurrency**.

In the recipe example above, one person could be preparing eggs while another prepares muffins. `make` takes advantage of the inherent concurrency of Makefiles by executing multiple independent compilations simultaneously. Given an array of many numbers, multiple threads can independently sum sections of the array and aggregate their results for the final sum.

Read [section 2.1 of HPC Tutorials volume 1](EijkhoutHPCTutorialsVol1.pdf#chapter.2).
