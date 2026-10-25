import './style.css';
import {createGame} from './game.js';
try { const game=createGame(); if(import.meta.env.DEV)window.__game=game; }catch(e){console.error(e);document.getElementById('app').innerHTML='<div class="error-screen">无法启动 3D 场景。请使用支持 WebGL 的桌面浏览器并开启硬件加速。<br>'+String(e.message).replaceAll('<','&lt;')+'</div>';}
