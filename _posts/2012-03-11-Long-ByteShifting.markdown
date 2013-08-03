---
layout: post
title: "java.lang.Long详解之三：大显神通的位移运算"
keywords: Long,Java,详解,缓存,位移
---

本篇主要讲述位移运算在Long中所扮演的重要角色，有些出神入化的我根本无法理解，但是我一直秉承着无论对错都要记录思考的过程的宗旨写每一篇文章。这一篇也不例外，读Long这个类确实需要比较广泛的知识面，我也是一边在OSChina和stackoverflow上提问，一边慢慢的钻研，难免会存在偏差。

先来看个简单的。

{% highlight java %}
public static int signum(long i) {
  // HD, Section 2-7
  return (int) ((i >> 63) | (-i >>> 63));
}
{% endhighlight %}

这个函数作用就是返回参数i的符号，如果返回-1则是负数，如果返回0则是0，如果返回1则是正数。算法就是`(int) ((i >> 63) | (-i >>> 63))`，如果是正数的话i有符号右移63位后为0，-i无符号右移63位之后结果为1，或操作之后结果就是1.如果i为负数，那么有符号右移63位后就变成了1，然后-i无符号右移63位后就只剩下符号位，最后做或(|)操作结果就是-1. 如果参数i为0，那么移位后结果就是0.
{% highlight java %}
System.out.println(Long.signum(100L));
System.out.println(Long.signum(0L));
System.out.println(Long.signum(-100L));
{% endhighlight %}
<blockquote>
输出结果：<br>
1<br>
0<br>
-1<br>
</blockquote>
接着是一个很少用到，但是实现方式不错的两个方法，循环左移和循环右移方法。
{% highlight java %}
public static long rotateLeft(long i, int distance) {
    return (i << distance) | (i >>> -distance);
}
public static long rotateRight(long i, int distance) {
    return (i >>> distance) | (i << -distance);
}
{% endhighlight %}

实现的代码量可以说已经精简到最少了，有一点要注意的是，循环移位时，参数distance可以接受负数，当distance为负数时，这个等式是成立的，`rotateLeft(i, distance) = rotateRight(i, -distance)`。这个方法中有两点值得借鉴的，第一从整体上讲循环移位的实现方式；第二是distance与-distance的巧妙运用。

就拿循环左移先来说说第二点吧，前置条件，我们首先假设distance大于0，起先我是很不理解`i >>> -distance`的，后来在stackoverflow上发问，有人给出了解释，在移位的时候，如果distance小于0，会根据被移位数的长度进行转换。就比如说这里我们对long进行移位，那么-distance就会被转换成`(64 + distance)`(注，这里的distance是小于0的)。这样的话，如果distance大于0时，`(i << distance) | (i >>> -distance);`就会被转化成`(i << distance) | (i >>> 64 + distance);`

清楚了第二点，那么第一点也就不难理解了。用一幅图来解释循环左移。
<div class='center'>
	<img src='/post_images/2012/03/rotateLeft.png'/>
</div>
在distance大于0的前提下，先左移distance位，然后再右移64-distance，最终用或运算相加，就是循环移位的结果。图中为了省事儿用了8位做了个演示，先左移3位，然后右移(8-3)位，或运算之后就是结果啦。关于-distance在stackoverflow上的提问在<a href="http://stackoverflow.com/questions/9513074/how-does-i-distance-work">这里</a>。

下面是个更给力的方法-`reverse(long i)`，可以说就是高效率的化身。
{% highlight java %}
public static long reverse(long i) {
    // HD, Figure 7-1
    i = (i & 0x5555555555555555L) << 1 | (i >>> 1) & 0x5555555555555555L;
    i = (i & 0x0f0f0f0f0f0f0f0fL) << 4 | (i >>> 4) & 0x0f0f0f0f0f0f0f0fL;
    i = (i & 0x00ff00ff00ff00ffL) << 8 | (i >>> 8) & 0x00ff00ff00ff00ffL;
    i = (i << 48) | ((i & 0xffff0000L) << 16) |
            ((i >>> 16) & 0xffff0000L) | (i >>> 48);
    return i;
}
{% endhighlight %}

从整体上说，这个`reverse`方法集移位与二分算法于一身，堪称经典。
第一步以单位为单位，奇偶位交换
第二步以两位为单位，完成前后两位的交换。
第三步以四位为单位，完成前后四位的交换。
第四步以八位为单位，完成前后八位的交换。
最后一步没有按常理继续二分，而是通过一个转换一步就完成了以16和32位为单位的交换。进而结束了整个64位的反转。

现在一步一步剖析都是如何实现的。
{% highlight java %}
i = (i & 0x5555555555555555L) << 1 | (i >>> 1) & 0x5555555555555555L;
{% endhighlight %}
16进制的5为0101，或操作前半部分首先取出i的所有奇数位，然后整体左移一位，这样实现i的奇数位左移一位变成偶数位；或操作后半部分先右移，即将偶数位右移变成奇数位，然后再取出奇数位。这样就完成了64位中奇数位与偶数位的交换。

{% highlight java %}
i = (i & 0x3333333333333333L) << 2 | (i >>> 2) & 0x3333333333333333L;
{% endhighlight %}
这句同样是实现交换，只不过3对应的16进制为0011，即本次交换以2个字节为单位，交换完成了4个字节的反转。
{% highlight java  %}
i = (i & 0x00ff00ff00ff00ffL) << 8 | (i >>> 8) & 0x00ff00ff00ff00ffL;
{% endhighlight %}
直到这行代码，实现了以字节为单位的反转，最后仅仅使用一行代码就实现了一两个字节和四个字节为单位的反转。
为了方便画图，现在对操作进行编号，另外从以字节为单位交换开始，之前的细节忽略。
{% highlight java %}
编号1：(i & 0x00ff00ff00ff00ffL) << 8 | (i >>> 8) & 0x00ff00ff00ff00ffL;
编号2：(i << 48)
编号3：(i & 0xffff0000L) << 16)
编号4：(i >>> 16) & 0xffff0000L)
编号5：(i >>> 48);
{% endhighlight %}

这幅图描述每个编号代码执行之后64位的变化。
<div class='center'>
	<img src='/post_images/2012/03/reverse.png' width='600px' height='500px'>
</div>

不多做解释，由于这个reverse的最后一行不是按常理"出牌"，所以我使用纯粹的二分法来实现reverse。
{% highlight java %}
public static long reverse(long i) {
  // HD, Figure 7-1
  i = (i & 0x5555555555555555L) << 1 | (i >>> 1) & 0x5555555555555555L;
  i = (i & 0x3333333333333333L) << 2 | (i >>> 2) & 0x3333333333333333L;
  i = (i & 0x0f0f0f0f0f0f0f0fL) << 4 | (i >>> 4) & 0x0f0f0f0f0f0f0f0fL;
  i = (i & 0x00ff00ff00ff00ffL) << 8 | (i >>> 8) & 0x00ff00ff00ff00ffL;
  i = (i & 0x0000ffff0000ffffL) << 16 | (i >>> 16) & 0x0000ffff0000ffffL;
  i = (i & 0x00000000ffffffffL) << 32 | (i >>> 32) & 0x00000000ffffffffL;
  return i;
}
{% endhighlight %}
至于为什么要采用那种方式，而不是用"纯粹"的二分法，在stackoverflow上有人提到，可能是因为前一种实现方式需要9个操作，而后一种实现方式需要10个操作。具体是出于怎样的目的可能只有作者才知道。关于reverse我在stackoverflow上的提问在<a href="http://stackoverflow.com/questions/9529275/how-does-i-48-i-0xffff0000l-16-i-16-0xffff0000l-i">这里</a>。

最后看一个方法。
{% highlight java %}
public static int bitCount(long i) {
    // HD, Figure 5-14
    i = i - ((i >>> 1) & 0x5555555555555555L);
    i = (i & 0x3333333333333333L) + ((i >>> 2) & 0x3333333333333333L);
    i = (i + (i >>> 4)) & 0x0f0f0f0f0f0f0f0fL;
    i = i + (i >>> 8);
    i = i + (i >>> 16);
    i = i + (i >>> 32);
    return (int)i & 0x7f;    
}
{% endhighlight %}
这个方法是返回一个long类型的数字对应的二进制中1的个数，其实google上有很多种，这里采用的叫平行算法实现的，算法如下图。
<div class='center'>
	<img src='/post_images/2012/03/bitCount.jpg'>
</div>
但是这个方法的第一行又采取了一个特别的方式实现i中奇数位+偶数位，我有点儿没想明白。总体上就是像图中所示那样，相邻的两位相加的结果再相邻的四位相加，最后得到二进制中1的个数。参考<a href="http://www.cnblogs.com/graphics/archive/2010/06/21/1752421.html">这篇文章</a>。还有一点值得提一下，就是最后一行与上7f，因为long类型，1的个数最多也不会超过64个，所以只取最后7位即可。