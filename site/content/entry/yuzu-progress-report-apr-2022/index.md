asdf
<vortex>
# KERNEL

## Part 5
mention that this is from March
Our resident bunnei rabbit continued his work on rewriting yuzu's kernel memory management to make it 
accurate to the latest system updates. This time, he tackled and revamped how the kernel code memory is mapped and unmapped.

Code memory, in the context of the Switch, is where games and apps have their own code mapped for execution.
Thanks to these changes, 'Super Smash Bros. Ultimate' no longer causes memory access issues while loading/unloading NROs.

***

## Part 6
Note: This is from March
bunnei also migrated slab heaps for the guest (Switch) kernel objects from host heap memory to emulated guest memory.
With this change, yuzu's memory layout is now more closely matching the console.

> A slab represents a contiguous piece of memory. A heap is a general term used for any memory that is
allocated dynamically and randomly.

So, slab heaps are basically pieces of memory dynamically allocated for guest kernel objects.
By moving these away from the host (PC) heap memory (RAM) to emulated guest (Switch) memory, we can ensure
that the kernel objects never go beyond the system limits to cause memory leaks on the host (PC).

Thread local storage (TLS), the mechanism by which each thread in a given multithreaded process allocates storage for 
thread-specific data, was also rewritten making it accurate to the latest HorizonOS behaviour.

With these changes, we have now completely fixed the kernel memory object leaks that affected a few games, but went largely unnoticed, due to the previous implementation allowing unlimited allocations.

*** 

## Improve usage of Service Host Threads

bunnei also reimplemented how yuzu handled thread allocation for HLE service interfaces.

> Services are system processes running in the background which wait for incoming requests. 
The Switch's HorizonOS has various services that perform various tasks e.g Audio, Bluetooth, etc.

Previously we used to allocate one host thread per HLE service interface because -

 * some service routines need to block threads and 
 * we don't support guest thread rescheduling from host threads.

> A thread in block state will have to wait until an action can be completed.
> exmaple needed

The issue with this approach was that since it's the host OS that schedules these threads, yuzu could end up creating dozens of threads for services and that could lead to weird behaviour particularly on systems with hardware limitations.

With the rewrite, yuzu now has a single "default service thread" that is used for 99% of the service methods that are non-blocking.
For the services that are time-sensitive and for those that need blocking, we still allow thread creation (e.g. Audio, BSD, FileSystem, nvdrv)

This brings down the service thread count from double digits to single digits, thus improving stability and consistency - especially on systems with less cores.

## KServerPort / KServerSession

yuzu currently does not emulate multi-process capabilities of the HorizonOS kernel, however these still need to be managed.
To begin, the HorizonOS services (all?) have a port (for both client and server) that is used as a channel of communication for multiprocess (between game process to the server process).
A session is opened for each communication interface for them both and they are managed by their respective kernel objects.
When the game closes the client port, the service closes the server port, and everything is shut down.

The issue with our previous implementation was that yuzu wasn't properly tracking all the `KServerPort` and `KServerSession` objects for each service.
And because of this, the services weren't properly getting closed and they in turn were causing further issues.

This originally worked fine, but was regressed when we migrated guest kernel objects to emulated guest memory (discussed above / link)
bunnei figured out the issue and quickly reimplemented how we track these kernel objects.

By having a single place where we can register/unregister open ports and sessions, we can now keep better track of these kernel objects.
And by ensuring that they are closed when we tear down all services and kernel, we get much better emulation shutdown behaviour.


***

## GPU

Following up on last month's NVFlinger rewrite, bunnei continued to track issues and bug reports.
He fixed the reported issues and further cleaned up the code to improve code quality.
Read more about the NVFlinger rewrite here (link)

***

## CPU (didn't get to complete :( )

#### lfence before rtdsc
https://github.com/yuzu-emu/yuzu/pull/8143
(find out where is this used in yuzu?)
The `rtdsc` instruction stands for `Read Time-Stamp Counter` (https://en.wikipedia.org/wiki/Time_Stamp_Counter) and is used to obtain the no. of processor cycles since last reset.

(do we want to mention this ^?) - mark it as CPU emulation optimization?

#### better interrupts ( need more details or skip)

cpu emulation optimization - https://github.com/yuzu-emu/yuzu/pull/8148

But this causes issues 
- broke single core - https://github.com/yuzu-emu/yuzu/issues/8201
  fixed - https://github.com/yuzu-emu/yuzu/pull/8202
- https://github.com/yuzu-emu/yuzu/issues/8211

Hence, cycle counting is reintroduced - https://github.com/yuzu-emu/yuzu/pull/8240

#### std::mutex vs spin locks

( needs detail on "WHY" at all we gained stability and performance over spin locks )
( whats the difference bw these two )

#### 
