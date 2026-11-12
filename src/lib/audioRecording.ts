/** Select a codec actually supported by the recording browser. */
export function createAudioRecorder(stream: MediaStream) {
  const mimeType = ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus"]
    .find(type => MediaRecorder.isTypeSupported(type));
  return new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
}

/** stop() is asynchronous: wait for the final dataavailable before saving. */
export function finalizeAudioRecorder(recorder: MediaRecorder): Promise<void> {
  if (recorder.state === "inactive") return Promise.resolve();
  return new Promise((resolve, reject) => {
    recorder.addEventListener("stop", () => resolve(), { once: true });
    recorder.addEventListener("error", () => reject(new Error("Falha ao finalizar a gravação.")), { once: true });
    recorder.stop();
  });
}
