import assert from 'node:assert/strict';
import { fixSpelledOutURLs } from '../src/app/components/maradminLinkUtils';
import { markTestFilePass, markTestFileStart, test } from './test-helpers';

markTestFileStart();

test('normalizes service academy application links', () => {
  const input = `
    https:(slash)(slash)www.usna.edu/USMC/FacultyStaffApp.php
    https:(slash) (slash)www2.manpower.usmc.mil/application_cac/edu/ViewBoardServlet. action?boardID=4871
    https:(slash)slash)www.usna.edu/ USMC/index.php
    https:(slash(slash)www.manpower.marines.mil/Divisions/Manpower- Management/Officer-Assignments/Plans-and-Programs-MMOA-3/#tab/ graduate-education-boards
  `;

  const normalized = fixSpelledOutURLs(input);

  assert.match(normalized, /https:\/\/www\.usna\.edu\/USMC\/FacultyStaffApp\.php/);
  assert.match(normalized, /https:\/\/www2\.manpower\.usmc\.mil\/application_cac\/edu\/ViewBoardServlet\.action\?boardID=4871/);
  assert.match(normalized, /https:\/\/www\.usna\.edu\/USMC\/index\.php/);
  assert.match(normalized, /https:\/\/www\.manpower\.marines\.mil\/Divisions\/Manpower-Management\/Officer-Assignments\/Plans-and-Programs-MMOA-3\/#tab\/graduate-education-boards/);
});

markTestFilePass();
