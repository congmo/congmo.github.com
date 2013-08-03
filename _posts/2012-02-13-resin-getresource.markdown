---
layout: post
title: "Resin服务器getResource揭秘"
keywords: Java,Resin,getResource,getResourceAsStream
---
<h4><strong>前言</strong></h4>
接上文<a href='http://congmo.github.com/Resin/2012/02/04/1.html'>"由一个问题到Resin ClassLoader的学习"</a>，本文将以`this.getClass().getResource("/"").getPath()`和`this.getClass().getResourceAsStream("/a.txt")`为例，一步步解析加载的过程。

<h4><strong>调试环境</strong></h4>

1、下载resin3.0.23的源码(<a href='http://www.caucho.com/download/resin-3.0.23-src.zip'>http://www.caucho.com/download/resin-3.0.23-src.zip</a>)。

2、部署到myeclipse中，有错误，本人忽略了。Resin可运行。

3、将EhCacheTestAnnotation部署到resin3.0.23中。

4、调试`this.getClass().getResource("/"").getPath()`。

问题来了，无论如何也模拟不出来`<compiling-loader>`所造成的影响，一直输出：`/D:/work_other/project/resin-3.0.23/bin/ `。无奈之下，采用了这种方式：使用两个eclipse，一个使用发布版本的，部署EhCacheTestAnnotation进行调试；另外一个部署resin3.0.23源码，调试到哪里对照看源码。

<h4><strong>开始</strong></h4>

<strong>1)this.getClass().getResource("/").getPath()</strong>

本次调试涉及的所有类加载器为：

<blockquote>
  EnvironmentClassLoader$24156236[web-app:http://localhost:8787/EhCacheTestAnnotation]

  EnvironmentClassLoader$7806641[host:http://localhost:8787]

  EnvironmentClassLoader$22459270[servlet-server:]

  sun.misc.Launcher$AppClassLoader@7259da

  sun.misc.Launcher$ExtClassLoader@16930e2
</blockquote>

首先进入`Class`的`getResource(String name)`方法，如下图:
<div class='center'>
  <img src='/post_images/2012/02/1.png'/>
</div>
最后委托给`ClassLoader`的`getResource`方法。那么这个`ClassLoader`是哪个呢？一看下图便知:
<div class='center'>
  <img src='/post_images/2012/02/2.png'/>
</div>
是`DynamicClassLoader`的`getResource`方法，原理上文已述。

最终会委托给`sun.misc.Launcher$ExtClassLoader@16930e2`类加载器的`getResource`方法，返回null，然后开始回溯。

还记得吗？当`java.net.URLClassLoader`分支的`ClassLoader`的`getResource`方法返回值为null后，就要遍历嵌入`DynamicClassLoader`中的Resin的`Loader`(即`_loaders`集合)。

当然回溯到`EnvironmentClassLoader$22459270[servlet-server:]`中，那么它中`_loaders`这个集合中的`Loader`又有哪些呢？

以图为证，当天确实回溯到该`ClassLoader`，而且开始准备遍历`_loaders`集合。
<div class='center'>
  <img src='/post_images/2012/02/3.png'/>
</div>
`DynamicClassLoader`的1306行，没问题，resin3.0.23源码截图为证：
<div class='center'>
  <img src='/post_images/2012/02/4.png'/>
</div>
不做多余解释，那么`servlet-server`这个`ClassLoader`中的`_loaders`集合中都放了一些什么呢？
<div class='center'>
  <img src='/post_images/2012/02/5.png'/>
</div>
存放了两个`TreeLoader`(`Loader`的子类)，然未找到结果，返回null。继续回溯。

这次轮到遍历`EnvironmentClassLoader$7806641[host:http://localhost:8787]`的`_loaders`。下图为证：
<div class='center'>
  <img src='/post_images/2012/02/6.png'/>
</div>
_loaders中的内容如下图：
<div class='center'>
  <img src='/post_images/2012/02/7.png'/>
</div>
比较长，我贴出来：
<blockquote>
[CompilingLoader[src:/D:/work/resin-3.0.23/webapps/WEB-INF/classes], LibraryLoader[com.caucho.config.types.FileSetType@fb6763], CompilingLoader[src:/D:/work/resin-3.0.23/webapps/WEB-INF/classes], LibraryLoader[com.caucho.config.types.FileSetType@140b8fd], CompilingLoader[src:/D:/work/resin-3.0.23/webapps/WEB-INF/classes], LibraryLoader[com.caucho.config.types.FileSetType@30fc1f]]
</blockquote>

注意到了吧，主角来了。那仔细调试下把。爆料一下：`CompilingLoader[src:/D:/work/resin-3.0.23/webapps/WEB-INF/classes]`就是主角。
<div class='center'>
  <img src='/post_images/2012/02/8.png'/>
</div>
看到了吧，遍历时，当前的`Loader`为`CompilingLoader[src:/D:/work/resin-3.0.23/webapps/WEB-INF/classes]`，而且url可是不为null了哦。再贴一张，看看url的值到底是什么！
<div class='center'>
  <img src='/post_images/2012/02/9.png'/>
</div>
嗯，不用多做解释了吧。

最后看看程序输出是否吻合，如下图：
<div class='center'>
  <img src='/post_images/2012/02/10.png'/>
</div>
然后修改resin.conf中的`<compiling-loader>`将其注释掉，看看程序结果会不会是我们期望的：`/D:/work/resin-3.0.23/webapps/EhCacheTestAnnotation/WEB-INF/classes/`。拭目以待。
<div class='center'>
  <img src='/post_images/2012/02/11.png'/>
</div>
为节省篇幅，一下只关注关键位置。

首先调试到`EnvironmentClassLoader$7806641[host:http://localhost:8787]`，我们需要停下来一下。
<div class='center'>
  <img src='/post_images/2012/02/12.png'/>
</div>
再看一下`_loaders`的值。
<div class='center'>
  <img src='/post_images/2012/02/13.png'/>
</div>
贴一个详细的:
<blockquote>
[LibraryLoader[com.caucho.config.types.FileSetType@1299f7e], LibraryLoader[com.caucho.config.types.FileSetType@1a631cc], LibraryLoader[com.caucho.config.types.FileSetType@f6398]]
</blockquote>

对比一下，在注释掉`<compiling-loader>`后，`loaders`中是没有`CompilingClassLoader`实例的。

继续，下面就轮到`EnvironmentClassLoader$24156236[web-app:http://localhost:8787/EhCacheTestAnnotation]`这个`ClassLoader`了，会是什么样子呢？
<div class='center'>
  <img src='/post_images/2012/02/14.png'/>
</div>
进入该`ClassLoader`时，url值依旧为null，那`_loaders`会有变化吗？如下图：
<div class='center'>
  <img src='/post_images/2012/02/15.png'/>
</div>
继续遍历`_loaders`:
<div class='center'>
  <img src='/post_images/2012/02/16.png'/>
</div>
到这里就结束了，url在`EnvironmentClassLoader$24156236[web-app:http://localhost:8787/EhCacheTestAnnotation]`中被加载。

<strong>2) this.getClass().getResourceAsStream("/a.txt")</strong>

`getResourceAsStream(String name)`方法也是采用双亲委派的方式。在前一篇文章中提出“`getResourceAsStream`可是将获取路径委托给`getResource`，`<compiling-loader>`却没有对`getResourceAsStream`产生影响”

`ClassLoader`中`getResourceAsStream`源码也确实是委托为`getResource`了，可是为什么呢？

`getResourceAsStream(String name)`方法。

{% highlight java %}
public InputStream getResourceAsStream(String name) {
    URL url = getResource(name);
    try {
        return url != null ? url.openStream() : null;
    } catch (IOException e) {
        return null;
    }
}
{% endhighlight %}

其实不难解释，JVM中`ClassLoader`的`getResourceAsStream(“/a.txt”)`返回了null，然后开始回溯，与`getResource`方法的原理一致，直到某个`ClassLoader`及其子类或者`Loader`及其子类找到了”/a.txt”，并以流的形式返回，当然谁都没找到就返回null。

捡重点的说。

调试到`sun.misc.Launcher$AppClassLoader@18d107f`，即ClassLoader的子类，情形如下图：
<div class='center'>
  <img src='/post_images/2012/02/17.png'/>
</div>
看见`getResource(name)`喽，按F5进去看个究竟。如下图，其parent为：`sun.misc.Launcher$ExtClassLoader@360be0`，其返回null。
<div class='center'>
  <img src='/post_images/2012/02/18.png'/>
</div>
开始回溯到：`EnvironmentClassLoader$1497769[servlet-server:]`，与`getResource`方法一致，开始遍历`_loaders`集合。

这样就可以解释为何`<compiling-loader>`没有影响到`getResourceAsStream`了。因为资源(这里是/a.txt)，就不是由`AppClassLoader`和`ExtClassLoader`加载的，而是由`DynamicClassLoader`或者其内部的`_loaders`集合完成的加载。或者更确切的说是由`CompilingClassLoader`获取到的URL，再转换成`InputStream`。

<span style='color:red;'>
`<comiling-loader>`其实对`getResourceAsStream`还是有点影响的，如果配置中配置了`<comiling-loader>`，并且`<comiling-loader>`配置的路径下，与实际项目的指定路径下，都放置了同名资源，则会先加载`<comiling-loader>`配置路径下的资源。
</span>

比如，下图所示：
<div class='center'>
  <img src='/post_images/2012/02/19.png'/>
</div>
`<compiling-loader>`配置的路径为：`<compiling-loader path="webapps/WEB-INF/classes"/>`

在加载"/a.txt"时，优先加载`webapps/WEB-INF/classes/a.txt`

<h4><strong>总结</strong></h4>

<blockquote>
1.`<compiling-loader>`如被注释掉，则只会在`EnvironmentClassLoader$24156236[web-app:http://localhost:8787/EhCacheTestAnnotation]`中的`_loaders`中被初始化，否则会在`EnvironmentClassLoader$24156236[web-app:http://localhost:8787/EhCacheTestAnnotation]`和`EnvironmentClassLoader$7806641[host:http://localhost:8787`两个类加载器各自的`_loaders`集合中被初始化。(通过调试`this.getClass().getResource("/test").getPath()`验证)<br/>


2.`<compiling-loader>`未注释掉，"/"(根路径)由`EnvironmentClassLoader$7806641[host:http://localhost:8787]`加载，注释掉后由`EnvironmentClassLoader$24156236[web-app:http://localhost:8787/EhCacheTestAnnotation]`加载。<br/>


3.`EnvironmentClassLoader$7806641[host:http://localhost:8787]`为Resin server的类加载器实例，`EnvironmentClassLoader$24156236[web-app:http://localhost:8787/EhCacheTestAnnotation]`为Web应用程序的类加载器实例。他们都属于`java.net.URLClassLoader`的实例。<br/>


4.`<compiling-loader>`某种程度上对`getResourceAsStream`方法有影响。<br/>
</blockquote>


现在`<compiling-loader>`如何影响getResource("/")，以及`getResourceAsStream`不"被影响全部真相大白。

<span style='color:red;'>注：`<compiling-loader>`只对获取根路径产生影响，也就是参数为"/"。比如加载"`/test/Path.class`"不会产生影响。</span><br/>

本文同时发布于：<a href='http://coolshell.cn/articles/6335.html'>http://coolshell.cn/articles/6335.html</a>
<br/>
