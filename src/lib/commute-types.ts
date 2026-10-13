export type CommuteType =
  | "office"
  | "university"
  | "women"
  | "society"
  | "school"
  | "intercity"
  | "airport"
  | "event";

export type CommuteTypeMeta = {
  id: CommuteType;
  title: string;
  short: string;
  blurb: string;
  /** Entrance hero punch line */
  heroLine: string;
  cta: string;
  hintFrom: string;
  hintTo: string;
  recurringDefault: boolean;
  womenOnly: boolean;
  examples: string[];
  /** CSS gradient for entrance background */
  tone: string;
};

export const COMMUTE_TYPES: CommuteTypeMeta[] = [
  {
    id: "office",
    title: "Office commute",
    short: "Office",
    heroLine: "Same building. Different areas. One HumSafar.",
    blurb:
      "Arfa Tower, Gulberg offices — colleagues already on your road, every morning.",
    cta: "Find office HumSafar",
    hintFrom: "e.g. Bahria Town",
    hintTo: "e.g. Arfa Tower",
    recurringDefault: true,
    womenOnly: false,
    examples: ["Arfa Tower", "DHA offices", "Gulberg"],
    tone: "linear-gradient(145deg, #164c39 0%, #1f6b4f 45%, #0f1a17 100%)",
  },
  {
    id: "university",
    title: "University",
    short: "Uni",
    heroLine: "Campus every day. Cost shared.",
    blurb:
      "LUMS, UET, PU — students with the same timetable, lighter on the pocket.",
    cta: "Find uni HumSafar",
    hintFrom: "e.g. Johar Town",
    hintTo: "e.g. LUMS",
    recurringDefault: true,
    womenOnly: false,
    examples: ["LUMS", "UET", "PU"],
    tone: "linear-gradient(145deg, #1a3d5c 0%, #2a6f8f 50%, #0f1a17 100%)",
  },
  {
    id: "women",
    title: "Women-only",
    short: "Women",
    heroLine: "Verified women. Safer seats.",
    blurb:
      "Women car owners and riders only — for when safety comes first.",
    cta: "Find women HumSafar",
    hintFrom: "e.g. DHA",
    hintTo: "e.g. Gulberg",
    recurringDefault: true,
    womenOnly: true,
    examples: ["Office", "University"],
    tone: "linear-gradient(145deg, #4a2c5a 0%, #6b3f86 50%, #1a1220 100%)",
  },
  {
    id: "society",
    title: "Society / mohalla",
    short: "Society",
    heroLine: "Neighbours on the same road.",
    blurb:
      "Bahria, DHA, Johar Town — people from your society heading out together.",
    cta: "Find society HumSafar",
    hintFrom: "e.g. Bahria Phase 4",
    hintTo: "e.g. Gulberg",
    recurringDefault: true,
    womenOnly: false,
    examples: ["Bahria", "DHA", "Johar"],
    tone: "linear-gradient(145deg, #3d4a28 0%, #5a6b3a 50%, #141a10 100%)",
  },
  {
    id: "school",
    title: "School pick & drop",
    short: "School",
    heroLine: "Parents take turns. App keeps the roster.",
    blurb:
      "WhatsApp groups, but clearer — whose turn is tomorrow morning.",
    cta: "Set up school HumSafar",
    hintFrom: "e.g. Society gate",
    hintTo: "e.g. Beaconhouse",
    recurringDefault: true,
    womenOnly: false,
    examples: ["Drop", "Pickup"],
    tone: "linear-gradient(145deg, #5c4a1a 0%, #8a6b20 45%, #1a1508 100%)",
  },
  {
    id: "intercity",
    title: "Weekly / inter-city",
    short: "Inter-city",
    heroLine: "Lahore to home. Seats shared.",
    blurb:
      "Islamabad, Multan — weekend trips without booking a whole car alone.",
    cta: "Find inter-city HumSafar",
    hintFrom: "e.g. Lahore",
    hintTo: "e.g. Islamabad",
    recurringDefault: false,
    womenOnly: false,
    examples: ["LHE → ISB", "LHE → MUX"],
    tone: "linear-gradient(145deg, #1e3a4c 0%, #2d5a6e 50%, #0a1218 100%)",
  },
  {
    id: "airport",
    title: "Airport",
    short: "Airport",
    heroLine: "Same flight window. Shared ride.",
    blurb: "Head to Allama Iqbal with others leaving around your time.",
    cta: "Find airport HumSafar",
    hintFrom: "e.g. Gulberg",
    hintTo: "Allama Iqbal Airport",
    recurringDefault: false,
    womenOnly: false,
    examples: ["Departures", "Arrivals"],
    tone: "linear-gradient(145deg, #1a2a40 0%, #2a4570 50%, #0a1018 100%)",
  },
  {
    id: "event",
    title: "Events",
    short: "Event",
    heroLine: "One event. One direction. Many seats.",
    blurb: "Match, wedding, concert — go together, split the cost.",
    cta: "Find event HumSafar",
    hintFrom: "e.g. Your area",
    hintTo: "e.g. Gaddafi Stadium",
    recurringDefault: false,
    womenOnly: false,
    examples: ["Cricket", "Wedding", "Concert"],
    tone: "linear-gradient(145deg, #4a2818 0%, #8a4520 50%, #140c08 100%)",
  },
];

export function commuteMeta(id: CommuteType): CommuteTypeMeta {
  return COMMUTE_TYPES.find((c) => c.id === id) || COMMUTE_TYPES[0];
}
