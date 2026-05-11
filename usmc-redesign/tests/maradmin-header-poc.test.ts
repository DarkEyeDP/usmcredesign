import assert from 'node:assert/strict';
import { parseHeaderPOCs } from '../src/app/components/MARADMINPage';
import { markTestFilePass, markTestFileStart, test } from './test-helpers';

markTestFileStart();

test('parses numbered header POC records with wrapped email lines', () => {
  const text = `POC1/MCGEE/MAJ/MPP-20/TEL: 703-784-9362/EMAIL: MARK.MCGEE2
@USMC.MIL//
POC2/STALKER/MSGT/MPP-20/TEL: 703-784-9362/EMAIL: JAMES.J.STALKER
.MIL@USMC.MIL//
POC3/FOSTER/MGYSGT/MMEA-1/TEL: 703-432-9120/EMAIL: CLIFFORD.FOSTER
@USMC.MIL//
POC4/BRUNER/CIV/MPO/TEL: 703-432-2889/EMAIL: JEREMY.L.BRUNER.CIV
@USMC.MIL//`;

  const contacts = parseHeaderPOCs(text);

  assert.equal(contacts.length, 4);
  assert.deepEqual(contacts[0], {
    name: 'Maj Mcgee',
    section: 'MPP-20',
    email: 'mark.mcgee2@usmc.mil',
    comm: '703-784-9362',
  });
  assert.deepEqual(contacts[1], {
    name: 'MSgt Stalker',
    section: 'MPP-20',
    email: 'james.j.stalker.mil@usmc.mil',
    comm: '703-784-9362',
  });
  assert.deepEqual(contacts[2], {
    name: 'MGySgt Foster',
    section: 'MMEA-1',
    email: 'clifford.foster@usmc.mil',
    comm: '703-432-9120',
  });
  assert.deepEqual(contacts[3], {
    name: 'Civ Bruner',
    section: 'MPO',
    email: 'jeremy.l.bruner.civ@usmc.mil',
    comm: '703-432-2889',
  });
});

test('parses spaced numbered POC labels with tel and dsn fields', () => {
  const text = `POC 1/STEPHEN D. GRODEK/LTCOL/RAM-2 OIC - AR GROUND MONITOR/TEL:
703-784-0531/DSN: 278-0531/EMAIL: STEPHEN.GRODEK@USMC.MIL//
POC 2/ANDREW R. WING/LTCOL/RAM DEPUTY - AVIATION MONITOR/TEL:
703-784-0530/DSN:278-0530/EMAIL: ANDREW.WING@USMC.MIL//`;

  const contacts = parseHeaderPOCs(text);

  assert.equal(contacts.length, 2);
  assert.deepEqual(contacts[0], {
    name: 'LtCol Stephen D. Grodek',
    section: 'RAM-2 OIC - AR GROUND MONITOR',
    email: 'stephen.grodek@usmc.mil',
    comm: '703-784-0531',
  });
  assert.deepEqual(contacts[1], {
    name: 'LtCol Andrew R. Wing',
    section: 'RAM DEPUTY - AVIATION MONITOR',
    email: 'andrew.wing@usmc.mil',
    comm: '703-784-0530',
  });
});

markTestFilePass();
