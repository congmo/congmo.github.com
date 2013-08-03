---
layout: post
title: "对象如何死去"
keywords: JVM,Java,GC,深入理解Java虚拟机
---

####目的

最近对读书做笔记深有体会，真切的感觉到读书后一定要在还有感觉的时候记录下来，不然一回头的功夫就会忘的干干净净。所以在看完《深入Java虚拟机》一书的第二章后，就没有继续往下看，地铁上换了一本赞誉颇多的《数学之美》，等第二章的笔记做完再继续。

Java使开发人员从内存分配与释放的工作中解脱出来，由JVM自动完成垃圾的回收。但是这并不意味着程序猿就不需要了解GC相关的知识了。了解GC知识有助于写出高性能的代码，有助于系统的调优，当然也有助于在面试的时候唬住面试官。：）

一次GC需要干3件事儿：
<ul>
  <li>哪些内存需要回收</li>
  <li>什么时候回收</li>
  <li>如何回收</li>
</ul>

本篇博客是针对"哪些内存需要回收"以一主题，也就是对象是如何死去的。其他两个主题见后续文章。GC针对的内存区域是堆内存，方法区属于堆的逻辑分区，当然也在回收范围之内。栈没什么不用JVM去进行GC呢？其实原因不难解释，因为栈是线程独享的区域，随着线程生命周期的结束会被自动释放掉，自然就无需JVM的GC进行管理了。

####一个对象的自白：是什么让我死去...

JVM要执行GC的首要任务就是知道哪些内存区域是可以被回收的，哪些对象是"无用"的，可以被killed。

#####如此简单的就被判了死刑：引用计数法

引用计数器，从名字上就可以猜到7、8分，一想到它我的脑海中就是：你要怎样解决循环引用？它确实解决不了。

这个算法是这样描述的：给对象中添加一个引用计数器，每当有一个地方引用它时，计数器的值就+1；当引用失效的时候就-1，当计数器的值为0时，那么它就被判了死刑。就这么简单，因为无法解决循环引用问题，所以Java中没有选择这种方式。但是引用计数法的判定效率很高，大部分场景下它是一个很好的算法。

接下来用代码来说明怎样的情况是引用计数法解决不了的循环引用问题。

{% highlight java %}

  public class ReferenceCountGC {
    
    public Object instance = null;
    
    private static final int _1MB = 1024 * 1024;

    /**
      * 这个成员属性的唯一意义就是占点内存，以便能在GC日志中看清楚是否被回收过
    */
    private byte[] bigSize = new byte[2 * _1MB];
    
    public static void testGC(){
      ReferenceCountGC objA = new ReferenceCountGC();
      ReferenceCountGC objB = new ReferenceCountGC();
      
      objA.instance = objB;
      objB.instance = objA;
      
      objA = null;
      objB = null;
      
      System.gc();
    }
  }

{% endhighlight %}

都知道Java中未提供任何手动释放内存的api，只有`System.gc()`可供使用，还仅仅是用于告知垃圾回收器哪些对象可以被回收了。所以上面的程序运行具有不确定性，不知何时会进行垃圾回收，所以就根据代码画了一张运行时内存分配图，如下：

<div class='center'>
    <img style="max-width:700px" src='/post_images/2012/07/countgc.png'/>
</div>

在执行`objA=null`和`objB=null`之前的内存分配就如上图所示，在执行了这两句之后改变的仅仅是栈内存，图中的两条红线断开，其他都不会改变。很明显堆中的objA与objB两个对象的引用计数器的值都为1，如果采用引用计数法来宣告对象是否死亡，那么objB与objA就永远不会被回收，此类现象如果非常非常多就会造成内存溢出。

最后本着不放弃的信念，又写了一个main函数执行了一下，看样子是执行了一次gc。

<blockquote>[Full GC 4330K->135K(20352K), 0.2316239 secs]</blockquote>

#####对象的高级死法

在主流的程序语言中（Java和C#，甚至古老的Lisp），都是用根搜索算法判定对象是否存活。这个算法的基本思想就是通过一系列的名为"GC Roots"的对象作为起始点，从这些节点开始向下搜索，搜索走过的路径称为引用链(Reference Chain)，当一个对象到GC Root没有任何引用链，则宣告对象死亡。

在Java语言中，可作为GC Roots的对象包括下面几种：

<li>虚拟机栈中的引用的对象</li>
<li>方法区中的静态属性引用的对象</li>
<li>方法区中的常量引用的对象</li>
<li>本地方法区中JNI的引用的对象</li>

一幅图解释根搜索算法的原理。不多做解释。

<div class='center'>
    <img style="max-width:700px" src='/post_images/2012/07/gc-roots.png'/>
</div>

####引用啊引用

在JDK1.2之后，Java对引用的概念进行了扩充，将引用分为强引用（Strong Reference）、软引用（Soft Reference）、弱引用（Weak Reference）、虚引用（Phantom Reference）四种。

<ul>
  <li>强引用就是指在程序代码中普遍存在的，类似"Object obj = new Object()"这样的引用，只要强引用还在，垃圾回收器就永远不会回收掉被引用的对象</li>
  <li>软引用用来描述一些还有用，但是并非必须的对象。对于软引用关联的对象，系统将要发生内存溢出异常之前，将会把这些对象列进回收范围之中进行二次回收。如果这次回收还是没有足够的内存，才会抛出内存溢出异常。在JDK1.2之后才体统了软引用</li>
  <li>弱引用也是用来藐视非必须对象的，但是它的强度比软引用更弱一些，被弱引用关联的对象只能城村到下一次垃圾收集发生之前。当垃圾收集器工作时，无论当前内存是否足够，都会回收掉只被弱引用关联的对象。在JDK1.2之后才提供弱引用</li>
  <li>虚引用也成幽灵引用或者幻影引用，它是最弱的一种引用关系。一个对象是否有虚引用的存在，完全不会对其生存时间构成影响，也无法通过虚引用来取得一个对象实例。为一个对象设置虚引用关联的唯一目的就是希望能在这个对象被收集器回收时收到一个系统通知。在JDK1.2之后才提供虚引用</li>
</ul>

####原来对象还可以死缓...

在根搜索算法中不可达的对象，也并非是"非死不可"的，这时候他们暂时处于"死缓"阶段，要真正宣告一个对象，至少要经理两次标记过程：如果对象在进行根搜索后发现没有与GC Roots想连接的引用链，那它将被第一次标记并且进行一次筛选，筛选的条件是此对象是否有必要执行`finalize()`方法。当对象没有覆盖`finalize`方法，或者`finalize()`方法已经被虚拟机调用过，虚拟机将这两种情况都视为"没有必要执行"。`finalize()`方法是对象逃脱死亡命运的最后一次机会，GC对F-Queue中的对象进行第二次小规模的标记，如果对象要在`finalize()`方法中成功拯救自己，只要重新与引用链上的任何一个对象建立关联即可，否则就只剩下等死一条路。

show出代码，呈现对象自我救赎。

{% highlight java %}

  /**
   * 此代码演示了两点：
   * 1.对象可以在被GC时自我拯救
   * 2.这种自救的机会只有一次，因为一个对象的finalize()方法最多之辈系统自动调用一次
   *
   */
  public class FinalizeEscapeGC {
    
    public static FinalizeEscapeGC  SAVE_HOOK = null;
    
    public void isAlive(){
      System.out.println("yes, i am still alive :>");
    }
    
    protected void finalize() throws Throwable{
      super.finalize();
      System.out.println("finalize method executed!");
      FinalizeEscapeGC.SAVE_HOOK = this;
    }
    
    /**
     * @param args
     * @throws InterruptedException 
     */
    public static void main(String[] args) throws InterruptedException {
      
      SAVE_HOOK = new FinalizeEscapeGC();
      
      //对象第一次成功自救
      SAVE_HOOK = null;
      System.gc();
      
      //因为Finalizer方法优先级很低，暂停0.5秒，以等待它
      Thread.sleep(500);
      
      if(SAVE_HOOK != null){
        SAVE_HOOK.isAlive();
      }else{
        System.out.println("no, i am dead :(");
      }
      
      //下面这段代码与上面的完全相同，但是这次自救失败
      SAVE_HOOK = null;
      System.gc();
      
      //因为Finalizer方法优先级很低，暂停0.5秒，以等待它
      Thread.sleep(500);
      
      if(SAVE_HOOK != null){
        SAVE_HOOK.isAlive();
      }else{
        System.out.println("no, i am dead :(");
      }
    }

  }

{% endhighlight %}

代码的执行结果证明，对象可以自我营救，但机会只有一次。
<blockquote>
finalize method executed!<br>
yes, i am still alive :><br>
no, i am dead :(
</blockquote>

程序中有两点值得注意：

<ul>
  <li>1.示例中出现两段完全相同的代码段，但是结果却截然相反。原因就在于`finalize`方法只能被执行一次，一次后就失效，所以第二次自救是失败的</li>
  <li>2.finalize()方法执行代价高昂，不确定性大，无法保证各个对象的调用顺序。另外finalize()方法用于释放外部资源欠妥，完全可以用try-finally替代。</li>
</ul>

####方法区内存也是可以回收的哦...

很多人认为方法区(或者HotSpot虚拟机中的永久代--JDK7中已经被干掉)是没有垃圾回收器的，Java虚拟机规范中确实说过可以不要求虚拟机在方法区实现垃圾收集，而且在方法区进行垃圾收集的"性价比"一般比较低：在堆中，尤其是在新生代中，常规应用进行一次垃圾收集一般可回收70%-95%的空间，而永久代的垃圾收集效率要远低于此。

永久代的垃圾收集主要回收两部分内容：废弃常量和无用的类。回收废弃常量与回收Java堆中的对象非常类似。常量池中的其他类(接口)、方法、字段的字符引用也与此类似。

判定一个常量是否是"废弃常量"比较简单，而要判定一个类是否是"无用的类"的条件则相对苛刻许多。类需要同时满足下面3个条件才能算是"无用的类"：
<ul>
  <li>该类所有的实例都已经被回收，也就是Java堆中不存在该类的任何实例</li>
  <li>加载该类的ClassLoader已经被回收</li>
  <li>该类对应的java.lang.Class对象没有在任何地方被引用，无法在任何地方通过反射访问该类的方法</li>
</ul>

虚拟机可以对满足上述3个条件的无用类进行回收，这里说的仅仅是"可以"，而不是和对象一样，不使用了就必然会回收。是否对类进行回收，HotSpot虚拟机提供了`-Xnoclassgc`参数控制。
