import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
await import('./build-preview.mjs');
const root=path.resolve('public-preview');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.json':'application/json'};
const server=http.createServer((req,res)=>{
  try{
    let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'}).end(fs.readFileSync(file));
  }catch{res.writeHead(404).end('Not found');}
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'4188 端口已被占用，请关闭之前的预览窗口后重试。':error.message);process.exitCode=1;});
server.listen(4188,'127.0.0.1',()=>console.log('科学能量站已启动，请在浏览器打开 http://127.0.0.1:4188/\n关闭此窗口可停止预览。'));
