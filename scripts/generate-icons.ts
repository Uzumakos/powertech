// Renders the app icons (PWA, Apple touch icon) from the bolt mark.
// Usage: node scripts/generate-icons.ts   (writes to public/icons/)
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const CRIMSON = "#9E1B1E";
const VOLT = "#FFD100";
const BOLT =
  "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z";

/** Bolt centred on crimson. `boltShare` is the bolt's width relative to the icon. */
function svg(size: number, { rounded, boltShare }: { rounded: boolean; boltShare: number }) {
  const bolt = size * boltShare;
  const scale = bolt / 24;
  const offset = (size - bolt) / 2;
  const radius = rounded ? size * 0.22 : 0;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" rx="${radius}" fill="${CRIMSON}"/>
      <path transform="translate(${offset} ${offset}) scale(${scale})" fill="${VOLT}" d="${BOLT}"/>
    </svg>`,
  );
}

const out = "public/icons";
mkdirSync(out, { recursive: true });

const icons = [
  // "any" icons keep their own rounded corners.
  { file: "icon-192.png", size: 192, rounded: true, boltShare: 0.58 },
  { file: "icon-512.png", size: 512, rounded: true, boltShare: 0.58 },
  // Maskable: full bleed, bolt inside the 80% safe zone so any mask shape works.
  { file: "icon-maskable-512.png", size: 512, rounded: false, boltShare: 0.54 },
  // iOS rounds the corners itself.
  { file: "apple-touch-icon.png", size: 180, rounded: false, boltShare: 0.56 },
];

for (const icon of icons) {
  await sharp(svg(icon.size, icon)).png().toFile(`${out}/${icon.file}`);
  console.log(`${out}/${icon.file}`);
}

// favicon.ico for browsers and tools that request it directly: an ICO file
// wrapping 32 px and 48 px PNGs (the format allows PNG entries).
const sizes = [32, 48];
const pngs = await Promise.all(sizes.map((size) => sharp(svg(size, { rounded: true, boltShare: 0.62 })).png().toBuffer()));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = sizes.map((size, index) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size, 0); // width
  entry.writeUInt8(size, 1); // height
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngs[index].length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += pngs[index].length;
  return entry;
});
writeFileSync("public/favicon.ico", Buffer.concat([header, ...entries, ...pngs]));
console.log("public/favicon.ico");
