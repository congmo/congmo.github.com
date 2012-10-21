---
layout: post
title: "泛型"
category: Translation
tags:
 - Java
 - Translation
keywords: Java,泛型,Geneics
---
<blockquote>
	stackoverflow上看见一篇关于java泛型非常好的讨论，所以今天拿出来简单翻译一下。
</blockquote>

###正文


Q:我只想弄清楚java泛型中extends关键字，List&lt;? extends Animal&gt;就是任何继承Animal的对象都可以插入到这个List中。它和下面这句难道不一样吗？List&lt;Animal&gt;。谁能帮我解释下这两种用法的不同吗？在我看来extends有些多余啊！

谢谢！

<hr>

A1:List&lt;Dog&gt;是List&lt;? extends Animal&gt;的子类型,但不是List&lt;Animal&gt;的子类型。

为什么List&lt;Dog&gt;不是List&lt;Animal&gt;的子类型呢？先看一下这个例子吧：

{% highlight java %}

	void mySub(List<Animal> myList) {
	    myList.add(new Cat());
	}

{% endhighlight %}


如果允许以List&lt;Dog&gt;为参数传入这个方法，那么会发生运行时异常。


EDIT:如果换做List&lt;? extends Animal&gt;为参数，下面的情况会发生；

{% highlight java %}

	void mySub(List< ? extends Animal> myList) {
	    myList.add(new Cat());     // compile error here
	    Animal a = myList.get(0);  // works fine 
	}

{% endhighlighe %}

可以以List&lt;Dog&gt;为参数传入这个函数，但是编译器会发现这样会给你带来很多麻烦。如果用super代替extends（允许传入List&lt;LifeForm&gt;），情况就完全相反了：

{% highlight java %}

void mySub(List< ? super Animal> myList) {
    myList.add(new Cat());     // works fine
    Animal a = myList.get(0);  // compile error here, since the list entry could be a Plant
}

{% endhighlight %}

背后的原理是：<a href="http://en.wikipedia.org/wiki/Covariance_and_contravariance_%28computer_science%29#Java">协变性和逆变性</a>

<hr>

