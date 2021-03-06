---
layout: post
title: "调整堆大小-谨防眼镜蛇效应"
keywords: 堆,GC
---

“眼镜蛇效应”源于在当时的英国统治的殖民地印度的轶事。英国政府担心眼镜蛇。因此，政府为打死每条眼镜蛇设有奖励。最初，这是一个成功的策略，大量的蛇被打死。然而最终印度人开始繁殖眼镜蛇来创造收入。

当发现有人以繁殖眼镜蛇来创收后，政府取消了这项奖励。但是饲养的再加上野生的眼镜蛇使眼镜蛇的数量成倍增加。这个明显的解决方案却使事情变得更复杂。

那么印度殖民地的眼镜蛇和调整堆大小有什么关系吗？原谅我，我会引导你通过现实生活中的故事来做类比的方式阐述问题。

你开发了一个非常棒的应用程序，以至于激增的流量使你不得不增加新服务来支撑。性能分析后发现堆大小成为应用程序的瓶颈。

所以你花了些时间调整堆为原先的6倍，测试验证有效后正式上线。当流量开始进来后，应用程序比2G堆时候的响应还要慢，很多用户要等上好几分钟才能等到应用程序的响应。可是到底发生什么了呢？

造成响应慢的原因可能有很多，但是我们的挑重点的抓-堆大小的改变。堆大小的改变可能会造成几种副作用产生，比如延长缓存预热时间，分片问题等。但是从症状来推断，应用程序产生大规模<a href="http://plumbr.eu/blog/making-the-right-decisions-when-optimizing-the-code" target="_blank">延迟</a>最有可能是由于full GC的停顿造成的。

因为Java是一种垃圾回收的语言，所以当堆空间需要回收的时候是JVM内部去完成回收过程的。想想现实生活中，如果你有一个大房子需要清理，自然而然的就需要花费更多的时间。同样，道理也适用于JVM的垃圾回收器回收无用对象。

当应用程序运行在堆空间小于4G下的时候，不需要深入思考GC的内部机制，但是当堆空间越来越大，达到十几G的时候就不得不考虑full GC长时间“stop-the-world”停顿了。当然在堆空间很小的时候也存在这样的停顿，但是这点儿是时间完全可以被忽略的，原先的几百毫秒而现在则需要停顿近1分钟之久，对应用程序来说这真的是一场灾难。

那么当要增大堆空间的时候我们能做些什么呢？

<ul>
	<li>首先我们要考虑应用程序能否进行水平扩展而不是垂直扩展。也就是说如果应用程序是无状态的，容易拆分的，那么就可以增加32位的小节点，节点间使用负载均衡。32位JVM占用更少的堆空间，这样就可以避免堆空间过大的缺点。</li>

	<li>如果办不到水平扩展，那么你只能从GC上面下功夫了。如果非常在意停顿带来的延迟，很快你就会发现CMS和C1垃圾回收器的局限性，那么就直接放弃注重吞吐量的GC吧，寻找新的替代品。更悲惨的消息是不论你选择哪种垃圾回收器以及这些配置参数只能通过试验才能验证其正确性。所以千万别去相信自己在哪里看到的那点儿信息，一定要在项目实际的流量下作验证。

	也要时刻注意他们的局限性，这些垃圾回收器会给应用程序的吞吐量造成负担，特别要注意的是G1要比“stop-the-world”垃圾回收器占用更多的吞吐量。堆空间超过16G时，CMS垃圾回收器没办法很快的就回收掉老年代中无用的空间，系统还是会有30秒以上的停顿。

	如果既不能进行水平扩展也没法通过Oracle JVM的垃圾回收器减少到理想的延迟，那么可以考虑下Azul Systems的Zing JVM，Zing最吸引人的地方是它的pauseless垃圾回收器C4，它完全能满足你的需求。虽然没有真正使用过C4，但是它听起来确实非常酷。</li>

	<li>最后还有一个选择，可以在堆之外分配空间，这些空间垃圾回收器根本就不可见，所以也就不会被回收了。这听起来很疯狂吧，但是从Java 1.4之后就可以通过java.nio.ByteBuffer类提供的allocateDirect()方法分配堆以外的空间。这样我们可以在堆之外分配巨大的空间，而且不会产生“stop-the-world”停顿。其实这种解决方案很常见，许多BigMemory都是通过ByteBuffers实现的，比如Terracotta的BigMemory以及Apache的DirectMemory等。</li>
</ul>

结论：即使出于美好的愿望做出更改时，也一定要考虑做出更改后的负面影响。正如英国印度殖民政府为打死眼镜蛇设立奖赏，由于当地居民饲养创收进而撤销奖赏后造成眼镜蛇数量激增一样。

文章作者：Nikita Salnikov-Tarnovski
原文链接：<a href="http://plumbr.eu/blog/increasing-heap-size-beware-of-the-cobra-effect" target="_blank">http://plumbr.eu/blog/increasing-heap-size-beware-of-the-cobra-effect</a>