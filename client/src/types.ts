export interface KanbanCard {
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
  columns: KanbanColumn[];
}

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  tags: string[];
}

export interface CalendarEvent {
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

export interface DashboardPayload {
  kanban: KanbanBoard | null;
  tasks: TaskItem[];
  calendar: CalendarEvent[];
  notes: NoteItem[];
  timers: TimerItem[];
  weather: WeatherData | null;
  photos: string[];
  lastUpdated: string;
}
