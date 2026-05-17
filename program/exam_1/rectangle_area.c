#include <stdio.h>
#include <locale.h>

int main() {
    // 设置本地化为中文，以正确显示中文字符
    setlocale(LC_ALL, "");

    double length, width, area;

    printf("请输入长方形的长：");
    if (scanf("%lf", &length) != 1) {
        printf("输入失败！\n");
        return 1;
    }

    printf("请输入长方形的宽：");
    if (scanf("%lf", &width) != 1) {
        printf("输入失败！\n");
        return 1;
    }

    area = length * width;

    printf("长方形的面积为：%.2f\n", area);

    return 0;
}
