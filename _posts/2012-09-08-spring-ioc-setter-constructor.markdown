---
layout: post
title: "Spring IOC（DI）之注入方式"
category: Spring
tags:
 - Java
 - Spring
 - IOC
 - DI
keywords: Java,Spring,Java,IOC,DI
---

一次被问到IOC的注入方式，当时脑袋一阵混乱，不知道噻。于是google了一下，发现众说纷纭，有说三种的，有说四种的。都滚犊子吧，还是看看官方文档吧。
<blockquote>
	DI exists in two major variants, Constructor-based dependency injection and Setter-based dependency injection.
</blockquote>
从官方文档上也看不出到底有几种注入方式，从上面这段引文中仅仅能知道主要有两种：构造器注入方式和Setter注入方式。

###构造器注入方式

构造器注入方式是通过Spring容器调用含参构造函数实现的，每个参数都相当于一个依赖。这种方式和把参数传递给工厂方法来构造bean是非常相似的。

####构造器参数解析

构造器通过参数类型匹配，如果参数类型都很明确，在bean实例化时，通过参数顺序来选择合适的构造函数。示例如下：

{% highlight java %}
package x.y;

public class Foo {

  public Foo(Bar bar, Baz baz) {
      // ...
  }
}
{% endhighlight %}

不存在参数类型不确定性是指Bar和Baz不在一个继承体系内（除Object体系外），因此在配置&lt;constructor-arg/&gt;时，不需要特别指定参数的索引值或类型。如下：
 
{% highlight xml %}
<beans>
  <bean id="foo" class="x.y.Foo">
      <constructor-arg ref="bar"/>
      <constructor-arg ref="baz"/>
  </bean>

  <bean id="bar" class="x.y.Bar"/>
  <bean id="baz" class="x.y.Baz"/>

</beans>
{% endhighlight %}

就像上面例子中那样，当被其他bean引用时，就已经可以确定类型了。但是构造器参数中使用了像这样><value>true<value>的基本数据类型，在没有提示的前提下Spring是没办法确定类型的，就像下面这个例子：

{% highlight java %}
package examples;

public class ExampleBean {

  // No. of years to the calculate the Ultimate Answer
  private int years;

  // The Answer to Life, the Universe, and Everything
  private String ultimateAnswer;

  public ExampleBean(int years, String ultimateAnswer) {
      this.years = years;
      this.ultimateAnswer = ultimateAnswer;
  }
}
{% endhighlight %}

#####参数类型匹配构造器

使用简单类型作为参数时，指定>type属性值，这样Spring容器就可以通过类型匹配来选择合适的构造器。这样上面那个问题就可以这样解决：

{% highlight xml %}
<bean id="exampleBean" class="examples.ExampleBean">
	<constructor-arg type="int" value="7500000"/>
	<constructor-arg type="java.lang.String" value="42"/>
</bean>
{% endhighlight %}

#####构造器参数索引值

根据构造器中参数的索引值来指定>index属性值来匹配参数。如下：

{% highlight xml %}
<bean id="exampleBean" class="examples.ExampleBean">
	<constructor-arg index="0" value="7500000"/>
	<constructor-arg index="1" value="42"/>
</bean>
{% endhighlight %}

指定索引值就可以解决一个构造器使用两个相同类型参数的问题。注意索引值是从0开始的。

#####构造器参数名称

从Spring3.0起，可以使用构造器参数名称来消除参数模糊问题。

{% highlight xml%}
<bean id="exampleBean" class="examples.ExampleBean">
	<constructor-arg name="years" value="7500000"/>
	<constructor-arg name="ultimateanswer" value="42"/>
</bean>
{% endhighlight %}
需要特殊说明的是：如果要使用参数名称，那么需要在编译的时候启用debug标志，这样Spring才能用构造器中找到参数名称。如果不能或者不想开启debug模式，可以使用>@ConstructorProperties注解来指定构造器中参数的名称。示例如下：

{% highlight java %}
package examples;

public class ExampleBean {

  // Fields omitted

  @ConstructorProperties({"years", "ultimateAnswer"})
  public ExampleBean(int years, String ultimateAnswer) {
      this.years = years;
      this.ultimateAnswer = ultimateAnswer;
  }
}
{% endhighlight %}

###Setter注入方式