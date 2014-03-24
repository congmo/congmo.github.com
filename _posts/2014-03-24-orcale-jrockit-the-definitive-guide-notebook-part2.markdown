---
layout: post
title: "Oracle JRockit The Definitive Guide 读书笔记二"
keywords: Java,JRockit,Oracle
---

####Adaptive code generation

Java is dynamic in nature and certain code generation strategies fit less well than others. From the earlier discussion, the following conclusions can be drawn:

1. Code genteration should be done at runtime, not ahead of time

2. All methods cannot be treated equally by code genertor. There needs to be a way to discern a hot method from a cold one. Otherwise unnecessary optimization effort on hot methods.

3. In a JIT compiler, bookkeeping needs to be in place in order to keep up with the adaptive rumtime. This is because generated native code invalidated by changes to the running program must be thrown away and  potentially regenerated.

Achieving code execution efficiency in an adaptive runtime, no matter what JIT or interpretation strategy it uses, all boils down to the equation:

`Total Execution Time = Code Generation Time + Execution Time`

The JVM needs to know precisely which methods are worth the extra time spent on more elaborate code generation and optimization efforts.

#####Determining "hotness"

As we have seen, "one size fits all" code generation that interprets every method, or JIT compiling every method with a high optimization level, is a bad idea in an adaptive runtime. The former, because although it keeps code generation time down, execution time goes way up. The latter, because even though execution is fast, generating the highly optimized code takes up a significant part of the total runtime.We need to know if a method is hot or not in order to know should give it lots of code generator attention, as we can't treat all methods the same.

The common denominator for all ways of profiling is that of samples of where code spends execution time is collected. These are used by the runtime to make optimization decisions--the more samples available, the better informed decisions are made.

**Invocation counters**

One way to sample hot methods is to use invocation counters. An invocation counter is typically associated with each method and is incremented when the method is called. This is done either by the bytecode interpreter or in the form of an extra add instruction compiled into the prologue of the native code version of the method.

Especially in the JIT compiled world, where code execution speed doesn't disappear into interpertation overhead,usually in the form of cache misses in the CPU. This is because a particular location in memory has to be frequently written to by the add at the start of each method.

**Software-based thread sampling**

Another, more cache friendly, way to determine hotness is by using htread sampling. This means periodically examining where in the program Java threads are currently executing and logging their instruction pointers.Thread sampling requires no code instrumentation.

Stopping threads, which is normally required in order to extract their contexts is, however, quite an expensive operation. Thus getting a large amount of samples without disrupting anything at all requires a complete JVM-internal thread implementation, a cunstom operating system such as in Oracle JRockit Virtual Edition, or specialized hardware support.

####Hardware-based sampling

Certain hardware platforms, such as Intel IA-64, provides hardware instrumentation mechanisms that may be used by an application.

#####Optimizing a changing program

In object-oriented languages, virtual method dispatch is usually compiled as indirect call(that is the destination has to be read from memory) to addresses in a dispatch table. This is because a vitual call can have several possible receivers depending on the class hiearchy. A dispatch table exists for every class and contains the receivers of its virtual calls. A static method or a virtual method that is known to have only one implementation can instead be turned into a direct call with a fixed destination. This is typically much faster to execute.

The JVM solves this by "gambling". It bases its code generation decisions on assumptions that the world will remain unchanged forever, which is usually the case. If it turns out not to be so, its bookkeeping system triggers callbacks if any assumption needs is violated. When this happens, the code containing the original assumption needs to be regenerated--in our example the static dispath needs to te replaced by a virtual one. Having to revert code generated based on an assumption about a closed world is typically very costly, but if it happens rarely enough, the benefit of the original assumption will deliver a performance increase anyway.

Some typical assumptions that the JIT compiler and JVM, in general, might bet on are:

1. A virtual method probably won't be overridden. As it only exists only in one version, it can always be called with fixed destination address like a static method.

2. A float will probably never be NaN. We can use hardware instructions instead of an expensive call to the native floating point library that is required for corner cases.

3. The program probably won't throw an exception in a particular try block. Schedule the catch clause as cold code and give it less attention from the optimizer.

4. The hardware instruction `fsin` probably has the right precision for most trigonometry. If it doesn't, cause an exception and call the native floating pint library instead.

5. A lock probably won't be too saturated and can start out as a fast spinlock.

6. A lock will probably be repeatedly taken and released by the same thread, so the unlock operation and future reacquisitions of the lock can optimistically be treated as no-ops.

A static environment that was compiled ahead of time and runs in a closed world can not, in general, make these kinds of assumptions. An adaptive runtime, however, can revert its illegal decisions if the cirteria they were based on are violated. In theory, it can make any crazy assumption that might pay off, as long as it can be reverted with small enough cost. Thus, an adaptive runtime is potentially far more powerful than a static environment given that the "gambling" pays off.

Given that we find this area --and JRockit is based on runtime information feedback in all relevant areas to make the best decisions--an adaptive runtime has the potential to outperform a static environment very time.

####Inside the JIT compiler

#####Working with bytecode

While compiled bytecode may sound low level, it is still a well-defined format that keeps its code(operations) and data (operands and constant pool entries) strictly separated from each other.

As we have seen, most bytecode operations pop operands from the statck and push results. No native platforms are stack machines, rather they rely on registers for storing intermediate values. Mapping  a language that uses local variables to native registers is straightforward, but mapping an evaluation statck to registers is slightly more complex. Java aslo defines plenty of virtual registers, local variables, but uses an evaluation stack anyway. It is the authors' opinion that this is less than optimal.

Another problem, that in rare cases my be a design advantage, is the ability of Java bytecodes to express more than Java source code.

#####Bytecode "optimizers"

Our advice is to not use bytecode optimizers, ever!

**Abstract syntax trees**

A bytecode to native compiler can't simply assume that the given bytecode is compiled Java source code, but needs to cover all eventualities. A compiler whose frontend reads source code usually works by first tokenizing the source code into known constructs and building an Abstract Syntax Tree (AST).

Perhaps, in retrospect, it would have been a better design rationale to directly use an encoded version of the compiler's ASTs as bytecode format. Various academic papers have shown that ASTs are possible to represent in an equally compact or  more compact way than Jave byteocde, so space is not a problem. Interpreting an AST at runtime would also only be slightly more difficult than interpreint bytecode.

#####Where to optimize

However, as we have explained, explicit optimization on the bytecode level is probably a good thing to avoid.

Adaptive optimization can never substitute bad algorithms with good ones. At most, it can make the bad ones run little bit faster.

Exceptions are very expensive operations and are assumed to be just that -- exceptions. The "gambling" behavior of the JVM, thinking that exceptions are rare, became a bad fit.

####The JRockit code pipeline

#####Why JRockit has no bytecode interpreter

JRockit uses the code generation strategy total JIT compilation.

Later, as JRockit became a major mainstream JVM, known for its performance, the need to diversify the code pipline into client and server parts was recognized. No interpreter was added, howerver. Rather the JIT was modified to differentiate even further between cold and hot code, enabling faster "sloppy" code generation the first time a method was encountered. This greatly improved startup time to a satisfying degree, but of course, getting to pure interpreter speeds with a compile-only approach is still very hard.

Another aspect that makes life easier with an inerpreter is debuggability. Bytecode contains meta information about things like variable names and line numbers. These are needed by the debugger. In order to support debuggability, the JRockit JIT had to propagate this kind of information all the way from pre-bytecode basis to per-native to add an interpreter. This has the added benefit that, to our knowledge, JRockit is the only virtual machine that lets the user debug optimized code.

The main problems with the compile-only strategy in JRockit are the code bloat (solved by garbage collecting code buffers with methods no longer is use) and compilation time for large methods (solved by having a sloppy mode for the JIT).

#####Bootstrapping

The "brain" of the JRockit JVM is the runtime system itself. It keeps track of what goes on in the world that comprises the virtual execution environment. The runtime system is aware of which Java classes and methods make up the "world" and requests that the code generator compiles them at appropriate times with appropriate levels of code quality.

To simplify things a bit, the first thing the runtime wants to do when the JVM is started, is to look up and jump to the main method of a Java program. This is done through a standard JNI call from the native JVM, just like any other native application would use JNI to call Java code.

Searching for main triggers a complex chain of actions and dependencies. A lot of other Java methods required for bootstrapping and fundamental JVM behavior need to be generated in order to resolve main function. When finally main is ready and compiled to native code, the JVM can execute its first native-to-Java stub and pass control from the JVM to the Java program.

To study the bootstrap behavior of JRockit, try running a simple Java program with the command-line switch `-Xverbose:codegen`.