let fontCarrier = require('font-carrier');
let fs = require('fs');

const len = 1024;

const font = fontCarrier.create({
  id: 'font-mustom',
  horizAdvX: len,
  vertAdvY: len
});

font.setFontface({
  fontFamily: 'Font Mustom',
  unitsPerEm: len,
  ascent: 0.8 * len,
  descent: -0.2 * len
});

const svgPath = './src/svg/';

const cssTemplatePath = './src/template.css';

const htmlTemplatePath = './src/template.html';

const targetFontsPath = './docs/font/font-mustom';

const targetCssPath = './docs/css/font-mustom.css';

const targetHtmlPath = './docs/index.html';

const targetSvgPath = './docs/';   // 独立 SVG 的输出目录

const fontFamilyClass = 'fm';

const prefix = `${fontFamilyClass}-`;

const uniOffset = 0x78;

// 不走字体转换的独立 SVG 图标（描边图形，保留原样）
const standaloneSvgs = ['zmfk'];

fs.readdir(svgPath, (err, files) => {
  if (err) {
    return console.error(err);
  }

  let css = fs.readFileSync(cssTemplatePath).toString();
  let html = fs.readFileSync(htmlTemplatePath).toString();
  let htmlTemp = '';
  let uniIndex = 0;
  files.forEach((file) => {
    if (file.endsWith('.svg')) {
      const name = file.replace('.svg', '');

      // 独立 SVG：复制到 docs/，不参与字体转换
      if (standaloneSvgs.includes(name)) {
        fs.copyFileSync(svgPath + file, targetSvgPath + file);
        htmlTemp += `<div class="icon"><img class="svg-icon" src="./${file}" alt="${name}" /><span>${prefix}${name}</span></div>`;
        return;
      }

      // 普通 SVG：转字体
      let fPath = svgPath + file;
      let num = (uniOffset + uniIndex).toString(16);
      uniIndex++;
      let svg = fs.readFileSync(fPath).toString();
      let className = prefix + name;
      font.setSvg(`&#x${num};`, svg);
      css += `.${className}:before{content:'\\${num}'}`;
      htmlTemp += `<div class="icon"><i class="${fontFamilyClass} ${className} ${fontFamilyClass}-sq"></i><span>${className}</span></div>`;
    }
  });

  font.output({
    path: targetFontsPath
  });

  fs.writeFileSync(targetCssPath, css);
  fs.writeFileSync(targetHtmlPath, html.replace('<!--MUSTOM-->', htmlTemp));
});