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

####构造器注入方式

构造器注入方式是通过Spring容器调用含参构造函数实现的，每个参数都相当于一个依赖。这种方式和把参数传递给工厂方法来构造bean是非常相似的。

#####构造器参数解析

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

####Setter注入方式