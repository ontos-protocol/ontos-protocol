import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { join, resolve } from "node:path";

const width = 1280;
const height = 720;
const releaseDir = ".release";
const frameDir = join(releaseDir, "demo-video-frames");
const output = join(releaseDir, "ontos-protocol-60s-demo.mp4");
const checksums = join(releaseDir, "SHA256SUMS");

const colors = {
  ink: [24, 31, 42],
  muted: [92, 102, 117],
  paper: [247, 245, 239],
  panel: [255, 255, 252],
  line: [218, 213, 204],
  blue: [29, 85, 145],
  green: [35, 126, 82],
  gold: [183, 124, 35],
  red: [180, 69, 58],
  terminal: [20, 24, 31],
  terminalText: [209, 236, 219],
  terminalDim: [131, 152, 145],
  white: [255, 255, 255]
};

const slides = [
  { name: "problem", duration: 5, render: renderProblem },
  { name: "format", duration: 10, render: renderFormat },
  { name: "cli", duration: 10, render: renderCli },
  { name: "handoff", duration: 13, render: renderHandoff },
  { name: "viewer", duration: 12, render: renderViewer },
  { name: "close", duration: 10, render: renderClose }
];

function main() {
  assert.equal(slides.reduce((sum, slide) => sum + slide.duration, 0), 60);

  mkdirSync(releaseDir, { recursive: true });
  rmSync(frameDir, { recursive: true, force: true });
  mkdirSync(frameDir, { recursive: true });

  const frameFiles = [];
  for (const [index, slide] of slides.entries()) {
    const image = createImage(colors.paper);
    drawBackground(image);
    slide.render(image);
    drawBrand(image, `${index + 1}/6`);
    const file = join(frameDir, `${String(index + 1).padStart(2, "0")}-${slide.name}.ppm`);
    writePpm(image, file);
    frameFiles.push({ file: resolve(file), duration: slide.duration });
  }

  const inputArgs = frameFiles.flatMap((frame) => [
    "-loop",
    "1",
    "-t",
    String(frame.duration),
    "-i",
    frame.file
  ]);
  const filters = [
    ...frameFiles.map((_, index) => `[${index}:v]fps=30,format=yuv420p[v${index}]`),
    `${frameFiles.map((_, index) => `[v${index}]`).join("")}concat=n=${frameFiles.length}:v=1:a=0,format=yuv420p[v]`
  ].join(";");

  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-loglevel",
      "error",
      ...inputArgs,
      "-filter_complex",
      filters,
      "-map",
      "[v]",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      output
    ],
    { stdio: ["ignore", "pipe", "pipe"] }
  );

  rmSync(frameDir, { recursive: true, force: true });

  const digest = createHash("sha256").update(readFileSync(output)).digest("hex");
  const checksumLine = `${digest}  ontos-protocol-60s-demo.mp4`;
  const existingChecksums = existsSync(checksums) ? readFileSync(checksums, "utf8") : "";
  const nextChecksums = [
    ...existingChecksums
      .split(/\r?\n/u)
      .filter((line) => line.trim().length > 0 && !line.endsWith("  ontos-protocol-60s-demo.mp4")),
    checksumLine
  ];
  writeFileSync(checksums, `${nextChecksums.join("\n")}\n`, "utf8");

  console.log(`demo video built at ${output}`);
}

function renderProblem(image) {
  drawTitle(image, "AI PROJECT CONTEXT NEEDS STRUCTURE", "Markdown is readable, but long project state gets scattered.");
  drawCard(image, 96, 245, 500, 340, "LONG MARKDOWN NOTE", colors.red);
  drawLines(image, 126, 315, [
    "# Release",
    "- examples maybe done",
    "- handoff buried below",
    "- risks mixed with notes",
    "- verify steps somewhere",
    "- next agent needs context"
  ], 3, colors.muted);
  drawCard(image, 660, 245, 520, 340, "WHAT AI TOOLS NEED", colors.blue);
  drawBullets(image, 704, 315, [
    "stable nodes",
    "explicit fields",
    "clear handoff boundaries",
    "refs + checks",
    "local plain text"
  ], colors.ink);
}

function renderFormat(image) {
  drawTitle(image, ".ontos PROTOCOL", "Plain text nodes with stable IDs, fields, tags, and references.");
  drawTerminal(image, 100, 245, 1080, 400, [
    "@ontos 1.0",
    "@title Public Release",
    "",
    "- Release readiness @id(release-ready) #release",
    "  status: active",
    "  ai_task: Identify unchecked launch blockers.",
    "  ai_boundary: Use only public repository context.",
    "  verify:",
    "    - Run npm run release:check.",
    "    - Confirm examples validate and export."
  ]);
}

function renderCli(image) {
  drawTitle(image, "VALIDATE, INSPECT, EXPORT", "`ontosfmt` gives the format a reproducible command line workflow.");
  drawTerminal(image, 100, 245, 1080, 335, [
    "$ ontosfmt validate examples/project-state.ontos",
    "examples/project-state.ontos: ok",
    "",
    "$ ontosfmt inspect examples/project-state.ontos",
    "nodes: 8  references: 5",
    "",
    "$ ontosfmt export examples/project-state.ontos",
    "  --to md"
  ]);
  drawPill(image, 145, 590, "VALIDATE", colors.green);
  drawPill(image, 365, 590, "FORMAT", colors.blue);
  drawPill(image, 555, 590, "INSPECT", colors.gold);
  drawPill(image, 770, 590, "EXPORT", colors.red);
  drawPill(image, 960, 590, "PACK", colors.ink);
}

function renderHandoff(image) {
  drawTitle(image, "FOCUSED AI HANDOFFS", "Send focused nodes, boundaries, references, and checks.");
  drawTerminal(image, 100, 230, 1080, 285, [
    "$ ontosfmt pack examples/ai-handoff.ontos",
    "  --node handoff-root --for handoff",
    "",
    "pack: handoff",
    "node: handoff-root",
    "includes: boundaries, references, risks, verification"
  ]);
  drawCard(image, 100, 535, 320, 120, "BOUNDARY", colors.red);
  drawLines(image, 132, 590, ["public context only", "no unrelated names"], 3, colors.ink);
  drawCard(image, 480, 535, 320, 120, "REFERENCES", colors.blue);
  drawLines(image, 512, 590, ["[[release-ready]]", "[[docs.checks]]"], 3, colors.ink);
  drawCard(image, 860, 535, 320, 120, "VERIFY", colors.green);
  drawLines(image, 892, 590, ["npm run", "release:check", "public scan clean"], 3, colors.ink);
}

function renderViewer(image) {
  drawTitle(image, "LOCAL-FIRST VIEWER", "Open, search, review fields, and export standard formats.");
  drawCard(image, 86, 235, 1108, 390, "VIEWER", colors.blue);
  rect(image, 120, 300, 310, 276, colors.paper);
  rect(image, 460, 300, 700, 276, colors.white);
  drawPill(image, 138, 320, "SEARCH: release", colors.blue, 2);
  drawLines(image, 140, 380, [
    "release-ready",
    "package-publish",
    "docs-deploy",
    "launch-response"
  ], 3, colors.ink);
  drawText(image, "Release readiness", 494, 340, 5, colors.ink);
  drawLines(image, 498, 405, [
    "status: active",
    "risk: public naming drift",
    "verify: release check + scan",
    "exports: Markdown, HTML, JSON, OPML"
  ], 3, colors.muted);
  drawPill(image, 497, 535, "EXPORT MD", colors.green, 2);
  drawPill(image, 690, 535, "EXPORT JSON", colors.gold, 2);
  drawPill(image, 925, 535, "EXPORT OPML", colors.red, 2);
}

function renderClose(image) {
  drawTitle(image, ".ontos PROTOCOL", "MIT licensed, local-first, and built for AI-native project context.");
  drawTerminal(image, 160, 255, 960, 230, [
    "$ npm install -g",
    "  @ontos-protocol/cli",
    "$ ontosfmt validate file.ontos",
    "$ ontosfmt pack file.ontos",
    "  --node node-id --for handoff"
  ]);
  drawText(image, "Repository: ontos-protocol", 260, 530, 5, colors.ink);
  drawText(image, "Format: .ontos    CLI: ontosfmt", 260, 590, 3, colors.muted);
  drawText(image, "Packages: @ontos-protocol/*", 260, 630, 3, colors.muted);
}

function createImage(fill) {
  const pixels = Buffer.alloc(width * height * 3);
  for (let index = 0; index < pixels.length; index += 3) {
    pixels[index] = fill[0];
    pixels[index + 1] = fill[1];
    pixels[index + 2] = fill[2];
  }
  return { pixels };
}

function writePpm(image, file) {
  writeFileSync(file, Buffer.concat([Buffer.from(`P6\n${width} ${height}\n255\n`, "ascii"), image.pixels]));
}

function drawBackground(image) {
  rect(image, 0, 0, width, 88, colors.ink);
  rect(image, 0, height - 22, width, 22, colors.ink);
  rect(image, 88, 116, width - 176, 2, colors.line);
}

function drawBrand(image, step) {
  drawText(image, ".ontos Protocol", 88, 32, 3, colors.white);
  drawText(image, step, 1140, 32, 3, colors.terminalText);
}

function drawTitle(image, title, subtitle) {
  drawText(image, title, 96, 132, 6, colors.ink);
  drawWrappedText(image, subtitle, 100, 205, 3, colors.muted, 1000, 36);
}

function drawCard(image, x, y, w, h, label, accent) {
  rect(image, x + 6, y + 8, w, h, [225, 221, 214]);
  rect(image, x, y, w, h, colors.panel);
  strokeRect(image, x, y, w, h, colors.line, 2);
  rect(image, x, y, w, 48, accent);
  drawText(image, label, x + 24, y + 15, 3, colors.white);
}

function drawTerminal(image, x, y, w, h, lines) {
  rect(image, x + 6, y + 8, w, h, [215, 213, 208]);
  rect(image, x, y, w, h, colors.terminal);
  rect(image, x, y, w, 42, [35, 41, 52]);
  circle(image, x + 26, y + 21, 7, colors.red);
  circle(image, x + 50, y + 21, 7, colors.gold);
  circle(image, x + 74, y + 21, 7, colors.green);
  let cursorY = y + 70;
  for (const line of lines) {
    const color = line.startsWith("$") ? colors.terminalText : colors.terminalDim;
    drawText(image, line, x + 30, cursorY, 3, color);
    cursorY += 34;
  }
}

function drawBullets(image, x, y, items, color) {
  let cursorY = y;
  for (const item of items) {
    rect(image, x, cursorY + 10, 12, 12, colors.green);
    drawText(image, item, x + 32, cursorY, 4, color);
    cursorY += 58;
  }
}

function drawLines(image, x, y, lines, scale, color) {
  let cursorY = y;
  for (const line of lines) {
    drawText(image, line, x, cursorY, scale, color);
    cursorY += scale * 11;
  }
}

function drawPill(image, x, y, text, color, scale = 3) {
  const textWidth = measureText(text, scale);
  rect(image, x, y, textWidth + 42, scale * 13, color);
  drawText(image, text, x + 21, y + scale * 3, scale, colors.white);
}

function drawWrappedText(image, text, x, y, scale, color, maxWidth, lineGap) {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;
  for (const word of words) {
    const next = line.length === 0 ? word : `${line} ${word}`;
    if (measureText(next, scale) > maxWidth && line.length > 0) {
      drawText(image, line, x, cursorY, scale, color);
      cursorY += lineGap;
      line = word;
    } else {
      line = next;
    }
  }
  if (line.length > 0) {
    drawText(image, line, x, cursorY, scale, color);
  }
}

function drawText(image, text, x, y, scale, color) {
  let cursorX = x;
  for (const char of text) {
    const glyph = GLYPHS[char] ?? GLYPHS[char.toUpperCase()] ?? GLYPHS["?"];
    for (const [rowIndex, row] of glyph.entries()) {
      for (const [colIndex, bit] of [...row].entries()) {
        if (bit === "1") {
          rect(image, cursorX + colIndex * scale, y + rowIndex * scale, scale, scale, color);
        }
      }
    }
    cursorX += (glyph[0].length + 1) * scale;
  }
}

function measureText(text, scale) {
  return [...text].reduce((sum, char) => {
    const glyph = GLYPHS[char] ?? GLYPHS[char.toUpperCase()] ?? GLYPHS["?"];
    return sum + (glyph[0].length + 1) * scale;
  }, 0);
}

function rect(image, x, y, w, h, color) {
  const startX = Math.max(0, Math.floor(x));
  const startY = Math.max(0, Math.floor(y));
  const endX = Math.min(width, Math.ceil(x + w));
  const endY = Math.min(height, Math.ceil(y + h));
  for (let py = startY; py < endY; py += 1) {
    for (let px = startX; px < endX; px += 1) {
      setPixel(image, px, py, color);
    }
  }
}

function strokeRect(image, x, y, w, h, color, thickness) {
  rect(image, x, y, w, thickness, color);
  rect(image, x, y + h - thickness, w, thickness, color);
  rect(image, x, y, thickness, h, color);
  rect(image, x + w - thickness, y, thickness, h, color);
}

function circle(image, cx, cy, radius, color) {
  for (let y = -radius; y <= radius; y += 1) {
    for (let x = -radius; x <= radius; x += 1) {
      if (x * x + y * y <= radius * radius) {
        setPixel(image, cx + x, cy + y, color);
      }
    }
  }
}

function setPixel(image, x, y, color) {
  if (x < 0 || x >= width || y < 0 || y >= height) {
    return;
  }
  const index = (Math.floor(y) * width + Math.floor(x)) * 3;
  image.pixels[index] = color[0];
  image.pixels[index + 1] = color[1];
  image.pixels[index + 2] = color[2];
}

const GLYPHS = {
  " ": ["000", "000", "000", "000", "000", "000", "000"],
  "!": ["1", "1", "1", "1", "1", "0", "1"],
  "\"": ["101", "101", "101", "000", "000", "000", "000"],
  "#": ["01010", "11111", "01010", "01010", "11111", "01010", "00000"],
  "$": ["01111", "10100", "11110", "00101", "11110", "00100", "00000"],
  "%": ["11001", "11010", "00100", "01000", "10110", "00110", "00000"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "'": ["1", "1", "1", "0", "0", "0", "0"],
  "(": ["01", "10", "10", "10", "10", "10", "01"],
  ")": ["10", "01", "01", "01", "01", "01", "10"],
  "*": ["00000", "10101", "01110", "11111", "01110", "10101", "00000"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  ",": ["00", "00", "00", "00", "00", "10", "01"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  ".": ["0", "0", "0", "0", "0", "0", "1"],
  "/": ["00001", "00010", "00100", "01000", "10000", "00000", "00000"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  ":": ["0", "1", "0", "0", "0", "1", "0"],
  ";": ["0", "1", "0", "0", "0", "1", "1"],
  "<": ["00010", "00100", "01000", "10000", "01000", "00100", "00010"],
  "=": ["00000", "11111", "00000", "11111", "00000", "00000", "00000"],
  ">": ["01000", "00100", "00010", "00001", "00010", "00100", "01000"],
  "?": ["01110", "10001", "00001", "00010", "00100", "00000", "00100"],
  "@": ["01110", "10001", "10111", "10101", "10111", "10000", "01110"],
  "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  "C": ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  "G": ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  "I": ["111", "010", "010", "010", "010", "010", "111"],
  "J": ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  "K": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  "Q": ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  "V": ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  "W": ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  "X": ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  "Z": ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "[": ["111", "100", "100", "100", "100", "100", "111"],
  "\\": ["10000", "01000", "00100", "00010", "00001", "00000", "00000"],
  "]": ["111", "001", "001", "001", "001", "001", "111"],
  "_": ["00000", "00000", "00000", "00000", "00000", "00000", "11111"],
  "`": ["10", "01", "00", "00", "00", "00", "00"],
  "a": ["00000", "01110", "00001", "01111", "10001", "01111", "00000"],
  "b": ["10000", "10000", "11110", "10001", "10001", "11110", "00000"],
  "c": ["00000", "01111", "10000", "10000", "10000", "01111", "00000"],
  "d": ["00001", "00001", "01111", "10001", "10001", "01111", "00000"],
  "e": ["00000", "01110", "10001", "11111", "10000", "01110", "00000"],
  "f": ["00110", "01000", "01000", "11100", "01000", "01000", "01000"],
  "g": ["00000", "01111", "10001", "10001", "01111", "00001", "01110"],
  "h": ["10000", "10000", "11110", "10001", "10001", "10001", "00000"],
  "i": ["010", "000", "110", "010", "010", "111", "000"],
  "j": ["001", "000", "011", "001", "001", "101", "010"],
  "k": ["10000", "10010", "10100", "11000", "10100", "10010", "00000"],
  "l": ["110", "010", "010", "010", "010", "111", "000"],
  "m": ["00000", "11010", "10101", "10101", "10101", "10101", "00000"],
  "n": ["00000", "11110", "10001", "10001", "10001", "10001", "00000"],
  "o": ["00000", "01110", "10001", "10001", "10001", "01110", "00000"],
  "p": ["00000", "11110", "10001", "10001", "11110", "10000", "10000"],
  "q": ["00000", "01111", "10001", "10001", "01111", "00001", "00001"],
  "r": ["00000", "10110", "11001", "10000", "10000", "10000", "00000"],
  "s": ["00000", "01111", "10000", "01110", "00001", "11110", "00000"],
  "t": ["01000", "01000", "11100", "01000", "01000", "00110", "00000"],
  "u": ["00000", "10001", "10001", "10001", "10011", "01101", "00000"],
  "v": ["00000", "10001", "10001", "10001", "01010", "00100", "00000"],
  "w": ["00000", "10001", "10101", "10101", "10101", "01010", "00000"],
  "x": ["00000", "10001", "01010", "00100", "01010", "10001", "00000"],
  "y": ["00000", "10001", "10001", "01111", "00001", "01110", "00000"],
  "z": ["00000", "11111", "00010", "00100", "01000", "11111", "00000"],
  "|": ["1", "1", "1", "1", "1", "1", "1"]
};

main();
