

export interface Theme {
  name: string;
  properties: Record<string, string>;
}

export const vibrantDarkTheme: Theme = {
  name: 'Vibrant Dark',
  properties: {
    '--color-background': '#111827', // gray-900
    '--color-foreground': '#F9FAFB', // gray-50
    '--color-muted-foreground': '#9CA3AF', // gray-400
    '--color-primary': '#14B8A6', // teal-500
    '--color-primary-hover': '#0D9488', // teal-600
    '--color-primary-foreground': '#FFFFFF',
    '--color-secondary': '#1F2937', // gray-800
    '--color-secondary-hover': '#374151', // gray-700
    '--color-secondary-foreground': '#F9FAFB', // gray-50
    '--color-accent': '#EC4899', // pink-500
    '--color-border': '#374151', // gray-700
    '--color-border-hover': '#4B5563', // gray-600
    '--color-card': '#1F2937', // gray-800
    '--color-card-foreground': '#F9FAFB', // gray-50
    '--color-destructive': '#F43F5E', // rose-500
    '--color-destructive-foreground': '#FFFFFF',
    '--color-info': '#38BDF8', // sky-400
    '--color-warning': '#FACC15', // yellow-400
    '--color-topic-progress': '#EF4444', 
    '--color-resource-tag': 'rgba(20, 184, 166, 0.1)',
    '--color-resource-tag-text': '#14B8A6',
    '--color-completed-check': 'var(--color-primary)',
    '--color-primary-glow': 'rgba(20, 184, 166, 0.4)',
    '--font-sans': "'Poppins', sans-serif",
    '--font-serif': "'Poppins', sans-serif",
    '--project-card-border-glow': 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(20, 184, 166, 0.4),rgba(31, 41, 55, 0))',
    '--gradient-primary-accent': 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
  }
};

export const blackAndWhiteTheme: Theme = {
  name: 'Minimalist B&W',
  properties: {
    '--color-background': '#FFFFFF',
    '--color-foreground': '#191919',
    '--color-muted-foreground': '#7A7A7A',
    '--color-primary': '#191919',
    '--color-primary-hover': '#333333',
    '--color-primary-foreground': '#FFFFFF',
    '--color-secondary': '#F7F7F5',
    '--color-secondary-hover': '#EAEAEA',
    '--color-secondary-foreground': '#191919',
    '--color-accent': '#333333',
    '--color-border': '#EAEAEA',
    '--color-border-hover': '#DDDDDD',
    '--color-card': '#FFFFFF',
    '--color-card-foreground': '#191919',
    '--color-destructive': '#E03E3E',
    '--color-destructive-foreground': '#FFFFFF',
    '--color-info': '#2E6ECF',
    '--color-warning': '#F5A623',
    '--color-primary-glow': 'rgba(17, 17, 17, 0.2)',
    '--font-sans': "'Poppins', sans-serif",
    '--font-serif': "'Poppins', sans-serif",
    '--project-card-border-glow': 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(17, 17, 17, 0.2),rgba(255, 255, 255, 0))',
    '--gradient-primary-accent': 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
  }
};

export const gfgTheme: Theme = {
  name: 'GeeksForGeeks',
  properties: {
    '--color-background': '#FFFFFF',
    '--color-foreground': '#333333',
    '--color-muted-foreground': '#555555',
    '--color-primary': '#047857', // emerald-700
    '--color-primary-hover': '#059669', // emerald-600
    '--color-primary-foreground': '#FFFFFF',
    '--color-secondary': '#F3F4F6', // gray-100
    '--color-secondary-hover': '#E5E7EB', // gray-200
    '--color-secondary-foreground': '#1F2937',
    '--color-accent': '#f59e0b', // amber-500
    '--color-border': '#E5E7EB', // gray-200
    '--color-border-hover': '#D1D5DB', // gray-300
    '--color-card': '#FFFFFF',
    '--color-card-foreground': '#333333',
    '--color-destructive': '#DC2626', // red-600
    '--color-destructive-foreground': '#FFFFFF',
    '--color-info': '#3B82F6', // blue-500
    '--color-warning': '#F59E0B', // amber-500
    '--color-topic-progress': '#EF4444', 
    '--color-resource-tag': '#D1FAE5', // green-100
    '--color-resource-tag-text': '#065F46', // green-800
    '--color-completed-check': '#047857', // primary green
    '--bg-pattern': 'none',
    '--color-primary-glow': 'rgba(4, 120, 87, 0.3)',
    '--font-sans': "'Poppins', sans-serif",
    '--font-serif': "'Poppins', sans-serif",
    '--project-card-border-glow': 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(4, 120, 87, 0.4),rgba(255, 255, 255, 0))',
    '--gradient-primary-accent': 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
  }
};

export const notionDarkTheme: Theme = {
  name: 'Notion Dark',
  properties: {
    '--color-background': '#191919',
    '--color-foreground': '#E2E2E2',
    '--color-muted-foreground': '#9B9A97',
    '--color-primary': '#2E6ECF', // A subtle blue
    '--color-primary-hover': '#4A80D6',
    '--color-primary-foreground': '#FFFFFF',
    '--color-secondary': '#262626',
    '--color-secondary-hover': '#333333',
    '--color-secondary-foreground': '#E2E2E2',
    '--color-accent': '#EB5757', // A subtle red for destructive actions
    '--color-border': '#3D3D3D',
    '--color-border-hover': '#555555',
    '--color-card': '#262626',
    '--color-card-foreground': '#E2E2E2',
    '--color-destructive': '#EB5757',
    '--color-destructive-foreground': '#FFFFFF',
    '--color-info': '#38BDF8',
    '--color-warning': '#FACC15',
    '--color-topic-progress': '#EF4444',
    '--color-resource-tag': 'rgba(46, 110, 207, 0.1)',
    '--color-resource-tag-text': '#2E6ECF',
    '--color-completed-check': 'var(--color-primary)',
    '--color-primary-glow': 'rgba(46, 110, 207, 0.2)',
    '--font-sans': "'Poppins', sans-serif",
    '--font-serif': "'Poppins', sans-serif",
    '--project-card-border-glow': 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(46, 110, 207, 0.3),rgba(38, 38, 38, 0))',
    '--gradient-primary-accent': 'linear-gradient(90deg, var(--color-primary), #4A80D6)',
  }
};

export const allThemes: Theme[] = [blackAndWhiteTheme, vibrantDarkTheme, gfgTheme, notionDarkTheme];
