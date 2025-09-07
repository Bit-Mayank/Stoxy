import React, { useContext } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { UserPreferencesContext } from '../context/UserPreferences';

const ThemeToggleButton = () => {
    const { theme, setTheme } = useContext(UserPreferencesContext);
    const styles = getStyles(theme);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    return (
        <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleTheme}
            activeOpacity={0.8}
            accessibilityLabel={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            accessibilityHint="Toggles between light and dark theme"
        >
            <Text style={styles.iconText}>
                {theme === 'light' ? '🌜' : '🌞'}
            </Text>
        </TouchableOpacity>
    );
};

const getStyles = (theme) => {
    const isDark = theme === 'dark';

    return StyleSheet.create({
        toggleButton: {
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: isDark ? '#2c2c2e' : '#f0f0f0',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: isDark ? '#007AFF' : '#007AFF',
            shadowColor: isDark ? '#000000' : '#000000',
            shadowOffset: {
                width: 0,
                height: 3,
            },
            shadowOpacity: isDark ? 0.4 : 0.15,
            shadowRadius: 6,
            elevation: 4,
            // Add a subtle transition effect
            transform: [{ scale: 1 }],
        },
        iconText: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDark ? '#007AFF' : '#007AFF',
            // Add letter spacing for better appearance
            letterSpacing: 0.5,
        },
    });
};

export default ThemeToggleButton;
