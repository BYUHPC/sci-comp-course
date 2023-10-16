# C++ Threading

[`std::jthread`](https://en.cppreference.com/w/cpp/thread/jthread)s are C++ 20's flagship mechanism for [threading](threading.md). Unlike [OpenMP](openmp.md), adding them to a program means that the program is squarely parallel and must be compiled as such.



## Compiling with C++ Threads

`g++ -pthread ...` will compile with C++ threads; it's usually easy to find the required flag on the man page or the internet for any compiler. `CMakeLists.txt` requires two things: finding the threading package and linking it to a target:

```cmake
# At the top, under the `project` call:
find_package(Threads REQUIRED)
# With other compilation calls
add_executable(blah blah.cpp)
target_link_libraries(blah PRIVATE Threads::Threads)
```



## Using C++ Threads

`std::jthread`s are simple in principle--they spawn, run a function while the main program is executing, then [join](https://en.cppreference.com/w/cpp/thread/jthread/join) automatically. For example, the following program prints arabic numerals in the main thread, latin in the other:

```c++
#include <thread>
#include <chrono>
#include <iostream>

int main() {
    // Latin numerals print in a spawned thread
    auto latin_numeral_thread = std::jthread([]{ // using lambdas to spawn threads is the convention.
        for (auto &numeral: {"I", "II", "III", "IV", "V"}) {
            std::this_thread::sleep_for(std::chrono::milliseconds(50));
            std::cout << numeral << std::endl;
        }
    });
    // Arabic numerals print in the main thread
    for (int i=1; i<=5; i++) {
        std::this_thread::sleep_for(std::chrono::milliseconds(45));
        std::cout << i << " is written as ";
    }
    return 0; // latin_numeral_thread is automatically joined
}

/* Compile with `g++ -std=c++20 -pthread -o numerals numerals.cpp`
 * Output looks like:
 * 1 is written as I
 * 2 is written as II
 * 3 is written as III
 * 4 is written as IV
 * 5 is written as V
 */
```

This is simple enough when no coordination is required, or when clock-based coordination is sufficient as above, but getting threads to synchronize or communicate correctly is challenging. Even getting two threads to interleave the printing of "PING" and "PONG" requires 3 variables dedicated solely to coordination:

```c++
#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>

int main() {
    // Simulation parameters
    const int n_volleys = 4;
    bool pinging = true; // start with PING
    std::mutex mtx;
    std::condition_variable cv;
    // PONG in worker thread
    auto pong_thread = std::jthread([&]{
        for (int i=0; i<n_volleys; i++) {
            std::unique_lock lock(mtx);
            cv.wait(lock, [&]{ return !pinging; });
            std::cout << "PONG!" << std::endl;
            pinging = !pinging;
            cv.notify_one();
        }
    });
    // PING in main thread
    for (int i=0; i<n_volleys; i++) {
        std::unique_lock lock(mtx);
        cv.wait(lock, [&]{ return pinging; });
        std::cout << "PING, ";
        pinging = !pinging;
        cv.notify_one();
    }
    return 0;
}

/* Output:
 * PING, PONG!
 * PING, PONG!
 * PING, PONG!
 * PING, PONG!
 */
```



## Thread Coordination

### C++ Atomics

[Atomic operations](https://www.cplusplus.com/reference/atomic/atomic/) appear to happen instantaneously from the perspective of threads--multiple threads can write to [atomics](https://www.cplusplus.com/reference/atomic/atomic/) without worrying about [race conditions](threading.md#race-conditions-atomic-operations-and-reductions). The tradeoff is a severe performance penalty if you use them heavily--the following example code will do the same thing as [the reduction example code](openmp.md#reductions) and use 20x the CPU time:

```c++
#include <iostream>
#include <atomic>

int main() {
    std::atomic<size_t> counter = 0;
    #pragma omp parallel for
    for (size_t i = 0; i < 20000000; ++i) {
       counter += 1;
    }
    std::cout << counter << std::endl;
    return 0;
}
```

### C++ Mutexes

[`std::mutex`](https://en.cppreference.com/w/cpp/thread/mutex) and [`std::counting_semaphore`](https://en.cppreference.com/w/cpp/thread/counting_semaphore) provide [mutexes and sempahores](threading.md#mutexes-and-semaphores) in C++. It's best to [use](#using-c-threads) [`std::unique_lock`](https://en.cppreference.com/w/cpp/thread/unique_lock) and [`std::lock_guard`](https://en.cppreference.com/w/cpp/thread/lock_guard) rather than locking and unlocking mutexes manually.

### C++ Condition Variables

[Condition variables](https://www.cplusplus.com/reference/condition_variable/condition_variable/) encapsulate the idea of waiting until some condition is true. They have three main methods:

- `wait`
- `notify_one`
- `notify_all`

The example below shows a simple thread-safe queue with `push` and `pop` methods. Safety is ensured by the `condition_variable` and `mutex`. **Take a bit of time to make sure you understand how this works and why it's safe**:

```c++
std::mutex mtx;
std::condition_variable cv;
auto pop(std::queue &queue) {
   std::unique_lock lock(mtx);
   while (queue.empty()) {
      cv.wait(lock);
   }
   return queue.pop();
}
void push(std::queue &queue, auto val) {
   std::unique_lock lock(mtx);
   queue.push(val);
   cv.notify_one();
}
```

### C++ Barriers

Use [`std::barrier`](https://en.cppreference.com/w/cpp/thread/barrier) for [barriers](threading.md#barriers) in C++20.
