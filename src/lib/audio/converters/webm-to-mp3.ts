import {
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  Mp3OutputFormat,
  Output,
  WebMInputFormat,
} from "mediabunny";

/**
 * Convert WebM Blob to MP3 Blob
 *
 * @param webmBlob - Input WebM audio blob
 * @returns Promise<Blob> - MP3 audio blob
 * @throws Error if conversion fails
 *
 * @example
 * const mp3Blob = await convertWebMToMP3(webmBlob);
 */
export async function convertWebMToMP3(webmBlob: Blob): Promise<Blob> {
  const input = new Input({
    source: new BlobSource(webmBlob),
    formats: [new WebMInputFormat()],
  });

  const bufferTarget = new BufferTarget();
  const output = new Output({
    format: new Mp3OutputFormat(),
    target: bufferTarget,
  });

  const conversion = await Conversion.init({ input, output });
  await conversion.execute();

  const arrayBuffer = bufferTarget.buffer;
  if (!arrayBuffer) {
    throw new Error("MP3 conversion failed: no output buffer");
  }

  return new Blob([arrayBuffer], { type: "audio/mp3" });
}
