import { AppData, Learner, ScoreRecord, FinanceTransaction } from '../types';

export interface SyncRecordDetail {
  id: string;
  category: 'learner' | 'score' | 'finance' | 'settings';
  type: 'added' | 'updated';
  title: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface SyncSummaryResult {
  hasChanges: boolean;
  totalAddedCount: number;
  totalUpdatedCount: number;
  learnersAddedCount: number;
  learnersUpdatedCount: number;
  scoresAddedCount: number;
  scoresUpdatedCount: number;
  financeAddedCount: number;
  financeUpdatedCount: number;
  otherRecordsCount: number;
  recordDetails: SyncRecordDetail[];
  mergedData: AppData;
  sourceName?: string;
  syncedAt: string;
}

/**
 * Smart merges incoming Google Drive data with current local database
 * and generates a breakdown of every record added or updated.
 */
export function mergeDriveDataWithSummary(
  currentData: AppData,
  incomingData: AppData,
  sourceName: string = 'Google Drive Cloud'
): SyncSummaryResult {
  const details: SyncRecordDetail[] = [];

  let learnersAddedCount = 0;
  let learnersUpdatedCount = 0;
  let scoresAddedCount = 0;
  let scoresUpdatedCount = 0;
  let financeAddedCount = 0;
  let financeUpdatedCount = 0;
  let otherRecordsCount = 0;

  // Clone current data as starting point for merge
  const merged: AppData = JSON.parse(JSON.stringify(currentData));

  // --- 1. MERGE LEARNERS ---
  const mergedLearners: Learner[] = [...merged.learners];

  if (Array.isArray(incomingData.learners)) {
    incomingData.learners.forEach(incLearner => {
      // Find matching learner by ID or admission number
      const existingIdx = mergedLearners.findIndex(
        l => l.id === incLearner.id || (l.admNo && incLearner.admNo && l.admNo.trim().toLowerCase() === incLearner.admNo.trim().toLowerCase())
      );

      if (existingIdx === -1) {
        // NEW LEARNER
        mergedLearners.push(incLearner);
        learnersAddedCount++;
        details.push({
          id: `l-add-${incLearner.id}`,
          category: 'learner',
          type: 'added',
          title: `Added New Learner: ${incLearner.name}`,
          details: `Class ${incLearner.cls} • Adm No: ${incLearner.admNo || 'N/A'} • Sex: ${incLearner.sex}`
        });
      } else {
        // EXISTING LEARNER - Check for changes
        const currentL = mergedLearners[existingIdx];
        const updatedFields: string[] = [];

        if (incLearner.name !== currentL.name) updatedFields.push(`Name (${currentL.name} ➔ ${incLearner.name})`);
        if (incLearner.cls !== currentL.cls) updatedFields.push(`Class (${currentL.cls} ➔ ${incLearner.cls})`);
        if (incLearner.outstandingBalance !== currentL.outstandingBalance) {
          updatedFields.push(`Balance (UGX ${currentL.outstandingBalance || '0'} ➔ UGX ${incLearner.outstandingBalance || '0'})`);
        }
        if (incLearner.guardianPhone !== currentL.guardianPhone) updatedFields.push('Parent Contact');
        if (incLearner.archived !== currentL.archived) updatedFields.push(`Status (${incLearner.archived ? 'Archived' : 'Active'})`);

        if (updatedFields.length > 0) {
          mergedLearners[existingIdx] = { ...currentL, ...incLearner };
          learnersUpdatedCount++;
          details.push({
            id: `l-upd-${incLearner.id}`,
            category: 'learner',
            type: 'updated',
            title: `Updated Learner: ${incLearner.name} (${incLearner.cls})`,
            details: `Updated fields: ${updatedFields.join(', ')}`
          });
        }
      }
    });
  }
  merged.learners = mergedLearners;

  // --- 2. MERGE ACADEMIC MARKS / SCORES ---
  const currentScores = { ...merged.scores };

  if (incomingData.scores && typeof incomingData.scores === 'object') {
    Object.entries(incomingData.scores).forEach(([compositeKey, incScoreObj]) => {
      const existingScoreObj = currentScores[compositeKey];

      // Parse compositeKey "learnerId|examSetId"
      const [studentId, examSetId] = compositeKey.split('|');
      const student = merged.learners.find(l => l.id === studentId);
      const studentName = student ? student.name : `Learner #${studentId || compositeKey}`;

      if (!existingScoreObj) {
        // NEW SCORE RECORD
        currentScores[compositeKey] = incScoreObj;
        const totalSubjects = Object.keys(incScoreObj).length;
        scoresAddedCount += totalSubjects;
        details.push({
          id: `s-add-${compositeKey}`,
          category: 'score',
          type: 'added',
          title: `Added Mark Entry: ${studentName}`,
          details: `Exam Set: ${examSetId || 'Standard'} • ${totalSubjects} subject marks synced`
        });
      } else {
        // COMPARE SUBJECT MARKS
        const mergedObj: ScoreRecord = { ...existingScoreObj };
        let hasObjUpdated = false;
        const scoreChanges: string[] = [];

        Object.entries(incScoreObj).forEach(([subj, incMark]) => {
          const prevMark = existingScoreObj[subj];
          if (prevMark === undefined) {
            mergedObj[subj] = incMark;
            scoresAddedCount++;
            hasObjUpdated = true;
            scoreChanges.push(`${subj}: +${incMark}`);
          } else if (prevMark !== incMark) {
            mergedObj[subj] = incMark;
            scoresUpdatedCount++;
            hasObjUpdated = true;
            scoreChanges.push(`${subj}: ${prevMark} ➔ ${incMark}`);
          }
        });

        if (hasObjUpdated) {
          currentScores[compositeKey] = mergedObj;
          details.push({
            id: `s-upd-${compositeKey}`,
            category: 'score',
            type: 'updated',
            title: `Updated Marks: ${studentName}`,
            details: `Exam Set: ${examSetId || 'Standard'} • Changes: ${scoreChanges.join(', ')}`
          });
        }
      }
    });
  }
  merged.scores = currentScores;

  // --- 3. MERGE FINANCES / TRANSACTIONS ---
  const currentFinances: FinanceTransaction[] = Array.isArray(merged.finances) ? [...merged.finances] : [];

  if (Array.isArray(incomingData.finances)) {
    incomingData.finances.forEach(incTx => {
      const existingIdx = currentFinances.findIndex(t => t.id === incTx.id);

      if (existingIdx === -1) {
        // NEW TRANSACTION
        currentFinances.push(incTx);
        financeAddedCount++;
        details.push({
          id: `f-add-${incTx.id}`,
          category: 'finance',
          type: 'added',
          title: `Added ${incTx.type.toUpperCase()}: ${incTx.category}`,
          details: `Amount: UGX ${incTx.amount?.toLocaleString() || 0} • Date: ${incTx.date} • ${incTx.description || ''}`
        });
      } else {
        const existingTx = currentFinances[existingIdx];
        if (existingTx.amount !== incTx.amount || existingTx.category !== incTx.category) {
          currentFinances[existingIdx] = { ...existingTx, ...incTx };
          financeUpdatedCount++;
          details.push({
            id: `f-upd-${incTx.id}`,
            category: 'finance',
            type: 'updated',
            title: `Updated Financial Record: ${incTx.category}`,
            details: `Date: ${incTx.date} • ${incTx.description || ''}`,
            previousValue: `UGX ${existingTx.amount?.toLocaleString() || 0}`,
            newValue: `UGX ${incTx.amount?.toLocaleString() || 0}`
          });
        }
      }
    });
  }
  merged.finances = currentFinances;

  // Preserve latest settings if incoming settings exist
  if (incomingData.settings) {
    merged.settings = { ...merged.settings, ...incomingData.settings };
  }

  const totalAdded = learnersAddedCount + scoresAddedCount + financeAddedCount;
  const totalUpdated = learnersUpdatedCount + scoresUpdatedCount + financeUpdatedCount;
  const hasChanges = (totalAdded + totalUpdated + otherRecordsCount) > 0;

  return {
    hasChanges,
    totalAddedCount: totalAdded,
    totalUpdatedCount: totalUpdated,
    learnersAddedCount,
    learnersUpdatedCount,
    scoresAddedCount,
    scoresUpdatedCount,
    financeAddedCount,
    financeUpdatedCount,
    otherRecordsCount,
    recordDetails: details,
    mergedData: merged,
    sourceName,
    syncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
}
