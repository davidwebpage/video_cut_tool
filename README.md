# 媒体素材管理工具

一个功能强大的基于 Electron 开发的媒体素材管理工具，专为视频编辑工作流程设计，用于管理、预览和处理媒体文件。

## 功能特性

### 核心功能
- **媒体文件管理**：导入、组织和管理视频素材
- **视频处理**：基于 FFmpeg 的视频剪切、转换和元数据提取
- **批量操作**：支持批量导入和处理多个视频文件
- **元数据提取**：自动提取视频的拍摄时间、分辨率、码率等详细信息
- **快捷键支持**：丰富的键盘快捷键，提高操作效率
- **直观的用户界面**：简洁明了的界面设计，易于使用

### 技术特点
- **跨平台兼容**：基于 Electron，支持 Windows、macOS 和 Linux
- **高性能处理**：利用 FFmpeg 的强大功能进行视频处理
- **实时预览**：视频处理过程中的实时进度显示
- **灵活配置**：支持自定义 FFmpeg 路径和处理参数

## 环境要求

- **Node.js** 14.0 或更高版本
- **npm** 6.0 或更高版本
- **FFmpeg**（用于视频处理，需单独下载）
- **操作系统**：Windows 7 或更高版本，macOS 10.10 或更高版本，Linux（Ubuntu 18.04 或更高版本）

## 安装步骤

### 1. 克隆仓库

```bash
git clone https://github.com/davidwebpage/video_cut_tool.git
cd 媒体素材管理工具
```

### 2. 安装依赖

```bash
npm install
```

### 3. 安装 FFmpeg

#### Windows 系统
1. 访问 [gyan.dev](https://www.gyan.dev/ffmpeg/builds/) 下载 `ffmpeg-git-essentials.7z` 版本
2. 解压下载的文件，将 `ffmpeg.exe` 复制到项目根目录
3. 或添加 FFmpeg 到系统环境变量 PATH 中

#### macOS 系统
```bash
brew install ffmpeg
```

#### Linux 系统
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

## 运行项目

### 方法一：使用 npm 命令
```bash
npm start
```

### 方法二：使用快捷方式（Windows）
1. 找到项目根目录中的 `启动VideoCutterPro.vbs` 文件
2. 右键点击文件，选择 "发送到" → "桌面(快捷方式)"
3. 双击桌面快捷方式启动应用

## 构建项目

```bash
npm run build
```

构建完成后，可执行文件将生成在 `dist` 目录中。

## 快捷键

详见 `keyboard-shortcuts.html` 文件，包含所有支持的键盘快捷键及其功能说明。

## 项目结构

```
媒体素材管理工具/
├── .gitignore          # Git 忽略规则
├── ffmpeg.exe          # FFmpeg 可执行文件（需单独下载）
├── icon.ico            # 应用图标
├── keyboard-shortcuts.html  # 快捷键说明
├── main.js             # 主入口文件
├── package.json        # 项目配置和依赖
├── package-lock.json   # 依赖版本锁定
├── preload.js          # 预加载脚本
├── simple.html         # 应用界面
├── 启动VideoCutterPro.vbs  # Windows 启动脚本
└── README.md           # 项目说明文档
```

## 使用指南

### 基本操作
1. **导入视频**：点击 "文件" → "导入视频"，或使用快捷键
2. **选择视频片段**：在时间轴上选择需要剪切的视频片段
3. **设置剪切范围**：调整开始和结束时间
4. **导出视频**：点击 "文件" → "导出视频"，选择保存位置

### 高级功能
- **批量导入**：支持从文件夹批量导入多个视频文件
- **元数据查看**：自动显示视频的详细元数据信息
- **自定义输出格式**：支持多种视频格式的导出

## 注意事项

- **FFmpeg 安装**：本项目依赖 FFmpeg 进行视频处理，请确保正确安装
- **性能要求**：处理大型视频文件时，建议使用性能较好的计算机
- **存储空间**：视频处理过程中可能需要临时存储空间，请确保有足够的磁盘空间
- **网络连接**：首次运行时需要安装依赖，需要稳定的网络连接

## 故障排除

### 常见问题
1. **FFmpeg 未找到**：确保 `ffmpeg.exe` 已正确放置在项目根目录，或已添加到系统环境变量
2. **依赖安装失败**：尝试使用管理员权限运行命令行，或检查网络连接
3. **视频处理失败**：确保视频文件格式受 FFmpeg 支持，检查文件路径是否包含非 ASCII 字符

## 贡献指南

1. **Fork 仓库**：在 GitHub 上 fork 本仓库
2. **创建分支**：创建一个新的功能分支
3. **提交更改**：提交你的代码更改
4. **创建 Pull Request**：提交 Pull Request 到主仓库

## 许可证

MIT 许可证

## 作者

**davidwebpage**
- GitHub: [davidwebpage](https://github.com/davidwebpage)
- 邮箱: davidrushgo@163.com

## 版本历史

- **v1.0.0** (2026-01-07): 初始版本，实现基本功能