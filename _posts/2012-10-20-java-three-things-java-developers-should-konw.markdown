---
layout: post
title: "三件Java开发者应该知道的事儿"
keywords: Java,ConcurrencyPrinciples,IDESkill,GC,MemoryManagement
---
<div class="center">
	<img src="/post_images/2012/10/programmer.jpg">
</div>

这是一篇有趣的文章，应该符合那些喜欢JavaOne2012大会的人的口味。近期对Java领域专家Heinz Kabutz的一篇采访深深吸引了我，其中他的Java内存谜题程序从Java内存管理角度来看非常具有指导意义。

采访中有一段我印象特别深：Java开发者应该掌握的却至今没有掌握的知识。采访的过程中Heinz提出了很多非常好的观点，今天这篇文章就重新回顾和延展一下那天值得Java开发者关注的知识。

同时Heinz也提出了他对于未来Java8发布版本中去除HotSpot VM PermGen的担忧。

####Java并发原则：是否应该注意呢？

Heinz指出，关于这这个主题的讨论通常被大部分开发者回避。除非在只编写单线程程序，否则线程并发以及相关问题是我们必须关注的问题。特别作为Java EE开发者编写的代码都会运行在高并发的环境下，一个小小的编码错误就会造成严重的线程竞争，稳定性和性能方面的问题。同样，缺乏线程相关知识，你也没法对Java EE容器的线程池做出适合的调整。

我还是建议，每个Java开发者都应该学习基本的Java并发原则知识，不论是从编码还是处理类似JVM 线程Dump分析这样的问题来讲都是非常必要的。

####提升IDE使用技巧：掌握快捷键

Heinz令一个建议是每个程序员都应该深入了解Java IDE使用技巧。这个建议听起来很正常，但是你可能会惊讶只有很少一部分人可以很了解IDE的使用以及可以通过IDE提高生产效率。这种情况通常是由于缺乏对IDE的快捷键以及能力的探索。

如果你使用Eclipse，那么DZone上这篇讲述Eclipse有用快捷键的文章算是一个不错的入门。

####Java内存管理：学会读懂GC logs

最后一个但不止于此：学会读懂GC logs，这条建议是我最喜欢的一个。就像之前我写过的文章中那样，JVM GC logs包含很多有关内存占用以及垃圾回收状况的重要信息。这些数据在JVM调优，以及排除Java堆空间OutOfMemoryError异常相关问题尤为重要。

不过说实话，就连想要拥有Kirk Pepperdine这样的专家一半的知识，需要花费非常多的时间，但是开始分析和了解应用中GC logs和Java内存管理基础来说是个非常好的开始。

译者注：翻译文章有翻译文章的乐趣，过程中会加深对文章内容的理解，而且一篇文章会像宝库一样，会挖掘出各种财宝。

本文翻译自:<a href="http://java.dzone.com/articles/three-things-java-developers" target="_blank">http://java.dzone.com/articles/three-things-java-developers</a>


相关阅读：(有些文章可能需要翻墙，自备翻墙工具)

1.<a href="https://blogs.oracle.com/javaone/entry/the_java_specialist_an_interview" target="_blank">https://blogs.oracle.com/javaone/entry/the_java_specialist_an_interview</a>

2.<a href="http://javaeesupportpatterns.blogspot.com/2011/10/java-7-features-permgen-removal.html" target="_blank">http://javaeesupportpatterns.blogspot.com/2011/10/java-7-features-permgen-removal.html</a>

3.<a href="http://docs.oracle.com/javase/tutorial/essential/concurrency/" target="_blank">http://docs.oracle.com/javase/tutorial/essential/concurrency/</a>

4.<a href="http://javaeesupportpatterns.blogspot.com/2011/11/how-to-analyze-thread-dump-part-1.html" target="_blank">http://javaeesupportpatterns.blogspot.com/2011/11/how-to-analyze-thread-dump-part-1.html</a>

5.<a href="http://eclipse.dzone.com/news/effective-eclipse-shortcut-key" target="_blank">http://eclipse.dzone.com/news/effective-eclipse-shortcut-key</a>

6.<a href="http://javaeesupportpatterns.blogspot.com/2011/10/verbosegc-output-tutorial-java-7.html" target="_blank">http://javaeesupportpatterns.blogspot.com/2011/10/verbosegc-output-tutorial-java-7.html</a>

7.<a href="http://javaeesupportpatterns.blogspot.com/2011/11/outofmemoryerror-java-heap-space.html" target="_blank">http://javaeesupportpatterns.blogspot.com/2011/11/outofmemoryerror-java-heap-space.html</a>
