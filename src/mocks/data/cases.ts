/**
 * Dummy data standing in for the backend until it exists. These are the *server's* rows
 * (ids, not joined names) — the handler joins and shapes them like a real API would.
 * Deliberately independent of src/features: the client must validate what it receives.
 * Generated from a fixed seed, so every reload shows the same 79 cases.
 */

export type MockStatus = 'new' | 'open' | 'inProgress' | 'pendingSignatureIn' | 'pendingSignatureOut' | 'closed';
export type MockPriority = 'urgent' | 'high' | 'normal' | 'low';
export type MockSource = 'bulletin' | 'intake' | 'interception';

export interface MockReference {
  id: string;
  name: string;
}

export interface MockCaseRow {
  id: string;
  reference: string;
  title: string;
  status: MockStatus;
  priority: MockPriority;
  typeId: string;
  sectionId: string;
  ownerId: string | null;
  dueDate: string;
  updatedAt: string;
  source: MockSource | null;
  isProcessed: boolean;
  tags: string[];
  tasks: { done: number; total: number };
}

export interface MockLinkedItemRow {
  id: string;
  title: string;
  status: MockStatus;
  sectionId: string;
  ownerId: string | null;
  dueDate: string;
  updatedAt: string;
}

export const MOCK_TYPES: MockReference[] = [
  { id: 'type-bulletin', name: 'Daily Bulletin' },
  { id: 'type-financial', name: 'Financial crime' },
  { id: 'type-other', name: 'Other / Unclassified' },
  { id: 'type-default', name: 'Default' },
  { id: 'type-ftp', name: 'FTP/Fax' },
  { id: 'type-narcotics', name: 'Narcotics' },
  { id: 'type-cyber', name: 'Cybercrime' },
];

export const MOCK_SECTIONS: MockReference[] = [
  { id: 'sec-cid', name: 'Criminal Investigation Division' },
  { id: 'sec-forensics', name: 'Forensics Laboratory' },
  { id: 'sec-traffic', name: 'Traffic & Vehicles' },
  { id: 'sec-missing', name: 'Missing Persons Desk' },
  { id: 'sec-cyber', name: 'Cybercrime Bureau' },
  { id: 'sec-interception', name: 'Interception Bureau' },
  { id: 'sec-financial', name: 'Financial Crimes Unit' },
  { id: 'sec-narcotics', name: 'Narcotics Bureau' },
  { id: 'sec-border', name: 'Border Control' },
];

export const MOCK_OWNERS: MockReference[] = [
  { id: 'user-michel', name: 'Michel' },
  { id: 'user-ali', name: 'Ali' },
  { id: 'user-rania', name: 'Rania' },
  { id: 'user-nadine', name: 'Nadine' },
  { id: 'user-karim', name: 'Karim' },
];

const TITLES = [
  'Bulletin 281/8 — Stolen Toyota Hilux recovered abandoned in Dekwaneh',
  'Bulletin 281/6 — Forged cheques worth USD 48,000 presented at a bank branch in Jounieh',
  'Bulletin 281/4 — Suspected narcotics handover outside a bar in Gemmayzeh',
  'Bulletin 281/2 — Burglary of a jewellery shop on Hamra Street; display cases emptied overnight',
  'Bulletin 281/1 — Captagon seizure at the Masnaa crossing: about 120,000 pills hidden in a fruit truck',
  'Armed robbery reported in London',
  'Missing person report — Christy Il Salem',
  'Identity theft complaint — Anna Lindqvist',
  'Request to identify subscriber of 03-4xx-xxx',
  'Phishing campaign impersonating a local bank',
  'Hit-and-run on the coastal highway near Byblos',
  'Counterfeit currency circulating in Tripoli markets',
  'Ransomware attack on a private clinic',
  'Smuggled fuel tanker intercepted in the Bekaa',
  'Fraudulent online car sales targeting expatriates',
  'Suspicious wire transfers flagged by a correspondent bank',
  'Vandalism of public property in Sidon old souk',
  'Unlicensed firearms found during a traffic stop',
  'Extortion attempt via social media accounts',
  'Lost passport reported at the airport',
  'Report on the intercepted traffic of a burner phone',
  'Cargo theft from a warehouse in the port area',
  'Cloned SIM cards used to bypass bank verification',
  'Placeholder',
];

const TAGS = ['Bulletin', 'Interpol', 'Financial', 'Vehicle', 'Narcotics', 'Cyber'];

const STATUS_WEIGHTS: [MockStatus, number][] = [
  ['pendingSignatureIn', 40],
  ['new', 10],
  ['open', 14],
  ['inProgress', 14],
  ['pendingSignatureOut', 8],
  ['closed', 14],
];

const PRIORITY_WEIGHTS: [MockPriority, number][] = [
  ['normal', 50],
  ['high', 20],
  ['urgent', 15],
  ['low', 15],
];

const CASE_COUNT = 79;
const DAY_MS = 86_400_000;

/** Deterministic PRNG (mulberry32), so the dummy data is stable across reloads. */
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

const random = createRandom(20261013);

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(random() * items.length)];
}

function pickWeighted<T>(weights: readonly [T, number][]): T {
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = random() * total;
  for (const [value, weight] of weights) {
    roll -= weight;
    if (roll < 0) return value;
  }
  return weights[weights.length - 1][0];
}

function randomInt(min: number, max: number) {
  return min + Math.floor(random() * (max - min + 1));
}

/** A calendar date `offsetDays` from today, as `YYYY-MM-DD` (UTC). */
export function isoDateFromToday(offsetDays: number) {
  return new Date(Date.now() + offsetDays * DAY_MS).toISOString().slice(0, 10);
}

function createCase(index: number): MockCaseRow {
  const title = TITLES[index % TITLES.length];
  const isBulletin = title.startsWith('Bulletin');
  const year = index % 9 === 0 ? 2025 : 2026;
  const total = randomInt(0, 4);

  return {
    id: `case-${String(index + 1).padStart(3, '0')}`,
    reference: `CASE-${year}-${String(170 - index * 2 + (year === 2025 ? 900 : 0)).padStart(4, '0')}`,
    title,
    status: pickWeighted(STATUS_WEIGHTS),
    priority: pickWeighted(PRIORITY_WEIGHTS),
    typeId: isBulletin ? 'type-bulletin' : pick(MOCK_TYPES).id,
    sectionId: isBulletin ? 'sec-cid' : pick(MOCK_SECTIONS).id,
    ownerId: random() < 0.15 ? null : pick(MOCK_OWNERS).id,
    dueDate: isoDateFromToday(randomInt(-40, 30)),
    updatedAt: isoDateFromToday(-randomInt(0, 30)),
    source: isBulletin ? 'bulletin' : random() < 0.2 ? pick(['intake', 'interception'] as const) : null,
    isProcessed: isBulletin && random() < 0.8,
    tags: isBulletin ? ['Bulletin'] : TAGS.filter(() => random() < 0.15).slice(0, 2),
    tasks: { done: randomInt(0, total), total },
  };
}

function createLinkedItems(row: MockCaseRow, index: number): MockLinkedItemRow[] {
  const count = index % 4 === 0 ? 0 : randomInt(1, 3);
  return Array.from({ length: count }, (_, itemIndex) => ({
    id: `${row.id}-link-${itemIndex + 1}`,
    title: `Report on the intercepted traffic of 7639${randomInt(1000, 9999)} between Sept ${itemIndex + 2} and Sept ${itemIndex + 3}, 2026`,
    status: itemIndex === 0 ? 'new' : 'open',
    sectionId: 'sec-interception',
    ownerId: random() < 0.6 ? null : pick(MOCK_OWNERS).id,
    dueDate: isoDateFromToday(randomInt(-5, 10)),
    updatedAt: isoDateFromToday(-randomInt(0, 5)),
  }));
}

export const MOCK_CASES: MockCaseRow[] = Array.from({ length: CASE_COUNT }, (_, index) => createCase(index));

export const MOCK_LINKED_ITEMS: Record<string, MockLinkedItemRow[]> = Object.fromEntries(
  MOCK_CASES.map((row, index) => [row.id, createLinkedItems(row, index)]),
);
