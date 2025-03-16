import Pako from 'pako';
import type { Video2WorkerMessage, Video2WorkerResponse, TextVideo2 } from './types';

let frameBuffer: string[] = [];
let video = {} as TextVideo2;
let oneBit = false;

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
    return
  }
	const lut = createLUT(oneBit);
	const frame = video.frames[index];
	let frameData: Uint8Array;
	if (video.video_info.compression === 'gzip') {
		frameData = Pako.inflate(frame.data);
	} else {
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

self.onmessage = function (e) {
	let data = e.data as Video2WorkerMessage;
	switch (data.type) {
		case 'init':
			video = data.video;
			oneBit = data.oneBit || false;
			add5sOfFramesToBuffer(0);
			break;

		case 'requestFrame':
			let frame = frameBuffer[data.index];
			if (frame) {
				postMessage({ type: 'frame', index: data.index, text: frame });
			}
			add5sOfFramesToBuffer(data.index);
			break;
	}
};

export {};
