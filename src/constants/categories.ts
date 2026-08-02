export type CategoryId =
  | 'cuidado_ancianos'
  | 'limpieza_hogar'
  | 'limpieza_oficinas'
  | 'jardineria'
  | 'plomeria'
  | 'electricidad'
  | 'niñeria';

export interface Category {
  id: CategoryId;
  label: string;
  icon: string; // emoji, avoids pulling in an icon font dependency
  description: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'cuidado_ancianos',
    label: 'Cuidado de ancianos',
    icon: '🧓',
    description: 'Acompañamiento y cuidado de personas mayores',
  },
  {
    id: 'limpieza_hogar',
    label: 'Limpieza de hogar',
    icon: '🧹',
    description: 'Limpieza de casas y apartamentos',
  },
  {
    id: 'limpieza_oficinas',
    label: 'Limpieza de oficinas',
    icon: '🏢',
    description: 'Limpieza de oficinas y locales comerciales',
  },
  {
    id: 'jardineria',
    label: 'Jardinería y podado',
    icon: '🌳',
    description: 'Podado de jardines y mantenimiento de espacios verdes',
  },
  {
    id: 'plomeria',
    label: 'Plomería',
    icon: '🔧',
    description: 'Reparaciones e instalaciones de plomería',
  },
  {
    id: 'electricidad',
    label: 'Electricidad',
    icon: '💡',
    description: 'Instalaciones y reparaciones eléctricas',
  },
  {
    id: 'niñeria',
    label: 'Niñería',
    icon: '🧸',
    description: 'Cuidado de niños y niñeras',
  },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat.id] = cat;
    return acc;
  },
  {} as Record<CategoryId, Category>,
);

// Departamentos de Uruguay, usados como filtro de zona
export const DEPARTAMENTOS_UY = [
  'Montevideo',
  'Canelones',
  'Maldonado',
  'Colonia',
  'San José',
  'Rocha',
  'Salto',
  'Paysandú',
  'Rivera',
  'Tacuarembó',
  'Artigas',
  'Cerro Largo',
  'Durazno',
  'Flores',
  'Florida',
  'Lavalleja',
  'Río Negro',
  'Soriano',
  'Treinta y Tres',
] as const;

export type Departamento = (typeof DEPARTAMENTOS_UY)[number];
