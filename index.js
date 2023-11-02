const splatoon3api = require("splatoon3api");
const { get } = require("http");
const Splatoon3 = new splatoon3api.Client("zh-CN");
const { registerFont } = require("canvas");
const path = require("path");

// 注册字体文件
const fontPath = path.join(__dirname, "./Text.ttf"); // 根据字体文件的相对路径
registerFont(fontPath, { family: "CustomFont" });

async function imageBasic(
  stage1ImgUrl,
  stage1Name,
  stage2ImgUrl,
  stage2Name,
  bath_bg,
  outputFileName
) {
  const { createCanvas, loadImage } = require("canvas");
  const fs = require("fs");
  // 创建 Canvas 画布
  const canvas = createCanvas(398, 606);
  const ctx = canvas.getContext("2d");

  // 加载背景图像
  const background = await loadImage(bath_bg);

  // 绘制背景图像
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // 加载 stage1ImgUrl 图像
  const stage1Img = await loadImage(stage1ImgUrl);

  // 计算 stage1Img 的宽度（75% 的画布宽度）
  const stage1ImgWidth = canvas.width * 0.75;

  // 插入 stage1Img 到画布的约 220 像素高度位置
  // 将 stage1Img 向右移动 50 像素
  const stage1Y = 210;
  const stage1X = 50;

  // 创建小圆角遮罩并插入 stage1Img
  ctx.save();
  const radius = 5; // 圆角半径
  ctx.beginPath();
  ctx.moveTo(stage1X + radius, stage1Y);
  ctx.lineTo(stage1X + stage1ImgWidth - radius, stage1Y);
  ctx.quadraticCurveTo(
    stage1X + stage1ImgWidth,
    stage1Y,
    stage1X + stage1ImgWidth,
    stage1Y + radius
  );
  ctx.lineTo(stage1X + stage1ImgWidth, stage1Y + stage1ImgWidth * 0.5 - radius);
  ctx.quadraticCurveTo(
    stage1X + stage1ImgWidth,
    stage1Y + stage1ImgWidth * 0.5,
    stage1X + stage1ImgWidth - radius,
    stage1Y + stage1ImgWidth * 0.5
  );
  ctx.lineTo(stage1X + radius, stage1Y + stage1ImgWidth * 0.5);
  ctx.quadraticCurveTo(
    stage1X,
    stage1Y + stage1ImgWidth * 0.5,
    stage1X,
    stage1Y + stage1ImgWidth * 0.5 - radius
  );
  ctx.lineTo(stage1X, stage1Y + radius);
  ctx.quadraticCurveTo(stage1X, stage1Y, stage1X + radius, stage1Y);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(
    stage1Img,
    stage1X,
    stage1Y,
    stage1ImgWidth,
    stage1ImgWidth * 0.5
  );

  ctx.restore();

  // 加载 stage2ImgUrl 图像
  const stage2Img = await loadImage(stage2ImgUrl);

  // 计算 stage2Img 的宽度（75% 的画布宽度）
  const stage2ImgWidth = canvas.width * 0.75;

  // 插入 stage2Img 到画布的约 20 像素下方
  // 将 stage2Img 向右移动 50 像素
  const stage2Y = stage1Y + stage1ImgWidth * 0.5 + 20;
  const stage2X = 50;

  // 创建小圆角遮罩并插入 stage2Img
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(stage2X + radius, stage2Y);
  ctx.lineTo(stage2X + stage2ImgWidth - radius, stage2Y);
  ctx.quadraticCurveTo(
    stage2X + stage2ImgWidth,
    stage2Y,
    stage2X + stage2ImgWidth,
    stage2Y + radius
  );
  ctx.lineTo(stage2X + stage2ImgWidth, stage2Y + stage2ImgWidth * 0.5 - radius);
  ctx.quadraticCurveTo(
    stage2X + stage2ImgWidth,
    stage2Y + stage2ImgWidth * 0.5,
    stage2X + stage2ImgWidth - radius,
    stage2Y + stage2ImgWidth * 0.5
  );
  ctx.lineTo(stage2X + radius, stage2Y + stage2ImgWidth * 0.5);
  ctx.quadraticCurveTo(
    stage2X,
    stage2Y + stage2ImgWidth * 0.5,
    stage2X,
    stage2Y + stage2ImgWidth * 0.5 - radius
  );
  ctx.lineTo(stage2X, stage2Y + radius);
  ctx.quadraticCurveTo(stage2X, stage2Y, stage2X + radius, stage2Y);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(
    stage2Img,
    stage2X,
    stage2Y,
    stage2ImgWidth,
    stage2ImgWidth * 0.5
  );

  ctx.restore();
  // 绘制黑色矩形，位于 stage1Img 下方
  ctx.fillStyle = "black";
  ctx.fillRect(
    stage1X + 32,
    stage1Y + stage1ImgWidth * 0.5 - 20,
    stage1ImgWidth * 0.8,
    30
  );
  // 绘制黑色矩形，位于stage2下方
  ctx.fillStyle = "black";
  ctx.fillRect(
    stage1X + 32,
    stage2Y + stage2ImgWidth * 0.5 - 10,
    stage1ImgWidth * 0.8,
    30
  );

  // 绘制 stage1Name 文本
  ctx.fillStyle = "white";
  ctx.font = "16px CustomFont"; // 使用你注册的字体
  const stage1NameMetrics = ctx.measureText(stage1Name);
  const stage1NameX =
    stage1X + 32 + (stage1ImgWidth * 0.8 - stage1NameMetrics.width) / 2;
  const stage1NameY = stage1Y + stage1ImgWidth * 0.5; // 调整 Y 坐标
  ctx.fillText(stage1Name, stage1NameX, stage1NameY);

  // 绘制 stage2Name 文本
  const stage2NameMetrics = ctx.measureText(stage2Name);
  const stage2NameX =
    stage2X + 32 + (stage2ImgWidth * 0.8 - stage2NameMetrics.width) / 2;
  const stage2NameY = stage2Y + stage2ImgWidth * 0.5 + (30 - 16) / 2 + 5; // 调整 Y 坐标
  ctx.fillText(stage2Name, stage2NameX, stage2NameY);

  // 保存画布为图片文件
  const stream = fs.createWriteStream(outputFileName);
  const out = canvas.createPNGStream();
  out.pipe(stream);
  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      console.log(`Image saved to ${outputFileName}`);
      resolve();
    });
    out.on("error", reject);
  });
}

async function imageBasic2(pic_bg, rule, rulesImgUrl, outputFileName) {
  const { createCanvas, loadImage } = require("canvas");
  const fs = require("fs");

  // 加载背景图像
  const background = await loadImage(pic_bg);

  // 创建 Canvas 画布，大小与背景图像相同
  const canvas = createCanvas(background.width, background.height);
  const ctx = canvas.getContext("2d");

  // 绘制背景图像
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // 设置文本样式（黑色外描边和白色内填充）
  ctx.fillStyle = "white"; // 字体填充颜色
  ctx.font = "18px CustomFont"; // 字体大小和类型
  ctx.strokeStyle = "black"; // 外描边颜色
  ctx.lineWidth = 2; // 外描边宽度

  // 计算文本绘制位置
  const ruleX = canvas.width - 160; // 右上角 X 坐标
  const ruleY = 200; // 右上角 Y 坐标

  // 绘制文本，同时应用外描边
  ctx.strokeText(rule, ruleX, ruleY);
  ctx.fillText(rule, ruleX, ruleY);

  // 加载 rulesImgUrl 图像
  const rulesImg = await loadImage(rulesImgUrl);

  // 绘制 rulesImgUrl 图像在 rule 左边，大小为 36x36
  const rulesImgWidth = 36;
  const rulesImgHeight = 36;
  const rulesImgX = ruleX - rulesImgWidth - 5; // 左边的 X 坐标
  const rulesImgY = ruleY - rulesImgHeight + 8; // 居中对齐
  ctx.drawImage(rulesImg, rulesImgX, rulesImgY, rulesImgWidth, rulesImgHeight);

  // 保存画布为图片文件
  const stream = fs.createWriteStream(outputFileName);
  const out = canvas.createPNGStream();
  out.pipe(stream);

  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      console.log(`Image saved to ${outputFileName}`);
      // 删除源文件
      fs.unlink(pic_bg, (err) => {
        if (err) {
          console.error(`Error deleting source file: ${err}`);
        } else {
          console.log(`Source file ${pic_bg} deleted.`);
        }
      });
      resolve();
    });
    out.on("error", reject);
  });
}

async function finalImg(formattedDateTime) {
  const { createCanvas, loadImage } = require("canvas");
  const fs = require("fs");

  // 创建 Canvas 画布
  const canvas = createCanvas(1508, 814); // 自定义画布大小
  const ctx = canvas.getContext("2d");

  // 加载背景图像
  const bgPath = path.join(__dirname, "./img/bg.png");
  const background = await loadImage(bgPath);

  // 绘制背景图像
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // 读取 out 目录下的图像文件
  const outPath = path.join(__dirname, "./out");
  const imageFiles = fs.readdirSync(outPath);

  // 需要旋转的图像索引
  const rotateCounterclockwise = [0, 2]; // 第一张和第三张图像
  const rotateClockwise = [1, 3]; // 第二张和第四张图像

  // 遍历读取的文件，加载并绘制在画布上
  let currentX = 0; // 起始 X 坐标
  const spacing = 20; // 图像之间的间距

  for (let i = 0; i < imageFiles.length; i++) {
    const imageFile = imageFiles[i];
    const imagePath = path.join(outPath, imageFile);
    const image = await loadImage(imagePath);

    // 旋转角度（弧度制）
    let rotationAngle = 0;

    if (rotateCounterclockwise.includes(i)) {
      // 逆时针旋转2度
      rotationAngle = -2 * (Math.PI / 180);
    } else if (rotateClockwise.includes(i)) {
      // 顺时针旋转2度
      rotationAngle = 2 * (Math.PI / 180);
    }

    // 保存当前的绘图状态
    ctx.save();

    // 设置旋转中心点
    ctx.translate(currentX + 398 / 2, 314);

    // 旋转图像
    ctx.rotate(rotationAngle);

    // 绘制图像
    ctx.drawImage(image, -398 / 2, -606 / 2, 398, 606);

    // 恢复之前的绘图状态
    ctx.restore();

    // 更新下一个图像的 X 坐标位置
    currentX += 350 + spacing;
  }

  // 绘制 formattedDateTime 文本
  ctx.fillStyle = "white";
  ctx.font = "20px CustomFont";
  //const formattedDateTimeMetrics = ctx.measureText(formattedDateTime);
  const dateTimeX = 600;
  const dateTimeY = canvas.height - 105;
  ctx.fillText(formattedDateTime, dateTimeX, dateTimeY);

  // 保存画布为 final.png 文件
  const outputFileName = path.join(__dirname, "./final.png");
  const stream = fs.createWriteStream(outputFileName);
  const out = canvas.createPNGStream();
  out.pipe(stream);

  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      console.log(`Image saved to ${outputFileName}`);
      resolve();
    });
    out.on("error", reject);
  });
}

async function main() {
  const res = await new Promise((resolve, reject) => {
    Splatoon3.getStages((result) => {
      resolve(result);
    });
  });

  // 确保变量名正确
  //const regularRule = res.regular[0].rules;
  //const regularRuleImage = res.regular[0].rulesImg;
  const thisTime = res.regular[0].start_time;
  console.log(thisTime);
  const regularStage1Name = res.regular[0].stage1.name;
  const regularStage1Image = res.regular[0].stage1.image;
  const regularStage2Name = res.regular[0].stage2.name;
  const regularStage2Image = res.regular[0].stage2.image;

  //当前时段挑战
  const seriesStage1Name = res.ranked[0].series.stage1.name;
  const seriesStage1Image = res.ranked[0].series.stage1.image;
  const seriesStage2Name = res.ranked[0].series.stage2.name;
  const seriesStage2Image = res.ranked[0].series.stage2.image;
  const seriesRule = res.ranked[0].series.rules;
  const seriesRuleImg = res.ranked[0].series.rulesImg;
  //获取当前时段开放
  const openStage1Name = res.ranked[0].open.stage1.name;
  const openStage1Image = res.ranked[0].open.stage1.image;
  const openStage2Name = res.ranked[0].open.stage2.name;
  const openStage2Image = res.ranked[0].open.stage2.image;
  const openRule = res.ranked[0].open.rules;
  const openRuleImg = res.ranked[0].open.rulesImg;
  //获取当前时段x赛
  const xbattleRule = res.xbattle[0].rules;
  const xbattleRuleImg = res.xbattle[0].rulesImg;
  const xbattleStage1Name = res.xbattle[0].stage1.name;
  const xbattleStage1Image = res.xbattle[0].stage1.image;
  const xbattleStage2Name = res.xbattle[0].stage2.name;
  const xbattleStage2Image = res.xbattle[0].stage2.image;

  const utcDate = new Date(thisTime);

  // 创建一个Intl.DateTimeFormat对象以在中国时区下格式化日期和时间
  const options = {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  const formatter = new Intl.DateTimeFormat("zh-CN", options);

  // 格式化日期时间
  const formattedDateTime = formatter.format(utcDate);

  // console.log(formattedDateTime);

  await imageBasic(
    regularStage1Image,
    regularStage1Name,
    regularStage2Image,
    regularStage2Name,
    "./img/regular.png",
    "./out/1regularOut.png"
  ); //涂地
  await imageBasic(
    seriesStage1Image,
    seriesStage1Name,
    seriesStage2Image,
    seriesStage2Name,
    "./img/serise.png",
    "./out/seriseOut.png"
  );
  // //console.log(res);
  // //console.log(seriesRuleImg);
  await imageBasic2(
    "./out/seriseOut.png",
    seriesRule,
    seriesRuleImg,
    "./out/2seriseOut2.png"
  ); //挑战
  await imageBasic(
    openStage1Image,
    openStage1Name,
    openStage2Image,
    openStage2Name,
    "./img/open.png",
    "./out/openOut.png"
  );
  await imageBasic2(
    "./out/openOut.png",
    openRule,
    openRuleImg,
    "./out/3openOut2.png"
  );
  //开放
  await imageBasic(
    xbattleStage1Image,
    xbattleStage1Name,
    xbattleStage2Image,
    xbattleStage2Name,
    "./img/xrank.png",
    "./out/xrankOut.png"
  );
  await imageBasic2(
    "./out/xrankOut.png",
    xbattleRule,
    xbattleRuleImg,
    "./out/4xrankOut2.png"
  );
  // //xrank;
  await finalImg(formattedDateTime);
}

main();
