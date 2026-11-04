export interface LineRef {
  file: string;
  line: number;
  raw: string;
}

export interface KanbanCard extends LineRef {
  id: string;
  text: string;
  completed: boolean;
}

export interface KanbanColumn {
  id: string;
  name: string;
  cards: KanbanCard[];
}

export interface KanbanBoard {
  title: string;
  file: string;
  columns: KanbanColumn[];
}

export type TaskPriority = 'highest' | 'high' | 'medium' | 'low';

export interface TaskItem extends LineRef {
  id: string;
  text: string;
  completed: boolean;
  priority?: TaskPriority;
  dueDate?: string;
  scheduledDate?: string;
  startDate?: string;
  completedDate?: string;
  recurrence?: string;
  tags: string[];
  project?: string;
}

export interface CalendarEvent extends LineRef {
  id: string;
  title: string;
  date: string;
  time?: string;
}

export interface NoteSection {
  title: string;
  content: string;
}

export interface NoteItem {
  id: string;
  title: string;
  file: string;
  sections: NoteSection[];
  raw: string;
}

export interface TimerItem {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  endsAt: number | null;
}

export interface WeatherData {
  city: string;
  temperature: number;
  weatherCode: number;
  description: string;
  windSpeed: number;
  humidity?: number;
  forecast: {
    date: string;
    tempMax: number;
    tempMin: number;
    weatherCode: number;
  }[];
  updatedAt: string;
}

export interface DailyFocus {
  date: string;
  focus: string;
  energyScore?: number;
  focusQualityScore?: number;
  file?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  file: string;
  status: 'active' | 'complete' | string;
  type?: string;
  area?: string;
  tags: string[];
}

export interface WorkflowItem {
  id: string;
  name: string;
  path: string;
  findingsCount: number;
  lastOutput?: string;
}

export interface DashboardPayload {
  kanban: KanbanBoard | null;
  tasks: TaskItem[];
  calendar: CalendarEvent[];
  notes: NoteItem[];
  timers: TimerItem[];
  weather: WeatherData | null;
  photos: string[];
  dailyFocus: DailyFocus | null;
  projects: ProjectItem[];
  workflows: WorkflowItem[];
  lastUpdated: string;
}
