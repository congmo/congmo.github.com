---
layout: post
title: "HashMap之equals与hashCode小陷阱"
category: Java
tags:
 - Java
keywords: Java,HashMap,equals,hashCode,不执行equals
---

先以一段代码开始这篇blog。

{% highlight java %}
public class Name {

  private String first; //first name
  private String last;  //last name

  public String getFirst() {
    return first;
  }

  public void setFirst(String first) {
    this.first = first;
  }

  public String getLast() {
    return last;
  }

  public void setLast(String last) {
    this.last = last;
  }

  public Name(String first, String last) {
    this.first = first;
    this.last = last;
  }

  @Override
  public boolean equals(Object object) {
    Name name = (Name) object;

    return first.equals(name.getFirst()) && last.equals(name.getLast());
  }

  public static void main(String[] args) {
    Map<Name, String> map = new HashMap<Name, String>();
    map.put(new Name("mali", "sb"), "yes");
    
    System.out.println("is the key existed? ture or false? -> "
        + map.containsKey(new Name("mali", "sb")));
  }

}
{% endhighlight %}

那输出结果是什么呢？类似这样的题目总能遇到，以前不知道有什么好考的，弱智？自己动手尝试了一次，发现结果不是自己想象的那样。本篇就用来揭示`HashMap的`equals与`hashCode中你不知道的秘密。结果如下：

<blockquote>
  is the key existed? ture or false? -> false
</blockquote>

对的，结果就是`false，我很不理解为什么这样，已经重写了equals函数了啊！当时真心不服气，就在equals函数里面打了断点，然后更让我难以置信的事情发生了，断点处没有停。非常困惑，不过还好，jdk的源码在手上，去查了`HashMap中`containsKey函数的源码。源码结构如下图：

<div class='center'>
  <img src="/post_images/2012/09/hashmap-containsKey.png">
</div>

从图中可以看出，真正干活的是`getEntry(Object key)，重点看如下两行：

{% highlight java %}
  if (e.hash == hash &&
                ((k = e.key) == key || (key != null && key.equals(k))))
    return e;
{% endhighlight %}

从`if条件上看，是一个短路与，首先要判断两个对象的`hash值是否相等。如果相等才进行后续的判断。或者换一个说法，在`HashMap中只有两个对象的`hash值相等的前提下才会执行`equals方法的逻辑。关于这一点，有两个佐证。

1.在`stackoverflow上找到一篇关于`HashMap不执行`equals方法的文章，回答中有明确给出这样的答案。<a href="http://stackoverflow.com/questions/4611764/java-hashmap-containskey-doesnt-call-equals" target="_blank">Java HashMap.containsKey() doesn't call equals()</a>

2.自己编程验证。

在文章开头的基础上，做了点儿改进，输出两个对象的`hash值，并且在`equals方法中打印一行文字。如下：

{% highlight java %}
public class Name {

  private String first; //first name
  private String last;  //last name

  public String getFirst() {
    return first;
  }

  public void setFirst(String first) {
    this.first = first;
  }

  public String getLast() {
    return last;
  }

  public void setLast(String last) {
    this.last = last;
  }

  public Name(String first, String last) {
    this.first = first;
    this.last = last;
  }

  @Override
  public boolean equals(Object object) {
    System.out.println("equals is running...");
    Name name = (Name) object;

    return first.equals(name.getFirst()) && last.equals(name.getLast());
  }

  public static void main(String[] args) {
    Map<Name, String> map = new HashMap<Name, String>();
    Name n1 = new Name("mali", "sb");
    System.out.println("the hashCode of n1 : " + n1.hashCode());
    map.put(n1, "yes");
    Name n2 = new Name("mali", "sb");
    System.out.println("the hashCode of n2 : " + n2.hashCode());
    System.out.println("is the key existed? ture or false? -> "
        + map.containsKey(n2));
  }

}

{% endhighlight %}

结果：
<blockquote>
  the hashCode of n1 : 1690552137<br>
  the hashCode of n2 : 1901116749<br>
  is the key existed? ture or false? -> false<br>
</blockquote>

从执行结果可以看出1、两个对象的`hash值是不相同的；2、equals方法确实也没有执行。

再次对代码进行改进，加入重写的`hashCode方法，如下，看看这次的结果会是怎样。

{% highlight java %}
public class Name {

  private String first; //first name
  private String last;  //last name

  public String getFirst() {
    return first;
  }

  public void setFirst(String first) {
    this.first = first;
  }

  public String getLast() {
    return last;
  }

  public void setLast(String last) {
    this.last = last;
  }

  public Name(String first, String last) {
    this.first = first;
    this.last = last;
  }

  @Override
  public boolean equals(Object object) {
    System.out.println("equals is running...");
    Name name = (Name) object;

    return first.equals(name.getFirst()) && last.equals(name.getLast());
  }

  public int hashCode() {
    System.out.println("hashCode is running..."); 
    return first.hashCode() + last.hashCode();
  }

  public static void main(String[] args) {
    Map<Name, String> map = new HashMap<Name, String>();
    Name n1 = new Name("mali", "sb");
    System.out.println("the hashCode of n1 : " + n1.hashCode());
    map.put(n1, "yes");
    Name n2 = new Name("mali", "sb");
    System.out.println("the hashCode of n2 : " + n2.hashCode());
    System.out.println("is the key existed? ture or false? -> "
        + map.containsKey(n2));
  }

}
{% endhighlight %}

结果：
<blockquote>
  hashCode is running...<br>
  the hashCode of n1 : 3347552<br>
  hashCode is running...<br>
  hashCode is running...<br>
  the hashCode of n2 : 3347552<br>
  hashCode is running...<br>
  equals is running...<br>
  is the key existed? ture or false? -> true
</blockquote>

同样从结果中可以看出：在`hash值相等的情况下，`equals方法也执行了，`HashMap的`containsKey方法也像预想的那样起作用了。

###结论：
在使用`HashSet（`contains也是调用`HashMap中的方法）、`HashMap等集合时，如果用到`contains系列方法时，记得需同时重写`equals与`hashCode方法。