import {mesh,label,distance} from './rendering.js';
import {upgrades} from './data/upgrades.js';
export function createUpgrades(g){const arrow=label('⬆ 升级','#b7ff8a',32);arrow.position.set(0,6,0);g.scene.add(arrow);const arrows=[];return {
 update(dt){const u=upgrades[g.tier],affordable=g.tier<upgrades.length-1&&g.gold>=u.cost;arrow.visible=affordable;arrow.position.y=5.8+Math.sin(g.time*3)*.3;
 while(arrows.length<g.buildings.list.length){const a=mesh('cone',0xb3ff75,0,3.8,0,.22,.6,.22);g.scene.add(a);arrows.push(a);}arrows.forEach((a,i)=>{const b=g.buildings.list[i];a.visible=affordable&&!!b;if(b)a.position.set(b.x,3.9+Math.sin(g.time*3+i)*.2,b.z);});
 if(g.input.pressed.has('KeyU')){if(g.tier===upgrades.length-1)g.toast('已达最高阶：永恒之森');else if(distance(g.player.pos,g.core)>5)g.toast('靠近中央核心后按 U 升级');else if(!affordable)g.toast(`升级需要 ${u.cost} 金币`);else{g.gold-=u.cost;g.tier++;g.buildings.upgrade();g.core.maxHP+=500;g.core.hp=Math.min(g.core.maxHP,g.core.hp+1000);g.player.hp=g.player.maxHP;g.fx.slash(g.core,10,0xb8ff85);g.toast(`全局升级 · ${upgrades[g.tier].name}`,4);}}
 // A safe core provides gentle healing, supporting long survival sessions.
 if(distance(g.player.pos,g.core)<5&& !g.enemies.list.some(e=>distance(e,g.core)<7)){g.player.hp=Math.min(g.player.maxHP,g.player.hp+dt*7);g.core.hp=Math.min(g.core.maxHP,g.core.hp+dt*3);}
 }};}
