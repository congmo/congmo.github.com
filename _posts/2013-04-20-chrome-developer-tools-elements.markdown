---
layout: post
title: "Chrome-Elements面板"
category: Translation
tags:
 - Chrome
 - Javascript
 - Debug
keywords: Chrome,调试工具
---
###Elements 面板

Elements面板中可以查看DOM树中所有元素，还可以检查和在线编辑DOM元素。当需要定位页面中某些HTML代码片段时，通常会用到Elements面板。比如，你可能会好奇image标签是否有id属性，还有id的值是什么等等时，Elements面板就派上用场了。

Elements面板是查看网页源码最好用的方式，在Elements面板中所有的DOM元素都是经过格式化的，很友好的展示出HTML元素以及他们的父元素及子元素。通常我们访问的页面的源码都是没有缩进或者异常糟糕的HTML代码，很难看清楚页面的结构，而Elements面板很好的解决了这个问题，可以很直观的看到页面的整体结构。

通过如下步骤使用Elements面板：
    *打开［Google Closure Hovercard demo page.］（http://closure-library.googlecode.com/svn/trunk/closure/goog/demos/hovercard.html）
    *打开［How to Access the Developer Tools］（https://developers.google.com/chrome-developer-tools/#access）中描述的开发者工具窗口
    *选择Elements面板
<div class="center">
	<img src="/post_images/2013/4/elements_panel.png">
</div>
主面板中展示页面中所有HTML元素，右侧边栏显示样式，度量，属性以及事件监听器。如果开发者工具是通过元素探查的方式打开的，那么它会自动向下钻取，并且将鼠标选中的元素高亮。这样当查看页面元素是由怎样的HTML代码生成时，非常方便。

