---
layout: post
title: "Oracle JRockit The Definitive Guide 读书笔记三"
keywords: Java,JRockit,Oracle
---

####Runtime code generation

Total JIT compilation needs to be a lazy process. If any method or class referenced from another method would be fully generated depth first referral time, there would be significant code generation overhead. Also, just because a class is referenced from the code doesn't mean that every method of the class has to be compiled right away or even that any of its methods will ever be executed. Control flow through the Java program might take a different path. This problem obviously doesn't exist in a mixed mode solution, in which everything starts out as interpreted bytecode with no need to compile ahead of execution.

#####Trampolines

JRockit solves this problem by generating stub code for newly referred but not yet generated methods. These stubs are called tramplines, and basically consist of a few lines of native code pretending to be the final version of the method. When the method is first called, and control jumps to the trampoline, all it does is execute a call that tells JRockit that the real method needs to be generated. The code generator fulfils the request and returns the starting address of the real method, to which the trampoline then dispatches control. To the user it looks like the Java method was called directly, when in fact it was generated just at the first time it was actually called.

	0x1000: method A 									0x3000: method C
		call method B @ 0x2000								call method B @ 0x2000

	0x2000; method B (trampoline)						0x4000: The "real" method B
		call JVM.Generate(B) -> start 						...
		write trap @ 0x2000
		goto start @ 0x4000

Consider the previous example. `method A`, whose generated code resides at address `0x1000` is executing a call to `method B`, that it believes is placed at address `0x2000`. This is the first call to `method B `ever. Consequently, all that is at address `0x2000` is a trampoline. The first thing the trampoline does is to issue a native call to the JVM, telling it to generate the real `method B`. Execution then halts until this code generation request has been fulfilled, and a starting address for method B is returned, let's say `0x4000`. The trampoline then dispatches control to method B by jumping to that address.

Note that there may be several calls to `method B` in the code already, also pointing to the trampoline address `0x2000`. Consider, for example, the call in `method C` that hasn't been executed yet. These calls need to be updated as well, without `method B` being regenerated. JRockit solves this by writing an illegal instruction at address `0x2000`, when the trampoline has run. This way, the system will trap if the trampoline is called more than once. The JVM has a special exception handler that catches the trap, and patches the call to the trampoline so that it points to the real method instead. In this case it means overwriting the call to `0x2000` in `method C` with a call to `0x400`. This process is called back patching.

Back patching is used for all kinds of code replacement in the virtual machine, not just for method generation. If, for example, a hot method has been regenerated to a more efficient version, the code version of the code is fitted with a trap at the start and back patching takes place in a similar manner, gradually redirecting calls from the old method to the new one.

If there are no more references to an older version of a method, its native code buffer can be scheduled for garbage collection by the rumtime system so as to unclutter the memory. This is necessary in a world that uses a total JIT strategy because the amount of code produced can quite large.

<blockquote>
	<p>在上面的例子中，method A的起始地址在0x1000，它在调用method B时以为其起始地址是0x2000，这时method B第一次被调用。0x2000位置处的存根代码就是Trampoline，它告知JVM要为method B生成代码。此时，程序会一直等待，直到代码生成器完成工作，并返回method B的真正地址，再跳转到该地址开始执行。</p>
	<p>注意，可能对method B的调用可能会有多处，即都指向Trampoline的地址0x2000。例如上面例子中method C。这些对method B的调用应该修改为真正的method B的地址，而不是每次都重新生成一边method B。JRockit的解决办法时，当Trampoline运行过一次之后，在0x2000处写入一个陷阱指令，如果此时Trampoline再被调用，被JRockit会捕获到该事件，并将调用指向真正的method B。这个过程称为回填（back patching）。</p>
	<p>不仅是方法生成，回填技术常用于虚拟机的各种代码替换操作。例如，当某个热方法被重新编译为更高效的版本时，就是在该方法的之前版本的起始位置上设置一个陷阱（trap），当再次调用该方法时会触发异常，虚拟机捕获到该异常后会将调用指向新生成的代码的位置。</p>
	<p>注意，这只是个不得已的办法，因为我们没有足够的时间遍历所有已经编译过的代码去查找所有需要更新的调用。</p>
	<p>当没有任何引用指向某个方法的老的编译版本时，该版本就可以由运行时系统回收掉，释放内存资源。这对于使用完全JIT编译策略的JVM来说非常重要，因为编译后的代码量非常大，要避免出现内存耗尽的情况。</p>
</blockquote>

#####Code generation requests

In JRockit, code generation requests are passed to the code generator from the runtime when a method needs to be compiled. The requests can be either synchronous or asynchronous.

Synchronous code generation requests do one of the following:

1. Quickly generate a method for the JIT, with a specified level of efficiency

2. Generate an optimized method, with a specified level of efficiency.

An asynchronous request is: 

Act upon an invalidated assumption, for example, force regeneration of a method or patch the native code of a method.

Internally, JRockit keeps synchronous code generation requests in a code generation queue and optimization queue, depending on request type. The queues are consumed by one or more code generation and / or optimization threads, depending on system configuration.

The code generation queue contains generation requests for methods that are needed for program execution to proceed. These requests, except for special cases during bootstrapping, are essentially generated by tampolines. The call "generate me" that each trampoline contains, inserts a request in the code generation queue, and blocks until the method generation is complete. The return value of the call is the address in memory where the new method starts, to which the trampoline finally jumps.

#####Optimization requests

Optimization requests are added to the optimization queue whenever a method is found to be hot, that is when the runtime system has realized that we are spending enough time executing the Java code of that method so that optimization is warranted.

The optimization queue understandably runs at a lower priority than the code generation queue as its work is not necessary for code execution, but just for code performance. Also, an optimization request usually takes orders of magnitude longer than a standard code generation request to execute, trading compile time for effcient code.

#####On-stack replacement

Once an optimized version of a method is generated, the existing version of the code for that method needs to be replaced. As previously described, the method entry point of the existing code version of the method is overwritten with a <a href="http://en.wikipedia.org/wiki/TRAP_(processor_instruction)" target="_blank">trap instruction</a>. Calls to the old method will be back patched to point to the new, optimized piece of code.

Some optimizers swap out code on the existing execution stack by replacing the code of a method with a new version in the middle of its execution. This is referred to as `on-stack replacement` and requires extensive bookkeeping. Though this is possible in a completely JIT-compiled world, it is easier to implement where there is an interpreter to fall back to.

JRockit doesn't do `on-stack replacement`, as the complexity required to do so is deemed too great. Even though the code for a more optimal version of the method may have been generated, JRockit will continue executing the old version of the method if it is currently running.

<blockquote>
	<p>当完成某个方法的优化请求后，需要替换掉该方法的现存版本。正如前面的提到的，会使用陷阱指令覆盖（trap instruction）现存版本的方法入口点，于是再次调用该方法时会通过回填技术指向新的、优化过的版本。</p>
	<p>有些优化器会在方法执行过程中，使用优化后的版本替换掉现有的版本，这就是所谓的 栈上替换（on-stack replacement，OSR）。实现OSR需要额外记录大量信息，此外，尽管在完全JIT编译策略下可以实现OSR，但在有解释器辅助的环境中，实现起来更容易。因为可以退化为解释执行，替换后再执行编译后的代码（译者注，这句话是我编的，原文是“Though this is possible in a completely JIT-compiled world, it is easier to implement where there is an interpreter to fall back to”）。</p>
	<p>不过，JRockit中并没有实现OSR，因为复杂性太高。因此，即使已经生成了优化后的方法，还是要等下一次调用才会生效。</p>
</blockquote>

#####Bookkeeping

**Object information for GC**

For various reasons, a garbage collector needs to keep track of which registers and stack frame locations contain Java objects at any given point in the program. This information is generated by the JIT compiler and is stored in a database in the runtime system. The JIT compiler is the component responsible for creating this data because type information is available "for free" while generating code. The compiler has to deal with types anyway. In JRockit, the object meta info is called `livemaps`, and a detailed explanation of how the code generation system works with the garbage collector is given in Chapter 3, Adaptive Memory Management.

**Assumptions made about the generated code**

An assumption database is another part of the JRockit runtime that communicates with the code generator.

####A walkthrough of method generation in JRockit

#####The JRockit IR format

The first stage of the JRockit code pipeline turns the bytecode into an `Intermediate Representation (IR)`. As it is conceivable that other languages may be compiled be the same frontend, and also for convenience, optimizers tend to work with a common internal intermediate format.

JRockit works with an intermediate format that differs from bytecode, looking more like classic text book compiler formats. This is the common approach that most compilers use, but of course the format of IR that a compiler users always varies slightly depending on implementation and the language being compiled.

Aside from the previously mentioned protability issue, JRockit also doesn't work with bytecode internally because of the issues with unstructured control flow and the execution stack model, which differs from any modern hardware register model.

Because we lack the information to completely reconstruct the `ASTs`, a method in JRockit is represented as a directed graph, a control flow graph, whose nodes are basic blocks. The definition of a basic block is that if one instruction in the basic block is executed, all other instructions in it will be executed al well. Since there are no btranches in our example, the md5_F function will turn into exactyly one basic block.

**Data flow**

A basic block contains zero to many operations, which in turn have operands. Operands can be other operations (forming expression trees), variables (virtual registers or automic operands), constants, addresses, and so on, depending on how close to the actual hardware representation the IR is.

#####JIT comlilation

This following figure illustrates the different stages of the JRockit code pipeline:

	`BC2HIR	-->  HIR2MIR  -->  MIR2LIR  -->  RegAlloc  -->  EMIT`

**Generating HIR**

The first module in the code generator, BC2HIR, is the frontend against the bytecode and its purpose is to quickly translate bytecodes into IR. HIR in the case stands for High-level Intermediate Representation.

This is the output, the High-level IR, or HIR:
	params: v1 v2 v3
		block0: [first] [id=0]
			10 @9:49	(i32)	return {or {and vi v2} {and {xor v1 -1} v3}}

In JRockit IR, the annotation @ before each statement identifies its program point in the code all the way down to assembler level. The first number following the @ is the bytecode offset of the expression and the last is the source code line number information. This is part of the complex meta info framework in JRockit that maps individual native instructions back to their Java program points.

The BC2HIR module that turns bytecodes into a control flow graph with expressions is not computationally complex.

**MIR**

MIR or Middle-level Intermediate Representation, is the transform domain where most code optimization take place. This is because most optimizations work best with three address code or rather instructions that only contain atomic operands, not other instructions. Transforming HIR to MIR is simply an in-order traversal of expression trees metioned earlier and the creation of temporary variables. As no hardware deals with expression trees, it is natural that code turns into progressively simpler operations on the path through the code pipeline.

Our md5_F example would look something like the following code to the JIT compiler, when the expression trees have been flattened. Note that no operation contains other operations anymore. Each operation writes its result to a temporary variable, whick is in turn used by later operations.

	params: v1 v2 v3
	block0: [first] [id=0]
		2 @2:49*	(i32) and 		v1 v2 -> v4
		5 @5:49*	(i32) xor		v1 -1 -> v5
		7 @7:49*	(i32) and 		v5 v3 -> v5
		8 @8:49*	(i32) or 		v4 v5 -> v4
	   10 @9:49*	(i32) return 	v4

**LIR**

After MIR, it is time to turn platform dependent as we are approaching native code. LIR, or Low-level IR, looks different depending on hardware architeture.

Following is the LIR for the `md5_F` method on a 32-bit x86 platform:

	params: v1 v2 v3
	block 0: [first] [id=0]
		2 @2:49*	(i32)	x86_and			v2 v1 -> v2
	   11 @2:49*	(i32)	x86_mov			v2 -> v4
	    5 @5:49*	(i32)	x86_xor			v1 -1 -> v1
	   12 @5:49*	(i32)	x86_mov			v1 -> v5
	    7 @7:49*	(i32)	x86_and			v5 v3 -> v5
	    8 @9:49*	(i32)	x86_ox 			v4 v5 -> v4
	   14 @9:49*	(i32)	x86_mov			v4 -> eax
	   13 @9:49*	(i32)	x86_ret			eax

**Register allocation**

There can be any number of virtual registers (variables) in the code, but the physical platform only has a small number of them. Therefore, the JIT compiler needs to do register allocation, transforming the virtual variable mappings into machine registers. If at any given point in the program, we need to use more variables than there are physical registers in the machine at the same time, the local stack frame has to be used for temporary storage. This is called spilling, and the register allocator implements spills by inserting move instructions that shuffle registers back and forth from the stack. Natually spill moves incur overhead, so their placement is highly significant in optimezed code.

We can aslo note that the register allocator has added an epilogue and prologue to method in which stack manipulation takes place. This is because it has figured needs to use tow callee-save registers for storage. A register for the caller. If the stack frame and restored just before the method returns. By JRockit convention on x86, callee-save registers for Java code are `ebx` and `ebp`. Any calling convention typically includes a few callee-save registers since if every register was potentially destroyed over a call, the end result would be even ore spill code.

#####Generating optimized code

At each stage, an optimization module is plugged into the JIT.

<div class="center">
    <img src="/post_images/2014/2-5.jpg">
</div>

**A general overview**

MIR readily transforms into `Single Static Assignment(SSA)` form, a transform domain that makes sure that any vairables has only one definition. `SSA` transformation is part of virtually every commercial compiler today and makes implementing many code optimizations much easier. Another added benefit is that code optimizations in `SSA` form can be potentially more powerful.

`LIR` is platform-dependent and initially not register allocated, so transformations that form more efficient native operation sequences can be performed here.

The JRockit optimizer contains a very advanced register allocator that is based on a technique called graph fusion, that extends the standard graph coloring approximation algorithm to work on subregions in the IR. Graph fusion has the attractive property that the edges in the flow graph, processed early, generate fewer spills than the edges processed later. Therefore, if we can pick hot subregions before cold ones, the resulting code will be more optimal. Additional penalty comes from the need to insert shuffle code when fusion regions in order to form a complete method. Shuffle code consists of sequences of move instructions to copy the contents of one local register allocation into another one.

Finally, just before code emission, various peephole optimizations can be applied to the native code, replacing one to several register allocated instructions in sequence with more optimal ones.

**How does the optimizer works**

Generating optimized code for a method in JRockit generally takes 10 to 100 times as long al JITing it with no demands for execution speed. Therefore, it is important to only optimize frequently executed method.

Similar issues exist with boxed types. Boxed types turn into hidden objects (for example instances of java.lang.Integer) on the bytecode level. Several traditional compiler optimizations, such as escape analysis, can often easily strip down a boxed type to its primitive value. This removes the hidden object allocation that javac put in the bytecode to implement the boxed type.

文中翻译均引用自<a href="https://github.com/caoxudong/oracle_jrockit_the_definitive_guide/blob/master/chap2/2.6.md" target="_blank">这里</a>。