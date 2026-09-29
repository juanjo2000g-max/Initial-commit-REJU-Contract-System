// Uso: node render.js preview  |  node render.js full <salida.mp4> <audio.wav>
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const FFMPEG = process.env.FFMPEG;
(async () => {
  const mode = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:540,height:960}});
  p.on('pageerror', e => console.error('ERR', e.message));
  await p.goto('file://' + __dirname + '/anim.html');
  await p.evaluate(() => window.ready);
  const grab = t => p.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/jpeg', .92).split(',')[1]; }, t);
  if (mode === 'preview'){
    const times = process.argv.slice(3).map(Number);
    for (const t of times) fs.writeFileSync(`/tmp/claude-0/-home-user-Initial-commit-REJU-Contract-System/eae895d3-47c5-5791-ad34-31393c2671f6/scratchpad/f_${t}.jpg`, Buffer.from(await grab(t), 'base64'));
  } else {
    const [out, wav] = process.argv.slice(3);
    const ff = spawn(FFMPEG, ['-y','-loglevel','error','-f','image2pipe','-c:v','mjpeg','-framerate','30','-i','-','-i',wav,
      '-c:v','libx264','-pix_fmt','yuv420p','-crf','20','-preset','medium','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart', out], {stdio:['pipe','inherit','inherit']});
    for (let f=0; f<900; f++){
      const buf = Buffer.from(await grab(f/30), 'base64');
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 150 === 0) console.log('frame', f);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await b.close();
})();
