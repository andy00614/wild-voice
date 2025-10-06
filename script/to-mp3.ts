// 使用 Bun 调用 ffmpeg
// 用法: bun run convert-to-mp3.ts input.wav

const inputFile = Bun.argv[2]; // 获取命令行参数
if (!inputFile) {
    console.error(
        "❌ 请指定要转换的音频文件，例如: bun run convert-to-mp3.ts input.wav",
    );
    process.exit(1);
}

const outputFile = inputFile.replace(/\.[^/.]+$/, "") + "-converted.mp3";

// ffmpeg 命令
const command = [
    "ffmpeg",
    "-y", // 覆盖已有文件
    "-i",
    inputFile, // 输入文件
    "-acodec",
    "libmp3lame",
    "-ar",
    "44100", // 采样率 44.1kHz
    "-b:a",
    "192k", // 比特率 192kbps
    outputFile,
];

// 执行命令
const proc = Bun.spawn(command, {
    stdout: "inherit",
    stderr: "inherit",
});

const exitCode = await proc.exited;
if (exitCode === 0) {
    console.log(`✅ 转换成功! 输出文件: ${outputFile}`);
} else {
    console.error(`❌ 转换失败, exit code: ${exitCode}`);
}
