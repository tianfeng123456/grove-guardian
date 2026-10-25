import { THREE } from './rendering.js';
export function createCamera(){const c=new THREE.OrthographicCamera(-25,25,20,-20,.1,180);c.position.set(30,42,30);c.lookAt(0,0,0);return c;}
export function resizeCamera(c,w,h){const span=w<700?23:25;c.left=-span*w/h;c.right=span*w/h;c.top=span;c.bottom=-span;c.updateProjectionMatrix();}
export function followCamera(g,dt){const p=g.player.pos;const target=new THREE.Vector3(p.x*.72+30,42,p.z*.72+30);g.camera.position.lerp(target,1-Math.exp(-dt*4));g.camera.lookAt(g.camera.position.x-30,0,g.camera.position.z-30);}
