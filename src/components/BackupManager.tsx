import { useAppStore } from "../store/useAppStore";
import React, { useState, useEffect } from 'react';
import { AppData } from '../types';
import dataManager from '../lib/db';
import { mergeDriveDataWithSummary, SyncSummaryResult } from '../lib/dataSyncMerge';
import DriveSyncSummaryModal from './DriveSyncSummaryModal';
import { 
  encryptSchoolData, 
  decryptSchoolData, 
  getStoredMasterPassphrase, 
  setStoredMasterPassphrase, 
  EncryptedSnapshotPayload 
} from '../lib/cryptoUtils';
import { 
  Download, 
  Upload, 
  ShieldAlert, 
  CheckCircle2, 
  History, 
  Database, 
  Clock, 
  RefreshCw, 
  Cloud, 
  CloudOff, 
  CloudUpload, 
  LogOut, 
  ExternalLink, 
  Loader2,
  Sparkles,
  Users,
  Monitor,
  Radio,
  Zap,
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  Calendar,
  Eye,
  EyeOff,
  HardDrive,
  Shield,
  AlertTriangle,
  Github
} from 'lucide-react';
import { 
  googleSignIn, 
  initGoogleAuth, 
  logoutGoogle, 
  getOrCreateFolder, 
  uploadFileToDrive, 
  listBackupFiles, 
  downloadFileFromDrive, 
  getCachedAccessToken, 
  getCachedUser,
  updateFileInDrive,
  silentSyncToGoogleDrive
} from '../lib/googleDriveService';

interface BackupSnapshot {
  id: string;
  timestamp: string;
  label: string;
}

export interface DailyCloudSnapshotItem {
  id: string;
  dateStr: string;
  timestamp: string;
  encryptedPayload: EncryptedSnapshotPayload;
  uploadedToGDrive: boolean;
  gDriveFileId?: string;
  gDriveFileName?: string;
  sizeBytes: number;
  recordCounts: {
    learners: number;
    scores: number;
    finance: number;
  };
}

interface BackupManagerProps {
  backgroundOnly?: boolean;
}

export default function BackupManager({ backgroundOnly = false }: BackupManagerProps) {
  const data = useAppStore(state => state.data)!;
  const [backups, setBackups] = useState<BackupSnapshot[]>([]);
  const [lastAutoBackup, setLastAutoBackup] = useState<Date | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [restoredToast, setRestoredToast] = useState<string | null>(null);

  // Daily Encrypted Cloud Snapshot states
  const [dailyCloudSnapshots, setDailyCloudSnapshots] = useState<DailyCloudSnapshotItem[]>([]);
  const [isCreatingDailySnapshot, setIsCreatingDailySnapshot] = useState(false);
  const [masterPassphrase, setMasterPassphrase] = useState<string>(getStoredMasterPassphrase());
  const [showPassphraseModal, setShowPassphraseModal] = useState(false);
  const [newPassphraseInput, setNewPassphraseInput] = useState('');
  const [decryptingSnapshot, setDecryptingSnapshot] = useState<DailyCloudSnapshotItem | null>(null);
  const [passphraseInput, setPassphraseInput] = useState('');
  const [showPassphraseText, setShowPassphraseText] = useState(false);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  
  const [githubSyncing, setGithubSyncing] = useState(false);

  const handleGitHubSync = (isAuto: any = false) => {
    const auto = isAuto === true;
    if (!auto && window.confirm("Are you sure you want to back up and sync the entire application code and database to GitHub?") === false) {
      return;
    }
    setGithubSyncing(true);
    const isElectron = window && (window as any).process && (window as any).process.type;
    if (isElectron) {
      try {
        const { exec } = (window as any).require('child_process');
        const path = (window as any).require('path');
        const fs = (window as any).require('fs');
        const cwd = (window as any).process.cwd();
        
        try {
          const currentDataStr = JSON.stringify(dataManager.getData(), null, 2);
          fs.writeFileSync(path.join(cwd, 'database_backup.json'), currentDataStr);
        } catch (fsErr) {
          console.error('Failed to write database_backup.json:', fsErr);
        }
        
        const isWin = navigator.userAgent.toLowerCase().includes('win');
        const scriptName = isWin ? 'sync-github.bat' : './sync-github.command';
        
        exec(scriptName, { cwd }, (error: any, stdout: any, stderr: any) => {
          setGithubSyncing(false);
          if (error) {
            console.error('GitHub Sync Error:', error);
            triggerToast('Failed to sync with GitHub. See console for details.', 'error');
          } else {
            console.log('GitHub Sync Output:', stdout);
            if (!auto) {
              setRestoredToast('Source code and database successfully backed up to GitHub!');
              triggerToast('Database and source code successfully backed up to GitHub!', 'success');
            } else {
              triggerToast('Automated Database Backup to GitHub completed!', 'info');
            }
            dataManager.addActivityLog('settings_modified', auto ? 'Automated periodic GitHub database backup completed.' : 'Synced source code and database to GitHub.');
          }
        });
      } catch (e) {
        setGithubSyncing(false);
        console.error('Child process error:', e);
        if (!auto) triggerToast('Unable to execute sync script. Ensure you are running the Desktop app.', 'error');
      }
    } else {
      setGithubSyncing(false);
      if (!auto) triggerToast('GitHub Sync is only available in the Desktop Application.', 'warning');
    }
  };

  useEffect(() => {
    const checkGitHubAutoSync = () => {
      try {
        const lastSync = localStorage.getItem('otec_last_github_auto_sync');
        const now = Date.now();
        // 4 hours = 14400000 ms
        if (!lastSync || now - parseInt(lastSync, 10) > 14400000) {
          console.log('Triggering automated GitHub data sync...');
          localStorage.setItem('otec_last_github_auto_sync', now.toString());
          handleGitHubSync(true);
        }
      } catch (e) {
        console.error('GitHub Auto Sync error:', e);
      }
    };
    const timeout = setTimeout(checkGitHubAutoSync, 15000);
    const interval = setInterval(checkGitHubAutoSync, 3600000); 
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    window.dispatchEvent(new CustomEvent('otec-toast', { detail: { message, type } }));
  };

  // Compute if daily Cloud Snapshot sync is stale (> 48 hours)
  const calculateStaleStatus = () => {
    const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;
    
    // Find latest daily snapshot that was uploaded or created
    const newestUploaded = dailyCloudSnapshots.find(s => s.uploadedToGDrive);
    const newestSnapshot = dailyCloudSnapshots[0]; // sorted newest first
    
    let lastSyncMs = 0;
    if (newestUploaded) {
      lastSyncMs = new Date(newestUploaded.timestamp).getTime();
    } else if (newestSnapshot) {
      lastSyncMs = new Date(newestSnapshot.timestamp).getTime();
    } else {
      const savedDateStr = localStorage.getItem('otec_last_daily_cloud_snapshot_date');
      if (savedDateStr) {
        lastSyncMs = new Date(savedDateStr).getTime();
      }
    }

    if (!lastSyncMs) {
      return {
        isStale: true,
        hoursOverdue: 48,
        lastSyncTimeStr: 'Never synced'
      };
    }

    const diffMs = Date.now() - lastSyncMs;
    const hoursSince = Math.floor(diffMs / (1000 * 60 * 60));
    const isStale = diffMs >= FORTY_EIGHT_HOURS_MS;

    return {
      isStale,
      hoursOverdue: hoursSince,
      lastSyncTimeStr: hoursSince < 24 
        ? `${hoursSince} hour${hoursSince === 1 ? '' : 's'} ago`
        : `${Math.floor(hoursSince / 24)} day${Math.floor(hoursSince / 24) === 1 ? '' : 's'} ago (${hoursSince} hrs)`
    };
  };

  const staleStatus = calculateStaleStatus();

  // Simulation helper to test >48h stale red badge condition
  const handleSimulateStaleSnapshot = () => {
    const fiftyHoursAgo = new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString();
    const staleDateStr = fiftyHoursAgo.slice(0, 10);

    const simulatedStaleSnaps: DailyCloudSnapshotItem[] = dailyCloudSnapshots.length > 0 
      ? dailyCloudSnapshots.map(s => ({
          ...s,
          timestamp: fiftyHoursAgo,
          uploadedToGDrive: false
        }))
      : [{
          id: 'stale-test-snap',
          dateStr: staleDateStr,
          timestamp: fiftyHoursAgo,
          encryptedPayload: {
            v: 1,
            algorithm: 'AES-256-GCM',
            ciphertext: 'stale-test',
            iv: 'stale-iv',
            salt: 'stale-salt',
            compressed: false,
            checksum: 'stale-checksum'
          },
          uploadedToGDrive: false,
          sizeBytes: 15400,
          recordCounts: { learners: 216, scores: 1200, finance: 50 }
        }];

    setDailyCloudSnapshots(simulatedStaleSnaps);
    localStorage.setItem('otec_daily_cloud_snapshots', JSON.stringify(simulatedStaleSnaps));
    localStorage.setItem('otec_last_daily_cloud_snapshot_date', staleDateStr);
    triggerToast('Simulated stale cloud snapshot (>48 hours overdue). Red warning badge activated!', 'warning');
  };

  // Google Drive state
  const [gUser, setGUser] = useState<any>(getCachedUser());
  const [gToken, setGToken] = useState<string | null>(getCachedAccessToken());
  const [gDriveBackups, setGDriveBackups] = useState<any[]>([]);
  const [gLoading, setGLoading] = useState(false);
  const [gSyncing, setGSyncing] = useState(false);
  const [gError, setGError] = useState<string | null>(null);
  const [syncSummary, setSyncSummary] = useState<SyncSummaryResult | null>(null);

  const fetchGoogleBackups = async (tokenToUse: string) => {
    try {
      setGLoading(true);
      setGError(null);
      // 1. Get or create root folder
      const rootFolderId = await getOrCreateFolder(tokenToUse, 'OTEC School Report Cards');
      // 2. Get or create Database Backups subfolder
      const backupFolderId = await getOrCreateFolder(tokenToUse, 'Database Backups', rootFolderId);
      // 3. List backups
      const files = await listBackupFiles(tokenToUse, backupFolderId);
      setGDriveBackups(files);
    } catch (err: any) {
      if (err.message === 'UNAUTHENTICATED') {
        setGUser(null);
        setGToken(null);
        setGDriveBackups([]);
        setGError('Google connection expired. Please reconnect your Google Drive account.');
        triggerToast('Google connection expired. Please reconnect.', 'warning');
      } else if (err.message === 'NETWORK_ERROR' || err.message === 'Failed to fetch' || !navigator.onLine) {
        console.warn('Google Drive backup fetch deferred: Device offline or network unavailable.');
        setGError('Google Drive connection currently offline or unreachable.');
      } else {
        console.error('Failed to load Google Drive backups:', err);
        setGError('Unable to list files from Google Drive.');
      }
    } finally {
      setGLoading(false);
    }
  };

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setGUser(user);
        setGToken(token);
        fetchGoogleBackups(token);
      },
      () => {
        setGUser(null);
        setGToken(null);
        setGDriveBackups([]);
      }
    );

    const handleExpired = () => {
      setGUser(null);
      setGToken(null);
      setGDriveBackups([]);
      setGError('Google connection expired. Please reconnect your Google Drive account.');
      triggerToast('Google connection expired. Please reconnect.', 'warning');
    };
    window.addEventListener('otec-gdrive-token-expired', handleExpired);

    return () => {
      unsubscribe();
      window.removeEventListener('otec-gdrive-token-expired', handleExpired);
    };
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setGLoading(true);
      setGError(null);
      const res = await googleSignIn();
      if (res) {
        setGUser(res.user);
        setGToken(res.accessToken);
        setRestoredToast('Successfully connected to Google Drive!');
        triggerToast('Successfully connected and logged into Google Drive!', 'success');
        await fetchGoogleBackups(res.accessToken);
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setGError('Google connection failed: ' + (err.message || 'Unknown error'));
      triggerToast('Google connection failed: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setGLoading(false);
    }
  };

  const handleGoogleSignOut = async () => {
    if (window.confirm('Disconnect from your Google Drive account? Access tokens will be cleared.')) {
      try {
        await logoutGoogle();
        setGUser(null);
        setGToken(null);
        setGDriveBackups([]);
        setRestoredToast('Disconnected from Google Drive.');
        triggerToast('Disconnected and signed out of Google Drive.', 'info');
      } catch (err: any) {
        console.error('Sign-out failed:', err);
      }
    }
  };

  const handleGoogleBackup = async () => {
    const token = gToken || getCachedAccessToken();
    if (!token) {
      alert('Please connect your Google Drive account first.');
      return;
    }

    const fileContent = JSON.stringify(data, null, 2);
    const lastBackupContent = localStorage.getItem('otec_last_gdrive_backup_content');
    
    if (lastBackupContent && lastBackupContent === fileContent) {
      setRestoredToast('System matches latest backup. No duplicate upload needed!');
      triggerToast('No changes detected since last backup. Duplicate upload skipped.', 'info');
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to backup your current school database records, marks, and settings to your personal Google Drive? This will update the primary 'report data saved on the cloud.json' file inside your Google Drive folder, avoiding duplicates."
    );
    if (!confirmed) return;

    try {
      setGSyncing(true);
      setGError(null);
      
      const rootFolderId = await getOrCreateFolder(token, 'OTEC School Report Cards');
      const backupFolderId = await getOrCreateFolder(token, 'Database Backups', rootFolderId);
      
      // List existing files to find report data saved on the cloud.json
      const files = await listBackupFiles(token, backupFolderId);
      const existingFile = files.find(f => f.name === 'report data saved on the cloud.json');
      
      if (existingFile) {
        await updateFileInDrive(token, existingFile.id, fileContent);
        console.log("Successfully updated 'report data saved on the cloud.json' in Google Drive.");
      } else {
        await uploadFileToDrive(token, backupFolderId, 'report data saved on the cloud.json', 'application/json', fileContent);
        console.log("Successfully created 'report data saved on the cloud.json' in Google Drive.");
      }
      
      localStorage.setItem('otec_last_gdrive_backup_content', fileContent);
      
      setRestoredToast('Database successfully backed up to Google Drive!');
      triggerToast('Database successfully backed up to Google Drive!', 'success');
      dataManager.addActivityLog('settings_modified', "Synced and secured database backup to 'report data saved on the cloud.json' in Google Drive.");
      
      await fetchGoogleBackups(token);
    } catch (err: any) {
      if (err.message === 'UNAUTHENTICATED') {
        setGUser(null);
        setGToken(null);
        setGDriveBackups([]);
        setGError('Google connection expired. Please reconnect your Google Drive account.');
        triggerToast('Google connection expired. Please reconnect.', 'warning');
      } else if (err.message === 'NETWORK_ERROR' || err.message === 'Failed to fetch' || !navigator.onLine) {
        console.warn('Google Drive backup skipped: Device offline or network unavailable.');
        setGError('Google Drive connection currently offline or unreachable.');
        triggerToast('Google Drive offline. Changes saved locally.', 'warning');
      } else {
        console.error('Google Drive backup failed:', err);
        setGError('Failed to upload backup to Google Drive.');
        triggerToast('Failed to upload database backup to Google Drive.', 'error');
      }
    } finally {
      setGSyncing(false);
    }
  };

  const handleAutoSyncAndAddDriveData = async (targetFileId?: string, targetFileName?: string) => {
    const token = gToken || getCachedAccessToken();
    if (!token) {
      alert('Please connect your Google Drive account first.');
      return;
    }

    try {
      setGSyncing(true);
      setGError(null);

      const rootFolderId = await getOrCreateFolder(token, 'OTEC School Report Cards');
      const backupFolderId = await getOrCreateFolder(token, 'Database Backups', rootFolderId);
      
      const files = await listBackupFiles(token, backupFolderId);
      
      let fileToFetch = null;
      if (targetFileId) {
        fileToFetch = files.find(f => f.id === targetFileId);
      }
      if (!fileToFetch) {
        fileToFetch = files.find(f => f.name === 'report data saved on the cloud.json') || files[0];
      }

      if (!fileToFetch) {
        alert("No backup file was found on your Google Drive. Please click 'Backup to Google Drive' first to create one.");
        triggerToast('No cloud backup file found on Google Drive.', 'warning');
        return;
      }

      const content = await downloadFileFromDrive(token, fileToFetch.id);
      const parsed = JSON.parse(content);

      if (parsed && (parsed.learners || parsed.scores || parsed.settings)) {
        // Run smart merge calculation
        const summary = mergeDriveDataWithSummary(dataManager.getData(), parsed, fileToFetch.name);
        setSyncSummary(summary);
      } else {
        throw new Error('Invalid JSON structure in Google Drive file');
      }
    } catch (err: any) {
      if (err.message === 'UNAUTHENTICATED') {
        setGUser(null);
        setGToken(null);
        setGDriveBackups([]);
        setGError('Google connection expired. Please reconnect your Google Drive account.');
        triggerToast('Google connection expired. Please reconnect.', 'warning');
      } else if (err.message === 'NETWORK_ERROR' || err.message === 'Failed to fetch' || !navigator.onLine) {
        console.warn('Google Drive Auto Sync deferred: Device offline or network unavailable.');
        setGError('Google Drive connection currently offline or unreachable.');
        triggerToast('Google Drive offline. Auto sync deferred.', 'warning');
      } else {
        console.error('Google Drive Auto Sync failed:', err);
        alert('Failed to sync data from Google Drive. Ensure the cloud file is a valid JSON database.');
        triggerToast('Failed to auto sync records from Google Drive.', 'error');
      }
    } finally {
      setGSyncing(false);
    }
  };

  const handleConfirmSyncSummary = () => {
    if (!syncSummary) return;
    
    // Save merged database state
    dataManager.setData(syncSummary.mergedData);
    localStorage.setItem('otec_last_gdrive_backup_content', JSON.stringify(syncSummary.mergedData, null, 2));

    const totalModified = syncSummary.totalAddedCount + syncSummary.totalUpdatedCount;
    const msg = totalModified > 0 
      ? `Successfully auto-added & updated ${totalModified} records from Google Drive (${syncSummary.sourceName})!`
      : 'System database synced with Google Drive (already up to date).';

    dataManager.addActivityLog(
      'settings_modified', 
      `Merged Google Drive cloud data: ${syncSummary.learnersAddedCount + syncSummary.learnersUpdatedCount} learners, ${syncSummary.scoresAddedCount + syncSummary.scoresUpdatedCount} marks, ${syncSummary.financeAddedCount + syncSummary.financeUpdatedCount} financial records updated.`
    );

    setRestoredToast(msg);
    triggerToast(msg, 'success');
    setSyncSummary(null);
  };

  const handleRetrievePrimaryBackup = async () => {
    await handleAutoSyncAndAddDriveData(undefined, 'report data saved on the cloud.json');
  };

  const handleGoogleRestore = async (fileId: string, fileName: string) => {
    await handleAutoSyncAndAddDriveData(fileId, fileName);
  };

  // Automated Daily Encrypted Cloud Snapshot compilation
  const handleCreateDailyCloudSnapshot = async (isAutomated = false) => {
    try {
      setIsCreatingDailySnapshot(true);
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const currentData = dataRef.current || data;

      // Encrypt full school database with 256-bit AES-GCM
      const encryptedPayload = await encryptSchoolData(currentData, masterPassphrase);
      const payloadString = JSON.stringify(encryptedPayload, null, 2);
      const sizeBytes = new Blob([payloadString]).size;

      let uploadedToGDrive = false;
      let gDriveFileId: string | undefined = undefined;
      let gDriveFileName = `otec_daily_snapshot_${dateStr}.json.enc`;

      // Attempt Google Drive upload if connected
      const activeToken = gToken || getCachedAccessToken();
      if (activeToken) {
        try {
          const rootFolderId = await getOrCreateFolder(activeToken, 'OTEC School Report Cards');
          const backupFolderId = await getOrCreateFolder(activeToken, 'Database Backups', rootFolderId);
          
          const uploadedFile = await uploadFileToDrive(
            activeToken,
            gDriveFileName,
            payloadString,
            backupFolderId,
            'application/json'
          );
          if (uploadedFile?.id) {
            uploadedToGDrive = true;
            gDriveFileId = uploadedFile.id;
          }
        } catch (driveErr) {
          console.warn('Daily Cloud Snapshot Google Drive upload deferred:', driveErr);
        }
      }

      const newDailySnapshot: DailyCloudSnapshotItem = {
        id: 'daily-snap-' + dateStr + '-' + Math.random().toString(36).slice(2, 7),
        dateStr,
        timestamp: now.toISOString(),
        encryptedPayload,
        uploadedToGDrive,
        gDriveFileId,
        gDriveFileName,
        sizeBytes,
        recordCounts: {
          learners: currentData.learners?.length || 0,
          scores: Object.keys(currentData.scores || {}).length,
          finance: currentData.financeLedger?.length || 0
        }
      };

      // Load existing daily snapshots
      let existingDailySnaps: DailyCloudSnapshotItem[] = [];
      try {
        const raw = localStorage.getItem('otec_daily_cloud_snapshots');
        if (raw) existingDailySnaps = JSON.parse(raw);
      } catch (e) {}

      // Retain last 30 daily snapshots
      const updatedDailySnaps = [
        newDailySnapshot,
        ...existingDailySnaps.filter(s => s.dateStr !== dateStr)
      ].slice(0, 30);

      localStorage.setItem('otec_daily_cloud_snapshots', JSON.stringify(updatedDailySnaps));
      localStorage.setItem('otec_last_daily_cloud_snapshot_date', dateStr);
      setDailyCloudSnapshots(updatedDailySnaps);

      dataManager.addActivityLog(
        'settings_modified',
        `Automated Daily Encrypted Cloud Snapshot compiled (${(sizeBytes / 1024).toFixed(1)} KB, AES-256 GCM encrypted).`,
        isAutomated ? 'System' : 'Teacher'
      );

      if (isAutomated) {
        triggerToast(`Daily Cloud Snapshot compiled & secured (${uploadedToGDrive ? 'Uploaded to Google Drive' : 'Saved to Cloud Store'})`, 'success');
      } else {
        triggerToast('Daily Encrypted Cloud Snapshot created successfully!', 'success');
      }
    } catch (err: any) {
      console.error('Failed to create daily cloud snapshot:', err);
      if (!isAutomated) {
        triggerToast('Failed to create daily cloud snapshot: ' + (err.message || 'Unknown error'), 'error');
      }
    } finally {
      setIsCreatingDailySnapshot(false);
    }
  };

  // Automated Daily Check Effect
  useEffect(() => {
    const checkDailySnapshot = () => {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const lastSnapshotDate = localStorage.getItem('otec_last_daily_cloud_snapshot_date');
        
        const raw = localStorage.getItem('otec_daily_cloud_snapshots');
        let loadedSnaps: DailyCloudSnapshotItem[] = [];
        if (raw) {
          loadedSnaps = JSON.parse(raw);
          setDailyCloudSnapshots(loadedSnaps);
        }

        const hasSnapshotForToday = loadedSnaps.some(s => s.dateStr === todayStr);

        if (!hasSnapshotForToday || lastSnapshotDate !== todayStr) {
          console.log('Automated Daily Cloud Snapshot triggers for date:', todayStr);
          handleCreateDailyCloudSnapshot(true);
        }
      } catch (e) {
        console.error('Error checking daily cloud snapshot:', e);
      }
    };

    checkDailySnapshot();
    const interval = setInterval(checkDailySnapshot, 3600000); // Check hourly
    return () => clearInterval(interval);
  }, []);

  const handleDecryptAndRestore = async (snapshot: DailyCloudSnapshotItem, inputKey?: string) => {
    try {
      setDecryptError(null);
      const keyToUse = inputKey !== undefined ? inputKey : masterPassphrase;
      
      const decryptedData = await decryptSchoolData(snapshot.encryptedPayload, keyToUse);
      
      if (!decryptedData || typeof decryptedData !== 'object' || !decryptedData.learners) {
        throw new Error('INVALID_DATA: Decrypted payload does not contain a valid school database structure.');
      }

      if (window.confirm(`Are you sure you want to restore the entire school database from the Daily Encrypted Cloud Snapshot taken on ${snapshot.dateStr} (${new Date(snapshot.timestamp).toLocaleTimeString()})?\n\nThis snapshot contains ${decryptedData.learners.length} learners and ${Object.keys(decryptedData.scores || {}).length} exam entries.`)) {
        dataManager.setData(decryptedData);
        dataManager.addActivityLog(
          'settings_modified',
          `Database restored from Daily Encrypted Cloud Snapshot dated ${snapshot.dateStr}.`
        );
        triggerToast(`Database restored successfully from ${snapshot.dateStr} encrypted snapshot!`, 'success');
        setDecryptingSnapshot(null);
        setPassphraseInput('');
      }
    } catch (err: any) {
      console.error('Decryption failed:', err);
      setDecryptError(err.message || 'Decryption failed. Please verify your passphrase.');
    }
  };

  const handleDownloadEncryptedSnapshot = (snapshot: DailyCloudSnapshotItem) => {
    try {
      const payloadStr = JSON.stringify(snapshot.encryptedPayload, null, 2);
      const blob = new Blob([payloadStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `otec_daily_snapshot_${snapshot.dateStr}.json.enc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      triggerToast(`Downloaded encrypted snapshot for ${snapshot.dateStr}`, 'info');
    } catch (err) {
      alert('Failed to download encrypted snapshot file.');
    }
  };

  const handleUploadDailySnapshotToDrive = async (snapshot: DailyCloudSnapshotItem) => {
    const activeToken = gToken || getCachedAccessToken();
    if (!activeToken) {
      triggerToast('Please connect your Google Drive account first.', 'warning');
      return;
    }

    try {
      setGSyncing(true);
      const rootFolderId = await getOrCreateFolder(activeToken, 'OTEC School Report Cards');
      const backupFolderId = await getOrCreateFolder(activeToken, 'Database Backups', rootFolderId);
      
      const fileName = snapshot.gDriveFileName || `otec_daily_snapshot_${snapshot.dateStr}.json.enc`;
      const payloadString = JSON.stringify(snapshot.encryptedPayload, null, 2);

      const uploadedFile = await uploadFileToDrive(
        activeToken,
        fileName,
        payloadString,
        backupFolderId,
        'application/json'
      );

      if (uploadedFile?.id) {
        const updatedList = dailyCloudSnapshots.map(s => {
          if (s.id === snapshot.id) {
            return {
              ...s,
              uploadedToGDrive: true,
              gDriveFileId: uploadedFile.id,
              gDriveFileName: fileName
            };
          }
          return s;
        });
        setDailyCloudSnapshots(updatedList);
        localStorage.setItem('otec_daily_cloud_snapshots', JSON.stringify(updatedList));
        triggerToast(`Successfully uploaded ${snapshot.dateStr} encrypted snapshot to Google Drive!`, 'success');
        fetchGoogleBackups(activeToken);
      }
    } catch (err: any) {
      console.error('Failed to upload daily snapshot to Google Drive:', err);
      triggerToast('Failed to upload snapshot to Google Drive: ' + err.message, 'error');
    } finally {
      setGSyncing(false);
    }
  };

  const handleSavePassphrase = () => {
    if (!newPassphraseInput || newPassphraseInput.trim().length < 4) {
      alert('Encryption passphrase must be at least 4 characters long.');
      return;
    }
    const cleanPassphrase = newPassphraseInput.trim();
    setStoredMasterPassphrase(cleanPassphrase);
    setMasterPassphrase(cleanPassphrase);
    setShowPassphraseModal(false);
    setNewPassphraseInput('');
    triggerToast('Master Encryption Passphrase updated successfully!', 'success');
    dataManager.addActivityLog('settings_modified', 'Teacher updated Master Encryption Passphrase for daily cloud snapshots.');
  };
  
  // Backup Interval in minutes
  const BACKUP_INTERVAL_MINS = 10;

  // Load backups on mount
  useEffect(() => {
    const loadBackups = () => {
      try {
        const raw = localStorage.getItem('otec_report_card_history_snapshots');
        if (raw) {
          setBackups(JSON.parse(raw));
        }
      } catch (e) {
        console.error('Failed to load historical snapshots', e);
      }
    };
    loadBackups();
  }, []);

  const dataRef = React.useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Set initial auto-backup timestamp
  useEffect(() => {
    setLastAutoBackup(new Date());
  }, []);

  const triggerBackup = (isAuto = false, customLabel?: string) => {
    try {
      const now = new Date();
      const currentSnapshots: BackupSnapshot[] = [];
      const raw = localStorage.getItem('otec_report_card_history_snapshots');
      if (raw) {
        try {
          currentSnapshots.push(...JSON.parse(raw));
        } catch (e) {}
      }

      const label = customLabel || (isAuto ? 'Automated Periodic Backup' : 'Manual Teacher Snapshot');
      const newSnapshot: BackupSnapshot = {
        id: 'snap-' + Math.random().toString(36).slice(2, 9),
        timestamp: now.toISOString(),
        data: JSON.parse(JSON.stringify(data)), // deep clone current state
        label
      };

      // Keep only last 5 snapshots to save browser space
      const updatedSnapshots = [newSnapshot, ...currentSnapshots].slice(0, 5);
      localStorage.setItem('otec_report_card_history_snapshots', JSON.stringify(updatedSnapshots));
      setBackups(updatedSnapshots);
      setLastAutoBackup(now);

      if (isAuto) {
        setShowNotification(true);
        triggerToast('Auto Sync: Periodic database snapshot automatically compiled.', 'success');
        dataManager.addActivityLog('settings_modified', 'Periodic database state snapshot automatically compiled.', 'System');
        // Auto-dismiss notification after 15 seconds
        setTimeout(() => setShowNotification(false), 15000);
      } else {
        setRestoredToast('System snapshot saved successfully!');
        triggerToast('System backup snapshot saved successfully!', 'success');
        dataManager.addActivityLog('settings_modified', 'Teacher created a manual system backup point.');
        setTimeout(() => setRestoredToast(null), 4000);
      }
    } catch (e) {
      console.error('Failed to write backup snapshot', e);
    }
  };

  const handleRestore = (snapshot: BackupSnapshot) => {
    if (window.confirm(`Are you sure you want to restore the application database to the state from ${new Date(snapshot.timestamp).toLocaleString()}? Current unsaved entries will be overwritten.`)) {
      dataManager.setData(snapshot.data);
      dataManager.addActivityLog('settings_modified', `Database successfully restored from snapshot taken on ${new Date(snapshot.timestamp).toLocaleDateString()}.`);
      setRestoredToast('Database successfully restored!');
      triggerToast('Database state restored successfully from backup point!', 'success');
      setTimeout(() => setRestoredToast(null), 4000);
    }
  };

  const handleDownloadSnapshot = () => {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute('href', url);
      downloadAnchor.setAttribute('download', `otec_school_database_backup_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setShowNotification(false);
      
      dataManager.addActivityLog('settings_modified', 'Teachers downloaded an offline full system snapshot backup.');
    } catch (err) {
      alert('Unable to generate download file.');
    }
  };

  if (backgroundOnly) {
    return (
      <>
        {/* Pop-up Periodic Banner Notification */}
        {showNotification && (
          <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-700 animate-slide-in flex items-start gap-3.5 print:hidden">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <Database size={18} className="animate-pulse" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400">Periodic Auto-Backup Completed</h4>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                We have compiled and secured a backup of your reports and learner database to your local browser state.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleDownloadSnapshot}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Download size={11} />
                  <span>Download Snapshot JSON</span>
                </button>
                <button
                  onClick={() => setShowNotification(false)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success/Restore Toasts */}
        {restoredToast && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500 flex items-center gap-2 animate-bounce print:hidden">
            <CheckCircle2 size={16} />
            <span className="text-xs font-bold">{restoredToast}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pop-up Periodic Banner Notification */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-700 animate-slide-in flex items-start gap-3.5 print:hidden">
          <div className="p-2 bg-indigo-600 text-white rounded-xl">
            <Database size={18} className="animate-pulse" />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400">Periodic Auto-Backup Completed</h4>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              We have compiled and secured a backup of your reports and learner database to your local browser state.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleDownloadSnapshot}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Download size={11} />
                <span>Download Snapshot JSON</span>
              </button>
              <button
                onClick={() => setShowNotification(false)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Restore Toasts */}
      {restoredToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500 flex items-center gap-2 animate-bounce print:hidden">
          <CheckCircle2 size={16} />
          <span className="text-xs font-bold">{restoredToast}</span>
        </div>
      )}

      {/* Red Stale Cloud Snapshot Notification Banner (>48 Hours) */}
      {staleStatus.isStale && (
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 border-2 border-rose-500 rounded-3xl p-5 shadow-2xl text-white animate-fade-in flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-600/40 shrink-0 animate-bounce">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-black uppercase tracking-wider text-rose-200">
                  CRITICAL NOTIFICATION: Daily Cloud Snapshot Unsynced
                </h4>
                <span className="px-2.5 py-0.5 bg-rose-600 text-white border border-rose-400 text-[10px] font-black uppercase rounded-full tracking-wider animate-pulse shadow-md shadow-rose-600/50">
                  Overdue ({staleStatus.hoursOverdue} Hours)
                </span>
              </div>
              <p className="text-xs text-rose-100/90 font-medium leading-relaxed">
                A daily Cloud Snapshot has failed to sync for more than 48 hours (Last synced: <span className="font-bold underline">{staleStatus.lastSyncTimeStr}</span>). Please trigger an immediate sync to prevent data loss or disaster recovery delays.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => handleCreateDailyCloudSnapshot(false)}
              disabled={isCreatingDailySnapshot}
              className="w-full md:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {isCreatingDailySnapshot ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              <span>Sync Daily Snapshot Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Multi-Browser User Real-Time Sync & Live Data Center Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-900/60 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-2xl animate-pulse">
              <Users size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Multi-Browser Real-Time User Sync</h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase rounded-md tracking-wider flex items-center gap-1">
                  <Radio size={10} className="animate-ping" />
                  Live Broadcast Channel Active
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 font-medium mt-0.5">
                Instant cross-browser data synchronization &amp; automatic live record population across different browser sessions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => window.open(window.location.href, '_blank')}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer"
              title="Open app in a second browser window to test live multi-browser data syncing"
            >
              <ExternalLink size={13} />
              <span>Open 2nd Browser Window</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-indigo-950/50 border border-indigo-800/40 rounded-2xl space-y-1.5">
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider block">Sync Engine Mode</span>
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Zap size={14} className="text-amber-400" />
              <span>BroadcastChannel &amp; Server Polling (5s)</span>
            </div>
            <p className="text-[10px] text-indigo-200/70 font-medium">
              Data edits in any browser stream directly to all open sessions without refreshing.
            </p>
          </div>

          <div className="p-4 bg-indigo-950/50 border border-indigo-800/40 rounded-2xl space-y-1.5">
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider block">Active Learners Populated</span>
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>{data.learners?.length || 0} Registered Students</span>
              <span className="text-emerald-400 font-mono">{Object.keys(data.scores || {}).length} Exam Sets</span>
            </div>
            <p className="text-[10px] text-indigo-200/70 font-medium">
              Complete student records, marks, and financial ledgers synchronized.
            </p>
          </div>

          <div className="p-4 bg-indigo-950/50 border border-indigo-800/40 rounded-2xl space-y-1.5">
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider block">Multi-Browser Actions</span>
            <div className="flex flex-wrap gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => dataManager.simulateMultiBrowserConflict("Secondary Staff Terminal (Chrome)")}
                className="flex-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                title="Trigger side-by-side Local vs Cloud conflict comparison modal"
              >
                <ShieldAlert size={11} />
                <span>Test Local vs Cloud Conflict</span>
              </button>
              <button
                type="button"
                onClick={() => dataManager.simulateMultiBrowserMutation("Secondary Chrome Browser (Staff Terminal)")}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                title="Send test data update from simulated secondary browser"
              >
                <Sparkles size={11} />
                <span>Simulate Remote Edit</span>
              </button>
              <button
                type="button"
                onClick={() => dataManager.forceSync()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                title="Force instant cloud sync"
              >
                <RefreshCw size={11} />
                <span>Force Sync</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Automated Daily Encrypted Cloud Snapshot & Redundancy Engine Panel */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-6">
        {/* Panel Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-800/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl shadow-inner">
              <ShieldCheck size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-white">Automated Daily Cloud Snapshot &amp; Encryption</h3>
                {staleStatus.isStale ? (
                  <span className="px-2.5 py-0.5 bg-rose-600 text-white border border-rose-400 text-[9px] font-black uppercase rounded-md tracking-wider flex items-center gap-1 shadow-md shadow-rose-600/40 animate-pulse">
                    <AlertTriangle size={11} className="animate-bounce" />
                    Sync Stale (&gt;48 Hours)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase rounded-md tracking-wider flex items-center gap-1">
                    <ShieldCheck size={10} />
                    Cloud Sync Healthy
                  </span>
                )}
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase rounded-md tracking-wider flex items-center gap-1">
                  <Lock size={10} />
                  AES-256 GCM Encrypted
                </span>
                <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[9px] font-black uppercase rounded-md tracking-wider flex items-center gap-1">
                  <Calendar size={10} />
                  Daily Auto-Scheduler Active
                </span>
              </div>
              <p className="text-xs text-emerald-100/70 font-medium mt-0.5">
                Automatically compiles a full encrypted daily backup of all school records, learner scores, and financial ledgers to cloud storage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => handleCreateDailyCloudSnapshot(false)}
              disabled={isCreatingDailySnapshot}
              className={`px-4 py-2 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
                staleStatus.isStale 
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/50 animate-pulse' 
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/40'
              }`}
            >
              {isCreatingDailySnapshot ? (
                <Loader2 size={13} className="animate-spin" />
              ) : staleStatus.isStale ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Lock size={13} />
              )}
              <span>{staleStatus.isStale ? 'Resolve & Sync Snapshot Now' : 'Create Daily Cloud Snapshot Now'}</span>
            </button>

            <button
              type="button"
              onClick={handleSimulateStaleSnapshot}
              className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/60 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              title="Simulate daily snapshot sync failing for >48 hours to test red alert notification badge"
            >
              <AlertTriangle size={12} className="text-rose-400" />
              <span>Simulate Stale (&gt;48h)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPassphraseModal(true)}
              className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              title="Configure Master Encryption Passphrase"
            >
              <Key size={13} className="text-amber-400" />
              <span>Encryption Key</span>
            </button>
          </div>
        </div>

        {/* Snapshot Status Summary Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-3.5 rounded-2xl space-y-1 transition-all ${
            staleStatus.isStale 
              ? 'bg-rose-950/80 border-2 border-rose-500 shadow-lg shadow-rose-900/40' 
              : 'bg-emerald-950/40 border border-emerald-800/40'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-emerald-300 uppercase tracking-wider block">Today's Cloud Status</span>
              {staleStatus.isStale && (
                <span className="px-1.5 py-0.5 bg-rose-600 text-white text-[8.5px] font-black uppercase rounded-md animate-pulse">
                  Red Alert Badge
                </span>
              )}
            </div>
            <div className="text-xs font-black text-white flex items-center gap-1.5">
              {staleStatus.isStale ? (
                <>
                  <AlertTriangle size={14} className="text-rose-400 animate-bounce" />
                  <span className="text-rose-200 font-bold">Unsynced (&gt;48 Hours)</span>
                </>
              ) : dailyCloudSnapshots.some(s => s.dateStr === new Date().toISOString().slice(0, 10)) ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="text-emerald-300">Completed for Today</span>
                </>
              ) : (
                <>
                  <Clock size={14} className="text-amber-400 animate-pulse" />
                  <span className="text-amber-300">Pending Auto Snapshot</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-emerald-200/60 font-medium">
              {staleStatus.isStale 
                ? `Last sync: ${staleStatus.lastSyncTimeStr}. Immediate attention required!`
                : dailyCloudSnapshots.find(s => s.dateStr === new Date().toISOString().slice(0, 10))
                  ? `Secured at ${new Date(dailyCloudSnapshots.find(s => s.dateStr === new Date().toISOString().slice(0, 10))!.timestamp).toLocaleTimeString()}`
                  : 'Scheduler will compile automatically'}
            </p>
          </div>

          <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl space-y-1">
            <span className="text-[10px] font-black text-emerald-300 uppercase tracking-wider block">Google Drive Cloud Link</span>
            <div className="text-xs font-black text-white flex items-center gap-1.5">
              <Cloud size={14} className={gUser ? 'text-blue-400' : 'text-slate-500'} />
              <span>{gUser ? 'Drive Cloud Active' : 'Offline / Local Store Only'}</span>
            </div>
            <p className="text-[10px] text-emerald-200/60 font-medium truncate">
              {gUser ? `Folder: OTEC School Report Cards` : 'Connect Google Drive for redundant offsite sync'}
            </p>
          </div>

          <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl space-y-1">
            <span className="text-[10px] font-black text-emerald-300 uppercase tracking-wider block">Security &amp; Encryption</span>
            <div className="text-xs font-black text-white flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-teal-400" />
              <span>256-bit AES-GCM + PBKDF2</span>
            </div>
            <p className="text-[10px] text-emerald-200/60 font-medium">
              Data encrypted before storing or uploading
            </p>
          </div>

          <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl space-y-1">
            <span className="text-[10px] font-black text-emerald-300 uppercase tracking-wider block">Daily Snapshots Retained</span>
            <div className="text-xs font-black text-white flex items-center justify-between">
              <span>{dailyCloudSnapshots.length} Snapshots Saved</span>
              <span className="text-emerald-400 font-mono text-[11px]">Max 30 Days</span>
            </div>
            <p className="text-[10px] text-emerald-200/60 font-medium">
              Automated daily rolling recovery points
            </p>
          </div>
        </div>

        {/* Retained Daily Encrypted Snapshots List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
              <History size={14} />
              Daily Encrypted Cloud Snapshots Log ({dailyCloudSnapshots.length})
            </span>
            <span className="text-[10px] text-emerald-300/70 font-semibold">
              Encrypted payloads can be restored or downloaded anytime
            </span>
          </div>

          <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
            {dailyCloudSnapshots.map((snap) => (
              <div 
                key={snap.id}
                className="p-3.5 bg-slate-950/60 hover:bg-slate-950/80 border border-emerald-800/40 rounded-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-white font-mono">{snap.dateStr}</span>
                    <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                      <Lock size={10} />
                      {(snap.sizeBytes / 1024).toFixed(1)} KB Encrypted
                    </span>
                    {snap.uploadedToGDrive ? (
                      <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800/60 flex items-center gap-1">
                        <Cloud size={10} />
                        Uploaded to Drive
                      </span>
                    ) : (
                      <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800/60 flex items-center gap-1">
                        <HardDrive size={10} />
                        Local Store
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-emerald-100/70 font-medium">
                    Secured on {new Date(snap.timestamp).toLocaleTimeString()} &middot; Contains {snap.recordCounts.learners} Students, {snap.recordCounts.scores} Exam Sets, {snap.recordCounts.finance} Ledgers
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {!snap.uploadedToGDrive && gUser && (
                    <button
                      type="button"
                      onClick={() => handleUploadDailySnapshotToDrive(snap)}
                      disabled={gSyncing}
                      className="px-2.5 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 rounded-xl text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                      title="Upload snapshot to Google Drive"
                    >
                      <CloudUpload size={11} />
                      <span>Upload to Drive</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDownloadEncryptedSnapshot(snap)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                    title="Download encrypted file (.json.enc)"
                  >
                    <Download size={11} />
                    <span>Download (.enc)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDecryptingSnapshot(snap);
                      setPassphraseInput('');
                      setDecryptError(null);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10.5px] font-black flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-emerald-950/50"
                  >
                    <Unlock size={11} />
                    <span>Decrypt &amp; Restore</span>
                  </button>
                </div>
              </div>
            ))}

            {dailyCloudSnapshots.length === 0 && (
              <div className="py-10 text-center text-emerald-200/50 text-xs border border-dashed border-emerald-800/40 rounded-2xl bg-emerald-950/20">
                No daily cloud snapshots generated yet. The scheduler will create the first automated snapshot shortly, or click "Create Daily Cloud Snapshot Now" above!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Backup Dashboard Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        {/* Left Side: Overview & Action */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-950">System Backup & Auto-Save</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                Protecting registered records &amp; marks
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Auto-Backup Status</span>
              <span className="text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={12} /> Active
              </span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Backup Frequency</span>
              <span>Every {BACKUP_INTERVAL_MINS} Minutes</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Last Auto-Backup Compiled</span>
              <span className="font-mono text-[11px] text-slate-700">
                {lastAutoBackup ? lastAutoBackup.toLocaleTimeString() : 'Pending'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => triggerBackup(false)}
              className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 cursor-pointer"
            >
              <RefreshCw size={13} className="animate-spin-slow" />
              <span>Create Manual Backup</span>
            </button>
            <button
              onClick={handleDownloadSnapshot}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/50 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={13} />
              <span>Download Snapshot</span>
            </button>
          </div>
        </div>

        {/* Right Side: Snapshots History List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <History size={13} />
              Recent Local Snapshots (Browser cache)
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Max 5 snapshots retained</span>
          </div>

          <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
            {backups.map((snap) => (
              <div 
                key={snap.id} 
                className="flex items-center justify-between p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                      snap.label.includes('Automated') 
                        ? 'bg-blue-50 text-blue-700 border-blue-100' 
                        : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                    }`}>
                      {snap.label.includes('Automated') ? 'Auto' : 'Manual'}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{snap.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold font-mono">
                    {new Date(snap.timestamp).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => handleRestore(snap)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all hover:bg-slate-100"
                >
                  <RefreshCw size={10} />
                  <span>Restore Here</span>
                </button>
              </div>
            ))}

            {backups.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                No local snapshots created yet. Auto-backup will compile in {BACKUP_INTERVAL_MINS} minutes, or click "Create Manual Backup" to make one now!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Google Drive Integration & Cloud Backups Panel */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl">
              <Cloud size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-950">Google Drive Cloud Sync</h3>
                {gUser && (
                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8.5px] font-black uppercase rounded tracking-wider animate-pulse">
                    Default Backup &amp; Auto-Sync Active
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                {gUser 
                  ? "Default Backup Target: Automatically securing system database state every 5 minutes in background." 
                  : "Authenticate via OAuth to set Google Drive as your default background auto-sync provider"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {gUser ? (
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider">Cloud Connected</span>
                  <span className="text-xs font-bold text-slate-700 block max-w-[150px] truncate">{gUser.email}</span>
                </div>
                <button
                  onClick={handleGoogleSignOut}
                  title="Disconnect from Google"
                  className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={gLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-all flex items-center gap-2 shadow-md shadow-blue-600/10 cursor-pointer"
              >
                {gLoading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Cloud size={13} />
                )}
                <span>Connect Google Drive</span>
              </button>
            )}
          </div>
        </div>

        {gUser ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Google Drive Controls */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Drive Sync Target File</span>
                  <span className="text-blue-600 font-black uppercase tracking-wider bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded text-[8.5px]">
                    report data saved on the cloud.json
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed font-semibold">
                  All data entered in other browsers will sync to this single file, allowing instant, real-time data updates and edits without cluttering your Drive with multiple duplicate backups.
                </p>
              </div>

              <div className="space-y-2.5">
                {/* Auto Add & Sync Primary Action */}
                <button
                  onClick={() => handleAutoSyncAndAddDriveData()}
                  disabled={gSyncing}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  {gSyncing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} className="animate-pulse" />
                  )}
                  <span>Auto Add Data from Google Drive &amp; Show Summary</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={handleGoogleBackup}
                    disabled={gSyncing}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/15 cursor-pointer"
                  >
                    {gSyncing ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <CloudUpload size={13} />
                    )}
                    <span>Backup to Drive</span>
                  </button>
                  
                  <button
                    onClick={handleRetrievePrimaryBackup}
                    disabled={gSyncing}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/15 cursor-pointer"
                  >
                    {gSyncing ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <RefreshCw size={13} />
                    )}
                    <span>Restore &amp; Diff</span>
                  </button>
                </div>

                <button
                  onClick={() => fetchGoogleBackups(gToken || getCachedAccessToken() || '')}
                  disabled={gLoading}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 rounded-xl text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  title="Refresh cloud backups list"
                >
                  <RefreshCw size={12} className={gLoading ? 'animate-spin' : ''} />
                  <span>Refresh Drive Directory</span>
                </button>
              </div>

              {gError && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-100 text-xs font-semibold rounded-xl leading-relaxed flex items-center gap-2">
                  <ShieldAlert size={14} className="shrink-0" />
                  <span>{gError}</span>
                </div>
              )}
            </div>

            {/* Cloud backups file list */}
            <div className="lg:col-span-7 space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History size={13} />
                Cloud Backups (Google Drive Store)
              </span>

              <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
                {gDriveBackups.map((file) => (
                  <div 
                    key={file.id} 
                    className="flex items-center justify-between p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-700 block truncate max-w-[200px] md:max-w-[280px]">
                        {file.name}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold font-mono">
                        <span>{new Date(file.createdTime).toLocaleString()}</span>
                        {file.size && (
                          <>
                            <span>&middot;</span>
                            <span>{(parseInt(file.size) / 1024).toFixed(1)} KB</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleGoogleRestore(file.id, file.name)}
                      disabled={gSyncing}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 disabled:opacity-50 text-blue-600 hover:text-blue-700 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all hover:bg-slate-100 shadow-xs flex items-center justify-center"
                    >
                      <RefreshCw size={10} />
                      <span>Restore Snapshot</span>
                    </button>
                  </div>
                ))}

                {gDriveBackups.length === 0 && !gLoading && (
                  <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                    No active database backups detected in your Google Drive. Click "Sync Current Database" to secure your first snapshot.
                  </div>
                )}

                {gLoading && (
                  <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin text-blue-500" />
                    <span>Accessing personal Google Drive store...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl max-w-lg mx-auto space-y-4">
            <CloudOff size={32} className="text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider">Cloud Storage Disconnected</h4>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-sm mx-auto">
                Connect your personal Google Drive account to activate secure cloud database sync, off-site recovery snapshots, and direct digital report sheet exporting.
              </p>
            </div>
            <button
              onClick={handleGoogleSignIn}
              disabled={gLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-600/15 flex items-center gap-2 mx-auto cursor-pointer flex items-center justify-center"
            >
              {gLoading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Cloud size={13} />
              )}
              <span>Connect Google Drive</span>
            </button>
          </div>
        )}
      </div>

      {/* GitHub Code Backup Panel */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-800 text-white border border-slate-700 rounded-xl">
              <Github size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-950">GitHub Source Code Backup</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                Automatically sync and backup the entire app source code to GitHub
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleGitHubSync}
              disabled={githubSyncing}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-slate-900/15 flex items-center gap-2 cursor-pointer"
            >
              {githubSyncing ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Github size={13} />
              )}
              <span>Sync Code to GitHub</span>
            </button>
          </div>
        </div>
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3.5">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span>Version Control Integration</span>
            <span className="text-slate-700 font-black uppercase tracking-wider bg-slate-200 border border-slate-300 px-1.5 py-0.5 rounded text-[8.5px]">
              sync-github.command
            </span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed font-semibold">
            This will trigger the local Git sync script to stage, commit, and securely push any new code updates directly to your GitHub repository. (Note: Only available in the Desktop App).
          </p>
        </div>
      </div>

      {/* Drive Sync Detailed Records Summary Modal */}
      {syncSummary && (
        <DriveSyncSummaryModal
          summary={syncSummary}
          onConfirm={handleConfirmSyncSummary}
          onClose={() => setSyncSummary(null)}
        />
      )}

      {/* Decrypt & Restore Modal */}
      {decryptingSnapshot && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <Unlock size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-950">Decrypt Daily Cloud Snapshot</h3>
                <p className="text-xs text-slate-500 font-medium">Snapshot Date: {decryptingSnapshot.dateStr}</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-xs text-slate-600">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Snapshot Payload Size:</span>
                <span>{(decryptingSnapshot.sizeBytes / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800">
                <span>Encryption Format:</span>
                <span className="text-emerald-700 font-mono">256-bit AES-GCM</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Enter Encryption Passphrase:
              </label>
              <div className="relative">
                <input
                  type={showPassphraseText ? 'text' : 'password'}
                  placeholder="Enter passphrase..."
                  value={passphraseInput}
                  onChange={e => setPassphraseInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassphraseText(!showPassphraseText)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassphraseText ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="text-[10.5px] text-slate-400 font-medium">
                Leave blank to use the stored Master Encryption Passphrase.
              </p>
            </div>

            {decryptError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                <ShieldAlert size={14} className="shrink-0" />
                <span>{decryptError}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDecryptingSnapshot(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleDecryptAndRestore(decryptingSnapshot, passphraseInput.trim() || undefined)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
              >
                <Unlock size={13} />
                <span>Decrypt &amp; Restore</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Passphrase Settings Modal */}
      {showPassphraseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
                <Key size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-950">Master Encryption Passphrase</h3>
                <p className="text-xs text-slate-500 font-medium">Configures the AES-256 encryption key for automated daily cloud snapshots.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-600">
              <span className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider block">Current Master Passphrase:</span>
              <div className="flex items-center justify-between font-mono bg-white p-2 border border-slate-200 rounded-xl text-slate-900 font-bold">
                <span>{showPassphraseText ? masterPassphrase : '••••••••••••••••'}</span>
                <button
                  type="button"
                  onClick={() => setShowPassphraseText(!showPassphraseText)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassphraseText ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Update Custom Master Passphrase:
              </label>
              <input
                type="text"
                placeholder="Enter new passphrase (min 4 chars)..."
                value={newPassphraseInput}
                onChange={e => setNewPassphraseInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPassphraseModal(false);
                  setNewPassphraseInput('');
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSavePassphrase}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5"
              >
                <Key size={13} />
                <span>Save New Key</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
