/**
 * Download blob as file
 *
 * @param blob - Blob to download
 * @param filename - Download filename
 *
 * @example
 * downloadBlob(mp3Blob, "recording.mp3");
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate timestamped filename
 *
 * @param prefix - Filename prefix
 * @param extension - File extension (without dot)
 * @returns Timestamped filename
 *
 * @example
 * generateFilename("recording", "mp3"); // "recording-1696234567890.mp3"
 */
export function generateFilename(prefix: string, extension: string): string {
  return `${prefix}-${Date.now()}.${extension}`;
}
