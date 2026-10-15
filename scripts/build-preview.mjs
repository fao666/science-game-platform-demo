import fs from 'node:fs';import path from 'node:path';
const root=process.cwd(),out=path.join(root,'public-preview');
// Produce a public static bundle; never include teacher/student exports or research documents.
fs.mkdirSync(out,{recursive:true});
fs.cpSync(path.join(root,'web-demo/dist'),out,{recursive:true});
const game=path.join(root,'web-classroom-game'),dest=path.join(out,'classroom');fs.mkdirSync(dest,{recursive:true});
for(const file of ['index.html','portal.html','main.js','core.js','scene-layout.js','guidance.js','guidance.css','art.js','style.css','polish.css'])fs.copyFileSync(path.join(game,file),path.join(dest,file));
fs.cpSync(path.join(game,'assets'),path.join(dest,'assets'),{recursive:true});
fs.cpSync(path.join(game,'assets'),path.join(out,'assets'),{recursive:true});
const portal=fs.readFileSync(path.join(game,'portal.html'),'utf8').replaceAll("window.location.href = './index.html'","window.location.href = './classroom/index.html'").replaceAll("window.location.href='./index.html?teacher=1'","window.location.href='./classroom/index.html?teacher=1'");
fs.writeFileSync(path.join(out,'index.html'),portal);
fs.writeFileSync(path.join(out,'.nojekyll'),'');
if(/file:\/\/\/|D:\\Code/.test(portal))throw Error('Local filesystem URL in public landing page');
console.log('Public preview prepared: homepage + classroom game; no research records included.');
