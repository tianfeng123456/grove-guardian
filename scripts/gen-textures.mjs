import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
const dir = new URL('../public/textures/',import.meta.url); mkdirSync(dir,{recursive:true});
function crc32(b){let c=0xffffffff;for(const n of b){c^=n;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;}
function chunk(t,b){let type=Buffer.from(t),len=Buffer.alloc(4),crc=Buffer.alloc(4);len.writeUInt32BE(b.length);crc.writeUInt32BE(crc32(Buffer.concat([type,b])));return Buffer.concat([len,type,b,crc]);}
let seed=7821;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
for(const [name,color] of Object.entries({grass:[98,158,76],bark:[139,89,48],stone:[139,157,162],core:[229,196,127]})){
 const n=64,raw=Buffer.alloc(n*(n*4+1));for(let y=0;y<n;y++)for(let x=0;x<n;x++){let p=y*(n*4+1)+1+x*4;let v=(rnd()-.5)*22;if(name==='bark')v+=Math.sin(x*1.6)*14;if(name==='stone'&&(y%16===0||(x+(Math.floor(y/16)%2)*16)%32===0))v=-35;if(name==='core'&&(x%16<2||y%16<2))v=-30;for(let k=0;k<3;k++)raw[p+k]=Math.max(0,Math.min(255,color[k]+v));raw[p+3]=255;}
 const h=Buffer.alloc(13);h.writeUInt32BE(n,0);h.writeUInt32BE(n,4);h[8]=8;h[9]=6;writeFileSync(new URL(name+'.png',dir),Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',h),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]));
}console.log('Generated 4 procedural PNG textures');
