---
layout: post
title: "jQuery选择器"
category: Translation
tags:
 - jQuery
 - Translation
keywords: jQuery,selector
---

<div style="margin: 0 auto;background-color: #FFFFCC;border: 1px solid #669999;margin: 0px 20px 10px 20px;">
	<h3 class="headline">目录</h3>
	<ul id="catalog">
		<li><a href="#what">什么是jQuery选择器?</a></li>
		<li>
			<a href="#types">jQuery选择器种类</a>
			<ul>
				<li><a href="#basic">基本的CSS选择器</a></li>
				<li><a href="#position">位置选择器</a></li>
				<li><a href="#custom">自定义选择器</a></li>
			</ul>
		</li>
		<li>
			<a href="#method">匹配函数</a>
			<ul>
				<li><a href="#add">添加新元素</a></li>
				<li><a href="#delete">删除匹配元素</a></li>
				<li><a href="#find">寻找后代</a></li>
				<li><a href="#filter">过滤匹配集合</a></li>
				<li><a href="#slice">分割匹配集合</a></li>
				<li><a href="#relationship">通过关系匹配</a></li>
				<li><a href="#translation">转换元素</a></li>
				<li><a href="#controll">控制链</a></li>
			</ul>
		</li>
	</ul>
</div>


<h3 class="headline"><a name="what">什么是jQuery选择器</a></h3>

jQuery选择器是jQuery类库最重要功能之一。这些选择器的用法和CSS的语法非常相似，结合jQuery类库的方法你可以很方便快速地定位页面中任何元素。理解jQuery选择器是高效使用jQuery类库的关键。本索引卡就将jQuery选择器强大的功能展现在你眼前。

典型的jQuery语法格式如下：

{% highlight javascript %} 
	$(selector).methodName();
{% endhighlight %} 

selector是一个字符串表达式，用于将符合的DOM元素放到集合中，以供jQuery类库方法使用。

多个jQuery操作可以以链的形式串起来：

{% highlight javascript %} 
	$(selector).method1().method2().method3();
{% endhighlight %} 

比如，要隐藏id为goAway的DOM元素，并且为其添加名为incognito的样式。实现如下：

{% highlight javascript %} 
	$('#goAway').hide().addClass('incognito');
{% endhighlight %} 

使用起来非常简单，这就是选择器表达式的强大之处。

<blockquote>
应用中通过选择器获取到的元素集合可以方便的当做JavaScript数组处理。尤其在希望通过数组下表直接访问包装集合中元素的时候。<br>

比如：<br>

var element = $('img')[0];<br>

它会将element指向通过选择器获取到的包装集合的第一个元素。<br>
</blockquote>



<h3 class="headline"><a name="types">jQuery选择器种类</a></h3>

jQuery选择器有三种：基本的CSS选择器、位置选择器和自定义选择器。

由于基本选择器用来查找DOM中的元素，又名查找选择器。位置选择器和自定义选择器则用于过滤元素(默认为DOM的全部元素)得名过滤选择器。


<h4 class="headline1"><a name="basic">基本的CSS选择器</a></h4>

这些选择器遵循标准CSS3的语法和语义。

<table>
	<thead>
		<tr>
			<th class="th_left">语法</th>
			<th class="th_right">描述</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="td_left">*</td>
			<td class="td_right">匹配所有元素</td>
		</tr>
		<tr>
			<td class="td_left">E</td>
			<td class="td_right">匹配所有E元素</td>
		</tr>
		<tr>
			<td class="td_left">E F</td>
			<td class="td_right">匹配所有F元素，F为E元素的后代</td>
		</tr>
		<tr>
			<td class="td_left">E&gt;F</td>
			<td class="td_right">匹配所有F元素，F作为E元素的直接孩子</td>
		</tr>
		<tr>
			<td class="td_left">E+F </td>
			<td class="td_right">匹配所有F元素，F为E元素的直接后兄弟(紧挨着E元素后面出现)</td>
		</tr>
		<tr>
			<td class="td_left">E~F</td>
			<td class="td_right">匹配所有F元素，F为E元素的后兄弟</td>
		</tr>
		<tr>
			<td class="td_left">E:has(F)</td>
			<td class="td_right">匹配所有E元素，E至少有一个后代为F元素</td>
		</tr>
		<tr>
			<td class="td_left">E.c</td>
			<td class="td_right">
				匹配所有E元素，E有class名字为c
				忽略E的话，与*.c一样
			</td>
		</tr>
		<tr>
			<td class="td_left">E#i</td>
			<td class="td_right">
				匹配所有E元素，E的id属性值为i
				忽略E的话，与*#i一样
			</td>
		</tr>
		<tr>
			<td class="td_left">E[a]</td>
			<td class="td_right">匹配所有E元素，E有一个a属性，取值不限</td>
		</tr>
		<tr>
			<td class="td_left">E[a=v]</td>
			<td class="td_right">匹配所有E元素，E有一个a属性，并且值必须为v</td>
		</tr>
		<tr>
			<td class="td_left">E[a^=v]</td>
			<td class="td_right">匹配所有E元素，E有一个a属性，并且属性值以v开头</td>
		</tr>
		<tr>
			<td class="td_left">E[a$=v]</td>
			<td class="td_right">匹配所有E元素，E有一个a属性，并且属性值以v结束</td>
		</tr>
		<tr>
			<td class="td_left">E[a*=v]</td>
			<td class="td_right">匹配所有E元素，E有一个a属性，并且属性值中包含v</td>
		</tr>
	</tbody>
</table>		

示例

<ul id="ul">
	<li>$('div') 获取全部div元素</li>
	<li>$('fieldset a') 获取全部包含在&lt;fieldset&gt;中的&lt;a&gt;元素</li>
	<li>$('li&gt;p') 获取全部&lt;p&gt;元素，&lt;p&gt;元素为&lt;li&gt;元素的直接孩子</li>
	<li>$('div~p') 获取去全部&lt;div&gt;元素，&lt;div&gt;紧挨着&lt;p&gt;元素出现</li>
	<li>$('p:has(b)') 获取全部包含&lt;b&gt;的&lt;p&gt;元素</li>
	<li>$('div.someClass') 获取全部&lt;div&gt;元素，&lt;div&gt;包含样式名为someClass的class</li>
	<li>$('.someClass') 获取全部包含someClass样式名的元素</li>
	<li>$('#testButton') 获取id为testButton的元素</li>
	<li>$('img[alt]') 获取全部拥有alt属性的&lt;img&gt;元素</li>
	<li>$('a[href$=.pdf]') 获取全部&lt;a&gt;元素，&lt;a&gt;元素的href属性以.pdf结尾</li>
	<li>$('button[id*=test]') 获取全部&lt;button&gt;元素， &lt;button&gt;元素id属性值中包含test</li>
</ul>


在一个$()中可以使用多个选择器，用逗号分隔即可。比如下面获取全部&lt;div&gt;和&lt;p&gt;元素的表达式：

{% highlight javascript %} 
	$('div,p')
{% endhighlight %} 

下面这个则匹配所有有title属性的&lt;div&gt;元素和有alt属性的&lt;img&gt;:

{% highlight javascript %} 
	$('div[title],img[alt]')
{% endhighlight %} 



本文来自DZone，作者为：Bear Bibeault & Yehuda Katz

原文链接：<a href="http://refcardz.dzone.com/refcardz/jquery-selectors" target="_blank">http://refcardz.dzone.com/refcardz/jquery-selectors</a>

<style type="text/css">
		#catalog li{ 
			list-style: none;
			line-height: 25px;
			font-family: "Microsoft YaHei" ! important;
		 } 

		.headline { 
			background-color: #B2073B;
			color: white;
			padding: .4em;
			border-bottom: 1px solid black;
			text-transform: uppercase;
			margin-left: .5em;
			margin-right: .5em;
			line-height: 1em;
		 } 

		.headline1 { 
			background-color: #B2073B;
			color: white;
			padding: .4em;
			border-bottom: 1px solid black;
			text-transform: uppercase;
			margin-left: 1em;
			margin-right: 1em;
			line-height: 1em;
		 } 

		thead th{ 
			border-bottom: 1px solid;
			color: #494949;
			font-weight: bold;
		 } 

		.th_left {
			background-color: #A3D8F5;
		 } 
		.td_left { 
			background-color: #D9EBFB
		 } 
		.th_right { 
			background-color: #FFEFBC;
		 } 
		.td_right { 
			background-color: #FFF7DC
		 } 

		table { 
			border-collapse: collapse;
			border-spacing: 0;
			border: 1px solid;
			margin-left: 10px;
		 } 
		td, th {
			border: 1px solid;
			padding: 5px;
		 } 

		#ul li { 
			list-style-type:square;
			margin: 5px;
		 }

		 h3 a, h4 a {
		 	color: #fff;
		 }
</style>