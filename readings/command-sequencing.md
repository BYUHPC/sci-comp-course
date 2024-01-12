---
---

# Command Sequencing

Read the [Command Sequencing section of HPC Tutorials](EijkhoutHPCTutorialsVol4.pdf#subsection.1.5.3) before continuing



## Pipelining

### Compression Using Pipes

An extremely useful case on the supercomputer is piping output into compression tools. This can save you an immense amount of storage space. In this example, the `dd` utility was used to write 1000 blocks of zeroes into a file. The size of the file is 500 kB.

```shell
$ dd if=/dev/zero count=1000 > zeroes.txt
1000+0 records in
1000+0 records out
512000 bytes (512 kB) copied, 0.180904 s, 2.8 MB/s
$ ls -lh
total 500k
-rw-rw-r-- 1 user user 500K Oct 21 16:45 zeroes.txt
```

But, if we pipe that same command into `gzip`, a compression utility, the same data is only 531 bytes:

```shell
$ dd if=/dev/zero count=1000 | gzip > zeroes.txt.gz
1000+0 records in
1000+0 records out
512000 bytes (k12 kB0 copied, 0.0207491 s, 24.7 MB/s
$ ls -lh
total 504k
-rw-rw-r-- 1 user user 500K Oct 21 16:45 zeroes.txt
-rw-rw-r-- 1 user user  531 Oct 21 16:45 zeroes.txt.gz
```

### Data Wrangling

Another use of piping is to manipulate data into the desired format. Imagine that given the wall of text seen here, we're trying to insert every 'random reader' number into on Excel sheet column, and every 'ops/sec' number into a second Excel sheet column, to build a chart. Copying and pasting this data into Excel would be difficult.

```shell
$ grep 'random readers' slurm-1234.out
     throughput for 1 random readers   =   2847.90 ops/sec
     throughput for 2 random readers   =   5926.94 ops/sec
     throughput for 3 random readers   =   8877.60 ops/sec
     throughput for 4 random readers   =  11733.96 ops/sec
     throughput for 5 random readers   =  14533.67 ops/sec
     throughput for 6 random readers   =  17289.51 ops/sec
     throughput for 7 random readers   =  19039.88 ops/sec
     throughput for 8 random readers   =  20200.80 ops/sec
     throughput for 9 random readers   =  22942.14 ops/sec
     throughput for 10 random readers  =  18564.02 ops/sec
     ...
```

We can pipe the output into a tool called awk which is very useful for printing specific columns in text output, to print only the two numbers that we want:

```shell
$ grep 'random readers' slurm-1234.out | awk '{ print $3, $7 }'
1 2847.90
2 5926.94
3 8877.60
4 11733.96
5 14533.67
6 17289.51
7 19039.88
8 20200.80
9 22942.14
10 18564.02
```



## Exercise

Log into the supercomputer and construct a pipeline to count how many lines in `/etc/vimrc` contain the string "th." Use `wc` to do the counting.
