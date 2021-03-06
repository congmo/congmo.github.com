---
layout: post
title: "异常处理最佳实践"
keywords: Java, Exception, 翻译
---
<span><strong>作者：Gunjan Doshi</strong></span>

异常处理通常都会遇到这样一个问题：何时以及如何使用异常。本文主要介绍异常处理的最佳实践，当然也会针对目前对检查性异常做一些总结与归纳。

作为开发人员，我们都希望能编写既具高质量又能解决问题的代码，不幸的是，异常对代码质量总是会起到负面的影响。没有哪个程序员愿意一味的接受这种负面的影响，所以我们总是寻找各种方法避免异常处理。我曾经看过优秀的程序员这样处理异常：

{% highlight java %}
public void consumeAndForgetAllExceptions(){
    try {
        ...some code that throws exceptions
    } catch (Exception ex){
        ex.printStacktrace();
    }
}
{% endhighlight %}

这段代码有什么问题吗？

只是，当有异常被抛出，当前执行程序被挂起，控制权移交到catch块中。catch块除了将异常捕获什么也没做，然后catch块后面的程序继续执行，就好像什么都没发生一样。

下面这种方式怎么样？

{% highlight java %}
public void someMethod() throws Exception{
}
{% endhighlight %}

这就是一个空方法，方法体内根本一行代码都没有，怎么还要抛出异常呢？在java里面，你确实可以这样干。我就遇到过在一段很简单的代码中声明抛出异常，却没有任何一行代码会引发异常。当我询问程序员为何要这么做的时候，他这样回答我：“我知道这样使API看起来很糟糕，但是我一直都是这样做的，而且这样做也奏效。”

C++社区花了几年时间研究要怎么处理异常，然而关于异常处理的讨论在java社区也开始了，越来越多的java程序员正在与异常处理做斗争。如果异常使用不当，会造成程序执行缓慢，因为创建和捕获异常需要占用内存和CPU。过度使用异常，一方面会造成程序的可读性极差，另一方面会给调用者造成不必要的麻烦。编写代码时，很可能像上面两个例子一样，直接将异常抛出或者忽略。

<h4><strong>The Nature of Exceptions</strong></h4>

总的来说，三种情况会引发异常：

<ul>
    <li>
        运行时异常：这种异常，是由程序运行时错误引发的，比如NullPointerException、IllegalArgumentException 。对于这种运行时错误，我们无能为力，做不了任何处理。
    </li>
    <li>
        代码错误引发的异常：调用者编码时，违反API的约定引发的异常。如果在异常中包含着重要的信息，那么调用者可以采取一些针对该异常的补救方法。比如在解析XML文档的时候，因格式不正确引发异常，异常中会记录引发异常的位置，这样，编写代码时，就可以利用它采取补救措施。
    </li>
    <li>
        资源错误引发的异常：当请求资源失败时，引发的异常。比如内存溢出或者网络连接失败等。针对这种异常的处理要权衡需求，可以超时重新发送请求，也可以记录下失败的资源后停止应用程序。
    </li>
</ul>

<h4><strong>Types of Exceptions in Java</strong></h4>

java中定义了两类异常：
<ul>
    <li>
        检查性异常：检查性异常继承自Exception，调用者必须在catch块中捕获这类异常，或者将异常抛到上层。
    </li>
    <li>
        非检查性异常：RuntimeException
        也是继承自Exception，所有继承自RuntimeException的异常，都不需要进行处理，所以叫做非检查型异常。
    </li>
</ul>
通过举例的方式，图一展现了`NullPointerException`的继承关系。
<div class='center'>
  <img src="/post_images/2012/02/exception.gif" /><br/>
  <span>图一：异常继承关系</span>
</div><br/>
图中`NullPointerException`继承自`RunTimeException`，所以是非检查性异常。

目前非检查性异常很少使用，更多的是使用检查性异常。最近java社区中关于检查性异常及其价值的争论异常火热。这场争论源自于java是第一个使用检查性异常的主流面向对象编程语言。C++和C#中没有检查性异常一说，全部都是非检查性异常。

检查性异常强制要求调用者捕获异常，或向上层抛出异常。如果调用者，无法对检查性异常做出有效的处理，那么这种强制性捕获或抛出的约定就会变成一种负担。编程人员可能采取偷懒的方式使用空白的`catch`块将异常忽略，或者干脆直接抛出。事实上，这已经造成了调用者的负担。

检查性异常还违反封装性原则。看一下下面这段代码：

{% highlight java %}
public List getAllAccounts() throws
    FileNotFoundException, SQLException{
    ...
}
{% endhighlight %}

`getAllAccounts()`方法抛出两种检查性异常。尽管你还不知道`getAllAccounts()`中调用哪个文件或数据库失败，或是不支持文件系统或数据库逻辑，但是调用`getAllAccounts()`时必须显式的处理这两种异常。所以，检查性异常迫使方法和它的调用者间保持着高度的耦合。

<h4><strong>Best Practices for Designing the API</strong></h4>

前面已经说了很多，现在我们来看看如何正确设计异常处理的API。

1. 当你不知道应该使用检查性异常还是非检查型异常时，不妨这样问自己：当捕获到异常时，通过编码我能做些什么？

如果异常发生时，通过编码的方式补救异常发生的情况，那么它就是检查性异常。当然如果无法通过编码方式采取任何有用的处理，那么就是非检查性异常。这里的有用性，是指能减少异常发生带来的“损失”，而不是简单记录一下异常信息。总结如下：
<li>
调用者什么也做不了，则使用非检查型异常
</li>
<li>
可根据异常携带的信息做出进一步处理，则使用检查性异常。
</li>

而且，运行时错误作为非检查性异常的优点在于：非检查性异常不会强制调用者显式的处理异常。可以在需要的时候捕获非检查性异常，没必要时就不进行捕获，记录一下就好。
(Moreover, prefer unchecked exceptions for all programming errors: unchecked exceptions have the benefit of not forcing the client API to explicitly deal with them. They propagate to where you want to catch them, or they go all the way out and get reported)。java的API中使用了很多非检查性异常，比如NullPointException、IllegalArgumentException、IllegalStateException等。本人更倾向于使用java自带的异常，而不是自定义异常。这些异常可以使我的代码更易理解，还可避免因为创建和捕获自定义异常增加对内存的占用。

2. 捍卫封装性

不要将特定的异常抛到上层。例如，不要将`SQLException`从数据访问层抛到业务对象层，业务对象层不需要知道`SQLException`的细节。应对这种情况，你可以有两种选择：
<li>
如果在发生异常时，想通过编码进行某些处理，那么就把`SQLException`转换成另一种检查性异常抛出.
</li>
<li>
如果不对异常进行处理，那么就转换成非检查性异常抛出。
</li>

大多数情况下，面对`SQLException`我们无能为力，那么直接转化成非检查性异常抛出。看看下面一段代码：

{% highlight java %}
public void dataAccessCode(){
    try{
        ..some code that throws SQLException
    }catch(SQLException ex){
        ex.printStacktrace();
    }
}
{% endhighlight %}

这个`catch`块没做任何处理，将异常忽略掉，这样做是因为对于`SQLException`我们做不了任何处理。看看这样处理如何？

{% highlight java %}
public void dataAccessCode(){
    try{
        ..some code that throws SQLException
    }catch(SQLException ex){
        throw new RuntimeException(ex);
    }
}
{% endhighlight %}

这里将`SQLException`转化成`RuntimeException`抛出。当`SQLException`发生时，在`catch`块中抛出一个`RuntimeException`，然后当前线程被挂起，异常信息被记录下来。这样，我没有在业务对象层添加不必要的异常处理，因为对`SQLException`什么也做不了。

如果你确信当发生`SQLException`时，业务对象层可以进行有用的处理，那么就可以将`SQLException`转化成有意义的检查性异常。但是多数情况下，抛出`RuntimeException`是比较明智的选择。（哇，很有激情啊，两点多了。嘿嘿）

注：今天继续翻译完。

3. 如果没有特殊需求，不要使用自定义异常

下面这段代码有什么问题吗？

{% highlight java %}
public class DuplicateUsernameException
    extends Exception {}
{% endhighlight %}

这个自定义异常除了一个颇具含义的名称外，对调用者没提供任何有用的信息。不要忘记java中的异常也和其他类一样，可以在其内部为调用者提供获取有价值信息的方法。

可以在`DuplicateUsernameException`中添加如下方法：

{% highlight java %}
public class DuplicateUsernameException
    extends Exception {
    public DuplicateUsernameException 
        (String username){....}
    public String requestedUsername(){...}
    public String[] availableNames(){...}
}
{% endhighlight %}

加强版本中提供了两个方法：一个是`requestedUsername()`方法，用来返回调用方法的名称；另一个是`availableNames()`返回一个与调用方法名称相似的数组。这样编码时就可以指出调用方法不可用，以及哪些方法是可用的。如果没有额外的信息记录在异常中，那么直接像这样抛出标准异常即可：

{% highlight java %}
throw new Exception("Username already taken");
{% endhighlight %}

甚至，处理异常时，除了将方法名记录下来外不会做其他处理，那么像下面一样抛出非检查型异常就好。

{% highlight java %}
throw new RuntimeException("Username already taken");
{% endhighlight %}

当然，也可以提供方法用于检查用户名是否已被占用。

仍然要强调一下，检查性异常使用的场景是：处理异常时，通过异常提供的信息可以采取进一步处理。运行时错误，全部当做非检查性异常，这样做会使我们的代码更具可读性。

4. 验证异常

你可以使用javadoc的@throws标注检查性异常和非检查型异常。但是我比较倾向于使用单元测试验证异常。测试环境下可以追踪异常，因此服务器被当做可运行文档来使用。不管使用什么方式，需要让调用者感知异常的发生。下面是一个关于 `IndexOutOfBoundsException`异常的例子：

{% highlight java %}
public void testIndexOutOfBoundsException() {
    ArrayList blankList = new ArrayList();
    try {
        blankList.get(10);
        fail("Should raise an IndexOutOfBoundsException");
    } catch (IndexOutOfBoundsException success) {}
}
{% endhighlight %}

这段代码中，当`blankList.get(10)`被调用时，就会抛出`IndexOutOfBoundsException`异常。如果没引发异常，`fail("Should raise an IndexOutOfBoundsException")`语句会使单元测试失败。通过为异常编写单元测试，不仅可以验证异常是如何执行的，还可以通过测试特定异常，让代码变的更健壮。

<h4><strong>Best Practices for Using Exceptions</strong></h4>

这一部分，主要围绕“如何处理异常”。

1. 自己释放资源

当数据库连接或网络连接资源使用完毕后，记得手动将它们释放。即使代码中只使用了非检查性异常，也要使用`try-finally`语句块来释放资源。

{% highlight java %}
public void dataAccessCode(){
    Connection conn = null;
    try{
        conn = getConnection();
        ..some code that throws SQLException
    }catch(SQLException ex){
        ex.printStacktrace();
    } finally{
        DBUtil.closeConnection(conn);
    }
}

class DBUtil{
    public static void closeConnection
        (Connection conn){
        try{
            conn.close();
        } catch(SQLException ex){
            logger.error("Cannot close connection");
            throw new RuntimeException(ex);
        }
    }
}
{% endhighlight %}

DBUtil是数据库连接的工具类，这里的关键点是`finally`块，不论执行过程中是否发生异常，`finally`中的代码一定会被执行。示例中，在`finally`块中关闭数据库连接，如未正常关闭，则抛出`RuntimeException`。

2. 流程控制中切勿使用异常

产生栈跟踪信息的代价很大，而且只有在调试的时候这些信息才有用。由于在流程控制中发生异常时，调用者只想知道如何处理，所以栈跟踪信息完全可以被忽略。

下面是一个在流程控制中使用自定义`MaximumCountReachedException`异常的示例：

{% highlight java %}
public void useExceptionsForFlowControl() {
    try {
        while (true) {
            increaseCount();
        }
    } catch (MaximumCountReachedException ex) {
    }
    //Continue execution
}

public void increaseCount()
    throws MaximumCountReachedException {
    if (count >= 5000)
        throw new MaximumCountReachedException();
}
{% endhighlight %}

`useExceptionsForFlowControl()`中是一个抛出异常才会终止的无限循环，这样做不仅让代码的可读性变的很差，而且严重减低了程序的运行速度。切忌只在适合的场景下使用异常。

3. 不要忽略异常

当有异常抛出，这就是告诉我们需要做出处理的信号。如果捕获到的检查性异常对你毫无用处，那么直接转化成非检查性异常并再次抛出为妙，而不是使用"{}"将异常忽略，程序就好像什么都没发生一样照常执行。

4. 不要捕获顶级异常

检查性异常继承自`RuntimeException， RuntimeException`还继承自`Exception`。和下面的代码一样，捕获顶级异常`Exception`，也同样了捕获`RuntimeException`异常。

{% highlight java %}
try{
..
}catch(Exception ex){
}
{% endhighlight %}

5. 异常只记录一次

多次在栈中记录同一个异常信息，会增加获取原始异常的难度，所以确保同一个异常信息只记录一次。

<h4><strong>总结</strong></h4>

关于异常处理的最佳方式有很多种。我没有激起检查性异常与非检查型异常之间的争论的意思，编码过程中需要根据实际的需求去设计和使用它们。我坚信随着时间的推移，还会出现更好的异常处理方式。

虽然这篇文章是2003年写的，但是其价值在今天依然是值得肯定的。(译者注)

本文先发布于：<a href="http://www.ituring.com.cn/article/155">http://www.ituring.com.cn/article/155</a>

原文地址：<a href="http://onjava.com/pub/a/onjava/2003/11/19/exceptions.html">http://onjava.com/pub/a/onjava/2003/11/19/exceptions.html</a>
