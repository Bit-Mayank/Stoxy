import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserPreferencesContext } from '../../context/UserPreferences';
import SearchBar from './SearchBar';
import ThemeToggleButton from '../ThemeToggleButton';

const Header = ({ title = "Stoxy", onSearch, onClear, placeholder = "Search stocks..." }) => {
    const { theme } = useContext(UserPreferencesContext);
    const styles = getStyles(theme);

    return (
        <View style={styles.headerContainer}>
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>{title}</Text>
                <ThemeToggleButton />
                {/* 
                <View style={styles.searchContainer}>
                    <SearchBar
                        placeholder={placeholder}
                        onSearch={onSearch}
                        onClear={onClear}
                    />
                </View> */}
            </View>
        </View>
    );
};

const getStyles = (theme) => {
    const isDark = theme === 'dark';

    return StyleSheet.create({
        headerContainer: {
            paddingLeft: 20,
            paddingRight: 12,
            paddingVertical: 16,
            backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#2c2c2e' : '#e5e5e7',
        },
        headerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
            flex: 0,
            marginRight: 16,
        },
        searchContainer: {
            flex: 1,
            maxWidth: '70%',
        },
    });
};

export default Header;
