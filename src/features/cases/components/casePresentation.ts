import { FileText, Flag, FlagOff, Inbox, Radio, type LucideIcon } from 'lucide-react';
import type { BadgeTone } from '@/shared/ui/Badge';
import type { CasePriority, CaseSource, CaseStatus } from '../model/case';

// Colour and icon choices come from mappings, never conditionals in JSX. Icon maps are
// exported as module-level records: the React Compiler can see a record lookup is a static
// component, but not the return value of a function.

const STATUS_TONE: Record<CaseStatus, BadgeTone> = {
  new: 'statusNew',
  open: 'statusOpen',
  inProgress: 'statusProgress',
  pendingSignatureIn: 'statusPending',
  pendingSignatureOut: 'statusPending',
  closed: 'statusClosed',
};

const PRIORITY_TONE: Record<CasePriority, BadgeTone> = {
  urgent: 'priorityUrgent',
  high: 'priorityHigh',
  normal: 'priorityNormal',
  low: 'priorityLow',
};

export const PRIORITY_ICON: Record<CasePriority, LucideIcon> = {
  urgent: Flag,
  high: Flag,
  normal: FlagOff,
  low: FlagOff,
};

export const SOURCE_ICON: Record<CaseSource, LucideIcon> = {
  bulletin: FileText,
  intake: Inbox,
  interception: Radio,
};

/** Free-text tags get a stable colour derived from their text. */
const TAG_TONES: readonly BadgeTone[] = ['amber', 'red', 'blue', 'violet', 'teal'];

export function getStatusTone(status: CaseStatus) {
  return STATUS_TONE[status];
}

export function getPriorityTone(priority: CasePriority) {
  return PRIORITY_TONE[priority];
}

export function getTagTone(tag: string): BadgeTone {
  let hash = 0;
  for (const char of tag) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return TAG_TONES[hash % TAG_TONES.length];
}
