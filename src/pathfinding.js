// Rebuilt only after construction / destruction, then shared by all enemies.
export function buildFlowField(blocked, radius) {
  const field = new Map([['0,0', 0]]);
  const queue = [[0, 0]];
  for (let index = 0; index < queue.length; index++) {
    const [x, z] = queue[index];
    const nextDistance = field.get(`${x},${z}`) + 1;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const nz = z + dz;
      const key = `${nx},${nz}`;
      if (Math.abs(nx) > radius || Math.abs(nz) > radius || blocked.has(key) || field.has(key)) continue;
      field.set(key, nextDistance);
      queue.push([nx, nz]);
    }
  }
  return field;
}
