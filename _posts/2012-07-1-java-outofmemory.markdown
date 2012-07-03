---
layout: post
title: "OutOfMemoryError详解"
category: Impression After Reading
tags:
 - Java
 - OutOfMemoryError
 - JVM
keywords: JVM,Java,OutOfMemoryError,深入理解Java虚拟机
---

####絮絮叨叨
最近在看周志明的《深入理解Java虚拟机》，虽然刚刚开始看，但是觉得还是一本不错的书。对于和我一样对于JVM了解不深，有志进一步了解的人算是一本不错的书。注明：不是书托，同样是华章出的书，质量要比《深入剖析Tomcat》高好多，起码排版上没有那么多严重的失误，停，等哪天心情不好再喷那本书。：）(还有一本书让我看完觉得挺不爽的，当然不排除自身问题)

刚刚看了两章，第一章我比较关注如何自己编译openJdk，额，现在还没捣腾成功，完成后再分享，暂且跳过；本篇文章的主要任务是记录书中关于产生OutOfMemoryError异常的原因。代码以及说明基本都是出自原书，写这篇文章意在加深印象，同时分享给那些没有读过这本书的人。说句自己的一次经历，不记得是在哪家公司面试来着，面试官曾经问过我都有哪些情况会造成OutOfMemoryError异常。很遗憾，当时我不会。

####设置运行时参数

说下为什么加了这样一节，说来惭愧，第一次设置运行时参数，找不到在哪里设置，找了半天才找对位置，怕有和我一样小白的人存在，所以就增加了这样一个小节。(IDE工具是eclipse)

按照如下三步设置即可，呈现一场代码的注释中会标注每种情形需要设置的运行时参数。

#####step1:

<div class='center'>
    <img src='/post_images/2012/07/run1.png'/>
</div>

#####step2:

<div class='center'>
    <img style="width:700px" src='/post_images/2012/07/run2.png'/>
</div>

#####step3:

<div class='center'>
    <img style="width:700px" src='/post_images/2012/07/run3.png'/>
</div>

可以这样为每个含有main函数的类指定自己的运行时参数。

####造成内存溢出之五大元凶

个人觉得程序员都要有"刨祖坟"的精神，文艺一点儿就是知其然，知其所以然。在日常的工作中更应该如此，不能说要实现一个功能就满口答应，起码要知道为什么需要这样一个功能，解决什么问题，是否合理。如果连原因都不知道，真心不相信能把这个功能做好。也许这个也是好管理和不好管理程序员的分割线。如果说发生OutOfMemoryError跟我们无关，那我们为什么要知道发生的原因啊，美国打伊拉克我和程序员有毛关系啊。其实这个异常对大家来说应该都不陌生，之前我最爱的处理就是从新再运行一次，不行关闭eclipse，再不行重启电脑。(杀手锏级别的解决方案).可是这样不科学，科学的方式就要求我们知道为什么会发生这个异常，换句话说是发生这个异常的场景，然后通过打印出的异常信息快速定位发生内存溢出的区域，然后进行权衡，调整运行时参数来解决。

#####Java堆溢出

Java堆用于存储对象实例，知道这一点就很容易呈现堆溢出，不断的创建对象，并且保持有指向其的引用，防止为gc。

代码如下：

{% highlight java %}
  import java.util.ArrayList;
  import java.util.List;

  /**
   * VM Args:-Xms20M -Xmx20M -XX:+HeapDumpOnOutOfMemoryError
   *
   */
  public class HeapOOM {
    
    static class OOMObject{
      
    }
    
    public static void main(String[] args) {
      List<OOMObject> list = new ArrayList<OOMObject>();
      
      while(true){
        list.add(new OOMObject());
      }
    }

  }
{% endhighlight %}

通过设置-Xms20M -Xmx20M都为20M意在防止堆大小自动扩展，更好的展现溢出。
执行结果如下：

<div class='center'>
    <img style="max-width:700px" src='/post_images/2012/07/HeapOOM.png'/>
</div>

<blockquote>Exception in thread "main" java.lang.OutOfMemoryError: Java heap space</blockquote>
是不是很明显啊，显示堆空间发生OutOfMemoryError。

书中告诉我们发生了OutOfMemoryError后，通常是通过内存影像分析工具对dump出来的堆转储快照进行分析(这就是运行时参数中配置-XX:+HeapDumpOnOutOfMemoryError的原因)，重点是确定是由内存泄露(Memory Leak)还是有内存溢出(Memory Overflow)引起的OutOfMemoryError。如果是内存泄露则找到泄露点，修正；如果确实是合理的存在，那么就增加堆空间。(内存分析这里我也木有做过，工具也木有使用过，在后续章节会有介绍，用熟了后再来一篇)

#####虚拟机栈和本地方法栈溢出

由于在HotSpot虚拟机中并不区分虚拟机栈和本地方法区栈，因此对于HotSpot来说，-Xoss(设置本地方法栈大小)参数是无效的，栈容量由-Xss参数设定。关于虚拟机栈和本地方法区栈，在Java虚拟机规范中描述了两种异常：
<li>如果线程请求的栈深度大于虚拟机所允许的最大深度，将抛出StackOverflowError异常</li>
<li>如果虚拟机在扩展栈时无法申请到足够的内存空间，则抛出OutOfMemoryError异常</li>

书中谈到单线程的场景下只能浮现StackOverflowError，那我们就先来看看单线程场景下到底会是什么样子。
{% highlight java %}

/**
 * 
 * VM Args:-Xss128k
 */
public class JavaVMStackSOF {
  private int stackLength = 1;
  private void stackLeak() {
    stackLength++;
    stackLeak();
  }
  public static void main(String[] args) throws Throwable {
    JavaVMStackSOF oom = new JavaVMStackSOF();
    try {
      oom.stackLeak();
    } catch (Throwable e) {
      System.out.println("stack length:" + oom.stackLength);
      throw e;
    }
  }
}

{% endhighlight %}

通过-Xss128k设置虚拟机栈大小为128k，执行结果如下：

<div class="center">
  <img style="max-width:700px" src='/post_images/2012/07/JavaVMStackSOF.png'/>
</div>

执行结果显示，确实是发生了StackOverflowError异常。

通过不断创建线程耗尽内存也可以呈现出OutOfMemoryError异常，但是在Windows平台下模拟会使系统死机，我这里就不多说了。感兴趣的可以自己去尝试。

#####运行时常量池溢出

向运行时常量池中添加内容最简单的方式就是使用String.intern()方法。由于常量池分配在方法区内，可以通过-XX:PermSize和-XX:MaxPermSize限制方法区的大小，从而间接限制其中常量池的容量。

代码如下：

{% highlight java %}
  import java.util.ArrayList;
  import java.util.List;

  /**
   * VM Args:-XX:PermSize=10M -XX:MaxPermSize=10M
   * 
   */
  public class RuntimeConstantPoolOOM {

    public static void main(String[] args) {

      List<String> list = new ArrayList<String>();

      int i = 0;

      while (true) {
        list.add(String.valueOf(i++).intern());
      }
    }

  }
{% endhighlight %}

这里有个小小的插曲，之前有听说在jdk7中将永久区(方法区和常量池)给干掉了，没有验证过。永久区可以说是在堆之上的一个逻辑分区。如果jdk7中去掉了，那么这个示例应该会抛出堆空间的内存溢出，而非运行时常量池的内存溢出。所以在执行程序的时候分别用了jdk6和jdk7两个版本。多说一句，如果jdk7去掉了方法区，那么-XX:PermSize=10M -XX:MaxPermSize=10M就不起作用了，所以在jdk7环境下运行时，堆大小为jvm默认的大小，要执行一会儿(半小时左右:( ))才能抛出异常。没关系，再配置下运行时参数即可，注意要配置成不可扩展。以图为据：

<li>jdk6环境下抛出运行时常量池内存溢出</li>

<div class="center">
  <img style="max-width:700px" src='/post_images/2012/07/RuntimeConstantPoolOOM-jdk6.png'/>
</div>

<blockquote>
  Exception in thread "main" java.lang.OutOfMemoryError: PermGen space
</blockquote>
显而易见<strong>PermGen space</strong>，永久区。不解释。

<li>jdk7环境下，运行时参数为：-XX:PermSize=10M -XX:MaxPermSize=10M</li>

<div class="center">
  <img style="max-width:700px" src='/post_images/2012/07/RuntimeConstantPoolOOM-jdk7.png'/>
</div>

<blockquote>
  Exception in thread "main" java.lang.OutOfMemoryError: Java heap space
</blockquote>

运行了好久好久，最终抛出堆内存溢出。Java heap space已经足够说明问题了。

<li>jdk7环境下，运行时参数为：-verbose:gc -Xms20M -Xmx20M -XX:+HeapDumpOnOutOfMemoryError</li>

<div class="center">
  <img style="max-width:700px" src='/post_images/2012/07/RuntimeConstantPoolOOM-jdk7-modify.png'/>
</div>

<blockquote>
  Exception in thread "main" java.lang.OutOfMemoryError: Java heap space
</blockquote>

同样也是堆内存溢出，不过速度就快了好多好多，因为堆大小被设置为不可扩展。

#####方法区溢出

方法区用于存放Class的相关信息，如类名、访问修饰符、常量池、字段描述、方法描述等。测试这个区域只要在运行时产生大量的类填满方法区，知道溢出。书中借助CGlib直接操作字节码运行时，生成了大量的动态类。

当前主流的Spring和Hibernate对类进行增强时，都会使用到CGLib这类字节码技术，增强的类越多，就需要越大的方法区来保证动态生成的Class可以加载到内存。

测试代码如下：

{% highlight java %}
  import net.sf.cglib.proxy.Enhancer;
  import net.sf.cglib.proxy.MethodInterceptor;
  import net.sf.cglib.proxy.MethodProxy;

  /**
   * VM Args:-XX:PermSize=10M -XX:MaxPermSize=10M
   *
   */
  public class JavaMethodAreaOOM {
    public static void main(String[] args) {
      while (true) {
        Enhancer enhancer = new Enhancer();
        enhancer.setSuperclass(OOMObject.class);
        enhancer.setUseCache(false);
        enhancer.setCallback(new MethodInterceptor() {
          public Object intercept(Object object, Method method,
              Object[] args, MethodProxy proxy) throws Throwable{
            return proxy.invokeSuper(object, args);
          }
        });
        enhancer.create();
      }

    }

    static class OOMObject {

    }

  }

{% endhighlight %}

工程中要引入cglib-2.2.2.jar和asm-all-3.3.jar。

方法区的内存溢出问题同样存在jdk6和jdk7版本之间的区别，同运行时常量池内存溢出。

方法区溢出也是一种常见的内存溢出异常，一个类如果要被垃圾收集器回收掉，判定条件是非常苛刻的。在经常动态生成大量Class的应用中，需要特别注意类的回收状况。这类场景除了上面提到的程序使用了CGLib字节码增强外，常见的还有：大量JSP或动态生成JSP文件的应用、基于OSGi的应用等。

#####本机直接内存溢出

DirectMemory容量可以通过-XX:MaxDirectMemorySize指定。

示例代码如下：

{% highlight java %}

  import java.lang.reflect.Field;
  import sun.misc.Unsafe;

  /**
   * VM Args:-Xmx20M -XX:MaxDirectMemorySize=10M
   *
   */
  public class DirectMemoryOOM {

    private static final int _1MB = 1024 * 1024;

    /**
     * @param args
     * @throws IllegalAccessException
     * @throws IllegalArgumentException
     */
    public static void main(String[] args) throws IllegalArgumentException,
        IllegalAccessException {
      // TODO Auto-generated method stub
      Field unsafeField = Unsafe.class.getDeclaredFields()[0];
      unsafeField.setAccessible(true);
      Unsafe unsafe = (Unsafe) unsafeField.get(null);
      
      while(true){
        unsafe.allocateMemory(_1MB);
      }
    }

  }

{% endhighlight %}

运行结果如下图：

<div class="center">
  <img style="max-width:700px" src='/post_images/2012/07/DirectMemoryOOM.png'/>
</div>

抛出内存溢出异常。不解释。