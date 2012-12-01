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

<h4 class="headline1"><a name="position">位置选择器</a></h4>

这些选择器的匹配是基于元素之间的相对位置。这些选择器也可以追加到基本选择器(用B表示)后面，基于位置再次过滤元素。如果不考虑B则等同于*(全部元素)。

<table>
	<thead>
		<tr>
			<th class="th_left">语法</th>
			<th class="th_right">描述</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="td_left">B:first</td>
			<td class="td_right">获取B选择器获取的元素集合中的第一个元素</td>
		</tr>
		<tr>
			<td class="td_left">B:last</td>
			<td class="td_right">获取B选择器获取的元素集合中的最后一个元素</td>
		</tr>
		<tr>
			<td class="td_left">B:first-child</td>
			<td class="td_right">获取全部B元素，B为父元素的第一个孩子</td>
		</tr>
		<tr>
			<td class="td_left">B:last-child</td>
			<td class="td_right">获取全部B元素，B为父元素的最后一个孩子</td>
		</tr>
		<tr>
			<td class="td_left">B:only-child</td>
			<td class="td_right">获取全部B元素，B为父元素仅有的孩子</td>
		</tr>
		<tr>
			<td class="td_left">B:nth-child(n)</td>
			<td class="td_right">获取全部B元素，B为父元素的第n个孩子，n从1开始</td>
		</tr>
		<tr>
			<td class="td_left">B:nth-child(odd|even)</td>
			<td class="td_right">
				获取全部B元素，B元素为第奇数或偶数个孩子
				第一个孩子被算作奇数
			</td>
		</tr>
		<tr>
			<td class="td_left">B:nth-child(Xn+Y)</td>
			<td class="td_right">
				获取全部满足表达式(x*序号+y偏移值)的B元素，y为0则被忽略
			</td>
		</tr>
		<tr>
			<td class="td_left">B:even</td>
			<td class="td_right">
				获取B选择器获取的元素集合中的序号为偶数元素
			</td>
		</tr>
		<tr>
			<td class="td_left">B:odd</td>
			<td class="td_right">获取B选择器获取的元素集合中的序号为奇数元素</td>
		</tr>
		<tr>
			<td class="td_left">B:eq(n)</td>
			<td class="td_right">获取B选择器获取的元素集合中的第n个元素，从0开始</td>
		</tr>
		<tr>
			<td class="td_left">B:gt(n)</td>
			<td class="td_right">获取B选择器获取的元素集合中的序号大于n的元素，从0开始</td>
		</tr>
		<tr>
			<td class="td_left">B:lt(n)</td>
			<td class="td_right">获取B选择器获取的元素集合中的序号小于n的元素，从0开始</td>
		</tr>
	</tbody>
</table>				

示例

<ul id="ul">
	<li>$('p:first') 获取页面中的第一个&lt;p&gt;</li>
	<li>$('img[src$=.png]:first') 获取第一个scr以.png结尾的&lt;img&gt;元素</li>
	<li>$('button.small:last') 获取最后一个有small样式名的&lt;button&gt;</li>
	<li>$('li:first-child') 获取每个列表中第一个&lt;li&gt;</li>
	<li>$('a:only-child') 获取全部&lt;a&gt;元素，&lt;a&gt;元素为父元素仅有的孩子</li>
	<li>$('li:nth-child(2)') 获取全部列表中第二个&lt;li&gt;元素</li>
	<li>$('tr:nth-child(odd)') 获取表格中序号为偶数的&lt;tr&gt;元素</li>
	<li>$('div:nth-child(5n)') 获取全部序号为5的&lt;div&gt;元素</li>
	<li>$('div:nth-child(5n+1)') 获取全部序号5n后面的元素</li>
	<li>$('.someClass:eq(1)') 获取第二个样式名为someClass的元素</li>
	<li>$('.someClass:gt(1)') 获取除前两个之外所有样式名为someClass的元素</li>
	<li>$('.someClass:lt(4)') 获取前四个样式名为someClass的元素</li>
</ul>

<blockquote>
	注意：:nth-child选择器获取的结果集合序号从1开始，而:eq,:gt和:lt选择器获取的结果集合从0开始。
</blockquote>

<h4 class="headline1"><a name="custom">jQuery自定义选择器</a></h4>

自定义选择器是为了那些经常使用，并且CSS规范中没有提供而被jQuery支持的。比如位置选择器，这些选择器在基本选择器获取的结果集合的基础上再次过滤。下面来看一些强大的选择器组合。

<table>
	<thead>
		<tr>
			<th class="th_left">语法</th>
			<th class="th_right">描述</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="td_left">B:animated</td>
			<td class="td_right">获取B选择器获取的元素集合中，并且在jQuery动画方法控制下的元素</td>
		</tr>
		<tr>
			<td class="td_left">B:button</td>
			<td class="td_right">
				获取B选择器获取的元素集合中为button类型的元素
				包括button，input[type=submit], input[type=reset]和input[type=button]
			</td>
		</tr>
		<tr>
			<td class="td_left">B:checkbox</td>
			<td class="td_right">获取B选择器获取的元素集合中input[type=checkbox]类型的元素</td>
		</tr>
		<tr>
			<td class="td_left">B:enabled</td>
			<td class="td_right">获取B选择器获取的元素集合中enabled状态的元素</td>
		</tr>
		<tr>
			<td class="td_left">B:file</td>
			<td class="td_right">获取B选择器获取的元素集合中input[type=file]类型的元素</td>
		</tr>
		<tr>
			<td class="td_left">B:header</td>
			<td class="td_right">获取B选择器获取的元素集合中从&lt;h1&gt;到&lt;h6&gt;类型的元素</td>
		</tr>
		<tr>
			<td class="td_left">B:hidden</td>
			<td class="td_right">
				获取B选择器获取的元素集合中hidden状态的元素
			</td>
		</tr>
		<tr>
			<td class="td_left">B:image</td>
			<td class="td_right">
				获取B选择器获取的元素集合中input[type=image]类型的元素
			</td>
		</tr>
		<tr>
			<td class="td_left">B:input</td>
			<td class="td_right">
				获取B选择器获取的元素集合中&lt;input&gt;, &lt;select&gt;,&lt;textarea&gt;和&lt;button&gt;类型的元素
			</td>
		</tr>
		<tr>
			<td class="td_left">B:not(f)</td>
			<td class="td_right">获取B选择器获取的元素集合中不匹配选择器f的元素</td>
		</tr>
		<tr>
			<td class="td_left">B:parent</td>
			<td class="td_right">获取B选择器获取的元素集合中含有子元素的元素</td>
		</tr>
		<tr>
			<td class="td_left">B:password</td>
			<td class="td_right">获取B选择器获取的元素集合中input[type=password]类型的元素</td>
		</tr>
		<tr>
			<td class="td_left">B:radio</td>
			<td class="td_right">获取B选择器获取的元素集合中input[type=radio]类型的元素</td>
		</tr>
		<tr>
			<td class="td_left">B:reset</td>
			<td class="td_right">获取B选择器获取的元素集合中input[type=reset]或button[type=reset]类型的元素</td>
		</tr>
		<tr>
			<td class="td_left">B:selected</td>
			<td class="td_right">获取B选择器获取的元素集合中选中状态的元素，只有&lt;option&gt;元素才有这个状态</td>
		</tr>
		<tr>
			<td class="td_left">B:submit</td>
			<td class="td_right">获取B选择器获取的元素集合中input[type=submit]或button[type=submit]类型的元素</td>
		</tr>
		<tr>
			<td class="td_left">B:text</td>
			<td class="td_right">获取B选择器获取的元素集合中input[type=text]类型的元素</td>
		</tr>
		<tr>
			<td class="td_left">B:visible</td>
			<td class="td_right">获取B选择器获取的元素集合中状态不为hidden的元素</td>
		</tr>
	</tbody>
</table>
						
示例

<ul id="ul">

	<li>$('img:animated') 获取所有刚刚经历完动画方法调用的&lt;img&gt;元素</li>
	<li>$(':button:hidden') 获取所有被隐藏的button元素</li>
	<li>$('input[name=myRadioGroup]:radio:checked') 获取所有name属性为myRadioGroup并且为checked状态的radio元素</li>
	<li>$(':text:disabled') 获取所有不能编辑的text元素</li>
	<li>$('#xyz p :header') 获取所有包含在id为xyz元素中&lt;p&gt;里面的header类型的元素，注意:header 前面有一个空格</li>
	<li>$('option:not(:selected)') 获取所有没有被选中的&lt;option&gt;元素</li>
	<li>$('#myForm button:not(.someClass)') 获取所有id为myForm的&lt;form&gt;中的&lt;button&gt;元素，并且&lt;button&gt;没有样式名为someClass的样式</li>
	<li>$('select[name=choices] :selected') 获取名字为choices的&lt;select&gt;元素中被选中的&lt;option&gt;元素</li>
	<li>$('p:contains(coffee)') 获取全部包含coffee文本的&lt;p&gt;元素</li>

</ul>

不论单独还是组合使用jQuery选择器，都可以很方便的获取一组元素，以供jQuery类库方法进行操作。

<h3 class="headline"><a name="method">匹配方法</a></h3>

尽管选择器为我们提供了非常灵活的过滤DOM的手段，但还是有时候单单使用选择器是没法表示匹配规则。而且我们可能也需要在方法调用见调整匹配元素的内容。

基于以上两点，jQuery提供了一些用于调整匹配元素的方法。本节将重点介绍这些方法。

<h4 class="headline1"><a name="add">添加新元素</a></h4>

add()方法用于向匹配元素集合中添加新元素。
<table>
	<thead>
		<tr>
			<th class="th_left" colspan="2">add(expression)</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="td_left">expression</td>
			<td class="td_right">
				String，如果是一个选择器就表示添加选择器匹配的所有元素，如果是html代码，则会添加新创建的DOM元素<br>
				Element，则添加引用的元素<br>
				Array，则添加数组中的全部元素<br>
			</td>
		</tr>
	</tbody>
</table>

add()方法返回一个新的匹配元素集合，原有匹配元素集合再加上参数表达式(不论是直接表达式还是选择器表达式)一起组成新的匹配集合。


来看看这个表达式：

{% highlight javascript %} 
	$('div').add('p').css('color','red');
{% endhighlight %} 

这段代码首先获取一个全部&lt;div&gt;元素的集合，然后又将现有的&lt;div&gt;元素集合加上&lt;p&gt;元素形成一个新的集合(所有的&lt;div&gt;和&lt;p&gt;元素)，最后为他们添加color=read的样式。

可是这样的代码完全没有什么意义，因为他和下面这句的效果一样：

{% highlight javascript %} 
	$('div,p').css('color','red');
{% endhighlight %} 

不过下面这句用选择器就搞不定了：

{% highlight javascript %} 
	$('div').css('font-weight','bold').add('p').css('color','red');
{% endhighlight %} 

首先将所有的&lt;div&gt;元素中内容都加粗，最后加入所有&lt;p&gt;元素后形成新的集合，最后增加color=read的样式。

jQuery的方法链可以用很简短的代码实现强大的功能。

再来一个例子：

{% highlight javascript %} 
	$('div').add(someElement).css('border','3px solid pink');
	$('div').add([element1,element2]).css('border','3px solid pink');
{% endhighlight %} 


<h4 class="headline1"><a name="delete">删除匹配元素</a></h4>

如果想冲匹配元素集合中删除元素要怎么办呢？这个正是not()方法的功能：

<table>
	<thead>
		<tr>
			<th class="th_left" colspan="2">not(expression)</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="td_left">expression</td>
			<td class="td_right">
				String, 从匹配集合中删除选择器参数匹配的元素<br>
				Element，从匹配集合中删除参数所引用的元素<br>
				Array，从匹配集合中删除数组中的元素<br>
			</td>
		</tr>
	</tbody>
</table>

和add()方法一样，not()方法也会返回一个新的元素集合，新集合中剔除表达式参数匹配的元素。参数可以使jQuery选择器，也可以是指向元素的引用。


示例

{% highlight javascript %} 
	$('body *').css('font-weight','bold').not('p').css('color','red');
{% endhighlight %} 

将所有元素的内容都加粗，然后把除&lt;p&gt;元素外的所有元素都添加color=read样式。

{% highlight javascript %} 
	$('body *').css('font-weight','bold').not(anElement).css('color','red');
{% endhighlight %} 

同上面那句类似，只不过剔除anElement元素在外。

<blockquote>
	为了避免初学者误用not方法，请注意，not()方法是在匹配元素集合中删除，而remove()方法则是在HTML的DOM元素的删除。
</blockquote>




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