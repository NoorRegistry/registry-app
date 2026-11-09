// Compose App Store artwork around unmodified native iOS screen captures.
// Run from registry-app: node docs/app-store/render-assets.cjs
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const sharp = require(require.resolve('sharp', { paths: [root, path.resolve(root, '../admin-panel-backend')] }));
if (!process.env.FONTCONFIG_FILE && fs.existsSync('/opt/homebrew/etc/fonts/fonts.conf'))
  process.env.FONTCONFIG_FILE = '/opt/homebrew/etc/fonts/fonts.conf';
const out = path.join(__dirname, '2026-11-01');
const pages = [
  { name: '01-home', capture: '01-home', lines: ['Gifts you love.', 'One simple registry.'] },
  { name: '02-registries', capture: '02-registries', lines: ['Every occasion.', 'One place.'] },
  { name: '03-categories', capture: '03-categories', lines: ['Find gifts', 'by category.'] },
  { name: '04-stores', capture: '04-stores', lines: ['Explore stores', 'you’ll love.'] },
  { name: '05-registry', capture: '05-registry-detail', lines: ['Your registry.', 'Ready to share.'] },
];
const svg = (w, h, body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);
const xml = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
async function textLayer(text, size) {
  return sharp({ text: {
    text: `<span foreground="#302A27">${xml(text)}</span>`,
    font: `Open Sans Bold ${size}`, fontfile: path.join(root, 'assets/fonts/OpenSans-Bold.ttf'),
    rgba: true, dpi: 72,
  } }).png().toBuffer();
}
async function render(page, device) {
  const tablet = device === 'ipad';
  // The current tablet overview exposes a Guides resource tab. Omit that screen
  // from the upload set while Guides is hidden, without altering application UI.
  if (tablet && page.name === '02-registries') return;
  const W = tablet ? 2064 : 1320, H = tablet ? 2752 : 2868;
  const left = tablet ? 142 : 108, top = tablet ? 230 : 224;
  const font = tablet ? 115 : 103, lineHeight = tablet ? 143 : 132;
  const screenW = tablet ? 1518 : 988;
  const native = path.join(out, 'captures', device, `${page.capture}.png`);
  if (!fs.existsSync(native)) return;
  const meta = await sharp(native).metadata();
  const screenH = Math.round(screenW * meta.height / meta.width);
  const bezel = tablet ? 32 : 19, radius = tablet ? 48 : 116;
  const sx = Math.round((W - screenW) / 2), sy = tablet ? 588 : 578;
  const outerX = sx - bezel, outerY = sy - bezel;
  const outerW = screenW + 2 * bezel, outerH = screenH + 2 * bezel;
  const base = svg(W, H, `
    <defs><filter id="shadow" x="-30%" y="-15%" width="160%" height="140%"><feDropShadow dx="0" dy="22" stdDeviation="28" flood-color="#684B40" flood-opacity="0.14"/></filter></defs>
    <rect width="${W}" height="${H}" fill="#FAF2F0"/>
    <rect x="${outerX}" y="${outerY}" width="${outerW}" height="${outerH}" rx="${radius+bezel}" fill="#292827" stroke="#B6AAA4" stroke-width="3" filter="url(#shadow)"/>
    <rect x="${outerX+5}" y="${outerY+5}" width="${outerW-10}" height="${outerH-10}" rx="${radius+bezel-5}" fill="#151514" stroke="#5A5653" stroke-width="2"/>
  `);
  const mask = svg(screenW, screenH, `<rect width="${screenW}" height="${screenH}" rx="${radius}" fill="white"/>`);
  const screen = await sharp(native).resize(screenW, screenH, {fit:'fill',kernel:'lanczos3'})
    .composite([{input:mask,blend:'dest-in'}]).png().toBuffer();
  const logo = await sharp(path.join(root, 'assets/images/logo/fulllogo@3x.png')).resize(tablet ? 300 : 232).png().toBuffer();
  const layers = [{input:logo,left,top:tablet?104:100}];
  for (let i = 0; i < page.lines.length; i++) {
    const text = await textLayer(page.lines[i], font);
    const tm = await sharp(text).metadata();
    if (left + tm.width > W - left) throw new Error(`Headline exceeds margins: ${page.name}`);
    layers.push({input:text,left,top:top+i*lineHeight});
  }
  layers.push({input:screen,left:sx,top:sy});
  const dir = path.join(out, tablet?'ipad-13-2064x2752':'iphone-large-1320x2868');
  fs.mkdirSync(dir,{recursive:true});
  const file = path.join(dir,`${page.name}.png`);
  await sharp(base).composite(layers).flatten({background:'#FAF2F0'}).removeAlpha().toColourspace('srgb').png().toFile(file);
  if (!tablet) {
    const smallDir = path.join(out, 'iphone-1206x2622');fs.mkdirSync(smallDir,{recursive:true});
    // Aspect ratios differ slightly: contain the finished design without distorting the UI.
    await sharp(file).resize(1206,2622,{fit:'contain',background:'#FAF2F0'}).removeAlpha().png().toFile(path.join(smallDir,`${page.name}.png`));
  }
  return {file,width:W,height:H};
}
async function preview(device) {
  const dir = path.join(out, device==='ipad'?'ipad-13-2064x2752':'iphone-large-1320x2868');
  const files = pages.map(p=>path.join(dir,`${p.name}.png`)).filter(fs.existsSync);
  if(!files.length)return;
  const w=device==='ipad'?440:360, h=device==='ipad'?587:782, gap=18;
  const layers=await Promise.all(files.map(async(file,i)=>({input:await sharp(file).resize(w,h,{fit:'contain',background:'#FAF2F0'}).png().toBuffer(),left:gap+i*(w+gap),top:gap})));
  await sharp({create:{width:gap+files.length*(w+gap),height:h+2*gap,channels:3,background:'#F1E7E1'}}).composite(layers).png().toFile(path.join(out,`preview-${device}.png`));
}
(async()=>{
  const manifest=[];
  for(const device of ['iphone','ipad']){
    for(const page of pages){const result=await render(page,device);if(result)manifest.push({...result,headline:page.lines.join(' ')});}
    await preview(device);
  }
  fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({sourceCommit:'8906dda39218f9fc66f976406b58d26f4a58b194',method:'Native iOS simulator captures with deterministic brand framing; no generated or redrawn application UI.',pages:manifest},null,2)+'\n');
  console.log(`Rendered ${manifest.length} master images plus iPhone size variants.`);
})().catch(e=>{console.error(e);process.exitCode=1});
