---
layout: post
title: "hadoop之ubuntu安装"
category: Hadoop
tags:
 - Hadoop
 - Ubuntu
keywords: Java,hadoop,ubuntu,安装
---

刚刚开始接触hadoop，官方包括网络上已经有很多很多关于如何安装配置hadoop的文章了，我还是决定写一篇，就算是留做备份，省得以后到处找了。：） 哦，补充一下，是在ubuntu12.04下面安装的。

就在决定写这篇blog的前一刻，才完成了hadoop的安装，安装配置起来其实挺简单的，总结起来就下面两步：

  第一步：官方下载最新的release版本hadoop，我下载的是1.0.3,·[hadoop-1.0.3.tar.gz](http://mirror.bit.edu.cn/apache/hadoop/common/hadoop-1.0.3/hadoop-1.0.3.tar.gz)，下载之后移动到自己的文件夹下，我的为：/home/liuzi/work/。
  然后解压：
  {% highlight%}
    tar zxvf hadoop-1.0.3.tar.gz 
  {% endhighlight %}
 
  第二步：配置。解压完成后，进入conf目录下，编辑hadoop-env.sh文件，将JAVA_HOME添加进去。

  第三步：在hadoop安装路径下运行：bin/hadoop version。

至此，hadoop就安装完成了。见下图：

<div class='center' >
  <img src="/post_images/2012/09/hadoop-version.png">
</div>

不能每次都到hadoop安装目录下去运行hadoop命令，那么继续添加配置：

{% highlight %}
   export HADOOP_INSTALL=/home/liuzi/work/hadoop-1.0.3
   export PATH=$PATH:$HADOOP_INSTALL/bin
{% endhighlight %}

这样就可以在任何地方运行hadoop命令了。