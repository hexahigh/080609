import type { StdlibType, TextVideo2, Video2WorkerResponse, Video2WorkerMessage } from "./types";
import * as Tone from "tone";
import { unpack, pack } from 'msgpackr';
import video2Worker from "./video2.worker?worker";

type PlayOptions = {
  speed?: number;
  // Maximum delay between audio and video before skipping
  delayToSkip?: number;
  // Fully monochrome
  oneBit?: boolean
};

const defaultOptions: PlayOptions = {
  speed: 1,
  delayToSkip: 100,
  oneBit: false
}

export async function play(
  stdlib: StdlibType,
  videoUrl: string,
  audioUrl: string,
  options: PlayOptions
) {

  options = { ...defaultOptions, ...options };

  stdlib.print("Loading, please wait...");

  let player = new Tone.Player();

  if (audioUrl !== "") {
    // Load audio
    player = new Tone.Player(audioUrl).toDestination();
  }

  let scaleFactor;

  let video: TextVideo2;

  // Download video
  const response = await fetch(videoUrl)
  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  video = unpack(uint8Array)

  if (video.format_version !== 1 && video.format_version !== 2) {
    stdlib.print(
      "Unsupported format version, expected 1 or 2, got " + video.format_version
    );
    return;
  }

  // Create pixel-to-char lookup table (LUT)
  const chars = options.oneBit ? " #" : " .,-:;=+*#%$@";
  const lut = new Array(256);
  for (let i = 0; i < 256; i++) {
    const index = Math.floor((i / 255) * (chars.length - 1));
    lut[i] = chars[index];
  }

  // Calculate the scale
  scaleFactor = 100 / video.video_info.width;

  stdlib.print("Scale Factor: " + scaleFactor);
  stdlib.print("Fps: " + video.video_info.fps);
  stdlib.print("Width: " + video.video_info.width);
  stdlib.print("Height: " + video.video_info.height);

  // Create the web worker (make sure the worker file is named "videoWorker.js")
  const worker = new video2Worker();

  // Receive messages from the worker.
  worker.onmessage = (e) => {
    const data = e.data as Video2WorkerResponse;

    switch (data.type) {
      case "frame":
        const frame = data.text;
        const lines = frame.split("\n");
        stdlib.setLineData([]);
        for (let i = 0; i < lines.length; i++) {
          stdlib.print(lines[i]);
        }
        break;

      case "stats":
        console.log(`Received stats from worker: ${data.stats}`);
        break;
    }
  };

  // Send the video data and oneBit option to the worker for decoding.
  worker.postMessage({ type: "init", video, oneBit: options.oneBit} as Video2WorkerMessage);

  stdlib.print(
    "Your video will start in 5 seconds, if the video looks weird then you might need to zoom out."
  );
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Start audio when Tone is loaded.
  Tone.loaded().then(() => {
    if (options.speed) {
      player.playbackRate = options.speed;
    }
    player.start();

    // Calculate the delay between frames
    let defaultDelay = 33.33; // 30 fps
    let delay = defaultDelay;

    try {
      delay = (1 / video.video_info.fps) * 1000;
    } catch (e) {
      console.error(e);
    }

    delay = delay / options.speed;

    stdlib.setTextSize(scaleFactor * 16);

    stdlib.hideStuff();

    // Print one frame every options.speed milliseconds
    let i = 0;
    const framesLength = video.frames.length; // Store the length of the frames array
    let startTime = Date.now()
    let skippedInARow: number = 0
    setInterval(() => {
      // Check if i is within the bounds of the frames array
      if (i < framesLength) {
        let sinceStart = Date.now() - startTime
        let frame = timeToFrame(video.video_info.fps, sinceStart);
        let delayMs = Math.abs(frameToTime(video.video_info.fps, i).ms - frameToTime(video.video_info.fps, frame).ms);
        if (delayMs > options.delayToSkip) {
          console.log(delayMs, "out of sync. Skipping to", frame)
          // Skip to the correct frame
          i = Math.round(frame)
          if (skippedInARow >= 5) {
            console.log("We seem to be stuck in a loop, setting max delay to:", options.delayToSkip + 10)
            options.delayToSkip = options.delayToSkip + 10
            skippedInARow = 0
          } else {
            skippedInARow++
          }
          return;
        } else {
          skippedInARow = 0
        }
        // Print the frame
        worker.postMessage({ type: "requestFrame", index: i } as Video2WorkerMessage);
        i++;
      } else {
        stdlib.showStuff;
        player.stop();
        stdlib.setLineData([]);
        return;
      }
    }, delay);
  });
}
function frameToTime(fps: number, frame: number) {
  let ms = (frame / fps) * 1000;
  let seconds = Math.floor(ms / 1000);

  return {
    ms: ms,
    sec: seconds,
  };
}

/**
 * A function that calculates the frame number based on the frames per second and time.
 *
 * @param {number} fps - The frames per second
 * @param {number} time - The time in milliseconds
 * @return {number} The frame number calculated based on the input time and fps
 */
function timeToFrame(fps: number, time: number): number {
  return (time / 1000) * fps;
}

// Optimized rendering function
function pixelsToChars(pixels: Uint8Array, width: number, height: number, lut: string[]): string {
  const lines: string[] = [];
  for (let y = 0; y < height; y++) {
    const line = [];
    for (let x = 0; x < width; x++) {
      line.push(lut[pixels[y * width + x]]);
    }
    lines.push(line.join(''));
  }
  return lines.join('\n');
}