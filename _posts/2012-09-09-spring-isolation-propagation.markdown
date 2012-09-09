---
layout: post
title: "Spring 声明式事务的隔离级别与传播机制"
category: Spring
tags:
 - Java
 - Spring
keywords: Java,Spring,Isolation,Propagation,传播机制,隔离级别
---

相信每个人都被问过无数次Spring声明式事务的隔离级别和传播机制吧！今天我也来说说这两个东西.

<blockquote>

  加入一个小插曲，<br>
  一天电话里有人问我声明式事务隔离级别有哪几种，<br>
  我就回答了7种，<br>
  他问我Spring的版本，<br>
  我回答为3.0。<br>
  他说那应该是2.5的，3.0好像变少了。<br>
  我回答这个没有确认过。<br>
  <br>
  后来我就google了一下，没发现什么痕迹说明事务的隔离级别变少了，也查了下官方文档，也没有相关的说明。索性在github上clone一下Spring的源码，看看源码中有几种就是几种了呗。<br>
  <br>
  后来想想那天他那么问我完全可能是一个坑啊，因为交谈的过程中挖过至少两个坑了。再者说，Spring要向下兼容的，如果少了怎么处理呢？当然这两点都是我自己的猜测。
</blockquote>

###声明式事务

在Spring中，声明式事务是用事务参数来定义的。一个事务参数就是对事务策略应该如何应用到某个方法的一段描述，如下图所示一个事务参数共有5个方面组成：


###传播行为

事务的第一个方面是传播行为。传播行为定义关于客户端和被调用方法的事务边界。Spring定义了7中传播行为。
<table style="border:1px solid">
  <thead>
    <tr>
      <th>传播行为</th>
      <th>意义</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>PROPAGATION_MANDATORY</td>
      <td>表示该方法必须运行在一个事务中。如果当前没有事务正在发生，将抛出一个异常</td>
    </tr>
    <tr>
      <td>PROPAGATION_NESTED</td>
      <td>表示如果当前正有一个事务在进行中，则该方法应当运行在一个嵌套式事务中。被嵌套的事务可以独立于封装事务进行提交或回滚。如果封装事务不存在，行为就像PROPAGATION_REQUIRES一样。</td>
    </tr>
    <tr>
      <td>PROPAGATION_NEVER</td>
      <td>表示当前的方法不应该在一个事务中运行。如果一个事务正在进行，则会抛出一个一场。</td>
    </tr>
    <tr>
      <td>PROPAGATION_NOT_SUPPORTED</td>
      <td>表示该方法不应该在一个事务中运行。如果一个现有事务正在进行中，它将在该方法的运行期间被挂起。</td>
    </tr>
    <tr>
      <td>PROPAGATION_SUPPORTS</td>
      <td>表示当前方法不需要事务性上下文，但是如果有一个事务已经在运行的话，它也可以在这个事务里运行。</td>
    </tr>
    <tr>
      <td>PROPAGATION_REQUIRES_NEW</td>
      <td>表示当前方法必须在它自己的事务里运行。一个新的事务将被启动，而且如果有一个现有事务在运行的话，则将在这个方法运行期间被挂起。</td>
    </tr>
    <tr>
      <td>PROPAGATION_REQUIRES</td>
      <td>表示当前方法必须在一个事务中运行。如果一个现有事务正在进行中，该方法将在那个事务中运行，否则就要开始一个新事务。</td>
    </tr>
  </tbody>
</table>