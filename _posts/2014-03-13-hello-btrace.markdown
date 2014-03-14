---
layout: post
title: "Hello BTrace"
keywords: Java,BTrace,Unsafe,多jar依赖
---
很久之前就有听说过`BTrace`这样一个神奇的工具存在，一直很懒，没有实际使用过。最近总被测试环境以及预发布环境数据困扰着，今天需要通过log打印这个接口的数据验证一下功能，明天需要另外一个接口的返回值，入参。更悲剧的是每到下班时间这样的事儿就如潮水一般涌来，这让我情何以堪啊，完全不能忍啊。受够了这样重复的打log，然后还要重新部署测试环境，重启服务，`tail`日志文件。如果是预发布就更悲催了，还要求运维大哥帮帮忙，覆盖个包，还的买个小饮料什么的。就这样，决定尝试`BTrace`这货，试图从这种不能忍的工作中解脱出来。目的比较单一，就是方法执行过程中的入参与出参，没有涉及到使用`BTrace`打印内存以及堆栈信息等。

####`Linux`安装`BTrace`

首先，<a href="https://kenai.com/projects/btrace/downloads/directory/releases" target="_blank">这里</a>下载`BTrace`的release版本
其次，直接解压到相应的目录下`tar -xvf btrace-bin.tar.gz`
然后，配置`BTRACE_HOME`，楼主使用的是zsh，所以编辑`~/.zshrc`文件，在文件末尾添加`export BTRCE_HOME=/export/servers/btrace`，然后在将`BTRACE_HOME`添加到`PATH`中。`export PATH=$PATH:$HADOOP_HOME/bin:$BTRCE_HOME/bin:$SBT_HOME/bin:$MAVEN_HOME/bin:$ANT_HOME/bin`
最终，还有可能需要修改`btrace`脚本中的`JAVA_HOME`，这个视情况而定。

至此，`BTrace`就安装完毕，如何验证是否安装配置成功呢？终端输入`btrace`命令，输出如下提示及表示安装配置成功：

<blockquote>
    ➜  bin  btrace<br/>
        Usage: btrace &lt;options&gt; &lt;pid&lt;btrace source or .class file&lt; &lt;btrace arguments&lt;<br/>
        where possible options include:<br/>
            -classpath &lt;path&lt; Specify where to find user class files and annotation processors<br/>
            -cp &lt;path&lt;        Specify where to find user class files and annotation processors<br/>
            -I &lt;path&lt;         Specify where to find include files<br/>
            -p &lt;port&lt;         Specify port to which the btrace agent listens for clients<br/>
</blockquote>

在决定使用`BTrace`前，楼主还是稍稍做了点其他的努力，尝试了一把`HouseMD`，不过安装过程中我放弃了，放弃它有两点原因：第一它是`scala`实现的，楼主又比较笨，准备环境嫌太麻烦；其次如果想在线上使用它还是有成本的，而不像`BTrace`，基于`java`环境，无需额外的准备工作。

`BTrace`官方是这样描述的：

<blockquote>
    <b>BTrace</b> is a safe, dynamic tracing tool for Java. BTrace works by dynamically (bytecode) instrumenting classes of a running Java program. BTrace inserts tracing actions into the classes of a running Java program and hotswaps the traced program classes.
</blockquote>

`BTrace`自称是安全的，这个安全就带来了诸多的限制：

1. 不能创建对象
2. 不能抛出或者捕获异常
3. 不能用synchronized关键字
4. 不能对目标程序中的instace或者static变量
5. 不能调用目标程序的instance或者static方法
6. 脚本的field、method都必须是static的
7. 脚本不能包括outer,inner,nested class
8. 脚本中不能有循环,不能继承任何类,任何接口与assert语句

这些限制引用自<a href="http://www.pigg.co/btrace-introduction.html" target="_blank">这里</a>，这篇文章介绍的挺好的，推荐读一下。

下面是本文的重点，开始踩坑！

####坑一：toString

`safe mode`下只能使用`BTrace`内置的功能，`jdk`相关的功能都不能使用，否则编译就不通过。`BTraceUtils`就提供了诸多静态方法可供使用，比如`str()`，它会调用目标对象的`toString`方法。然后我就踩了个坑。

先看两个例子：
{% highlight java %}
@BTrace
public class TestBtrace {
    
    @OnMethod(
            clazz = "com.xxxx.rpc.impl.ProductRPCImpl", 
            method = "queryProduct", 
            location = @Location(Kind.RETURN)
            )
    public static void queryProduct(@Self Object self, Set<Long> skuIds, @Return Object result){
        
        println(strcat("入参: ", str(skuIds)));
        println(strcat("出参: ", str(result)));
    }
}
{% endhighlight %}

`result`是`Set<ProductInfo>`类型。

程序输出为：

<blockquote>
    入参: [10270495]<br/>
    出参: [com.xxx.domain.ProductInfo@40363c[skuId=10270495,name=染整工艺实验教程（附赠光盘1张）,category=1713;3282;3709,valueWeight=0.399,imagePath=17220/c1168702-51bd-4645-946b-74f0700b1300.jpg,venderId=0,venderType=0,venderName=<null>,wstate=1,businessCode=bk0193,maxPurchQty=0,wyn=1,length=0,width=0,height=0,brandId=0,extFieldMap={},valuePayFirst=0,skuMark=<null>]]
</blockquote>

因为楼主重写了`ProductInfo`对象的`toString()`方法，所以输出了对象的属性值。从第一个示例可以得出结论：重写`toString()`方法起到了作用。

示例二：
{% highlight java %}
@BTrace
public class TestBtrace {
    
    @OnMethod(
            clazz = "com.xxxx.impl.PromotionProxyImpl", 
            method = "calculate", 
            location = @Location(Kind.RETURN)
            )
    public static void calculate(@Self Object self, @Return Object result){
        println(strcat("出参: ", str(result)));
    }
}
{% endhighlight %}

`result`是自定义的`Result`类型，同样重写了`toString()`方法。

<blockquote>
    出参: com.xxx.domain.Result@18eb9f6
</blockquote>

从这个示例的结果来讲，楼主重写的`toString()`根本就没有被执行。

到这里楼主就彻底迷糊了，为毛有的起作用了，而有的没有呢？google了一圈也没有找到满意的答案。

各种无果后，楼主干脆一不做二不休用蹩脚的chinese english跑到`BTrace`官网上发了个帖子，问作者这tm到底是虾米情况！！查看原帖请点击<a href="https://kenai.com/projects/btrace/forums/tips-tricks/topics/532950-unsafe-mode-is-not-works#p637645" target="_blank">这里</a>。

截取一段楼主蹩脚的e文和作者耐心的解答。

<blockquote>
    <b>Question:</b><br/>
    Why i want to use unsafe mode is because i found a strange behavior in safe mode:<br/>
    <br/>
    I want to use business domain in BTrace script, and override the toString() method for str(), i found somtimes it does not use the toString() which i overrided,and print a address of the domain. and in another case, it print the right result of toString() returnd.Is that the right behavior? And somebody tell me BTrace script will always use the orginal toString() because of safe mode, i don't think so.<br/>
    <b>Answer:</b><br/>
    For the second part - toString() is only invoked for instances of the classes loaded by the bootstrap classloader (system classes). For all the other objects an identity string is returned to prevent the execution of unknown code.
</blockquote>

大家注意到了没，只有被`BootStrapClassLoader`加载的类实例的`toString()`方法才会被`BTrace script`调用，其他情况使用`Object`的`toString()`方法，非重写后的。楼主顿觉真气止不住的涌来，原来如此啊。第一个示例的返回值类型是个`Set`自然会由系统类加载器加载，其范型也沾了点金，同样被加载了；而实例二中`Result`是自定义对象，由应用类加载器加载，待遇自然而然就不同喽。这样也就解释了最初的疑问，完美解决。楼主可不是一般人，刨根问底能手中的能手，哼，遂翻出我大`BTrace`源码一探究竟。

{% highlight java %}
/**
 * Returns a string representation of the object. In general, the
 * &lt;code&gt;toString&lt;/code&gt; method returns a string that
 * "textually represents" this object. The result should
 * be a concise but informative representation that is easy for a
 * person to read. For bootstrap classes, returns the result of
 * calling Object.toString() override. For non-bootstrap classes,
 * default toString() value [className@hashCode] is returned.
 *
 * @param  obj the object whose string representation is returned
 * @return a string representation of the given object.
 */
public static String str(Object obj) {
    if (obj == null) {
        return "null";
    } else if (obj instanceof String)    {
        return (String) obj;
    } else if (obj.getClass().getClassLoader() == null) {
        try {
            return obj.toString();
        } catch (NullPointerException e) {
            // NPE can be thrown from inside the toString() method we have no control over
            return "null";
        }
    } else {
        return identityStr(obj);
    }
}
{% endhighlight %}

至此，真相大白了。可是仍然没有解决问题啊？我需要输出业务实体的字段值！！好吧，试试`unsafe mode`吧。然后，然后就继续踩坑。

####坑二：unsafe mode

`safe mode`有太多的限制了，这样楼主同样不能忍。不过也还是有他的道理的，在可以保证`safe`的前提下楼主喜欢`unsafe mode`思米达。不用再畏首畏尾了，木有那么多限制自然顺风顺水。结果苦逼的楼主在开启`unsafe mode`时候给跪了。

开启`unsafe mode`有两个步骤，首先编辑`$BTRACE_HOME/bin/btrace`文件，将启动参数`-Dcom.sun.btrace.unsafe`改为`true`；然后在`Btrace script`中的`@BTrace`注解中增加`unsafe = true`。

然后楼主就收获了这样一陀奇葩的日志：

<blockquote>
DEBUG: btrace debug mode is set<br/>
DEBUG: btrace unsafe mode is set<br/>
DEBUG: assuming default port 2020<br/>
DEBUG: assuming default classpath '.'<br/>
DEBUG: attaching to 1625<br/>
DEBUG: checking port availability: 2020<br/>
DEBUG: attached to 1625<br/>
DEBUG: loading /export/servers/btrace/build/btrace-agent.jar<br/>
DEBUG: agent args: port=2020,debug=true,unsafe=true,systemClassPath=/export/servers/jdk1.6.0_25/lib/tools.jar,probeDescPath=.<br/>
DEBUG: loaded /export/servers/btrace/build/btrace-agent.jar<br/>
DEBUG: registering shutdown hook<br/>
DEBUG: registering signal handler for SIGINT<br/>
DEBUG: submitting the BTrace program<br/>
DEBUG: opening socket to 2020<br/>
DEBUG: sending instrument command<br/>
DEBUG: entering into command loop<br/>
DEBUG: received com.sun.btrace.comm.ErrorCommand@3c24c4a3<br/>
com.sun.btrace.VerifierException: Unsafe mode, requested by the script, not allowed<br/>
    at com.sun.btrace.runtime.Verifier.reportError(Verifier.java:385)<br/>
    at com.sun.btrace.runtime.Verifier.reportError(Verifier.java:376)<br/>
    at com.sun.btrace.runtime.Verifier$1.visit(Verifier.java:141)<br/>
    at com.sun.btrace.org.objectweb.asm.ClassReader.a(Unknown Source)<br/>
    at com.sun.btrace.org.objectweb.asm.ClassReader.a(Unknown Source)<br/>
    at com.sun.btrace.org.objectweb.asm.ClassReader.accept(Unknown Source)<br/>
    at com.sun.btrace.org.objectweb.asm.ClassReader.accept(Unknown Source)<br/>
    at com.sun.btrace.runtime.InstrumentUtils.accept(InstrumentUtils.java:66)<br/>
    at com.sun.btrace.runtime.InstrumentUtils.accept(InstrumentUtils.java:62)<br/>
    at com.sun.btrace.agent.Client.verify(Client.java:397)<br/>
    at com.sun.btrace.agent.Client.loadClass(Client.java:224)<br/>
    at com.sun.btrace.agent.RemoteClient.&lt;init&gt;(RemoteClient.java:59)<br/>
    at com.sun.btrace.agent.Main.startServer(Main.java:379)<br/>
    at com.sun.btrace.agent.Main.access$000(Main.java:65)<br/>
    at com.sun.btrace.agent.Main$3.run(Main.java:166)<br/>
    at java.lang.Thread.run(Thread.java:662)<br/>
DEBUG: received com.sun.btrace.comm.ExitCommand@11e9c82e<br/>
</blockquote>

神奇吧？日志上面显示我已经开启了`unsafe mode`，对的，已经开启了。可是他就是提示不支持，这是要闹哪样。。。

又是一通的搜索，妈蛋，竟然还是无果，快绝望了。嗯，就这个问题整整折腾了一个下午+半个晚上，最终楼主一怒之下关掉显示器电源头也不回的离去。结果第二天早上又试了一下竟然好了，你敢信？？

楼主又是惊喜又是惶恐，一直在怀疑他是怎么其作用的。做了好多尝试，就那种病急乱投医的那种。楼主这个走狗屎运啊，还真试出来了，修改`BTrace`运行模式后重启下应用就可以了。貌似是找到答案了，不过如果真是这种情况那又不能忍啊，完全没有办法在生产环境下使用啊。就有跑到官网找作者‘理论’去了。

<blockquote>
    <b>Question:</b><br/>
    Hi brother, there is a mistake here, i am using BTrace 1.2.4 not the 2. I am so sorry<br/>
    But it really happened in BTrace 1.2.4, and finally i fount it works after restarting the application.<br/>
    Then i try to change -Dcom.sun.btrace.unsafe to false, and i can still run the BTrace script in unsafe mode.<br/>
    So, is that i must restarting the application,if changed the mode?<br/>

    <b>Answer:</b><br/>
    For the first part - once you start the agent it will keep its unsafe flag forever. You could start the application with <a href="https://kenai.com/projects/btrace/pages/UserGuide#Starting_an_application_with_BTrace_agent" target="_blank">BTrace Agent</a> and a dummy script to allow unsafe BTrace scripts eg.
</blockquote>

额，谦逊的作者不厌其烦的解答了我的问题，还每次都谢谢楼主，怎么好意思呢。。。最终这个坑也让老子填上了，不过说实话，还是楼主功力不够深，没耐心自己读文档。

结束本文前再插播一个在使用`BTrace`时候困扰楼主好久的低级问题，希望没有困扰到大家。

这样的就是这个，脚本中需要依赖多个jar包的时候要怎么办呢？

依赖单个jar包肯定是这样了：

<blockquote>btrace -classpath ./a.jar 109776 TestServiceBtrace.java</blockquote>

然后多个jar包的时候楼主就蒙圈了，最后是R大给解答的：

<blockquote>
-classpath后面可以跟一个字符串，里面可以包含多个路径拼接在一起。 
例如在Windows上分隔符是分号： 
-classpath ./a.jar;./b.jar 
在Linux上分隔符是冒号： 
-classpath ./a.jar:./b.jar 
</blockquote>

原文链接在 <a href="http://hllvm.group.iteye.com/group/topic/39690" target="_blank">这里</a>。