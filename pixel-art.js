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
  "season-advent": [
    "................", "................", "........R.......", "........R.......",
    "........R.......", "......R.R.R.....", ".......BBB......", "...RRRRBBBRRRR..",
    ".......BBB......", "......R.R.R.....", "........R.......", "........R.......",
    "........R.......", "................", "................", "................",
  ],
  "season-christmas": [
    "................", "................", "................", "........B.......",
    ".......B.B......", ".....BB...B.....", "....B......BB...", "...B.........B..",
    "..BB...RRR...BB.", "...B...RRR...B..", "...B.BBBBBBB.B..", "...B.BB...BB.B..",
    "...BB.......BB..", "...BBBBBBBBBBB..", "...B.........B..", "................",
  ],
  "season-epiphany": [
    "................", "................", "................", "........B.......",
    "..B.....B....B..", "..BB...B.B..BB..", "..B.B..B.B..BB..", "..B.B..B.B.B.B..",
    "..B..BB...BB.B..", "..B...B...B..B..", "..B..........B..", "..BRR..RR..RRB..",
    "..BRR..RR..RRB..", "..B..........B..", "..BBBBBBBBBBBB..", "................",
  ],
  "season-lent": [
    "................", "................", "........B.......", "...R....B.......",
    "........B....R..", "........B.......", "....BBBBBBBBB...", "........B.......",
    "........B.......", "........B.......", "........B.......", "........B.......",
    "....R...B.......", "........B...R...", "........B.......", "................",
  ],
  "season-holy-week": [
    "................", "........B.......", "........B.......", "........B.......",
    "........B.......", "....BBBBBBBBB...", ".......RRR......", ".......RRR......",
    "........B.......", "........B.......", "........B.......", "........B.......",
    "......BBBBB.....", ".....B.....B....", "...BB.......BB..", "..B...........B.",
  ],
  "season-easter": [
    "................", "................", "................", "................",
    "................", "................", "........BBBBB...", "........B....B..",
    "..BBB...BRRRRB..", ".B...B..BR..R.B.", ".B...B..BR..R.B.", ".B...B.B.R..R.B.",
    ".B...B.B.R..R.B.", ".B...B.B.RRRR.B.", "..BBB..BBBBBBBB.", "................",
  ],
  "season-pentecost": [
    "................", "........R.......", ".......R........", ".......R..R.....",
    "......R..RR.....", ".....R...R.R....", ".....R..R..R....", "....R...R..R....",
    "....R...R...R...", ".....R.BBB..R...", ".....R.BBB.R....", "......RBBBR.....",
    "......RBBB......", ".......BBB......", ".......R........", "................",
  ],
  "season-ordinary": [
    "................", "................", "................", "...R...R.R...R..",
    "....BR.....RB...", ".....BB.B..B....", ".......BB.B.....", "..R.....BB....R.",
    "...BBR..B..R.B..", ".....BB.B..BB...", ".......BBBB.....", "........B.......",
    "........B.......", "........B.......", "........B.......", ".....BBBBBBB....",
  ],
  feast: [
    "................", ".....BBBBBB.....", "...BB......BB...", "..BB...RR...BB..",
    "..B....RR....B..", ".B.....BB.....B.", ".B.....BB.....B.", ".B..BBBBBBBB..B.",
    ".B..BBBBBBBB..B.", ".B.....BB.....B.", ".B.....BB.....B.", "..B....BB....B..",
    "..BB...BB...BB..", "...BB......BB...", ".....BBBBBB.....", "................",
  ],
  eucharist: [
    "................", "................", "................", "................",
    "....BBBBBBBBB...", "....B.RRRRR.B...", ".....BRRRRRB....", ".....B.....B....",
    "......B...B.....", "......BBBBB.....", ".BBBB...B.......", ".RRRR...B.......",
    ".BBBB...B.......", ".....BBBBBBB....", "................", "................",
  ],
  "friday-cross": [
    "................", "................", "........B.......", "........B.......",
    "........B.......", ".......RRR......", "....BBBRRRBBB...", ".......RRR......",
    "........B.......", "........B.......", "........B.......", "........B.......",
    "........B.......", "........B.......", "........B.......", "................",
  ],
  saint: [
    "................", ".....RRRRRRR....", ".....R.....R....", ".....R.....R....",
    ".....R.BBB.R....", ".....RRBBBRR....", ".......BBB......", "........B.......",
    ".......B.B......", "......B...B.....", ".....B..R..B....", ".....B.....B....",
    "....B.......B...", "...BBBBBBBBBBB..", "................", "................",
  ],
  apostle: [
    "................", "................", "................", "................",
    "......B.........", ".....B.BB......B", "....B....B....B.", "...B..R...BB.B..",
    "..B.........B...", "...B......BB.B..", "....B....B....B.", ".....B.BB......B",
    "......B.........", "................", "................", "................",
  ],
  martyr: [
    "................", ".....RRRRRRR....", ".....R.....R....", ".....R.....R....",
    ".....R.BBB.R....", ".....RRBBBRR....", ".......BBB......", ".....BBBBBBB....",
    ".....B.....B....", ".....B.....B....", ".....B.RRR.B....", ".....B.RRR.B....",
    ".....B.RRR.B....", ".....B.....B....", ".....BBBBBBB....", "................",
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
    ["r", "B", 3, 7, 11, 8], ["l", "B", 3, 7, 8, 3], ["l", "B", 8, 3, 13, 7],
    ["v", "B", 8, 1, 5], ["h", "B", 6, 10, 2], ["r", "R", 6, 10, 4, 5],
    ["p", "R", 5, 10], ["p", "R", 8, 9], ["p", "R", 11, 10],
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
    ["v", "B", 8, 2, 14], ["h", "B", 4, 12, 6],
    ["p", "R", 3, 3], ["p", "R", 13, 4], ["p", "R", 4, 12], ["p", "R", 12, 13],
  ],
  "palm-sunday": [
    ["l", "B", 3, 14, 11, 2], ["l", "R", 5, 11, 2, 8], ["l", "R", 6, 10, 9, 11],
    ["l", "R", 7, 8, 3, 6], ["l", "R", 8, 7, 12, 8], ["l", "R", 9, 5, 6, 3],
    ["l", "R", 10, 4, 14, 5], ["l", "R", 10, 3, 8, 1], ["l", "R", 11, 3, 15, 2],
  ],
  "holy-monday": [
    ["h", "B", 6, 10, 3], ["v", "B", 7, 3, 5], ["v", "B", 9, 3, 5],
    ["r", "B", 5, 5, 7, 10], ["f", "R", 7, 8, 3, 4],
  ],
  "holy-tuesday": [
    ["r", "B", 3, 3, 10, 10], ["h", "B", 2, 5, 4], ["h", "B", 10, 14, 11],
    ["h", "R", 5, 10, 7], ["h", "R", 5, 9, 9],
  ],
  "holy-wednesday": [
    ["h", "B", 2, 7, 8], ["h", "B", 10, 14, 8], ["v", "B", 3, 8, 14], ["v", "B", 13, 8, 14],
    ["l", "R", 7, 6, 10, 10],
  ],
  "maundy-thursday": [
    ["h", "B", 4, 12, 4], ["l", "B", 4, 4, 6, 9], ["l", "B", 12, 4, 10, 9],
    ["h", "B", 6, 10, 9], ["v", "B", 8, 9, 13], ["h", "B", 5, 11, 13], ["f", "R", 6, 5, 5, 2],
    ["f", "B", 1, 11, 4, 3], ["h", "R", 1, 4, 12],
  ],
  "good-friday": [
    ["v", "B", 8, 1, 12], ["h", "B", 4, 12, 5], ["f", "R", 7, 6, 3, 2],
    ["l", "B", 2, 15, 8, 11], ["l", "B", 8, 11, 14, 15],
  ],
  "holy-saturday": [
    ["v", "B", 3, 6, 14], ["v", "B", 13, 6, 14], ["h", "B", 3, 13, 14],
    ["l", "B", 3, 6, 5, 3], ["h", "B", 5, 11, 3], ["l", "B", 11, 3, 13, 6],
    ["f", "R", 7, 8, 5, 7],
  ],
  easter: [
    ["v", "R", 8, 1, 4], ["l", "R", 4, 2, 6, 4], ["l", "R", 12, 2, 10, 4],
    ["l", "B", 2, 14, 4, 7], ["l", "B", 4, 7, 12, 7], ["l", "B", 12, 7, 14, 14], ["h", "B", 2, 14, 14],
    ["r", "R", 6, 9, 5, 5],
  ],
  ascension: [
    ["h", "B", 2, 14, 12], ["h", "B", 4, 12, 10], ["p", "B", 3, 11], ["p", "B", 13, 11],
    ["v", "R", 8, 2, 9], ["l", "R", 8, 2, 5, 5], ["l", "R", 8, 2, 11, 5],
  ],
  pentecost: [
    ["l", "R", 8, 1, 4, 7], ["l", "R", 4, 7, 7, 14], ["l", "R", 7, 14, 12, 9],
    ["l", "R", 12, 9, 10, 3], ["l", "R", 10, 3, 8, 7], ["l", "R", 8, 7, 8, 13],
    ["f", "B", 7, 9, 3, 5],
  ],
  trinity: [
    ["r", "B", 1, 3, 6, 6], ["r", "B", 9, 3, 6, 6], ["r", "B", 5, 8, 6, 6],
    ["f", "R", 7, 7, 3, 3],
  ],
};

const WEB_SIZE = 24;

const WEB_ICON_SPECS = {
  "season-advent": [
    ["v", "R", 12, 2, 21], ["h", "R", 3, 21, 11],
    ["l", "B", 5, 4, 19, 18], ["l", "B", 19, 4, 5, 18],
    ["f", "R", 10, 9, 5, 5], ["f", "B", 11, 10, 3, 3],
  ],
  "season-christmas": [
    ["v", "R", 18, 1, 7], ["h", "R", 15, 21, 4], ["l", "R", 16, 2, 20, 6], ["l", "R", 20, 2, 16, 6],
    ["l", "B", 3, 11, 12, 4], ["l", "B", 12, 4, 21, 11], ["v", "B", 4, 11, 21], ["v", "B", 20, 11, 21],
    ["h", "B", 4, 20, 21], ["l", "B", 7, 14, 17, 14], ["l", "B", 17, 14, 14, 19], ["h", "B", 9, 14, 19],
    ["f", "R", 10, 15, 4, 2],
  ],
  "season-epiphany": [
    ["v", "B", 4, 8, 20], ["v", "B", 20, 8, 20], ["h", "B", 4, 20, 20],
    ["l", "B", 4, 8, 8, 13], ["l", "B", 8, 13, 12, 5], ["l", "B", 12, 5, 16, 13], ["l", "B", 16, 13, 20, 8],
    ["f", "R", 6, 16, 3, 3], ["f", "R", 11, 16, 3, 3], ["f", "R", 16, 16, 3, 3],
  ],
  "season-lent": [
    ["h", "B", 7, 17, 4], ["l", "B", 7, 4, 4, 8], ["v", "B", 4, 8, 20], ["h", "B", 4, 20, 20],
    ["v", "B", 20, 8, 20], ["l", "B", 20, 8, 17, 4], ["h", "B", 8, 16, 12],
    ["p", "R", 9, 7], ["p", "R", 12, 6], ["p", "R", 15, 8],
  ],
  "season-holy-week": [
    ["l", "R", 5, 6, 9, 3], ["l", "R", 9, 3, 12, 7], ["l", "R", 12, 7, 15, 3], ["l", "R", 15, 3, 19, 6],
    ["v", "R", 5, 6, 10], ["v", "R", 19, 6, 10], ["l", "R", 5, 10, 12, 21], ["l", "R", 19, 10, 12, 21],
    ["v", "B", 12, 6, 17], ["h", "B", 8, 16, 10], ["h", "B", 8, 16, 11],
  ],
  "season-easter": [
    ["v", "R", 17, 1, 6], ["h", "R", 14, 20, 4], ["l", "R", 15, 2, 19, 6], ["l", "R", 19, 2, 15, 6],
    ["h", "B", 8, 19, 7], ["l", "B", 8, 7, 4, 12], ["v", "B", 4, 12, 21], ["h", "B", 4, 21, 21],
    ["v", "B", 21, 12, 21], ["l", "B", 21, 12, 19, 7], ["r", "R", 10, 12, 7, 9],
    ["r", "B", 1, 14, 6, 6], ["p", "R", 3, 16],
  ],
  "season-pentecost": [
    ["l", "R", 12, 1, 7, 9], ["l", "R", 7, 9, 10, 8], ["l", "R", 10, 8, 7, 17],
    ["l", "R", 7, 17, 12, 22], ["l", "R", 12, 22, 18, 16], ["l", "R", 18, 16, 16, 8], ["l", "R", 16, 8, 12, 1],
    ["l", "B", 12, 10, 10, 17], ["l", "B", 10, 17, 14, 20], ["l", "B", 14, 20, 15, 13], ["l", "B", 15, 13, 12, 10],
  ],
  "season-ordinary": [
    ["v", "B", 12, 9, 22], ["l", "B", 12, 13, 7, 8], ["l", "B", 12, 15, 18, 9], ["h", "B", 7, 17, 22],
    ["r", "B", 4, 3, 6, 6], ["r", "B", 9, 1, 7, 7], ["r", "B", 15, 4, 6, 6], ["r", "B", 7, 7, 10, 7],
    ["f", "R", 6, 5, 2, 2], ["f", "R", 11, 3, 2, 2], ["f", "R", 17, 6, 2, 2], ["f", "R", 10, 9, 2, 2], ["f", "R", 14, 10, 2, 2],
  ],
  eucharist: [
    ["h", "R", 7, 17, 3], ["l", "R", 7, 3, 5, 7], ["l", "R", 17, 3, 19, 7], ["h", "R", 5, 19, 7],
    ["h", "B", 6, 18, 8], ["l", "B", 6, 8, 8, 14], ["l", "B", 18, 8, 16, 14], ["h", "B", 8, 16, 14],
    ["v", "B", 12, 14, 20], ["h", "B", 8, 16, 20], ["f", "R", 10, 9, 5, 2],
  ],
  "friday-cross": [
    ["v", "B", 12, 2, 22], ["h", "B", 5, 19, 8], ["f", "R", 10, 7, 5, 4],
    ["l", "R", 3, 4, 6, 7], ["l", "R", 21, 4, 18, 7], ["h", "R", 1, 4, 12], ["h", "R", 20, 23, 12],
  ],
  saint: [
    ["r", "R", 7, 1, 10, 5], ["r", "B", 9, 5, 6, 6], ["v", "B", 12, 11, 14],
    ["l", "B", 12, 13, 6, 20], ["l", "B", 12, 13, 18, 20], ["h", "B", 6, 18, 20], ["f", "R", 10, 15, 5, 3],
  ],
  apostle: [
    ["l", "B", 2, 12, 7, 7], ["l", "B", 7, 7, 14, 5], ["l", "B", 14, 5, 21, 12],
    ["l", "B", 21, 12, 14, 19], ["l", "B", 14, 19, 7, 17], ["l", "B", 7, 17, 2, 12],
    ["l", "B", 18, 9, 22, 5], ["l", "B", 18, 15, 22, 19], ["f", "R", 8, 11, 3, 3],
  ],
  martyr: [
    ["r", "R", 7, 1, 10, 5], ["r", "B", 9, 5, 6, 6], ["v", "B", 12, 11, 14],
    ["l", "R", 12, 13, 6, 21], ["l", "R", 12, 13, 18, 21], ["h", "R", 6, 18, 21],
    ["v", "B", 4, 5, 21], ["h", "B", 2, 7, 8],
  ],
  feast: [
    ["v", "B", 5, 3, 21], ["r", "B", 6, 4, 14, 10], ["l", "B", 19, 13, 15, 9],
    ["v", "R", 12, 6, 12], ["h", "R", 9, 15, 9],
  ],
  "ash-wednesday": [
    ["v", "B", 12, 2, 22], ["h", "B", 5, 19, 8],
    ["p", "R", 4, 4], ["p", "R", 19, 5], ["p", "R", 5, 19], ["p", "R", 18, 20], ["p", "R", 8, 3], ["p", "R", 16, 18],
  ],
  "palm-sunday": [
    ["l", "B", 4, 22, 17, 2], ["l", "R", 7, 18, 2, 13], ["l", "R", 8, 16, 14, 17],
    ["l", "R", 10, 13, 4, 9], ["l", "R", 11, 11, 18, 12], ["l", "R", 13, 8, 7, 5],
    ["l", "R", 14, 6, 22, 7], ["l", "R", 15, 4, 11, 1], ["l", "R", 17, 3, 22, 3],
  ],
  "maundy-thursday": [
    ["h", "B", 6, 18, 5], ["l", "B", 6, 5, 8, 14], ["l", "B", 18, 5, 16, 14], ["h", "B", 8, 16, 14],
    ["v", "B", 12, 14, 21], ["h", "B", 8, 16, 21], ["f", "R", 9, 7, 7, 3],
    ["f", "B", 2, 16, 5, 4], ["h", "R", 2, 6, 20],
  ],
  "good-friday": [
    ["l", "R", 5, 5, 9, 2], ["l", "R", 9, 2, 12, 6], ["l", "R", 12, 6, 15, 2], ["l", "R", 15, 2, 19, 5],
    ["v", "R", 5, 5, 10], ["v", "R", 19, 5, 10], ["l", "R", 5, 10, 12, 21], ["l", "R", 19, 10, 12, 21],
    ["v", "B", 12, 7, 18], ["h", "B", 8, 16, 11],
  ],
  "holy-saturday": [
    ["l", "B", 2, 21, 7, 13], ["v", "B", 7, 13, 21], ["h", "B", 7, 17, 13], ["v", "B", 17, 13, 21], ["l", "B", 17, 13, 22, 21],
    ["v", "R", 12, 3, 16], ["h", "R", 9, 15, 7], ["f", "B", 10, 16, 5, 5],
  ],
  easter: [
    ["v", "R", 18, 1, 6], ["h", "R", 15, 21, 4], ["l", "R", 16, 2, 20, 6], ["l", "R", 20, 2, 16, 6],
    ["h", "B", 8, 19, 7], ["l", "B", 8, 7, 4, 12], ["v", "B", 4, 12, 21], ["h", "B", 4, 21, 21], ["v", "B", 21, 12, 21], ["l", "B", 21, 12, 19, 7],
    ["r", "R", 10, 12, 7, 9], ["r", "B", 1, 14, 6, 6],
  ],
  ascension: [
    ["h", "B", 3, 21, 19], ["h", "B", 6, 18, 16], ["p", "B", 5, 17], ["p", "B", 19, 17],
    ["v", "R", 12, 3, 15], ["l", "R", 12, 3, 7, 8], ["l", "R", 12, 3, 17, 8],
  ],
  pentecost: [
    ["l", "R", 12, 1, 7, 9], ["l", "R", 7, 9, 10, 8], ["l", "R", 10, 8, 7, 17], ["l", "R", 7, 17, 12, 22],
    ["l", "R", 12, 22, 18, 16], ["l", "R", 18, 16, 16, 8], ["l", "R", 16, 8, 12, 1], ["f", "B", 10, 13, 5, 7],
  ],
  trinity: [
    ["r", "B", 2, 4, 8, 8], ["r", "B", 14, 4, 8, 8], ["r", "B", 8, 12, 8, 8],
    ["f", "R", 10, 10, 5, 5],
  ],
  "feast:All Saints' Day": [
    ["l", "B", 3, 20, 12, 7], ["l", "B", 12, 7, 21, 20], ["h", "B", 3, 21, 20], ["v", "B", 12, 2, 7], ["h", "B", 9, 15, 3],
    ["r", "R", 5, 12, 5, 6], ["r", "R", 10, 11, 5, 6], ["r", "R", 15, 12, 5, 6],
  ],
};

const OBVIOUS_SAINT_SYMBOLS = new Set([
  "Confession of St. Peter", "Conversion of St. Paul", "St. Joseph", "St. Mark",
  "Nativity of St. John the Baptist", "St. Peter and St. Paul", "St. Mary Magdalene",
  "St. James", "St. Mary the Virgin", "St. Bartholomew", "St. Matthew",
  "St. Michael and All Angels", "St. Luke", "St. Andrew", "St. Thomas",
  "St. Stephen", "St. John",
]);

const APOSTLE_FEASTS = new Set([
  "St. Matthias", "St. Philip and St. James", "St. Barnabas",
  "St. James of Jerusalem", "St. Simon and St. Jude",
]);

function drawLine(grid, color, startX, startY, endX, endY, size = SIZE) {
  const deltaX = Math.abs(endX - startX);
  const stepX = startX < endX ? 1 : -1;
  const deltaY = -Math.abs(endY - startY);
  const stepY = startY < endY ? 1 : -1;
  let error = deltaX + deltaY;
  let x = startX;
  let y = startY;
  while (true) {
    if (x >= 0 && x < size && y >= 0 && y < size) grid[y][x] = color;
    if (x === endX && y === endY) break;
    const doubledError = 2 * error;
    if (doubledError >= deltaY) { error += deltaY; x += stepX; }
    if (doubledError <= deltaX) { error += deltaX; y += stepY; }
  }
}

function rowsForSpec(operations, size = SIZE) {
  const grid = Array.from({ length: size }, () => Array(size).fill("."));
  for (const [kind, color, ...values] of operations) {
    if (kind === "p") grid[values[1]][values[0]] = color;
    if (kind === "h") drawLine(grid, color, values[0], values[2], values[1], values[2], size);
    if (kind === "v") drawLine(grid, color, values[0], values[1], values[0], values[2], size);
    if (kind === "l") drawLine(grid, color, ...values, size);
    if (kind === "r") {
      const [x, y, width, height] = values;
      drawLine(grid, color, x, y, x + width - 1, y, size);
      drawLine(grid, color, x, y + height - 1, x + width - 1, y + height - 1, size);
      drawLine(grid, color, x, y, x, y + height - 1, size);
      drawLine(grid, color, x + width - 1, y, x + width - 1, y + height - 1, size);
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

function seasonArtNameFor(view) {
  const label = String(view.label || "").toLowerCase();
  if (label.includes("advent")) return "season-advent";
  if (label.includes("christmas")) return "season-christmas";
  if (label.includes("epiphany")) return "season-epiphany";
  if (label.includes("ash wednesday") || label.includes("lent")) return "season-lent";
  if (label === "holy week") return "season-holy-week";
  if (label.includes("easter")) return "season-easter";
  if (label === "the day of pentecost") return "season-pentecost";
  if (label === "trinity sunday" || label.includes("proper")) return "season-ordinary";
  return null;
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
    if (weekday === 1) return "holy-monday";
    if (weekday === 2) return "holy-tuesday";
    if (weekday === 3) return "holy-wednesday";
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
  if (APOSTLE_FEASTS.has(feast)) return "apostle";
  if (/\bMartyrs?\b/.test(feast)) return "martyr";
  const namesSaints = /\bSt\.|Saints?'?\b/.test(feast);
  if (namesSaints && !OBVIOUS_SAINT_SYMBOLS.has(feast) && feast !== "All Saints' Day") return "saint";
  return `feast:${feast}`;
}

export function artNameFor(view) {
  return artNamesFor(view)[0] || null;
}

export function artNamesFor(view) {
  const weekday = weekdayFor(view);
  const season = seasonArtNameFor(view);
  const principal = principalArtNameFor(view);
  const names = [season, principal, feastArtNameFor(view.feast)].filter(Boolean);
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

function upscaleRows(rows, size = WEB_SIZE) {
  return Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => {
    const sourceY = Math.min(rows.length - 1, Math.floor((y * rows.length) / size));
    const sourceX = Math.min(rows[sourceY].length - 1, Math.floor((x * rows[sourceY].length) / size));
    return rows[sourceY][sourceX];
  }).join(""));
}

export function webArtRows(name) {
  const spec = WEB_ICON_SPECS[name];
  if (spec) return rowsForSpec(spec, WEB_SIZE);
  return upscaleRows(artRows(name));
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

function createSvgArt(name) {
  const namespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(namespace, "svg");
  const feast = name.startsWith("feast:") ? name.slice("feast:".length) : name;
  svg.setAttribute("class", "pixel-art liturgical-icon");
  svg.setAttribute("viewBox", `0 0 ${WEB_SIZE} ${WEB_SIZE}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `${feast} liturgical pixel art`);
  svg.setAttribute("shape-rendering", "crispEdges");

  webArtRows(name).forEach((row, y) => {
    let start = 0;
    while (start < row.length) {
      const pixel = row[start];
      if (pixel === ".") {
        start += 1;
        continue;
      }
      let end = start + 1;
      while (end < row.length && row[end] === pixel) end += 1;
      const rectangle = document.createElementNS(namespace, "rect");
      rectangle.setAttribute("x", String(start));
      rectangle.setAttribute("y", String(y));
      rectangle.setAttribute("width", String(end - start));
      rectangle.setAttribute("height", "1");
      rectangle.setAttribute("class", pixel === "R" ? "icon-red" : "icon-ink");
      svg.append(rectangle);
      start = end;
    }
  });
  return svg;
}

export function renderPixelArtStack(container, view) {
  const names = artNamesFor(view);
  const icons = names.map(createSvgArt);
  container.dataset.count = String(icons.length);
  container.replaceChildren(...icons);
}
