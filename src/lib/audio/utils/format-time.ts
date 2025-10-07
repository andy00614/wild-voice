/**
 * Format seconds to mm:ss
 *
 * @param seconds - Time in seconds
 * @returns Formatted time string
 *
 * @example
 * formatTime(65); // "1:05"
 * formatTime(3661); // "61:01"
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
