---
layout: post
title: "Cache: A Place for Concealment and Safekeeping"
keywords: CPU,Cache,Page,Set,Wat,Cache Line
---

楼主最近疯了，开始疯狂的写博客，不过也是件好事儿。

先说下这篇文章的来源，整个博客是微博上一些大牛推荐的，然后楼主折腾了好久好久终于在iPad上订阅成功了他，然后一个阳光明媚的早晨，神经病一样的楼主从床上爬起来，然后去楼下跑步了，跑完步之后楼主就拿起来iPad玩弄起来，点开Digg，随便翻开了这篇订阅的文章。然后就森森的被吸引了，欲罢不能。随后悲剧的事情就发生了，文章里面除了知道的知识点都是不知道的，竟然会发生这种事情（其实肯定会发生的，神经病）。看懂（楼主自认为是看懂了）这篇文章还是花费了大把的时间，粗略的算下大概一天半的样子。

这文章的名字楼主实在是不想翻译了，怎么翻译都觉得不爽，随他去吧。

-------------------------------------------------------------------请叫我华丽丽的分割线---------------------------------------------------------

本文主要介绍`Intel`处理器的`CPU`缓存实现原理。值得一提的是关于缓存的讲解通常都会将基本的概念混淆，而且缺乏生动的示例，当然不排除是由作者智商低造成的。随他去吧，下面讲解`双核CPU`一级缓存工作原理之part 1：

<div class="center">
    <img src="/post_images/2014/L1CacheExample.png">
</div>

作为缓存中数据单元的`line`，其实就是内存中连续的字节块。如上图所示，缓存使用64字节的`line`。这些`line`可以叫做`cache bank`或者`way`，另外，还为每个`way`配备了一个用于存储其信息的`directory`。`way`和`directory`作为一个单元类似于电子表格中的列，而`set`则可看作是行。这样，就可以通过`directory`定位相应的`line`。图中缓存有64个`set`，每个`set`包含8个`way`，因此有512个`line`，总共加起来有32KB。

根据图中缓存情况分析，物理内存被分成了多个4KB大小物理页，每页包含`4KB / 64 bytes = 64`个`line`。一个4KB大小的页，0-63字节是第一个`line`，64-127字节是第二个`line`，以此类推。每页都以这种方式组织，所以0页的第三个`line`和1页的第三个`line`是不同的。

全相联缓存模式下，内存中每个`line`都可以存储任意个`line`中，这使得存储变得很灵活，但是访问变得异常复杂。由于一级缓存和二级缓存对操作的功耗，物理空间以及速度都有着非常苛刻的限制，就意味这全相联很难被应用。

图中的缓存是多路组相联模式，也就是内存中特定的`line`只能存储在指定的`set`（或者`row`）中。所以，所有物理页的第一个`line`（0-63字节）都必须存储在第0个`row`中，第二个`line`存储在第1个`row`中，以此类推。图中每`row`有8个单元可用于存储与之相对应的`line`，所以称之为8路组相联。当内存寻址时，第11-6位用于定位存储在页（4KB）中的行号，从而也就确定了存储在哪个`set`中。比如物理地址：`0x800010a0（二进制表示为：100000000000000000010000101）`，11-6位对应的二进制为：`000010`，所以它必须存储在`set 2`中。

目前为止，仍然没法定位到底是`row`中的哪一个单元，这个就要靠`directory`了。每个`line`都有一个`directory`作为标识，表示`line`所在位置的页号。图中的处理器可寻址64GB的物理`RAM`，所以就有`64GB / 4BK` = 2^24页，也就是`directory`需要24位。我们示例中物理地址`0x800010a0`对应的页号为：`(0x800010a0b) / (4 KB) =
524 289`，下面介绍`双核CPU`一级缓存工作原理之part 2：

<div class="center">
    <img src="/post_images/2014/selectingCacheLine.png">
</div>

由于每个`set`中只有8个`way`，所以`tag matching`过程非常快速。图中使用箭头表示`tag`的并行比较过程，如果存在有效的`line`与`tag`匹配，那么记做一次`缓存命中`，否则去二级缓存查找，还没有匹配的则只能去物理内存中查找。`Intel`二级缓存的原理与一级缓存一样，只不更大和更多的`way`。比如通过增加8个`way`就可以获得64KB（= 4KB × 16）大小的缓存，增加`set`数量为4096个，那么`way`大小就增加至256BK（= 4096 × 64byte），通过这两处简单的提升，二级缓存就可达到4MB（= 256KB × 16）大小。同理，`tag`需要18位（= 36 - 12 - 6），`set index`需要12位（4096 = 2^12），物理页数与`way`大小一致。

如果`set`被填满了，那么在下一个`line`存入前必须有一个失效。为避免此类情况频繁发生，性能敏感的程序就要自己组织数据的存储，使得内存访问在`line`中均匀分布。例如，程序中有一个512字节大小的对象数组，这些对象可能存储在内存的不同页中。如果对象的字段都被分配到同样的`line`上，同时也在竞争同一个`set`，而且程序频繁访问指定字段（比如通过调用虚方法，频繁访问<a href="http://en.wikipedia.org/wiki/Vtable" target="_blank">虚函数表</a>），就会造成`set`被填满。这时，就会不断有`line`被失效，然后新的数据被缓存，严重映像缓存的利用率。示例中的一级缓存只能保存8个对象的虚函数表。`set`碰撞造成的缓存低命中率甚至导致整个缓存利用率低，是多路组相联需要付出的代价。但是借助于计算机的相对速度，几乎所有的应用程序根本就不需要担心这一点。

内存寻址通常都使用虚地址，所以一级缓存需要借助页单元获取物理页地址，以供`tag`使用。按约定，`set index`来自于虚地址的靠末尾几位（示例中是11-6位），并且不需要转换。所以一级缓存的`tag`依赖物理地址，而`set index`依赖虚地址，这样CPU就可以进行并行查找操作了。因为一级缓存的`way`大小永远不会超过内存管理单元页大小，所以指定物理内存地址保证与相同的虚`set index`相关联。但是二级缓存就是另外一回事儿了，因为`way`大小可能比内存管理单元大，所以`tag`必须是物理的，`set index`也必须是物理的。但是，请求到达二级缓存的时候，一级缓存已经计算好了物理地址，所以二级缓存一直工作的很好。

最后，`directory`中还存储着对应`line`的无效或共享的状态。一级和二级缓存中，`line`状态可以是4种`MESI`状态中的一种，包括：修改、专有、共享、无效。

更新：Dave在评论中提出直接匹配，他其实就是只有一路的组相联。与全相联相反：他拥有超快的访问速度，但是高冲撞率和低命中率。

-------------------------------------------------------------------请叫我华丽丽的分割线---------------------------------------------------------

以下的内容都是楼主对上面这篇文章的理解，以及在读懂他过程中的所做的一些功课。

首先第一幅图中这部分是怎么来的？

<div class="center">
    <img src="/post_images/2014/36bit.png">
</div>

我们已知的信息只有这么多：L1 Cache - 32KB, 8-way set associative, 64-byte cache lines；还有就是物理内存地址位36位。

刚开始看这篇文章的时候，虽然被吸引，但是其中的知识点基本上都不了解，连专业术语都不知道是什么。只好硬着头皮google了`缓存结构`，结果还真找到了，在`wiki`上看到了第一个参考资料，介绍`CPU`缓存的文章。下面这段解决了我的疑问：

<blockquote>
	<h4>Cache entry structure</h4>
	<p>
		Cache row entries usually have the following structure:
	</p>
	<table>
   		<tr>
      			<td>tag</td>
      			<td>data block</td>
      			<td>flag bits</td>
   		</tr>
	</table>
	<p>
		The data block (cache line) contains the actual data fetched from the main memory. The tag contains (part of) the address of the actual data fetched from the main memory. The flag bits are discussed below.
	</p>
	<p>
		The "size" of the cache is the amount of main memory data it can hold. This size can be calculated as the number of bytes stored in each data block times the number of blocks stored in the cache. (The number of tag and flag bits is irrelevant to this calculation, although it does affect the physical area of a cache.)
An effective memory address is split (MSB to LSB) into the tag, the index and the block offset.
	</p>
	<table>
   		<tr>
      			<td>tag</td>
      			<td>index</td>
      			<td>block offset</td>
   		</tr>
	</table>
	<p>
		The index describes which cache row (which cache line) that the data has been put in. The index length is <img style="margin:0" src="/post_images/2014/set-index.png"/> bits for r cache rows. The block offset specifies the desired data within the stored data block within the cache row. Typically the effective address is in bytes, so the block offset length is <img style="margin:0" src="/post_images/2014/block-offset.png"/> bits, where b is the number of bytes per data block. The tag contains the most significant bits of the address, which are checked against the current row (the row has been retrieved by index) to see if it is the one we need or another, irrelevant memory location that happened to have the same index bits as the one we want. The tag length in bits is <b>address_length - index_length - block_offset_length</b>.
	</p>
	<p>
		Some authors refer to the block offset as simply the "offset" or the "displacement".
	</p>
</blockquote>

`block offset`对应图中`Offset into cache line`，从已知条件中我们得知`line`采用的是64byte = 2^6，即`block offset`需要6位。同理`index`对应图中`Set Index`，32KB / 64byte = 512 个`line`，每个`set`又包含8个`way`（术语好乱），故512个`line` / 8`way` = 64个`set` = 2^6，从而得出`index`也需要6位来索引64个`set`。图中已给出内存地址是36位，这样一来的话`tag` = 36 - 6 - 6 = 24位。


最后要吐槽下GFW，这混蛋太恶心了，简直恶心透顶了，让善良的楼主心烦意乱。楼主最开始使用鲜果订阅博客，实在忍受不了那禽兽一般的排版后，转战Digg，结果可想而知，就被墙了，知道嘛，混蛋！刚开始楼主还蒙在鼓里，不知道为什么Digg怎么也登录不上（通过google帐号登录），暗自感叹这东西太垃圾了，遂Google了一下，看起来像是被墙了。楼主使用的是<a href="https://www.grjsq.me/" target="_blank">Green</a>免费200m流量的vpn，这家vpn挺不错的，那个大名鼎鼎的池建强大大也推荐过，愿意为他做广告（真正的原因是楼主的博客流量很低，无所谓。哈哈）。接通了vpn，地球引力就正常了，一切都通畅了。万恶的GFW，fuck you！

参考资料：

<a href="http://en.wikipedia.org/wiki/CPU_cache" target="_blank">http://en.wikipedia.org/wiki/CPU_cache</a>

<a href="http://zh.wikipedia.org/zh-cn/CPU缓存" target="_blank">http://zh.wikipedia.org/zh-cn/CPU缓存</a>

<a href="http://zh.wikipedia.org/wiki/%E5%86%85%E5%AD%98%E7%AE%A1%E7%90%86%E5%8D%95%E5%85%83" target="_blank">http://zh.wikipedia.org/wiki/内存管理单元</a>

<a href="http://en.wikipedia.org/wiki/Vtable" target="_blank">http://en.wikipedia.org/wiki/Vtable</a>

<a href="http://www.csbio.unc.edu/mcmillan/Media/L20Spring2012.pdf" target="_blank">http://www.csbio.unc.edu/mcmillan/Media/L20Spring2012.pdf</a>