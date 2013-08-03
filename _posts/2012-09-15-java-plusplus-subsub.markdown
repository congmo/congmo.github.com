---
layout: post
title: "Java中自增自减与return"
keywords: Java,return,自增,自减
---

承认自己又小白了，一直以为自增和自减都很简单，而且前自增自减与后自增自减在return之后的表现是一样的。事实告诉我，它们确确实实是不同的。也许你已经知道他们是不一样的，但是知道原因吗？这篇文章告诉你why！

首先我们来看一段代码以及代码的运行结果，然后从这段代码去进行分析。

{% highlight java %}
public class A {
  
  public static int a(){
    int b = 9;
    
    return b--;
  }
  
  public static int b(){
    int b = 8;
    return --b;
  }
  
  public static void main(String args[]){
    System.out.println(a());
    System.out.println(b());
  }

}
{% endhighlight %}

运行结果：
<blockquote>
  9<br>
  7
</blockquote>

也就是说b--没其作用，在return之后才其的作用，可是为什么呢？使用优先级也没法解释啊！难道要return之后才进行自减运算吗？还是使用利器javap查看一下编译后的字节码。

<div class='center' >
  <img src="/post_images/2012/09/javap--++.png">
</div>

上图就是编译后的java字节码，仔细观察会发现前减减与后减减被编译后生成的指令是有区别的。那就针对这两小段字节码来解释前自增（或者自减），后自增（或者自减）与return组合时都发生了什么。

<div class='center'>
  <img src="/post_images/2012/09/javap--++_a.png">
</div>

<blockquote>
  解析：<br>
    0行：将数字9push到栈顶<br>
    2行：将栈顶值存入第一个本地变量<br>
    3行：将第一个本地变量push到栈顶<br>
    4行：将第0个本地变量增加-1<br>
    7行：返回栈顶数据<br>
</blockquote>

下图辅助解释字节码执行过程：

<div class='center'>
  <img src="/post_images/2012/09/javap--++_a_after.png">
</div>

也就是说在进行自减操作之前对本地变量先入栈了，随后进行了自减操作，然后再将栈顶的值返回。这样后自减操作是没有影响到返回值的。

<div class='center'>
  <img src="/post_images/2012/09/javap--++_b.png">
</div>

<blockquote>
  解析：<br>
    0行：将数字8push到栈顶<br>
    2行：将栈顶值存入第一个本地变量<br>
    3行：将第0个本地变量增加-1<br>
    6行：将第一个本地变量push到栈顶<br>
    7行：返回栈顶数据
</blockquote>

<div class='center'>
  <img src="/post_images/2012/09/javap--++_b_before.png">
</div>

而前减减则会影响返回值，先进行自减后，再入栈，然后返回栈顶值。

####结论
自增（自减）与return组合时，要使用前自增（自减），否则不会影响返回结果。