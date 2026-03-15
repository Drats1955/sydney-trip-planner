export async function playAudio(base64Data: string, mimeType: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // If it's a known browser-supported format (wav, mp3, ogg, mpeg)
      if (mimeType.includes('wav') || mimeType.includes('mp3') || mimeType.includes('mpeg') || mimeType.includes('ogg')) {
        const audio = new Audio(`data:${mimeType};base64,${base64Data}`);
        audio.onended = () => resolve();
        audio.onerror = (e) => reject(new Error('Failed to play audio: ' + (e as any).message));
        audio.play().catch(reject);
        return;
      }

      // If it's raw PCM (often returned by Gemini TTS as audio/pcm;rate=24000)
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Check for WAV header (RIFF) just in case the mimeType was wrong
      if (bytes.length > 4 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
        const audio = new Audio(`data:audio/wav;base64,${base64Data}`);
        audio.onended = () => resolve();
        audio.onerror = (e) => reject(new Error('Failed to play audio: ' + (e as any).message));
        audio.play().catch(reject);
        return;
      }

      // Decode raw PCM
      const int16Array = new Int16Array(bytes.buffer);
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioCtx.state === 'suspended') {
        audioCtx.close().catch(console.error);
        reject(new Error('Autoplay blocked: AudioContext is suspended'));
        return;
      }

      // Parse sample rate from mimeType if available, default to 24000
      let sampleRate = 24000;
      const rateMatch = mimeType.match(/rate=(\d+)/);
      if (rateMatch && rateMatch[1]) {
        sampleRate = parseInt(rateMatch[1], 10);
      }

      const audioBuffer = audioCtx.createBuffer(1, int16Array.length, sampleRate);
      const channelData = audioBuffer.getChannelData(0);
      
      for (let i = 0; i < int16Array.length; i++) {
        channelData[i] = int16Array[i] / 32768.0;
      }
      
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.onended = () => {
        audioCtx.close().catch(console.error);
        resolve();
      };
      source.start();
    } catch (error) {
      reject(error);
    }
  });
}
