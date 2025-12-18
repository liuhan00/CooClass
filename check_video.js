const ffprobe = require('ffprobe-static');
const { exec } = require('child_process');
const path = require('path');

// 视频文件路径
const videoPath = path.join(__dirname, 'src', 'static', 'login.mp4');

// 执行ffprobe命令获取视频信息
exec(`"${ffprobe.path}" -v quiet -print_format json -show_format -show_streams "${videoPath}"`, (error, stdout, stderr) => {
  if (error) {
    console.error('执行ffprobe出错:', error);
    return;
  }
  
  if (stderr) {
    console.error('ffprobe错误输出:', stderr);
    return;
  }
  
  try {
    const videoInfo = JSON.parse(stdout);
    console.log('视频文件信息:');
    console.log(JSON.stringify(videoInfo, null, 2));
    
    // 检查关键信息
    if (videoInfo.format) {
      console.log('\n格式信息:');
      console.log('- 格式名称:', videoInfo.format.format_name);
      console.log('- 时长:', videoInfo.format.duration, '秒');
      console.log('- 比特率:', videoInfo.format.bit_rate, 'bps');
    }
    
    if (videoInfo.streams && videoInfo.streams.length > 0) {
      console.log('\n视频流信息:');
      const videoStream = videoInfo.streams.find(stream => stream.codec_type === 'video');
      if (videoStream) {
        console.log('- 编码格式:', videoStream.codec_name);
        console.log('- 分辨率:', videoStream.width, 'x', videoStream.height);
        console.log('- 帧率:', videoStream.avg_frame_rate);
        console.log('- 编码配置:', videoStream.codec_tag_string);
      }
      
      const audioStream = videoInfo.streams.find(stream => stream.codec_type === 'audio');
      if (audioStream) {
        console.log('\n音频流信息:');
        console.log('- 编码格式:', audioStream.codec_name);
        console.log('- 采样率:', audioStream.sample_rate, 'Hz');
        console.log('- 声道数:', audioStream.channels);
      }
    }
  } catch (parseError) {
    console.error('解析视频信息出错:', parseError);
    console.log('原始输出:', stdout);
  }
});