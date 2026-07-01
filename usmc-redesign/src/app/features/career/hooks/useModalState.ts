import { useState } from 'react';
import type { Promotion, CareerMilestone, DutyStation, EducationEvent, Child, FinancialGoal } from '../types';

export function useModalState() {
  const [showEditProfile, setShowEditProfile]           = useState(false);
  const [showAddPromotion, setShowAddPromotion]         = useState(false);
  const [showAddMilestone, setShowAddMilestone]         = useState(false);
  const [showAddDutyStation, setShowAddDutyStation]     = useState(false);
  const [showAddEducation, setShowAddEducation]         = useState(false);
  const [showAddSpouse, setShowAddSpouse]               = useState(false);
  const [showAddChild, setShowAddChild]                 = useState(false);
  const [showAddFinancialGoal, setShowAddFinancialGoal] = useState(false);

  const [editingPromotion,     setEditingPromotion]     = useState<Promotion | null>(null);
  const [editingMilestone,     setEditingMilestone]     = useState<CareerMilestone | null>(null);
  const [editingDutyStation,   setEditingDutyStation]   = useState<DutyStation | null>(null);
  const [editingEducation,     setEditingEducation]     = useState<EducationEvent | null>(null);
  const [editingChild,         setEditingChild]         = useState<Child | null>(null);
  const [editingFinancialGoal, setEditingFinancialGoal] = useState<FinancialGoal | null>(null);

  return {
    showEditProfile, setShowEditProfile,
    showAddPromotion, setShowAddPromotion,
    showAddMilestone, setShowAddMilestone,
    showAddDutyStation, setShowAddDutyStation,
    showAddEducation, setShowAddEducation,
    showAddSpouse, setShowAddSpouse,
    showAddChild, setShowAddChild,
    showAddFinancialGoal, setShowAddFinancialGoal,
    editingPromotion, setEditingPromotion,
    editingMilestone, setEditingMilestone,
    editingDutyStation, setEditingDutyStation,
    editingEducation, setEditingEducation,
    editingChild, setEditingChild,
    editingFinancialGoal, setEditingFinancialGoal,
  };
}
