import { AppData, Learner, ExamSet } from '../types';
import { sectionKeyOfClass } from './defaults';

export interface ValidationIssue {
  id: string;
  type: 'invalid_mark' | 'missing_scores' | 'missing_comment' | 'missing_learner_info';
  severity: 'error' | 'warning' | 'info';
  learnerId: string;
  learnerName: string;
  cls: string;
  examSetId?: string;
  examSetLabel?: string;
  subject?: string;
  details: string;
}

export interface ValidationSummary {
  timestamp: string;
  totalIssues: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  issues: ValidationIssue[];
}

/**
 * Perform a comprehensive audit across the entire dataset to detect:
 * 1. Invalid mark ranges (< 0 or > 100 or non-numeric)
 * 2. Missing marks/grades for active learners across exam sets
 * 3. Missing teacher/head evaluation comments
 * 4. Missing required profile data (e.g. LIN / UNEB numbers)
 */
export function validateDataset(data: AppData): ValidationSummary {
  const issues: ValidationIssue[] = [];
  const activeLearners = (data.learners || []).filter(l => !l.archived);
  const examSets = data.settings?.examSets || [];
  const learnerMap = new Map<string, Learner>(activeLearners.map(l => [l.id, l]));

  // 1. Audit invalid mark ranges & corrupted values in scores table
  const scores = data.scores || {};
  Object.entries(scores).forEach(([compositeKey, scoreRecord]) => {
    const [learnerId, examSetId] = compositeKey.split('|');
    const learner = learnerMap.get(learnerId);
    if (!learner) return; // Skip archived or deleted learners

    const examSet = examSets.find(e => e.id === examSetId);
    const examLabel = examSet ? `${examSet.label} (${examSet.period})` : 'Exam Set';

    if (scoreRecord && typeof scoreRecord === 'object') {
      Object.entries(scoreRecord).forEach(([subject, rawValue]) => {
        if (rawValue === undefined || rawValue === null || (rawValue as any) === '') return;
        const numVal = Number(rawValue);

        if (isNaN(numVal)) {
          issues.push({
            id: `val-err-${compositeKey}-${subject}`,
            type: 'invalid_mark',
            severity: 'error',
            learnerId: learner.id,
            learnerName: learner.name,
            cls: learner.cls,
            examSetId,
            examSetLabel: examLabel,
            subject,
            details: `Invalid non-numeric mark "${rawValue}" recorded in ${subject} for ${learner.name} (${learner.cls}).`
          });
        } else if (numVal < 0 || numVal > 100) {
          issues.push({
            id: `val-range-${compositeKey}-${subject}`,
            type: 'invalid_mark',
            severity: 'error',
            learnerId: learner.id,
            learnerName: learner.name,
            cls: learner.cls,
            examSetId,
            examSetLabel: examLabel,
            subject,
            details: `Out-of-range mark (${numVal}) in ${subject} for ${learner.name} (${learner.cls}). Marks must be between 0 and 100.`
          });
        }
      });
    }
  });

  // 2. Audit missing grades / unentered subject scores for active learners
  activeLearners.forEach(learner => {
    const secKey = sectionKeyOfClass(learner.cls);
    const secConfig = data.settings.sections?.[secKey];
    if (!secConfig) return;

    const subjects = secConfig.subjects || [];
    // Relevant exam sets for this learner's class
    const relevantExams = examSets.filter(e => !e.classes || e.classes.length === 0 || e.classes.includes(learner.cls));

    relevantExams.forEach(exam => {
      const compositeKey = `${learner.id}|${exam.id}`;
      const scoreRecord = scores[compositeKey] || {};
      const examLabel = `${exam.label} (${exam.period})`;

      subjects.forEach(sub => {
        const mark = scoreRecord[sub.name];
        if (mark === undefined || mark === null || (mark as any) === '') {
          issues.push({
            id: `val-miss-${compositeKey}-${sub.name}`,
            type: 'missing_scores',
            severity: 'warning',
            learnerId: learner.id,
            learnerName: learner.name,
            cls: learner.cls,
            examSetId: exam.id,
            examSetLabel: examLabel,
            subject: sub.name,
            details: `Missing ${sub.name} mark for ${learner.name} (${learner.cls}) in ${examLabel}.`
          });
        }
      });

      // 3. Audit missing comments if scores exist
      const hasSomeScores = Object.values(scoreRecord).some(v => (v as any) !== '' && v !== undefined && v !== null);
      if (hasSomeScores) {
        const commentRecord = data.comments?.[compositeKey];
        if (!commentRecord || !commentRecord.teacher || !commentRecord.head) {
          issues.push({
            id: `val-cmt-${compositeKey}`,
            type: 'missing_comment',
            severity: 'info',
            learnerId: learner.id,
            learnerName: learner.name,
            cls: learner.cls,
            examSetId: exam.id,
            examSetLabel: examLabel,
            details: `Missing Class/Head Teacher evaluation remarks for ${learner.name} (${learner.cls}) in ${examLabel}.`
          });
        }
      }
    });

    // 4. Audit essential profile fields
    if (learner.cls === 'P7' || learner.cls === 'Primary 7') {
      if (!learner.unebNo && !learner.lin) {
        issues.push({
          id: `val-p7-${learner.id}`,
          type: 'missing_learner_info',
          severity: 'warning',
          learnerId: learner.id,
          learnerName: learner.name,
          cls: learner.cls,
          details: `Candidate ${learner.name} (${learner.cls}) is missing UNEB Index / LIN number for registration.`
        });
      }
    }
  });

  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const infos = issues.filter(i => i.severity === 'info');

  return {
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    totalIssues: issues.length,
    errorCount: errors.length,
    warningCount: warnings.length,
    infoCount: infos.length,
    issues
  };
}

/**
 * Runs dataset audit and notifies Notification Center with summary & top critical errors
 */
export function runDataAuditAndNotify(data: AppData, verbose: boolean = false): ValidationSummary {
  const summary = validateDataset(data);

  if (summary.totalIssues > 0 || verbose) {
    let title = 'Data Audit Complete';
    let message = `Found ${summary.errorCount} critical mark errors, ${summary.warningCount} missing grade entries, and ${summary.infoCount} pending comments.`;
    let type: 'success' | 'warning' | 'error' | 'info' = 'info';

    if (summary.errorCount > 0) {
      type = 'error';
      title = `⚠️ ${summary.errorCount} Data Validation Errors Detected!`;
    } else if (summary.warningCount > 0) {
      type = 'warning';
      title = `Data Audit: ${summary.warningCount} Missing Marks/Grades`;
    } else if (summary.totalIssues === 0) {
      type = 'success';
      title = 'Dataset Fully Validated';
      message = 'All student marks, grades, ranges (0-100), and remarks pass validation checks with 100% accuracy!';
    }

    // Dispatch modal notification to NotificationCenter
    window.dispatchEvent(
      new CustomEvent('otec-modal-notify', {
        detail: {
          title,
          message,
          type,
          timestamp: summary.timestamp
        }
      })
    );
  }

  return summary;
}
