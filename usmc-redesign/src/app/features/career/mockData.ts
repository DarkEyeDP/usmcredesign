import type {
  MarineProfile, CareerMilestone, DutyStation, Promotion,
  EducationEvent, Spouse, Child, FinancialGoal, TimelineData, ScenarioSummary,
} from './types';

const TODAY = new Date(2026, 5, 6);

// Default profile — overridden by localStorage or pay settings on first load
export const marineProfile: MarineProfile = {
  name: '',
  rankFull: 'Private',
  rankAbbr: 'Pvt',
  payGrade: 'E-1',
  mos: '',
  mosDescription: '',
  dob: new Date(2000, 0, 1),
  enlistmentDate: TODAY,
  promotionDate: TODAY,
  projectedRetirement: new Date(TODAY.getFullYear() + 20, TODAY.getMonth(), TODAY.getDate()),
  retirementYears: 20,
};

export const careerMilestones: CareerMilestone[] = [];
export const dutyStations: DutyStation[] = [];
export const promotions: Promotion[] = [];
export const education: EducationEvent[] = [];
export const spouse: Spouse | null = null;
export const children: Child[] = [];
export const financialGoals: FinancialGoal[] = [];

export const primaryTimelineData: TimelineData = {
  profile: marineProfile,
  milestones: careerMilestones,
  dutyStations,
  promotions,
  education,
  spouse,
  children,
  financialGoals,
};

export const scenarios: ScenarioSummary[] = [];
