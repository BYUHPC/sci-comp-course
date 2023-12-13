---
---

# Accelerators

Accelerators are hardware components designed to speed up specific types of computations, executing them more quickly and efficiently than a CPU could.



## GPUs

[GPUs (graphics processing units)](https://en.wikipedia.org/wiki/Graphics_processing_unit) are the most familiar accelerators to most people, and were as their name implies originally designed for rendering graphics. To that end, they have huge numbers of simple cores designed for parallel processing. On a GPU, lots of space is dedicated to arithmetic units to allow simultaneous, straightforward computation on multiple data elements; comparatively little infrastructure is in place to enable complicated things like caching and branch prediction. [GPUs are thus good at doing many simple things at once](https://www.youtube.com/watch?v=-P28LKWTzrI), but aren't as capable as CPUs of complex control flow. They have higher memory bandwidth and higher latency than CPUs since they're optimized for tasks that require access to large datasets, even if individual accesses are slower.

Matrix manipulation is a quintessential task that GPUs are well-suited to, which is why they're so helpful for [some kinds of machine learning](https://www.3blue1brown.com/topics/neural-networks). Most modern supercomputers have GPUs since many scientific programs are amenable to GPU acceleration.



## FPGAs

[FPGAs (field programmable gate arrays)](https://en.wikipedia.org/wiki/Field-programmable_gate_array) consist of arrays of programmable logic blocks and configurable interconnects that can be tailored to implement custom digital circuits--you can think of them as (much more complex) [breadboards](https://en.wikipedia.org/wiki/Breadboard). They can be configured to perform many operations simultaneously, taking advantage of spatial parallelism. They are programmed using Hardware Description Languages (HDL), such as VHDL or Verilog, effectively allowing developers to design custom circuits. This hardware-level customization allows them to perform niche tasks more quickly and/or efficiently than a CPU could.

This specialization does mean that FPGAs are generally more expensive and harder to program than CPUs. Once an FPGA is "programmed," it is usually left that way, and can't be used for general-purpose computation like a CPU can. Since their use is so niche, supercomputers generally don't have them.



## ASICs

[ASICs (Application-Specific Integrated Circuits)](https://en.wikipedia.org/wiki/Application-specific_integrated_circuit) are the logical conclusion of the concept of FPGAs--rather than being field-programmable, they're manufactured for one specific application, and once they leave the factory their purpose is rigidly defined. As an example, the video decoding hardware on a CPU is essentially just a tiny ASIC fabricated in-place. They can be even faster and more efficient than FPGAs, but have no versatility. As such, they don't play much of a role in scientific computing.
