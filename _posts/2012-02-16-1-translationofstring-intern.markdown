
---
layout: post
title: "String详解之二：intern隐士"
category: Translation
tags:
 - Java
 - String
 - trap
 - substring
 - intern
 - translation
keywords: Java, String, 翻译
---

规范化的字符串可节省空间，代价就是花费更多的CPU时间来检测存储在RAM中的字符串和替换字符串副本。规范化之后的字符串，不论存在多少引用，仅在RAM中存在一份。由于String是不可变的，所以比如两个不同的方法碰巧使用同一个字符串，那么它们就可以使用同一个String的副本。不论字符串的意思在不同的语境下是否相同，依旧可以共享，就好比sin可以是人名，当然也是三角函数中的函数名。共享重复字符串的过程就叫做规范化。String.intern()返回规范化的主字符串的引用。规范化之后的字符串可以直接使用==(比较引用)来比较两个字符串是否相等。由于String不可变的特性，可以节省很多空间。比如"pot"在"hippopotamus"中出现，那么就不需要创建新的字符串，额外分配新的空间(堆中的空间)，返回一个相应指向"hippopotamus"的引用即可。

###为何要规范化###

规范化字符串有如下两个原因：

<li>通过去除字符串字面值副本来节省空间(也就是字符串值在方法区中只有一份，其他全部是指向它的引用)。</li>
<li>使字符串比较变的很快。即使用equals比较规范化后的字符串也要快很多。</li>

就比如，将文件中用逗号分隔的20000人的党籍读入HashMap，那么内存中就需要20000左右个字符串用来记录这些党籍。如果将字符串进行规范化，那么几十个就足矣。

###规范化与String.substring()###

使用String.substring()时，JVM只在栈中分配一个String类型的引用，指向原始字符串的字面值。substring不需要额外分配空间，也不需要拷贝字符。String.substring不会对结果进行规范化。

注意：只要还有"活动"的子串指向原始字符串，那么垃圾回收期就没法回收它。

String.subString产生的空串也不用自动规范化，因此，空串也会导致长长的原始字符串没法被回收。
{% highlight java linenos %}
        public static void main(String args[]){
        String s = "a very long string";
        // create an empty substring
        String e1 = s.substring( 0,0);
        // make sure the empty string is canonical
        String e2 = ( e1.length() ==0) ? "" :e1;
        System.out.println( e1=="" );// always prints false
        System.out.println( e2=="" );// always prints true   
}
{% endhighlight %}

###规范化与void字符串###

想要避免空串致使原始字符串不能被回收，就不要使用任何void字符串指向原始字符串。void字符串有3中：""," ",null。
{% highlight java linenos %}
public final static String possiblyEmpty( StringpString)
{
   if( pString==null) return"";
   pString=pString.trim();
   if( pString.length() ==0) return"";
   returnpString;
}
public final staticStringpossiblyNull( StringpString)
{
   if( pString==null) returnnull;
   pString=pString.trim();
   if( pString.length() ==0) returnnull;
   returnpString;
}
public final staticStringneverNull( StringpString)
{
   /* if pString is null, Java will throw an NullPointerException */
   pString=pString.trim();
   /* if pString is empty or blank, throw a NullPointerException */
   if( pString.length() ==0) throw newNullPointerException();
   returnpString;
}
{% endhighlight %}

###规范化疑难杂症###
所有字符串在编译期间被规范化，那么程序运行时产生的字符串就不能被规范化。这样比较恶心的一点是在大多数情况下程序可以正常运行，但是在特殊的情况下就会出错。就比如，使用==替代equals来比较两个字符串是否相等，绝大多数是可行的，因为字符串会被规范化，但是不排除特例，比如运行期间产生的字符串。

###规范化与new String( String )###

新手喜欢用String s = new String( "hello" );代替String s = "hello";

这与规范化正好相反，这样创建了一个全新的"hello"字符串，虽然有相同的字面值，但是不会被规范化。在两种场景下适合使用new来创建字符串：

<li>预得到一个唯一的字符串同步对象。</li>
<li>为了不引用庞大的原始字符串。使用new来创建字符串，就可以使原始字符串被回收。如果只有几个很短的子串包含在一个庞大的字符串中，这时使用new来创建新的字符串是值得的。当然如果有众多的子串都要指向一个母串，就没有必要这样做了。</li>

使用new String( String )就一定会创建一个全新的字符串吗？答案是肯定的。你可能以为JVM很智能，会将新创建的字符串规范化，然后返回指向母串的引用。但是语言规范中指出，new String()一定会创建一个全新的字符串，尽管JVM在理论上可以同String.substring(0)和String.intern.substring(0)一样进行规范化，防止出现多个拷贝。

这就引申出另外一个问题，s == s.substring(0)总是返回false吗？答案也是肯定的。

还有一个适合用new来创建字符串的地方，如下：
{% highlight java linenos %}
String password = new String( jpassword.getPassWord() );
{% endhighlight %}

getPassWord方法返回一个字符数组(char[])，这么做并不愚蠢，在高安全性的场景下，就可以将char数组清空。

看下这段代码：String s = new String( "Hello" ); 当变量s所在的类被加载的时候，字面值"Hello"会被规范化，但是愚蠢的使用new String，会在堆中重新创建一份字面值"Hello"，地址与规范化后的"Hello"不同。在Sun的JVM中，规范化的字符串被存储在一个叫perm gen的特殊RAM区域，这个区域中JVM也加载类和存储本地编译后的代码，而且规范化后的字符串与存储在堆中的普通对象一样。如果这样写：String s = "Hello"，就不会重新创建"Hello"的副本，而是直接指向规范化后的字符串。

###规范化与垃圾回收###

在JDK的早起版本中，由于JVM要持有存储规范化后字符串的HashTable的引用，以便检查新创建的字符串是否已在共享池中存在，这样就导致了规范化后的字符串没法被垃圾回收器回收。随着1.2版本中引入了弱引用之后，无用的规范化字符串就可以被回收了。

JDK1.2版本之后，规范化字符串在没用引用指向它时，可以被回收，而且规范化不是只发生在编译期。这样以编码的方式重新创建、规范化字符串时，新创建的字符串对象会变成唯一的原始字符串。这样做不会带来实际的问题，使用==来比较两个字符串包含的字符是否相等同样奏效。(这里理解的不是很好，我觉得应该是这样的：同一个字面值规范化后，之前的那个字面值的地址会被新地址替换掉)

###溢出###

java.lang.OutOfMemoryError: String intern table overflow 表示规范化字符串太多。一些低版本的JVM规定规范化字符串不能超过64K(大约50000个)。IBM的Java1.1.8 JRE就有这样的限制。它是Error，不是Exception，如果想捕获它，可以这样做：
{% highlight java linenos %}
public class InternTest
{
        public static final intn=80000;
        public static void main( String[] args)
        {
                String[] hold = new String[n];
                // build list of interned strings
                for( inti=0;i<n;i++)
                {
                        try
                        {
                            hold[i] =Integer.toString(i).intern();
                        }
                        catch( Throwablee)
                        {
                            System.out.println( "intern exploded at " +i);
                            System.exit( 1);
                        }
                 }
                // make sure they were really interned.
                for( inti=0;i<n;i++)
                {
                if( hold[i] !=Integer.toString(i).intern() )
                {
                    System.out.println( "intern failed at " +i);
                    System.exit( 1);
                }
        }
              System.out.println( "intern good for at least " +n+" Strings." );
}
{% endhighlight %}

依旧要注意规范化会"不利"垃圾回收。

###底层###

这里只讲底层规范化如何起作用的最简单形式。JVM内部在堆中存储对象，包括规范化与普通的String对象(这个说法貌似不是很严谨)。而且规范化的String被放在一个"弱"HashMap中。

HashMap中的String集合，也叫字符串常量池。他们和堆中其他普通对象没什么两样，只是因为经过优化后，生存期要长一些。String对象在堆中，而指向它的引用存在HashMap中，所以规范化字符串有自己的共享池。

当字符串被规范化时，先在HashMap中检查是否已存在，如果存在则返回指向主字符串的引用，通常这个引用优先自身的引用，而自身的副本就很快被垃圾回收器回收。如果没有，则将其引用添加到HashMap中，并注册为主字符串。规范化的过程不会再生成字符串的副本，只是持有主字符串的唯一引用。

规范化与非规范化的字符串都存储在堆中。由于规范化时产生的是弱引用，所以当除了HashMap中的弱引用再无其他引用指向主字符串时，该主字符串就可以被回收了。

new String时，不会自动规范化，因此在堆中会有同一个字符串的多个副本。随后调用该字符串的intern方法，这些副本也不会被清除。

我总感觉这里貌似有问题，干脆不翻译了，把原文贴上吧。

<blockquote>
This is a simplified version of how interning works under the hood. Inside the JVM is the heap where all allocated Objects reside. This includes Strings both interned and ordinary. (In Sun’s JVM, the interned Strings (which includes String literals) are stored in a special pool of RAM called the perm gen, where the JVM also loads classes and stores natively compiled code. However, the intered Strings behave no differently than had they been stored in the ordinary object heap.) In addition, interned Strings are registered in a weak HashMap.The collection of Strings registered in this HashMap is sometimes called the String pool. However, they are ordinary Objects and live on the heap just like any other (perhaps in an optimised way since interned Strings tend to be long lived). The String Object lives on the heap and a reference to it lives in the HashMap. There is so separate pool of interned String objects.
Whenever a String is interned, it is looked up in the HashMap to see if it exists already. If so the user gets passed a reference to the master copy. Normally he will use that copy in preference to his. His duplicate copy then will likely soon have no references to it and will be eventually garbage collected. If the String has never been seen before, a reference to it will be added to the HashMap and intern will hand him a reference to his own String, now registered as the unique master. Note that the intern process does not make a copy of the String, it just keeps a reference to the unique master copies.
All the Strings, interned and ordinary live on the heap. When there are no references left to a String except the intern HashMap registry reference, it will be garbage collected since intern keeps only a weak reference to it.
When you say new String, it is not automatically interned. Thus there may then be duplicates on the heap. If you later use intern on that String, those duplicates won’t be cleaned up. Only when you intern all copies of a String, and discard references to the uninterned versions do you maintain but a single copy.
</blockquote>

###手动规范化###

规范化最大的问题就是知道程序结束才能销毁占用RAM的空间，尽管再没有引用指向主字符串，也不能被垃圾回收器回收(早期版本)。如果想使用一个临时的规范化字符串，可以使用手动规范化。

然而，现在主流的JVM中的规范化字符串共享池都是采用弱引用实现的，所以只要没有强引用指向主字符串，则可被垃圾回收器回收。你可以像JVM一样，自己实现规范化的过程。

比如假设从文件中读取以逗号分隔的人名与地址，并以某种顺序存入集合，由于很多人居住在同一城市，所以RAM中就会充满了同一个城市的副本。

那么创建一个HashMap(不是HashSet),用于存储每个城市名称的主字符串。每次获取城市时，先从HashMap中查找，如果存在则用主字符串的引用替换自身的引用。自身String对象的副本很快就会被垃圾回收器回收。如果不存在增加城市到HashMap。

当读完城市后，就可以讲HashMap抛弃，而放入到HashMap中的主字符串，除了没有其他引用指向的主字符串被垃圾回收器回收掉之外，还是一样存在，一样拥有唯一的引用，而且与规范化后的字符串一样。

原文地址：<a href="http://mindprod.com/jgloss/interned.html">http://mindprod.com/jgloss/interned.html</a>

<br/><br/>

------------------------------------------------------------------------------------------------------------

这里就算翻译完了，不过有些地方觉得怪怪的。还有由于个人水平实在是有限，难免有地方粗糙。另外，如果你说研究这个实在是没有意思类似的话，那拜托你憋在心里吧，谢谢了。

因为在看jdk源码，看到String中最后一行的intern是个native方法，于是就到处查资料，还在OSChina上提出一个问题：<a href="http://www.oschina.net/question/129471_38493">http://www.oschina.net/question/129471_38493</a>，讨论中就提到了撒加在javaeye上的一个帖子的回答：<a href="http://www.iteye.com/topic/1112592">http://www.iteye.com/topic/1112592</a>，于是我做了如下的测试，又画了3张图。


测试环境：
<blockquote>
java version "1.6.0_17"
Java(TM) SE Runtime Environment (build 1.6.0_17-b04)
Java HotSpot(TM) Client VM (build 14.3-b01, mixed mode, sharing)
</blockquote>
{% highlight java linenos %}
public static void main(String[] args) {
        String str0 = "congmo.github.com";
        System.out.println(str0.intern() == str0);
}
{% endhighlight %}
<blockquote>
输出结果：true
</blockquote>

{% highlight java linenos %}
public static void main(String[] args) {
        String str0 = args[0];
        System.out.println(str0.intern() == str0);
}
{% endhighlight %}
<blockquote>
同样在命令行输入:congmo.github.com<br/>
输出结果：<br/>
false
</blockquote>

{% highlight java linenos %}
public static void main(String[] args) {

        String str0 = "congmo.github.com";
        System.out.println(str0.intern() == str0);
                
        String str1 = new String( args[0] );
        System.out.println(str1.intern() == str1);

        System.out.println(str0 == str1.intern());
}
{% endhighlight %}
<blockquote>
输出结果：<br/>
true<br/>
false<br/>
true<br/>
</blockquote>

从前面两段代码中可以看出，使用命令行的方式同样输入参数"congmo.github.com"，将args[0]赋值给str0，然后str0.intern()==str0的结果竟然是false，难道真如javaeye那篇帖子中有人怀疑的那样，JVM将args[0]提前就规范化了？按道理应该不会啊。


测试环境：
<blockquote>
java version "1.7.0_02"
Java(TM) SE Runtime Environment (build 1.7.0_02-b13)
Java HotSpot(TM) Client VM (build 22.0-b10, mixed mode, sharing)
</blockquote>
{% highlight java linenos %}
public static void main(String[] args) {
        String str0 = args[0];
        System.out.println(str0.intern() == str0);
}
{% endhighlight %}
<blockquote>
输出结果：
true
</blockquote>

{% highlight java linenos %}
public static void main(String[] args) {
        String str0 = new String( args[0] );
        System.out.println(str0.intern() == str0);
}
{% endhighlight %}
<blockquote>
输出结果：
true
</blockquote>

{% highlight java linenos %}
public static void main(String[] args) {
        String str0 = args[0];
        System.out.println(str0.intern() == str0);
        String str = new String( args[0] );  
        System.out.println(str.intern() == str);
        System.out.println(str.intern() == str0);
}
{% endhighlight %}
<blockquote>
输出结果：<br/>
true<br/>
false<br/>
true<br/>
</blockquote>

但是从1.7版本执行的结果看来，貌似可以确定JVM没有对args[0]规范化，但是从javaeye帖子讨论中可以知晓1.7版本后perm gen这个内存区被干掉了，所以规范化之后的字符串也存储在堆中，所以无论args[0]有没有提前被规范化，str0始终都会指向堆中那个引用。按照我的理解，如下图所示：

<div class='center'>
        <img src='/post_images/2012/02/intern1.png' width='600px' height='400px' />
</div>

所以现在看来还是个未知数。

另外，我按照自己的理解针对3中情况画了3张图，都是用于说明JVM的内存分配的。
注：jdk1.6或之前版本，1.7之后方法区被砍掉。

<div class='center'>
        <img src="/post_images/2012/02/intern2.png" width='600px' height='400px' />
</div>

<div class='center'>
        <img src="/post_images/2012/02/intern3.png" width='600px' height='400px' />
</div>

这两张图都是描述使用new创建String，然后再调用自身的intern方法后内存以及引用的变化。