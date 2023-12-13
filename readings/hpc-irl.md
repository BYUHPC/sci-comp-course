---
---

# Supercomputing in the Real World

Using a supercomputer isn't usually as structured an exercise as this class has been. As with most other aspects of research, you'll likely have a *lot* of leeway in choosing how to do your computation. This demands strategic planning and the ability to find the right path from many.

Read the [preface of *The Science of Computing*](../readings/EijkhoutHPCTutorialsVol1.pdf).



## Language Choice

Before diving into coding, invest time in understanding which programming languages are commonly used in your field. If you're working on a problem with existing solutions in Python, or if the community in your domain prefers C++, use Python or C++. Your choice should be driven by efficiency and suitability for high-performance computing. For instance, while R might be acceptable for statistical analysis, it would be a poor choice for writing a matrix solver intended for a supercomputer. If you're programming for a supercomputer, **don't use a language or framework just because you know it**--that's fine for problems where developer time dwarfs computation time, but code meant for the supercomputer should be efficient, and a solid foundation in appropriate tools is critical.

Consider also that the best approach might not involve programming--utilizing pre-built tools instead is often more efficient. If you can use an established CFD solver and a config file rather than writing your own code from scratch, for example, you'll save a lot of time.



## Using Existing Work

Scour GitHub, research papers, and AI models like ChatGPT for insights or existing solutions. Connect with professionals in your field to gather their experiences and recommendations. If you can use an existing matrix solver in your language of choice rather than reinventing [GMRES](https://en.wikipedia.org/wiki/Generalized_minimal_residual_method), do so. Just as [a couple months in the lab can save a couple hours in the library](https://en.wikiquote.org/wiki/Frank_Westheimer), a year in an IDE can save a day on GitHub.

In addition to looking for code related to your field, think about your algorithm. Are there other fields that use similar algorithms where insights or code might be found? Have math or computer science researchers recently found a more efficient way to accomplish what you're trying to do? Are you using a generalist approach despite having special information that may allow algorithmic shortcuts? For example, if you're modeling a system that can't quite be simulated as a differential equation and you're thus planning to use brute force machine learning, consider instead [pairing a differential equation solver with a neural network](https://docs.sciml.ai/Overview/stable/showcase/missing_physics) for much greater training efficiency.
