import assert from 'node:assert/strict';
import { parseRecognizedTableFamily } from '../src/app/features/maradmin/maradminTableParsers';
import { extractMARADMINSource, parseArchivePageRows, parseMARADMINText } from '../src/app/features/maradmin/maradminUtils';
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

test('parses paired name MCC meritorious promotion tables', () => {
  const parsed = parseRecognizedTableFamily(
    'To Staff Sergeant: Name MCC Name MCC Agustin, J. R6N Akers, J.K. 994 Alvidrez, K.M. 924 Amador, D.A. 041 Boateng Jr, K.A. 952 Bond, L.A. 90E Wells IV, L. 934 Wolf, B.P. 992',
  );

  assert.ok(parsed);
  assert.equal(parsed.body, 'To Staff Sergeant:');
  assert.deepEqual(parsed.tables?.[0].headers, ['Name', 'MCC', 'Name', 'MCC']);
  assert.deepEqual(parsed.tables?.[0].rows[0], ['Agustin, J.', 'R6N', 'Akers, J.K.', '994']);
  assert.deepEqual(parsed.tables?.[0].rows[2], ['Boateng Jr, K.A.', '952', 'Bond, L.A.', '90E']);
  assert.deepEqual(parsed.tables?.[0].rows[3], ['Wells IV, L.', '934', 'Wolf, B.P.', '992']);
});

test('keeps paired name MCC promotion lists as tables during full MARADMIN parsing', () => {
  const sections = parseMARADMINText(`
GENTEXT/REMARKS/2. Meritorious Promotion List.
2.a. To Staff Sergeant:
Name MCC Name MCC
Agustin, J. R6N Akers, J.K. 994
Alvidrez, K.M. 924 Amador, D.A. 041
Boateng Jr, K.A. 952 Bond, L.A. 90E
Wells IV, L. 934 Wolf, B.P. 992
2.b. To Gunnery Sergeant:
Name MCC Name MCC
Apollon, G.R. 040 Aviles, M.A. 998
Ba, M. 980 Bail, A.E. KA3
Payne II, B. 926 Robertson, R.A. 041
3. Marines who are selected to the ranks of SSgt through SgtMaj/MGySgt must have at least 24-months of obligated service.
`);

  assert.equal(sections[0].heading, 'Meritorious Promotion List');
  assert.equal(sections[0].bullets?.[0].body, 'To Staff Sergeant:');
  assert.deepEqual(sections[0].bullets?.[0].tables?.[0].rows[1], [
    'Alvidrez, K.M.',
    '924',
    'Amador, D.A.',
    '041',
  ]);
  assert.deepEqual(sections[0].bullets?.[0].tables?.[0].rows[3], [
    'Wells IV, L.',
    '934',
    'Wolf, B.P.',
    '992',
  ]);
  assert.equal(sections[0].bullets?.[1].body, 'To Gunnery Sergeant:');
  assert.deepEqual(sections[0].bullets?.[1].tables?.[0].rows[0], ['Apollon, G.R.', '040', 'Aviles, M.A.', '998']);
  assert.deepEqual(sections[0].bullets?.[1].tables?.[0].rows[2], [
    'Payne II, B.',
    '926',
    'Robertson, R.A.',
    '041',
  ]);
});

test('parses general officer promotion board schedule and zone tables', () => {
  const schedule = parseRecognizedTableFamily(
    'As announced by reference (a), the FY28 U.S. Marine Corps Major General and Brigadier General Promotion Selection Boards will convene at 2008 Elliot Road, Quantico, VA 22134, as follows: Selection To Component Bd.Corr.Due Convening Date MajGen Active 27 Jun 26 08 Jul 26 BGen Active 03 Jul 26 14 Jul 26',
  );

  assert.ok(schedule);
  assert.deepEqual(schedule.tables?.[0].headers, ['Selection To', 'Component', 'Bd.Corr.Due', 'Convening Date']);
  assert.deepEqual(schedule.tables?.[0].rows[0], ['MajGen', 'Active', '27 Jun 26', '08 Jul 26']);
  assert.deepEqual(schedule.tables?.[0].rows[1], ['BGen', 'Active', '03 Jul 26', '14 Jul 26']);

  const zone = parseRecognizedTableFamily(
    'Primary Zone: Senior Officer Above-Zone - Col Riley Jr., Donald J. DOR 01 Oct 11 LCN 03358000 Junior Officer Above-Zone - Col Mann, Nicole A. DOR 01 Oct 21 LCN 19641000 Senior Officer In-Zone - Col Lundgren, Matthew D. DOR 01 Nov 21 LCN 19648000 Junior Officer In-Zone - Col Lombardo, William L. DOR 01 Sep 22 LCN 19755000',
  );

  assert.ok(zone);
  assert.equal(zone.body, 'Primary Zone:');
  assert.deepEqual(zone.tables?.[0].headers, ['Position', 'Officer', 'DOR', 'LCN']);
  assert.deepEqual(zone.tables?.[0].rows[0], ['Senior Officer Above-Zone', 'Col Riley Jr., Donald J.', '01 Oct 11', '03358000']);
  assert.deepEqual(zone.tables?.[0].rows[3], ['Junior Officer In-Zone', 'Col Lombardo, William L.', '01 Sep 22', '19755000']);

  const sections = parseMARADMINText(`
GENTEXT/REMARKS/1. As announced by reference (a), the FY28 U.S. Marine Corps Major General and Brigadier General Promotion Selection Boards will convene at 2008 Elliot Road, Quantico, VA 22134, as follows:
Selection To   Component     Bd.Corr.Due        Convening Date
MajGen         Active        27 Jun 26          08 Jul 26
BGen           Active        03 Jul 26          14 Jul 26
2. Promotion Boards. The boards will consider two categories of officers. The senior and junior officers in each zone are as follows:
2.a. Major General Promotion Selection Board
2.a.1. Primary Zone:
        Senior Officer In-Zone -    BGen Ryans II, James A.
                                    DOR 05 Jun 23
                                    LCN 03343000
        Junior Officer In-Zone -    BGen Weiler, Robert S.
                                    DOR 18 May 24
                                    LCN 03353000
2.a.2. Secondary Zone:
        Only Officer Below-Zone -   BGen Wilburn Jr., William T.
                                    DOR 01 Jun 24
                                    LCN 03354000
`);

  assert.deepEqual(sections[0].tables?.[0].rows[1], ['BGen', 'Active', '03 Jul 26', '14 Jul 26']);
  assert.equal(sections[1].bullets?.[0].body, 'Major General Promotion Selection Board');
  assert.equal(sections[1].bullets?.[0].children?.[0].body, 'Primary Zone:');
  assert.deepEqual(sections[1].bullets?.[0].children?.[0].tables?.[0].rows[1], [
    'Junior Officer In-Zone',
    'BGen Weiler, Robert S.',
    '18 May 24',
    '03353000',
  ]);
  assert.deepEqual(sections[1].bullets?.[0].children?.[1].tables?.[0].rows[0], [
    'Only Officer Below-Zone',
    'BGen Wilburn Jr., William T.',
    '01 Jun 24',
    '03354000',
  ]);
});

test('parses slash-delimited program rank name MCC MOS selectee tables', () => {
  const parsed = parseRecognizedTableFamily(
    "Congratulations to this year's selectees (Read: Program/ Rank /Name/ MCC /MOS): MECCAP/ Sgt/ Holman R. P./ 174/ 2641 MINSAP/ Cpl/ Baker A. M./ 819/ 2631 MOSAP/ Sgt/ Huddleston W. G./174 / 2631 DSDP/SSgt/Bohm E. G./K21/2651",
  );

  assert.ok(parsed);
  assert.equal(parsed.body, "Congratulations to this year's selectees");
  assert.deepEqual(parsed.tables?.[0].headers, ['Program', 'Rank', 'Name', 'MCC', 'MOS']);
  assert.deepEqual(parsed.tables?.[0].rows[0], ['MECCAP', 'Sgt', 'Holman R. P.', '174', '2641']);
  assert.deepEqual(parsed.tables?.[0].rows[3], ['DSDP', 'SSgt', 'Bohm E. G.', 'K21', '2651']);

  const sections = parseMARADMINText(`
GENTEXT/REMARKS/3. Execution. The following Marines were selected to individual programs.
3.a. Congratulations to this year's selectees (Read: Program/ Rank /Name/ MCC /MOS):
MECCAP/ Sgt/ Holman R. P./ 174/ 2641
MINSAP/ Cpl/ Baker A. M./ 819/ 2631
MINSAP/ Sgt/ Sanders R. W./ 800/ 2631
MLAP/ Cpl/ Pinargote M. J./ 819/ 2641
MOSAP/ Sgt/ Huddleston W. G./174 / 2631
MSAP/ Sgt/ Bland D. J./ 1RA/ 2621
DSDP/SSgt/Bohm E. G./K21/2651
DSDP/SSgt/Stewart B. M./K21/2651
`);

  assert.equal(sections[0].bullets?.[0].body, "Congratulations to this year's selectees");
  assert.deepEqual(sections[0].bullets?.[0].tables?.[0].rows[5], ['MSAP', 'Sgt', 'Bland D. J.', '1RA', '2621']);
  assert.deepEqual(sections[0].bullets?.[0].tables?.[0].rows[7], ['DSDP', 'SSgt', 'Stewart B. M.', 'K21', '2651']);
});

test('parses inline vacancy summary tables', () => {
  const parsed = parseRecognizedTableFamily(
    'Requires master’s degrees (read in four columns): BMOS Grade Billet Quantity 8824 O3/O4 Electrical Engineer 2 8850 O3/O4 Mathematics Instructor 2',
  );

  assert.ok(parsed);
  assert.deepEqual(parsed.tables?.[0].headers, ['BMOS', 'Grade', 'Billet', 'Quantity']);
  assert.deepEqual(parsed.tables?.[0].rows[1], ['8850', 'O3/O4', 'Mathematics Instructor', '2']);
});

test('parses TLS milestone timeline tables', () => {
  const parsed = parseRecognizedTableFamily(
    'Major timeline milestones are: Date Milestone Release of this message TLS questionnaire opens 3 July 2026 Completed questionnaires due 3 July 2026 Remove by requests (RBR) due 3 August 2026 TLS Board convenes',
  );

  assert.ok(parsed);
  assert.equal(parsed.body, 'Major timeline milestones are');
  assert.deepEqual(parsed.tables?.[0].headers, ['Date', 'Milestone']);
  assert.deepEqual(parsed.tables?.[0].rows[0], ['Release of this message', 'TLS questionnaire opens']);
  assert.deepEqual(parsed.tables?.[0].rows[3], ['3 August 2026', 'TLS Board convenes']);
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

test('parses selected rank name IMOS/MCC lateral move tables', () => {
  const parsed = parseRecognizedTableFamily(
    'Selected 1321 Master Gunnery Sergeant and Master Sergeants. Rank Name IMOS/MCC MGySgt Gutierrez Jr CM 1349/1C1 MSgt Cureo MO 1349/1Y8 MSgt Reynolds Q 2181/J78 5. Training:',
  );

  assert.ok(parsed);
  assert.equal(parsed.body, 'Selected 1321 Master Gunnery Sergeant and Master Sergeants.');
  assert.deepEqual(parsed.tables?.[0].headers, ['Rank', 'Name', 'IMOS/MCC']);
  assert.deepEqual(parsed.tables?.[0].rows[0], ['MGySgt', 'Gutierrez Jr CM', '1349/1C1']);
  assert.deepEqual(parsed.tables?.[0].rows[2], ['MSgt', 'Reynolds Q', '2181/J78']);
});

test('parses sergeants major billet slate tables without treating initials as subsections', () => {
  const parsed = parseRecognizedTableFamily(
    'Per the references, the following Sergeants Major have been slated for the below listed billets (Read in 4 columns): Name Command Location NLT Date W. U. Lucero, Jr. HQTRS, MAG-41 Fort Worth, TX May 2026 T. Q. Tran HQTRS, MAG-49 McGuire AFB, NJ Apr 2027 L. C. Lamothe 4TH CRR Marietta, GA Apr 2027',
  );

  assert.ok(parsed);
  assert.deepEqual(parsed.tables?.[0].headers, ['Name', 'Command', 'Location', 'NLT Date']);
  assert.deepEqual(parsed.tables?.[0].rows[0], ['W. U. Lucero, Jr.', 'HQTRS, MAG-41', 'Fort Worth, TX', 'May 2026']);
  assert.deepEqual(parsed.tables?.[0].rows[2], ['L. C. Lamothe', '4TH CRR', 'Marietta, GA', 'Apr 2027']);
});

test('keeps sergeants major billet slate initials in table cells during full MARADMIN parsing', () => {
  const sections = parseMARADMINText(`
GENTEXT/REMARKS/1. Per the references, the following Sergeants Major have been slated for the below listed billets (Read in 4 columns):
Name Command Location NLT Date
W. U. Lucero, Jr. HQTRS, MAG-41 Fort Worth, TX May 2026
T. Q. Tran HQTRS, MAG-49 McGuire AFB, NJ Apr 2027
L. C. Lamothe 4TH CRR Marietta, GA Apr 2027
2. Per references (a) and (b), the newly assigned Sergeants Major are directed to submit their Inter-Unit Transfer.
`);

  assert.equal(sections[0].bullets, undefined);
  assert.deepEqual(sections[0].tables?.[0].rows[1], ['T. Q. Tran', 'HQTRS, MAG-49', 'McGuire AFB, NJ', 'Apr 2027']);
});

test('parses parenthesized letter course entries with numbered details nested beneath them', () => {
  const sections = parseMARADMINText(`
GENTEXT/REMARKS/2. Eligible courses are listed below.
a. Resident Full-Length Schools (FLS) are approximately 10-months in duration.
2.a.1. Senior Level College (SLC): (a) Marine Corps War College (MCWAR) (1) Quantico, VA (2) LtCol/LtCol (sel) (3) Jul 27 - Jun 28 (4) JPME-II certification (5) Resident (6) SMCR/IMA/IRR/AR (b) College of Naval Warfare (CNW) (1) Newport, RI (2) LtCol/LtCol (sel) (3) Jul 27 - Jun 28 (4) JPME-II certification (5) Resident (6) SMCR/IMA/IRR/AR
`);

  const resident = sections[0].bullets?.[0];
  const slc = resident?.children?.[0];
  const mcwar = slc?.children?.[0];
  const cnw = slc?.children?.[1];

  assert.equal(resident?.label, 'a.');
  assert.equal(slc?.label, '1.');
  assert.equal(slc?.body, 'Senior Level College (SLC):');
  assert.equal(mcwar?.label, '(a)');
  assert.equal(mcwar?.body, 'Marine Corps War College (MCWAR)');
  assert.deepEqual(mcwar?.children?.map(child => child.body).slice(0, 3), [
    'Quantico, VA',
    'LtCol/LtCol (sel)',
    'Jul 27 - Jun 28',
  ]);
  assert.equal(cnw?.label, '(b)');
  assert.equal(cnw?.body, 'College of Naval Warfare (CNW)');
  assert.equal(cnw?.children?.[0].body, 'Newport, RI');
});

test('parses command MCC tentative report date billet slate tables in sections and subsections', () => {
  const parsed = parseRecognizedTableFamily(
    'Force Level. COMMAND MCC TENTATIVE REPORT DATE M&RA Q55 SEP 2027 III MEF 1C1 SEP 2027 I MEF Q21 DEC 2027 CD&I 007 SEP 2027 MARCENT 1U8 SEP 2027',
  );

  assert.ok(parsed);
  assert.equal(parsed.body, 'Force Level.');
  assert.deepEqual(parsed.tables?.[0].headers, ['Command', 'MCC', 'Tentative Report Date']);
  assert.deepEqual(parsed.tables?.[0].rows[0], ['M&RA', 'Q55', 'SEP 2027']);
  assert.deepEqual(parsed.tables?.[0].rows[2], ['I MEF', 'Q21', 'DEC 2027']);

  const sections = parseMARADMINText(`
GENTEXT/REMARKS/1. Per the reference, the following billets will be projected to be slated during July 2026:
2. Force Level. COMMAND MCC TENTATIVE REPORT DATE M&RA Q55 SEP 2027 III MEF 1C1 SEP 2027 I MEF Q21 DEC 2027 CD&I 007 SEP 2027 MARCENT 1U8 SEP 2027
a. Cross slated second tour Force Level. Command MCC TENTATIVE REPORT DATE MARFORPAC 110 SEP 2027 TECOM 086 SEP 2027 MARFORCOM 111 SEP 2027
b. Major Subordinate Command Level. COMMAND MCC TENTATIVE REPORT DATE 4THMARDIV 5A5 NOV 2027 5TH MEB 1DX NOV 2027 1ST MLG 1Y1 NOV 2027
c. High Visibility Billet Level. COMMAND MCC TENTATIVE REPORT DATE TBS 078 APR 2027 RTR-E 016 APR 2027
`);

  assert.equal(sections[1].heading, 'Force Level');
  assert.deepEqual(sections[1].tables?.[0].rows[4], ['MARCENT', '1U8', 'SEP 2027']);
  assert.equal(sections[1].bullets?.[0].label, 'a.');
  assert.equal(sections[1].bullets?.[0].body, 'Cross slated second tour Force Level.');
  assert.deepEqual(sections[1].bullets?.[0].tables?.[0].rows[1], ['TECOM', '086', 'SEP 2027']);
  assert.equal(sections[1].bullets?.[2].body, 'High Visibility Billet Level.');
  assert.deepEqual(sections[1].bullets?.[2].tables?.[0].rows[1], ['RTR-E', '016', 'APR 2027']);
});

test('parses MCC unit description note tables in district subsections', () => {
  const parsed = parseRecognizedTableFamily(
    '1st Marine Corps District MCC Unit Description Note 922 RS Albany, NY 926 RS Baltimore, MD 1 930 RS Boston, MA A48 OST Jersey City, NJ AAN OST Manhattan, NY',
  );

  assert.ok(parsed);
  assert.equal(parsed.body, '1st Marine Corps District');
  assert.deepEqual(parsed.tables?.[0].headers, ['MCC', 'Unit Description', 'Note']);
  assert.deepEqual(parsed.tables?.[0].rows[0], ['922', 'RS Albany, NY', '']);
  assert.deepEqual(parsed.tables?.[0].rows[1], ['926', 'RS Baltimore, MD', '1']);
  assert.deepEqual(parsed.tables?.[0].rows[4], ['AAN', 'OST Manhattan, NY', '']);

  const sections = parseMARADMINText(`
GENTEXT/REMARKS/5. Billet Openings. The below listed vacancies are projected for 2027.
5.a. 1st Marine Corps District
MCC Unit Description Note
922 RS Albany, NY
926 RS Baltimore, MD 1
930 RS Boston, MA
AAN OST Manhattan, NY
5.b. 4th Marine Corps District
MCC Unit Description Note
90L RS Indianapolis, IN
968 RS Louisville, KY 1,2
AAB OST Salem, VA 2
`);

  assert.equal(sections[0].heading, 'Billet Openings');
  assert.equal(sections[0].bullets?.[0].body, '1st Marine Corps District');
  assert.deepEqual(sections[0].bullets?.[0].tables?.[0].rows[3], ['AAN', 'OST Manhattan, NY', '']);
  assert.equal(sections[0].bullets?.[1].body, '4th Marine Corps District');
  assert.deepEqual(sections[0].bullets?.[1].tables?.[0].rows[1], ['968', 'RS Louisville, KY', '1,2']);
  assert.deepEqual(sections[0].bullets?.[1].tables?.[0].rows[2], ['AAB', 'OST Salem, VA', '2']);
});

test('parses PSR district phone lists without treating area codes as subsection labels', () => {
  const parsed = parseRecognizedTableFamily(
    'Eligible Marines volunteering for PSR duty should contact the PSR District Headquarters closest to them at the number below: PSRS-1, Brooklyn, NY: (516) 824-3091 PSRS-4, Columbus, OH: (614) 809-2886 PSRS-6, Parris Island, SC: (423)-802-6539 PSRS-8, Fort Worth, TX: (817) 738-6260 ext. 23/24 PSRS-9, Great Lakes, IL: (847) 688-7130 ext. 772 PSRS-12, Camp Pendleton, CA: (760) 763-6218',
  );

  assert.ok(parsed);
  assert.equal(parsed.body, 'Eligible Marines volunteering for PSR duty should contact the PSR District Headquarters closest to them at the number below');
  assert.deepEqual(parsed.tables?.[0].headers, ['PSR District Headquarters', 'Phone']);
  assert.deepEqual(parsed.tables?.[0].rows[0], ['PSRS-1, Brooklyn, NY', '(516) 824-3091']);
  assert.deepEqual(parsed.tables?.[0].rows[2], ['PSRS-6, Parris Island, SC', '(423)-802-6539']);
  assert.deepEqual(parsed.tables?.[0].rows[4], ['PSRS-9, Great Lakes, IL', '(847) 688-7130 ext. 772']);

  const sections = parseMARADMINText(`
GENTEXT/REMARKS/5. Special Duty Assignments.
5.h. Eligible Marines volunteering for PSR duty are required to conduct an interview with the PSR Career Recruiter closest to their location using the PSR screening addendum. Marines should contact the PSR District Headquarters closest to them at the number below (read in two columns):
       PSRS-1, Brooklyn, NY:                (516) 824-3091
       PSRS-4, Columbus, OH:                (614) 809-2886
       PSRS-6, Parris Island, SC:           (423)-802-6539
       PSRS-8, Fort Worth, TX:              (817) 738-6260 ext. 23/24
       PSRS-9, Great Lakes, IL:             (847) 688-7130 ext. 772
       PSRS-12, Camp Pendleton, CA:         (760) 763-6218
6. Financial Incentives. Per reference (c), qualified Marines filling designated special assignments are eligible to receive SDA Pay.
`);

  const psrBullet = sections[0].bullets?.find(bullet => bullet.label === 'h.');
  assert.ok(psrBullet);
  assert.equal(psrBullet.children, undefined);
  assert.deepEqual(psrBullet.tables?.[0].rows.at(-1), ['PSRS-12, Camp Pendleton, CA', '(760) 763-6218']);
});

test('parses TLS course allocation tables with wrapped school titles and notes', () => {
  const parsed = parseRecognizedTableFamily(
    'The AY27-28 TLS Board will select officers to attend the Senior Service Colleges listed below. (Read in five columns) Course Title/School Quota Convenes Graduates Note Air War College (AWC) (Montgomery, AL) 7 Jul 27 May 28 4 Army War College (USAWC) (Carlisle, PA) 15 Jul 27 Jun 28 1 College of Naval Warfare (CNW) (Newport, RI) 15 Jul 27 Jun 28 Note 1: Two USAWC quotas are for the blended education program. Note 4: Aviation PMOS priority.',
  );

  assert.ok(parsed);
  assert.deepEqual(parsed.tables?.[0].headers, ['Course Title / School', 'Quota', 'Convenes', 'Graduates', 'Note']);
  assert.deepEqual(parsed.tables?.[0].rows[0], ['Air War College (AWC) (Montgomery, AL)', '7', 'Jul 27', 'May 28', '4']);
  assert.deepEqual(parsed.tables?.[0].rows[1], ['Army War College (USAWC) (Carlisle, PA)', '15', 'Jul 27', 'Jun 28', '1']);
  assert.deepEqual(parsed.tables?.[0].rows[2], ['College of Naval Warfare (CNW) (Newport, RI)', '15', 'Jul 27', 'Jun 28', '']);
  assert.equal(parsed.tables?.[1].title, 'Notes');
  assert.deepEqual(parsed.tables?.[1].headers, ['Note', 'Details']);
  assert.deepEqual(parsed.tables?.[1].rows[0], ['Note 1', 'Two USAWC quotas are for the blended education program.']);
  assert.deepEqual(parsed.tables?.[1].rows[1], ['Note 4', 'Aviation PMOS priority.']);

  const sections = parseMARADMINText(`
GENTEXT/REMARKS/4. Education program allocations
4.a. Senior Service Colleges. The AY27-28 TLS Board will select officers to attend the Senior Service Colleges listed below. (Read in five columns)
Course Title/School Quota Convenes Graduates Note
Air War College (AWC)
(Montgomery, AL) 7 Jul 27 May 28 4
Army War College (USAWC)
(Carlisle, PA) 15 Jul 27 Jun 28 1
College of Naval Warfare (CNW)
(Newport, RI) 15 Jul 27 Jun 28
Note 1: Two USAWC quotas are for the blended education program.
Note 4: Aviation PMOS priority.
4.b. The TLS Selection Board will select officers for assignment to the foreign senior service colleges and fellowships listed below.
4.b.1. Foreign Professional Military Education (FPME). Additional FPME information is located online. (Read in five columns)
Course Title/School Quota Convenes Graduates Note
Center des Hautes Etudes Militaires (France) 1 Aug 27 Jun 28 6
North Atlantic Treaty Organization (NATO) Defense College Senior Course (Rome, Italy) 1st session 2 Sep 27 Feb 28 7 2nd session 2 Feb 28 Jul 28 7
UK Higher Command and Staff Course 1 Jan 28 May 28 7
Note 6: Foreign language proficiency is required.
4.b.2. CMC Fellowships. Additional details are located online. (Read in five columns)
Course Title/School Quota Convenes Graduates Note
Advanced Strategic Leadership Studies Program (Fort Leavenworth, KS) 1 Jun 27 Jun 28 8,10,12
Department of State (DOS) (Washington, DC) 1 Jul 27 Jun 28
Stockdale Center for Ethical Leadership at U.S. Naval Academy (Annapolis, MD) 1 Jul 26 Jun 27 11,12
Note 8: Graduates will complete a mandatory one-year follow-on assignment.
`);

  assert.equal(sections[0].heading, 'Education Program Allocations');
  assert.deepEqual(sections[0].bullets?.[0].tables?.[0].rows[0], ['Air War College (AWC) (Montgomery, AL)', '7', 'Jul 27', 'May 28', '4']);
  assert.deepEqual(sections[0].bullets?.[0].tables?.[1].rows[0], ['Note 1', 'Two USAWC quotas are for the blended education program.']);
  assert.deepEqual(sections[0].bullets?.[1].children?.[0].tables?.[0].rows[1], [
    'North Atlantic Treaty Organization (NATO) Defense College Senior Course (Rome, Italy) 1st session',
    '2',
    'Sep 27',
    'Feb 28',
    '7',
  ]);
  assert.deepEqual(sections[0].bullets?.[1].children?.[1].tables?.[0].rows[0], [
    'Advanced Strategic Leadership Studies Program (Fort Leavenworth, KS)',
    '1',
    'Jun 27',
    'Jun 28',
    '8,10,12',
  ]);
});

test('parses SNCO projected promotion status and projection tables with notes', () => {
  const status = parseRecognizedTableFamily(
    'STATUS OF FY 2025 INDIVIDUAL READY RESERVE (IRR) SNCO PROMOTION LISTS: NUMBER SENIOR NO. JUN 26 LAST SENIOR PROJECTED GRADE SELECTED PROM MAY 26 PROM NO. PROM FOR JUL 26 MGySgt (Note 2) (Note 2) (Note 2) (Note 2) (Note 2) MSgt 6 4 1 5 (Note 1) GySgt 7 (Note 1) (Note 1) (Note 1) (Note 1) SSgt 36 25 3 28 3',
  );

  assert.ok(status);
  assert.equal(status.body, 'STATUS OF FY 2025 INDIVIDUAL READY RESERVE (IRR) SNCO PROMOTION LISTS');
  assert.deepEqual(status.tables?.[0].headers, [
    'Grade',
    'Number Selected',
    'Senior No. Prom May 26',
    'Jun 26 Prom',
    'Last Senior No. Prom',
    'Projected For Jul 26',
  ]);
  assert.deepEqual(status.tables?.[0].rows[0], ['MGySgt', '(Note 2)', '(Note 2)', '(Note 2)', '(Note 2)', '(Note 2)']);
  assert.deepEqual(status.tables?.[0].rows[1], ['MSgt', '6', '4', '1', '5', '(Note 1)']);

  const projection = parseRecognizedTableFamily(
    'FY 2026 SNCO PROJECTED AUGUST 2026 PROMOTIONS: AR SMCR IRR SgtMaj/MGySgt (Note 3) 0 0 1stSgt/MSgt 3 0 0 GySgt 6 0 0 SSgt 20 0 0 Note 1: List cleared. Note 2: There are no selections for this component. Note 3: No promotions due to TIG requirements.',
  );

  assert.ok(projection);
  assert.equal(projection.body, 'FY 2026 SNCO PROJECTED AUGUST 2026 PROMOTIONS');
  assert.deepEqual(projection.tables?.[0].headers, ['Grade', 'AR', 'SMCR', 'IRR']);
  assert.deepEqual(projection.tables?.[0].rows[0], ['SgtMaj/MGySgt', '(Note 3)', '0', '0']);
  assert.deepEqual(projection.tables?.[1].rows[2], ['Note 3', 'No promotions due to TIG requirements.']);

  const sections = parseMARADMINText(`
GENTEXT/REMARKS/4. Projected Monthly Promotions
4.a. STATUS OF FY 2025 SELECTED MARINE CORPS RESERVE (SMCR) SNCO PROMOTION LISTS:
NUMBER SENIOR NO. JUN 26 LAST SENIOR PROJECTED
GRADE SELECTED PROM MAY 26 PROM NO. PROM FOR JUL 26
SgtMaj/MGySgt 48 32 4 36 4
1stSgt/MSgt 136 95 11 106 11
GySgt 187 125 16 141 15
SSgt 273 187 23 210 21
4.e. FY 2026 SNCO PROJECTED AUGUST 2026 PROMOTIONS:
AR SMCR IRR
SgtMaj/MGySgt (Note 3) 0 0
1stSgt/MSgt 3 0 0
GySgt 6 0 0
SSgt 20 0 0
Note 1: List cleared.
Note 2: There are no selections for this component.
Note 3: No promotions due to TIG requirements.
5. For Reserve SNCO allocation questions, contact Reserve Affairs.
`);

  assert.equal(sections[0].heading, 'Projected Monthly Promotions');
  assert.deepEqual(sections[0].bullets?.[0].tables?.[0].rows[0], ['SgtMaj/MGySgt', '48', '32', '4', '36', '4']);
  assert.deepEqual(sections[0].bullets?.[1].tables?.[0].rows[0], ['SgtMaj/MGySgt', '(Note 3)', '0', '0']);
  assert.deepEqual(sections[0].bullets?.[1].tables?.[1].rows[0], ['Note 1', 'List cleared.']);
});

test('parses aviation board results tables with optional MI and program/location columns', () => {
  const parsed = parseRecognizedTableFamily(
    'The board selected the following Marines for TC: L. NAME F. NAME MI PMOS PROGRAM Brogan Conor J 7565 TC KC-130 Sarsam Anirudh 7525 TC NFO TO SNA Forehand Jr John R 7523 TC F-35',
  );

  assert.ok(parsed);
  assert.deepEqual(parsed.tables?.[0].headers, ['L. Name', 'F. Name', 'MI', 'PMOS', 'Program']);
  assert.deepEqual(parsed.tables?.[0].rows[0], ['Brogan', 'Conor', 'J', '7565', 'TC KC-130']);
  assert.deepEqual(parsed.tables?.[0].rows[1], ['Sarsam', 'Anirudh', '', '7525', 'TC NFO TO SNA']);
  assert.deepEqual(parsed.tables?.[0].rows[2], ['Forehand Jr', 'John', 'R', '7523', 'TC F-35']);

  const sections = parseMARADMINText(`
GENTEXT/REMARKS/2. Results (read in five columns)
2.a. The board selected the following Marines for TC: L. NAME F. NAME MI PMOS PROGRAM Brogan Conor J 7565 TC KC-130 Sarsam Anirudh 7525 TC NFO TO SNA Bartlett Keith M 7523 TC F-35
2.b. The board selected the following Marines for FA: L. NAME F. NAME MI PMOS PROGRAM Hare Robert L 0302 FA 75XX Hargis Brett J 7220 FA MQ9
2.c. The board selected the following Marines for PEP: L. NAME F. NAME MI PMOS LOCATION Menz Christopher J 7566 PEP CH-24 Benson, UK Vangorder Seth B 7557 PEP C-130 Brize Norton, UK
2.d. The board selected the following Marines for ISE: L. NAME F. NAME MI PMOS LOCATION Williams Matthew R 7557 ISE C-130 Mildenhall, UK McLean Matthew W 7565 ISE AH-6 FT Campbell, US
`);

  assert.equal(sections[0].heading, 'Results');
  assert.equal(sections[0].body, '');
  assert.equal(sections[0].bullets?.length, 4);
  assert.equal(sections[0].bullets?.[0].body, 'The board selected the following Marines for TC:');
  assert.deepEqual(sections[0].bullets?.[0].tables?.[0].rows[1], ['Sarsam', 'Anirudh', '', '7525', 'TC NFO TO SNA']);
  assert.deepEqual(sections[0].bullets?.[2].tables?.[0].headers, ['L. Name', 'F. Name', 'MI', 'PMOS', 'Location']);
  assert.deepEqual(sections[0].bullets?.[2].tables?.[0].rows[1], ['Vangorder', 'Seth', 'B', '7557', 'PEP C-130 Brize Norton, UK']);
  assert.deepEqual(sections[0].bullets?.[3].tables?.[0].rows[1], ['McLean', 'Matthew', 'W', '7565', 'ISE AH-6 FT Campbell, US']);
});

test('parses IAP selection panel results tables read in six columns', () => {
  const tableText =
    'Based on their background, operational experience, and academic credentials, the IAP experience track selection panel selected the Marines listed below for assignment for the Foreign Area Officer (FAO) and Regional Affairs Officer (RAO) Additional Military Occupational Specialty (AMOS). Selection panel results.: Name Rank PMOS AMOS Desig Region Ahonen, J.T Maj 0302 8244 FAO Middle East Barnett, B LtCol 0202 8221 RAO LATAM Barnett, B LtCol 0202 8223 RAO INDO-PACOM Berentson, M.D Col 8041 8241 FAO LATAM Berentson, M.D Col 8041 8245 FAO Africa Ding, M.H Maj 0802 8242 FAO Europe Gibson, H.R Maj 0602 8222 RAO Europe Kopach, S.J LtCol 0202 8224 RAO Middle East Nerswick, S.E Maj 6602 8223 RAO INDO-PACOM Vega, F.J LtCol 0302 8222 RAO Europe';
  const parsed = parseRecognizedTableFamily(tableText);

  assert.ok(parsed);
  assert.equal(parsed.body.endsWith('Selection panel results.'), true);
  assert.deepEqual(parsed.tables?.[0].headers, ['Name', 'Rank', 'PMOS', 'AMOS', 'Desig', 'Region']);
  assert.deepEqual(parsed.tables?.[0].rows[0], ['Ahonen, J.T', 'Maj', '0302', '8244', 'FAO', 'Middle East']);
  assert.deepEqual(parsed.tables?.[0].rows[2], ['Barnett, B', 'LtCol', '0202', '8223', 'RAO', 'INDO-PACOM']);
  assert.deepEqual(parsed.tables?.[0].rows[9], ['Vega, F.J', 'LtCol', '0302', '8222', 'RAO', 'Europe']);

  const sections = parseMARADMINText(`
GENTEXT/REMARKS/1. The purpose of this MARADMIN is to announce results.
2. Based on their background, operational experience, and academic credentials, the IAP experience track selection panel selected the Marines listed below for assignment for the Foreign Area Officer (FAO) and Regional Affairs Officer (RAO) Additional Military Occupational Specialty (AMOS). Selection panel results. (Read in 6 columns):
Name Rank PMOS AMOS Desig Region
Ahonen, J.T Maj 0302 8244 FAO Middle East
Barnett, B LtCol 0202 8221 RAO LATAM
Barnett, B LtCol 0202 8223 RAO INDO-PACOM
3. This MARADMIN serves as authority to assign the respective AMOS as listed above.
`);

  assert.equal(sections[1].body.endsWith('Selection panel results.'), true);
  assert.deepEqual(sections[1].tables?.[0].rows[1], ['Barnett, B', 'LtCol', '0202', '8221', 'RAO', 'LATAM']);
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
  const commaDeputySource = extractMARADMINSource(
    'Release authorized by LtGen J. M. Bargeron, Deputy Commandant for Plans, Policies, and Operations.//',
  );

  assert.equal(divisionSource, 'Manpower Management Division');
  assert.equal(deputySource, 'Deputy Commandant for Manpower and Reserve Affairs');
  assert.equal(commaDeputySource, 'Deputy Commandant for Plans, Policies, and Operations');
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
