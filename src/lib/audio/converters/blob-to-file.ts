/**
 * Convert Blob to File
 *
 * @param blob - Blob to convert
 * @param filename - Output filename
 * @returns File object
 *
 * @example
 * const file = blobToFile(audioBlob, "recording.mp3");
 */
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type });
}
