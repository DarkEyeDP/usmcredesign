import { useState, useEffect } from 'react';
import type { MarineProfile, Promotion, CareerMilestone, DutyStation, EducationEvent, Spouse, Child, FinancialGoal } from '../types';
import {
  readCareerProfile, writeCareerProfile,
  readCareerPromotions, writeCareerPromotions,
  readCareerMilestones, writeCareerMilestones,
  readCareerDutyStations, writeCareerDutyStations,
  readCareerEducation, writeCareerEducation,
  readCareerSpouse, writeCareerSpouse,
  readCareerChildren, writeCareerChildren,
  readCareerFinancialGoals, writeCareerFinancialGoals,
  buildProfileFromPaySettings, defaultPromotions,
} from '../careerProfileStorage';

export function useCareerData() {
  const [profile, setProfile] = useState<MarineProfile>(
    () => readCareerProfile() ?? buildProfileFromPaySettings()
  );
  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    const stored = readCareerPromotions() ?? defaultPromotions;
    return stored.filter(p => p.id !== 'profile-current');
  });
  const [milestones, setMilestones]         = useState<CareerMilestone[]>(() => readCareerMilestones() ?? []);
  const [dutyStations, setDutyStations]     = useState<DutyStation[]>(() => readCareerDutyStations() ?? []);
  const [education, setEducation]           = useState<EducationEvent[]>(() => readCareerEducation() ?? []);
  const [spouse, setSpouse]                 = useState<Spouse | null>(() => readCareerSpouse());
  const [children, setChildren]             = useState<Child[]>(() => readCareerChildren() ?? []);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>(() => readCareerFinancialGoals() ?? []);

  // Sync current rank into promotions list
  useEffect(() => {
    const confirmed: Promotion = {
      id: 'profile-current',
      rank: profile.rankFull,
      rankAbbr: profile.rankAbbr,
      payGrade: profile.payGrade,
      date: profile.promotionDate,
      isProjected: false,
    };
    setPromotions(prev => {
      const without = prev.filter(p => p.id !== 'profile-current' && p.payGrade !== profile.payGrade);
      return [...without, confirmed].sort((a, b) => a.date.getTime() - b.date.getTime());
    });
  }, [profile.payGrade, profile.rankFull, profile.rankAbbr, profile.promotionDate]);

  // Persist all state
  useEffect(() => { writeCareerProfile(profile); },           [profile]);
  useEffect(() => { writeCareerPromotions(promotions); },     [promotions]);
  useEffect(() => { writeCareerMilestones(milestones); },     [milestones]);
  useEffect(() => { writeCareerDutyStations(dutyStations); }, [dutyStations]);
  useEffect(() => { writeCareerEducation(education); },       [education]);
  useEffect(() => { writeCareerSpouse(spouse); },             [spouse]);
  useEffect(() => { writeCareerChildren(children); },         [children]);
  useEffect(() => { writeCareerFinancialGoals(financialGoals); }, [financialGoals]);

  return {
    profile, setProfile,
    promotions, setPromotions,
    milestones, setMilestones,
    dutyStations, setDutyStations,
    education, setEducation,
    spouse, setSpouse,
    children, setChildren,
    financialGoals, setFinancialGoals,
  };
}
