# 国家智慧教育公共服务平台 PDF下载器

<p align="center">

[![版本](https://img.shields.io/badge/版本-v1.0-blue.svg)](https://github.com/ming-kang/Smartedu-Pdf-Downloader/releases)
[![许可证](https://img.shields.io/badge/许可证-MIT-green.svg)](LICENSE)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-支持-orange.svg)](https://www.tampermonkey.net/)

</p>

一款为国家中小学智慧教育平台设计的 Tampermonkey 脚本，拦截 PDF.js 加载的 PDF 数据并提供下载按钮。

## 效果预览

| 新增下载按钮 | 原生下载按钮 |
|:--------:|:--------:|
| ![新增](images/Example 1.png) | ![原生](images/Example 2.jpg) |

## 功能特性

- **精准拦截** — 拦截 PDF.js 加载 PDF 的网络请求（支持 fetch 和 XMLHttpRequest）
- **一键下载** — 点击按钮即可下载当前 PDF 文件
- **智能命名** — 自动从 URL 提取有意义的文件名
- **内存优化** — 自动释放 Blob URL，减少内存占用
- **动态适配** — 使用 MutationObserver 监听页面变化，兼容动态加载的页面

## 安装

### 前置条件

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
   - [Chrome 扩展商店](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Firefox 附加组件](https://addons.mozilla.org/firefox/addon/tampermonkey/)
   - [Edge 扩展商店](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/eimhgcbhnhihcalncniljpgdjdcffeha)

### 安装方法

#### 方法一：从 GitHub 安装（推荐）

1. 点击 [smartedu-pdf-downloader.user.js](./smartedu-pdf-downloader.user.js)
2. 点击页面右上角的「Raw」按钮
3. Tampermonkey 会弹出安装确认框，点击「安装」

#### 方法二：手动安装

1. 复制 [smartedu-pdf-downloader.user.js](./smartedu-pdf-downloader.user.js) 的全部内容
2. 在 Tampermonkey 中点击「添加新脚本」
3. 粘贴代码并保存

## 使用方法

1. 打开国家智慧教育平台的教材资源页面
2. 等待页面加载完成后，点击左上角的绿色「下载 PDF」按钮
3. PDF 文件会自动下载到本地

## 常见问题

### Q: 不显示原生PDF.js下载按钮怎么办？

A: 请检查以下几点：
1. 点击 [ForceButton.user.js](./ForceButton.user.js)
2. 点击页面右上角的「Raw」按钮
3. Tampermonkey 会弹出安装确认框，点击「安装」
4. 刷新页面

## 开发

### 本地开发

```bash
# 克隆项目
git clone https://github.com/ming-kang/Smartedu-Pdf-Downloader.git
cd smartedu-pdf-downloader

# 创建新分支进行开发
git checkout -b feature/your-feature

# 编辑代码后提交
git add .
git commit -m "描述你的更改"
git push origin feature/your-feature
```

### 代码结构

```
smartedu-pdf-downloader/
├── README.md                      # 项目说明文档
├── LICENSE                        # MIT 许可证
├── smartedu-pdf-downloader.user.js # 主脚本文件
├── ForceButton.user.js            # 强制PDF.JS显示下载按钮
└── images/                        # 截图
        ├── button-preview.png
        └── success-preview.png
```

### 代码规范

- 使用 ES6+ 语法
- 遵循 [Tampermonkey 脚本规范](https://www.tampermonkey.net/documentation.php)
- 添加清晰的中文注释
- 变量和函数命名使用英文

## 更新日志

### v1.0 (2026-02-12)

- **🎉 初始版本**
- **📥** 基础 PDF 下载功能
- **🔄** 支持 fetch 和 XMLHttpRequest 拦截

## 注意事项

- ⚠️ **版权声明**：本脚本仅供学习交流使用，请尊重版权，下载的资源请在合理范围内使用
- 🔒 **隐私保护**：脚本不会收集、传输任何用户数据
- 📚 **适用场景**：适用于个人学习、研究等合理用途

## 许可证

本项目基于 MIT 许可证开源 — 详见 [LICENSE](LICENSE) 文件。

## 致谢

- 感谢 [PDF.js](https://mozilla.github.io/pdf.js/) 项目
- 感谢 [Tampermonkey](https://www.tampermonkey.net/) 社区
- 感谢所有测试和使用本脚本的朋友

---

<div align="center">

如果对你有帮助，欢迎 ⭐ **Star**！

有问题？请 [提交 Issue](https://github.com/ming-kang/Smartedu-Pdf-Downloader/issues)。

</div>
