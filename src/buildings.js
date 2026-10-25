import {THREE,mesh,group,label,distance,disposeLabel} from './rendering.js';
import {buildings as config,CELL,MAP_RADIUS} from './data/buildings.js';
import {upgrades} from './data/upgrades.js';
export const cellKey=(x,z)=>`${x},${z}`;
export function makeBuildingModel(type,tier,cx=0,cz=0){
 if(type==='wall'){
 const stone=tier>0;const gate=stone&&(cx+cz)%3===0;
 const m=group(mesh('box',stone?0x96afb0:0xa87643,0,.85,0,1.85,1.7,1.85));
 if(gate){m.children[0].scale.set(1.85,.4,1.85);m.children[0].position.y=1.65;for(const x of [-.7,.7])m.add(mesh('box',0x637d81,x,.8,0,.35,1.6,1.8));for(const x of [-.4,0,.4])m.add(mesh('box',0x30494f,x,.8,0,.09,1.5,.15));}
 else for(let i=-1;i<=1;i++)m.add(mesh(stone?'box':'cone',stone?0xc5d4cc:0xd2a268,i*.62,1.9,0,.45,.5,stone?1.8:.45));return m;
 }
 const variant=tier===0?'arrow':(cx+cz)%2===0?'laser':'cannon';
 const m=group(mesh('box',tier?0x8dabb0:0x9c6e43,0,1,0,1.55,2,1.55),mesh('box',tier?0xd7e4d7:0xe7b673,0,2,0,2,.35,2));
 if(variant==='arrow'){m.add(mesh('box',0x5b4e3a,0,2.5,0,.2,.2,1.6),mesh('box',0x805536,0,2.5,.2,1.5,.15,.2));}
 if(variant==='laser'){m.add(mesh('cylinder',0x347d83,0,2.45,0,.65,.6,.65),mesh('sphere',0x7effde,0,3,0,.4,.6,.4));}
 if(variant==='cannon'){const barrel=mesh('cylinder',0x354c5b,0,2.7,.3,.38,1.4,.38);barrel.rotation.x=Math.PI/2;m.add(mesh('sphere',0x537b80,0,2.4,0,.65,.65,.65),barrel);}m.userData.variant=variant;return m;
}
export function createBuildings(g){const list=[],map=new Map();const ghost=new THREE.Group();g.scene.add(ghost);const footprint=mesh('box',0x8fffbe,0,.1,0,1.95,.12,1.95);footprint.material=new THREE.MeshBasicMaterial({color:0x90ffc0,transparent:true,opacity:.45,depthWrite:false});ghost.add(footprint);const wire=new THREE.Box3Helper(new THREE.Box3(new THREE.Vector3(-.95,.1,-.95),new THREE.Vector3(.95,1.9,.95)),0xa8ffd2);ghost.add(wire);let costLabel=label('12 木', '#c9ffc0');costLabel.position.y=3;ghost.add(costLabel);let labelType='wall';
 function textureModel(b){const material=g.textures[g.tier?'stone':'bark'];if(material)b.model.children[0].material=material;}
 const api={list,map,selected:'wall',ghost,version:0,
 blockedAt(x,z){const cx=Math.round(x/CELL),cz=Math.round(z/CELL);return map.has(cellKey(cx,cz))||(Math.abs(x)<2.4&&Math.abs(z)<2.4);},
 valid(cx,cz){return Math.abs(cx)<=MAP_RADIUS-1&&Math.abs(cz)<=MAP_RADIUS-1&&Math.hypot(cx,cz)>2&&!map.has(cellKey(cx,cz))&&!g.trees.some(t=>t.alive&&Math.hypot(t.x-cx*CELL,t.z-cz*CELL)<1.3)&&!g.enemies.list.some(e=>Math.hypot(e.x-cx*CELL,e.z-cz*CELL)<1.4);},
 place(cx,cz,type,free=false){const cfg=config[type];if(!free&&(!api.valid(cx,cz)||g.wood<cfg.cost))return false;if(!free)g.wood-=cfg.cost;const maxHP=cfg.hp*upgrades[g.tier].wallHP;const b={cx,cz,x:cx*CELL,z:cz*CELL,type,hp:maxHP,maxHP,attack:0,bounce:.35};b.model=makeBuildingModel(type,g.tier,cx,cz);textureModel(b);b.model.position.set(b.x,0,b.z);g.scene.add(b.model);list.push(b);map.set(cellKey(cx,cz),b);api.version++;g.fx.puff(b,0xe9d19c,6);return true;},
 damage(b,n){b.hp-=n;g.fx.flash(b.model);if(b.hp<=0){g.scene.remove(b.model);list.splice(list.indexOf(b),1);map.delete(cellKey(b.cx,b.cz));api.version++;g.fx.puff(b,0xaaa99a,10);}},
 upgrade(){for(const b of list){g.scene.remove(b.model);const ratio=b.hp/b.maxHP;b.maxHP=config[b.type].hp*upgrades[g.tier].wallHP;b.hp=Math.max(b.maxHP*ratio,b.maxHP*.7);b.model=makeBuildingModel(b.type,g.tier,b.cx,b.cz);textureModel(b);b.model.position.set(b.x,0,b.z);g.scene.add(b.model);b.bounce=.5;}api.version++;},
 update(dt){if(g.input.pressed.has('Digit1'))api.selected='wall';if(g.input.pressed.has('Digit2'))api.selected='tower';const p=g.player;const cx=Math.round((p.pos.x+p.direction.x*2.5)/CELL),cz=Math.round((p.pos.z+p.direction.z*2.5)/CELL);api.cx=cx;api.cz=cz;ghost.position.set(cx*CELL,0,cz*CELL);const valid=api.valid(cx,cz)&&g.wood>=config[api.selected].cost;footprint.material.color.set(valid?0x8bffb5:0xff5858);wire.material.color.copy(footprint.material.color);ghost.visible=g.state==='playing';if(labelType!==api.selected){ghost.remove(costLabel);disposeLabel(costLabel);costLabel=label(`${config[api.selected].cost} 木`,'#e4ffd7');costLabel.position.y=3;ghost.add(costLabel);labelType=api.selected;}if(g.input.pressed.has('KeyE')){if(api.place(cx,cz,api.selected))g.toast(`${config[api.selected].name}已建造`);else g.toast(g.wood<config[api.selected].cost?'木材不足，靠近树木采集':'此处无法建造');}for(const b of list){b.bounce=Math.max(0,b.bounce-dt);b.model.scale.y=1+Math.sin(b.bounce*18)*b.bounce*.5;}}
 };return api;}
