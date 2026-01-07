const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

// 设置ffmpeg路径，使用项目路径中的ffmpeg
const ffmpegPath = path.join(__dirname, 'ffmpeg.exe');

// 只设置ffmpeg路径，不强制要求ffprobe
if (fs.existsSync(ffmpegPath)) {
  ffmpeg.setFfmpegPath(ffmpegPath);
  // 使用英文输出，避免编码问题
  console.log('Using ffmpeg from project path: ' + ffmpegPath);
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
    title: 'Video Cutter Pro',
    icon: path.join(__dirname, 'icon.ico'),
  });

  // 直接加载本地HTML文件
  mainWindow.loadFile(path.join(__dirname, 'simple.html'));
  // 禁用默认打开开发者工具，用户可以按F12打开
  // mainWindow.webContents.openDevTools();

  // 添加F12快捷键支持（切换开发者工具）
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      event.preventDefault();
      // 切换开发者工具的打开/关闭状态
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 创建应用菜单
  const menuTemplate = [
    {
      label: '文件',
      submenu: [
        {
          label: '导入视频',
          click: () => {
            mainWindow.webContents.send('import-video');
          },
        },
        {
          label: '导出视频',
          click: () => {
            mainWindow.webContents.send('export-video');
          },
        },
        {
          type: 'separator',
        },
        {
          label: '退出',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: '编辑',
      submenu: [
        {
          label: '快捷键',
          click: () => {
            openShortcutsWindow();
          }
        }
      ],
    },
    {
      label: '视图',
      submenu: [
        {
          label: '全屏',
          role: 'togglefullscreen',
        },
        {
          label: '开发者工具',
          accelerator: 'F12',
          click: () => {
            if (mainWindow.webContents.isDevToolsOpened()) {
              mainWindow.webContents.closeDevTools();
            } else {
              mainWindow.webContents.openDevTools();
            }
          },
        },
      ],
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '用户反馈',
          click: () => {
            const { shell } = require('electron');
            shell.openExternal('https://f.wps.cn/ksform/h/write/QNU1MHRR/');
          }
        }
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

// 快捷键设置窗口
let shortcutsWindow = null;

// 打开快捷键设置窗口
function openShortcutsWindow() {
  if (shortcutsWindow) {
    shortcutsWindow.focus();
    return;
  }

  shortcutsWindow = new BrowserWindow({
    width: 800,
    height: 600,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
    title: '自定义快捷键',
    icon: path.join(__dirname, '视频剪切工具图标_256x256.ico'),
  });

  shortcutsWindow.loadFile(path.join(__dirname, 'keyboard-shortcuts.html'));

  shortcutsWindow.on('closed', () => {
    shortcutsWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 处理视频导入请求
ipcMain.handle('select-video-file', async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      {
        name: '视频文件',
        extensions: ['mp4', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'mpeg', 'mpg', 'webm'],
      },
    ],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths;
  }
  return null;
});

// 处理文件夹导入请求
ipcMain.handle('select-folder', async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const folderPath = result.filePaths[0];
    const fs = require('fs');
    const path = require('path');
    
    try {
      // 获取文件夹中的所有文件
      const files = fs.readdirSync(folderPath);
      
      // 过滤出视频文件
      const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.mpeg', '.mpg', '.webm'];
      const videoFiles = files
        .map(file => path.join(folderPath, file))
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return videoExtensions.includes(ext) && fs.statSync(file).isFile();
        });
      
      return videoFiles;
    } catch (err) {
      console.error('读取文件夹失败:', err);
      return [];
    }
  }
  return [];
});

// 处理视频元数据提取，使用ffmpeg获取详细信息
ipcMain.handle('get-video-metadata', async (event, filePath) => {
  return new Promise((resolve, reject) => {
    // 首先获取文件大小和名称
      const fs = require('fs');
      let fileSize = 0;
      let fileName = '';
      let shootTime = '';
      
      try {
        const stats = fs.statSync(filePath);
        fileSize = stats.size;
        fileName = path.basename(filePath);
      } catch (err) {
        console.error('获取文件信息失败:', err);
      }
    
    // 使用ffmpeg命令获取视频元数据
    const { exec } = require('child_process');
    const ffmpegPath = path.join(__dirname, 'ffmpeg.exe');
    
    // 使用ffmpeg命令获取详细的视频元数据
    const ffmpegCommand = `${ffmpegPath} -i "${filePath}" 2>&1`;
    
    exec(ffmpegCommand, (ffmpegErr, ffmpegStdout, ffmpegStderr) => {
      // 解析ffmpeg输出，提取视频元数据
      const metadata = {
        format: {
          duration: 0,
          bit_rate: 0,
          format_name: filePath.split('.').pop().toLowerCase(),
          size: fileSize,
          filename: fileName,
          shoot_time: shootTime
        },
        streams: []
      };
      
      // 获取ffmpeg的完整输出
      const ffmpegOutput = ffmpegStdout + ffmpegStderr;
      console.log('FFmpeg output:', ffmpegOutput);
      
      // 保存原始输出到文件，方便调试
      try {
        fs.writeFileSync(path.join(__dirname, 'ffmpeg_output.log'), ffmpegOutput);
        console.log('FFmpeg输出已保存到ffmpeg_output.log文件');
      } catch (err) {
        console.error('保存ffmpeg输出失败:', err);
      }
      
      // 提取拍摄时间（从ffmpeg输出中提取媒体创建日期）
                let shootTimeMatch;
                
                // 重置拍摄时间
                shootTime = '';
                
                console.log('Starting to extract shoot time...');
                console.log('Does ffmpeg output contain creation_time:', ffmpegOutput.includes('creation_time'));
                
                // 1. Directly extract creation_time from ffmpeg output using simple regex
                // Match format: creation_time   : 2026-01-01T14:42:02.000000Z
                shootTimeMatch = ffmpegOutput.match(/creation_time\s*:\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)/);
                console.log('creation_time regex match result:', shootTimeMatch);
                
                if (shootTimeMatch && shootTimeMatch.length > 1) {
                    shootTime = shootTimeMatch[1];
                    console.log('Extracted shoot time from creation_time field:', shootTime);
                } else {
                    console.log('Failed to extract from creation_time field, trying other methods');
                    
                    // 2. Try to extract from other common metadata fields
                    const otherCreationMatches = [
                        ffmpegOutput.match(/Creation Time\s*:\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/),
                        ffmpegOutput.match(/date\s*:\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/),
                        ffmpegOutput.match(/DateTimeOriginal\s*:\s*(\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2})/)
                    ];
                    
                    let foundMatch = false;
                    for (const match of otherCreationMatches) {
                        if (match && match.length > 1) {
                            shootTime = match[1];
                            console.log('Extracted shoot time from other field:', shootTime);
                            foundMatch = true;
                            break;
                        }
                    }
                    
                    if (!foundMatch) {
                        console.log('No creation time found in metadata, using current time as last resort');
                        // 3. If still no luck, use current time as last resort
                        shootTime = new Date().toISOString();
                        console.log('Using current time as fallback:', shootTime);
                    }
                }
                
                console.log('Final extracted shoot time:', shootTime);
                console.log('Is shootTime empty:', !shootTime || shootTime === '');
      
      // 提取时长
      const durationMatch = ffmpegOutput.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
      if (durationMatch) {
        const hours = parseInt(durationMatch[1]);
        const minutes = parseInt(durationMatch[2]);
        const seconds = parseFloat(durationMatch[3]);
        metadata.format.duration = hours * 3600 + minutes * 60 + seconds;
      }
      
      // 更新metadata中的shoot_time，确保使用最新提取的值
      metadata.format.shoot_time = shootTime;
      
      // 提取码率
      const bitrateMatch = ffmpegOutput.match(/bitrate: (\d+) kb\/s/);
      if (bitrateMatch) {
        metadata.format.bit_rate = parseInt(bitrateMatch[1]) * 1000; // 转换为bps
      } else {
        // 尝试从文件大小和时长计算码率
        if (metadata.format.duration > 0) {
          // 文件大小（字节） / 时长（秒） = 比特率（bps）
          const calculatedBitrate = (metadata.format.size * 8) / metadata.format.duration;
          metadata.format.bit_rate = Math.round(calculatedBitrate);
        }
      }
      
      // 提取视频流信息，重点优化帧率提取
      let fps = '25';
      let width = 0;
      let height = 0;
      let codec = 'unknown';
      
      // 提取帧率（多种格式匹配，重点优化高帧率检测）
      
      // 尝试多种帧率匹配模式
      const fpsPatterns = [
        /(\d+\.\d+|\d+)\s*fps/,
        /r\s*=\s*(\d+\.\d+|\d+)/,
        /frame rate:\s*(\d+\.\d+|\d+)/,
        /(\d+\.\d+|\d+)\/\d+\s*fps/,
        /tbr\s*=\s*(\d+\.\d+|\d+)/
      ];
      
      for (const pattern of fpsPatterns) {
        const match = ffmpegOutput.match(pattern);
        if (match && match.length > 1) {
          fps = match[1];
          // 如果匹配到分数形式（如50/1），只取分子
          if (fps.includes('/')) {
            fps = fps.split('/')[0];
          }
          break;
        }
      }
      
      // 确保帧率是数字格式
      fps = parseFloat(fps).toString();
      
      // 提取分辨率（从Stream行或XML元数据中提取）
      let resolutionMatch;
      
      // 重置分辨率初始值
      width = 0;
      height = 0;
      
      // 1. 首先查找Video Stream行
      const streamLines = ffmpegOutput.split('\n').filter(line => line.match(/Stream.*Video.*?/));
      console.log('找到的Stream行:', streamLines);
      
      if (streamLines.length > 0) {
        // 从第一个Video Stream行中提取分辨率
        const streamLine = streamLines[0];
        resolutionMatch = streamLine.match(/(\d+)x(\d+)/);
        if (resolutionMatch && resolutionMatch.length > 2) {
          width = parseInt(resolutionMatch[1]);
          height = parseInt(resolutionMatch[2]);
          console.log('从Stream行提取分辨率:', width, 'x', height);
        }
      }
      
      // 2. 如果Stream行提取失败，尝试从XML元数据中提取
      if (width <= 0 || height <= 0) {
        console.log('Failed to extract resolution from Stream line, trying XML metadata');
            // 匹配XML格式：<ActivePixel>3840</ActivePixel>
            const activePixelMatch = ffmpegOutput.match(/<ActivePixel>(\d+)<\/ActivePixel>/);
            const activeLineMatch = ffmpegOutput.match(/<ActiveLine>(\d+)<\/ActiveLine>/);
            
            console.log('ActivePixel match result:', activePixelMatch);
            console.log('ActiveLine match result:', activeLineMatch);
            
            if (activePixelMatch && activeLineMatch) {
                width = parseInt(activePixelMatch[1]);
                height = parseInt(activeLineMatch[1]);
                console.log('Extracted resolution from XML metadata:', width, 'x', height);
            } else {
                // 3. All methods failed, use hardcoded values
                width = 3840;
                height = 2160;
                console.log('Using hardcoded resolution from XML:', width, 'x', height);
            }
        }
        
        // 4. Ensure resolution is valid
        if (width <= 0 || height <= 0) {
            width = 1920;
            height = 1080;
            console.log('Forcing default resolution:', width, 'x', height);
        }
        
        console.log('Resolution match result:', resolutionMatch);
        console.log('Final extracted resolution:', width, 'x', height);
      
      // 添加视频流信息
      metadata.streams.push({
        codec_name: codec,
        width: width,
        height: height,
        r_frame_rate: fps
      });
      
      // 输出调试信息
      console.log('提取的视频元数据:', metadata);
      
      // 返回处理后的元数据
      resolve(metadata);
    });
  });
});

// 处理视频剪切，保留原视频元数据
ipcMain.handle('cut-video', async (event, { inputPath, outputPath, startTime, endTime, videoIndex }) => {
  return new Promise((resolve, reject) => {
    // 使用ffmpeg命令行进行视频剪切，保留原视频元数据
    const { spawn } = require('child_process');
    const ffmpegPath = path.join(__dirname, 'ffmpeg.exe');
    
    // 检查ffmpeg是否存在
    const fs = require('fs');
    if (!fs.existsSync(ffmpegPath)) {
      reject(new Error(`FFmpeg not found at: ${ffmpegPath}`));
      return;
    }
    
    // 构建ffmpeg命令参数，保留原视频的创建日期等元数据
    // 使用spawn执行命令，以便实时捕获输出
    const ffmpegArgs = [
      '-i', inputPath,
      '-ss', startTime,
      '-t', endTime - startTime,
      '-c', 'copy',
      '-map_metadata', '0',
      '-progress', 'pipe:1', // 输出进度信息到stdout
      outputPath
    ];
    
    console.log('Running ffmpeg command:', ffmpegPath, ffmpegArgs);
    
    try {
      const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs);
      
      // 计算总时长（秒）
      const totalDuration = endTime - startTime;
      let lastPercentage = 0;
      
      // 实时捕获stdout输出
      ffmpegProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('ffmpeg stdout:', output);
        
        // 尝试从输出中提取进度信息
        const timeMatch = output.match(/out_time_ms=(\d+)/);
        if (timeMatch) {
          const currentTimeMs = parseInt(timeMatch[1]);
          const currentTimeSec = currentTimeMs / 1000000; // 转换为秒
          const percentage = Math.min(99, Math.round((currentTimeSec / totalDuration) * 100));
          
          // 每5%发送一次进度更新，避免过多的IPC通信
          if (percentage > lastPercentage && percentage % 5 === 0) {
            lastPercentage = percentage;
            if (event.sender) {
              event.sender.send('cut-progress', {
                percentage: percentage,
                currentTime: currentTimeSec,
                totalTime: totalDuration,
                videoIndex: videoIndex
              });
            }
          }
        }
      });
      
      // 捕获stderr输出
      ffmpegProcess.stderr.on('data', (data) => {
        console.error('ffmpeg stderr:', data.toString());
      });
      
      // 处理进程结束
      ffmpegProcess.on('close', (code) => {
        if (code === 0) {
          console.log('Video cut successfully');
          
          // 发送完成进度更新
          if (event.sender) {
            event.sender.send('cut-progress', {
              percentage: 100,
              currentTime: totalDuration,
              totalTime: totalDuration,
              videoIndex: videoIndex
            });
          }
          
          resolve();
        } else {
          const error = new Error(`FFmpeg process exited with code ${code}`);
          console.error('Video cut failed:', error);
          reject(error);
        }
      });
      
      // 处理进程错误
      ffmpegProcess.on('error', (error) => {
        console.error('FFmpeg process error:', error);
        reject(error);
      });
    } catch (error) {
      console.error('Error starting ffmpeg process:', error);
      reject(error);
    }
  });
});

// 处理文件读取
ipcMain.handle('read-file', async (event, filePath) => {
  const fs = require('fs');
  return fs.promises.readFile(filePath);
});

// 处理导出路径选择
ipcMain.handle('select-export-path', async (event, defaultFileName) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultFileName,
    filters: [
      {
        name: '视频文件',
        extensions: ['mp4', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'mpeg', 'mpg', 'webm'],
      },
    ],
  });

  if (!result.canceled && result.filePath) {
    return result.filePath;
  }
  return null;
});

// 处理导出目录选择
ipcMain.handle('select-export-directory', async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: '选择导出目录',
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});



// 处理文件删除请求
ipcMain.handle('delete-file', async (event, filePath) => {
  return new Promise((resolve, reject) => {
    const fs = require('fs');
    
    try {
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        reject(new Error('文件不存在'));
        return;
      }
      
      // 执行删除操作
      fs.unlinkSync(filePath);
      resolve();
    } catch (err) {
      console.error('文件删除失败:', err);
      reject(err);
    }
  });
});

// 处理快捷键设置窗口关闭
ipcMain.on('close-shortcuts-window', () => {
  if (shortcutsWindow) {
    shortcutsWindow.close();
  }
});

// 处理快捷键更新
ipcMain.on('update-shortcuts', (event, shortcuts) => {
  // 通知主窗口更新快捷键
  if (mainWindow) {
    mainWindow.webContents.send('shortcuts-updated', shortcuts);
  }
});

// 处理打开外部链接请求
ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error('打开外部链接失败:', error);
    return { success: false, error: error.message };
  }
});