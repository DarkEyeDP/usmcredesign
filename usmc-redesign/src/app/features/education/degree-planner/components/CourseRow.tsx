import { motion, AnimatePresence } from 'motion/react';
import { Trash2, CheckCircle2 } from 'lucide-react';
import type { Course, LetterGrade } from '../types';
import {
  FUNDING_CYCLE, FUNDING_META,
  COURSE_STATUS_CYCLE, COURSE_STATUS_META,
  GRADE_CYCLE,
} from '../constants';
import { nextCycle, fundingClass, courseStatusClass } from '../utils';
import { NumericInput } from './NumericInput';

interface CourseRowProps {
  course: Course;
  termId: string;
  isDesert: boolean;
  updateCourse: (termId: string, courseId: string, updates: Partial<Course>) => void;
  removeCourse: (termId: string, courseId: string) => void;
}

export function CourseRow({ course, termId, isDesert, updateCourse, removeCourse }: CourseRowProps) {
  const isDone = course.status === 'complete';

  const statusBtn = (className = '') => (
    <button
      type="button"
      onClick={() => updateCourse(termId, course.id, { status: nextCycle(COURSE_STATUS_CYCLE, course.status) })}
      title={`${COURSE_STATUS_META[course.status]} — click to change`}
      className={`flex cursor-pointer items-center justify-center border transition-colors ${courseStatusClass(course.status, isDesert)} ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={course.status} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.12 }} className="flex items-center gap-1 text-[10px] font-bold">
          {isDone && <CheckCircle2 className="h-3 w-3" />}
          {COURSE_STATUS_META[course.status]}
        </motion.span>
      </AnimatePresence>
    </button>
  );

  const fundingBtn = (className = '') => (
    <button
      type="button"
      onClick={() => updateCourse(termId, course.id, { funding: nextCycle(FUNDING_CYCLE, course.funding) })}
      title={`${FUNDING_META[course.funding].full} — click to change`}
      className={`flex cursor-pointer items-center justify-center border transition-colors ${fundingClass(course.funding, isDesert)} ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={course.funding} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.12 }} className="text-[10px] font-bold">
          {FUNDING_META[course.funding].label}
        </motion.span>
      </AnimatePresence>
    </button>
  );

  const gradeClass = !isDone
    ? 'border-white/8 bg-black text-gray-700 opacity-40 cursor-not-allowed'
    : !course.grade
      ? 'cursor-pointer border-white/12 bg-black text-gray-600 hover:border-white/25'
      : course.grade === 'F' || course.grade === 'W'
        ? 'cursor-pointer border-red-500/30 bg-red-950/20 text-red-400'
        : isDesert
          ? 'cursor-pointer border-green-700/50 bg-green-50/50 text-green-800'
          : 'cursor-pointer border-green-500/30 bg-green-950/30 text-green-400';

  const gradeBtn = (className = '') => (
    <button
      type="button"
      onClick={() => isDone && updateCourse(termId, course.id, { grade: nextCycle(GRADE_CYCLE, course.grade) as LetterGrade | '' })}
      title={isDone ? (course.grade ? `Grade: ${course.grade} — click to change` : 'Click to set grade') : 'Mark course DONE to set a grade'}
      className={`flex items-center justify-center border transition-colors ${gradeClass} ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={course.grade || 'empty'} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.12 }} className="text-[11px] font-bold">
          {course.grade || '—'}
        </motion.span>
      </AnimatePresence>
    </button>
  );

  const nameInput = (className = '') => (
    <input
      type="text"
      value={course.name}
      onChange={e => updateCourse(termId, course.id, { name: e.target.value })}
      placeholder="Course name, e.g. MATH 151"
      className={`border border-white/12 bg-black px-3 py-2 font-mono text-[13px] text-white placeholder-gray-700 focus:border-red-500/50 focus:outline-none ${className}`}
    />
  );

  const deleteBtn = (className = '') => (
    <button
      onClick={() => removeCourse(termId, course.id)}
      className={`flex cursor-pointer items-center justify-center border border-white/10 text-gray-700 transition-colors hover:border-red-500/40 hover:text-red-500 ${className}`}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.18 }}
    >
      {/* ── Mobile card ── */}
      <div className="space-y-2 border border-white/10 bg-black/30 p-2.5 md:hidden">
        {nameInput('w-full')}
        <div className="grid grid-cols-[1fr_48px_76px_60px_32px] gap-1.5">
          {/* STATUS */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold tracking-wider text-gray-600">STATUS</span>
            {statusBtn('h-9 w-full')}
          </div>
          {/* CREDITS */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold tracking-wider text-gray-600">CREDITS</span>
            <NumericInput value={course.credits} onChange={n => updateCourse(termId, course.id, { credits: n })} max={12} className="h-9 w-full border border-white/12 bg-black px-2 text-center font-mono text-[13px] text-white focus:border-red-500/50 focus:outline-none" />
          </div>
          {/* COST/SH */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold tracking-wider text-gray-600">COST / SH</span>
            <div className="relative">
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-gray-600">$</span>
              <NumericInput value={course.costPerCredit} onChange={n => updateCourse(termId, course.id, { costPerCredit: n })} min={0} className="h-9 w-full border border-white/12 bg-black pl-5 pr-2 font-mono text-[13px] text-white focus:border-red-500/50 focus:outline-none" />
            </div>
          </div>
          {/* FUNDING */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold tracking-wider text-gray-600">FUNDING</span>
            {fundingBtn('h-9 w-full')}
          </div>
          {/* DELETE — label spacer keeps alignment */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-transparent select-none">·</span>
            {deleteBtn('h-9 w-full')}
          </div>
        </div>
        {/* GRADE — only revealed when course is complete */}
        {isDone && (
          <div className="flex flex-col gap-1 w-16">
            <span className="text-[9px] font-bold tracking-wider text-gray-600">GRADE</span>
            {gradeBtn('h-9 w-full')}
          </div>
        )}
      </div>

      {/* ── Desktop grid ── */}
      <div className="hidden md:grid md:grid-cols-[1fr_100px_72px_100px_80px_52px_32px] md:gap-2 md:items-center">
        {nameInput('w-full')}
        {statusBtn('h-[38px] w-full')}
        <NumericInput value={course.credits} onChange={n => updateCourse(termId, course.id, { credits: n })} max={12} className="w-full border border-white/12 bg-black px-3 py-2 font-mono text-[13px] text-white focus:border-red-500/50 focus:outline-none" />
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-gray-600">$</span>
          <NumericInput value={course.costPerCredit} onChange={n => updateCourse(termId, course.id, { costPerCredit: n })} min={0} className="w-full border border-white/12 bg-black pl-6 pr-3 py-2 font-mono text-[13px] text-white focus:border-red-500/50 focus:outline-none" />
        </div>
        {fundingBtn('h-[38px] w-full')}
        {gradeBtn('h-[38px] w-full')}
        {deleteBtn('h-[38px] w-8')}
      </div>
    </motion.div>
  );
}
