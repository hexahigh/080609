import type { StdlibType, TextVideo2 } from "./types";
import * as Tone from "tone";
import axios, { type AxiosResponse } from "axios";
import { unpack, pack } from 'msgpackr';
import Pako from "pako";

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

  if (video.format_version !== 1) {
    stdlib.print(
      "Unsupported format version, expected 1, got " + video.format_version
    );
    return;
  }

  // Calculate the scale
  scaleFactor = 100 / video.video_info.width;

  stdlib.print("Scale Factor: " + scaleFactor);
  stdlib.print("Fps: " + video.video_info.fps);
  stdlib.print("Width: " + video.video_info.width);
  stdlib.print("Height: " + video.video_info.height);

  stdlib.print(
    "Your video will start in 5 seconds, if the video looks weird then you might need to zoom out."
  );
  await new Promise((resolve) => setTimeout(resolve, 5000));

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
        let frameData: Uint8Array
        if (video.video_info.compression === "gzip") {
          frameData = Pako.inflate(video.frames[i].data)
        } else {
          frameData = video.frames[i].data
        }
        // Print the frame
        stdlib.setLineData([]);
        stdlib.print(pixelsToChars(frameData, video.video_info.width, video.video_info.height, options.oneBit));
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

function pixelToChar(pixel: number, oneBit?: boolean): string {
  // Characters in increasing density
  let chars = " .,-:;=+*#%$@";
  if (oneBit) {
    chars = " #";
  }
  return chars[Math.floor((pixel / 255) * chars.length)];
}

function pixelsToChars(pixels: Uint8Array, width: number, height: number, oneBit?: boolean): string {
  let pixelsOut = ""

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      pixelsOut += pixelToChar(pixels[y * width + x], oneBit)
    }
    pixelsOut += "\n"
  }
  return pixelsOut
}