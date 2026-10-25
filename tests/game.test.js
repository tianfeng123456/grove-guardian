import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFlowField } from '../src/pathfinding.js';
import { createWaves } from '../src/waves.js';
import { waves } from '../src/data/waves.js';
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

test('enemies can route around a wall and return to shorter route after destruction', () => {
  const blocked = new Map([['1,0', {}]]);
  let field = buildFlowField(blocked, 4);
  assert.equal(field.get('2,0'), 4);
  assert.equal(field.has('1,0'), false);
  blocked.delete('1,0');
  field = buildFlowField(blocked, 4);
  assert.equal(field.get('2,0'), 2);
});

test('a sealed core leaves attackers outside without a path; destroying one wall opens it', () => {
  const blocked = new Map(['1,0', '-1,0', '0,1', '0,-1'].map(key => [key, {}]));
  assert.equal(buildFlowField(blocked, 5).has('3,0'), false);
  blocked.delete('1,0');
  assert.equal(buildFlowField(blocked, 5).get('3,0'), 3);
});

function fixture() {
  const spawned = [];
  const g = {
    input: { pressed: new Set() }, toast() {},
    enemies: { list: [], spawn(wave, giant = false) { spawned.push({ wave: wave.number, giant }); } },
    end(win) { this.won = win; },
  };
  return { g, spawned, schedule: createWaves(g) };
}

test('40 waves spawn every configured minion and giant before victory', () => {
  const { g, schedule, spawned } = fixture();
  for (let i = 0; i < waves.length; i++) {
    schedule.startNext();
    while (schedule.queue || schedule.giants) schedule.update(2);
    assert.equal(schedule.index, i);
  }
  assert.equal(spawned.filter(e => !e.giant).length, waves.reduce((n, w) => n + w.count, 0));
  assert.equal(spawned.filter(e => e.giant).length, waves.reduce((n, w) => n + w.giants, 0));
  assert.equal(g.won, true);
  assert.equal(waves.reduce((n, w) => n + w.duration, 0), 7200);
});

test('enemy cap delays spawns without consuming queued enemies', () => {
  const { g, schedule, spawned } = fixture();
  schedule.startNext();
  g.enemies.list = Array(200).fill({});
  schedule.update(1);
  assert.equal(spawned.length, 0);
  assert.equal(schedule.queue, waves[0].count);
  g.enemies.list.pop();
  schedule.update(1);
  assert.equal(spawned.length, 1);
  assert.equal(schedule.queue, waves[0].count - 1);
});

test('final victory waits for all living enemies to be cleared', () => {
  const { g, schedule } = fixture();
  schedule.index = 39;
  schedule.nextIn = 180;
  g.enemies.list.push({});
  schedule.update(1);
  assert.equal(g.won, undefined);
  g.enemies.list.length = 0;
  schedule.update(1);
  assert.equal(g.won, true);
});

test('all procedural PNG files decode to complete 64×64 RGBA images', () => {
  for (const name of ['grass', 'bark', 'stone', 'core']) {
    const data = readFileSync(new URL(`../public/textures/${name}.png`, import.meta.url));
    assert.equal(data.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(data.readUInt32BE(16), 64);
    assert.equal(data.readUInt32BE(20), 64);
    const idat = [];
    for (let offset = 8; offset < data.length;) {
      const length = data.readUInt32BE(offset);
      if (data.toString('ascii', offset + 4, offset + 8) === 'IDAT') idat.push(data.subarray(offset + 8, offset + 8 + length));
      offset += length + 12;
    }
    assert.equal(inflateSync(Buffer.concat(idat)).length, 64 * (64 * 4 + 1));
  }
});
