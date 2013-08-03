---
layout: post
title: "一道面试题的思考"
keywords: List,Java,数组，排序，面试
---

面试过程中一道很简单的面试题，让我有了一点想法。题目如下：

<blockquote>
	给定无序数组array,共10个元素从0-9.要求：删除元素3和5
</blockquote>

其实一共才10个元素，无论用什么方法都不会产生性能问题，我的第一反映就是那就排序呗，然后删除3,5两个元素对应的元素即可（其实这里确实存在一个小问题）。面试官就打断我，说尽量保证效率和避免发生异常。看来是回答的方式不够满意，我说好。随后我提出遍历数组的一半，找出3,5对应索引值然后再删除。我在纸上画出了思路，最后面试官拿过笔，写出他满意的方式。最后我才知道他的考点是在删除元素时数组下标的控制。：）

回来后我就一直在想，面试的时候一定要匹配面试官想法的答案才算是正确的答案吗？自驾，火车，飞机，客车都能到达北京，难道只有你预想的飞机才是正确的出行方式吗？

不过无所谓了，在这里我只想证明3种方式都能实现题目的要求。

####方式一：排序

{% highlight java %}
public class OneFaceQuestionV1 {

	/**
	 * 删除[0-9]无序list中的3和5
	 * 
	 * author xiaori.Liu
	 * 
	 * @param args
	 */
	public static void main(String[] args) {

//		List<Integer> disorderList = Arrays.asList(6, 1, 4, 5, 9, 8, 7, 2, 10,
//				3);
		List<Integer> disorderList = new ArrayList<Integer>();
		disorderList.add(6);
		disorderList.add(1);
		disorderList.add(4);
		disorderList.add(5);
		disorderList.add(9);
		disorderList.add(8);
		disorderList.add(7);
		disorderList.add(2);
		disorderList.add(10);
		disorderList.add(3);
		
		
		quickSort(disorderList, 0, disorderList.size() - 1);//排序
		
		printArray(disorderList);
		
		disorderList.remove(2);//删除元素3
		disorderList.remove(3);//删除元素5，因为先删除了3故索引值前移1,元素5对应的索引值变为3
		
		System.out.println();
		printArray(disorderList);
	}
	/**
	 * 
	 * 算法平均复杂度：Θ(nlgn)
	 * @param array 待排序list
	 * @param start	起始位置
	 * @param end		结束位置
	 * 
	 */
	public static void quickSort(List<Integer> array, int start, int end) {

		if (start < end) {
			
			int factor = array.get(end);//比较因子为最后元素

			int i = start - 1;//之所以-1，是为保持i比j小1，便于交换
			for (int j = start; j < end; j++) {
				if (array.get(j) <= factor) {
					i++;
					int temp = array.get(j);
					array.set(j, array.get(i));
					array.set(i, temp);
				}
			}
			array.set(end, array.get(i + 1));
			array.set(i + 1, factor);
			quickSort(array, start, i);	//迭代前部分
			quickSort(array, i + 1, end);	//迭代后部分
		}
	}

	private static void printArray(List<Integer> array) {
		for (int i = 0; i < array.size(); i++) {
			System.out.print(array.get(i) + " ");
		}
	}

}
{% endhighlight %}
运行结果：
<blockquote>
1 2 3 4 5 6 7 8 9 10<br> 
1 2 4 6 7 8 9 10 
</blockquote>

####方式二：先找出索引值再删除

{% highlight java %}
public class OneFaceQuestionV2 {
	
	
	static int indexOfThree;//元素3对应的索引值
	static int indexOfFive;//元素5对应的索引值
	
	/**
	 * 删除[0-9]无序list中的3和5
	 * 
	 * author xiaori.Liu
	 * 
	 * @param args
	 */
	public static void main(String[] args) {

		List<Integer> disorderList = new ArrayList<Integer>();
		disorderList.add(6);
		disorderList.add(1);
		disorderList.add(4);
		disorderList.add(5);
		disorderList.add(9);
		disorderList.add(8);
		disorderList.add(7);
		disorderList.add(2);
		disorderList.add(10);
		disorderList.add(3);
		
		printArray(disorderList);
		
		int length = disorderList.size();
		for(int i = (length-1) >> 1; i > 0; i--){
			isThreeOrFive(disorderList.get(i), i);
			isThreeOrFive(disorderList.get(length - i), length - i);
		}
		
		System.out.println(indexOfThree + " " + indexOfFive);
		disorderList.remove(indexOfFive);
		disorderList.remove(indexOfThree-1);//同样索引值要向前移动1
		
		
		printArray(disorderList);
	}
	
	private static void isThreeOrFive(Integer value, int index){
		if(value.equals(3)){
			indexOfThree = index;
		}
		if(value.equals(5)){
			indexOfFive = index;
		}
	}

	private static void printArray(List<Integer> array) {
		for (int i = 0; i < array.size(); i++) {
			System.out.print(array.get(i) + " ");
		}
	}
}
{% endhighlight %}

运行结果：
<blockquote>
6 1 4 5 9 8 7 2 10 3<br>
6 1 4 9 8 7 2 10 
</blockquote>

####方式三：循环

{% highlight java %}
public class OneFaceQuestionV3 {
	
	
	/**
	 * 删除[0-9]无序list中的3和5
	 * 
	 * author xiaori.Liu
	 * 
	 * @param args
	 */
	public static void main(String[] args) {

		List<Integer> disorderList = new ArrayList<Integer>();
		disorderList.add(6);
		disorderList.add(1);
		disorderList.add(4);
		disorderList.add(5);
		disorderList.add(9);
		disorderList.add(8);
		disorderList.add(7);
		disorderList.add(2);
		disorderList.add(10);
		disorderList.add(3);
		printArray(disorderList);
		
		int length = disorderList.size();
		for(int i = 0; i < length; i++){
			if(disorderList.get(i).equals(3) || disorderList.get(i).equals(5)){
				disorderList.remove(i);
				length = disorderList.size();
			}
		}
		
		printArray(disorderList);
	}
	

	private static void printArray(List<Integer> array) {
		for (int i = 0; i < array.size(); i++) {
			System.out.print(array.get(i) + " ");
		}
	}
}
{% endhighlight %}

运行结果：

<blockquote>
6 1 4 5 9 8 7 2 10 3 <br>
6 1 4 9 8 7 2 10 
</blockquote>

####总结

首先结论是不论哪种方式都可以满足题目。

然后我们再来比较下三种实现方式：
<ul>
<li>
第一种，第二种方式要满足题目都有一个小小的陷阱，也就是面试官要考察的地方，就是每次List删除元素后length都会改变。所以都需要对第二个删除的元素的索引值要减1。
</li>

<li>
第二中方式是效率最高的，也很稳定。就只需要5次循环。
</li>

<li>
方式一与方式三效率差不多。由于元素数量很少，所以O(n)与O(n*lgn)没有太大的区别。
</li>
</ul>
####补充
<blockquote>
	昨天在地铁上又想起来这道面试题，突然想起来第二种方式有个小小的bug，在标记完索引值之后，比较两个索引值的大小，先删除索引值大的，然后再删除小的，就不需要移动索引值了。代码片段如下：
</blockquote>

{% highlight java %}
if(indexOfThree > indexOfFive){//3对应的索引值大，先删除元素3
	disorderList.remove(indexOfThree);
	disorderList.remove(indexOfFive);
}else{//5对应的索引之大，先删除元素5
	disorderList.remove(indexOfFive);
	disorderList.remove(indexOfThree);
}
{% endhighlight %}