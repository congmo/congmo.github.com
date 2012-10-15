---
layout: post
title: "实现Singleton的三种方法"
category: Java
tags:
 - Java
 - Singleton
keywords: Java,Singleton,枚举,enum
---
在jdk1.5加入enum之后，实现单例就又多了一种方法，而且是最简单的实现方法。

###枚举方法

{% highlight java %}
public enum Connection{
  CONNECTION;
}
{% endhighlight %}

没有多余的代码，毫无做做。

###饿汉式

###懒汉式

代码放在gist上共享了，<a href="https://gist.github.com/3877805">这里</a>
