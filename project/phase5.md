---
---

# Phase 5: Group Optimization

For this assignment, you will discuss what you did to speed up the C++ program from the [first optimization assignment](phase3.md) in groups of 3-5, and **spend a at least 3 more hours using your group's insights to optimize the program a bit more**.

The "discussion" can take any reasonable form you would like, ranging from sharing your notes and a few messages on Slack to meeting in person for three hours to work on optimizing your programs together. By default I will assign your groups randomly, but if you have partners in mind send me a message to let me know your choice of group.

Amend the notes you wrote for the original assignment with updated timing information and discussion about what else you tried after talking with your group, **making clear which optimizations are new**. If you have already tried everything brought up by your group (e.g. if you spent way more than a few hours on the original assignment), that's okay--your new optimizations don't have to come from any [particular source](phase3.md#other-optimizations).



## Submission

In similar fashion to the [first optimization assignment](phase3.md#submission), push a commit tagged `phase5` containing your updated code and `cpp-optimization.txt`.



## Grading

This phase is worth 15 points. The following deductions, up to 15 points total, will apply for a program that doesn't work as laid out by the spec:

| Defect | Deduction |
| --- | --- |
| Failure to compile `optimize` | 4 points |
| Failure to run successfully (e.g. due to a segmentation fault or hang) | 4 points |
| Failure of `optimize` to output "5.39", and only "5.39", to stdout | 4 points |
| Failure of `optimize` to run within a second on `m9` with 8 threads | 4 points |
| `optimize` isn't relevant to the assignment, just prints "5.39" or similar, or hasn't undergone any significant change since phase 3 | 8 points |
| The informal essay doesn't answer the [questions in phase 3](phase3.md), the answers are nonsensical, or no significant changes have been made since phase 3 | 1-8 points |
| The informal essay doesn't clearly denote which changes are new | 4 points |

An extra credit point will be awarded to submissions that run in less than 0.1 seconds with 8 threads on `m9`.
