---
layout: post
title: "工作中我们遇到的那些坑（一）：ConcurrentModificationException"
keywords: Java,ConcurrentModificationException
---

`ConcurrentModificationException`异常想必搞java的没有遇到的少吧，本人在这个问题上连续踩了好几个坑。一边遍历集合，一边修改集合类似的场景的需求数不胜数，必然就面临着`ConcurrentModificationException`异常问题。小人也有幸与之相遇，随后来了一个拿来主义，直接google搜了一下，贴了过来。然后代码中编辑又贴到另外一个位置。然后就踩到了一个小坑，竟然又报了`ConcurrentModificationException`异常。当然很快的解决掉了，但是激发了我研究它的欲望了，然后，然后在研究的过程中就又踩到了雷。好吧，坑爹的年代，分享一下坑爹的各种坑吧。

分享坑之前先容我解释下产生`ConcurrentModificationException`异常的原因。其实jdk很多库代码很轻易就能拿到，比如随jdk下载包中就有一个src.zip（windowns平台下），所以要调试这个问题也难不倒我们程序员。我用的jdk版本是1.6.0_24。先随意贴张图帮助定位问题：

<div class="center">
	<img src="/post_images/2013/8/ConcurrentModificationException.png">
</div>

很容易定位到异常是在`java.util.AbstractList$Itr.checkForComodification(AbstractList.java:372)`抛出来的，那这个方法是怎样实现的呢？

{% highlight java %}
    final void checkForComodification() {
        if (modCount != expectedModCount)
            throw new ConcurrentModificationException();
    }
{% endhighlight %}

额，逻辑原来这么简单啊，那么`modCount`和`expectedModCount`都是些什么东西呢？我们稍后解释。现在让我们来看看有哪些操作会调用这个方法呢？又在哪些方法中改动了`modCount`或`expectedModCount`的值？

<div class="center">
	<img src="/post_images/2013/8/CallHeriarchy.png">
</div>

其中`add`，`remove`，`set`几个方法中有修改这两个值，但是它又有做了补救措施，所以这些操作还是安全的。其实还有其他的操作有修改`modCount`的值，我在这里就不列举了。来一个经典的例子吧：

{% highlight java %}
    public static void main(String[] args) {

        List<Long> list = new ArrayList<Long>();

        list.add(1l);
        list.add(2l);
        list.add(3l);
        list.add(4l);

        for (Long item : list) {
            if (item.intValue() == 2)
                list.remove(item);
        }
    }
{% endhighlight %}

稍微修改一下这段代码就让我踩了另外一个坑，后话了。这种`for`循环会被转义为使用迭代器来遍历集合，不用多说了吧。异常信息看前面的图即可，简单分析一下就可以知道删除`item`后再调用`next`，check的时候发现`modCount`和`expectedModCount`不相等，就抛出这个异常了。现在就说说`modCount`和`expectedModCount`，这里就说来话长了，本人也不知道从何入手。汗...因为`AbstractList`这个抽象类不是简简单单的抽象类，内嵌很多内部类以及内部实现类。犯懒了，有兴趣的童鞋自己去查吧，`modCount`是`AbstractList`中的属性，这里就拿List集合体系为例吧，`expectedModCount`则是私有内部类`Itr`的属性。那么在集合类上调用`iterator()`方法又会发生什么呢？

{% highlight java %}
    public Iterator<E> iterator() {
        return new Itr();
    }
{% endhighlight %}

仅仅是创建了一个`Itr`返回（当然`Itr`还有很多实现类），创建`Itr`的时候就会将`modCount`的值赋给`expectedModCount`，这样就保证如果有操作修改了`modCount`，然后其他操作前的check感知到这两个值不相同，就抛出了`ConcurrentModificationException`异常。归根到底就是这两个值不一致就会抛这个异常，当然还有一种情况是捕获`IndexOutOfBoundsException`异常后，会再抛出`ConcurrentModificationException`异常。`ListItr`（这个又是`AbstractList`内部的私有的实现类）是个`Itr`的实现类，比如它的`add(E e)`方法就是这种情况，其实就是在使用迭代器的时候将`IndexOutOfBoundsException`异常转化为`ConcurrentModificationException`异常。代码如下：

{% highlight java %}
    public void add(E e) {
        checkForComodification();

        try {
            AbstractList.this.add(cursor++, e);
            lastRet = -1;
            expectedModCount = modCount;
        } catch (IndexOutOfBoundsException ex) {
            throw new ConcurrentModificationException();
        }
    }
{% endhighlight %}

那么为什么使用迭代器一边遍历一边修改是安全的呢？

其实也很简单，就是迭代器中所有修改长度相关的操作中都会做一个补救的措施：`expectedModCount = modCount;`，这样下次操作的时候这两个值还是一致的。


絮絮叨叨了一大堆，回归到工作中我犯二的代码，类似如下：

{% highlight java %}
    public static void main(String[] args) {
        List<Long> list = new ArrayList<Long>();

        list.add(1l);
        list.add(2l);
        list.add(3l);
        //list.add(4l);

        Iterator<Long> ite = list.iterator();
        while (ite.hasNext()) {
            Long target = ite.next();
            if (target.intValue() == 2) {
                ite.remove();
                System.out.println(list.remove(target));
            }
        }
        System.out.println(list.toString());
    }
{% endhighlight %}


这是一段能正常工作的代码，但是有一处代码时冗余的，也就是无用代码。就是这句`list.remove(target);`刚开始的时候根本没有认识到这个问题，反正它达到了我的预期目标。当时也有迫于工期压力，当时也没多想，哈哈，赤裸裸的借口啊...项目上线后就一直在琢磨`ite.remove(); list.remove(target);`和只用`ite.remove();`或`list.remove(target);`有什么好处吗？刚刚也说了是冗余代码，其实根本没用，不管是调试还是直接看代码都一目了然：

{% highlight java %}
    public boolean remove(Object o) {
    	if (o == null) {
                for (int index = 0; index < size; index++)
    		if (elementData[index] == null) {
    		    fastRemove(index);
    		    return true;
    		}
    	} else {
    	    for (int index = 0; index < size; index++)
    		if (o.equals(elementData[index])) {
    		    fastRemove(index);
    		    return true;
    		}
        }
    	return false;
    }
{% endhighlight %}

`ite.remove();`已经将目标记录删除了，所以在调用`list.remove(target);`的时候根本找不到这条记录，会直接返回`false`。

所以，郑重的说明，只用迭代器删除就可以了，别再搞行`list.remove(target)`无用的代码在这放着，容易出问题。也提醒各位和本人一样懒，喜欢拿来主义的童鞋在使用网上代码前最好能搞懂再使用。为什么容易出问题呢？因为我搞出问题了，哈哈，非常不经意的问题：

{% highlight java %}
    public static void main(String[] args) {
        List<Long> list = new ArrayList<Long>();

        list.add(1l);
        list.add(2l);
        list.add(3l);
        list.add(4l);

        Iterator<Long> ite = list.iterator();
        while (ite.hasNext()) {
            Long target = ite.next();
            if (target.intValue() == 2) {
            	list.remove(target);
                ite.remove();
            }
        }
        System.out.println(list.toString());
    }
{% endhighlight %}

细心的童鞋可以发现别的都没变，就删除的两行代码换了下顺序，结果就抛出了`ConcurrentModificationException`异常。原因也很简单，因为`list.remove(target);`修改了`modCount`属性，结果在`ite.remove();`操作前的check时发现与`expectedModCount`值不相同。在哪里改的呢？

{% highlight java %}
    private void fastRemove(int index) {
        modCount++;
        int numMoved = size - index - 1;
        if (numMoved > 0)
            System.arraycopy(elementData, index+1, elementData, index,
                             numMoved);
        elementData[--size] = null; // Let gc do its work
    }
{% endhighlight %}

好啦，好啦，说累了，转战下一个坑。

{% highlight java %}
    public static void main(String[] args) {
        List<Long> list = new ArrayList<Long>();

        list.add(1l);
        list.add(2l);
        list.add(3l);

        for (Long item : list) {
            if (item.intValue() == 2)
                list.remove(item);
        }

        System.out.println(list.toString());
    }
{% endhighlight %}

这段代码怎么样？其实它真的很奇葩的...它是不会抛`ConcurrentModificationException`异常的。不信的话可以自己试试。然后将等号后面改为1或3就会抛出这个异常。其实是这样的，只要目标元素在集合中的倒数第二位置就会发生这种情况。原因也不难解释，但是容易被糊弄。就如示例中所示，`2`这个值在`list`中是倒数第二个元素，当删除该元素时，`list`的长度也被减掉了1，因为使用的是迭代器，也就是`hasNext()`方法返回了`false`，所以循环也不会继续了，继而也不会抛异常。但是这样会少遍历一次哦，会有漏网之鱼，要注意。

{% highlight java %}
    public boolean hasNext() {
        return cursor != size();
    }
{% endhighlight %}

注意，这里是因为`size()`方法返回值的变化造成了结果返回`false`，`cursor`并没有变化。

但是呢...如果删除其他位置的元素就会抛出`ConcurrentModificationException`异常，原因在于'hasNext()'方法返回了`true`，所以后面会调用`next()`方法，在它里面的`checkForComodification()`方法中抛出了`ConcurrentModificationException`异常。原因呢，是因为`list.remove(item)`方法修改了`modCount`属性的值。


至此这些坑就踩完了，也填平了。Over...
