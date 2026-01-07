# 媒体素材管理工具

一个基于 Electron 开发的媒体素材管理工具，用于管理和处理媒体文件。

## 功能特性

- 媒体文件管理
- 视频处理（基于 FFmpeg）
- 快捷键支持
- 简单直观的用户界面

## 环境要求

- Node.js 14.0 或更高版本
- npm 6.0 或更高版本
- FFmpeg（用于视频处理）

## 安装步骤

### 1. 克隆仓库

```bash
git clone https://github.com/你的用户名/你的仓库名.git
cd 媒体素材管理工具
```

### 2. 安装依赖

```bash
npm install
```

### 3. 安装 FFmpeg

#### Windows 系统
1. 访问 [gyan.dev](https://www.gyan.dev/ffmpeg/builds/) 下载 `ffmpeg-git-essentials.7z` 版本（解压后只需要保留 `ffmpeg.exe` 文件）
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

```bash
npm start
```

## 构建项目

```bash
npm run build
```

## 快捷键

详见 `keyboard-shortcuts.html` 文件。

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
└── README.md           # 项目说明文档
```

## 注意事项

- 本项目使用 FFmpeg 进行视频处理，FFmpeg 是一个独立的第三方工具
- 由于 FFmpeg 文件较大，本仓库不包含 FFmpeg 可执行文件，请根据上述步骤单独下载
- 如需贡献代码，请确保遵循项目的代码风格和提交规范

## 许可证

MIT 许可证