import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserPreferencesContext = createContext({
    theme: 'light',
    setTheme: () => { },
});

export const UserPreferences = ({ children }) => {
    const [theme, setThemeState] = useState('dark');

    // Load preferences on mount
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem('user_theme');
                if (storedTheme) setThemeState(storedTheme)
            } catch (error) {
                console.error('Failed to load user preferences:', error);
            }
        };
        loadPreferences();
    }, []);

    // Save theme
    const setTheme = async (value) => {
        try {
            setThemeState(value);
            await AsyncStorage.setItem('user_theme', value);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };


    return (
        <UserPreferencesContext.Provider value={{ theme, setTheme }}>
            {children}
        </UserPreferencesContext.Provider>
    );
};
