
---
layout: post
title: "String详解之一：基础"
category: Translation
tags:
 - Java
 - String
 - trap
 - substring
 - translation
keywords: Java, String, 翻译
---
译者注：翻译这篇文章是有目的性的，不是闲来无事打发时间。刚刚看完String的源码，虽然看完，但是有很多东西(或者说"陷阱")在源码中得不到体现。可能是在编译器中进行了优化。无意中发现了这篇文章，里面讲述了一些隐含的，源码中比较隐晦或者看不到的东西。比如substring,intern等。所以才有了翻译的"动机"，还有一篇专门讲述intern的，将在之二中翻译。另，翻译纯属个人行为，因技术与英语水准有限，文中肯定不乏欠妥之处，如果你能文明的指出，在下将感激不尽。如言辞中满是不尊重，则请收回。希望能带给其大家帮助，以达共同进步之目的。

Java中的字符串不同于与C++中的字符串，不能改动字符串中的字符。预查找字符串中某个字符，可是使用charAt()方法。Java中的字符串都是16位的Unicode。可是使用StringBuffer或者char[]修改字符串。从1.5版本之后，可以使用StringBuilder替代StringBuffer，StringBuilder速度更快，但是是线程不安全的。

String.length()用来获取字符串的长度，而不是像其他类中使用的length或size()。

###空字符串###

Java中有3种空字符串：null,""和" "。下面就是如何区别这3中空字符串的方法。
{% highlight java  %}
if( s==null) echo( "was null" );
else if( s.length() ==0) echo( "was empty" );
else if( s.trim().length() ==0) echo( "was blank or other whitespace" );
{% endhighlight %}

###字符串比较###
{% highlight java  %}
if( "abc".equals(s) ) echo( "matched" );
{% endhighlight %}
与
{% highlight java  %}
if( s.equals( "abc" ) ) echo( "matched" );
{% endhighlight %}
当s为null时，不会抛出异常，只会当作它们不相等。
除非使用String.intern()对字符串进行合并(interned)，否则不可以使用==来判断两个字符串是否相等。要使用equals()方法来比较。

如果一不小心误用==来比较字符串，编译器也不会发出警告。不幸的是，这个bug直到编译器或者虚拟机显式进行规范化(interning)时，才会凸显出。规范化(interning)之后，会获得一个字符串的原始引用。这样其他字符串的副本就可以很快被垃圾回收器回收。然而，规范化(interning)有3点不足：

<li>要花费额外的时间在一个HashTable中查找原始字符串。</li>
<li>在某些JVM的实现中，有规范化字符串最大长度为64K的限制。</li>
<li>在某些JVM的实现中，规范化后的字符串，就算不在被引用，也永远不会被垃圾回收器回收。</li>

如果想比较两个字符串的大小，就不能使用常规的比较操作了，可以使用compareTo()或compareToIgnoreCase()方法替代。
{% highlight java  %}
String s ="apple";
String t ="orange";
if( s.compareTo(t) <0)
{
   System.out.println( "s < t" );
}
{% endhighlight %}
compareTo的返回值：

<li>如果s在字符表中排在t之后，返回正数。</li>
<li>如果s与t位置一样，返回0.</li>
<li>如果s在字符表中排在t之前，返回负数。</li>

这个时候可以粗略的把字符串当作数字。返回值就是s-t。

新手可能会因为下面的几个结果感到惊奇：

<li>"abc".compareTo( "ABC") returns "abc" > "ABC"  compareTo是大小写敏感的。</li>
<li>"abc ".compareTo ( "abc") returns "abc " > "abc"  空格与其他字符一样。</li>
<li>"".compareTo( null) 会抛出：java.lang.NullPointerException 异常。</li>
<li>""与null不同。多数String中的方法可以很好的处理""，但是很少能接受null的。</li>
<li>字符串的比较是通过Unicode数字字符的比较来实现的。不能根据本地语言进行调整。</li>

当实现自己的类时，默认的Object.equals不会一个个字段进行比较。需要自行实现equals来比较。默认equals只是比较两个引用是否指向同一个对象。

####大小写敏感与大小写不敏感比较####

{% highlight java  %}

// String comparison, case-sensitive and insensitive.
Stringapple="apple";
Stringorange="orange";

// case-sensitive compare for equality, faster than order comparison.
booleansame=apple.equals( orange);

// case-insensitive compare for equality, slower that case-sensitive comparison.
booleansame=apple.equalsIgnoreCase( orange);

// case-sensitive compare for order.
// +ve if apple>orange, 0 if apple==orange, -ve if apple&lt;orange
intorder=apple.compareTo( orange);

// case-insensitive compare for order.
// +ve if apple&gt;orange, 0 if apple==orange, -ve if apple&lt;orange
intorder=apple.compareToIgnoreCase( orange);

// If you are going compare the same strings over and over,
// and you want to compare them in a case-insensitive way, it may pay
// to convert them to lower case, and use the faster case-sensive compare.
StringlcApple=apple.toLowerCase();
StringlcOrange=orange.toLowerCase();

// effectively a case-insensitive compare for equality,
booleansame=lcApple.equals( lcOrange);

// effectively a case-insensitive compare for order.
// +ve if apple>orange, 0 if apple==orange, -ve if apple&lt;orange
intorder=lcApple.compareTo( lcOrange);

{% endhighlight %}

###字符串搜索###

字符串搜索可使用indexOf和lastIndexOf。他们都可以通过fromOffset改变搜索开始的位置。返回的结果是相对于字符串开始的位置(0)，而不是相对于fromOffset的位置。如果搜索时忽略大小写，可先将字符串全部转换成大写或小写。可以这样实现：

{% highlight java  %}

    public static voidmain( String[] args)
        {
        // use of indexOf
        finalStrings1="ABCDEFGABCDEFG";
        out.println( s1.indexOf( "CD" ) );
        // prints 2, 0-based offset of first CD where found.

        out.println( s1.indexOf( "cd" ) );
        // prints -1, means not found, search is case sensitive

        out.println( s1.toLowerCase().indexOf( "cd" ) );
        // prints 2,  0-based offset of first cd where found

        out.println( s1.indexOf( "cd".toUpperCase() ) );
        // prints 2,  0-based offset of first cd where found

        out.println( s1.indexOf( "CD",4/* start looking here, after the first CD */) );
        // prints 9, 0-based offset relative to the original string,
        // not relative to the start of the substring

        // use of last indexOf

        out.println( s1.lastIndexOf( "CD" ) );
        // prints 9, 0-based offset of where last CD found.

        out.println( s1.lastIndexOf( "cd" ) );
        // prints -1, means not found, search is case sensitive

        out.println( s1.toLowerCase().lastIndexOf( "cd" ) );
        // prints 9,  0-based offset of where last cd found

        out.println( s1.lastIndexOf( "cd".toUpperCase() ) );
        // prints 9,  0-based offset of where last cd found

        out.println( s1.lastIndexOf( "CD",8/* start looking here, prior to last */) );
        // prints 2, 0-based offset relative to the original string,
        // not relative to the start of the substring

        out.println( "\u00df" );
        // prints German esset ligature sz single ss bate-like glyph

        out.println( "\u00df".toUpperCase() );
        // prints SS, not SZ, two chars long!
        }
    }
{% endhighlight %}
查找单个字符有很多方法，其中不乏速度比一个一个字符比较是否相等快。理想情况下，编译器足够智能的将indexOf方法单个字符参数转化为char，那么可以将x.indexOf(y) >= 0 简化为x.contains(y)。

###创建字符串###

字符串是不可变的，因此字符串不仅可以被无限期重用，而且还可在很多场景下共享。当你将一个字符串变量赋给另外一个字符串变量时，不会再次产生副本。甚至在调用substring后，赋给了新的变量，也不会创建新的字符串。只有在一下几种情况下才会创建新的字符串：

<li>字符串拼接</li>
<li>从文件中读取字符串</li>
<li>愚蠢的使用new String(somethingElse)。一种情况下使用这种方式是恰当的，参见substring()</li>
<li>使用StringBuffer/StringBuilder的toString或substring方法</li>

###toString方法###

每种对象都可以调用toString方法将自身的内容转化成人类可读的形式。通常，编写自定义类时，尽管仅仅是为了degub，也要单独实现toString方法。

这样来调用：String toShow = myThing.toString();

默认的Object.toString()很不智能，它不会像你期待的那样，将类中所有字段值输出。要达到这种预期，就要自己编码实现。默认的toString方法会比较对象的hashCode或者对象的地址。

toString方法有个神奇的地方。在需要转换为字符串时，好像自动调用toString进行了转换。

<li>一种情况是使用：System.out.println(and brothers)，其实它一点儿都不高深，println只是使用众多的重载方法实现的。println有很多重载方法，每个基本数据类型一个。每个基本数据类型的toString方法将本身转化为字符串。但是我们知道基本数据类型中是没有toString方法的啊，确实是这样，但是别忘记，有些静态转换方法，比如String.valueOf(double)就可以将双精度浮点数转化为字符串。对于任何String之外的对象，println方法调用的是对象自身重写后的toString方法，再将结果传给参数只能为String的println方法。</li>
<li>当使用字符串连接符时(+)，toString确实被调用了。如果将两个对象相加，Java就假定你就是想将他们连接，于是调用各自的toString方法，将连接后的字符串返回。在字符串与基本数据类型相加的情况下，依然奏效。连接符会先把基本数据类型转换为字符串，然后将结果连接。</li>

###字符串替换###

String.replace( char target, char replacement )、String. replace( String target, String replacement ) 两个方法都是替换目标字符串中出现的所有指定的字符或字符串，但是前者要比后者快很多。所以在替换单个字符时，要使用前者，即使用单引号。不幸的是，后者只有在1.5及其之后的版本中才可以使用。

replaceAll( String regex, String replacement )  方法也是全部替换，区别在于replaceAll方法使用正则表达式搜索。欲使用replace( String target, String replacement ) 时千万不能使用replaceAll(String regex, String replacement) 。第二个参数不是简单的字符串，String. replaceAll 与Matcher. replaceAll 一样。$代表匹配字符串的引用，\则是正则表达式中的关键字，所以需要将\转义为\\\\\\\\，将$转义为\\\\$。

replaceFirst( String regex, String replacement )  也使用正则表达式。

Javadoc中String.replace是以 CharSequence为入参的，别担心，String实现了 CharSequence接口，所以replace可以在String或StringBuilder中正常使用。

###正则表达式###

String中包含很多非常好用的正则表达式方法，比如split、matches、replaceAll还有replaceFirst。通常情况下推荐使用高效的java.util.regex中的方法，方法中的Pattern被提前编译，并且可重用。在不考虑效率的情况下，就可以使用String中的正则表达式方法了。

replaceAll和replace都以低效的方式实现，每次调用都要重新编译regex pattern。
{% highlight java  %}
// how replace is implemented.
// It uses regex techniques even though neither parameter is a regex.
publicStringreplace(CharSequencetarget,CharSequencereplacement)
{
   returnPattern.compile( target.toString(),Pattern.LITERAL)
   .matcher( this).replaceAll( Matcher.quoteReplacement( replacement.toString() ) );
}
{% endhighlight %}
所以，如果不止一次调用replace或replaceAll时，最好使用单独的正则表达式，编译一次即可重用。

###substring###
substring很智能，与其他编程语言的深拷贝不同，它只是创建一个指向原始不可变字符串的引用。比如根据substring参数设置char[]的偏移值，与count属性值后，返回一个指向它的引用，而不是全部拷贝。这样就给调试增添了困惑，因为每次看到的都是整个字符串而不是截取后的子串。这样做有一个致命的缺点，就是子串一直保持着整个原始字符串的引用，这样即使原始字符串已经没用了，也不能被垃圾回收器回收。(事实上String对象的引用可以被回收，但是RAM中的char[]没法被回收)

所以查找字符串时，使用indexOf(lookFor, offset)要好于先使用substring创建子串再使用indexOf(lookFor)。

如果确切的知晓小子串会指向RAM中原始大字符串的char[]，使其不能被回收，这个时候可以使用littleString = new String(littleString)来创建一个与原始字符串无关的新字符串来避免这种情况的发生。

如果你是通过src.zip来学习String.substring()，那么这种"陷阱"就很难被发现。因为它是用过String的一个非公有构造方法String (int offset, int count, char value[]) 来调整value的偏移值和count值来实现。

原文链接：<a href="http://mindprod.com/jgloss/string.html">http://mindprod.com/jgloss/string.html</a><br>
 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <a href="http://mindprod.com/jgloss/substring.html">http://mindprod.com/jgloss/substring.html</a>
