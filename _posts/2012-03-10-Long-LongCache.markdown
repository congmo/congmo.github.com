---
layout: post
title: "java.lang.Long详解之二：缓存"
category: Java
tags:
 - Java
 - Long
keywords: Long,Java,详解,缓存,LongChace
---
众所周知Long中有个小小的陷阱，就是在-128至127范围内，Long.valueOf(long l)返回的Long的实例是相同的，而在此范围之外每次使用valueOf(long l)时，返回的实例都是不同的。本篇文章的主要目的就是揭示这个小陷阱。

首先来看一段代码，验证上述的小陷阱。
{% highlight java  %}
System.out.println(Long.valueOf(128) == Long.valueOf(128));
System.out.println(Long.valueOf(127) == Long.valueOf(127));
{% endhighlight %}
<blockquote>
输出结果：<br/>
false<br/>
true<br/>
</blockquote>

像变魔术一样，揭开之后就会觉得异常简单。这里也是同样的道理。上两段代码，明白人一看便知。

{% highlight java  %}
private static class LongCache {
  private LongCache(){}
  static final Long cache[] = new Long[-(-128) + 127 + 1];
  static {
    for(int i = 0; i < cache.length; i++)
      cache[i] = new Long(i - 128);
  }
}
{% endhighlight %}

{% highlight java  %}
public static Long valueOf(long l) {
  final int offset = 128;
  if (l >= -128 && l <= 127) { // will cache
    return LongCache.cache[(int)l + offset];
  }
  return new Long(l);
}
{% endhighlight %}

其实在Long中有一个静态的内部类LongCache，专门用于缓存-128至127之间的值。说到这里，不得不赞美一下写这个方法的作者，非常非常用心啊，看看cache这个数组的长度：-(-128) + 127 + 1.就是想告诉阅读这段代码的人，我是从-128开始，正数最大为127，然后后面的1代表数字0。一共256个元素。

如果仅仅是缓存下来而不去使用那么就没有任何意义。valueOf(long l)就是使缓存派上用场的方法，它会判断传入的参数是否在-128-127之间，如果是则直接从缓存中返回对应的引用，否则新创建一个Long的实例。valueOf这个方法我觉得比较好的一处是offset，它的初始值设为128，仔细想想，cache[128]其实存放的是0，这样就将正数和负数分隔开，而且针对-128-127之间的任何数作为参数传入都不需要做任何特殊处理，只要返回LongCache.cache[(int)l + offset];即可，正负通吃。

程序员真的好奇怪，每当看到精巧的代码时，都会有种赏心悦目的感觉。我喜欢Long这个类，处处是宝！
