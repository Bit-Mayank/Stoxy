import React, { useContext, useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { UserPreferencesContext } from '../../context/UserPreferences';

const SearchBar = ({ placeholder = "Search here...", onSearch, onClear }) => {
    const { theme } = useContext(UserPreferencesContext);
    const styles = getStyles(theme);
    const [searchText, setSearchText] = useState('');

    const handleSearchChange = (text) => {
        setSearchText(text);
        if (onSearch) {
            onSearch(text);
        }
    };

    const handleClear = () => {
        setSearchText('');
        if (onClear) {
            onClear();
        }
        if (onSearch) {
            onSearch('');
        }
    };

    return (
        <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder={placeholder}
                    placeholderTextColor={theme === 'dark' ? '#8e8e93' : '#6d6d70'}
                    value={searchText}
                    onChangeText={handleSearchChange}
                    returnKeyType="search"
                    onSubmitEditing={() => onSearch && onSearch(searchText)}
                />
                {searchText.length > 0 && (
                    <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                        <View style={styles.clearIcon}>
                            <View style={styles.clearIconLine1} />
                            <View style={styles.clearIconLine2} />
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const getStyles = (theme) => {
    const isDark = theme === 'dark';

    return StyleSheet.create({
        searchContainer: {
            paddingHorizontal: 0,
            paddingVertical: 0,
            backgroundColor: 'transparent',
        },
        searchInputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            // backgroundColor: isDark ? '#2c2c2e' : '#f2f2f7',
            borderRadius: 12,
            paddingHorizontal: 8,
            borderWidth: 1,
            borderColor: isDark ? '#3a3a3c' : '#e5e5e7',
        },
        searchInput: {
            flex: 1,
            fontSize: 16,
            color: isDark ? '#ffffff' : '#000000',
            height: "100%",
        },
        clearButton: {
            padding: 4,
            marginLeft: 8,
        },
        clearIcon: {
            width: 16,
            height: 16,
            position: 'relative',
            justifyContent: 'center',
            alignItems: 'center',
        },
        clearIconLine1: {
            position: 'absolute',
            width: 12,
            height: 1.5,
            backgroundColor: isDark ? '#8e8e93' : '#6d6d70',
            transform: [{ rotate: '45deg' }],
        },
        clearIconLine2: {
            position: 'absolute',
            width: 12,
            height: 1.5,
            backgroundColor: isDark ? '#8e8e93' : '#6d6d70',
            transform: [{ rotate: '-45deg' }],
        },
    });
};

export default SearchBar;
