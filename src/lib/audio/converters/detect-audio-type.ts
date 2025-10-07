/**
 * Detect audio type by file header (Magic Number)
 *
 * @param blob - Audio blob to detect
 * @returns Audio MIME type or 'unknown'
 *
 * @example
 * const type = await detectAudioType(blob);
 * console.log(type); // "audio/mp3" | "audio/wav" | "audio/webm" | "unknown"
 */
export async function detectAudioType(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.slice(0, 4).arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // MP3: 0xFF 0xFB or ID3 tag
  if (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) {
    return "audio/mp3";
  }
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    return "audio/mp3"; // ID3 tag
  }

  // WAV: RIFF
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46
  ) {
    return "audio/wav";
  }

  // WebM: 0x1A 0x45 0xDF 0xA3
  if (
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  ) {
    return "audio/webm";
  }

  return "unknown";
}
