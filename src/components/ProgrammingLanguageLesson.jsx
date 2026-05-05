import { useState, useRef, useEffect } from 'react';
import './ProgrammingLanguageLesson.css';

/* ──────────────────────────────────────────────
   汇编代码示例
   ────────────────────────────────────────────── */
const ASM_EXAMPLES = [
  {
    id: 'add',
    title: '两数相加',
    description: '将两个立即数加载到寄存器，相加后存入内存',
    code: `; ====== 两数相加 (x86 汇编) ======
section .data
    num1  dd 10        ; 定义第一个数 = 10
    num2  dd 20        ; 定义第二个数 = 20
    result dd 0        ; 保存结果

section .text
    global _start

_start:
    mov  eax, [num1]   ; 将 num1 装入 EAX
    add  eax, [num2]   ; EAX = EAX + num2
    mov  [result], eax ; 将结果存入 result

    ; 系统调用：退出程序
    mov  eax, 1        ; sys_exit
    xor  ebx, ebx      ; 返回码 0
    int  0x80           ; 调用内核`,
    steps: [
      { line: 5, text: '在数据段定义变量 num1 = 10', reg: {} },
      { line: 6, text: '在数据段定义变量 num2 = 20', reg: {} },
      { line: 7, text: '在数据段定义变量 result = 0', reg: {} },
      { line: 11, text: 'mov eax, [num1] → EAX = 10', reg: { EAX: 10 } },
      { line: 12, text: 'add eax, [num2] → EAX = 10 + 20 = 30', reg: { EAX: 30 } },
      { line: 13, text: 'mov [result], eax → result = 30', reg: { EAX: 30, result: 30 } },
    ],
  },
  {
    id: 'loop',
    title: '循环求和 1~N',
    description: '使用循环结构计算 1+2+...+N 的和',
    code: `; ====== 循环求和 1~N (x86 汇编) ======
section .data
    N      dd 5         ; 计算 1+2+3+4+5
    sum    dd 0         ; 累加结果

section .text
    global _start

_start:
    mov  ecx, [N]      ; ECX = N (循环计数器)
    xor  eax, eax      ; EAX = 0 (累加器清零)

.loop:
    add  eax, ecx      ; EAX = EAX + ECX
    loop .loop         ; ECX-- , 若 ECX≠0 则跳转

    mov  [sum], eax    ; 存储结果

    mov  eax, 1
    xor  ebx, ebx
    int  0x80`,
    steps: [
      { line: 5, text: '定义 N = 5', reg: {} },
      { line: 6, text: '定义 sum = 0', reg: {} },
      { line: 10, text: 'mov ecx, [N] → ECX = 5', reg: { ECX: 5, EAX: 0 } },
      { line: 11, text: 'xor eax, eax → EAX = 0', reg: { ECX: 5, EAX: 0 } },
      { line: 14, text: '第1次: add eax, ecx → EAX = 0+5 = 5, loop → ECX=4', reg: { ECX: 4, EAX: 5 } },
      { line: 14, text: '第2次: add eax, ecx → EAX = 5+4 = 9, loop → ECX=3', reg: { ECX: 3, EAX: 9 } },
      { line: 14, text: '第3次: add eax, ecx → EAX = 9+3 = 12, loop → ECX=2', reg: { ECX: 2, EAX: 12 } },
      { line: 14, text: '第4次: add eax, ecx → EAX = 12+2 = 14, loop → ECX=1', reg: { ECX: 1, EAX: 14 } },
      { line: 14, text: '第5次: add eax, ecx → EAX = 14+1 = 15, loop → ECX=0 退出', reg: { ECX: 0, EAX: 15 } },
      { line: 16, text: 'mov [sum], eax → sum = 15', reg: { ECX: 0, EAX: 15, sum: 15 } },
    ],
  },
  {
    id: 'compare',
    title: '比较与条件跳转',
    description: '比较两个数的大小，根据结果走不同分支',
    code: `; ====== 比较两数大小 (x86 汇编) ======
section .data
    a      dd 7
    b      dd 3
    msg_gt db "a > b", 10, 0
    msg_le db "a <= b", 10, 0

section .text
    global _start

_start:
    mov  eax, [a]      ; EAX = a
    cmp  eax, [b]      ; 比较 EAX 与 b
    jg   .greater      ; 若 a > b 则跳转

    ; a <= b 分支
    mov  eax, 4
    mov  ebx, 1
    mov  ecx, msg_le
    mov  edx, 6
    int  0x80
    jmp  .done

.greater:
    ; a > b 分支
    mov  eax, 4
    mov  ebx, 1
    mov  ecx, msg_gt
    mov  edx, 5
    int  0x80

.done:
    mov  eax, 1
    xor  ebx, ebx
    int  0x80`,
    steps: [
      { line: 5, text: '定义 a = 7', reg: {} },
      { line: 6, text: '定义 b = 3', reg: {} },
      { line: 11, text: 'mov eax, [a] → EAX = 7', reg: { EAX: 7 } },
      { line: 12, text: 'cmp eax, [b] → 比较 7 和 3，设置标志位', reg: { EAX: 7 } },
      { line: 13, text: 'jg .greater → 7 > 3 成立，跳转到 .greater', reg: { EAX: 7 } },
      { line: 24, text: '输出 "a > b"', reg: { EAX: 7 } },
    ],
  },
];

/* ──────────────────────────────────────────────
   C 语言代码示例
   ────────────────────────────────────────────── */
const C_EXAMPLES = [
  {
    id: 'hello',
    title: 'Hello World',
    description: 'C 语言最经典的入门程序',
    code: `#include <stdio.h>  // 引入标准输入输出头文件

int main(void) {
    printf("Hello, World!\\n");  // 输出字符串
    return 0;                     // 返回 0 表示成功
}`,
    concepts: [
      { line: 1, title: '预处理指令', detail: '#include 将头文件内容插入源文件，stdio.h 提供了 printf 等函数声明' },
      { line: 3, title: 'main 函数', detail: '程序入口，操作系统从这里开始执行。int 表示返回整数' },
      { line: 4, title: '函数调用', detail: 'printf 是标准库函数，将格式化字符串输出到终端' },
      { line: 5, title: '返回值', detail: 'return 0 通知操作系统程序正常结束' },
    ],
  },
  {
    id: 'function',
    title: '函数与指针',
    description: '通过指针交换两个变量的值——C 语言的灵魂',
    code: `#include <stdio.h>

// 交换两个整数的值（通过指针）
void swap(int *a, int *b) {
    int temp = *a;   // temp = *a 解引用
    *a = *b;         // *a = *b
    *b = temp;       // *b = temp
}

int main(void) {
    int x = 10, y = 20;
    printf("交换前: x=%d, y=%d\\n", x, y);

    swap(&x, &y);    // 传递 x 和 y 的地址
    printf("交换后: x=%d, y=%d\\n", x, y);

    return 0;
}`,
    concepts: [
      { line: 4, title: '指针参数', detail: 'int *a 声明 a 是指向 int 的指针，存储的是变量的地址' },
      { line: 5, title: '解引用', detail: '*a 获取指针 a 指向地址中存储的值' },
      { line: 13, title: '取地址运算符', detail: '&x 获取变量 x 在内存中的地址' },
      { line: 14, title: '传址调用', detail: '传递地址使得函数可以修改调用者的局部变量' },
    ],
  },
  {
    id: 'struct',
    title: '结构体与动态内存',
    description: '用结构体和 malloc 构建链表——面向过程的数据组织',
    code: `#include <stdio.h>
#include <stdlib.h>

// 定义链表节点
typedef struct Node {
    int data;
    struct Node *next;  // 指向下一个节点的指针
} Node;

// 创建新节点
Node* createNode(int data) {
    Node *n = (Node*)malloc(sizeof(Node));
    n->data = data;     // n->data 等价于 (*n).data
    n->next = NULL;
    return n;
}

// 打印链表
void printList(Node *head) {
    Node *cur = head;
    while (cur != NULL) {
        printf("%d -> ", cur->data);
        cur = cur->next;
    }
    printf("NULL\\n");
}

int main(void) {
    Node *head = createNode(1);
    head->next = createNode(2);
    head->next->next = createNode(3);
    printList(head);    // 1 -> 2 -> 3 -> NULL
    return 0;
}`,
    concepts: [
      { line: 6, title: '结构体定义', detail: 'struct 将多个不同类型的数据组合为一个自定义类型' },
      { line: 8, title: '自引用结构体', detail: 'next 指向同类型结构体，实现链式结构' },
      { line: 12, title: '动态内存分配', detail: 'malloc 在堆上分配内存，返回 void* 指针，需手动 free' },
      { line: 13, title: '箭头运算符', detail: 'n->data 是 (*n).data 的简写，通过指针访问成员' },
      { line: 21, title: '遍历链表', detail: '通过 cur = cur->next 逐节点移动，直到 NULL' },
    ],
  },
];

/* ──────────────────────────────────────────────
   HTML 代码示例 - 标记语言
   ────────────────────────────────────────────── */
const HTML_EXAMPLES = [
  {
    id: 'basic_structure',
    title: 'HTML 基本结构',
    description: '理解网页的骨架：文档类型、头部、主体和常用语义标签',
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <!-- 元数据区：告诉浏览器如何解析页面 -->
    <meta charset="UTF-8">          <!-- 字符编码 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的网站</title>         <!-- 页面标题 -->
    
    <!-- 引入样式 -->
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- 页面内容区 -->
    
    <!-- 导航 -->
    <header>
        <nav>
            <ul>
                <li><a href="/">首页</a></li>
                <li><a href="/about">关于</a></li>
                <li><a href="/contact">联系</a></li>
            </ul>
        </nav>
    </header>

    <!-- 主内容 -->
    <main>
        <article>
            <h1>欢迎来到我的网站</h1>
            <p>这是一段介绍文本。</p>
            <img src="image.jpg" alt="示例图片">
        </article>
    </main>

    <!-- 页脚 -->
    <footer>
        <p>© 2024 我的网站</p>
    </footer>
</body>
</html>`,
    concepts: [
      { line: 1, title: 'DOCTYPE', detail: '声明文档类型，告诉浏览器使用 HTML5 标准解析' },
      { line: 2, title: 'html 标签', detail: '根元素，包含整个 HTML 文档' },
      { line: 3, title: 'head 头部', detail: '存放元数据，不直接显示在页面上' },
      { line: 12, title: 'body 主体', detail: '页面可见内容区域' },
      { line: 15, title: '语义化标签', detail: 'header/nav/main/footer 等提供语义信息的标签' },
    ],
  },
  {
    id: 'forms',
    title: '表单交互',
    description: '使用 HTML 表单收集用户输入，与后端交互',
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>用户注册表单</title>
</head>
<body>
    <h2>用户注册</h2>
    
    <form action="/register" method="POST">
        <!-- 文本输入 -->
        <label for="username">用户名：</label>
        <input type="text" id="username" name="username" required minlength="3">
        
        <!-- 邮箱输入 -->
        <label for="email">邮箱：</label>
        <input type="email" id="email" name="email" required>
        
        <!-- 密码输入 -->
        <label for="password">密码：</label>
        <input type="password" id="password" name="password" required minlength="6">
        
        <!-- 单选按钮 -->
        <p>性别：</p>
        <input type="radio" id="male" name="gender" value="male">
        <label for="male">男</label>
        <input type="radio" id="female" name="gender" value="female">
        <label for="female">女</label>
        
        <!-- 下拉菜单 -->
        <label for="country">国家：</label>
        <select id="country" name="country">
            <option value="cn">中国</option>
            <option value="us">美国</option>
            <option value="jp">日本</option>
        </select>
        
        <!-- 复选框 -->
        <p>兴趣：</p>
        <input type="checkbox" id="coding" name="interest" value="coding">
        <label for="coding">编程</label>
        <input type="checkbox" id="music" name="interest" value="music">
        <label for="music">音乐</label>
        
        <!-- 文本域 -->
        <label for="bio">个人简介：</label>
        <textarea id="bio" name="bio" rows="4"></textarea>
        
        <!-- 提交按钮 -->
        <button type="submit">注册</button>
    </form>
</body>
</html>`,
    concepts: [
      { line: 10, title: 'form 标签', detail: '定义表单，action 指定提交地址，method 指定 HTTP 方法' },
      { line: 12, title: 'label 标签', detail: '关联输入控件，提高可访问性' },
      { line: 13, title: 'input 属性', detail: 'required 表示必填，minlength 表示最小长度' },
      { line: 28, title: 'select 下拉框', detail: '提供预定义选项供用户选择' },
      { line: 45, title: 'button 按钮', detail: 'type="submit" 提交表单' },
    ],
  },
];

/* ──────────────────────────────────────────────
   SQL 代码示例 - 数据库查询语言
   ────────────────────────────────────────────── */
const SQL_EXAMPLES = [
  {
    id: 'crud_operations',
    title: 'CRUD 基本操作',
    description: '增删改查：SQL 的四大基本操作',
    code: `-- ====== 创建表 ======
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,  -- 主键，自动递增
    username VARCHAR(50) NOT NULL,      -- 用户名，不能为空
    email VARCHAR(100) UNIQUE,          -- 邮箱，唯一
    age INT,                            -- 年龄
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- 创建时间
);

-- ====== INSERT：插入数据 ======
INSERT INTO users (username, email, age) 
VALUES ('张三', 'zhangsan@example.com', 25);

INSERT INTO users (username, email, age) 
VALUES ('李四', 'lisi@example.com', 30);

-- ====== SELECT：查询数据 ======
-- 查询所有字段
SELECT * FROM users;

-- 查询指定字段，使用 WHERE 过滤
SELECT username, email 
FROM users 
WHERE age > 20;

-- 使用 ORDER BY 排序，LIMIT 限制结果数量
SELECT username, email 
FROM users 
ORDER BY age DESC 
LIMIT 10;

-- ====== UPDATE：更新数据 ======
UPDATE users 
SET age = 26 
WHERE username = '张三';

-- ====== DELETE：删除数据 ======
DELETE FROM users 
WHERE username = '李四';`,
    concepts: [
      { line: 2, title: 'CREATE TABLE', detail: '创建新表，定义列名、数据类型和约束' },
      { line: 11, title: 'INSERT', detail: '向表中插入新记录' },
      { line: 17, title: 'SELECT', detail: '从表中查询数据，* 表示所有字段' },
      { line: 23, title: 'WHERE 条件', detail: '过滤查询结果，只返回满足条件的记录' },
      { line: 32, title: 'UPDATE', detail: '更新现有记录，需要配合 WHERE 条件' },
      { line: 37, title: 'DELETE', detail: '删除记录，需谨慎使用 WHERE 条件' },
    ],
  },
  {
    id: 'joins_and_aggregation',
    title: '连接和聚合',
    description: '多表关联查询和数据分析聚合函数',
    code: `-- ====== 创建相关表 ======
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,                      -- 用户 ID（外键）
    product VARCHAR(100),
    amount DECIMAL(10, 2),
    order_date DATE
);

CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,                     -- 订单 ID（外键）
    product_name VARCHAR(100),
    quantity INT,
    price DECIMAL(10, 2)
);

-- ====== INNER JOIN：内连接 ======
-- 查询用户及其订单信息
SELECT u.username, o.product, o.amount, o.order_date
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- ====== LEFT JOIN：左连接 ======
-- 查询所有用户，包括没有订单的用户
SELECT u.username, o.product
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- ====== 聚合函数 ======
-- 统计总用户数
SELECT COUNT(*) as total_users FROM users;

-- 计算平均年龄
SELECT AVG(age) as avg_age FROM users;

-- 计算订单总金额
SELECT SUM(amount) as total_amount FROM orders;

-- ====== GROUP BY：分组 ======
-- 统计每个用户的订单数量
SELECT u.username, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;

-- 使用 HAVING 过滤分组结果
SELECT u.username, SUM(o.amount) as total_spent
FROM users u
JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username
HAVING total_spent > 1000;

-- ====== 子查询 ======
-- 查询订单金额最高的用户
SELECT username, email 
FROM users 
WHERE id = (
    SELECT user_id 
    FROM orders 
    GROUP BY user_id 
    ORDER BY SUM(amount) DESC 
    LIMIT 1
);`,
    concepts: [
      { line: 20, title: 'INNER JOIN', detail: '只返回两个表中匹配的记录' },
      { line: 27, title: 'LEFT JOIN', detail: '返回左表所有记录，右表不匹配则为 NULL' },
      { line: 34, title: '聚合函数', detail: 'COUNT/SUM/AVG/MAX/MIN 用于统计分析' },
      { line: 44, title: 'GROUP BY', detail: '将结果按指定列分组' },
      { line: 49, title: 'HAVING', detail: '过滤分组后的结果（不同于 WHERE）' },
      { line: 54, title: '子查询', detail: '在 SELECT/FROM/WHERE 中嵌套查询' },
    ],
  },
];

/* ──────────────────────────────────────────────
   Java 代码示例 - 面向对象基础
   ────────────────────────────────────────────── */
const JAVA_EXAMPLES = [
  {
    id: 'class_basic',
    title: '类与对象基础',
    description: '理解面向对象的核心：类是模板，对象是实例',
    code: `// ====== 类与对象基础 ======
// 定义一个"类"——它是创建对象的模板
class Person {
    // 属性（成员变量）
    String name;   // 姓名
    int age;       // 年龄
    
    // 构造方法——用于创建对象时初始化
    Person(String name, int age) {
        this.name = name;  // this 指向当前对象
        this.age = age;
    }
    
    // 方法（行为）
    void introduce() {
        System.out.println("你好，我是" + name + "，今年" + age + "岁");
    }
}

// 使用类创建对象
public class Main {
    public static void main(String[] args) {
        // 创建 Person 对象
        Person p1 = new Person("张三", 25);
        Person p2 = new Person("李四", 30);
        
        // 调用方法
        p1.introduce();  // 输出：你好，我是张三，今年 25 岁
        p2.introduce();  // 输出：你好，我是李四，今年 30 岁
    }
}`,
    concepts: [
      { line: 3, title: '类定义', detail: 'class 关键字定义类，它是对象的"模板"或"蓝图"' },
      { line: 5, title: '属性', detail: '成员变量，存储对象的状态信息' },
      { line: 9, title: '构造方法', detail: 'special 方法，在创建对象时自动调用，用于初始化' },
      { line: 14, title: '实例方法', detail: '可以访问 this 指向的对象的属性和方法' },
      { line: 22, title: 'new 关键字', detail: '创建对象实例，调用构造方法分配内存并初始化' },
      { line: 23, title: '引用变量', detail: 'p1 和 p2 是对象引用，指向堆内存中的实际对象' },
    ],
  },
  {
    id: 'encapsulation',
    title: '封装——数据隐藏',
    description: '用私有属性和公共方法保护对象内部状态',
    code: `// ====== 封装（Encapsulation） ======
class BankAccount {
    // 私有属性——外部无法直接访问
    private String accountId;    // 账号
    private double balance;      // 余额
    
    // 构造方法
    BankAccount(String accountId, double initialBalance) {
        this.accountId = accountId;
        // 通过方法设置余额，可以添加验证逻辑
        setBalance(initialBalance);
    }
    
    // 公共方法——访问器（Getter）
    public String getAccountId() {
        return accountId;
    }
    
    public double getBalance() {
        return balance;
    }
    
    // 公共方法——修改器（Setter）带验证
    public void setBalance(double balance) {
        if (balance >= 0) {
            this.balance = balance;
        } else {
            System.out.println("余额不能为负数！");
        }
    }
    
    // 存款方法
    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            System.out.println("存入：" + amount + "，当前余额：" + balance);
        }
    }
    
    // 取款方法
    public boolean withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            System.out.println("取出：" + amount + "，当前余额：" + balance);
            return true;
        }
        System.out.println("取款失败：余额不足或金额无效");
        return false;
    }
}

public class Main {
    public static void main(String[] args) {
        BankAccount account = new BankAccount("ACC001", 1000);
        
        account.deposit(500);      // 余额：1500
        account.withdraw(200);     // 余额：1300
        account.withdraw(2000);    // 失败：余额不足
        
        // 不能直接访问私有属性
        // account.balance = -100;  // 编译错误！
    }
}`,
    concepts: [
      { line: 4, title: 'private 修饰符', detail: '私有访问级别，只有类内部可以访问，实现数据隐藏' },
      { line: 15, title: 'public Getter', detail: '提供只读访问，外部可以获取属性值但不能修改' },
      { line: 21, title: 'Setter 验证', detail: '在设置属性前进行验证，保护数据完整性' },
      { line: 27, title: '业务方法', detail: '封装业务逻辑，确保操作符合规则（如存款必须正数）' },
      { line: 39, title: '封装的好处', detail: '隐藏实现细节，修改内部逻辑不影响外部调用，提高安全性' },
    ],
  },
  {
    id: 'inheritance',
    title: '继承——代码复用',
    description: '子类继承父类的属性和方法，扩展或修改行为',
    code: `// ====== 继承（Inheritance） ======
// 父类（基类）：交通工具
class Vehicle {
    protected String brand;    // 品牌（protected：子类可访问）
    protected int speed;       // 速度
    
    // 构造方法
    public Vehicle(String brand, int speed) {
        this.brand = brand;
        this.speed = speed;
    }
    
    // 通用方法
    public void start() {
        System.out.println(brand + " 启动了！");
    }
    
    public void stop() {
        System.out.println(brand + " 停下来了！");
    }
    
    public void getInfo() {
        System.out.println("品牌：" + brand + "，速度：" + speed);
    }
}

// 子类：汽车（继承 Vehicle）
class Car extends Vehicle {
    private int doors;   // 车门数（新增属性）
    
    public Car(String brand, int speed, int doors) {
        super(brand, speed);  // 调用父类构造方法
        this.doors = doors;
    }
    
    // 重写父类方法（Override）
    @Override
    public void start() {
        System.out.println("🚗 " + brand + " 汽车启动了！");
    }
    
    // 新增特有方法
    public void honk() {
        System.out.println("🔊 滴滴！");
    }
}

// 子类：摩托车（继承 Vehicle）
class Motorcycle extends Vehicle {
    private boolean hasSidecar;  // 是否有边车
    
    public Motorcycle(String brand, int speed, boolean hasSidecar) {
        super(brand, speed);
        this.hasSidecar = hasSidecar;
    }
    
    @Override
    public void start() {
        System.out.println("🏍️ " + brand + " 摩托车启动了！");
    }
    
    public void wheelie() {
        System.out.println("🤙 翘头行驶！");
    }
}

public class Main {
    public static void main(String[] args) {
        Car myCar = new Car("丰田", 120, 4);
        Motorcycle myMoto = new Motorcycle("哈雷", 150, false);
        
        // 汽车
        myCar.start();       // 使用重写的方法
        myCar.honk();        // 调用特有方法
        myCar.getInfo();     // 继承的方法
        
        // 摩托车
        myMoto.start();      // 使用重写的方法
        myMoto.wheelie();    // 调用特有方法
    }
}`,
    concepts: [
      { line: 3, title: '父类定义', detail: 'Vehicle 是所有交通工具的基类，包含共性属性和方法' },
      { line: 19, title: 'extends 关键字', detail: 'Car 和 Motorcycle 继承自 Vehicle，获得其公有和受保护成员' },
      { line: 23, title: 'super 调用', detail: '子类构造方法必须调用 super() 初始化父类部分' },
      { line: 27, title: '方法重写', detail: '@Override 使子类可以改变父类方法的实现，实现多态' },
      { line: 35, title: '新增成员', detail: '子类可以添加自己的属性和方法（如 Car 的 doors、honk()）' },
      { line: 57, title: '继承的好处', detail: '代码复用、扩展性、建立类层次结构' },
    ],
  },
  {
    id: 'polymorphism',
    title: '多态——同一接口，多种实现',
    description: '父类引用可以指向子类对象，调用方法时根据实际对象决定执行哪个版本',
    code: `// ====== 多态（Polymorphism） ======
// 父类：动物
class Animal {
    protected String name;
    
    public Animal(String name) {
        this.name = name;
    }
    
    // 通用方法
    public void makeSound() {
        System.out.println(name + "发出了一些声音...");
    }
    
    public void move() {
        System.out.println(name + "在移动...");
    }
}

// 子类：狗
class Dog extends Animal {
    public Dog(String name) {
        super(name);
    }
    
    @Override
    public void makeSound() {
        System.out.println(name + "：汪汪汪！🐕");
    }
    
    // 狗特有的方法
    public void fetch() {
        System.out.println(name + " 正在捡飞盘...");
    }
}

// 子类：猫
class Cat extends Animal {
    public Cat(String name) {
        super(name);
    }
    
    @Override
    public void makeSound() {
        System.out.println(name + "：喵喵喵！🐱");
    }
    
    public void climb() {
        System.out.println(name + " 正在爬树...");
    }
}

public class Main {
    public static void main(String[] args) {
        // 多态：父类引用指向子类对象
        Animal a1 = new Dog("旺财");
        Animal a2 = new Cat("咪咪");
        
        // 调用方法时，根据实际对象类型决定执行哪个版本
        a1.makeSound();  // 输出：旺财：汪汪汪！🐕（执行 Dog 的 makeSound）
        a2.makeSound();  // 输出：咪咪：喵喵喵！🐱（执行 Cat 的 makeSound）
        
        // 公共方法
        a1.move();       // 输出：旺财在移动...（执行 Animal 的 move）
        a2.move();       // 输出：咪咪在移动...
        
        // 向下转型——如果需要调用子类特有方法
        Dog dog = (Dog) a1;  // 类型转换
        dog.fetch();         // 输出：旺财 正在捡飞盘...
        
        // 使用 instanceof 安全检查
        if (a2 instanceof Cat) {
            Cat cat = (Cat) a2;
            cat.climb();     // 输出：咪咪 正在爬树...
        }
    }
}`,
    concepts: [
      { line: 34, title: '向上转型', detail: 'Animal a1 = new Dog()，父类引用指向子类对象，是自动的类型转换' },
      { line: 42, title: '动态绑定', detail: '运行时根据实际对象类型决定调用哪个方法版本，这是多态的核心' },
      { line: 51, title: '向下转型', detail: '(Dog) a1，将父类引用转回子类，需要确保类型正确（可用 instanceof 检查）' },
      { line: 22, title: '重写 vs 重载', detail: '重写是子类改变父类方法（相同签名），重载是同方法名不同参数列表' },
      { line: 40, title: '多态的好处', detail: '提高代码灵活性、可扩展性，方便编写通用代码' },
    ],
  },
  {
    id: 'interface',
    title: '接口——定义契约',
    description: '接口定义行为规范，多个类可以实现同一接口，实现"多实现"',
    code: `// ====== 接口（Interface） ======
// 接口定义——"可以做什么"的契约
interface Flyable {
    // 抽象方法（public abstract 是默认的）
    void fly();
    int getAltitude();  // 飞行高度
    
    // Java 8 开始可以有默认方法
    default void land() {
        System.out.println("正在降落...");
    }
    
    // Java 8 开始可以有静态方法
    static void describe() {
        System.out.println("这是一个可飞行的物体");
    }
}

// 接口 2
interface Swimmable {
    void swim();
    int getDepth();
}

// 类可以实现多个接口
class Duck extends Animal {
    private int altitude;
    private int depth;
    
    public Duck(String name) {
        super(name);
    }
    
    // 实现 Flyable 接口
    @Override
    public void fly() {
        System.out.println(name + " 飞起来了！海拔：" + altitude + "米");
    }
    
    @Override
    public int getAltitude() {
        return altitude;
    }
    
    // 实现 Swimmable 接口
    @Override
    public void swim() {
        System.out.println(name + " 游起来了！深度：" + depth + "米");
    }
    
    @Override
    public int getDepth() {
        return depth;
    }
}

class Bird extends Animal implements Flyable {
    private int altitude;
    
    public Bird(String name) {
        super(name);
    }
    
    @Override
    public void fly() {
        System.out.println(name + " 展翅高飞！海拔：" + altitude + "米");
    }
    
    @Override
    public int getAltitude() {
        return altitude;
    }
    
    // 不实现 swim()，因为它不能游泳
}

public class Main {
    public static void main(String[] args) {
        // 使用接口类型——编程时依赖抽象，不依赖具体实现
        Flyable f1 = new Duck("鸭子");
        Flyable f2 = new Bird("麻雀");
        
        // 调用接口方法
        f1.fly();      // 鸭子飞
        f2.fly();      // 麻雀飞
        
        // 鸭子还可以游泳（实现了 Swimmable）
        Duck duck = (Duck) f1;
        duck.swim();   // 鸭子游
        
        // 接口调用默认方法
        f1.land();     // 正在降落...
        
        // 接口调用静态方法
        Flyable.describe();  // 这是一个可飞行的物体
    }
}`,
    concepts: [
      { line: 2, title: '接口定义', detail: 'interface 定义一组行为规范，实现类必须实现所有抽象方法' },
      { line: 10, title: '默认方法', detail: 'default 关键字允许接口提供方法实现，实现类可以选择重写' },
      { line: 15, title: '静态方法', detail: '接口可以有静态方法，用于工具方法或工厂方法' },
      { line: 23, title: '多实现', detail: '一个类可以实现多个接口，弥补 Java 单继承的限制' },
      { line: 62, title: '依赖抽象', detail: '使用接口类型而非具体类，代码更灵活、可替换、易测试' },
    ],
  },
  {
    id: 'abstract_class',
    title: '抽象类——部分实现',
    description: '抽象类可以包含抽象方法和具体方法，不能直接实例化',
    code: `// ====== 抽象类（Abstract Class） ======
// 抽象类——不能被实例化，只能被继承
abstract class Shape {
    protected String color;
    protected boolean filled;
    
    public Shape(String color, boolean filled) {
        this.color = color;
        this.filled = filled;
    }
    
    // 抽象方法——没有实现，子类必须实现
    public abstract double getArea();
    public abstract double getPerimeter();
    
    // 具体方法——有实现，子类可以直接使用
    public void setColor(String color) {
        this.color = color;
    }
    
    public String getColor() {
        return color;
    }
    
    // 通用方法
    public void describe() {
        System.out.println("这是一个" + color + "的图形");
    }
}

// 子类：圆形
class Circle extends Shape {
    private double radius;
    
    public Circle(String color, boolean filled, double radius) {
        super(color, filled);
        this.radius = radius;
    }
    
    @Override
    public double getArea() {
        return Math.PI * radius * radius;
    }
    
    @Override
    public double getPerimeter() {
        return 2 * Math.PI * radius;
    }
}

// 子类：矩形
class Rectangle extends Shape {
    private double width;
    private double height;
    
    public Rectangle(String color, boolean filled, double width, double height) {
        super(color, filled);
        this.width = width;
        this.height = height;
    }
    
    @Override
    public double getArea() {
        return width * height;
    }
    
    @Override
    public double getPerimeter() {
        return 2 * (width + height);
    }
}

public class Main {
    public static void main(String[] args) {
        // 不能用 new Shape() 创建抽象类对象
        // Shape s = new Shape(...);  // 编译错误！
        
        // 用子类对象
        Shape circle = new Circle("红色", true, 5.0);
        Shape rect = new Rectangle("蓝色", false, 4.0, 3.0);
        
        // 多态：调用不同子类的实现
        circle.describe();            // 这是一个红色的图形
        System.out.println("圆面积：" + circle.getArea());   // 78.54...
        
        rect.describe();              // 这是一个蓝色的图形
        System.out.println("矩形面积：" + rect.getArea());   // 12.0
        
        // 向下转型获取特有方法
        if (circle instanceof Circle) {
            Circle c = (Circle) circle;
            System.out.println("半径：" + c.radius);
        }
    }
}`,
    concepts: [
      { line: 2, title: 'abstract 关键字', detail: '抽象类不能被实例化，只能作为基类供其他类继承' },
      { line: 14, title: '抽象方法', detail: '没有方法体，子类必须实现（除非也是抽象类）' },
      { line: 18, title: '具体方法', detail: '抽象类可以包含具体实现，子类可以直接使用或重写' },
      { line: 29, title: '抽象类 vs 接口', detail: '抽象类可以有状态和具体方法，接口主要定义行为契约' },
      { line: 58, title: 'is-a 关系', detail: 'Shape 是"形状"的抽象概念，Circle/Rectangle 是具体的形状' },
    ],
  },
];

/* ──────────────────────────────────────────────
   TypeScript 代码示例
   ────────────────────────────────────────────── */
const TS_EXAMPLES = [
  {
    id: 'class',
    title: '类与继承',
    description: '用类和继承构建动物层次结构',
    code: `// 基类：动物
class Animal {
  constructor(public name: string, public age: number) {}

  speak(): string {
    return \`\${this.name} 发出了声音\`;
  }
}

// 子类：狗（继承 Animal）
class Dog extends Animal {
  constructor(name: string, age: number, public breed: string) {
    super(name, age);  // 调用父类构造器
  }

  // 方法重写
  speak(): string {
    return \`\${this.name} 汪汪叫！\`;
  }

  fetch(item: string): string {
    return \`\${this.name} 捡回了 \${item}\`;
  }
}

// 使用
const dog = new Dog("旺财", 3, "柴犬");
console.log(dog.speak());       // "旺财 汪汪叫！"
console.log(dog.fetch("飞盘")); // "旺财 捡回了 飞盘"`,
    concepts: [
      { line: 2, title: '类定义', detail: 'class 关键字定义类，是面向对象编程的基础' },
      { line: 3, title: '构造器与访问修饰符', detail: 'constructor 中 public name 自动创建并赋值同名属性' },
      { line: 8, title: '继承', detail: 'extends 使 Dog 获得 Animal 的所有属性和方法' },
      { line: 10, title: 'super 调用', detail: '子类构造器必须先调用 super() 初始化父类部分' },
      { line: 14, title: '方法重写', detail: '子类可以重写父类方法，实现多态' },
    ],
  },
  {
    id: 'interface',
    title: '接口与泛型',
    description: '用接口定义契约，用泛型实现类型安全的复用',
    code: `// 定义接口：可序列化
interface Serializable {
  serialize(): string;
}

// 定义接口：可比较
interface Comparable<T> {
  compareTo(other: T): number;
}

// 实现多个接口
class Score implements Serializable, Comparable<Score> {
  constructor(public value: number, public label: string) {}

  serialize(): string {
    return JSON.stringify({ value: this.value, label: this.label });
  }

  compareTo(other: Score): number {
    return this.value - other.value;
  }
}

// 泛型函数：找出最大值
function findMax<T extends Comparable<T>>(items: T[]): T {
  return items.reduce((max, item) =>
    item.compareTo(max) > 0 ? item : max
  );
}

// 使用
const scores = [
  new Score(85, "语文"),
  new Score(92, "数学"),
  new Score(78, "英语"),
];
const best = findMax(scores);
console.log(\`\${best.label}: \${best.value}\`); // "数学: 92"`,
    concepts: [
      { line: 2, title: '接口', detail: 'interface 定义对象必须实现的形状/方法，是"契约"' },
      { line: 7, title: '泛型接口', detail: 'Comparable<T> 中 T 是类型参数，使用时指定具体类型' },
      { line: 11, title: '实现接口', detail: 'implements 声明类满足接口要求，必须实现所有方法' },
      { line: 22, title: '泛型函数', detail: '<T extends Comparable<T>> 约束 T 必须可比较' },
      { line: 23, title: '类型推断', detail: '调用 findMax(scores) 时 TS 自动推断 T = Score' },
    ],
  },
  {
    id: 'pattern',
    title: '设计模式：观察者',
    description: '用观察者模式实现事件订阅系统',
    code: `// 观察者接口
interface Observer<T> {
  update(data: T): void;
}

// 主题接口
interface Subject<T> {
  attach(observer: Observer<T>): void;
  detach(observer: Observer<T>): void;
  notify(data: T): void;
}

// 具体主题：事件发射器
class EventEmitter<T> implements Subject<T> {
  private observers: Observer<T>[] = [];

  attach(observer: Observer<T>): void {
    this.observers.push(observer);
  }

  detach(observer: Observer<T>): void {
    this.observers = this.observers.filter(o => o !== observer);
  }

  notify(data: T): void {
    this.observers.forEach(o => o.update(data));
  }
}

// 具体观察者：日志记录器
class Logger implements Observer<string> {
  constructor(public name: string) {}
  update(data: string): void {
    console.log(\`[\${this.name}] 收到: \${data}\`);
  }
}

// 使用
const emitter = new EventEmitter<string>();
const logger1 = new Logger("控制台");
const logger2 = new Logger("文件");

emitter.attach(logger1);
emitter.attach(logger2);
emitter.notify("系统启动！");
// [控制台] 收到: 系统启动！
// [文件] 收到: 系统启动！`,
    concepts: [
      { line: 2, title: '观察者接口', detail: '定义观察者必须实现的 update 方法' },
      { line: 7, title: '主题接口', detail: '定义注册/注销/通知观察者的标准协议' },
      { line: 14, title: '私有成员', detail: 'private 修饰符限制 observers 只能在类内部访问' },
      { line: 25, title: '通知机制', detail: 'notify 遍历所有观察者，调用其 update 方法' },
      { line: 31, title: '解耦', detail: '主题和观察者通过接口交互，互不依赖具体实现' },
    ],
  },
];

/* ──────────────────────────────────────────────
   语言对比数据
   ────────────────────────────────────────────── */
const COMPARISON = [
  {
    dimension: '语言类型',
    asm: '无范式（直接操作硬件）',
    html: '标记语言',
    c: '面向过程',
    java: '纯面向对象',
    sql: '声明式查询语言',
    ts: '面向对象 + 函数式',
  },
  {
    dimension: '抽象层级',
    asm: '最低（与 CPU 指令一一对应）',
    html: '内容结构层',
    c: '中等（函数/结构体）',
    java: '高（类/接口/抽象类/继承）',
    sql: '数据抽象层',
    ts: '高（类/接口/泛型/装饰器）',
  },
  {
    dimension: '编译/解析',
    asm: '汇编器 → 机器码',
    html: '浏览器直接解析',
    c: '编译器 → 机器码',
    java: 'JVM 虚拟机（跨平台）',
    sql: '数据库优化器执行',
    ts: '编译到 JavaScript 运行',
  },
  {
    dimension: '用途领域',
    asm: '系统底层/嵌入式',
    html: 'Web 网页结构',
    c: '系统编程/驱动',
    java: '企业应用/Android',
    sql: '数据库管理',
    ts: '前端/全栈开发',
  },
  {
    dimension: '执行方式',
    asm: '顺序执行指令',
    html: '声明内容结构',
    c: '过程调用执行',
    java: '面向对象执行',
    sql: '声明要什么数据',
    ts: '类型安全执行',
  },
];

/* ══════════════════════════════════════════════
   主组件
   ══════════════════════════════════════════════ */
function ProgrammingLanguageLesson() {
  const [activeSection, setActiveSection] = useState('timeline');
  const [htmlExample, setHtmlExample] = useState(0);
  const [asmExample, setAsmExample] = useState(0);
  const [cExample, setCExample] = useState(0);
  const [sqlExample, setSqlExample] = useState(0);
  const [javaExample, setJavaExample] = useState(0);
  const [tsExample, setTsExample] = useState(0);
  const [asmStep, setAsmStep] = useState(-1);
  const [highlightLine, setHighlightLine] = useState(-1);
  const [registers, setRegisters] = useState({});
  const codeRef = useRef(null);

  // 汇编执行步骤
  const currentAsm = ASM_EXAMPLES[asmExample];

  const runAsmStep = (stepIdx) => {
    if (stepIdx < 0 || stepIdx >= currentAsm.steps.length) {
      setAsmStep(-1);
      setHighlightLine(-1);
      setRegisters({});
      return;
    }
    const step = currentAsm.steps[stepIdx];
    setAsmStep(stepIdx);
    setHighlightLine(step.line);
    setRegisters(step.reg);
  };

  const resetAsm = () => {
    setAsmStep(-1);
    setHighlightLine(-1);
    setRegisters({});
  };

  // 代码行渲染
  const renderCodeLines = (code, highlight = -1, concepts = null) => {
    return code.split('\n').map((line, i) => {
      const lineNum = i + 1;
      const isHighlight = lineNum === highlight;
      const concept = concepts?.find((c) => c.line === lineNum);
      return (
        <div
          key={i}
          className={`code-line ${isHighlight ? 'code-line-active' : ''} ${concept ? 'code-line-concept' : ''}`}
          title={concept ? `${concept.title}: ${concept.detail}` : undefined}
        >
          <span className="line-num">{lineNum}</span>
          <span className="line-content">{line || ' '}</span>
          {concept && <span className="concept-badge">{concept.title}</span>}
        </div>
      );
    });
  };

  // 时间线动画
  const [visibleTimeline, setVisibleTimeline] = useState(0);
  useEffect(() => {
    if (activeSection !== 'timeline') return;
    let count = 0;
    const timer = setInterval(() => {
      count += 1;
      setVisibleTimeline(count);
      if (count >= 6) clearInterval(timer);
    }, 600);
    return () => clearInterval(timer);
  }, [activeSection]);

  return (
    <div className="pl-lesson">
      {/* ── 标题 ── */}
      <header className="pl-header">
        <h1>📜 编程语言演进课程</h1>
        <p>从汇编、HTML、C、Java、SQL 到 TypeScript —— 理解编程语言的演进之路</p>
      </header>

      {/* ── 导航 ── */}
      <nav className="pl-nav">
        {[
          { id: 'timeline', name: '演进时间线', icon: '⏳', navClass: '' },
          { id: 'asm', name: '汇编语言', icon: '⚙️', navClass: 'asm-nav' },
          { id: 'html', name: 'HTML', icon: '🌐', navClass: 'html-nav' },
          { id: 'c', name: 'C 语言', icon: '🔧', navClass: 'c-nav' },
          { id: 'java', name: 'Java', icon: '☕', navClass: 'java-nav' },
          { id: 'sql', name: 'SQL', icon: '🗄️', navClass: 'sql-nav' },
          { id: 'ts', name: 'TypeScript', icon: '🚀', navClass: 'ts-nav' },
          { id: 'compare', name: '语言对比', icon: '⚖️', navClass: '' },
        ].map((s) => (
          <button
            key={s.id}
            className={`pl-nav-btn ${s.navClass} ${activeSection === s.id ? 'active' : ''}`}
            onClick={() => setActiveSection(s.id)}
          >
            <span className="pl-nav-icon">{s.icon}</span>
            <span className="pl-nav-text">{s.name}</span>
          </button>
        ))}
      </nav>

      {/* ══════════════════════════════════════
          时间线
          ══════════════════════════════════════ */}
      {activeSection === 'timeline' && (
        <section className="pl-timeline">
          <h2 className="pl-section-title">编程语言演进时间线</h2>
          <div className="timeline-track">
            {/* 汇编 */}
            <div className={`timeline-node ${visibleTimeline >= 1 ? 'visible' : ''}`}>
              <div className="timeline-dot asm-dot">⚙️</div>
              <div className="timeline-card asm-card">
                <h3>1940s-50s · 汇编语言</h3>
                <p>用助记符代替 0/1 机器码，与 CPU 指令一一对应。</p>
                <ul>
                  <li>直接操作寄存器与内存地址</li>
                  <li>最高执行效率，最低可移植性</li>
                  <li>至今仍用于操作系统内核、驱动、嵌入式</li>
                </ul>
                <div className="timeline-code-snippet">
                  <code>MOV EAX, [num1]  ; 将内存值装入寄存器</code>
                </div>
              </div>
            </div>

            {/* HTML */}
            <div className={`timeline-node ${visibleTimeline >= 2 ? 'visible' : ''}`}>
              <div className="timeline-dot html-dot">🌐</div>
              <div className="timeline-card html-card">
                <h3>1991 · HTML</h3>
                <p>Tim Berners-Lee 创造，用于构建网页结构和内容。</p>
                <ul>
                  <li>标记语言：用标签描述内容结构</li>
                  <li>无需编译，浏览器直接解析</li>
                  <li>Web 开发的基石，与 CSS/JS 配合</li>
                </ul>
                <div className="timeline-code-snippet">
                  <code>&lt;div&gt;&lt;h1&gt;标题&lt;/h1&gt;&lt;/div&gt;</code>
                </div>
              </div>
            </div>

            {/* C */}
            <div className={`timeline-node ${visibleTimeline >= 3 ? 'visible' : ''}`}>
              <div className="timeline-dot c-dot">🔧</div>
              <div className="timeline-card c-card">
                <h3>1970s · C 语言</h3>
                <p> Dennis Ritchie 在贝尔实验室创造，用函数和结构体组织代码。</p>
                <ul>
                  <li>面向过程：程序 = 数据 + 函数</li>
                  <li>指针直接操作内存，兼顾效率与抽象</li>
                  <li>Unix/Linux 内核、数据库引擎均用 C 编写</li>
                </ul>
                <div className="timeline-code-snippet">
                  <code>printf("Hello, %s!\\n", name);  // 函数调用</code>
                </div>
              </div>
            </div>

            {/* Java */}
            <div className={`timeline-node ${visibleTimeline >= 4 ? 'visible' : ''}`}>
              <div className="timeline-dot java-dot">☕</div>
              <div className="timeline-card java-card">
                <h3>1995 · Java 语言</h3>
                <p>Sun Microsystems 推出，以"一次编写，到处运行"的跨平台特性闻名。</p>
                <ul>
                  <li>纯面向对象：万物皆对象</li>
                  <li>自动内存管理（垃圾回收）</li>
                  <li>企业应用、Android 开发首选</li>
                </ul>
                <div className="timeline-code-snippet">
                  <code>class Dog extends Animal {'{'} ... {'}'}</code>
                </div>
              </div>
            </div>

            {/* SQL */}
            <div className={`timeline-node ${visibleTimeline >= 5 ? 'visible' : ''}`}>
              <div className="timeline-dot sql-dot">🗄️</div>
              <div className="timeline-card sql-card">
                <h3>1970s · SQL</h3>
                <p>IBM 开发，用于管理关系型数据库的标准查询语言。</p>
                <ul>
                  <li>声明式语言：描述"要什么"而非"怎么做"</li>
                  <li>增删改查（CRUD）操作</li>
                  <li>连接、聚合、分组等数据分析功能</li>
                </ul>
                <div className="timeline-code-snippet">
                  <code>SELECT * FROM users WHERE age {'>'} 18</code>
                </div>
              </div>
            </div>

            {/* TypeScript */}
            <div className={`timeline-node ${visibleTimeline >= 6 ? 'visible' : ''}`}>
              <div className="timeline-dot ts-dot">🚀</div>
              <div className="timeline-card ts-card">
                <h3>2012 · TypeScript</h3>
                <p>Microsoft 推出的 JavaScript 超集，引入静态类型与面向对象。</p>
                <ul>
                  <li>面向对象 + 函数式：类、接口、泛型</li>
                  <li>编译期类型检查，减少运行时错误</li>
                  <li>大型前端项目（Angular/Vue/React）首选</li>
                </ul>
                <div className="timeline-code-snippet">
                  <code>class Dog extends Animal {'{'} ... {'}'}</code>
                </div>
              </div>
            </div>
          </div>

          {/* 进化箭头 */}
          <div className="evolution-arrows">
            <div className="evo-arrow">
              <span className="evo-label">抽象层级</span>
              <div className="evo-bar">
                <div className="evo-fill evo-fill-low" />
                <span>低</span>
              </div>
              <div className="evo-arrow-icon">→</div>
              <div className="evo-bar">
                <div className="evo-fill evo-fill-mid" />
                <span>中</span>
              </div>
              <div className="evo-arrow-icon">→</div>
              <div className="evo-bar">
                <div className="evo-fill evo-fill-high" />
                <span>高</span>
              </div>
            </div>
            <div className="evo-arrow">
              <span className="evo-label">开发效率</span>
              <div className="evo-bar">
                <div className="evo-fill evo-fill-low" />
                <span>低</span>
              </div>
              <div className="evo-arrow-icon">→</div>
              <div className="evo-bar">
                <div className="evo-fill evo-fill-mid" />
                <span>中</span>
              </div>
              <div className="evo-arrow-icon">→</div>
              <div className="evo-bar">
                <div className="evo-fill evo-fill-high" />
                <span>高</span>
              </div>
            </div>
            <div className="evo-arrow">
              <span className="evo-label">运行效率</span>
              <div className="evo-bar">
                <div className="evo-fill evo-fill-high" />
                <span>高</span>
              </div>
              <div className="evo-arrow-icon">→</div>
              <div className="evo-bar">
                <div className="evo-fill evo-fill-mid" />
                <span>中</span>
              </div>
              <div className="evo-arrow-icon">→</div>
              <div className="evo-bar">
                <div className="evo-fill evo-fill-low" />
                <span>低</span>
              </div>
            </div>
          </div>

          {/* 范式对比卡片 */}
          <div className="paradigm-comparison">
            <h3 className="comparison-title">🎯 三大编程范式对比</h3>
            <div className="paradigm-cards">
              {/* 汇编：面向机器 */}
              <div className="paradigm-card asm-paradigm">
                <div className="paradigm-icon">⚙️</div>
                <h4>面向机器</h4>
                <p className="paradigm-desc">汇编语言</p>
                <ul className="paradigm-features">
                  <li>💀 直接操作硬件</li>
                  <li>💀 手动管理每一字节</li>
                  <li>💀 无抽象，与 CPU 指令一一对应</li>
                  <li>💀 最高效率，最低可移植性</li>
                </ul>
                <div className="paradigm-example">
                  <code>MOV EAX, [num1]  ; 寄存器操作</code>
                </div>
              </div>

              {/* C：面向过程 */}
              <div className="paradigm-card c-paradigm">
                <div className="paradigm-icon">🔧</div>
                <h4>面向过程</h4>
                <p className="paradigm-desc">C 语言</p>
                <ul className="paradigm-features">
                  <li>🔹 函数 + 结构体组织代码</li>
                  <li>🔹 指针直接操作内存</li>
                  <li>🔹 程序 = 数据 + 函数</li>
                  <li>🔹 兼顾效率与抽象</li>
                </ul>
                <div className="paradigm-example">
                  <code>void swap(int *a, int *b) {'{'} ... {'}'}</code>
                </div>
              </div>

              {/* Java：面向对象 */}
              <div className="paradigm-card java-paradigm">
                <div className="paradigm-icon">☕</div>
                <h4>面向对象</h4>
                <p className="paradigm-desc">Java / TypeScript</p>
                <ul className="paradigm-features">
                  <li>🔸 类、对象、继承、多态</li>
                  <li>🔸 封装：数据隐藏与保护</li>
                  <li>🔸 接口：定义行为契约</li>
                  <li>🔸 自动内存管理（GC）</li>
                </ul>
                <div className="paradigm-example">
                  <code>class Dog extends Animal {'{'} ... {'}'}</code>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          汇编语言
          ══════════════════════════════════════ */}
      {activeSection === 'asm' && (
        <section className="pl-section">
          <h2 className="pl-section-title">⚙️ 汇编语言 —— 与 CPU 直接对话</h2>
          <div className="pl-intro-box asm-intro">
            <p>
              汇编语言是最接近硬件的编程语言。每一条汇编指令几乎都对应一条 CPU 机器指令，
              你需要直接操作<strong>寄存器</strong>（CPU 内部的高速存储）和<strong>内存地址</strong>。
            </p>
            <div className="pl-key-concepts">
              <div className="concept-chip"><strong>寄存器</strong> EAX, EBX, ECX 等</div>
              <div className="concept-chip"><strong>指令</strong> MOV, ADD, CMP, JMP</div>
              <div className="concept-chip"><strong>段</strong> .data 数据段 / .text 代码段</div>
            </div>
          </div>

          {/* 示例选择 */}
          <div className="example-tabs">
            {ASM_EXAMPLES.map((ex, i) => (
              <button
                key={ex.id}
                className={`example-tab ${asmExample === i ? 'active asm-tab-active' : ''}`}
                onClick={() => { setAsmExample(i); resetAsm(); }}
              >
                {ex.title}
              </button>
            ))}
          </div>

          <p className="example-desc">{currentAsm.description}</p>

          <div className="pl-code-layout">
            {/* 代码区 */}
            <div className="pl-code-panel">
              <div className="code-header asm-header">
                <span className="code-lang">x86 Assembly</span>
                <span className="code-file">{currentAsm.title}.asm</span>
              </div>
              <div className="code-body asm-theme" ref={codeRef}>
                {renderCodeLines(currentAsm.code, highlightLine)}
              </div>
            </div>

            {/* 执行面板 */}
            <div className="pl-exec-panel">
              <h3>逐步执行</h3>
              <div className="exec-controls">
                <button
                  className="exec-btn"
                  onClick={() => runAsmStep(asmStep < 0 ? 0 : asmStep - 1)}
                  disabled={asmStep <= 0}
                >
                  ⏮ 上一步
                </button>
                <button
                  className="exec-btn exec-btn-primary"
                  onClick={() => runAsmStep(asmStep < 0 ? 0 : asmStep + 1)}
                  disabled={asmStep >= currentAsm.steps.length - 1}
                >
                  ▶ 下一步
                </button>
                <button className="exec-btn" onClick={resetAsm}>
                  ↺ 重置
                </button>
              </div>

              {/* 当前步骤说明 */}
              <div className="exec-step-info">
                {asmStep >= 0 ? (
                  <>
                    <div className="step-counter">
                      步骤 {asmStep + 1} / {currentAsm.steps.length}
                    </div>
                    <div className="step-text">
                      {currentAsm.steps[asmStep].text}
                    </div>
                  </>
                ) : (
                  <div className="step-placeholder">点击「下一步」开始执行</div>
                )}
              </div>

              {/* 寄存器状态 */}
              <div className="register-panel">
                <h4>寄存器 / 变量状态</h4>
                {Object.keys(registers).length > 0 ? (
                  <div className="register-grid">
                    {Object.entries(registers).map(([k, v]) => (
                      <div key={k} className="register-cell">
                        <span className="reg-name">{k}</span>
                        <span className="reg-value">{v}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="register-empty">尚未执行</div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          HTML 语言
          ══════════════════════════════════════ */}
      {activeSection === 'html' && (
        <section className="pl-section">
          <h2 className="pl-section-title">🌐 HTML —— 网页的骨架</h2>
          <div className="pl-intro-box html-intro">
            <p>
              HTML（HyperText Markup Language）是一种<strong>标记语言</strong>，用于定义网页的结构和内容。
              它不是传统意义上的"编程语言"，因为没有逻辑控制或计算能力，而是通过<strong>标签</strong>来描述页面元素。
              HTML 与 CSS（样式）和 JavaScript（交互）共同构成了 Web 开发的三大基石。
            </p>
            <div className="pl-key-concepts">
              <div className="concept-chip"><strong>标签</strong> 定义内容结构</div>
              <div className="concept-chip"><strong>元素</strong> 标签及其内容</div>
              <div className="concept-chip"><strong>属性</strong> 提供额外信息</div>
              <div className="concept-chip"><strong>语义化标签</strong> 增强可访问性</div>
              <div className="concept-chip"><strong>表单</strong> 用户输入收集</div>
            </div>
          </div>

          {/* 示例选择 */}
          <div className="example-tabs">
            {HTML_EXAMPLES.map((ex, i) => (
              <button
                key={ex.id}
                className={`example-tab ${htmlExample === i ? 'active html-tab-active' : ''}`}
                onClick={() => setHtmlExample(i)}
              >
                {ex.title}
              </button>
            ))}
          </div>

          <p className="example-desc">{HTML_EXAMPLES[htmlExample].description}</p>

          <div className="pl-code-layout">
            <div className="pl-code-panel">
              <div className="code-header html-header">
                <span className="code-lang">HTML</span>
                <span className="code-file">{HTML_EXAMPLES[htmlExample].title}.html</span>
              </div>
              <div className="code-body html-theme">
                {renderCodeLines(HTML_EXAMPLES[htmlExample].code, -1, HTML_EXAMPLES[htmlExample].concepts)}
              </div>
            </div>

            <div className="pl-concept-panel">
              <h3>关键概念解析</h3>
              {HTML_EXAMPLES[htmlExample].concepts.map((c, i) => (
                <div key={i} className="concept-card">
                  <div className="concept-card-header">
                    <span className="concept-line">第 {c.line} 行</span>
                    <span className="concept-title">{c.title}</span>
                  </div>
                  <p className="concept-detail">{c.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          C 语言
          ══════════════════════════════════════ */}
      {activeSection === 'c' && (
        <section className="pl-section">
          <h2 className="pl-section-title">🔧 C 语言 —— 面向过程的力量</h2>
          <div className="pl-intro-box c-intro">
            <p>
              C 语言在汇编之上引入了<strong>函数</strong>（代码复用）、<strong>结构体</strong>（数据组织）和
              <strong>指针</strong>（灵活的内存访问），让程序更易编写和维护，同时保留了接近底层的执行效率。
            </p>
            <div className="pl-key-concepts">
              <div className="concept-chip"><strong>函数</strong> 模块化代码</div>
              <div className="concept-chip"><strong>指针</strong> 直接操作内存</div>
              <div className="concept-chip"><strong>结构体</strong> 组合数据</div>
              <div className="concept-chip"><strong>malloc/free</strong> 动态内存</div>
            </div>
          </div>

          {/* 示例选择 */}
          <div className="example-tabs">
            {C_EXAMPLES.map((ex, i) => (
              <button
                key={ex.id}
                className={`example-tab ${cExample === i ? 'active c-tab-active' : ''}`}
                onClick={() => setCExample(i)}
              >
                {ex.title}
              </button>
            ))}
          </div>

          <p className="example-desc">{C_EXAMPLES[cExample].description}</p>

          <div className="pl-code-layout">
            <div className="pl-code-panel">
              <div className="code-header c-header">
                <span className="code-lang">C</span>
                <span className="code-file">{C_EXAMPLES[cExample].title}.c</span>
              </div>
              <div className="code-body c-theme">
                {renderCodeLines(C_EXAMPLES[cExample].code, -1, C_EXAMPLES[cExample].concepts)}
              </div>
            </div>

            <div className="pl-concept-panel">
              <h3>关键概念解析</h3>
              {C_EXAMPLES[cExample].concepts.map((c, i) => (
                <div key={i} className="concept-card">
                  <div className="concept-card-header">
                    <span className="concept-line">第 {c.line} 行</span>
                    <span className="concept-title">{c.title}</span>
                  </div>
                  <p className="concept-detail">{c.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          Java 语言
          ══════════════════════════════════════ */}
      {activeSection === 'java' && (
        <section className="pl-section">
          <h2 className="pl-section-title">☕ Java 语言 —— 面向对象的基础</h2>
          <div className="pl-intro-box java-intro">
            <p>
              Java 是一门<strong>纯面向对象</strong>的编程语言，由 Sun Microsystems 于 1995 年推出。
              它的核心理念是<strong>"一次编写，到处运行"</strong>，通过 Java 虚拟机（JVM）实现跨平台。
              Java 的<strong>面向对象三大特性</strong>——封装、继承、多态——是现代软件工程的基石。
            </p>
            <div className="pl-key-concepts">
              <div className="concept-chip"><strong>类与对象</strong> 万物皆对象</div>
              <div className="concept-chip"><strong>封装</strong> 数据隐藏与保护</div>
              <div className="concept-chip"><strong>继承</strong> 代码复用与扩展</div>
              <div className="concept-chip"><strong>多态</strong> 灵活的行为调用</div>
              <div className="concept-chip"><strong>接口</strong> 定义行为契约</div>
              <div className="concept-chip"><strong>抽象类</strong> 部分实现</div>
            </div>
          </div>

          {/* 示例选择 */}
          <div className="example-tabs">
            {JAVA_EXAMPLES.map((ex, i) => (
              <button
                key={ex.id}
                className={`example-tab ${javaExample === i ? 'active java-tab-active' : ''}`}
                onClick={() => setJavaExample(i)}
              >
                {ex.title}
              </button>
            ))}
          </div>

          <p className="example-desc">{JAVA_EXAMPLES[javaExample].description}</p>

          <div className="pl-code-layout">
            <div className="pl-code-panel">
              <div className="code-header java-header">
                <span className="code-lang">Java</span>
                <span className="code-file">{JAVA_EXAMPLES[javaExample].title}.java</span>
              </div>
              <div className="code-body java-theme">
                {renderCodeLines(JAVA_EXAMPLES[javaExample].code, -1, JAVA_EXAMPLES[javaExample].concepts)}
              </div>
            </div>

            <div className="pl-concept-panel">
              <h3>关键概念解析</h3>
              {JAVA_EXAMPLES[javaExample].concepts.map((c, i) => (
                <div key={i} className="concept-card">
                  <div className="concept-card-header">
                    <span className="concept-line">第 {c.line} 行</span>
                    <span className="concept-title">{c.title}</span>
                  </div>
                  <p className="concept-detail">{c.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          SQL 语言
          ══════════════════════════════════════ */}
      {activeSection === 'sql' && (
        <section className="pl-section">
          <h2 className="pl-section-title">🗄️ SQL —— 数据库查询语言</h2>
          <div className="pl-intro-box sql-intro">
            <p>
              SQL（Structured Query Language）是用于管理关系型数据库的标准语言。
              它是一种<strong>声明式语言</strong>，你只需告诉数据库"要什么"，而不需要关心"怎么做"。
              SQL 是数据工程师、后端开发者和数据分析师必备的技能，用于数据的存储、检索、更新和分析。
            </p>
            <div className="pl-key-concepts">
              <div className="concept-chip"><strong>CRUD 操作</strong> 增删改查</div>
              <div className="concept-chip"><strong>JOIN</strong> 多表关联</div>
              <div className="concept-chip"><strong>聚合函数</strong> 统计分析</div>
              <div className="concept-chip"><strong>GROUP BY</strong> 分组汇总</div>
              <div className="concept-chip"><strong>子查询</strong> 嵌套查询</div>
            </div>
          </div>

          {/* 示例选择 */}
          <div className="example-tabs">
            {SQL_EXAMPLES.map((ex, i) => (
              <button
                key={ex.id}
                className={`example-tab ${sqlExample === i ? 'active sql-tab-active' : ''}`}
                onClick={() => setSqlExample(i)}
              >
                {ex.title}
              </button>
            ))}
          </div>

          <p className="example-desc">{SQL_EXAMPLES[sqlExample].description}</p>

          <div className="pl-code-layout">
            <div className="pl-code-panel">
              <div className="code-header sql-header">
                <span className="code-lang">SQL</span>
                <span className="code-file">{SQL_EXAMPLES[sqlExample].title}.sql</span>
              </div>
              <div className="code-body sql-theme">
                {renderCodeLines(SQL_EXAMPLES[sqlExample].code, -1, SQL_EXAMPLES[sqlExample].concepts)}
              </div>
            </div>

            <div className="pl-concept-panel">
              <h3>关键概念解析</h3>
              {SQL_EXAMPLES[sqlExample].concepts.map((c, i) => (
                <div key={i} className="concept-card">
                  <div className="concept-card-header">
                    <span className="concept-line">第 {c.line} 行</span>
                    <span className="concept-title">{c.title}</span>
                  </div>
                  <p className="concept-detail">{c.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          TypeScript
          ══════════════════════════════════════ */}
      {activeSection === 'ts' && (
        <section className="pl-section">
          <h2 className="pl-section-title">🚀 TypeScript —— 类型安全的面向对象</h2>
          <div className="pl-intro-box ts-intro">
            <p>
              TypeScript 在 JavaScript 基础上增加了<strong>静态类型系统</strong>、
              <strong>类与接口</strong>、<strong>泛型</strong>等特性，使大型项目的代码更安全、更易维护。
              它是"编译时检查 + 运行时灵活"的完美平衡。
            </p>
            <div className="pl-key-concepts">
              <div className="concept-chip"><strong>类 / 继承</strong> 面向对象</div>
              <div className="concept-chip"><strong>接口</strong> 契约定义</div>
              <div className="concept-chip"><strong>泛型</strong> 类型复用</div>
              <div className="concept-chip"><strong>装饰器</strong> 元编程</div>
            </div>
          </div>

          {/* 示例选择 */}
          <div className="example-tabs">
            {TS_EXAMPLES.map((ex, i) => (
              <button
                key={ex.id}
                className={`example-tab ${tsExample === i ? 'active ts-tab-active' : ''}`}
                onClick={() => setTsExample(i)}
              >
                {ex.title}
              </button>
            ))}
          </div>

          <p className="example-desc">{TS_EXAMPLES[tsExample].description}</p>

          <div className="pl-code-layout">
            <div className="pl-code-panel">
              <div className="code-header ts-header">
                <span className="code-lang">TypeScript</span>
                <span className="code-file">{TS_EXAMPLES[tsExample].title}.ts</span>
              </div>
              <div className="code-body ts-theme">
                {renderCodeLines(TS_EXAMPLES[tsExample].code, -1, TS_EXAMPLES[tsExample].concepts)}
              </div>
            </div>

            <div className="pl-concept-panel">
              <h3>关键概念解析</h3>
              {TS_EXAMPLES[tsExample].concepts.map((c, i) => (
                <div key={i} className="concept-card">
                  <div className="concept-card-header">
                    <span className="concept-line">第 {c.line} 行</span>
                    <span className="concept-title">{c.title}</span>
                  </div>
                  <p className="concept-detail">{c.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          语言对比
          ══════════════════════════════════════ */}
      {activeSection === 'compare' && (
        <section className="pl-section">
          <h2 className="pl-section-title">⚖️ 六种语言对比</h2>
          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>对比维度</th>
                  <th className="asm-th">⚙️ 汇编</th>
                  <th className="html-th">🌐 HTML</th>
                  <th className="c-th">🔧 C</th>
                  <th className="java-th">☕ Java</th>
                  <th className="sql-th">🗄️ SQL</th>
                  <th className="ts-th">🚀 TypeScript</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={i}>
                    <td className="compare-dim">{row.dimension}</td>
                    <td>{row.asm}</td>
                    <td>{row.html}</td>
                    <td>{row.c}</td>
                    <td>{row.java}</td>
                    <td>{row.sql}</td>
                    <td>{row.ts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 典型用例对比 */}
          <h3 className="compare-subtitle">不同语言的典型用例</h3>
          <div className="compare-code-grid">
            <div className="compare-code-card asm-card">
              <h4>⚙️ 汇编</h4>
              <pre>{`mov eax, [num1]
add eax, [num2]
mov [result], eax`}</pre>
              <p>系统底层、嵌入式开发</p>
            </div>
            <div className="compare-code-card html-card">
              <h4>🌐 HTML</h4>
              <pre>{`&lt;div class="card"&gt;
  &lt;h1&gt;标题&lt;/h1&gt;
  &lt;p&gt;内容&lt;/p&gt;
&lt;/div&gt;`}</pre>
              <p>定义网页结构和内容</p>
            </div>
            <div className="compare-code-card c-card">
              <h4>🔧 C</h4>
              <pre>{`void swap(int *a, int *b) {
    int t = *a; *a = *b; *b = t;
}`}</pre>
              <p>系统编程、驱动开发</p>
            </div>
            <div className="compare-code-card java-card">
              <h4>☕ Java</h4>
              <pre>{`public class UserService {
    public User findById(Long id) { ... }
}`}</pre>
              <p>企业级应用开发</p>
            </div>
            <div className="compare-code-card sql-card">
              <h4>🗄️ SQL</h4>
              <pre>{`SELECT u.name, COUNT(o.id)
FROM users u
JOIN orders o ON u.id = o.user_id
GROUP BY u.id;`}</pre>
              <p>数据库查询和分析</p>
            </div>
            <div className="compare-code-card ts-card">
              <h4>🚀 TypeScript</h4>
              <pre>{`interface User {
    id: number;
    name: string;
}
const user: User = { ... };`}</pre>
              <p>类型安全的前端开发</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default ProgrammingLanguageLesson;
