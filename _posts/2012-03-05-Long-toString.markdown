---
layout: post
title: "java.lang.Long详解之一：toString"
category: Java
tags:
 - Java
 - Long
keywords: Long,Java,详解,toString
---

陆陆续续花了近两周时间看完了Long.java，可以说收获颇丰。也花了几天时间构思应该如何去写出来，苦于一直没有好的思路，又不能在这里干耗着浪费时间。所以就准备写出来了。很随意的写，想到哪里写到哪里。准备贴很多源码，附加我个人的理解。

###toString(long i, int radix)
首先让我们目睹下Long中强大的toString方法。
{% highlight java  %}
public static String toString(long i, int radix) {
  if (radix < Character.MIN_RADIX || radix > Character.MAX_RADIX)
      radix = 10;
  if (radix == 10)
      return toString(i);
  char[] buf = new char[65];
  int charPos = 64;
  boolean negative = (i < 0);
  if (!negative) {
    i = -i;
  }
  while (i <= -radix) {
    buf[charPos--] = Integer.digits[(int)(-(i % radix))];
    i = i / radix;
  }
  buf[charPos] = Integer.digits[(int)(-i)];
  if (negative) { 
    buf[--charPos] = '-';
  }
  return new String(buf, charPos, (65 - charPos));
}
{% endhighlight %}

第二个参数radix是进制数，范围是：2-36.大家都知道1进制没什么意义，所以进制数从2开始，我一直对36存在疑问，虽然它是0-9和a-z一共36个字符组成，所以最大进制数定义为36.但是还有大写字母啊，还有26个呢，这样就可以定义最大62进制。也许有什么渊源在这里我不知道，我在OSChina上也发过问，但是都没有让我很满意的答案。

radix如果不在2-36范围内，则默认10进制。而如果是10进制，Long有专门将10进制的Long转化为String的toString方法，稍后再说。

非10进制的toString就在这里负责处理。
{% highlight java %}
char[] buf = new char[65];
{% endhighlight %}
刚开始我很不理解为什么要声明长度为65的char数组呢，long64位就够了啊。仔细琢磨了一下发现，多声明一个是为负数做准备，如果是正数那么确实是只用了64位(这里不算严谨，不过先把65这个问题说清楚)。请看下面一段代码：
{% highlight java %}
if (negative) { 
  buf[--charPos] = '-';
 }
return new String(buf, charPos, (65 - charPos));
{% endhighlight %}
清楚了吧，这个buf[0]如果有值，那么只可能是"-"，不会是其他任何值。最后一行也很好理解，用了几位，那么就传给String构造函数几位。所以上面说的"正数只用64位"是不严谨的。

我喜欢这里negative的用法，算不上很巧妙，但是避开了正数和负数的差异。
{% highlight java %}
if (!negative) {
  i = -i;
}
{% endhighlight %}
一开始我同样不理解为啥要把一个正数转换为负数再处理呢？看下面这个代码片段：
{% highlight java %}
while (i <= -radix) {
  buf[charPos--] = Integer.digits[(int)(-(i % radix))];
  i = i / radix;
}
buf[charPos] = Integer.digits[(int)(-i)];
{% endhighlight %}
请看while内部与外部，设想如果i是正是负未知，那么这两处就没法统一使用-(i % radix)和-i了。所以将i提前转换为负值了。
Integer.digits是个挺巧妙的东西，可以随意应付2-36进制的转换。它是这样定义的：
{% highlight java  %}
final static char[] digits = {
  '0' , '1' , '2' , '3' , '4' , '5' ,
  '6' , '7' , '8' , '9' , 'a' , 'b' ,
  'c' , 'd' , 'e' , 'f' , 'g' , 'h' ,
  'i' , 'j' , 'k' , 'l' , 'm' , 'n' ,
  'o' , 'p' , 'q' , 'r' , 's' , 't' ,
  'u' , 'v' , 'w' , 'x' , 'y' , 'z'
};
{% endhighlight %}
比如说，radix = 2，那么i % radix只能为0或者1，对应digits[0]或者digits[1]，依此类推。

我想这个toString已经介绍的够详细了。另外，源码中将i转换为负数，那么转换为正数也肯定成立吧。于是我做了一点点改动：

{% highlight java %}
final static char[] digits = {
  '0' , '1' , '2' , '3' , '4' , '5' ,
  '6' , '7' , '8' , '9' , 'a' , 'b' ,
  'c' , 'd' , 'e' , 'f' , 'g' , 'h' ,
  'i' , 'j' , 'k' , 'l' , 'm' , 'n' ,
  'o' , 'p' , 'q' , 'r' , 's' , 't' ,
  'u' , 'v' , 'w' , 'x' , 'y' , 'z'
};
public static String toString(long i, int radix) {
  if (radix < Character.MIN_RADIX || radix > Character.MAX_RADIX)
    radix = 10;
  if (radix == 10)
    return "";//不是重点，直接跳过
  char[] buf = new char[65];
  int charPos = 64;
  boolean negative = (i < 0);
  if (negative) {
    i = -i;
  }
  while (i >= radix) {
    buf[charPos--] = digits[(int)((i % radix))];
    i = i / radix;
  }
  buf[charPos] = digits[(int)(i)];
  if (negative) { 
    buf[--charPos] = '-';
  }
  return new String(buf, charPos, (65 - charPos));
}
{% endhighlight %}

依旧奏效哦！
{% highlight java  %}
System.out.println(Long.toString(-8L, 2));
System.out.println(toString(-8L,2));
{% endhighlight %}

<blockquote>
输出结果：<br/>
-1000<br/>
-1000<br/>
</blockquote>

###toString(long i)

这个toString方法用于将参数i转化为十进制形式的字符串，toString(long i)本身是很简单的，核心是getChars(long i, int index, char[] buf)。那么就一起目睹下它们都是如何实现的。
{% highlight java  %}
public static String toString(long i) {
  if (i == Long.MIN_VALUE)
    eturn "-9223372036854775808";
  int size = (i < 0) ? stringSize(-i) + 1 : stringSize(i);
  char[] buf = new char[size];
  getChars(i, size, buf);
  return new String(0, size, buf);
}
{% endhighlight %}

{% highlight java  %}
static void getChars(long i, int index, char[] buf) {
  long q;
  int r;
  int charPos = index;
  char sign = 0;
  if (i < 0) {
    sign = '-';
    i = -i;
  }
  // Get 2 digits/iteration using longs until quotient fits into an int
  //8-4字节
  while (i > Integer.MAX_VALUE) { 
    q = i / 100;
    // really: r = i - (q * 100);
    r = (int)(i - ((q << 6) + (q << 5) + (q << 2)));
    i = q;
    buf[--charPos] = Integer.DigitOnes[r];
    buf[--charPos] = Integer.DigitTens[r];
  }
  // Get 2 digits/iteration using ints
  //4-2字节
  int q2;
  int i2 = (int)i;
  while (i2 >= 65536) {
    q2 = i2 / 100;
    // really: r = i2 - (q * 100);
    r = i2 - ((q2 << 6) + (q2 << 5) + (q2 << 2));
    i2 = q2;
    buf[--charPos] = Integer.DigitOnes[r];
    buf[--charPos] = Integer.DigitTens[r];
  }
  // Fall thru to fast mode for smaller numbers
  // assert(i2 <= 65536, i2);
  //2-0字节
  for (;;) {
    q2 = (i2 * 52429) >>> (16+3);
    r = i2 - ((q2 << 3) + (q2 << 1));  // r = i2-(q2*10) ...
    buf[--charPos] = Integer.digits[r];
    i2 = q2;
    if (i2 == 0) break;
  }
  if (sign != 0) {
    buf[--charPos] = sign;
  }
}
{% endhighlight %}

这个getChars可是各种巧妙，首先来看看下面这张图：
<div class='center'>
  <img src="/post_images/2012/03/getchars.png">
</div>
从图中可以看出，一个long类型的数字被分成了3段：8-4字节，4-2字节，2-0字节。三段分别处理。下面就一段一段剖析其中的巧妙之处。

####8-4字节处理
这段的主要目的是经过它的处理之后，能将一个long类型的数字转换成int来处理。这段while中几乎每行都是经典，首先这行：r = (int)(i - ((q &lt;&lt; 6) + (q &lt;&lt; 5) + (q &lt;&lt; 2)));很巧妙的使用高效的位移运算完成了r = i - (q * 100)。其实这样做事为了得到i的最后两位，比如2147483649这样一个long，经过这步之后r = 49.

随后更巧妙的一件事就又发生了。那就是Integer中的DigitOnes和DigitTens巧妙的设计。那就看看这两个数组是如何巧妙的。
{% highlight java linenow %}
final static char [] DigitTens = {
  '0', '0', '0', '0', '0', '0', '0', '0', '0', '0',
  '1', '1', '1', '1', '1', '1', '1', '1', '1', '1',
  '2', '2', '2', '2', '2', '2', '2', '2', '2', '2',
  '3', '3', '3', '3', '3', '3', '3', '3', '3', '3',
  '4', '4', '4', '4', '4', '4', '4', '4', '4', '4',
  '5', '5', '5', '5', '5', '5', '5', '5', '5', '5',
  '6', '6', '6', '6', '6', '6', '6', '6', '6', '6',
  '7', '7', '7', '7', '7', '7', '7', '7', '7', '7',
  '8', '8', '8', '8', '8', '8', '8', '8', '8', '8',
  '9', '9', '9', '9', '9', '9', '9', '9', '9', '9',
  } ; 
final static char [] DigitOnes = { 
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  } ;
{% endhighlight %}
通过这两个精巧的数组，巧妙的将两位数字转化为十位和个位，比如49用这两个数组表示就是DigitTens[49]=4和DigitOnes[49]=9。我真心喜欢这个设计。这样也就非常简单的就将一个两位数一位一位放入char数组中了。
再次强调q * 100的实现方式，100 = 64 + 32 + 4，通过位移q再相加，完美实现q * 100。
直到这个long可以被int表示时，转入下一段。

####4-2字节处理
这段代码的处理方式几乎同上一段是一模一样的，区别在于这里处理的是int而不是long。

####2-0字节处理
我一直都特别奇怪为什么要在2个字节这个点分割呢！我们稍后在小结里面描述，除了这点，还有一处亮点：q2 = (i2 * 52429) &gt;&gt;&gt; (16+3); 这个可是让我困惑了好久好久的。后来无意中在javaeye上搜到一篇帖子上揭露了这个美丽的亮点，52429/524288 = 0.10000038146972656, 524288 = 1 &lt;&lt; 19，换句话说q2 = (i2 * 52429) &gt;&gt;&gt; (16+3);就是q2 = i2/10为了避免效率低下的除法，换用了这种方式实现除法，真是绝啊！

####小结
总结一下getChars这个绝妙的方法，之所以分成3段，是因为JVM的实现中，int的效率最高，long的效率很低，所以第一步就将long转换成int，再进行处理。然后呢，为了避免除法，而且乘以52429之后可以被int表示，不会溢出，所以就出现了2字节这个分割点。总之呢，toString(long i)方法绝对是个绝妙的方法啊。里面有许多值得借鉴的地方。

###toUnsignedString(long i, int shift)
接下来让我们认识下toUnsignedString(long i, int shift)，这个方法同样巧妙，一个方法就把long转二进制，八进制，十六进制全部搞定。仅仅通过shift一个参数，同样是通过位移来实现的。比如八进制，那么shift就是3，然后通过1 &gt;&gt; 3实现。唯一一个限制就是只能表示进制数是2的n次幂。

{% highlight java  %}
private static String toUnsignedString(long i, int shift) {
  char[] buf = new char[64];
  int charPos = 64;
  int radix = 1 << shift;
  long mask = radix - 1;
  do {
    buf[--charPos] = Integer.digits[(int)(i & mask)];
    i >>>= shift;
  } while (i != 0);
  return new String(buf, charPos, (64 - charPos));
}
{% endhighlight %}

首先通过int radix = 1 &lt;&lt; shift;实现进制数的转换，

随后就是一个精心的设计，long mask = radix -1; 为什么要有这样一个值呢？其实是这样的，radix是2的n次幂，减1之后就是全1了，比如8-1的二进制就是111，其他同理。然后i & mask就取到进制数对应二进制的位数。比如十六进制的mask = 15，对应的二进制为1111，i & mask就是取i对应二进制的后四位。再从Integer.digits中取得对应进制数的值。

最后，再通过i &gt;&gt;&gt;= shift; 将已经取得的位数移除掉，直至i=0为止。

###总结
这样Long中的toString方法簇就解析完毕。总之一句话，Long就像一座宝库，每走一步都是金子。期待下一桶金子吧。