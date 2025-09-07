import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { UserPreferencesContext } from '../../context/UserPreferences';
import StockCard from './StockCard';

const StockSection = ({ title, stocks, onViewAll, onStockPress, hideHeader = false }) => {
    const { theme } = useContext(UserPreferencesContext);
    const styles = getStyles(theme);

    // Function to create rows of 2 items each
    const createRows = (data) => {
        const rows = [];
        for (let i = 0; i < data.length; i += 2) {
            rows.push(data.slice(i, i + 2));
        }
        return rows;
    };

    const stockRows = createRows(stocks);

    return (
        <View style={styles.sectionContainer}>
            {!hideHeader && (
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    {onViewAll && (
                        <TouchableOpacity onPress={onViewAll}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <View style={styles.gridContainer}>
                {stockRows.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {row.map((stock) => (
                            <View key={stock.id} style={styles.cardWrapper}>
                                <StockCard stock={stock} onPress={onStockPress} />
                            </View>
                        ))}
                        {/* Add empty space if row has only 1 item */}
                        {row.length === 1 && <View style={styles.cardWrapper} />}
                    </View>
                ))}
            </View>
        </View>
    );
};

const getStyles = (theme) => {
    const isDark = theme === 'dark';

    return StyleSheet.create({
        sectionContainer: {
            marginVertical: 16,
            paddingHorizontal: 20,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        sectionTitle: {
            fontSize: 22,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
        },
        viewAllText: {
            fontSize: 16,
            color: '#007AFF',
            fontWeight: '600',
        },
        gridContainer: {
            paddingBottom: 8,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
        },
        cardWrapper: {
            flex: 1,
            marginHorizontal: 4,
            maxWidth: '48%',
        },
    });
};

export default StockSection;
