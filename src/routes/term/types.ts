export type StdlibType = {
  print: (...args: any[]) => void;
  lineData: LineDataEntry[];
  setLineData: (array: any[]) => void;
  setTextSize: (size: number) => void;
  showInput: boolean;
  setShowInput: (bool: boolean) => void;
  hideStuff: () => void;
  showStuff: () => void;
};

export type CommandType = {
  name: string;
  description: string;
  long_description: string;
  usage: string;
  hidden: boolean;
  execute: any;
};

export type CommandsType = CommandType[];

export interface TextVideo {
  format_version: number;
  fps: number;
  width: number;
  height: number;
  /**
   * 'gzip'
   */
  compression: string;
  /**
   * 'base64'
   */
  encoding: string;
  /**
   * Encoded frames is an encoded and compressed string representation of the 'frames' array.
   */
  encodedFrames: string;
  frames: {
    text: string;
  }[];
}

export interface TextVideo2 {
  format_version: number;
  video_info: {
    fps: number;
    width: number;
    height: number;
    compression: "gzip" | "zstd" | "none" | "";
  }
  frames: {
    data: Uint8Array;
  }[];
}

export type LineDataEntry =
| {
    command: string;
    type: 'input';
  }
| {
    output: string;
    type: 'output' | 'outputHtml';
};

export type Video2WorkerMessage = {
  type: 'init';
  video: TextVideo2;
  oneBit?: boolean;
} | {
  type: 'requestFrame';
  index: number;
} | {
  type: 'stats';
}

export type Video2WorkerResponse = {
  type: 'frame';
  index: number;
  text: string;
} | {
  type: 'end';
} | {
  type: 'stats';
  stats: {
    buffer: {
      size: number;
      max: number;
    }
  };
}