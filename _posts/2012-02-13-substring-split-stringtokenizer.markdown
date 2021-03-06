---
layout: post
title: "String的substring,split,外加StringTokenizer三者截取字符串性能比较"
keywords: Java,String,substring,split,StringTokenizer
---
最近在阅读`java.lang`下的源码，读到`String`时，突然想起面试的时候曾经被人问过：都知道在大数据量情况下，使用`String`的`split`截取字符串效率很低，有想过用其他的方法替代吗？用什么替代？我当时的回答很斩钉截铁：没有。

google了一下，发现有2中替代方法，于是在这里我将对这三种方式进行测试。

测试的软件环境为：Windows XP、eclipse、JDK1.6。

测试用例使用类ip形式的字符串，即3位一组，使用"."间隔。数据分别使用：5组、10组、100组、1000组、10000组、100000组。

<h4><strong>实现</strong></h4>
闲话不说，先上代码：

{% highlight java %}
package test.java.lang.ref;

import java.util.Random;
import java.util.StringTokenizer;

/**
 * String测试类
 * @author xiaori.Liu
 *
 */
public class StringTest {
    
    public static void main(String args[]){
        String orginStr = getOriginStr(10);
        
        //////////////String.splic()表现//////////////////////////////////////////////
        System.out.println("使用String.splic()的切分字符串"); 
        long st1 = System.nanoTime(); 
        String [] result = orginStr.split("\\.");
        System.out.println("String.splic()截取字符串用时：" + (System.nanoTime()-st1));
        System.out.println("String.splic()截取字符串结果个数：" + result.length);
        System.out.println();
        
        //////////////StringTokenizer表现//////////////////////////////////////////////
        System.out.println("使用StringTokenizer的切分字符串"); 
        long st3 = System.nanoTime();  
        StringTokenizer token=new StringTokenizer(orginStr,".");  
        System.out.println("StringTokenizer截取字符串用时:"+(System.nanoTime()-st3)); 
        System.out.println("StringTokenizer截取字符串结果个数：" + token.countTokens());
        System.out.println();
        
        ////////////////////String.substring()表现//////////////////////////////////////////
        
        
        long st5 = System.nanoTime();  
        int len = orginStr.lastIndexOf(".");
        System.out.println("使用String.substring()切分字符串");  
        int k=0,count=0;  
        
        for (int i = 0; i <= len; i++) {  
         if(orginStr.substring(i, i+1).equals(".")){  
          if(count==0){  
           orginStr.substring(0, i);  
          }else{  
             orginStr.substring(k+1, i); 
             if(i == len){
               orginStr.substring(len+1, orginStr.length()); 
           }
          }
          k=i;count++;  
         }  
        }
        System.out.println("String.substring()截取字符串用时"+(System.nanoTime()-st5));  
        System.out.println("String.substring()截取字符串结果个数：" + (count + 1));
    }
    
    /**
     * 构造目标字符串
     * eg：10.123.12.154.154
     * @param len 目标字符串组数(每组由3个随机数组成)
     * @return
     */
    private static String getOriginStr(int len){
        
        StringBuffer sb = new StringBuffer();
        StringBuffer result = new StringBuffer();
        Random random = new Random();
        for(int i = 0; i < len; i++){
            sb.append(random.nextInt(9)).append(random.nextInt(9)).append(random.nextInt(9));
            result.append(sb.toString());
            sb.delete(0, sb.length());
            if(i != len-1)
                result.append(".");
        }
        
        return result.toString();
    }
}
{% endhighlight %}

改变目标数据长度修改`getOriginStr`的`len`参数即可。

5组测试数据结果如下图：

<div class='center'>
    <img src='/post_images/2012/02/result.png'/>
</div>

下面这张图对比了下，`split`耗时为`substring`和`StringTokenizer`耗时的倍数：

<div class='center'>
    <img src='/post_images/2012/02/beishu.png'/>
</div>

好吧，我又花了点儿时间，做了几张图表来分析这3中方式的性能。

首先来一张柱状图对比一下这5组数据截取所花费的时间：

<div class='center'>
    <img src='/post_images/2012/02/cart-sum.png' />
</div>
从上图可以看出`StringTokenizer`的性能实在是太好了(对比另两种),几乎在图表中看不见它的身影。遥遥领先。`substring`花费的时间始终比`split`要少，但是耗时也在随着数据量的增加而增加。

下面3张折线图可以很明显看出`split、substring、StringTokenizer`3种实现随着数据量增加，耗时的趋势。

<div class='center'>
    <img src='/post_images/2012/02/split.png' />
</div>

`split`是变化最大的，也就是数据量越大，截取所需要的时间增长越快。

<div class='center'>
    <img src='/post_images/2012/02/subString.png' />
</div>

`substring`则比`split`要平稳一点点，但是也在增长。

<div class='center'>
    <img src='/post_images/2012/02/StringTokenizer.png' />
</div>

`StringTokenizer`则是表现最优秀的，基本上平稳，始终保持在5000ns一下。

<h4><strong>结论</strong></h4>

最终，`StringTokenizer`在截取字符串中效率最高，不论数据量大小，几乎持平。`substring`则要次之，数据量增加耗时也要随之增加。`split`则是表现最差劲的。

究其原因，`split`的实现方式是采用正则表达式实现，所以其性能会比较低。至于正则表达式为何低，还未去验证。`split`源码如下：

{% highlight java %}
public String[] split(String regex, int limit) {
    return Pattern.compile(regex).split(this, limit);
} 
{% endhighlight %}

验证可能存在不合理的地方，如哪里不合适，还请指出，共同进步。