---
layout: post
title: "Oracle JRockit The Definitive Guide 读书笔记一"
keywords: Java,JRockit,Oracle
---

楼主自工作以来，自认为还是读了不少书的，但是层次仅仅是读了。其实读了和理解书中的内容会有非常非常大的差别，不知道有没有人和楼主一样，读到一些内容的时候会心潮澎湃，然而一觉之后就不记得了。有那么多血淋淋的教训之后，楼主决定不再那么懒了，尽量多做些读书笔记。

####Chapter 1: Getting Started

#####Command-line option

There are main types of command-line options to JRockit--system properties, standardized options(`-X flags`), and non-standard ones(`-XX flags`)

**System properties**

Arguments starting with `-D` are interpreted as directive to set a system property.

**Standardized options**

Configuration settings for the JVM typically start with `-X` for settings that are commonly supported across vendors.

**Non-stdndart options**

Vendor-sepecific configuration options are usually prefixed with `-XX`.These options should be treaded as potentially unsupported and subject to change without notice.If any JVM setup depends on `-XX-prefixed` options,those flags should be removed or ported before an application is started on a JVM from a different vendor.

Once the JVM options have been determined,the user application can be started.Typically,moving an existing application to JRockit leads to an increase in runtime performance and a slight increase in memory consumption.

The JVM documentation should always be consulted to determine if non-standard command-line options have the same semantics between different JVMs and JVM versions.


<blockquote>
    <p>
        第一章只抽取了这么一点点内容: 
    </p>
    <p>
        JRockit的命令行参数有三种： 系统属性（以`-D`开头），标准命令行选项（以`-X`开头），非标准命令行选项（以`-XX`开头）。
    </p>
    <p>
        需要注意的是使用非标准命令行选项时，要根据当前JVM版本查看文档以确保当前版本支持。
    </p>
</blockquote>


####Chapter 2: Adaptive Code Generation

#####The Java Virtual Machine

The JVM is required to turn the bytecodes into native code for the CPU on which the Java application executes.This can be done in one of the following two ways(or a combination of both)

1. The Java Virtual Machine specification fully describes the JVM as a state machine,so there is no need to actually translate bytecode to native code.The JVM can emulate the entire execution state of the Java program,including emulating each bytecode instruction as a function of the JVM state.This is referred to as bytecode interpretation.The only native code (barring JNI) that executes directly here is the JVM itself.

2. The Java Vitual Machine compiles the bytecode that is to be executed to native code for a particular platform and then calls the native code. When bytecode programs are compiled to native code, this is typically done one method at the time, just before the method in question is to be executed for the first time. This is Known as Just-In-Time compilation(JIT).

Naturally, a native code version of a program executes orders of magnitude faster than an interpreted one. The tradeoff is, as we shall see, bookkeeping and compilation time overhead.

<blockquote>
    <p>
        Java应用运行的机器上，JVM需要将字节码转换为CPU可执行的本地代码，实现方式可以是一下任意一种或者两者混合：
    </p>
    <p>
        1. JVM虚拟机规范将JVM描述成一个状态机，这样做实际上是不需要将字节码转换为本地代码。
    </p>
    <p>
        2. JVM将字节码编译为平台相关的本地代码，然后直接执行本地代码。
    </p>
    <p>
        编译为本地代码后，程序的执行效率会比解释执行快几个数量级，不过，这是以额外的信息记录和编译时间为代价的。
    </p>
</blockquote>

**Stack machine**

The Java Virtual Machine is a stack machine. All bytecode operations, with few exceptions, are computed on an evaluation stack by popping operands from the stack, executing the operation and pushing the result back to the stack.

In addition to the stack, the bytecode format specifies up to 65,536 registers or local variables.

An operation in bytecode is encoded by just one byte, so Java supports up to 256 opcodes, from which most available values are claimed. Each operation has a unique byte value and a human-readable mnemonic.

<blockquote>
    <p>
        JVM是基于栈的虚拟机，绝大多数字节码操作都是基于操作数栈的入栈和出栈。
    </p>
    <p>
        除了栈之外，字节码格式中还规定了多达65536个寄存器，也叫局部变量。
    </p>
    <p>
        操作数在字节码中被编码为一个字节中，所以最多支持256个操作数，每个操作都有唯一的值和类似于汇编指令的助记符。
    </p>
</blockquote>

**Bytecode format**

Slot 0 in an instance method is reserved for this, according to the JVM specification, and this particular example is an instance method.

**Operations and operands**

As we see, Java bytecode is a relatively compack format, the previous method only being four bytes in length(a fraction of the source code mass). Operations are always encoded with one byte for the opcode, followed by an optional number of operations of variable length. Typically, a bytecode instruction complete with operands is just one to three bytes.

Other more complex constructs such as tables switches also exist in bytecocde with an entire jump table of offsets following the opcode in the bytecode.

**The constant pool**

A program requires data as well as code. Data is used for operands. The operand data for a bytecode program can, as we have seen, be kept in the bytecode instruction itself. But this is only true when the data is small enough, or commonly used(such as the constant 0).

Larger chunks of data, such as string constants or large numbers,are stored in a constant pool at the beginning of the .class file.Indexes to the data in the pool are used as operands instead of the actual data itself. If the string aVeryLongFunctionName had to be separately encoded in a compiled method each time it was operated on,bytecode would not be compact at all.

#####Code generation strategies

**Pure bytecode interpretation**

Early JVMs contained only simple bytecode interpreters as a means of executing Java code. To simplify this a little, a bytecode interpreter is just a main function with a large switch construct on the possible opcodes. The function is called with a state representing the contents of the Java evaluation stack and the local variables. Interpreting a bytecode operation uses this state as input and output. All in all, the fundamentals of a working interpreter shouldn't amount to more than a couple of thousand lines of code.

<blockquote>
    早期的JVM使用解释器来模拟字节码指令的执行。为了简化实现，解释器就是在一个主函数中加上一个包含了所有操作码的分支跳转结构。调用该函数时，会附带上表示操作数栈和局部变量的数据结构，以此作为字节码操作的输入输出。总体来看，解释器的核心代码最多也就几千行。
</blockquote>

There are several simplicity benefits to using a pure interpreter. The code generator of an interpreting JVM just needs to be recompiled to support a new hardware architecture. No new native compiler needs to be written. Also, a native compiler for just one platform is probably much larger than our simple switch construct.

<blockquote>
    纯解释执行这种方式简单有效，如果想要添加对新硬件架构的支持时，只需简单修改代码，重新编译即可，无需编写新的本地编译器。此外，写一个本地编译器的代码量也比写一个使用分支跳转结果的纯解释器大得多。
</blockquote>

A pure bytecode interpreter also needs little bookkeeping. A JVM that compiles some or all methods to native code would need to keep track of all compiled code. If a method is changed at runtime, which Java allows, it needs to be scheduled for regeneration as the old code is obsolete. In a pure interpreter, its new bytecodes are simply interpreted again from the start the next time that we emulate to the method.

<blockquote>
    解释器在执行字节码时几乎不需要记录额外信息。而编译执行的JVM会将一些或全部字节码编译为本地代码，这时就需要跟踪所有经过编译的代码。如果某个方法在运行过程中发生了改变，就需要重新生成代码。相比之下，解释器只需要再解释一遍新的字节码就可以了。
</blockquote>

It follow that the amount of bookkeeping in a completely interpreted model is minimal. This leads itself well to being used in an adaptive runtime such as a JVM, where things change all the time.

<blockquote>
    因为解释执行所需要记录的额外信息最少，所以就很适用于像JVM这样随时代码可能发生变化的自适应运行时。
</blockquote>

Naturally, there is a significant performance penalty to a purely interpreted language when comparing the execution time of an interpreted method with a native code version of the same code.

<blockquote>
    当然，相比于执行编译为本地代码的方式，纯解释执行的性能很差。
</blockquote>

**Static compilation**

Usually, an entire Java program was compiled into native code before execution. This is known as ahead-of-time compilation.

The obvious disadvantage of static compilation for Java is that the benefits of platform independence immediately disappear. The JVM is removed from the equation.

Another disadvantage is that the automatic memory management of Java has to be handled more or less explicitly, leading to limited implementations with scalability issues.

**Total JIT compilation**

Another way to speed up bytecode execution is to not use an interpreter at all, and JIT compile all Java methods to native code immediately when they are first encountered. The compilation takes place at runtime, inside the JVM, not ahead-of-time.

Total JIT compilation has the advantage that we do not need to maintain an interpreter, but the disadvantage is that compile time becomes a factor in the total runtime. While we definitely see benefits in JIT compiling hot methods, we also unnecessarily spend expensive compile time on cold methods and methods that are run only once. Those methods might as well have been interpreted instead.

The main disadvantage of total JIT compilation is still low code generation speed. In the same way that an interpreted method executes hundreds of times slower than a native one, a native method that has to be generated from Java bytecodes takes hundreds of times longer to get ready for execution than an interpreted method. When using total JIT compilation, it is extremely important to spend clock cycles on optimizing code only where it will pay off in better execution time. The mechanism that detects hot methods has to be very advanced, indeed. Even a quick and dirty JIT compiler is still significantly slower at getting code ready for execution than a pure interpreter. The interpreter never needs to translate bytecodes into anything else.

Another issue that becomes more important with total JIT compilation is the large amounts of throwaway code that is produced. If a method is regenerated, for example since assumptions made by the compiler are no longer valid, the old code takes up precious memory. The same is true for a method that has been optimized. Therefore, the JVM requires some kind of "garbage collection" for generated code or a system with large amounts of JIT compiltation would slowly run out of native memoey as code buffers grow.

JRockit is an example of a JVM that uses an advanced variant of total JIT compilation as its code generation stratege.

<blockquote>
    <p>
        另一种加速字节码执行速度的方法是彻底抛弃解释器，当首次调用某个Java方法时，将其编译为本地代码。这种编译方式是发生在运行时的，在JVM内部完成，因此不属于预编译范畴。
    </p>
    <p>
        完全JIT编译的好处是不需要维护解释器，但缺点是编译时间影响主体业务程序的运行。编辑器对所有方法一视同仁，在编译那些热点方法的同时，也会编译那些执行次数较少的，甚至是只执行一次的方法。这些方法本可以解释执行的
    </p>
    <p>
        完全JIT编译的主要缺点在于生成代码的速度太慢。对同一个方法来说，编译为本地代码后的执行效率比直接解释执行高数百倍，但准备时间却长数百倍。使用完全JIT编译这种方式时需要特别注意的是，尽管检测热方法的机制比较先进，但仍要慎重考虑执行效率和准备时间的问题，权衡得失。即使不使用优化能力很强的JIT编译器，准备时间仍然比纯解释执行慢得多，因为解释器跟不做编译工作。
    </p>
    <p>
        使用完全JIT编译的另一个问题是，在程序运行过程中会产生大量废气代码。如果某个方法需要重新生成，例如由于编译器之前所作的假设失效或由于对方法进行了优化，这时在生成了新代码之后，之前生成的老代码仍然会占用内存。因此，JVM需要某种“垃圾回收”机制来清理这些已经废弃的代码，否则，对于大量使用JIT编译的系统来说，最终会由于代码缓冲区容量的增长而消耗掉所有内存资源。
    </p>
    <p>
        JRockit JVM的代码生成策略是在完全JIT编译的基础上，加以优化整改而成的。
    </p>
</blockquote>

**Mixed mode interpretation**

The first workable solution that was proposed, that would both increase execution speed and not compromise the dynamic nature of Java, was mixed mode interpretation.

In a JVM using mixed mode interpretation, all methods start out as interpreted when they are first encountered. However, when a method is found to be hot, it is scheduled for JIT compilation and turned into more efficient native code. This adaptive approach is similar to that of keeping different code quality levels in the JIT, described in the previous section.

Detecting hot methods is a fundamental functionality of every modern JVM, regardless of code execution model, and it will be covered to a greater extent later in this chapter. Early mixed mode interpreters typically detected the hotness of a method by counting the number of times it was large enough, optimizing JIT compilation would be tiggered for method.

Similar to total JIT compilation, if the process of determining if a method is hot is good enough, the JVM spends compilation time only the methods where it makes the most difference. If a method is seldom executed, the JVM would waste no time turing it into native code, but rather keep interpreting  it each time that it is called.

Sun Microsystems was the first vendor to embrace mixed interpretation in the HotSpot compiler, available both in a client version and a server side version, the latter with more advanced code optimizations. HotSpot in turn, was based on technology acquired from Longview Technologies LLC(which started out as Animorphic)

<blockquote>
    <p>
        最早提出的、在不牺牲Java动态特性的情况下，提升程序执行效率的解决方案是以 混合模式 运行程序。
    </p>
    <p>
        使用混合模式时，首次调用某个方法时都是以解释器来执行的，但当发现某个方法是热方法时，则安排JIT编译器将之编译为本地代码。这种方法与上一节中提到的使用不同等级的JIT编译生成不同质量的本地代码类似，但执行速度更快。
    </p>
    <p>
        对于现代JVM来说，能够在任何代码模型中检测出热方法是一项基本功能，后文会对此详细阐述。早期的混合模式策略中，通过记录方法的调用次数来查找热方法，如果调用次数超过了某个阈值，则启动JIT编译器执行优化编译工作。
    </p>
    <p>
        与完全JIT编译类似，JVM只会对那些热方法进行优化编译，以期获得最好的执行效果，而对那些很少执行的方法，JVM根本不会花费时间去编译它们，但仍需要在每次调用它们时更新相关信息。
    </p>
    <p>
        在混合模式中，代码的重新生成不再是关键问题。如果某个方法的本地代码需要重新生成，那么JVM会直接抛弃已经编译出的本地代码，下次调用该方法时由解释器解释执行。此后，如果该方法仍然够热，届时会重新执行优化编译工作。
    </p>
</blockquote>

注：文中几乎所有的中文都来自于 <a href="https://github.com/caoxudong/oracle_jrockit_the_definitive_guide" target="_blank">这里</a>，楼主曾不自量力尝试自己去翻译，可是翻译完之后，与这位仁兄的一对比，那可真是惨不忍睹啊。所以说，翻译真的是艺术范畴，我等只有羡慕嫉妒恨了。