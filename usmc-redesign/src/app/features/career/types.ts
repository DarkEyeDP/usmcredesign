export interface MarineProfile {
  name: string;
  rankFull: string;
  rankAbbr: string;
  payGrade: string;
  mos: string;
  mosDescription: string;
  dob: Date;
  enlistmentDate: Date;
  promotionDate: Date;
  projectedRetirement: Date;
  retirementYears: number;
}

export type MilestoneType = 'enlistment' | 'eas' | 'reenlistment' | 'letter' | 'retirement' | 'custom';
export type MilestoneIconSize = 'sm' | 'md' | 'lg';

export interface CareerMilestone {
  id: string;
  label: string;
  shortLabel: string;
  date: Date;
  endDate?: Date;
  type: MilestoneType;
  track: 0 | 1;
  iconSize?: MilestoneIconSize;
  customIcon?: string;
  customColor?: string;
}

export interface DutyStation {
  id: string;
  location: string;
  unit?: string;
  startDate: Date;
  endDate: Date;
  isPotential?: boolean;
}

export interface Promotion {
  id: string;
  rank: string;
  rankAbbr: string;
  payGrade: string;
  date: Date;
  isProjected?: boolean;
}

export interface EducationEvent {
  id: string;
  label: string;
  startDate: Date;
  endDate: Date;
  isProjected?: boolean;
}

export interface Spouse {
  name: string;
  dob: Date;
  marriageDate: Date;
  color?: string;
}

export type SchoolPhaseType = 'prek' | 'elementary' | 'middle' | 'high' | 'college';

export interface SchoolPhase {
  phase: SchoolPhaseType;
  label: string;
  startDate: Date;
  endDate: Date;
}

export interface Child {
  id: string;
  name: string;
  dob: Date;
  color: string;
  schoolPhases: SchoolPhase[];
  schoolYearEndMonth?: number; // 0-11, e.g. 4=May, 5=June (default)
  schoolYearEndDay?: number;   // 1-31, last day of school in the end month (default ~15)
  isPlanned?: boolean;
  plannedYear?: number;
}

export interface FinancialGoal {
  id: string;
  label: string;
  amount: number;
  targetDate: Date;
  iconName: 'shield' | 'home' | 'trending-up' | 'check-circle' | 'piggy-bank' | 'custom';
  customIconName?: string;
  customColor?: string;
}

export interface TimelineData {
  profile: MarineProfile;
  milestones: CareerMilestone[];
  dutyStations: DutyStation[];
  promotions: Promotion[];
  education: EducationEvent[];
  spouse: Spouse | null;
  children: Child[];
  financialGoals: FinancialGoal[];
}

export interface SavedTimeline {
  id: string;
  name: string;
  savedAt: Date;
  data: TimelineData;
}

export interface ScenarioSummary {
  id: string;
  label: string;
  sublabel: string;
  color: string;
  retirementDate: string;
  totalYears: string;
  monthlyRetirementPay: string;
  totalEducationBenefits: string;
  estNetWorth: string;
  data: TimelineData;
}
