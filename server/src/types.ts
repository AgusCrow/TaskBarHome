/** Referencia a una línea concreta de un archivo de la bóveda (para escribir de vuelta). */
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

export interface TaskItem extends LineRef {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  completedDate?: string;
  tags: string[];
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
