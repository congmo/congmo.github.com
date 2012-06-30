
---
layout: post
title: "面试归来"
category: Interview Summary
tags:
 - Java
 - InterviewSummary
keywords: 面试总结,Java
---

最近有幸出门面试了一次，可以说是一次比较愉快的面试。面试分为3个阶段，每个阶段我都有很多收获，而且让人很满意的是一个阶段比一个阶段让人放松。更让我觉得满意的是最后可以明确的告诉我：你不符合。而不是虚伪的让你回去等消息，然后就是遥遥无期。写这篇blog主要是总结一下自身的不足，还有就是记录下自己思考的过程，不论是否成熟，就算很2也是对自己的鞭策。<strong>书写是为了更好的思考。</strong>另外，虽然会将面试的细节全部记录在这里，我想他们不会介意。在此先谢过了。

###阶段一：开场白

刚走出电梯就听见咣咣的声音，貌似是个很有朝气的公司，一群小伙子在玩桌上足球，顿时嘴角路出一丝微笑。说明我的来意，公司的员工帮我找来了前台，递给我一瓶矿泉水(现在想想，这个太重要了，全部干掉后还是有些口干舌燥的)，带我去会议室候着。

些许时间，走进来一个应该比我大几岁的相貌堂堂的仁兄，寒暄了几句。然后抛给我一个问题，让我现场在白板上写出实现，问题是这样描述的：

数据库中存放ip段，有start、end、城市名称三个字段，start-end之间代表某个城市ip的范围，使用一种语言实现给定一个数字，返回所在城市名称。
<img src='/post_images/2012/02/ip.png' class='img-left' />                              
数据无规律，记录数大于7w，而且几乎不修改，大部分操作都是查询。要求一次load到内存中，经过处理后，使以后的操作效率很高。(大致是这样)

问题大致就是这个样子，在白板上实现。我想了下，查找多，修改少，查找快符合链表实现的Map的应用场景。于是就想处理后放入我们经常使用的HashMap中，那么key放什么好呢？放什么才能提高查询的效率呢？value肯定放city了。可是有start和end两个字段呢，怎么都不合适，最终就使用了最2的方式key放start-end，然后用给定的数字与key比较，如在key的范围内则返回value。(方法很2吧)
于是就开始实现了。实现到一半的时候发现这个方法不妥啊，非常不妥，这样做效率一点儿也不比直接便利全部记录高。因为转换成Map之后，仍然要一个一个key比较。额，我顿时就凝固了。

这时面试官也回来了，仅仅瞄了几眼目光就从白板上收回，吼吼结果可想而知。随后又聊了聊，最后说要换一个同事聊聊。临走前，我问他这个题目比较理想的答案是什么？回答：取出来放入TreeMap中，以后的查找策略都是二分查找。嗯哼，恍然大悟。

###阶段二：相谈甚欢

然后我就见到了另外一个人，这次聊的时间也比较长。问的也比较仔细，对着简历的技能一栏中，写什么就问什么。基本上涵盖了全部。由于我把葱末的地址写到了简历上，所以聊的比较多的也是jdk相关。

后来想想，这位仁兄真的挺睿智的，第一和他交谈不会让你紧张，还会越来越放松；第二他在面试我的过程中不会因为我愚蠢的回答而做出不屑的表情；第三他所关注的更多的是面试者的思维方式，联想的能力，举一反三，由此及彼。

关于第三点，我要描述下面试的细节。可能是事先看过我的博客还有我也提到过读过StringBuilder和StringBuffer的源码，他没有问我它们两个类有关的细节，却问我ArrayList在超长的时候会怎样？我想了一会会儿，我说这个我不很确定，我只按我的理解说，在StringBuilder增加新元素进来的时候会检查是否超长，如果超长，用(本身长度+1)的2倍与指定长度比较，谁大就扩充多长。我给出了类似的回答。外加创建ArrayList，如果未指定长度，会有默认长度。哦，还问了我在扩充之后发生了什么，我也就记得StringBuilder扩充之后对数组进行copy了，也给出这样的回答。在这个过程中几乎都是在他的引导下一步步启发我的联想。所以我很喜欢这种面试方式。

还有问了一些关于设计模式的东西，因为我只看过设计模式，没有认真的去用过，所以这个话题没有很深入。但是，他这样问我：我们现在开发的过程中难免会用到开源的东西，或者说使用第三方提供的接口，如果对方升级，改变了接口，那你应该怎么应对？嘿嘿，我给出了比较雷人的答案，那你就一直用旧版本呗。(估计此时他内心已经被我打败了)。最后还是在他的引导下，我突然意识到，他是在考我如何应对软件设计规则之一的对扩展开放，对修改关闭，然后我哦了一声说：你想引导我去使用设计模式啊。他回答说：对。

对了，又让我手写代码了，需求就是将一个字符串转化为整数。然后我就马上问，可以用api直接写出来不？回答曰：可以使用api，但是不能用new Integer(String str).intValue();。其实这个题目的目的性很强，明眼人一看就懂。主要是考察考虑问题是否周全，无非就是合理性检查，异常处理等。我也很快就完成了，自认为处理的很全面了，结果，仁兄看了几眼就问我，从全局角度看，你这有没有遗漏的地方？我又审视了一遍代码，没发现什么"可疑之处"。我就说，还是有问题对吧？然后他依旧在引导我思考，结果这次失败了，嘿嘿，遗漏了一个大问题，就是检查参数字符串是否会导致int溢出。随后对着代码问我，如果写单元测试，会写几个测试用例，针对当时的情况，我一共说要7个。这里的细节也不多说了，至于测试用例的答案我也忘记问他是不是他所要的结果了。

差点儿忘记了，在这里我犯了一个超级低级错误：我竟然忘记char会自动转换为int类型，还在白板上的写了一句伪代码：将char转化为int。额，好2啊。(千万别现在还留在那块白板上啊...)

对对，还考察我设计的能力了。细节不说了。

###阶段三：晴天霹雳

最后是位技术总监，操一口南方口音，聊了几句，给了我两道题，要求不能写伪代码，要达到你认为可以运行的程度。

问题1：给定ip地址格式的字符串(比如：192.168.1.1)，转化成int类型输出。
问题2：给定一字符串，输出其全排列。

结果是，我交了白卷，然后总监很有礼貌也很坦诚的说：我们的要求你也了解了，如果觉得自己可以了，可以随时过来找我。嗯哼，我就这样被KO掉了，那也比等消息来得实在。

首先我们来看第一个问题，我把我当时真实的想法写在这里，确实很愚蠢，可以说现在都没法理解当时是出于怎么的考虑呢！哈哈，就算再愚蠢我也要写出来。

都知道ip地址采用32位表示，那么思路就是将其转换为2进制，然后再转换成10进制的数，输出即可。这个思路不算错，应该算是常规想法。可是在执行的时候我就犯浑了。就想着将每个数都转换成2进制，比如192，就分别将1,9,2都转换成3位的2进制，然后拼起来，32位。真不知道怎么想出来的，明明漏洞百出却觉得自己想的很正确。怎么也弄不出32位啊。然后就在那里演算十进制数转2进制的规律。现在想想真是羞愧致死啊。

回到家后，google了一下，发现这个问题如果你会得话，就简单的跟1似的。会者不难，难者不会啊。

{% highlight java %}
public long getLongIp(String strIP){
  long [] ip=new long[4];
  int position1=strIP.indexOf(".");
  int position2=strIP.indexOf(".",position1+1);
  int position3=strIP.indexOf(".",position2+1);　 
  ip[0]=Long.parseLong(strIP.substring(0,position1));
  ip[1]=Long.parseLong(strIP.substring(position1+1,position2));
  ip[2]=Long.parseLong(strIP.substring(position2+1,position3));
  ip[3]=Long.parseLong(strIP.substring(position3+1));
  return (ip[0]<<24)+(ip[1]<<16)+(ip[2]<<8)+ip[3]; 
}
{% endhighlight %}
不用太多的解释吧，既然ip地址是32位，那么可以运用位移方式对转换成long型的值进行位移操作，然后将第一个8位左移24位，第二个8位左移16位，在加上第三个long，就可以得到ip地址对应的整数啦。

然后我就是一次次的懊恼自己。看着这段程序我反思到，是让我转换成int类型的，这个是long类型的，不能这样就应付掉。于是实现自己"int"(注：这里我还没发现问题呢)。
{% highlight java %}
public static void main(String[] args) {
  System.out.println(getIntIp("192.168.1.1"));
}
public int getIntIp(String strIP){
  int [] ip=new long[4];
  int position1=strIP.indexOf(".");
  int position2=strIP.indexOf(".",position1+1);
  int position3=strIP.indexOf(".",position2+1);　 
  ip[0]=new Integer(strIP.substring(0,position1)).intValue();
  ip[1]=new Integer(strIP.substring(position1+1,position2)).intValue();
  ip[2]=new Integer(strIP.substring(position2+1,position3)).intValue();
  ip[3]=new Integer(strIP.substring(position3+1)).intValue();
  return (ip[0]<<24)+(ip[1]<<16)+(ip[2]<<8)+ip[3]; 
}
{% endhighlight %}

<blockquote>
输出结果：<br/>
-1062731519
</blockquote>
而转化成long时，输出结果为：3232235777。
在调试过程中发现，首8位对应的数字，小于127时，一切正常，但是从128开始，都会变成负数。仔细想想不难也发现，int类型是由32位组成，但是其中有一位是符号位，而128对应的二进制为：10000000，左移24位后就变成了：10000000,00000000,00000000,00000000，这样结果就变成了负数，再加上后面三个二进制移位后的十进制数结果仍然是负数，这样也就解释了为何大于128开始的ip地址转换成int后会变成负数。更准确的说是溢出了。口说无凭，上运行结果：
{% highlight java  %}
public static void main(String[] args) {
    System.out.println(new Integer("127").intValue() << 24);
    System.out.println(new Integer("128").intValue() << 24);
}
{% endhighlight %}
<blockquote>
输出结果：<br/>
2130706432<br/>
-2147483648
</blockquote>

转换成long就木有问题啦，64位，足够足够啦。临走的时候也没来得及去问面试官这里想考我的知识点到底是什么。如此看来ip地址是没办法转换成int啦，只能是long。

问题二考的是一个字符串的全排列，这里我只能承认我确实很小白，不为自己做任何辩解。我把从google上搜索出来的结果贴出来和大家分享：
{% highlight java %}
public class MyTestGameCore {   
  public static void listAll(char[] arr_Str) {   
    if (arr_Str.length <= 1) {   
      System.out.println(arr_Str[0]);   
    return;   
  }   
  doPerm(0 + 1, arr_Str, new char[] { arr_Str[0] });   
}    
/*  
* index:当前要进行挨个插位的字符下标 
* arr_All:给定的字符数组 arr_Already:当前索引前已排好的字符数组  
*/   
private static void doPerm(int index, char[] arr_All, char[] arr_Already) {   
  if (index == arr_All.length - 1) {   
    for (int i = index; i >= 0; i--) {   
      System.out.println(new String(insertAt(arr_Already, i,arr_All[index])));   
    }    
  } else {   
    for (int i = index; i >= 0; i--) {   
      doPerm(index + 1, arr_All, insertAt(arr_Already, i,   
      arr_All[index]));   
    }   
  }   
}    
// 指定位置插入新的字符，并将原数组中的元素往后移动   
private static char[] insertAt(char[] char_Arr, int index, char c) {   
  char[] tmp = new char[char_Arr.length + 1];   
  for (int i = 0, j = 0; i < tmp.length; i++, j++) {   
    if (i == index) {   
      tmp[index] = c;   
      j--;   
    } else {   
      tmp[i] = char_Arr[j];   
    }   
  }   
  return tmp;   
}    
public static void main(String[] args) throws IOException {   
  System.out.println("Please input a String!");   
  BufferedReader br = new BufferedReader(new InputStreamReader(System.in));   
  String str = br.readLine();    
  char[] arr_Str = str.toCharArray();   
  listAll(arr_Str);  
}  
{% endhighlight %}

原文链接在这里：<a href="http://442136713.iteye.com/blog/406593" target='_blank'>http://442136713.iteye.com/blog/406593</a>

###总结

这次面试对我个人来说很有意义，学到了很多东西，也看到了事情间的差距。虽然无缘，但是也感谢这次让我受益匪浅的面试经历。另外，希望没因为我吐露的细节给贵公司造成困扰，如果有的话，可联系我，将本篇下架。

另外，由于真的是这周事情比较多，找房子找的人昏天地暗，心神疲惫的。遗留了一道题，就是将数据处理后放入TreeMap，然后再实现一个比较函数。思路就是这样，但是我没有将其实现，找机会一定会做好再放上来。

最后，衷心感谢上述的三位帅哥。:）