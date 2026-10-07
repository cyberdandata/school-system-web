const SCOPES = 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file';
const CLIENT_ID = '207536779687-06ss9nuukngoboudpp8m8uhopho5f2m3.apps.googleusercontent.com';

let cachedAccessToken: string | null = localStorage.getItem('otec_gdrive_access_token');
let cachedUser: any | null = null;

// Initialize auth listener
export const initGoogleAuth = (
  onAuthSuccess?: (user: any, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (cachedAccessToken) {
    if (onAuthSuccess) onAuthSuccess({ displayName: 'Google Drive User' }, cachedAccessToken);
  } else {
    if (onAuthFailure) onAuthFailure();
  }
  return () => {};
};

// Sign in with Google to obtain fresh OAuth access token
export const googleSignIn = async (): Promise<{ user: any; accessToken: string } | null> => {
  return new Promise((resolve, reject) => {
    if ((CLIENT_ID as string) === 'YOUR_CLIENT_ID_HERE') {
      return reject(new Error('Missing Google OAuth Client ID. Please edit src/lib/googleDriveService.ts and add your Client ID on line 2.'));
    }
    
    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            cachedAccessToken = tokenResponse.access_token;
            localStorage.setItem('otec_gdrive_access_token', cachedAccessToken);
            cachedUser = { displayName: 'Google Drive User' };
            resolve({ user: cachedUser, accessToken: cachedAccessToken });
          } else {
            reject(new Error('Failed to obtain Google Drive Access Token.'));
          }
        },
        error_callback: (error: any) => {
          reject(new Error(error?.message || 'Google Auth Error'));
        }
      });
      tokenClient.requestAccessToken();
    } catch (err: any) {
      reject(new Error('Google Identity Services library not loaded. Check internet connection.'));
    }
  });
};

// Clear Google Drive Access token
export const logoutGoogle = async () => {
  if (cachedAccessToken && (window as any).google) {
    (window as any).google.accounts.oauth2.revoke(cachedAccessToken, () => {
       console.log('Google token revoked');
    });
  }
  cachedAccessToken = null;
  localStorage.removeItem('otec_gdrive_access_token');
  cachedUser = null;
};

// Handle expired Google Drive Access Token
export const handleAuthExpired = async () => {
  cachedAccessToken = null;
  localStorage.removeItem('otec_gdrive_access_token');
  window.dispatchEvent(new CustomEvent('otec-gdrive-token-expired'));
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const getCachedUser = (): any | null => {
  return cachedUser;
};

// Helper to handle network / fetch errors cleanly
const driveFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  try {
    return await fetch(url, options);
  } catch (err: any) {
    if (err?.name === 'TypeError' || err?.message === 'Failed to fetch' || !navigator.onLine) {
      throw new Error('NETWORK_ERROR');
    }
    throw err;
  }
};

/**
 * google Drive API: Get or Create folder
 */
export const getOrCreateFolder = async (
  accessToken: string,
  folderName: string,
  parentId?: string
): Promise<string> => {
  // Query if folder already exists
  let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }
  
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;
  
  const searchRes = await driveFetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchRes.ok) {
    if (searchRes.status === 401) {
      await handleAuthExpired();
      throw new Error('UNAUTHENTICATED');
    }
    const errText = await searchRes.text();
    throw new Error(`Google Drive Search Folder Error: ${errText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder if it doesn't exist
  const createUrl = 'https://www.googleapis.com/drive/v3/files';
  const metadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: parentId ? [parentId] : undefined
  };

  const createRes = await driveFetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });

  if (!createRes.ok) {
    if (createRes.status === 401) {
      await handleAuthExpired();
      throw new Error('UNAUTHENTICATED');
    }
    const errText = await createRes.text();
    throw new Error(`Google Drive Create Folder Error: ${errText}`);
  }

  const createdData = await createRes.json();
  return createdData.id;
};

/**
 * google Drive API: Upload File (Multipart)
 */
export const uploadFileToDrive = async (
  accessToken: string,
  parentFolderId: string | null,
  fileName: string,
  mimeType: string,
  fileContent: string
): Promise<{ id: string; name: string }> => {
  const boundary = 'foo_bar_boundary';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: mimeType,
    parents: parentFolderId ? [parentFolderId] : undefined
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: ' + mimeType + '\r\n\r\n' +
    fileContent +
    closeDelim;

  const response = await driveFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (!response.ok) {
    if (response.status === 401) {
      await handleAuthExpired();
      throw new Error('UNAUTHENTICATED');
    }
    const errText = await response.text();
    throw new Error(`Google Drive File Upload Error: ${errText}`);
  }

  const result = await response.json();
  return { id: result.id, name: result.name };
};

/**
 * google Drive API: List backup files in the dedicated folder
 */
export const listBackupFiles = async (
  accessToken: string,
  folderId: string
): Promise<Array<{ id: string; name: string; createdTime: string; size?: string }>> => {
  const query = `'${folderId}' in parents and trashed = false`;
  const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&orderBy=createdTime desc&fields=files(id,name,createdTime,size)`;

  const response = await driveFetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    if (response.status === 401) {
      await handleAuthExpired();
      throw new Error('UNAUTHENTICATED');
    }
    const errText = await response.text();
    throw new Error(`Google Drive List Files Error: ${errText}`);
  }

  const data = await response.json();
  return data.files || [];
};

/**
 * google Drive API: Retrieve file content by file ID
 */
export const downloadFileFromDrive = async (
  accessToken: string,
  fileId: string
): Promise<string> => {
  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  const response = await driveFetch(downloadUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    if (response.status === 401) {
      await handleAuthExpired();
      throw new Error('UNAUTHENTICATED');
    }
    const errText = await response.text();
    throw new Error(`Google Drive Download File Error: ${errText}`);
  }

  return await response.text();
};

/**
 * google Drive API: Update existing file content (Media Upload)
 */
export const updateFileInDrive = async (
  accessToken: string,
  fileId: string,
  fileContent: string,
  mimeType: string = 'application/json'
): Promise<boolean> => {
  const url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;

  const response = await driveFetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': mimeType
    },
    body: fileContent
  });

  if (!response.ok) {
    if (response.status === 401) {
      await handleAuthExpired();
      throw new Error('UNAUTHENTICATED');
    }
    const errText = await response.text();
    throw new Error(`Google Drive File Update Error: ${errText}`);
  }

  return true;
};

/**
 * google Drive API: Silent Background Auto-Sync
 */
export const silentSyncToGoogleDrive = async (data: any): Promise<boolean> => {
  const token = cachedAccessToken || localStorage.getItem('otec_gdrive_access_token');
  if (!token) return false;

  try {
    const rootFolderId = await getOrCreateFolder(token, 'OTEC School Report Cards');
    const backupFolderId = await getOrCreateFolder(token, 'Database Backups', rootFolderId);
    
    const fileContent = JSON.stringify(data, null, 2);
    
    // List files to find existing 'report data saved on the cloud.json'
    const files = await listBackupFiles(token, backupFolderId);
    const existingFile = files.find(f => f.name === 'report data saved on the cloud.json');
    
    if (existingFile) {
      await updateFileInDrive(token, existingFile.id, fileContent);
    } else {
      await uploadFileToDrive(token, backupFolderId, 'report data saved on the cloud.json', 'application/json', fileContent);
    }
    
    localStorage.setItem('otec_last_gdrive_backup_content', fileContent);
    console.log("Successfully auto-synced database to Google Drive: 'report data saved on the cloud.json'");
    return true;
  } catch (err) {
    console.warn('Silent Google Drive auto-sync deferred or failed:', err);
    return false;
  }
};

/**
 * google Drive API: Upload Binary File (e.g. Excel .xlsx or ZIP archive)
 */
export const uploadBinaryFileToDrive = async (
  accessToken: string,
  parentFolderId: string | null,
  fileName: string,
  mimeType: string,
  arrayBuffer: ArrayBuffer
): Promise<{ id: string; name: string }> => {
  const metadata = {
    name: fileName,
    mimeType: mimeType,
    parents: parentFolderId ? [parentFolderId] : undefined
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([arrayBuffer], { type: mimeType }));

  const response = await driveFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: form
  });

  if (!response.ok) {
    if (response.status === 401) {
      await handleAuthExpired();
      throw new Error('UNAUTHENTICATED');
    }
    const errText = await response.text();
    throw new Error(`Google Drive Binary Upload Error: ${errText}`);
  }

  const result = await response.json();
  return { id: result.id, name: result.name };
};

/**
 * google Drive API: Sync Excel Financial Report to Google Drive XLSX Repository
 */
export const syncXlsxReportToDrive = async (
  fileName: string,
  arrayBuffer: ArrayBuffer,
  mimeType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
): Promise<{ id: string; name: string } | null> => {
  const token = cachedAccessToken || localStorage.getItem('otec_gdrive_access_token');
  if (!token) return null;

  try {
    const rootFolderId = await getOrCreateFolder(token, 'OTEC School Report Cards');
    const xlsxFolderId = await getOrCreateFolder(token, 'Excel Financial Reports Repository', rootFolderId);

    const result = await uploadBinaryFileToDrive(token, xlsxFolderId, fileName, mimeType, arrayBuffer);
    console.log(`Successfully synced Excel report '${fileName}' to Google Drive repository!`);
    return result;
  } catch (err) {
    console.warn('Syncing Excel report to Google Drive failed:', err);
    throw err;
  }
};

/**
 * google Drive API: Auto-Restore latest database backup from Google Drive
 */
export const autoRestoreFromGoogleDrive = async (): Promise<any | null> => {
  const token = cachedAccessToken || localStorage.getItem('otec_gdrive_access_token');
  if (!token) return null;

  try {
    const rootFolderId = await getOrCreateFolder(token, 'OTEC School Report Cards');
    const backupFolderId = await getOrCreateFolder(token, 'Database Backups', rootFolderId);
    
    const files = await listBackupFiles(token, backupFolderId);
    if (!files || files.length === 0) return null;

    // Prefer 'report data saved on the cloud.json' or the newest file
    const targetFile = files.find(f => f.name === 'report data saved on the cloud.json') || files[0];
    if (!targetFile) return null;

    const contentStr = await downloadFileFromDrive(token, targetFile.id);
    const parsedData = JSON.parse(contentStr);
    
    if (parsedData && parsedData.learners && parsedData.settings) {
      console.log(`Auto-restored latest database backup from Google Drive (${targetFile.name})`);
      return parsedData;
    }
  } catch (err) {
    console.warn('Auto-restore from Google Drive skipped or deferred:', err);
  }
  return null;
};
