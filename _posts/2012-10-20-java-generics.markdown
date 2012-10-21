---
layout: post
title: "Java:集合中使用泛型的讨论"
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


A2:

它们是不一样的，List&lt;Animal&gt;表示它指向的变量值得类型必须是List&lt;Animal&gt;类型的，这并不意味着只能添加Animal对象，还可以添加Animal对象的子类。

{% highlight java %}
	List<Number> l = new ArrayList<Number>();
	l.add(4); // autoboxing to Integer
	l.add(6.7); // autoboxing to Double
{% endhighlight %}

如果想构造一个List存储Number对象，并且这个List本身并不需要是List&lt;Number&gt;类型的，可以也是这个List的子类型（比如List&lt;Integer&gt;），这个时候可以使用List&lt;? extends Animal&gt;。

List&lt;? extends Number&gt;这种方式用在方法参数时的含义是：只要是个Number列表即可，List&lt;Double&gt;类型的也可以；而List&lt;Number&gt;作为参数时，可以避免错误的向上类型转换，比如想获得一个基类类型的List，却传入一个子类类型的List。

{% highlight java %}
	publid void doSomethingWith(List<Number> l) {
	    ...
	}

	List<Double> d = new ArrayList<Double>();
	doSomethingWith(d); // not working
{% endhighlight %}

上面这段代码不起作用是因为参数的类型是List&lt;Number&gt;而不是List&lt;Double&gt;。如果改成List&lt;? extends Number&gt;那么传入List&lt;Double&gt;是没有问题的。

{% highlight java %}

	publid void doSomethingWith(List< ? extends Number> l) {
	    ...
	}

	List<Double> d = new ArrayList<Double>();
	doSomethingWith(d); // works

{% endhighlight %}

注意：这东西和List中元素的继承关系无关，不管是否使用? extends都可以将Double或Integer添加到List&lt;Number&gt;中。

<hr>

A2:看见你已经找到答案了，我还是想补充一下我的理解，希望能帮上忙。

List&lt;? extends Animal&gt;和List&lt;Animal&gt;的区别如下：

List&lt;Animal&gt;就是定义了一个动物的列表，它的元素不仅可以是Animal对象，也可以是Animal的派生类。比如，有一个动物列表，一部分是山羊，还有猫咪等，是这样吗？

下面这个例子证明确实是这样的：

{% highlight java %}

	List<Animal> aL= new List<Animal>();
	aL.add(new Goat());
	aL.add(new Cat());
	Animal a = aL.peek();
	a.walk();//assuming walk is a method within Animal

{% endhighlight %}

顺便提一下下面这样是不合法的：

{% highlight java %}

	aL.peek().meow();//we can't do this, as it's not guaranteed that aL.peek() will be a Cat

{% endhighlight %}

当然如果确定aL.peek()就是返回一个Cat对象，那么可以这样做：

{% highlight java %}

	((Cat)aL.peek()).meow();//will generate a runtime error if aL.peek() is not a Cat

{% endhighlight %}


至于List&lt;? extends Animal&gt;是定义了这个List本身的类型，而不是元素的类型。

比如：

{% highlight java %}

	List<? extends Animal> L;

{% endlighlight %}

这段代码不是声明L可以拥有什么类型的对象，而是L本身可以指向什么类型的引用。

比如这样：

{% highlight java %}
	List<Goat> aL = new ArrayList<Goat>();
	L = aL;//remember aL is a List of Animals
{% endhighlight %}

经过这样赋值后，编译器就知道L是一个Animal或其子类类型的List了。

所以下面这样做是非法的：

{% highlight java %}

	L.add(new Animal());//throws a compiletime error

{% endhighlight %}

很明显L是指向Goat类型列表的引用，所以没法将Animal类型的对象加入L。

很好，那因为是什么呢？看这里：

{% highlight java %}
	List<Goat> gL = new List<Goat>();//fine
	gL.add(new Goat());//fine
	gL.add(new Animal());//compiletime error
{% endhighlight %}

上面add方法报错是因为把Animal类型的对象转换为Goat对象。如果那样做是合法的，那么在调用headbutt方法时，我们没法确定这个Animal对象是否有那样的方法，所以在编译期就会报错。


原文链接：<a href="http://stackoverflow.com/questions/2575363/generics-list-extends-animal-is-same-as-listanimal">http://stackoverflow.com/questions/2575363/generics-list-extends-animal-is-same-as-listanimal</a>



