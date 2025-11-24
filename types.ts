export enum ViewState {
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  BUILDER = 'BUILDER',
  SCANNER = 'SCANNER',
  BENCHMARK = 'BENCHMARK',
  FORUM = 'FORUM',
  SAVED_BUILDS = 'SAVED_BUILDS'
}

export enum ComponentType {
  CPU = 'Procesador',
  GPU = 'Tarjeta Gráfica',
  MOTHERBOARD = 'Placa Madre',
  RAM = 'Memoria RAM',
  STORAGE = 'Almacenamiento',
  PSU = 'Fuente de Poder',
  CASE = 'Gabinete'
}

export interface PCComponent {
  id: string;
  name: string;
  type: ComponentType;
  price: number;
  specs: string;
  image?: string;
}

export interface Build {
  id: string;
  name: string;
  components: PCComponent[];
  totalPrice: number;
  date?: string;
  compatibility?: {
    compatible: boolean;
    issues: string[];
  };
}

export interface User {
  username: string;
  isGuest: boolean;
  avatar?: string;
}

export interface ForumPost {
  id: string;
  author: string;
  authorAvatar?: string;
  title: string;
  description: string;
  build: Build;
  likes: number;
  comments: number;
  createdAt: string;
  aiRating?: number;
}