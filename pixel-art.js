const SIZE = 16;

const ART = {
  advent: [
    "................", ".......R........", "......RRR.......", ".....RRBRR......",
    "......BBB.......", ".....BBBBB......", ".....B...B......", ".....B...B......",
    ".....B.R.B......", ".....B.R.B......", ".....B.R.B......", ".....B...B......",
    ".....B...B......", ".....BBBBB......", "....BBBBBBB.....", "................",
  ],
  christmas: [
    "................", ".......RR.......", ".......RR.......", "......BRB.......",
    "..BB..BRB..BB...", "...BBBBRBBBB....", "....BBBRBBB.....", "RRRRRRRRRRRRRRR.",
    "....BBBRBBB.....", "...BBBBRBBBB....", "..BB..BRB..BB...", "......BRB.......",
    ".......RR.......", ".......RR.......", "................", "................",
  ],
  epiphany: [
    "................", "................", "..R.....R.....R.", "..BR...BR....BR.",
    "..BB...BB....BB.", "...B...BB...BB..", "...BB.B..B.BB...", "....BB....BB....",
    "....BBBBBBBB....", "....B......B....", "....B.R..R.B....", "....B......B....",
    "....BBBBBBBB....", "................", "................", "................",
  ],
  lent: [
    ".......BB.......", ".......BB.......", "...R...BB...R...", "....R..BB..R....",
    "..BBBBBBBBBBBB..", "..BBBBBBBBBBBB..", "....R..BB..R....", "...R...BB...R...",
    ".......BB.......", ".......BB.......", ".......BB.......", ".......BB.......",
    ".......BB.......", ".......BB.......", ".......BB.......", "................",
  ],
  easter: [
    ".......R........", "....R..R..R.....", ".....RRRRR......", "...RRRRRRRRR....",
    "................", "....BBBBBBBB....", "...BB......BB...", "..BB........BB..",
    "..B...BBBB...B..", "..B..BB..BB..B..", "..B..B....B..B..", "..B..B....B..B..",
    "..B..B....B..B..", "..B..B....B..B..", "..BBBB....BBBB..", "................",
  ],
  pentecost: [
    ".......R........", "......RRR.......", ".....RR.RR......", "....RR..RR......",
    "....R..RRR......", "...RR.RRRR......", "...R.RRBRR......", "..RR.RBBBRR.....",
    "..R.RBBBBBR.....", "..RRBBBBBBR.....", "...RBBBBBR......", "...RRBBBRR......",
    "....RBBBR.......", ".....RBR........", "......R.........", "................",
  ],
  ordinary: [
    ".......BB.......", ".......BB.......", ".......BB.......", ".......BB.......",
    "...BBBBBBBBBB...", "...BBBBBBBBBB...", ".......RR.......", ".......RR.......",
    ".......BB.......", ".......BB.......", ".......BB.......", ".......BB.......",
    ".......BB.......", ".......BB.......", ".......BB.......", "................",
  ],
  feast: [
    "................", ".....BBBBBB.....", "...BB......BB...", "..BB...RR...BB..",
    "..B....RR....B..", ".B.....BB.....B.", ".B.....BB.....B.", ".B..BBBBBBBB..B.",
    ".B..BBBBBBBB..B.", ".B.....BB.....B.", ".B.....BB.....B.", "..B....BB....B..",
    "..BB...BB...BB..", "...BB......BB...", ".....BBBBBB.....", "................",
  ],
  eucharist: [
    "....R......R....", ".......RR.......", ".....BBBBBB.....", "....B......B....",
    "...RB..RR..BR...", "....B..RR..B....", "....BBBBBBBB....", "....B......B....",
    ".....B....B.....", ".....BB..BB.....", "......BBBB......", ".......BB.......",
    ".......BB.......", ".....BBBBBB.....", "................", "................",
  ],
  "friday-cross": [
    ".......BB.......", ".......BB.......", ".......BB.......", "...BBBBBBBBBB...",
    "...BBBBBBBBBB...", ".......RR.......", ".......RR.......", ".......BB.......",
    ".......BB.......", ".......BB.......", ".......BB.......", ".......BB.......",
    ".......BB.......", ".......BB.......", "................", "................",
  ],
  saint: [
    "......RRRR......", ".....R....R.....", ".....R....R.....", "......RRRR......",
    "......BBBB......", ".....B....B.....", ".....B....B.....", "......BBBB......",
    "....BBBBBBBB....", "...BB......BB...", "...B...RR...B...", "...B...RR...B...",
    "...B........B...", "...BBBBBBBBBB...", "................", "................",
  ],
};

const FEAST_ICON_SPECS = {
  "The Holy Name": [
    ["v", "B", 3, 5, 11], ["v", "B", 7, 5, 11], ["h", "B", 3, 7, 8],
    ["v", "B", 10, 5, 11], ["h", "B", 10, 13, 5], ["h", "B", 10, 13, 8], ["h", "B", 10, 13, 11],
    ["v", "R", 8, 2, 4], ["h", "R", 7, 9, 3],
  ],
  "The Epiphany": [
    ["v", "R", 8, 1, 13], ["h", "R", 1, 14, 7], ["l", "B", 3, 2, 13, 12], ["l", "B", 13, 2, 3, 12],
    ["f", "R", 6, 5, 5, 5],
  ],
  "Confession of St. Peter": [
    ["r", "B", 2, 2, 7, 7], ["r", "R", 4, 4, 3, 3], ["l", "B", 8, 8, 14, 14],
    ["h", "B", 10, 13, 11], ["h", "B", 12, 14, 13],
  ],
  "Conversion of St. Paul": [
    ["l", "R", 10, 1, 5, 7], ["l", "R", 5, 7, 9, 7], ["l", "R", 9, 7, 4, 14],
    ["l", "B", 2, 14, 6, 9], ["l", "B", 14, 14, 10, 9],
  ],
  "The Presentation": [
    ["f", "B", 6, 6, 5, 8], ["f", "R", 7, 3, 3, 3], ["p", "R", 8, 1], ["h", "B", 4, 12, 14],
  ],
  "St. Matthias": [
    ["l", "B", 4, 13, 11, 3], ["f", "B", 9, 2, 5, 4], ["l", "R", 3, 4, 8, 9],
    ["h", "R", 2, 6, 5],
  ],
  "St. Joseph": [
    ["h", "B", 2, 13, 13], ["v", "B", 3, 5, 13], ["l", "B", 3, 5, 11, 13],
    ["h", "R", 3, 8, 8], ["v", "R", 8, 8, 13],
  ],
  "The Annunciation": [
    ["v", "B", 8, 5, 14], ["l", "B", 8, 8, 4, 5], ["l", "B", 8, 8, 12, 5],
    ["l", "B", 8, 11, 5, 13], ["l", "B", 8, 11, 11, 13], ["f", "R", 7, 2, 3, 4],
  ],
  "St. Mark": [
    ["r", "B", 6, 6, 6, 6], ["p", "R", 10, 8], ["l", "B", 6, 7, 2, 3], ["l", "B", 6, 9, 2, 12],
    ["l", "B", 12, 7, 14, 5], ["v", "R", 7, 12, 14], ["v", "R", 11, 12, 14],
  ],
  "St. Philip and St. James": [
    ["v", "B", 5, 3, 13], ["h", "B", 2, 8, 6], ["v", "R", 11, 2, 12], ["h", "R", 8, 14, 5],
  ],
  "The Visitation": [
    ["f", "R", 3, 2, 3, 3], ["f", "R", 10, 2, 3, 3], ["r", "B", 2, 6, 5, 8], ["r", "B", 9, 6, 5, 8],
    ["h", "B", 6, 9, 8],
  ],
  "St. Barnabas": [
    ["r", "B", 3, 3, 10, 10], ["v", "R", 5, 5, 11], ["h", "R", 5, 10, 5], ["h", "R", 5, 10, 8],
    ["h", "R", 5, 10, 11],
  ],
  "Nativity of St. John the Baptist": [
    ["l", "B", 3, 10, 8, 3], ["l", "B", 13, 10, 8, 3], ["v", "B", 8, 3, 11],
    ["l", "B", 3, 10, 13, 10], ["h", "R", 2, 6, 13], ["h", "R", 9, 13, 13],
  ],
  "St. Peter and St. Paul": [
    ["r", "B", 2, 2, 6, 6], ["l", "B", 7, 7, 13, 13], ["h", "B", 9, 13, 10],
    ["v", "R", 12, 2, 13], ["l", "R", 10, 4, 12, 1], ["l", "R", 14, 4, 12, 1],
  ],
  "Independence Day": [
    ["v", "B", 3, 2, 14], ["r", "B", 4, 3, 9, 7], ["f", "R", 5, 4, 3, 3],
    ["h", "R", 8, 11, 6], ["h", "R", 5, 11, 8],
  ],
  "St. Mary Magdalene": [
    ["r", "B", 5, 5, 6, 9], ["h", "B", 4, 12, 7], ["h", "B", 6, 10, 3], ["f", "R", 7, 8, 3, 4],
  ],
  "St. James": [
    ["v", "B", 8, 3, 13], ["l", "B", 8, 4, 3, 10], ["l", "B", 8, 4, 13, 10],
    ["l", "B", 3, 10, 8, 13], ["l", "B", 13, 10, 8, 13], ["f", "R", 7, 7, 3, 3],
  ],
  "The Transfiguration": [
    ["l", "B", 2, 14, 8, 6], ["l", "B", 8, 6, 14, 14], ["v", "R", 8, 1, 4],
    ["l", "R", 4, 2, 6, 5], ["l", "R", 12, 2, 10, 5], ["f", "R", 7, 5, 3, 3],
  ],
  "St. Mary the Virgin": [
    ["l", "B", 3, 5, 5, 12], ["l", "B", 13, 5, 11, 12], ["h", "B", 5, 11, 12],
    ["l", "B", 3, 5, 6, 8], ["l", "B", 13, 5, 10, 8], ["f", "R", 7, 3, 3, 4],
  ],
  "St. Bartholomew": [
    ["f", "B", 7, 2, 4, 9], ["l", "B", 7, 10, 4, 14], ["l", "R", 11, 2, 13, 4],
    ["h", "R", 6, 11, 7],
  ],
  "Holy Cross Day": [
    ["v", "B", 7, 2, 14], ["v", "B", 8, 2, 14], ["h", "R", 3, 12, 6], ["h", "R", 3, 12, 7],
  ],
  "St. Matthew": [
    ["l", "B", 2, 5, 6, 8], ["l", "B", 2, 11, 6, 8], ["r", "B", 6, 4, 8, 9],
    ["v", "R", 10, 6, 11], ["h", "R", 8, 12, 8],
  ],
  "St. Michael and All Angels": [
    ["l", "B", 2, 4, 7, 8], ["l", "B", 2, 12, 7, 8], ["l", "B", 14, 4, 9, 8], ["l", "B", 14, 12, 9, 8],
    ["v", "R", 8, 2, 14], ["l", "R", 6, 4, 8, 1], ["l", "R", 10, 4, 8, 1],
  ],
  "St. Luke": [
    ["r", "B", 4, 6, 8, 7], ["l", "B", 4, 7, 2, 3], ["l", "B", 12, 7, 14, 3],
    ["p", "R", 6, 8], ["p", "R", 10, 8], ["h", "R", 7, 9, 11],
  ],
  "St. James of Jerusalem": [
    ["l", "B", 4, 7, 8, 2], ["l", "B", 12, 7, 8, 2], ["r", "B", 4, 7, 8, 7],
    ["v", "R", 13, 4, 14], ["h", "R", 10, 13, 4],
  ],
  "St. Simon and St. Jude": [
    ["l", "B", 2, 7, 5, 13], ["h", "B", 5, 11, 13], ["l", "B", 11, 13, 14, 7],
    ["h", "B", 2, 14, 7], ["v", "R", 8, 4, 11], ["h", "R", 6, 10, 5],
  ],
  "All Saints' Day": [
    ["r", "R", 2, 2, 4, 4], ["r", "R", 6, 1, 4, 4], ["r", "R", 10, 2, 4, 4],
    ["v", "B", 4, 7, 13], ["v", "B", 8, 6, 13], ["v", "B", 12, 7, 13], ["h", "B", 2, 14, 13],
  ],
  "Thanksgiving Day": [
    ["v", "B", 8, 3, 14], ["l", "B", 8, 6, 4, 3], ["l", "B", 8, 9, 4, 6],
    ["l", "B", 8, 12, 4, 9], ["l", "R", 8, 5, 12, 2], ["l", "R", 8, 8, 12, 5], ["l", "R", 8, 11, 12, 8],
  ],
  "St. Andrew": [
    ["l", "B", 3, 2, 13, 14], ["l", "B", 13, 2, 3, 14], ["f", "R", 7, 7, 3, 3],
  ],
  "St. Thomas": [
    ["h", "B", 2, 12, 13], ["v", "B", 3, 6, 13], ["l", "B", 3, 6, 10, 13],
    ["v", "R", 12, 2, 13], ["l", "R", 10, 4, 12, 1], ["l", "R", 14, 4, 12, 1],
  ],
  "Christmas Day": [
    ["l", "B", 3, 12, 8, 8], ["l", "B", 13, 12, 8, 8], ["h", "B", 3, 13, 12],
    ["f", "R", 7, 9, 3, 2], ["v", "R", 8, 2, 6], ["h", "R", 6, 10, 4],
  ],
  "St. Stephen": [
    ["f", "B", 2, 10, 4, 4], ["f", "B", 7, 8, 4, 4], ["f", "B", 12, 10, 3, 4],
    ["l", "R", 4, 9, 10, 2], ["l", "R", 10, 2, 12, 6],
  ],
  "St. John": [
    ["l", "B", 2, 8, 7, 5], ["l", "B", 14, 8, 9, 5], ["l", "B", 7, 5, 8, 12], ["l", "B", 9, 5, 8, 12],
    ["l", "B", 2, 8, 7, 10], ["l", "B", 14, 8, 9, 10], ["f", "R", 7, 3, 3, 3],
  ],
  "The Holy Innocents": [
    ["f", "R", 3, 3, 3, 3], ["f", "R", 7, 2, 3, 3], ["f", "R", 11, 3, 3, 3],
    ["l", "B", 4, 7, 2, 13], ["l", "B", 8, 6, 8, 13], ["l", "B", 12, 7, 14, 13],
  ],
};

const CALENDAR_ICON_SPECS = {
  "christmas-eve": [
    ["v", "R", 8, 1, 5], ["h", "R", 6, 10, 3], ["l", "R", 6, 1, 10, 5], ["l", "R", 10, 1, 6, 5],
    ["l", "B", 3, 13, 8, 9], ["l", "B", 13, 13, 8, 9], ["h", "B", 3, 13, 13], ["f", "R", 7, 10, 3, 2],
  ],
  christmas: [
    ["v", "R", 8, 1, 4], ["h", "R", 6, 10, 2], ["l", "R", 6, 1, 10, 4], ["l", "R", 10, 1, 6, 4],
    ["l", "B", 2, 13, 8, 8], ["l", "B", 14, 13, 8, 8], ["h", "B", 2, 14, 13],
    ["f", "R", 6, 9, 5, 3], ["p", "B", 8, 9],
  ],
  epiphany: [
    ["v", "R", 8, 1, 7], ["h", "R", 2, 14, 4], ["l", "R", 4, 1, 12, 7], ["l", "R", 12, 1, 4, 7],
    ["l", "B", 3, 10, 5, 14], ["l", "B", 5, 14, 8, 10], ["l", "B", 8, 10, 11, 14], ["l", "B", 11, 14, 13, 10],
    ["h", "B", 3, 13, 10], ["f", "R", 7, 11, 3, 3],
  ],
  "ash-wednesday": [
    ["v", "B", 8, 2, 14], ["h", "B", 4, 12, 6], ["f", "R", 7, 6, 3, 3],
    ["p", "R", 3, 3], ["p", "R", 13, 4], ["p", "R", 4, 12], ["p", "R", 12, 13],
  ],
  "palm-sunday": [
    ["l", "B", 3, 14, 11, 2], ["l", "R", 5, 11, 2, 8], ["l", "R", 6, 10, 9, 10],
    ["l", "R", 7, 8, 4, 5], ["l", "R", 8, 7, 12, 7], ["l", "R", 9, 5, 7, 2], ["l", "R", 10, 4, 14, 4],
  ],
  "maundy-thursday": [
    ["p", "R", 8, 2], ["l", "R", 8, 2, 6, 5], ["l", "R", 8, 2, 10, 5],
    ["l", "B", 2, 8, 5, 13], ["h", "B", 2, 14, 8], ["l", "B", 14, 8, 11, 13], ["h", "B", 5, 11, 13],
    ["l", "R", 5, 9, 7, 11], ["l", "R", 9, 11, 11, 9],
  ],
  "good-friday": [
    ["v", "B", 8, 1, 13], ["h", "B", 3, 13, 5], ["f", "R", 7, 5, 3, 2],
    ["l", "B", 2, 14, 8, 11], ["l", "B", 8, 11, 14, 14],
  ],
  "holy-saturday": [
    ["r", "B", 2, 5, 12, 9], ["l", "B", 2, 5, 5, 2], ["h", "B", 5, 11, 2],
    ["f", "R", 9, 7, 3, 3], ["l", "R", 10, 7, 12, 9],
  ],
  easter: [
    ["v", "R", 8, 1, 4], ["l", "R", 4, 2, 6, 4], ["l", "R", 12, 2, 10, 4],
    ["l", "B", 2, 14, 4, 7], ["l", "B", 4, 7, 12, 7], ["l", "B", 12, 7, 14, 14], ["h", "B", 2, 14, 14],
    ["r", "R", 6, 9, 5, 5],
  ],
  ascension: [
    ["v", "R", 8, 2, 10], ["l", "R", 8, 2, 5, 5], ["l", "R", 8, 2, 11, 5],
    ["l", "B", 1, 13, 4, 10], ["h", "B", 4, 7, 10], ["l", "B", 7, 10, 9, 12],
    ["h", "B", 9, 12, 12], ["l", "B", 12, 12, 15, 14],
  ],
  pentecost: [
    ["l", "R", 8, 1, 4, 7], ["l", "R", 4, 7, 7, 14], ["l", "R", 7, 14, 12, 9],
    ["l", "R", 12, 9, 10, 3], ["l", "R", 10, 3, 8, 7], ["l", "R", 8, 7, 8, 13],
    ["f", "B", 7, 9, 3, 5],
  ],
  trinity: [
    ["l", "B", 8, 2, 2, 13], ["l", "B", 8, 2, 14, 13], ["h", "B", 2, 14, 13],
    ["r", "R", 6, 1, 5, 5], ["r", "R", 1, 10, 5, 5], ["r", "R", 10, 10, 5, 5],
  ],
};

const OBVIOUS_SAINT_SYMBOLS = new Set([
  "Confession of St. Peter", "Conversion of St. Paul", "St. Joseph", "St. Mark",
  "Nativity of St. John the Baptist", "St. Peter and St. Paul", "St. Mary Magdalene",
  "St. James", "St. Mary the Virgin", "St. Bartholomew", "St. Matthew",
  "St. Michael and All Angels", "St. Luke", "St. Andrew", "St. Thomas",
  "St. Stephen", "St. John",
]);

function drawLine(grid, color, startX, startY, endX, endY) {
  const deltaX = Math.abs(endX - startX);
  const stepX = startX < endX ? 1 : -1;
  const deltaY = -Math.abs(endY - startY);
  const stepY = startY < endY ? 1 : -1;
  let error = deltaX + deltaY;
  let x = startX;
  let y = startY;
  while (true) {
    if (x >= 0 && x < SIZE && y >= 0 && y < SIZE) grid[y][x] = color;
    if (x === endX && y === endY) break;
    const doubledError = 2 * error;
    if (doubledError >= deltaY) { error += deltaY; x += stepX; }
    if (doubledError <= deltaX) { error += deltaX; y += stepY; }
  }
}

function rowsForSpec(operations) {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill("."));
  for (const [kind, color, ...values] of operations) {
    if (kind === "p") grid[values[1]][values[0]] = color;
    if (kind === "h") drawLine(grid, color, values[0], values[2], values[1], values[2]);
    if (kind === "v") drawLine(grid, color, values[0], values[1], values[0], values[2]);
    if (kind === "l") drawLine(grid, color, ...values);
    if (kind === "r") {
      const [x, y, width, height] = values;
      drawLine(grid, color, x, y, x + width - 1, y);
      drawLine(grid, color, x, y + height - 1, x + width - 1, y + height - 1);
      drawLine(grid, color, x, y, x, y + height - 1);
      drawLine(grid, color, x + width - 1, y, x + width - 1, y + height - 1);
    }
    if (kind === "f") {
      const [x, y, width, height] = values;
      for (let row = y; row < y + height; row += 1) {
        for (let column = x; column < x + width; column += 1) grid[row][column] = color;
      }
    }
  }
  return grid.map(row => row.join(""));
}

function weekdayFor(view) {
  if (!view.date) return null;
  return new Date(`${view.date}T12:00:00Z`).getUTCDay();
}

function principalArtNameFor(view) {
  const label = String(view.label || "").toLowerCase();
  const weekday = weekdayFor(view);
  if (view.feast === "Christmas Day") return "christmas";
  if (view.feast === "The Epiphany") return "epiphany";
  if (view.date?.slice(5) === "12-24") return "christmas-eve";
  if (label === "the day of pentecost") return "pentecost";
  if (label === "trinity sunday") return "trinity";
  if (label === "ash wednesday and following" && weekday === 3) return "ash-wednesday";
  if (label === "holy week") {
    if (weekday === 0) return "palm-sunday";
    if (weekday === 4) return "maundy-thursday";
    if (weekday === 5) return "good-friday";
    if (weekday === 6) return "holy-saturday";
  }
  if (label === "easter week" && weekday === 0) return "easter";
  if (label === "week of 6 easter" && weekday === 4) return "ascension";
  const adventWeek = label.match(/^week of ([1-4]) advent$/)?.[1];
  if (adventWeek && weekday === 0) return `advent-${adventWeek}`;
  return null;
}

function feastArtNameFor(feast) {
  if (!feast || feast === "Christmas Day" || feast === "The Epiphany") return null;
  const namesSaints = /\bSt\.|Saints?'?\b/.test(feast);
  if (namesSaints && !OBVIOUS_SAINT_SYMBOLS.has(feast) && feast !== "All Saints' Day") return "saint";
  return `feast:${feast}`;
}

export function artNameFor(view) {
  return artNamesFor(view)[0] || null;
}

export function artNamesFor(view) {
  const weekday = weekdayFor(view);
  const principal = principalArtNameFor(view);
  const names = [principal, feastArtNameFor(view.feast)].filter(Boolean);
  if (weekday === 0) names.push("eucharist");
  if (weekday === 5 && principal !== "good-friday") names.push("friday-cross");
  return [...new Set(names)];
}

export function artRows(name) {
  const calendarSpec = CALENDAR_ICON_SPECS[name];
  if (calendarSpec) return rowsForSpec(calendarSpec);
  if (name.startsWith("advent-")) {
    const candleCount = Number(name.slice("advent-".length));
    const candles = Array.from({ length: candleCount }, (_, index) => ["v", "R", 5 + (index * 2), 3, 7]);
    return rowsForSpec([
      ["h", "B", 5, 11, 8], ["l", "B", 5, 8, 2, 11], ["l", "B", 2, 11, 5, 14],
      ["h", "B", 5, 11, 14], ["l", "B", 11, 14, 14, 11], ["l", "B", 14, 11, 11, 8],
      ["h", "B", 6, 10, 10], ["l", "B", 6, 10, 4, 11], ["l", "B", 4, 11, 6, 13],
      ["h", "B", 6, 10, 13], ["l", "B", 10, 13, 12, 11], ["l", "B", 12, 11, 10, 10],
      ...candles,
    ]);
  }
  if (name.startsWith("feast:")) {
    const feast = name.slice("feast:".length);
    const spec = FEAST_ICON_SPECS[feast];
    if (spec) return rowsForSpec(spec);
    return ART.feast;
  }
  return ART[name] || ART.feast;
}

export function drawPixelArt(canvas, view) {
  const name = artNameFor(view);
  if (name) drawArt(canvas, name);
  else canvas.getContext("2d").clearRect(0, 0, SIZE, SIZE);
}

function paletteFor(element) {
  const styles = typeof getComputedStyle === "function" ? getComputedStyle(element) : null;
  return {
    ink: styles?.getPropertyValue("--screen-ink").trim() || "#171716",
    red: styles?.getPropertyValue("--red").trim() || "#b3181e",
  };
}

function drawArt(canvas, name, palette = paletteFor(canvas)) {
  const context = canvas.getContext("2d");
  const rows = artRows(name);
  const feast = name.startsWith("feast:") ? name.slice("feast:".length) : name;
  canvas.setAttribute("aria-label", `${feast} liturgical pixel art`);
  context.clearRect(0, 0, SIZE, SIZE);
  rows.forEach((row, rowIndex) => [...row].forEach((pixel, columnIndex) => {
    if (pixel === "B") context.fillStyle = palette.ink;
    else if (pixel === "R") context.fillStyle = palette.red;
    else return;
    context.fillRect(columnIndex, rowIndex, 1, 1);
  }));
}

export function renderPixelArtStack(container, view) {
  const names = artNamesFor(view);
  const palette = paletteFor(container);
  const canvases = names.map(name => {
    const canvas = document.createElement("canvas");
    canvas.className = "pixel-art";
    canvas.width = SIZE;
    canvas.height = SIZE;
    canvas.setAttribute("role", "img");
    drawArt(canvas, name, palette);
    return canvas;
  });
  container.dataset.count = String(canvases.length);
  container.replaceChildren(...canvases);
}
