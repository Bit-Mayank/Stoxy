import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { UserPreferencesContext } from '../../context/UserPreferences';
import TrendUp from '../../../assets/StockCardIcons/TrendUp';
import TrendDown from '../../../assets/StockCardIcons/TrendDown';

const StockCard = ({ stock, onPress }) => {
    const { theme } = useContext(UserPreferencesContext);
    const styles = getStyles(theme);

    // Parse values from string to number
    const price = parseFloat(stock.price);
    const change = parseFloat(stock.change_amount);
    const percent = parseFloat((stock.change_percentage || '').replace('%', ''));
    const isPositive = change >= 0;

    const formatPrice = (price) => {
        if (isNaN(price)) return '-';
        return `$${price.toFixed(2)}`;
    };

    const formatChangePercent = (percent) => {
        if (isNaN(percent)) return '-';
        const sign = percent >= 0 ? '+' : '';
        return `${sign}${percent.toFixed(2)}%`;
    };

    return (
        <TouchableOpacity style={styles.cardContainer} onPress={() => onPress && onPress(stock)}>
            {/* Top section with icon and ticker */}
            <View style={styles.topSection}>
                <View style={[styles.stockIcon, { backgroundColor: stock.color || '#2c3e50' }]}>
                    <Text style={styles.iconText}>{stock.ticker ? stock.ticker.charAt(0) : 'S'}</Text>
                </View>
                <Text style={styles.stockName} numberOfLines={1}>
                    {stock.ticker}
                </Text>
            </View>

            {/* Bottom section with price and change */}
            <View style={styles.bottomSection}>
                <View style={styles.priceContainer}>
                    <Text style={styles.stockPrice}>
                        {formatPrice(price)}
                    </Text>
                </View>
                <View>
                    <View style={styles.changeIconContainer}>
                        <Text style={[styles.changeIcon, isPositive ? styles.positiveIcon : styles.negativeIcon]}>
                            {isPositive ? <TrendUp /> : <TrendDown />}
                        </Text>
                        <Text style={[styles.stockChangePercent, isPositive ? styles.positiveChange : styles.negativeChange]}>
                            {isPositive ? '+' : ''}{change} ({formatChangePercent(percent)})
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const getStyles = (theme) => {
    const isDark = theme === 'dark';

    return StyleSheet.create({
        cardContainer: {
            backgroundColor: isDark ? '#2c2c2e' : '#ffffff',
            borderRadius: 16,
            padding: 16,
            marginBottom: 12,
            shadowColor: isDark ? '#000000' : '#000000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 8,
            elevation: 4,
            borderWidth: isDark ? 1 : 0,
            borderColor: isDark ? '#3a3a3c' : 'transparent',
            minHeight: 140,
            width: '100%',
            flex: 1,
        },
        topSection: {
            alignItems: 'flex-start',
            marginBottom: 16,
        },
        stockIcon: {
            width: 48,
            height: 48,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
        },
        iconText: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#ffffff',
        },
        stockName: {
            fontSize: 16,
            fontWeight: '600',
            color: isDark ? '#ffffff' : '#000000',
            lineHeight: 20,
        },
        bottomSection: {
            flexDirection: 'column',
            marginTop: 'auto',
        },
        priceContainer: {
            flex: 1,
        },
        stockPrice: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
        },
        changeIconContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        changeIcon: {
            fontSize: 14,
            fontWeight: 'bold',
            marginRight: 4,
        },
        stockChangePercent: {
            fontSize: 14,
            fontWeight: '600',
        },
        positiveChange: {
            color: '#34c759',
        },
        negativeChange: {
            color: '#ff3b30',
        },
        positiveIcon: {
            color: '#34c759',
        },
        negativeIcon: {
            color: '#ff3b30',
        },
    });
};

export default StockCard;
