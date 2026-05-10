import assert from 'node:assert/strict';
import { parseRecognizedTableFamily } from '../src/app/components/maradminTableParsers';
import { extractMARADMINSource, parseArchivePageRows } from '../src/app/components/maradminUtils';
import { markTestFilePass, markTestFileStart, test } from './test-helpers';

markTestFileStart();

test('parses inline PMOS eligibility tables', () => {
  const parsed = parseRecognizedTableFamily(
    'Zone A PMOS Eligibility: PMOS E3 E4 E5 & Above 2141 12,000 15,000 15,750 1721 53,500 55,000 57,750',
  );

  assert.ok(parsed);
  assert.equal(parsed.body, 'Zone A PMOS Eligibility:');
  assert.deepEqual(parsed.tables?.[0].headers, ['PMOS', 'E3', 'E4', 'E5 & Above']);
  assert.deepEqual(parsed.tables?.[0].rows[0], ['2141', '12,000', '15,000', '15,750']);
});

test('parses inline promotion tables', () => {
  const parsed = parseRecognizedTableFamily(
    'Under the provisions... Name DOR MCC Victor M. Berg, Jr. 03May26 175 Gabriel L. Colon 03May26 1PB Joseph P. DeBlaay 03May26 135',
  );

  assert.ok(parsed);
  assert.deepEqual(parsed.tables?.[0].headers, ['Name', 'DOR', 'MCC']);
  assert.deepEqual(parsed.tables?.[0].rows[0], ['Victor M. Berg, Jr.', '03May26', '175']);
});

test('parses inline vacancy summary tables', () => {
  const parsed = parseRecognizedTableFamily(
    'Requires master’s degrees (read in four columns): BMOS Grade Billet Quantity 8824 O3/O4 Electrical Engineer 2 8850 O3/O4 Mathematics Instructor 2',
  );

  assert.ok(parsed);
  assert.deepEqual(parsed.tables?.[0].headers, ['BMOS', 'Grade', 'Billet', 'Quantity']);
  assert.deepEqual(parsed.tables?.[0].rows[1], ['8850', 'O3/O4', 'Mathematics Instructor', '2']);
});

test('parses inline attendee tables read in three columns', () => {
  const parsed = parseRecognizedTableFamily(
    'Read in three columns. Name Rank MCC Asher, Justin J. SSgt J88 Backes, Jessica H. GySgt J88 Helwig, Michael J. SSgt R2R',
  );

  assert.ok(parsed);
  assert.equal(parsed.body, 'Read in three columns.');
  assert.deepEqual(parsed.tables?.[0].headers, ['Name', 'Rank', 'MCC']);
  assert.deepEqual(parsed.tables?.[0].rows[0], ['Asher, Justin J.', 'SSgt', 'J88']);
  assert.deepEqual(parsed.tables?.[0].rows[1], ['Backes, Jessica H.', 'GySgt', 'J88']);
});

test('parses projected promotion comparison tables', () => {
  const parsed = parseRecognizedTableFamily(
    'The following FY25 promotions are projected for June 2026. Senior Officer Sel Junior Officer Sel CWO4 MOS: 5702 B. J. Parvin 6 K. T. Huff 7',
  );

  assert.ok(parsed);
  assert.deepEqual(parsed.tables?.[0].headers, ['Board / MOS', 'Senior Officer', 'Sel', 'Junior Officer', 'Sel']);
  assert.deepEqual(parsed.tables?.[0].rows[0], ['CWO4', '', '', '', '']);
  assert.deepEqual(parsed.tables?.[0].rows[1], ['MOS: 5702', 'B. J. Parvin', '6', 'K. T. Huff', '7']);
});

test('parses feeder MOS tables', () => {
  const parsed = parseRecognizedTableFamily(
    'Master Sergeant to Master Gunnery Sergeant: COLUMN (A) COLUMN (B) COLUMN (A) COLUMN (B) 0111 0111 0211 0291 0231 0291 0241 0291',
  );

  assert.ok(parsed);
  assert.deepEqual(parsed.tables?.[0].headers, ['COLUMN (A)', 'COLUMN (B)', 'COLUMN (A)', 'COLUMN (B)']);
  assert.deepEqual(parsed.tables?.[0].rows[0], ['0111', '0111', '0211', '0291']);
});

test('parses allocation cutoff tables with closed PMOS', () => {
  const parsed = parseRecognizedTableFamily(
    'For proper order read left to right: ALLOCATIONS TO SERGEANT MAJOR IMOS IRR SMCR AZ PEBD IZ PEBD BZ PEBD 8999 0 8 20221001 NA 20231001 NA NA NA THE FOLLOWING PMOS(S) ARE CLOSED: 0111, 0291, 0372, 0393, 0411, 0451.',
  );

  assert.ok(parsed);
  assert.equal(parsed.tables?.length, 2);
  assert.equal(parsed.tables?.[0].title, 'ALLOCATIONS TO SERGEANT MAJOR');
  assert.deepEqual(parsed.tables?.[0].rows[0], ['8999', '0', '8', '20221001', 'NA', '20231001', 'NA', 'NA', 'NA']);
  assert.equal(parsed.tables?.[1].title, 'ALLOCATIONS TO SERGEANT MAJOR - Closed PMOS');
});

test('extracts the releasing organization from release authority lines', () => {
  const divisionSource = extractMARADMINSource(
    'Release authorized by BGen Fridrik Fridriksson, Director, Manpower Management Division.//',
  );
  const deputySource = extractMARADMINSource(
    'Release authorized by Lieutenant General William J. Bowers, Deputy Commandant for Manpower and Reserve Affairs.//',
  );

  assert.equal(divisionSource, 'Manpower Management Division');
  assert.equal(deputySource, 'Deputy Commandant for Manpower and Reserve Affairs');
});

test('parses ordered MARADMIN archive rows from archive pages', () => {
  const rows = [
    '214/26',
    'MANDATORY COMPLETION OF THE BASIC ARTIFICIAL INTELLIGENCE COURSE',
    '5/8/2026',
    'Active',
    '213/26',
    'FY2026 55XX PRIMARY MILITARY OCCUPATIONAL SPECIALTY SELECTION BOARD RESULTS',
    '5/7/2026',
    'Active',
  ];
  const hrefByText = new Map([
    ['214/26', 'https://www.marines.mil/News/Messages/Messages-Display/Article/1234567/example-one/'],
    ['213/26', 'https://www.marines.mil/News/Messages/Messages-Display/Article/1234568/example-two/'],
  ]);

  const messages = parseArchivePageRows(rows, hrefByText, 2);

  assert.equal(messages.length, 2);
  assert.equal(messages[0].number, '214/26');
  assert.equal(messages[0].displayDate, '08 MAY 2026');
  assert.equal(messages[1].number, '213/26');
  assert.match(messages[1].link, /1234568/);
});

markTestFilePass();
