import {distance} from './rendering.js';
import {buildings} from './data/buildings.js';
import {upgrades} from './data/upgrades.js';
export function updateTowers(g,dt){const cfg=buildings.tower,u=upgrades[g.tier];for(const b of g.buildings.list){if(b.type!=='tower')continue;b.attack-=dt;const type=b.model.userData.variant;if(b.attack>0)continue;let target=null,best=cfg.range*u.range;for(const e of g.enemies.list){const d=distance(b,e);if(d<best){target=e;best=d;}}if(!target)continue;const rate=type==='laser'?.12:type==='cannon'?1.8:cfg.rate;const damage=cfg.damage*u.damage*(type==='laser'?.12/.65:type==='cannon'?2.3:1);g.projectiles.fire(b,target,type,damage);b.attack=rate;}}
