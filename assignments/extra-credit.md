---
---

# Extra Credit

## Finding Errors

You can get up to 2 points of extra credit for finding errors in the course--this includes typos, broken links, etc. The first time you'll get 1 point, the second time 1/2 point, the third 1/4 point, etc. We prefer [pull requests](https://github.com/BYUHPC/sci-comp-course/compare) when possible.

Since **the course is a work in progress**, material that hasn't yet been created doesn't constitute an error.



## Project

You'll get a point of extra credit for each of the C++ project phases (besides the [first one](../project/phase1.md)) that you generalize to N dimensions (1 through 10 must work, beyond that is optional). This means that *any* input file in the [example input and output files](https://rc.byu.edu/course/wavefiles.tar.gz) should be taken by your program and result in an output file that matches the reference, rather than only the `*2d*` ones. Performance must still adhere to the standards of each project, so you'll probably need [template metaprogramming](../resources.md#typical-knowledge-gaps) to avoid needing to create indices dynamically. Here's an outline of how that might look:

```c++
// A for_each-style function that allows the loop index to be used as a template parameter for the supplied function
// To run F<1>(), then F<2>(), then F<3>(), use constexpr_for<1, 3>(F)
template <size_t First, size_t Last>
constexpr void constexpr_for(auto F) {
    if constexpr (First <= Last) {
        F.template operator()<First>();
        constexpr_for<First+1, Last>(F);
    }
}

int main(int argc, char **argv) {
    // "Parse" and get dimension of input wave orthotope
    auto infile = argv[1], outfile = argv[2];
    const size_t dims = /* READ FIRST size_t FROM INFILE */;
    // Read infile, solve, and write outfile
    constexpr_for<1, 10>([dims, infile, outfile]<size_t N>{
        if (dims != N) return;
        auto w = WaveOrthotope<N>(infile);
        w.solve();
        w.write(outfile);
    });
    return 0;
}
```

If this looks like gibberish to you, it's unlikely that the extra credit will be worth the effort.

Given the heavy templating that will probably be involved, I would recommend testing with up to three or four dimensions while developing, and only compiling for up to 10 dimensions when you're almost sure you're done--compilation will likely take a lot of time and memory with that many dimensions.



## Custom

If you have an idea to improve the course (e.g. elucidating example code, a few extra paragraphs for clarity, an assignment that yields the same learning for less effort) and would like extra credit, let us know and we can probably arrange something.
