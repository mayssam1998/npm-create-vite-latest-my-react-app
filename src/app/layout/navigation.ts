import {
  Bot,
  BookOpen,
  Briefcase,
  ClipboardList,
  Database,
  Eye,
  FilePen,
  FolderOpen,
  GitCompare,
  GitMerge,
  Inbox,
  LayoutDashboard,
  ListTodo,
  Map,
  MessageSquare,
  Network,
  Newspaper,
  Phone,
  ScanFace,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { loadCaseManagementPage } from '../router/lazyPages';

export const SIDEBAR_ID = 'app-sidebar';

export interface NavItem {
  /** Key in the `common` namespace. */
  labelKey: string;
  to: string;
  icon: LucideIcon;
  /** Starts loading the route chunk on hover/focus — prefetch on intent. */
  prefetch?: () => Promise<unknown>;
  /** Shown but not navigable yet. */
  isComingSoon?: boolean;
}

export interface NavSection {
  labelKey: string;
  items: readonly NavItem[];
}

export const NAV_SECTIONS: readonly NavSection[] = [
  {
    labelKey: 'nav.sections.workspace',
    items: [
      { labelKey: 'nav.caseManagement', to: '/cases', icon: Briefcase, prefetch: loadCaseManagementPage },
      { labelKey: 'nav.draftCases', to: '/draft-cases', icon: FilePen },
      { labelKey: 'nav.myWork', to: '/my-work', icon: ListTodo },
      { labelKey: 'nav.aiAssistant', to: '/ai-assistant', icon: Bot },
      { labelKey: 'nav.projects', to: '/projects', icon: FolderOpen },
      { labelKey: 'nav.promptLibrary', to: '/prompt-library', icon: BookOpen },
    ],
  },
  {
    labelKey: 'nav.sections.dataEntry',
    items: [
      { labelKey: 'nav.entities', to: '/entities', icon: Users },
      { labelKey: 'nav.caseIntake', to: '/case-intake', icon: Inbox },
      { labelKey: 'nav.referenceDatabases', to: '/reference-databases', icon: Database },
      { labelKey: 'nav.entityResolution', to: '/entity-resolution', icon: GitMerge },
      { labelKey: 'nav.dailyBulletin', to: '/daily-bulletin', icon: Newspaper },
      { labelKey: 'nav.reconcileFaces', to: '/reconcile-faces', icon: ScanFace, isComingSoon: true },
      { labelKey: 'nav.etl', to: '/etl', icon: Workflow, isComingSoon: true },
    ],
  },
  {
    labelKey: 'nav.sections.analyst',
    items: [
      { labelKey: 'nav.workspaceManagement', to: '/workspaces', icon: LayoutDashboard },
      { labelKey: 'nav.compareRecords', to: '/compare-records', icon: GitCompare },
      { labelKey: 'nav.messages', to: '/messages', icon: MessageSquare },
      { labelKey: 'nav.mapAnalysis', to: '/map-analysis', icon: Map },
      { labelKey: 'nav.watchlists', to: '/watchlists', icon: Eye },
      { labelKey: 'nav.linkAnalysis', to: '/link-analysis', icon: Network },
    ],
  },
  {
    labelKey: 'nav.sections.interception',
    items: [
      { labelKey: 'nav.callAnalysis', to: '/call-analysis', icon: Phone },
      { labelKey: 'nav.reportRegistry', to: '/report-registry', icon: ClipboardList },
    ],
  },
];
