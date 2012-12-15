---
layout: post
title: "选32位还是64位的JVM好呢?"
category: Translation
tags:
 - JVM
keywords: JVM,32bit,64bit
---

<div style="float:right">
	<p>
		<img src="/post_images/2012/12/32or64bit.jpg" width="300" height="200">
		这个问题在我企业级软件开发生涯中不止一次遇到过,每次遇到这种问题的时候我都建议为特定的要求配置个全新的环境.老实说以前回答这个问题很随意,根本没有给出有力的说辞.为此针对这个问题我做了些深入的研究,现在就和大家分享一下.
	</p>
</div>


首先剔除越大越好的思想.如果因为64&gt;32就选择64位的JVM那么这个问题也就变得非常简单了,也就没有讨论的必要了.好了,从现在开始稳住.64位体系结构的缺点是在相同数据结构的情况下会占用更多的内存.而且多了不少,根据我们在不同的JVM版本,操作系统以及硬件架构上的测试结果显示,使用64位JVM占用的堆空间要比使用32位JVM多上30%到50%.增大堆空间还会增加GC停顿时间,从而影响应用程序的响应时间.在4.5G的堆空间上执行full GC肯定要比在3G的堆空间花费更多的时间.

通常换做64位JVM是因为堆大小的限制,不同的平台下32位JVM很快就会受到最大堆大小的限制.下面这个表格说明了不同平台下的限制:

<table width="600px">
	<thead>
		<tr>
			<th width="15%">OS</th>
			<th width="15%">Max heap</th>
			<th>Notes</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Linux</td>
			<td>
				2GB
			</td>
			<td>
				一些特殊的内核是3G,比如hugemem
			</td>
		</tr>
		<tr>
			<td>Windows</td>
			<td>
				1.5GB
			</td>
			<td>
				3GB的引导标志和支持LARGEADDRESSAWARE编译的jre才能达到3G
			</td>
		</tr>
		<tr>
			<td>Mac OS X</td>
			<td>
				3.8GB
			</td>
			<td>
				注意: 因为找不到古老的Mac所以这里只是我的经验.
			</td>
		</tr>
	</tbody>
</table>	

看起来很糟糕对吗? 总之我敢打赌你肯定见过在16G+内存的机器上使用32位的JVM而且运行状况良好.使用32位的JVM有什么错吗?难道它在Windows平台下真的只能分配不到16G的10%吗?

主要还是地址空间的限制,在32位操作系统上理论上可以为每个进程分配4G空间.那是什么原因使Windows平台上的进程只能处理一半的地址空间呢,另一半的地址空间被谁占用了呢?答案是一半是留给内核使用( 这些地址空间用户进程是没法使用的 ),另一半才是用户使用的.所以不管32位操作系统中不管有多大的RAM,每个进程只能分配2G的空间.更糟糕的是这些地址还必须是连续的,所以实际上Windows可供使用的堆空间只有1.5-1.8G.

有一个技巧可以通过减少内核空间增加用户空间使32位的Windows系统可以为每个用户进程分配3G空间.在boot.ini文件中配置3GB参数,不过只有使用有LARGEADDRESSAWARE开关的JVM进行编译和链接才有效.

不幸的是,情况并非想象中那么理想.至少在JDK1.7之前的HotSpot JVM都没有这个编译参数.如果你运气足够好,刚好使用JRockit 2006之后的版本,那么你就可以体验一把2.8-2.9G的堆空间.

这样我们就可以得出如果应用程序需要使用超过2-3G的堆空间,就可以使用64位的JVM吗?也许吧,在做出决定之前也要考虑一下64位JVM会占用更多的堆空间以及更长的GC停顿.下面我们就来分析下这两个原因:

<b>问题1: 64位JVM会多占用30%-50%的堆空间.</b>

为什么会这样呢?主要是由于64位JVM架构的内存布局造成的.首先64位JVM对象头占12个字节;其次对象引用可以是4字节或8字节.取决于JVM的标志和堆空间大小.和32位JVM的8个自己和对象头和4个字节的引用相比这无疑是增加了不少的开销.有关计算对象的内存消耗可以在我之前的<a href="http://plumbr.eu/blog/how-much-memory-do-i-need-part-2-what-is-shallow-heap" target="_blank">文章</a>里获得更详细的信息.

<b>问题2: 长时间的GC停顿.</b>

设置更大的堆空间意味着GC在清理无用对象时要做更多的工作,实际项目中当堆空间大于12-16G的时候,就需要你格外的小心,一次full GC很容易就要暂停几分钟时间,这几分钟的暂停时间是至关重要的,也许你通过微调和测量来优化吞吐量使其可以很好的工作.但是大多数情况下,它都会使事情变得糟糕.

那么当需要更大的堆空间,又不想负担64位JVM带来的额外开销时,有其他方案可以替代吗?当然,在之前我写的几篇<a href="http://plumbr.eu/blog/increasing-heap-size-beware-of-the-cobra-effect" target="_blank">文章</a>中有介绍过一些可以让你从堆分配,GC调优等恼人的工作中全身而退的技巧.

最后让我们重新总结一下本篇文章的中心思想: 选择64位JVM时要额外注意它带来的负面影响,但也不能因此就对它敬而远之.

文章作者: Vladimir Šor

原文链接: <a href="http://plumbr.eu/blog/should-i-use-32-or-64-bit-jvm" target="_blank">http://plumbr.eu/blog/should-i-use-32-or-64-bit-jvm</a>

<style type="text/css">
	table{
		border-collapse: separate;
		border-spacing: 2px;
		border-color: gray;
	}

	td {
		border: thin solid;
		padding: 3px;
	}

	td, th {
		text-align: left;
	}
</style>