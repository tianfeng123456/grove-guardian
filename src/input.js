export function createInput(g){const keys=new Set();const input={keys,pressed:new Set(),pointer:null,joy:{x:0,y:0}};
 addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(!keys.has(e.code))input.pressed.add(e.code);keys.add(e.code);});addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>{keys.clear();input.joy.x=input.joy.y=0;g.paused=g.state==='playing';});
 // Mouse click on canvas = place. Touch taps on canvas are ignored (use the on-screen place button) to avoid accidental builds.
 g.renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'&&g.state==='playing')input.pressed.add('KeyE');});
 const joy=document.createElement('div');joy.id='joystick';joy.innerHTML='<div class="joy-knob"></div>';document.body.appendChild(joy);const knob=joy.firstChild;let id=null,cx=0,cy=0;const R=50;
 const move=e=>{let dx=e.clientX-cx,dy=e.clientY-cy;const d=Math.hypot(dx,dy);if(d>R){dx*=R/d;dy*=R/d;}knob.style.transform=`translate(${dx}px,${dy}px)`;const m=Math.hypot(dx,dy)/R;input.joy.x=m<.15?0:dx/R;input.joy.y=m<.15?0:dy/R;};
 joy.addEventListener('pointerdown',e=>{e.preventDefault();id=e.pointerId;joy.setPointerCapture(id);const r=joy.getBoundingClientRect();cx=r.left+r.width/2;cy=r.top+r.height/2;move(e);});
 joy.addEventListener('pointermove',e=>{if(e.pointerId===id)move(e);});
 const end=e=>{if(e.pointerId!==id)return;id=null;input.joy.x=input.joy.y=0;knob.style.transform='';};joy.addEventListener('pointerup',end);joy.addEventListener('pointercancel',end);
 const acts=document.createElement('div');acts.id='touch-actions';acts.innerHTML='<button data-k="KeyE" class="t-place">建造</button><button data-k="Space" class="t-skill">旋风</button><button data-k="KeyU" class="t-up">升级</button>';document.body.appendChild(acts);
 acts.querySelectorAll('button').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();if(g.state==='playing')input.pressed.add(b.dataset.k);}));
 document.addEventListener('gesturestart',e=>e.preventDefault());document.addEventListener('dblclick',e=>e.preventDefault());
 return input;
}
