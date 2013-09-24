---
layout: post
title: "Java编译器（一）：实例字段初始化趣事"
keywords: Java,Javac,instance filed
---

不知道大家有没有在`github`上发现这样一个工程：<a href="https://github.com/codefollower/Javac-Research" target="_blank">Javac-Research</a>，就同它的名字一样，是关于Javac代码的一些研究。博主的研究很深，是淘宝的前员工，是否还有人记得在javaeye上轰动一时的那个`Douyu`开源项目，也是出自此人。他对技术的热衷程度很高，因为关注了其微博，得知他目前在老家做一个自由的开发人员，貌似在研究HBase，都挺深入的。是我崇拜的牛人，过着我向往的生活。说远了，光顾拍马屁了。->_->  

言归正传，为什么不选择直接看原始的代码，而要研究这个工程呢？原因也很简单，因为这位仁兄在自己研究的过程中写了非常多的注释，这个对于刚研究Javac代码的人来说就像打网游时打到了顶级装备一样，另外一点是省的自己去编译Javac了。所以如果对Java编译器感兴趣，推荐使用这个工程做研究。他还多多少少写了些总括性的东西，自己去看吧。本文要阐述的是编译器是如何处理实例变量的初始化问题的，也是从代码附带的注释中注意到这个问题的，之前根本就没想过，看到注释后一下子就激发了我的兴趣。我做的工作仅仅是使用一个示例进一步阐述如下的注释：

<blockquote>
    /*
        实例字段初始化细节问题:<br/>
        编译器在编译期间，会把实例字段的初始代码(initializer code)放入所<br/>
        有第一条语句不是“this(可选参数)”调用的构造方法(constructor)中,<br/>
        当JVM调用某一个构造方法生成此类的新实例时，实例字段的初始代码就被执行了。<br/>
        <br/>
        举例:对于如下的源代码片断<br/>
        private Option[] recognizedOptions = initializer code......<br/>
        <br/>
        public Main(String name, PrintWriter out) {<br/>
            this.ownName = name;<br/>
            this.out = out;<br/>
        }<br/>
        编译器在编译期间会重新调整成类似下面这样(只为了方便理解，实际并不完全相同):<br/>
        public Main(String name, PrintWriter out) {<br/>
            recognizedOptions = initializer code......//总是在其他语句之前<br/>
            this.ownName = name;<br/>
            this.out = out;<br/>
        }<br/>
        更多细节参考:com.sun.tools.javac.jvm.Gen类的normalizeDefs()方法的内部实现<br/>
    */

</blockquote>

先瞄一眼示例代码：
{% highlight java %}
    @SuppressWarnings("unused")
    public class Test {
        
        
        static {
            final int a = 100;
            int b = 200;
        }
        
        {
            int c = 90;
            int d = 100;
        }
        
        {
            int e,f;
        }
        
        static {
            int g,h;
        }
        
        private String he = "hello";

        private static final int count = 1;
        
        private static final int count1 = 2;

        private int tree = 2;

        private int forest;
        
        private static int sea = 3;
        
        private final int ocean = 4;
        
        private static int i;
        
        public Test(){
            
        }
        
        public Test(int forest){
            this.forest = forest;
        }
        
        public Test(int forest, int tree){
            this.forest = forest;
            this.tree = tree;
        }
        
        public Test(int forest, int tree, String hello){
            this(forest, tree);
            this.he = hello;
        }

        public String getHe() {
            return he;
        }

        public void setHe(String he) {
            this.he = he;
        }

        public int getTree() {
            return tree;
        }

        public void setTree(int tree) {
            this.tree = tree;
        }

        public int getForest() {
            return forest;
        }

        public void setForest(int forest) {
            this.forest = forest;
        }
    }
{% endhighlight %}
通过这个示例笔者想阐述两个问题：

1.实例化变量是通过什么手段初始化的<br/>
2.`final static`描述的基本类型变量是如何处理的

####实例变量的初始化是如何实现的
容笔者再啰嗦下，实例变量初始化是指定义实例变量的同时赋予了默认值，比如示例代码中的tree实例变量。
`normalizeDefs()`方法中定义了三种结构：`initCode`，`clinitCode`，`methodDefs`。`initCode`存放需要放入实例构造函数中的代码，`clinitCode`则是存放需放入类构造函数中的代码（非`final`的静态变量以及静态块），`methodDefs`则存放所有的方法，包括构造函数以及业务方法。

为什么这样搞呢？首先呢，实例变量的初始化是放在实例构造函数中，而类变量的初始化则需要在类构造函数中实现；其次是将实例变量初始化放入实例构造函数中时需要借助`methodDefs`，从中找到实例构造函数；最后，不难发现`normalizeDefs()`函数的返回值是`List<JCTree>`，也是`methodDefs`。当然还可能有其他原因，笔者只能分析出这几个原因，基于这些原因分解成这三中结构还是合理的。

下面就来一点一点剖析`normalizeDefs()`方法：

每一个`JCTree`被分割成三种不同情况分别处理：`JCTree.BLOCK`为代码块，包含静态代码块和非静态代码块；`JCTree.METHODDEF`为方法定义；`JCTree.VARDEF`为字段。

<b>JCTree.BLOCK</b>

这个tag中主要用来处理代码块，包括普通代码块和静态代码块。静态代码块放到`clinitCode`结构中，普通代码块放入`initCode`结构中。逻辑是比较简单的，实现如下：
{% highlight java %}
    case JCTree.BLOCK:
        JCBlock block = (JCBlock)def;
        DEBUG.P("block.flags="+Flags.toString(block.flags));
        if ((block.flags & STATIC) != 0)
            clinitCode.append(block);
        else
            initCode.append(block);
            break;
{% endhighlight %}
<b>JCTree.METHODDEF</b>

这个tag就更简单了，如果定义的方法，直接放入`JCTree.METHODDEF`结构。

<b>JCTree.VARDEF</b>

这个tag就稍微复杂些了，它又分成了三种情况：实例变量，静态变量（类变量）和常量。实例变量自然会放入`initCode`结构，静态变量（非`final`的）会放入`clinitCode`结构，常量呢仅仅是做一个检查，而且只检查字符串，目的是校验字符串是否超过最大长度。实现如下：
{% highlight java %}
    if ((sym.flags() & STATIC) == 0) {
        // Always initialize instance variables.
        JCStatement init = make.at(vdef.pos()).
            Assignment(sym, vdef.init);
        initCode.append(init);
        if (endPositions != null) {
            Integer endPos = endPositions.remove(vdef);
            if (endPos != null) endPositions.put(init, endPos);
        }
    } else if (sym.getConstValue() == null) {
    // Initialize class (static) variables only if
        // they are not compile-time constants.
        JCStatement init = make.at(vdef.pos).
            Assignment(sym, vdef.init);

        DEBUG.P("");
        DEBUG.P("init="+init);
        clinitCode.append(init);
        if (endPositions != null) {
            Integer endPos = endPositions.remove(vdef);
            if (endPos != null) endPositions.put(init, endPos);
        }
    } else {//只有已初始化的static final类型变量才是compile-time constants
        checkStringConstant(vdef.init.pos(), sym.getConstValue());
    }
{% endhighlight %}
整个`List<JCTree> defs`遍历之后，这三个结构对应的内容也就填充完毕。下面是将对应的结构放入实例构造函数和类构造函数，最后返回最新的`methodDefs`。

首先是将`initCode`放入到实例构造函数中，注意这里是第一句为非`this(xxxx)`的构造函数，比如示例中这个构造函数就不会处理：
{% highlight java %}
    public Test(int forest, int tree, String hello){
        this(forest, tree);
        this.he = hello;
    }
{% endhighlight %}
同样，处理实例变量初始化还是最复杂的，实现如下：
{% highlight java %}
    // Insert any instance initializers into all constructors.
    if (initCode.length() != 0) {
        List<JCStatement> inits = initCode.toList();
        for (JCTree t : methodDefs) {
            normalizeMethod((JCMethodDecl)t, inits);
        }
    }
{% endhighlight %}
遍历所有方法，然后将所有逻辑都封装到`normalizeMethod((JCMethodDecl)t, inits)`中。

其次是将`clinitCode`放入到类构造函数中，如果代码中存在静态块儿或者非`final`静态变量，就创建一个类构造函数，然后将`clinitCode`内容一股脑放入类构造函数中，最后在追加到`methodDefs`中，就处理完毕。
{% highlight java %}
    // If there are class initializers, create a &lt;clinit&gt; method
    // that contains them as its body.
    if (clinitCode.length() != 0) {
        MethodSymbol clinit = new MethodSymbol(
        STATIC, names.clinit,
        new MethodType(
            List.<Type>nil(), syms.voidType,
            List.<Type>nil(), syms.methodClass),
        c);
        c.members().enter(clinit);
        List<JCStatement> clinitStats = clinitCode.toList();
        JCBlock block = make.at(clinitStats.head.pos()).Block(0, clinitStats);
        block.endpos = TreeInfo.endPos(clinitStats.last());
        methodDefs.append(make.MethodDef(clinit, block));
        DEBUG.P("c.members()="+c.members());
    }
{% endhighlight %}
最后返回`methodDefs.toList()`。

这样需要在实例构造函数和类构造函数中完成初始化的字段就都按需放入对应的位置。瞻仰下代码全貌：
{% highlight java%}
    /** Distribute member initializer code into constructors and &lt;clinit&gt;
     *  method.
     *  @param defs         The list of class member declarations.
     *  @param c            The enclosing class.
     */
    List<JCTree> normalizeDefs(List<JCTree> defs, ClassSymbol c) {
        DEBUG.P(this,"normalizeDefs(2)",Line.getLine());
        DEBUG.P("c="+c);
        
        ListBuffer<JCStatement> initCode = new ListBuffer<JCStatement>();
        ListBuffer<JCStatement> clinitCode = new ListBuffer<JCStatement>();
        ListBuffer<JCTree> methodDefs = new ListBuffer<JCTree>();
        // Sort definitions into three listbuffers:
        //  - initCode for instance initializers
        //  - clinitCode for class initializers
        //  - methodDefs for method definitions
        for (List<JCTree> l = defs; l.nonEmpty(); l = l.tail) {
            JCTree def = l.head;
            DEBUG.P("");
            DEBUG.P("def.tag="+def.myTreeTag());
            switch (def.tag) {
                case JCTree.BLOCK:
                    JCBlock block = (JCBlock)def;
                    DEBUG.P("block.flags="+Flags.toString(block.flags));
                    if ((block.flags & STATIC) != 0)
                        clinitCode.append(block);
                    else
                        initCode.append(block);
                        break;
                case JCTree.METHODDEF:
                    methodDefs.append(def);
                    break;
                case JCTree.VARDEF:
                    JCVariableDecl vdef = (JCVariableDecl) def;
                    VarSymbol sym = vdef.sym;
                    DEBUG.P("sym="+sym);
                    DEBUG.P("vdef.init="+vdef.init);
                    checkDimension(vdef.pos(), sym.type);//检查变量的类型是否是多维数组，如果是，则维数不能大于255
                    if (vdef.init != null) {
                        DEBUG.P("");
                        DEBUG.P("sym.getConstValue()="+sym.getConstValue());
                        DEBUG.P("sym.flags()="+Flags.toString(sym.flags()));
                        if ((sym.flags() & STATIC) == 0) {
                            // Always initialize instance variables.
                            JCStatement init = make.at(vdef.pos()).
                                Assignment(sym, vdef.init);
                            initCode.append(init);
                            if (endPositions != null) {
                                Integer endPos = endPositions.remove(vdef);
                                if (endPos != null) endPositions.put(init, endPos);
                            }
                        } else if (sym.getConstValue() == null) {
                        // Initialize class (static) variables only if
                            // they are not compile-time constants.
                            JCStatement init = make.at(vdef.pos).
                                Assignment(sym, vdef.init);

                            DEBUG.P("");
                            DEBUG.P("init="+init);
                            clinitCode.append(init);
                            if (endPositions != null) {
                                Integer endPos = endPositions.remove(vdef);
                                if (endPos != null) endPositions.put(init, endPos);
                            }
                        } else {//只有已初始化的static final类型变量才是compile-time constants
                            checkStringConstant(vdef.init.pos(), sym.getConstValue());
                        }
                    }
                    break;
                default:
                    assert false;
            }
        }
        
        DEBUG.P(2);
        DEBUG.P("initCode="+initCode.toList());
        DEBUG.P("clinitCode="+clinitCode.toList());
        // Insert any instance initializers into all constructors.
        if (initCode.length() != 0) {
            List<JCStatement> inits = initCode.toList();
            for (JCTree t : methodDefs) {
                normalizeMethod((JCMethodDecl)t, inits);
            }
        }
        // If there are class initializers, create a <clinit> method
        // that contains them as its body.
        if (clinitCode.length() != 0) {
            MethodSymbol clinit = new MethodSymbol(
            STATIC, names.clinit,
            new MethodType(
                List.<Type>nil(), syms.voidType,
                List.<Type>nil(), syms.methodClass),
            c);
            c.members().enter(clinit);
            List<JCStatement> clinitStats = clinitCode.toList();
            JCBlock block = make.at(clinitStats.head.pos()).Block(0, clinitStats);
            block.endpos = TreeInfo.endPos(clinitStats.last());
            methodDefs.append(make.MethodDef(clinit, block));
            DEBUG.P("c.members()="+c.members());
        }
        DEBUG.P(0,this,"normalizeDefs(2)");
        // Return all method definitions.
        return methodDefs.toList();
    }
{% endhighlight %}
笔者在调试过程中注意到两个有意思的地方：

1.代码块<br/>
代码块分为普通的代码块和静态代码块，只要是代码块，不论块内容是否有需要初始化字段都会被当做实例字段或静态变量一样放入实例构造函数或者类构造函数。
{% highlight java %}
	{
	    int e,f;
	}
{% endhighlight %}
尽管这个代码块中只是定义了两个整型变量，没有进行初始化，它还是会被放到所有第一句不是`this(xxx)`的实例构造函数中。
{% highlight java %}
	static {
	    int g,h;
	}
{% endhighlight %}
同样，这个静态代码块也会被放入类构造函数中。

2.字段<br/>
与代码块不同，类中的实例变量和类变量只要没有初始化动作就不会进行处理。因为有这样一个限制：`vdef.init != null`，如果没有进行初始化那么`vdef.init`就是空。

还有前面一直强调非`final`的静态变量，为什么呢？因为`final`的静态变量`normalizeDefs()`方法是没有处理的，被直接写入指令中。但是`final`的变量会被当做普通变量来处理。至于`final`的静态变量如何写入指令还是放到下篇吧，由于代码占用了非常多的篇幅，有些太长了。

那么文章开头示例经过`normalizeDefs()`方法一通折腾后会变成什么样子呢？
{% highlight java %}
    
    @SuppressWarnings(value = "unused")
    public class Test {
        
        public Test() {
            super();
            {
                int c = 90;
                int d = 100;
            }
            {
                int e;
                int f;
            }
            he = "hello";
            tree = 2;
            ocean = 4;
        }
        
        public Test(int forest) {
            super();
            {
                int c = 90;
                int d = 100;
            }
            {
                int e;
                int f;
            }
            he = "hello";
            tree = 2;
            ocean = 4;
            this.forest = forest;
        }
        
        public Test(int forest, int tree) {
            super();
            {
                int c = 90;
                int d = 100;
            }
            {
                int e;
                int f;
            }
            he = "hello";
            tree = 2;
            ocean = 4;
            this.forest = forest;
            this.tree = tree;
        }
        
        public Test(int forest, int tree, String hello) {
            this(forest, tree);
            this.he = hello;
        }
        
        public String getHe() {
            return he;
        }
        
        public void setHe(String he) {
            this.he = he;
        }
        
        public int getTree() {
            return tree;
        }
        
        public void setTree(int tree) {
            this.tree = tree;
        }
        
        public int getForest() {
            return forest;
        }
        
        public void setForest(int forest) {
            this.forest = forest;
        }
        
        static void <clinit>() {
            static {
                final int a = 100;
                int b = 200;
            }
            static {
                int g;
                int h;
            }
            sea = 3;
        }
    }
{% endhighlight %}
