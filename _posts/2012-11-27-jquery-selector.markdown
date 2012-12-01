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