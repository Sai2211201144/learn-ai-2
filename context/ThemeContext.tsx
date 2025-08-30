

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Theme, blackAndWhiteTheme, allThemes } from '../styles/themes';

interface ThemeContextType {
    theme: Theme;
    setTheme: (themeName: string) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getInitialTheme = (): Theme => {
    try {
        const savedThemeName = localStorage.getItem('learnai-theme');
        if (savedThemeName) {
            return allThemes.find(t => t.name === savedThemeName) || blackAndWhiteTheme;
        }
    } catch (e) {
        console.error("Could not read theme from local storage", e);
    }
    return blackAndWhiteTheme; // Default theme
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, _setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        const root = document.documentElement;
        
        // Remove old theme classes
        allThemes.forEach(t => document.body.classList.remove(t.name.toLowerCase().replace(/\s+/g, '-')));
        
        const newThemeClass = theme.name.toLowerCase().replace(/\s+/g, '-');
        document.body.className = newThemeClass;

        for (const [key, value] of Object.entries(theme.properties)) {
            root.style.setProperty(key, value);
        }
        
        // Add a "light" or "dark" class for simple CSS targeting
        if (['Vibrant Dark', 'Notion Dark'].includes(theme.name)) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }

    }, [theme]);

    const setTheme = (themeName: string) => {
        const newTheme = allThemes.find(t => t.name === themeName);
        if (newTheme) {
            _setTheme(newTheme);
            try {
                localStorage.setItem('learnai-theme', newTheme.name);
            } catch (e) {
                console.error("Could not save theme to local storage", e);
            }
        }
    };

    const isDark = useMemo(() => ['Vibrant Dark', 'Notion Dark'].includes(theme.name), [theme]);

    const value = useMemo(() => ({ theme, setTheme, isDark }), [theme, isDark]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
