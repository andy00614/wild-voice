/**
 * MediaRecorder wrapper for audio recording
 */

export type RecordingState = "inactive" | "recording" | "paused";

export interface RecorderOptions {
  onDataAvailable?: (chunk: Blob) => void;
  onStop?: (blob: Blob) => void;
  onError?: (error: Error) => void;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  /**
   * Start recording audio from microphone
   *
   * @param options - Recorder callbacks
   * @throws Error if microphone access denied
   */
  async start(options: RecorderOptions = {}): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          options.onDataAvailable?.(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: "audio/webm" });
        this.cleanup();
        options.onStop?.(blob);
      };

      this.mediaRecorder.onerror = (event) => {
        const error = new Error("MediaRecorder error");
        options.onError?.(error);
      };

      this.mediaRecorder.start();
    } catch (err) {
      throw new Error("Cannot access microphone. Please check permissions");
    }
  }

  /**
   * Stop recording
   */
  stop(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }
  }

  /**
   * Pause recording
   */
  pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.pause();
    }
  }

  /**
   * Resume recording
   */
  resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === "paused") {
      this.mediaRecorder.resume();
    }
  }

  /**
   * Get current recording state
   */
  getState(): RecordingState {
    return this.mediaRecorder?.state || "inactive";
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }
}
