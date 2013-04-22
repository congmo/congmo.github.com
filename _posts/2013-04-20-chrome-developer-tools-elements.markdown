---
layout: post
title: "Chrome开发者工具之Elements面板"
category: Translation
tags:
 - Chrome
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

###DOM元素树

元素树都是语法高亮的，包括内嵌的样式表和脚本。比如选择`&lh;script&gh;`标签时，你会看到类似下图中的样子：

<div class="center">
	<img src="/post_images/2013/4/elements_css_syntax_highlighting.png">
</div>

主面板中选择`&lh;p&gh;`元素，会看到如下图所示：

<div class="center">
	<img src="/post_images/2013/4/elements_p.png">
</div>

在Elements面板中可以添加，编辑或者删除选中DOM元素的属性。`&lh;p&gh;`元素现在没有属性，通过输入或粘贴属性到高亮行中来为DOM元素添加属性，也可以删除text属性。

    *在元素上双击或者敲回车键就可以编辑主面板中的元素属性
    *按`Del`键来删除元素
    *可以通过拖拽来改变元素在父节点中的位置，也可以在不同父节点间移动元素

###CSS样式表

Elements面板在展现CSS层叠特性方面非常拿手。当样式莫名的错乱，渲染成非预期效果，这时，了解浏览器渲染样式的规则对于排除bug尤为重要。	

点击放大镜图标切换到探查模式，回到`Google Closure Hovercard`页面，然后点击左上角的TOM Smith,由于处于探查模式，Elements面板中会高亮选中的元素，并且会展现相关的样式表，然后退出探查模式。

<div class="center">
	<img src="/post_images/2013/4/elements_hover.png">
</div>

这样就可以看到所有起作用的样式表了。比如，`padding`就直接来自于`&lh;span&gh;`元素的`class="anchor"`元素，但是font首先被`body`元素定义，随后又被`.anchor`覆盖。像`font`这样不会被渲染引擎渲染的属性会特别标识出来，同样被覆盖的样式会用三角警告标志标识出来。

虽然可以查看样式表以及他们的来源，但是查看经过计算最后应用到元素上的样式列表同样重要，可以通过`Computed Style`section中查看最终起作用和被渲染引擎感知的样式列表。

现在鼠标玄停在右侧栏的`.anchor`样式表可以看到每条样式前会出现复选框，可以取消渲染单条样式。如下图所示：

<div class="center">
	<img src="/post_images/2013/4/elements_style_checkboxes.png">
</div>

可以取消选择复选框来使某条样式失效。

双击一个可编辑样式的名字或值就可以进行编辑。比如，双击`margin:20px`属性，可以展现出如下图的效果（译者注：貌似没什么效果，没有呈现出编辑状，有可能是图错了）：

<div class="center">
	<img src="/post_images/2013/4/elements_style_checkboxes.png">
</div>

编辑样式名称或值的时候自动补全功能会给予提示，单击可编辑样式表的空白处，就可以在该条样式后面新增一条样式。如果编辑的样式值是数字类型，那么可以通过`向上`或`向下`键来改变值的大小，按住`Alt`或`Option`时每次步长为0.1，按住`Shift`步长为10.双击现有样式的空白处可添加多条样式，或者直接粘贴多条用分号分隔的样式。单击样式选择器可进行编辑，还可以使用`Style`右侧的齿轮菜单新增样式规则。

<div class="center">
	<img src="/post_images/2013/4/elements_style_completion.png">
</div>

`Style`中的<img src="/post_images/2013/4/plus.png">按钮是用来添加新的样式选择器，<img src="/post_images/2013/4/attributes.png">按钮是用来模拟元素的伪状态，比如`:active, :hover, :focus, :visited`,点击时会弹出一个小窗口，用于设置哪些伪状态可以被激活。

###Box Model

打开有侧边栏的`Metrics`窗口，双击某个度量值。

<div class="center">
	<img src="/post_images/2013/4/elements_metrics.png">
</div>

这样就可以编辑绝对和相对定位，或者固定框模式的度量。

###Properties

右侧边栏选择`Properties`面板，可以展开页面中的元素。

<div class="center">
	<img src="/post_images/2013/4/elements_properties_paner.png">
</div>

在这里可以编辑DOM元素的所有属性，如果允许的话也是可以删除的。

###DOM Breakpoints

译者注：增加了一张如何使用DOM Breakpoints的图

<div class="center">
  <img src="/post_images/2013/4/elements_dom_breakpoints_private.png">
</div>

在DOM元素上打断点来监控某元素的修改事件。比如在id为`#profileCard`的元素点击右键，可以为这`Subtree Modifications, Attributes Modifications, Node Removal`三类事件增加断点。这里我们选择`Attributes Modification`事件，鼠标移动到该元素上，JavaScript脚本就会暂停在修改id为`#profileCard`元素`className`处，按F8执行继续执行JavaScript脚本，代码会立即在此处再次暂停。现在可以在右侧边栏的`DOM Breakpoints`面板中查看断点情况。

<div class="center">
  <img src="/post_images/2013/4/elements_dom_breakpoints.png">
</div>

`DOM Breakpoints`面板中可以查看所有的DOM断点（这里只有刚刚添加的那个DOM断点），切换前面的复选框来控制是否启用该断点，或者右键选择删除断点（Remove Breakpoint）。

###Event Listeners

右侧边栏选择`Event Listeners`面板

<div class="center">
  <img src="/post_images/2013/4/elements_event_listeners_gear.png">
</div>

`Event Listeners`面板中显示捕获和冒泡阶段的所有监听事件，它提供了准确还非常有用的信息。面板中的事件按类型进行分类，比如`onclick`和`onmouseover`就被分配在不同的类型中，还可以使用右上角的齿轮状（译者注：版本 23.0.1271.97中是个漏斗状）的菜单筛选是只显示选中元素上的监听事件还是整个页面上的监听事件。

###Search

在输入框中输入`document.writ`，会看到增量搜索结果：

<div class="center">
  <img src="/post_images/2013/4/elements_search.png">
</div>

Elements面板不仅支持文本搜索，还支持`XPath`和`CSS选择其`查询，匹配的地一个结果会在DOM树中高亮显示。

原文链接：［https://developers.google.com/chrome-developer-tools/docs/elements］（https://developers.google.com/chrome-developer-tools/docs/elements）