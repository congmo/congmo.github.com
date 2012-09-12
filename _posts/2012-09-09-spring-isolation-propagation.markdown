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

<div class='center'>
  <img src="/post_images/2012/09/declarative-transaction.png">
</div>


###传播行为

事务的第一个方面是传播行为。传播行为定义关于客户端和被调用方法的事务边界。Spring定义了7中传播行为。
<table>
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
      <td>表示当前的方法不应该在一个事务中运行。如果一个事务正在进行，则会抛出一个异常。</td>
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

传播规则回答了这样一个问题，就是一个新的事务应该被启动还是被挂起，或者是一个方法是否应该在事务性上下文中运行。

###隔离级别

声明式事务的第二个方面是隔离级别。隔离级别定义一个事务可能受其他并发事务活动活动影响的程度。另一种考虑一个事务的隔离级别的方式，是把它想象为那个事务对于事物处理数据的自私程度。

在一个典型的应用程序中，多个事务同时运行，经常会为了完成他们的工作而操作同一个数据。并发虽然是必需的，但是会导致一下问题：

<li>
  脏读（Dirty read）-- 脏读发生在一个事务读取了被另一个事务改写但尚未提交的数据时。如果这些改变在稍后被回滚了，那么第一个事务读取的数据就会是无效的。
</li>

<li>
  不可重复读（Nonrepeatable read）-- 不可重复读发生在一个事务执行相同的查询两次或两次以上，但每次查询结果都不相同时。这通常是由于另一个并发事务在两次查询之间更新了数据。
</li>

<li>
  幻影读（Phantom reads）-- 幻影读和不可重复读相似。当一个事务（T1）读取几行记录后，另一个并发事务（T2）插入了一些记录时，幻影读就发生了。在后来的查询中，第一个事务（T1）就会发现一些原来没有的额外记录。
</li>

在理想状态下，事务之间将完全隔离，从而可以防止这些问题发生。然而，完全隔离会影响性能，因为隔离经常牵扯到锁定在数据库中的记录（而且有时是锁定完整的数据表）。侵占性的锁定会阻碍并发，要求事务相互等待来完成工作。

考虑到完全隔离会影响性能，而且并不是所有应用程序都要求完全隔离，所以有时可以在事务隔离方面灵活处理。因此，就会有好几个隔离级别。

<table>
  <thead>
    <tr>
      <th>隔离级别</th>
      <th>含义</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ISOLATION_DEFAULT</td>
      <td>使用后端数据库默认的隔离级别。</td>
    </tr>
    <tr>
      <td>ISOLATION_READ_UNCOMMITTED</td>
      <td>允许读取尚未提交的更改。可能导致脏读、幻影读或不可重复读。</td>
    </tr>
    <tr>
      <td>ISOLATION_READ_COMMITTED</td>
      <td>允许从已经提交的并发事务读取。可防止脏读，但幻影读和不可重复读仍可能会发生。</td>
    </tr>
    <tr>
      <td>ISOLATION_REPEATABLE_READ</td>
      <td>对相同字段的多次读取的结果是一致的，除非数据被当前事务本身改变。可防止脏读和不可重复读，但幻影读仍可能发生。</td>
    </tr>
    <tr>
      <td>ISOLATION_SERIALIZABLE</td>
      <td>完全服从ACID的隔离级别，确保不发生脏读、不可重复读和幻影读。这在所有隔离级别中也是最慢的，因为它通常是通过完全锁定当前事务所涉及的数据表来完成的。</td>
    </tr>
  </tbody>
</table>

###只读

声明式事务的第三个特性是它是否是一个只读事务。如果一个事务只对后端数据库执行读操作，那么该数据库就可能利用那个事务的只读特性，采取某些优化措施。通过把一个事务声明为只读，可以给后端数据库一个机会来应用那些它认为合适的优化措施。由于只读的优化措施是在一个事务启动时由后端数据库实施的，因此，只有对于那些具有可能启动一个新事务的传播行为（PROPAGATION_REQUIRES_NEW、PROPAGATION_REQUIRED、ROPAGATION_NESTED）的方法来说，将事务声明为只读才有意义。

此外，如果使用Hibernate作为持久化机制，那么把一个事务声明为只读，将使Hibernate的flush模式被设置为FLUSH_NEVER。这就告诉Hibernate避免和数据库进行不必要的对象同步，从而把所有更新延迟到事务的结束。

###事务超时

为了使一个应用程序很好地执行，它的事务不能运行太长时间。因此，声明式事务的下一个特性就是它的超时。

假设事务的运行时间变得格外的长，由于事务可能涉及对后端数据库的锁定，所以长时间运行的事务会不必要地占用数据库资源。这时就可以声明一个事务在特定秒数后自动回滚，不必等它自己结束。

由于超时时钟在一个事务启动的时候开始的，因此，只有对于那些具有可能启动一个新事务的传播行为（PROPAGATION_REQUIRES_NEW、PROPAGATION_REQUIRED、ROPAGATION_NESTED）的方法来说，声明事务超时才有意义。

###回滚规则

事务五边形的对后一个边是一组规则，它们定义哪些异常引起回滚，哪些不引起。在默认设置下，事务只在出现运行时异常（runtime exception）时回滚，而在出现受检查异常（checked exception）时不回滚（这一行为和EJB中的回滚行为是一致的）。

不过，也可以声明在出现特定受检查异常时像运行时异常一样回滚。同样，也可以声明一个事务在出现特定的异常时不回滚，即使那些异常是运行时一场。

###扩展阅读

标题是只有事务的隔离级别和传播机制，却顺带这把声明式事务的五个特性都讲述了一遍。：）

文章开头说过查看Spring中事务的源码来确认3.0版本及之后事务的传播机制是否减少了，其实在TransactionDefinition这个接口中定义了事务的隔离级别、传播机制、只读以及超时相关的全部信息。源码如下，感兴趣的可以自己对照一下，看看英文注释。

{% highlight java %}
/*
 * Copyright 2002-2010 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.springframework.transaction;

import java.sql.Connection;

/**
 * Interface that defines Spring-compliant transaction properties.
 * Based on the propagation behavior definitions analogous to EJB CMT attributes.
 *
 * <p>Note that isolation level and timeout settings will not get applied unless
 * an actual new transaction gets started. As only {@link #PROPAGATION_REQUIRED},
 * {@link #PROPAGATION_REQUIRES_NEW} and {@link #PROPAGATION_NESTED} can cause
 * that, it usually doesn't make sense to specify those settings in other cases.
 * Furthermore, be aware that not all transaction managers will support those
 * advanced features and thus might throw corresponding exceptions when given
 * non-default values.
 *
 * <p>The {@link #isReadOnly() read-only flag} applies to any transaction context,
 * whether backed by an actual resource transaction or operating non-transactionally
 * at the resource level. In the latter case, the flag will only apply to managed
 * resources within the application, such as a Hibernate <code>Session</code>.
 *
 * @author Juergen Hoeller
 * @since 08.05.2003
 * @see PlatformTransactionManager#getTransaction(TransactionDefinition)
 * @see org.springframework.transaction.support.DefaultTransactionDefinition
 * @see org.springframework.transaction.interceptor.TransactionAttribute
 */
public interface TransactionDefinition {

  /**
   * Support a current transaction; create a new one if none exists.
   * Analogous to the EJB transaction attribute of the same name.
   * <p>This is typically the default setting of a transaction definition,
   * and typically defines a transaction synchronization scope.
   */
  int PROPAGATION_REQUIRED = 0;

  /**
   * Support a current transaction; execute non-transactionally if none exists.
   * Analogous to the EJB transaction attribute of the same name.
   * <p><b>NOTE:</b> For transaction managers with transaction synchronization,
   * <code>PROPAGATION_SUPPORTS</code> is slightly different from no transaction
   * at all, as it defines a transaction scope that synchronization might apply to.
   * As a consequence, the same resources (a JDBC <code>Connection</code>, a
   * Hibernate <code>Session</code>, etc) will be shared for the entire specified
   * scope. Note that the exact behavior depends on the actual synchronization
   * configuration of the transaction manager!
   * <p>In general, use <code>PROPAGATION_SUPPORTS</code> with care! In particular, do
   * not rely on <code>PROPAGATION_REQUIRED</code> or <code>PROPAGATION_REQUIRES_NEW</code>
   * <i>within</i> a <code>PROPAGATION_SUPPORTS</code> scope (which may lead to
   * synchronization conflicts at runtime). If such nesting is unavoidable, make sure
   * to configure your transaction manager appropriately (typically switching to
   * "synchronization on actual transaction").
   * @see org.springframework.transaction.support.AbstractPlatformTransactionManager#setTransactionSynchronization
   * @see org.springframework.transaction.support.AbstractPlatformTransactionManager#SYNCHRONIZATION_ON_ACTUAL_TRANSACTION
   */
  int PROPAGATION_SUPPORTS = 1;

  /**
   * Support a current transaction; throw an exception if no current transaction
   * exists. Analogous to the EJB transaction attribute of the same name.
   * <p>Note that transaction synchronization within a <code>PROPAGATION_MANDATORY</code>
   * scope will always be driven by the surrounding transaction.
   */
  int PROPAGATION_MANDATORY = 2;

  /**
   * Create a new transaction, suspending the current transaction if one exists.
   * Analogous to the EJB transaction attribute of the same name.
   * <p><b>NOTE:</b> Actual transaction suspension will not work out-of-the-box
   * on all transaction managers. This in particular applies to
   * {@link org.springframework.transaction.jta.JtaTransactionManager},
   * which requires the <code>javax.transaction.TransactionManager</code>
   * to be made available it to it (which is server-specific in standard J2EE).
   * <p>A <code>PROPAGATION_REQUIRES_NEW</code> scope always defines its own
   * transaction synchronizations. Existing synchronizations will be suspended
   * and resumed appropriately.
   * @see org.springframework.transaction.jta.JtaTransactionManager#setTransactionManager
   */
  int PROPAGATION_REQUIRES_NEW = 3;

  /**
   * Do not support a current transaction; rather always execute non-transactionally.
   * Analogous to the EJB transaction attribute of the same name.
   * <p><b>NOTE:</b> Actual transaction suspension will not work out-of-the-box
   * on all transaction managers. This in particular applies to
   * {@link org.springframework.transaction.jta.JtaTransactionManager},
   * which requires the <code>javax.transaction.TransactionManager</code>
   * to be made available it to it (which is server-specific in standard J2EE).
   * <p>Note that transaction synchronization is <i>not</i> available within a
   * <code>PROPAGATION_NOT_SUPPORTED</code> scope. Existing synchronizations
   * will be suspended and resumed appropriately.
   * @see org.springframework.transaction.jta.JtaTransactionManager#setTransactionManager
   */
  int PROPAGATION_NOT_SUPPORTED = 4;

  /**
   * Do not support a current transaction; throw an exception if a current transaction
   * exists. Analogous to the EJB transaction attribute of the same name.
   * <p>Note that transaction synchronization is <i>not</i> available within a
   * <code>PROPAGATION_NEVER</code> scope.
   */
  int PROPAGATION_NEVER = 5;

  /**
   * Execute within a nested transaction if a current transaction exists,
   * behave like {@link #PROPAGATION_REQUIRED} else. There is no analogous
   * feature in EJB.
   * <p><b>NOTE:</b> Actual creation of a nested transaction will only work on
   * specific transaction managers. Out of the box, this only applies to the JDBC
   * {@link org.springframework.jdbc.datasource.DataSourceTransactionManager}
   * when working on a JDBC 3.0 driver. Some JTA providers might support
   * nested transactions as well.
   * @see org.springframework.jdbc.datasource.DataSourceTransactionManager
   */
  int PROPAGATION_NESTED = 6;


  /**
   * Use the default isolation level of the underlying datastore.
   * All other levels correspond to the JDBC isolation levels.
   * @see java.sql.Connection
   */
  int ISOLATION_DEFAULT = -1;

  /**
   * Indicates that dirty reads, non-repeatable reads and phantom reads
   * can occur.
   * <p>This level allows a row changed by one transaction to be read by another
   * transaction before any changes in that row have been committed (a "dirty read").
   * If any of the changes are rolled back, the second transaction will have
   * retrieved an invalid row.
   * @see java.sql.Connection#TRANSACTION_READ_UNCOMMITTED
   */
  int ISOLATION_READ_UNCOMMITTED = Connection.TRANSACTION_READ_UNCOMMITTED;

  /**
   * Indicates that dirty reads are prevented; non-repeatable reads and
   * phantom reads can occur.
   * <p>This level only prohibits a transaction from reading a row
   * with uncommitted changes in it.
   * @see java.sql.Connection#TRANSACTION_READ_COMMITTED
   */
  int ISOLATION_READ_COMMITTED = Connection.TRANSACTION_READ_COMMITTED;

  /**
   * Indicates that dirty reads and non-repeatable reads are prevented;
   * phantom reads can occur.
   * <p>This level prohibits a transaction from reading a row with uncommitted changes
   * in it, and it also prohibits the situation where one transaction reads a row,
   * a second transaction alters the row, and the first transaction re-reads the row,
   * getting different values the second time (a "non-repeatable read").
   * @see java.sql.Connection#TRANSACTION_REPEATABLE_READ
   */
  int ISOLATION_REPEATABLE_READ = Connection.TRANSACTION_REPEATABLE_READ;

  /**
   * Indicates that dirty reads, non-repeatable reads and phantom reads
   * are prevented.
   * <p>This level includes the prohibitions in {@link #ISOLATION_REPEATABLE_READ}
   * and further prohibits the situation where one transaction reads all rows that
   * satisfy a <code>WHERE</code> condition, a second transaction inserts a row
   * that satisfies that <code>WHERE</code> condition, and the first transaction
   * re-reads for the same condition, retrieving the additional "phantom" row
   * in the second read.
   * @see java.sql.Connection#TRANSACTION_SERIALIZABLE
   */
  int ISOLATION_SERIALIZABLE = Connection.TRANSACTION_SERIALIZABLE;


  /**
   * Use the default timeout of the underlying transaction system,
   * or none if timeouts are not supported. 
   */
  int TIMEOUT_DEFAULT = -1;


  /**
   * Return the propagation behavior.
   * <p>Must return one of the <code>PROPAGATION_XXX</code> constants
   * defined on {@link TransactionDefinition this interface}.
   * @return the propagation behavior
   * @see #PROPAGATION_REQUIRED
   * @see org.springframework.transaction.support.TransactionSynchronizationManager#isActualTransactionActive()
   */
  int getPropagationBehavior();

  /**
   * Return the isolation level.
   * <p>Must return one of the <code>ISOLATION_XXX</code> constants
   * defined on {@link TransactionDefinition this interface}.
   * <p>Only makes sense in combination with {@link #PROPAGATION_REQUIRED}
   * or {@link #PROPAGATION_REQUIRES_NEW}.
   * <p>Note that a transaction manager that does not support custom isolation levels
   * will throw an exception when given any other level than {@link #ISOLATION_DEFAULT}.
   * @return the isolation level
   */
  int getIsolationLevel();

  /**
   * Return the transaction timeout.
   * <p>Must return a number of seconds, or {@link #TIMEOUT_DEFAULT}.
   * <p>Only makes sense in combination with {@link #PROPAGATION_REQUIRED}
   * or {@link #PROPAGATION_REQUIRES_NEW}.
   * <p>Note that a transaction manager that does not support timeouts will throw
   * an exception when given any other timeout than {@link #TIMEOUT_DEFAULT}.
   * @return the transaction timeout
   */
  int getTimeout();

  /**
   * Return whether to optimize as a read-only transaction.
   * <p>The read-only flag applies to any transaction context, whether
   * backed by an actual resource transaction
   * ({@link #PROPAGATION_REQUIRED}/{@link #PROPAGATION_REQUIRES_NEW}) or
   * operating non-transactionally at the resource level
   * ({@link #PROPAGATION_SUPPORTS}). In the latter case, the flag will
   * only apply to managed resources within the application, such as a
   * Hibernate <code>Session</code>.
   * <p>This just serves as a hint for the actual transaction subsystem;
   * it will <i>not necessarily</i> cause failure of write access attempts.
   * A transaction manager which cannot interpret the read-only hint will
   * <i>not</i> throw an exception when asked for a read-only transaction.
   * @return <code>true</code> if the transaction is to be optimized as read-only 
   * @see org.springframework.transaction.support.TransactionSynchronization#beforeCommit(boolean)
   * @see org.springframework.transaction.support.TransactionSynchronizationManager#isCurrentTransactionReadOnly()
   */
  boolean isReadOnly();

  /**
   * Return the name of this transaction. Can be <code>null</code>.
   * <p>This will be used as the transaction name to be shown in a
   * transaction monitor, if applicable (for example, WebLogic's).
   * <p>In case of Spring's declarative transactions, the exposed name will be
   * the <code>fully-qualified class name + "." + method name</code> (by default).
   * @return the name of this transaction
   * @see org.springframework.transaction.interceptor.TransactionAspectSupport
   * @see org.springframework.transaction.support.TransactionSynchronizationManager#getCurrentTransactionName()
   */
  String getName();

}
{% endhighlight %}

还是觉得不安心，发两张图证明隔离级别和传播机制：
<li>eclipse中给出的关于传播机制的智能提示截图</li>
<div class="center">
  <img src="/post_images/2012/09/propagation.png">
</div>
<li>eclipse中给出的关于隔离级别的智能提示截图</li>
<div class="center">
  <img src="/post_images/2012/09/isolation.png">
</div>

<style type="text/css">
  table td,th{
    border-right: 1.0pt solid;
    border-bottom: 1.0pt solid;
  }
  table{
    border-collapse: collapse;
    border-top: 1.0pt solid;
    border-bottom: 1.0pt solid;
    border-left: 1.0pt solid;
    border-right: 1.0pt solid;
  }
</style>