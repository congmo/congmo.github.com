---
layout: post
title: "由一个问题到 Resin ClassLoader 的学习"
keywords: Java,Resin,ClassLoader
---
<h4><strong>背景</strong></h4>
某日临近下班，一个同事欲取任何类中获取项目绝对路径，不通过`Request`方式获取，可是始终获取不到预想的路径。于是晚上回家google了一下，误以为是`System.getProperty(“java.class.path”)`-未实际进行测试，早上来和同事沟通，提出了使用这个内置方法，结果人家早已验证过，该方法是打印出`CLASSPATH`环境变量的值。

于是乎，继续google，找到了`Class`的`getResource`与`getResourceAsStream`两个方法。这两个方法会委托给`ClassLoader`对应的同名方法。以为这样就可以搞定(实际上确实可以搞定)，但验证过程中却发生了奇怪的事情。

软件环境：Windows XP、Resin 3、Tomcat6.0、Myeclipse、JDK1.5

<h4><strong>发展</strong></h4>
我的验证思路是这样的：

<ul>
    <li>定义一个Servlet，然后在该Servlet中调用Path类的getPath方法，getPath方法返回工程classpath的绝对路径，显示在jsp中。</li>
    <li>另外在Path类中，通过Class的getResourceAsStream读取当前工程classpath路径中的a.txt文件，写入到getResource路径下的b.txt。</li>
</ul>
由于时间匆忙，代码没有好好去组织。大致能看出上述两个功能，很简单不做解释。

Path.java：

{% highlight java %}
public class Path {
    public String getPath() throws IOException
    {
        InputStream is = this.getClass().getResourceAsStream("/a.txt");
        File file = new File(Path.class.getResource("/").getPath()+"/b.txt");
        OutputStream os = new FileOutputStream(file);
        int bytesRead = 0;
        byte[] buffer = new byte[8192];
        while ((bytesRead = is.read(buffer, 0, 8192)) != -1) {
            os.write(buffer, 0, bytesRead);
        }
        os.close();
        is.close();
        return this.getClass().getResource("/").getPath();
    }
}
{% endhighlight %}

PathServlet.java：

{% highlight java %}
public class PathServlet extends HttpServlet {
    private static final long serialVersionUID = 4443655831011903288L;
    public void doGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException
    {
        Path path = new Path();
        request.setAttribute("path", path.getPath());
        PrintWriter out = response.getWriter();
        out.println("Class.getResource('/').getPath():" + path.getPath());
    }
 
    public void doPost(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException
    {
        doGet(request, response);
    }
}
{% endhighlight %}	

在此之前使用`main`函数测试`Path.class.getResource("/").getPath()`打印出预想的路径为：`/D:/work/project/EhCacheTestAnnotation/WebRoot/WEB-INF/classes/`

于是将`WEB`应用部署到Resin下，运行定义好的`Servlet`，出乎意料的结果是：`/D:/work/resin-3.0.23/webapps/WEB-INF/classes/`。特别奇怪，怎么会丢掉项目名称：`EhCacheTestAnnotation`呢？

还有一点值得注意，`getPath`方法中使用`getResourceAsStream("/a.txt")`却正常的读到了位于下图的`a.txt`。
<div class='center'>
    <img src='/post_images/2012/02/resin01.png'>
</div>

然后写到了如下图的`b.txt`中。代码中是这样实现的：`File file = new File(Path.class.getResource("/").getPath()+"/b.txt");`本意是想在`a.txt文`件目录下入`b.txt`。结果却和料想的不一样。
<div class='center'>
    <img src='/post_images/2012/02/resin02.png'>
</div>
请注意，区别还是丢掉了项目名称。

写的比较乱，稍微总结下：

程序中使用`ClassLoader`的两个方法：`getResourceAsStream`和`getResource`。但是事实证明在`WEB`应用的场景下却得到了不同的结果。大家别误会啊，看名字他们两个方法肯定不一样，这个我知道，但是`getResourceAsStream`总会获取指定路径下的文件吧，示例中的参数为`"/a.txt"`，正确读取`"/D:/work/resin-3.0.23/webapps/EhCacheTestAnnotation/WEB-INF/classes/ "`下的`a.txt`，可是将文件写到`getResource`方法的`getPath`返回路径的`b.txt`文件。两个位置的差别在项目名称(`EhCacheTestAnnotation`)。

这样我暂且得出一个结论：通过`getResourceAsStream`和`getResource`两个方法获取的路径是不同的。但是为什么呢？
于是查看了`ClassLoader`的源码，贴出`getResource`和`getResourceAsStream`的源码。

{% highlight java %}
public URL getResource(String name) {
    URL url;
    if (parent != null) {
        url = parent.getResource(name);
    } else {
        url = getBootstrapResource(name);
    }
 
    if (url == null) {
        url = findResource(name);
    }
    return url;
}
public InputStream getResourceAsStream(String name) {
    URL url = getResource(name);
    try {
        return url != null ? url.openStream() : null;
    } catch (IOException e) {
        return null;
    }
}
{% endhighlight %}

从代码中看，`getResourceAsStream`将获取`URL`委托给了`getResource`方法。天啊，这是怎么回事儿？由此我彻底迷茫了，百思不得其解。

但是没有因此就放弃，继续回想了一遍整个过程：
<ul>
    <li>在main函数中，测试getResource与getResourceAsStream是完全相同的，正确的。</li>
    <li>将其部署到Resin下，导致了getResource与getResourceAsStream获取的路径不一致。</li>
</ul>

一个闪光点，是不是与web容器有关啊，于是换成Tomcat6.0。OMG，"奇迹"出现了，真的是这样子啊，换成Tomcat就一样了啊！和预想的一致。

在Tomcat下运行结果如下图:
<div class='center'>
    <img src='/post_images/2012/02/resin03.png'>
</div>

对，这就是我想要的。

因此我对Resin产生了厌恶感，之前也因为在Resin下程序报错，在Tomcat下正常运行而纠结了好久。记得看《松本行弘的程序世界》中对C++中的多继承是这样评价的(大概意思)：多重继承带来的负面影响多数是由于使用不当造成的。是不是因为对Resin使用不得当才使得和Tomcat下得到不同的结果。

最终，在查阅Resin配置文件`resin.conf`时候在`<host-default>`标签下发现了这样一段：
{% highlight java  %}
<class-loader>
    <compiling-loader path="webapps/WEB-INF/classes"/>
    <library-loader path="webapps/WEB-INF/lib"/> 
</class-loader>
{% endhighlight %}
其中的`compiling-loader`很可能与之有关，遂将其注释掉，一切正常。担心是错觉，于是将`compiling-loader`的`path`属性改成：`webapps/WEB-INF/classes1`，然后运行`pathServlet`，`b.txt`位置如下图：
<div class='center'>
    <img src='/post_images/2012/02/resin04.png'>
</div>
确实与`compiling-loader`有关。

<h4><strong>结论</strong></h4>
终于通过将`<class-loader>`标签注释掉，同样可以在Resin中获取“预想”的路径。验证了的确是使用Resin的人出了问题。

<h4><strong>疑问</strong></h4>
但是没有这样就结束，我继续对`getResource`的源码进行了跟进，由于能力有限，没有弄清楚`getResource`的原理。

最终留下了两个疑问：

1、如果追踪到`getResource`方法的最底层(也许是JVM层面)，它实现的原理是什么？

2、为何Resin中`<class-loader>`的配置会对`getResource`产生影响，但是对`getResourceAsStream`毫无影响(`getResourceAsStream`可是将获取路径委托给`getResource`的啊)。还是这里我理解或者使用错误了？

本来文章到这里就结束了，本来是想问问牛人的，但是这个问题引起了很多的好奇心，于是我又花了一两周做了下面的调查。

<h4><strong>Resin中的类加载器</strong></h4>
在我了解的`ClassLoader`是在`com.caucho.loader`包下，结构请看下图：
<div class='center'>
    <img src='/post_images/2012/02/resin05.png'>
</div>
<div class='center'>图一</div>
<div class='center'>
    <img src='/post_images/2012/02/resin06.png' width='650px'>
</div>
<div class='center'>图二</div>
从上面两幅图中可以看出，图1是与Jdk有关联的，继承自`java.net.URLClassLoader`。`DynamicClassLoader`的注释是这样的：

{% highlight java %}
/**
* Class loader which checks for changes in class files and automatically
* picks up new jars.
*
* DynamicClassLoaders can be chained creating one virtual class loader.
* From the perspective of the JDK, it's all one classloader.  Internally,
* the class loader chain searches like a classpath.
*/
{% endhighlight %}

EnvironmentClassLoader又继承了DynamicClassLoader。

图2应该是Resin本身的`ClassLoader`，其中`Loader`是一个抽象类，包含了各种子类类加载器。

从两幅图中是看不出Resin自身的`Loader`体系与继承自JVM的类加载器存在关系，那是不是他们就不存在某种关联呢？其实不是这样子的。请看下面`DynamicClassLoader`源码的片段：
{% highlight java %}
// List of resource loaders
private ArrayList _loaders = new ArrayList();
private JarLoader _jarLoader;
private PathLoader _pathLoader;
{% endhighlight %}
清楚了吧，这两个`Loader`分支通过组合的方式协作。

<h4><strong>类加载顺序</strong></h4>
既然Resin标准的`Loader`及其子类以组合的方式嵌入到`DynamicClassLoader`中，那么在加载一个"资源"时，`Loader`分支和`java.net.URLClassLoader`分支的先后顺序是什么样子的呢？

首先使用下面这段代码，将类加载器名称打印到控制台：
{% highlight java  %}
ClassLoader loader = PathServlet.class.getClassLoader();
while (loader != null) {
    System.out.println(loader.toString());
    loader = loader.getParent();
}
{% endhighlight %}
输出的结果为：

<blockquote>
    EnvironmentClassLoader[web-app:http://localhost:8080/Test]<br>

    EnvironmentClassLoader[web-app:http://localhost:8080]<br>

    EnvironmentClassLoader[cluster ]<br>

    EnvironmentClassLoader[]<br>

    sun.misc.Launcher$AppClassLoader@cac268<br>

    sun.misc.Launcher$ExtClassLoader@1a16869<br>
</blockquote>
额，没有任何一个Resin的`Loader`被打印出来啊，对头，有就错了。下面就让我们看看`DynamicClassLoader中getResource`的源码来解答。
`getResource(String name)`

{% highlight java %}
/**
* Gets the named resource
*
* @param name name of the resource
*/
public URL getResource(String name)
{
    if (_resourceCache == null) {
        long expireInterval = getDependencyCheckInterval();
        _resourceCache = new TimedCache(256, expireInterval);
    }
 
    URL url = _resourceCache.get(name);
    if (url == NULL_URL)
        return null;
    else if (url != null)
        return url;
 
    boolean isNormalJdkOrder = isNormalJdkOrder(name);
 
    if (isNormalJdkOrder) {
    url = getParentResource(name);
    if (url != null)
        return url;
    }
 
    ArrayList loaders = _loaders;
    for (int i = 0; loaders != null && i < loaders.size(); i++) {
        Loader loader = loaders.get(i);
        url = loader.getResource(name);
 
        if (url != null) {
            _resourceCache.put(name, url);
            return url;
        }
 
    }
 
    if (! isNormalJdkOrder) {
        url = getParentResource(name);
        if (url != null)
            return url;
    }
 
    _resourceCache.put(name, NULL_URL);
    return null;
}
{% endhighlight %}

代码不难懂，我画了一张流程图，不规范，凑合看下。
<div class='center'>
    <img src='/post_images/2012/02/resin07.png'>
</div>

<h4><strong>总结</strong></h4>
{% highlight java %}
boolean isNormalJdkOrder = isNormalJdkOrder(name);
{% endhighlight %}

这行代码控制着Resin类加载的顺序，如果是常规的类加载顺序(向上代理，原文：`Returns true if the class loader should use the normal order, i.e. looking at the parents first.)`，则先`url = getParentResource(name)`，后遍历`_loaders`。否则是按照先遍历`_loaders`再`url = getParentResource(name)`向上代理。

在我的调试经历中，一直都是先向上代理，后遍历`_loaders`的顺序，未遇到第二种方式。

文字对先向上代理，后遍历的顺序做点儿说明：

1、首先使用"最上层"的`sun.misc.Launcher$ExtClassLoader@1a16869`加载`name`资源，如果找到就返回URL否则返回null。

2、程序返回到`sun.misc.Launcher$AppClassLoader@cac268`，首先判断父类加载器返回的url是否为null，如果不为null则返回url，返回null。

3、EnvironmentClassLoader[]

4、程序返回到`EnvironmentClassLoader[cluster ]`的`getParentResource`，再返回到`getResource`，如果url不为null，则直接返回，否则遍历`"ArrayList<Loader> loaders=_loaders"`从各个`loader中`加载name，如果加载成功，即不为null，则返回，否则继续遍历，直至遍历完成。

5、EnvironmentClassLoader[web-app:http://localhost:8080]同4

6、EnvironmentClassLoader[web-app:http://localhost:8080/Test]同4

OK，完事儿，后续还有，准备好好写几篇。

本文同时发布于：[http://coolshell.cn/articles/6112.html](http://coolshell.cn/articles/6112.html)