---
layout: post
title: "集合类简易创建工具类"
category: Java
tags:
 - Java
keywords: Java,集合,Collection,HashMap,ArrayList,HashSet,LinkedList,LinkedHashMap
---

不知道大家有没觉得在jdk1.5引入范型之后，声明与创建集合类就变得异常的繁琐；不知道大家没有这样的强迫症：总是不太能允许程序中有worning，总是千方百计的要去掉它。范型的引入有它的好处，这里不去讨论，从一个使用者的角度，它确确实实有些蹩脚。举一个偏激的例子：

{% highlight java %}
Map<String, Map<String,Map<String, List<Object>>>> map = new HashMap<String, Map<String,Map<String, List<Object>>>>();
{% endhighlight %}

看到这个极品的map应该会很抓狂吧，哈哈，不说是否可读，从写这行代码人的角度来看也够崩溃的，声明和创建的时候都要写那么一大陀东西。在读《Effective Java》的过程中受书中启发，分别为每种集合类提供一个静态工厂方法。

{% highlight java %}
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Hashtable;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

/**
 * jdk1.5加入范型后，每每创建集合都倍受折磨，声明的时候要标注范型，创建的时候也要标注范型，
 *  实在是一件让人恼火的事儿，受《Effective Java》启发，利用范型的特性， 
 *  为每种集合类提供一个静态工厂方法(不同于设计模式中的静态工厂方法模式)就可以避免重复书写范型。
 * 
 * @author liuzi
 * @date 2012-10-11
 */
public class CollectionsUtil {

	/**
	 * HashMap静态工厂方法
	 * 
	 * @return
	 */
	public static <K, V> HashMap<K, V> newHashMap() {
		return new HashMap<K, V>();
	}

	/**
	 * Hashtable静态工厂方法
	 * 
	 * @return
	 */
	public static <K, V> Hashtable<K, V> newHashtable() {
		return new Hashtable<K, V>();
	}

	/**
	 * TreeMap静态工厂方法
	 * 
	 * @return
	 */
	public static <K, V> TreeMap<K, V> newTreeMap() {
		return new TreeMap<K, V>();
	}

	/**
	 * LinkedHashMap静态工厂方法
	 * 
	 * @return
	 */
	public static <K, V> LinkedHashMap<K, V> newLinkedHashMap() {
		return new LinkedHashMap<K, V>();
	}

	/**
	 * ArrayList静态工厂方法
	 * 
	 * @return
	 */
	public static <T> ArrayList<T> newArrayList() {
		return new ArrayList<T>();
	}

	/**
	 * LinkedList静态工厂方法
	 * 
	 * @return
	 */
	public static <T> LinkedList<T> newLinkedList() {
		return new LinkedList<T>();
	}

	/**
	 * HashSet静态工厂方法
	 * 
	 * @return
	 */
	public static <T> HashSet<T> newHashSet() {
		return new HashSet<T>();
	}

	/**
	 * LinkedHashSet静态工厂方法
	 * 
	 * @return
	 */
	public static <T> LinkedHashSet<T> newLinkedHashSet() {
		return new LinkedHashSet<T>();
	}

	/**
	 * TreeSet静态工厂方法
	 * 
	 * @return
	 */
	public static <T> TreeSet<T> newTreeSet() {
		return new TreeSet<T>();
	}

	/**
	 * 为每个静态工厂方法提供示例
	 * 
	 * @param args
	 */
	public static void main(String[] args) {
		// ArrayList静态工厂方法示例
		List<String> arrayList = CollectionsUtil.newArrayList();
		arrayList.add("a");
		arrayList.add("b");

		// HashMap静态工厂方法示例
		Map<String, List<String>> hashMap = CollectionsUtil
				.newHashMap();
		hashMap.put("letters", arrayList);

		// Hashtable静态工厂方法示例
		Map<String, List<String>> hashtable = CollectionsUtil
				.newHashtable();
		hashtable.put("letters", arrayList);

		// TreeMap静态工厂方法示例
		Map<String, List<String>> treeMap = CollectionsUtil
				.newTreeMap();
		treeMap.put("letters", arrayList);

		// LinkedHashMap静态工厂方法示例
		Map<String, List<String>> linkedHashMap = CollectionsUtil
				.newLinkedHashMap();
		linkedHashMap.put("letters", arrayList);

		// LindedList静态工厂方法示例
		List<List<String>> linkedList = CollectionsUtil
				.newLinkedList();
		linkedList.add(arrayList);

		// HashSet静态工厂方法示例
		Set<List<String>> hashSet = CollectionsUtil.newHashSet();
		hashSet.add(arrayList);

		// LindedHashSet静态工厂方法示例
		Set<List<String>> linkedHashSet = CollectionsUtil
				.newLinkedHashSet();
		linkedHashSet.add(arrayList);

		// TreeSet静态工厂方法示例
		Set<List<String>> treeSet = CollectionsUtil.newTreeSet();
		treeSet.add(arrayList);
	}

}
{% endhighlight %}




















首先我们来看一段代码以及代码的运行结果，然后从这段代码去进行分析。

{% highlight java %}
public class A {
  
  public static int a(){
    int b = 9;
    
    return b--;
  }
  
  public static int b(){
    int b = 8;
    return --b;
  }
  
  public static void main(String args[]){
    System.out.println(a());
    System.out.println(b());
  }

}
{% endhighlight %}

运行结果：
<blockquote>
  9<br>
  7
</blockquote>

也就是说b--没其作用，在return之后才其的作用，可是为什么呢？使用优先级也没法解释啊！难道要return之后才进行自减运算吗？还是使用利器javap查看一下编译后的字节码。

<div class='center' >
  <img src="/post_images/2012/09/javap--++.png" style="width:700px;">
</div>

上图就是编译后的java字节码，仔细观察会发现前减减与后减减被编译后生成的指令是有区别的。那就针对这两小段字节码来解释前自增（或者自减），后自增（或者自减）与return组合时都发生了什么。

<div class='center'>
  <img src="/post_images/2012/09/javap--++_a.png">
</div>

<blockquote>
  解析：<br>
    0行：将数字9push到栈顶<br>
    2行：将栈顶值存入第一个本地变量<br>
    3行：将第一个本地变量push到栈顶<br>
    4行：将第0个本地变量增加-1<br>
    7行：返回栈顶数据<br>
</blockquote>

下图辅助解释字节码执行过程：

<div class='center'>
  <img src="/post_images/2012/09/javap--++_a_after.png">
</div>

也就是说在进行自减操作之前对本地变量先入栈了，随后进行了自减操作，然后再将栈顶的值返回。这样后自减操作是没有影响到返回值的。

<div class='center'>
  <img src="/post_images/2012/09/javap--++_b.png">
</div>

<blockquote>
  解析：<br>
    0行：将数字8push到栈顶<br>
    2行：将栈顶值存入第一个本地变量<br>
    3行：将第0个本地变量增加-1<br>
    6行：将第一个本地变量push到栈顶<br>
    7行：返回栈顶数据
</blockquote>

<div class='center'>
  <img src="/post_images/2012/09/javap--++_b_before.png">
</div>

而前减减则会影响返回值，先进行自减后，再入栈，然后返回栈顶值。

###结论
自增（自减）与return组合时，要使用前自增（自减），否则不会影响返回结果。