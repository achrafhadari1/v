import { google } from "googleapis";

export async function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "service-account.json",
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  const client = await auth.getClient();
  return google.drive({ version: "v3", auth: client });
}

export async function downloadFile(fileId) {
  const drive = await getDriveClient();

  const res = await drive.files.get(
    { fileId, alt: "media", supportsAllDrives: true },
    { responseType: "stream" } // returns a readable stream
  );

  return res.data;
}

export async function getFileMetadata(fileId) {
  const drive = await getDriveClient();

  const res = await drive.files.get({
    fileId,
    fields: "*",
    supportsAllDrives: true,
  });

  return res.data;
}

export async function listMusicFiles(pageToken = null, allFiles = []) {
  const drive = await getDriveClient(); // ← THIS was missing in your version

  const res = await drive.files.list({
    q: "mimeType contains 'audio/' and trashed = false",
    fields: "nextPageToken, files(id, name, mimeType, size, modifiedTime)",
    pageSize: 1000,
    pageToken,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const files = allFiles.concat(res.data.files);
  if (res.data.nextPageToken) {
    return listMusicFiles(res.data.nextPageToken, files);
  }
  return files;
}
