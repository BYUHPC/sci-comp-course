---
---

# Storage

How you store and access data from storage has a great effect on how quickly you can read/write data, and how efficiently you store the data (i.e., how much space it takes up). There are several steps that can be used to optimize both factors.

At the scale of the project for this class, you probably won't have a problem, no matter how you read and write. With real-world data and sizes, though, it can be a big deal.



## Measuring Storage

The most important measures of a storage system are:

- **Capacity**: how many [MiB/GiB/TiB](https://ozanerhansha.medium.com/kilobytes-vs-kibibytes-d77eb2ff6c2a) the system can hold
- **Bandwidth**: the data transfer rate the storage can sustain
- **IOPS**: the amount of I/O operations the system can perform per second



## I/O Patterns

When you access a file, either for read or write operations, how much you access at a time is extremely important. Each read incurs a certain penalty, no matter how much data is accessed. Accessing 1MiB of a file 10 times is slower than accessing 10MiB once.

![I/O access patterns](../img/io-access-patterns.png)

Each file operation has a certain amount of overhead. If you're doing small numbers of large block I/O, you're most likely to hit the bandwidth limit first; if you're doing lots of small block I/O, you're most likely to hit the IOPS limit of the storage first. Effectively all storage can do large-block transfers pretty well, but no storage system does IOPS really well except in very specialized (and usually expensive) cases. 



TODO: finish this