import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";

const file = ".release/ontos-protocol-60s-demo.mp4";
const checksumFile = ".release/SHA256SUMS";

assert.ok(existsSync(file), "missing generated demo video; run npm run demo:video");
assert.ok(statSync(file).size > 100_000, "demo video is unexpectedly small");

const ffprobe = JSON.parse(execFileSync(
  "ffprobe",
  [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=codec_name,width,height",
    "-show_entries",
    "format=duration",
    "-of",
    "json",
    file
  ],
  { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
));

const [stream] = ffprobe.streams;
assert.equal(stream.codec_name, "h264");
assert.equal(stream.width, 1280);
assert.equal(stream.height, 720);

const duration = Number(ffprobe.format.duration);
assert.ok(duration >= 59.5 && duration <= 60.5, `demo video duration should be 60s, got ${duration}`);

const checksumText = readFileSync(checksumFile, "utf8");
const digest = createHash("sha256").update(readFileSync(file)).digest("hex");
assert.ok(
  checksumText.includes(`${digest}  ontos-protocol-60s-demo.mp4`),
  "demo video checksum is missing from SHA256SUMS"
);

const script = readFileSync("docs/DEMO_VIDEO_60S.md", "utf8");
for (const required of [
  ".release/ontos-protocol-60s-demo.mp4",
  "npm run demo:video",
  "npm run validate:demo-video",
  "silent captioned MP4",
  "60 seconds"
]) {
  assert.ok(script.includes(required), `demo video docs missing ${required}`);
}

console.log(`demo video ok duration=${duration.toFixed(1)}s`);
