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

export async function listMusicFiles() {
  const drive = await getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_MUSIC_FOLDER_ID; // set this in env if needed

  const res = await drive.files.list({
    q: folderId
      ? `'${folderId}' in parents and mimeType contains 'audio/'`
      : "mimeType contains 'audio/'",
    fields: "files(id, name, mimeType)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    pageSize: 100,
  });

  return res.data.files || [];
}
