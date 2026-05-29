import assert from 'node:assert/strict';
import { extractContacts, parseHeaderPOCs } from '../src/app/features/maradmin/maradminContactUtils';
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

test('parses formal body points of contact into separate cards', () => {
  const text = `Points of contact. Colonel E. J. Smith Branch Head, MMOA Comm: (703) 784-9300 Email: erik.smith@usmc.mil Colonel E. F. Bradley, Ground Col Monitor Comm: (703)784-9300 Email: evan.bradley@usmc.mil Colonel R. B. Tompkins, Aviation Col Monitor Comm: (703) 784-9300 Email: ralph.tompkins@usmc.mil Colonel E. F. Bradley Combat Arms Lieutenant Colonel Monitor Comm: (703) 784-9274 Email: evan.bradley@usmc.mil Colonel N. V. Bastian Combat Service Support Lieutenant Colonel Monitor Comm: (703) 784-9274 Email: nicole.v.bastian.mil@usmc.mil Lieutenant Colonel E. C. Buxton Aviation Lieutenant Colonel Monitor Comm: (703) 784-9267 Email: eben.buxton@usmc.mil Lieutenant Colonel D. C. Burton Information Lieutenant Colonel Monitor Comm: (703) 784-9274 Email: david.c.burton@usmc.mil Lieutenant Colonel James Pineiro, CMC Fellowships, MCU Comm: (703) 432-4837 Email: James.Pineiro@usmcu.edu Major Taylor Wulff-Morrison, Foreign PME, MCU Comm: (703) 784-1209 Email: taylor.wulffmorrison@usmcu.edu Mr. J. A. Bilyew, Registrar, MCU Comm: (703) 432-0696 Email: jake.bilyew@usmcu.edu`;

  const contacts = extractContacts(text);

  assert.equal(contacts.length, 10);
  assert.deepEqual(contacts[0], {
    name: 'Col E. J. Smith',
    section: 'Branch Head, MMOA',
    email: 'erik.smith@usmc.mil',
    comm: '(703) 784-9300',
  });
  assert.deepEqual(contacts[1], {
    name: 'Col E. F. Bradley',
    section: 'Ground Col Monitor',
    email: 'evan.bradley@usmc.mil',
    comm: '(703)784-9300',
  });
  assert.deepEqual(contacts[3], {
    name: 'Col E. F. Bradley',
    section: 'Combat Arms Lieutenant Colonel Monitor',
    email: 'evan.bradley@usmc.mil',
    comm: '(703) 784-9274',
  });
  assert.deepEqual(contacts[5], {
    name: 'LtCol E. C. Buxton',
    section: 'Aviation Lieutenant Colonel Monitor',
    email: 'eben.buxton@usmc.mil',
    comm: '(703) 784-9267',
  });
  assert.deepEqual(contacts[9], {
    name: 'Mr. J. A. Bilyew',
    section: 'Registrar, MCU',
    email: 'jake.bilyew@usmcu.edu',
    comm: '(703) 432-0696',
  });
});

markTestFilePass();
