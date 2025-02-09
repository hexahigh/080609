import type { StdlibType, TextVideo } from "../types";
import { play } from "../video2";

import video from "./data/out.tv?url";
import song from "./data/apple.mp3?url";

const defaultOptions = {
  speed: 1,
};

export default function main(stdlib: StdlibType, inOptions = {}) {
  const options = { ...defaultOptions, ...inOptions };

  let speed = 1

  if (options.speed) {
    speed = options.speed
  }

  play(stdlib, video, song, { speed: speed });

}
