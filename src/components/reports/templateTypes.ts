import React from 'react';
import { Learner, ExamSet, SchoolSettings, CommentRecord } from '../../types';

// Shared type for report data produced by computeSingleReportData
export interface ReportData {
  subjectRows: {
    name: string;
    marks: number | string | null; // number for primary, string for nursery AI comments
    grade: string;
    remark: string;
    rank: string;
  }[];
  total: number;
  average: number;
  overallGrade: string;
  positionText: string;
  psychoRec: Record<string, number>;
  commentRec: CommentRecord;
  pleInfo: any;
  grading: { grade: string; min: number; max: number; remark: string }[];
}

export interface TemplateProps {
  learner: Learner;
  examSet: ExamSet;
  report: ReportData;
  settings: SchoolSettings;
  sectionKey: 'preprimary' | 'lower' | 'upper';
  draftMode: boolean;
  isBlankReportMode: boolean;
  teacherSignature: string | null;
  headSignature: string | null;
  schoolStamp: string | null;
}

// Map nursery subjects to emoji icons
export const NURSERY_SUBJECT_ICONS: Record<string, string> = {
  // New curriculum Learning Areas
  'LEARNING AREA 1: SOCIAL DEVELOPMENT': '🤝',
  'LEARNING AREA 2: ENVIRONMENTAL EXPLORATION': '🌿',
  'LEARNING AREA 3: HEALTH & SELF CARE': '🧼',
  'LEARNING AREA 4: LANGUAGE DEVELOPMENT': '📖',
  'LEARNING AREA 5: MATHEMATICAL CONCEPTS': '🔢',
  // Legacy subject names
  'NUMBERS': '🔢',
  'ENGLISH': '🔤',
  'HEALTH HABBITS': '🧼',
  'SOCIAL DEVELOPMENTS': '🤝',
  'READING': '📖',
  'WRITING': '✏️',
  'DRAWING': '🎨',
  // Generic fallbacks
  'MATHEMATICS': '🔢',
  'LITERACY': '📚',
  'SCIENCE': '🔬',
  'MUSIC': '🎵',
  'PE': '⚽',
  'CRE': '🙏',
  'ART': '🎨',
};

export function getSubjectIcon(name: string): string {
  return NURSERY_SUBJECT_ICONS[name.toUpperCase()] || NURSERY_SUBJECT_ICONS[name] || '📋';
}
