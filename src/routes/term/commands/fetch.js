import { asciiLogo } from "../stuff.js";

export async function main(print, showInput, machine) {
  showInput = false;
  try {
    let screenWidth = window.screen.width || window.innerWidth;
    let screenHeight = window.screen.height || window.innerHeight;
    let info = [
      "OS: BlålangeOS 1.0.0",
      "Host: " + machine,
      "Shell: blåsh",
      "CPU: Blåchip Kosinus-9 (4) 1.094GHz",
      "Resolution: " + screenWidth + "x" + screenHeight,
    ];

    let output = [];

    for (let i = 0; i < asciiLogo.length; i++) {
      if (i < info.length) {
        output.push(asciiLogo[i] + info[i]);
      } else {
        output.push(asciiLogo[i]);
      }
    }

    // print one line every 50ms
    for (let i = 0; i < output.length; i++) {
      print(output[i] + "\n");
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  } catch (error) {
    print(error);
  }

  showInput = true;
}
