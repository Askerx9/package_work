const gulp = require("gulp");
const puppeteer = require("puppeteer");
const tap = require("gulp-tap");
const zip = require('gulp-zip');
const fs = require('fs');

process.setMaxListeners(0);

// EDIT
// ========================

const folder = "int+tv";
const name = `proximus-${folder}`;
const formats = [
    {w: 120, h: 600},
    {w: 160, h: 600},
    {w: 300, h: 250},
    {w: 300, h: 600},
    {w: 320, h: 50},
    // {w: 320, h: 100},
    // {w: 320, h: 480},
    {w: 468, h: 60},
    {w: 500, h: 500},
    // {w: 580, h: 400},
    // {w: 600, h: 500},
    // {w: 650, h: 1000},
    // {w: 700, h: 90},
    {w: 728, h: 90},
    // {w: 840, h: 150},
    // {w: 970, h: 90},
    {w: 970, h: 250},
];
const langs = ["nl", "fr"];
const dir = `${__dirname}/export/${folder}`;
const time = 20000;
const ImageQuality = 95;

// END EDIT
// ========================

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function images (banner) {
  return gulp.src(`src_${banner.lang}/index.html`)
  .pipe(tap(async (file) => {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setViewport({
          width: banner.format.w,
          height: banner.format.h,
          deviceScaleFactor: 1,
      });
      await page.goto(`file://${file.path}?v=1&lang=${banner.lang}`);
      await delay(time).then(async () => {
        await page.screenshot({ path: `export/${folder}/${banner.lang}/${name}_${banner.format.w}x${banner.format.h}_${banner.lang.toUpperCase()}.jpeg`, quality: ImageQuality });
        await browser.close();
        console.log(`Img exported: ${name}_${banner.format.w}x${banner.format.h}_${banner.lang}`)
      })
  }));
}

function zipSrc (banner) {
  return gulp.src(`src_${banner.lang}/*`)
  .pipe(zip(`${name}_${banner.format.w}x${banner.format.h}_${banner.lang.toUpperCase()}.zip`))
  .pipe(gulp.dest(`${dir}/${banner.lang.toLocaleUpperCase()}`));
};

function createFolder() {
  if(!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    langs.forEach(lang => {
      var langDir = `${dir}/${lang.toLocaleUpperCase()}`
      if(!fs.existsSync(langDir)){
        fs.mkdirSync(langDir);
      }
    })
  }
}

gulp.task('exportZip', async function gulpTask(){
  var banners = [];

  createFolder();

  formats.forEach(format => {
    langs.forEach(lang => {
      banners.push({format, lang})
    })
  })

  banners.map( banner => zipSrc(banner));
});

gulp.task('exportImages', async function gulpTask(){
  var banners = [];

  createFolder();

  formats.forEach(format => {
    langs.forEach(lang => {
      banners.push({format, lang})
    })
  })

  banners.map( banner => images(banner));
});
