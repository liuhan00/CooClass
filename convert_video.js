const ffmpeg = require('ffmpeg-static');
const { exec } = require('child_process');
const path = require('path');

// 源视频文件路径和目标视频文件路径
const sourceVideoPath = path.join(__dirname, 'src', 'static', 'login.mp4');
const targetVideoPath = path.join(__dirname, 'src', 'static', 'login_h264.mp4');

// 构建ffmpeg命令，将HEVC编码转换为H.264编码
const command = `"${ffmpeg}" -i "${sourceVideoPath}" -c:v libx264 -c:a aac -strict experimental "${targetVideoPath}"`;

console.log('正在转换视频格式...');
console.log('命令:', command);

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('视频转换失败:', error);
    return;
  }
  
  if (stderr) {
    console.log('转换过程中的信息:', stderr);
  }
  
  console.log('视频转换完成!');
  console.log('源文件:', sourceVideoPath);
  console.log('目标文件:', targetVideoPath);
});