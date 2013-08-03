---
layout: post
title: "StringBuffer & StringBuilder详解"

keywords: Java,StringBuffer,StringBuilder
---
<h4><strong>序言</strong></h4>
`StringBuffer`与`StringBuilder`是`java.lang`包下被大家熟知的两个类。其异同为：一、长度都是可扩充的；二、`StringBuffer`是线程安全的，`StringBuilder`是线程不安全的。那么他们的长度是如何实现动态扩充以及`StringBuffer`的线程安全是如何实现的呢？通过"深度"阅读它们的源代码，最终弄明白其中的缘由。

<h4><strong>正文</strong></h4>
首先上一张`StringBuffer`和`StringBuilder`类结构图：

<div class='center'>
    <img src='/post_images/2012/02/StringBuilder+StringBuffer.bmp'/>
</div>

抽象类`AbstractStringBuilder`（也是核心实现类）实现了`Appendable`和`CharSequence`两个接口;`StringBuffer`与`StringBuilder`统统继承自`AbstractStringBuilder`，并且实现了`java.io.Serializable`和`CharSequence`接口。

下面简单描述下这几个接口所起到的作用(引用自中文api)。
<ul>
    <li>
        Appendable：能够被添加 char 序列和值的对象。如果某个类的实例打算接收 java.util.Formatter 的格式化输出，那么该类必须实现 Appendable 接口。
        要添加的字符应该是有效的 Unicode 字符，正如 Unicode Character Representation 中描述的那样。注意，增补字符可能由多个 16 位 char 值组成
    </li>
    <li>
        CharSequence：CharSequence 是 char 值的一个可读序列。此接口对许多不同种类的 char 序列提供统一的只读访问。char 值表示 Basic Multilingual Plane (BMP) 或代理项中的一个字符。有关详细信息，请参阅 Unicode 字符表示形式。
        此接口不修改 equals 和 hashCode 方法的常规协定。因此，通常未定义比较实现 CharSequence 的两个对象的结果。每个对象都可以通过一个不同的类实现，而且不能保证每个类能够测试其实例与其他类的实例的相等性。因此，使用任意 CharSequence 实例作为集合中的元素或映射中的键是不合适的。
    </li>
    <li>
        Serializable：类通过实现 java.io.Serializable 接口以启用其序列化功能。未实现此接口的类将无法使其任何状态序列化或反序列化。可序列化类的所有子类型本身都是可序列化的。序列化接口没有方法或字段，仅用于标识可序列化的语义。
    </li>
    <li>
        AbstractStringBuilder这个抽象类提供了StringBuffer和StringBuilder绝大部分的实现。在AbstractStringBuilder的描述中说：如果去掉线程安全，那么StringBuffer和StringBuilder是完全一致的。从实现的角度来说，StringBuffer所有方法(构造方法除外，因为没有必要)签名中都使用synchronized限定，也就是所有的方法都是同步的。
    </li>
</ul>
eg.`StringBuffer`中`replace()`方法：
{% highlight java %}
    public synchronized StringBuffer replace(int start, int end, String str) {
        super.replace(start, end, str);
        return this;
    }
{% endhighlight %}
`StringBuilder`中`replace()`：
{% highlight java %}
    public StringBuilder replace(int start, int end, String str) {
        super.replace(start, end, str);
        return this;
    }
{% endhighlight %}
区别仅仅在方法签名上是否有`synchronized`。

另外需要稍稍注意的问题是：`StringBuffer`同步只同步目标，比如：`sb.append("i am not synchronized")`,`sb`是同步的，而其中的参数未必是同步的。

而它们两个可扩展长度则是通过`ensureCapacity(int minimumCapacity)`来验证当前长度是否小于参数`minimumCapacity`，如果成立则进行分配空间。分配新空间的步长为（当前长度+1）的两倍。
实现如下：
{% highlight java %}
    public void ensureCapacity(int minimumCapacity) {
        if (minimumCapacity > value.length) {
            expandCapacity(minimumCapacity);
        }
    }
    void expandCapacity(int minimumCapacity) {
        int newCapacity = (value.length + 1) * 2;
        if (newCapacity < 0) {
            newCapacity = Integer.MAX_VALUE;
        } else if (minimumCapacity > newCapacity) {
            newCapacity = minimumCapacity;
        }
        value = Arrays.copyOf(value, newCapacity);
    }
{% endhighlight %}
如果新的长度小于0(溢出了)，则使用`Integer`的最大值作为长度。

另外，在阅读源码的过程中，发现两个有趣的问题，下面一一道来。

第一个，就是`reverse`的实现。其实我是第一次看`StringBuilder`和`StringBuffer`的源码，这里面的`reverse`的实现是我所知道的`java`中的最高效的实现，没有之一。
上源码，再做解释：
{% highlight java %}
    public AbstractStringBuilder reverse() {
        boolean hasSurrogate = false;
        int n = count - 1;
        for (int j = (n-1) >> 1; j >= 0; --j) {
            char temp = value[j];
            char temp2 = value[n - j];
            if (!hasSurrogate) {
                hasSurrogate = (temp >= Character.MIN_SURROGATE && temp <= Character.MAX_SURROGATE)
                    || (temp2 >= Character.MIN_SURROGATE && temp2 <= Character.MAX_SURROGATE);
            }
            value[j] = temp2;
            value[n - j] = temp;
        }
        if (hasSurrogate) {
            // Reverse back all valid surrogate pairs
            for (int i = 0; i < count - 1; i++) {
                char c2 = value[i];
                if (Character.isLowSurrogate(c2)) {
                    char c1 = value[i + 1];
                    if (Character.isHighSurrogate(c1)) {
                        value[i++] = c1;
                        value[i] = c2;
                    }
                }
            }
        }
        return this;
    }
{% endhighlight %}
reverse分成两个部分：前面一个循环与后面的判断。

首先地一个循环很高效，循环次数为长度(count)的一半，而且使用>>位移运算，交换数组`value[j]`与`value[n-j]`的值。这里一是循环次数少，而是使用最高效的位移运算所以说这个`reverse`很高效。在反转过程中还完成了一件事：就是为`hasSurrogate`赋值。赋值的依据就是`value[j]`与`value[n-j]`两个字符时候有一个在`\uD800`和`\uDFFF`之间，如果有则赋值为`true`。

而`hasSurrogate`的值作为下面一个`if`分支的依据，如果为`true`，则从头到尾循环一遍。至于为何要判断`hasSurrogate`，以及下面一个循环的意义，请移步这里：["http://www.oschina.net/question/129471_37064"](http://www.oschina.net/question/129471_37064).

其实到这里应该已经结束了，在我整理`StringBuffer`和`StringBuilder`结构图时发现（"刨祖坟"行家啊），发现它们两个又再次实现了`CharSequence`接口，为何说再次呢，因为`AbstractStringBuilder`已经实现了一次，不知何为！经过几个人讨论，结果还要请您再次移步这里：["http://www.oschina.net/question/129471_37096"](http://www.oschina.net/question/129471_37096).

如果不对，有知道它们底细的，要通知我哦。
以上就是我在阅读`StringBuffer`和`StringBuilder`的收获，与大家分享。