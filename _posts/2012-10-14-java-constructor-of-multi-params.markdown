---
layout: post
title: "多参数构造函数优化"
category: Java
tags:
 - Java
 - Builder
keywords: Java,构造函数,Builder设计模式
---
Just say nothing, show you the code!

{% highlight java %}
/**
 * 针对多参数构造函数的优化
 * 
 * 在构造一个属性很多,又包含必选属性与可选属性时,
 * 单单依靠重载构造函数会非常的混乱,可读性差,而且维护成本也很高.
 * 针对这几点,借助Builder设计模式的力量简化复杂对象的创建.
 * 
 * @author liuxiaori
 * @date 2012-10-12
 */
public class Person {

	// required fields
	private long id; // id
	private String name; // 姓名
	private long idCard; // 身份证号

	// optional fields
	private String gender; // 性别
	private int age; // 年龄
	private String mobile; // 移动电话
	private String telephone; // 固定电话
	private String homeAddress; // 家庭住址
	private String workAddress; // 工作地点

	/**
	 *
	 *通过PersonBuilder构造Person对象
	 *
	 * @param builder
	 */
	private Person(PersonBuilder builder) {
		this.id = builder.id;
		this.idCard = builder.idCard;
		this.name = builder.name;
		this.gender = builder.gender;
		this.age = builder.age;
		this.mobile = builder.mobile;
		this.telephone = builder.telephone;
		this.homeAddress = builder.homeAddress;
		this.workAddress = builder.workAddress;
	}

	//getter methods
	public long getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public long getIdCard() {
		return idCard;
	}

	public String getGender() {
		return gender;
	}

	public int getAge() {
		return age;
	}

	public String getMobile() {
		return mobile;
	}

	public String getTelephone() {
		return telephone;
	}

	public String getHomeAddress() {
		return homeAddress;
	}

	public String getWorkAddress() {
		return workAddress;
	}

	/**
	 * 
	 * *Person类中有很多字段,其中有必须赋值和可选赋值的字段.
	 * 那么在构造Person的时候可选字段就会很混乱,不需要的字段就需要指定对应类型的默认值.
	 * <code>new Person(100l, "刘松", 294840583739558888l,"男", 0, "", "", "", "");</code>
	 * 要么就要提供多种重载的构造函数,很混乱.两种方式都不理想.这样PersonBuilder就产生了.
	 * 
	 * @author liuxiaori
	 *
	 */
	public static class PersonBuilder {
		// required fields
		private long id;
		private String name;
		private long idCard;

		// optional fields
		private String gender = "";
		private int age = 0;
		private String mobile = "";
		private String telephone = "";
		private String homeAddress = "";
		private String workAddress = "";

		//必选字段初始化
		public PersonBuilder(long id, String name, long idCard) {
			this.id = id;
			this.name = name;
			this.idCard = idCard;
		}

		//为可选字段提供初始化入口,返回值为PersonBuilder
		public PersonBuilder gender(String gender) {
			this.gender = gender;
			return this;
		}

		public PersonBuilder age(int age) {
			this.age = age;
			return this;
		}

		public PersonBuilder mobile(String mobile) {
			this.mobile = mobile;
			return this;
		}

		public PersonBuilder telephone(String telephone) {
			this.telephone = telephone;
			return this;
		}

		public PersonBuilder homeAddress(String homeAddress) {
			this.homeAddress = homeAddress;
			return this;
		}

		public PersonBuilder workAddress(String workAddress) {
			this.workAddress = workAddress;
			return this;
		}

		//利用Person的私有构造函数构建Person对象
		public Person build() {
			return new Person(this);
		}
	}

	/**
	 * 测试用例
	 * @param args
	 */
	public static void main(String[] args) {
		Person p = new Person.PersonBuilder(1000l, "刘送", 20038474949l).gender(
				"男").age(40).workAddress("北京市朝阳区大屯路").homeAddress("北京市昌平区")
				.build();

		System.out.println("home address of " + p.getName() + ": "
				+ p.homeAddress);
		System.out.println("work address of " + p.getName() + ": "
				+ p.workAddress);
	}
}
{% endhighlight %}

代码放在gist上共享了，<a href="https://gist.github.com/3877805">这里</a>
