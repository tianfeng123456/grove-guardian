// 40 × 180 seconds = 120 minutes. A wave starts on schedule or on player request.
export const waves = Array.from({length:40}, (_,i) => ({
 number:i+1, duration:180, count:18+i*4, interval:Math.max(.32,1.6-i*.032),
 hp:Math.round(38*Math.pow(1.085,i)), damage:6+i*.65, speed:2.0+Math.min(i*.025,.8),
 giants:(i+1)%4===0 ? 1+Math.floor(i/12) : 0,
}));
