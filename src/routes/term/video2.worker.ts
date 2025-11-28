import Pako from 'pako';
import { ZSTDDecoder } from 'zstddec';
import type { Video2WorkerMessage, Video2WorkerResponse, TextVideo2 } from './types';

let frameBuffer: string[] = [];
let video = {} as TextVideo2;
let oneBit = false;
const zstdDecoder = new ZSTDDecoder();

// Build the pixel-to-char lookup table (LUT)
function createLUT(oneBit: boolean): string[] {
  const chars = oneBit ? ' #' : ' .,-:;=+*#%$@';
  const lut = new Array(256);
  for (let i = 0; i < 256; i++) {
    const index = Math.floor((i / 255) * (chars.length - 1));
    lut[i] = chars[index];
  }
  return lut;
}

// Convert the raw pixel data to a text frame.
function pixelsToChars(pixels: Uint8Array, width: number, height: number, lut: string[]): string {
  const lines: string[] = [];
  for (let y = 0; y < height; y++) {
    let line = '';
    for (let x = 0; x < width; x++) {
      line += lut[pixels[y * width + x]];
    }
    lines.push(line);
  }
  return lines.join('\n');
}

function addFrameToBuffer(index: number, options: { addEvenIfpresent?: boolean } = {}) {
  if (!options.addEvenIfpresent && frameBuffer[index]) {
    return;
  }
  const lut = createLUT(oneBit);
  const frame = video.frames[index];
  let frameData: Uint8Array;
  switch (video.video_info.compression) {
    case 'gzip':
      frameData = Pako.inflate(frame.data);
      break;
    case 'zstd':
      frameData = zstdDecoder.decode(frame.data, video.video_info.width * video.video_info.height);
      break;
    default:
      frameData = frame.data;
  }
  const textFrame = pixelsToChars(frameData, video.video_info.width, video.video_info.height, lut);
  frameBuffer[index] = textFrame;
}

function add5sOfFramesToBuffer(index: number) {
  const totalFrames = video.frames.length;
  for (let i = index; i < totalFrames && i < index + 5 * video.video_info.fps; i++) {
    addFrameToBuffer(i);
  }
}

self.onmessage = async function (e) {
  let data = e.data as Video2WorkerMessage;
  switch (data.type) {
    case 'init':
      video = data.video;
      oneBit = data.oneBit || false;
      if (data.video.video_info.compression === 'zstd') {
        await zstdDecoder.init();
      }
      add5sOfFramesToBuffer(0);
      break;

    case 'requestFrame':
      if (!frameBuffer[data.index]) {
        addFrameToBuffer(data.index);
      }
      let frame = frameBuffer[data.index];
      postMessage({ type: 'frame', index: data.index, text: frame });
      add5sOfFramesToBuffer(data.index + 1);
      break;

    case 'stats':
      postMessage({
        type: 'stats',
        stats: { buffer: { size: frameBuffer.length, max: video.frames.length } }
      } as Video2WorkerResponse);
  }
};

export {};
