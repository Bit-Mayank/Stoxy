import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserPreferencesContext } from '../context/UserPreferences';
import { useWatchlist } from '../context/WatchlistContext';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 12;
const CARD_WIDTH = (width - (CARD_MARGIN * 4)) / 2;

const WatchlistDetailScreen = ({ route }) => {
    const { watchlistId, watchlistName } = route.params;
    const { theme } = useContext(UserPreferencesContext);
    const { getWatchlistById, removeStockFromWatchlist } = useWatchlist();
    const navigation = useNavigation();
    const styles = getStyles(theme);

    const [watchlist, setWatchlist] = useState(null);

    useEffect(() => {
        const currentWatchlist = getWatchlistById(watchlistId);
        setWatchlist(currentWatchlist);
    }, [watchlistId, getWatchlistById]);

    useEffect(() => {
        // Set navigation header title
        navigation.setOptions({
            title: watchlistName || 'Watchlist',
        });
    }, [navigation, watchlistName]);

    const handleStockPress = (stock) => {
        navigation.navigate('StockDetails', {
            symbol: stock.symbol
        });
    };

    const handleRemoveStock = (stock) => {
        Alert.alert(
            'Remove Stock',
            `Remove ${stock.symbol} from ${watchlistName}?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await removeStockFromWatchlist(watchlistId, stock.symbol);
                            // Refresh the watchlist
                            const updatedWatchlist = getWatchlistById(watchlistId);
                            setWatchlist(updatedWatchlist);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to remove stock');
                        }
                    },
                },
            ]
        );
    };

    const handleLongPress = (stock) => {
        handleRemoveStock(stock);
    };

    const renderStockCard = (stock, index) => {
        const isPositive = parseFloat(stock.change || 0) >= 0;

        return (
            <TouchableOpacity
                key={stock.symbol}
                style={[styles.stockCard, { width: CARD_WIDTH }]}
                onPress={() => handleStockPress(stock)}
                onLongPress={() => handleLongPress(stock)}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.stockIcon, { backgroundColor: getStockColor(stock.symbol) }]}>
                        <Text style={styles.iconText}>
                            {stock.symbol.charAt(0)}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardContent}>
                    <Text style={styles.stockSymbol} numberOfLines={1}>
                        {stock.symbol}
                    </Text>
                    <Text style={styles.stockName} numberOfLines={2}>
                        {stock.name}
                    </Text>

                    <View style={styles.priceContainer}>
                        <Text style={styles.stockPrice}>
                            {stock.price ? `$${parseFloat(stock.price).toFixed(2)}` : 'N/A'}
                        </Text>
                        {stock.change && (
                            <Text style={[
                                styles.stockChange,
                                isPositive ? styles.positiveChange : styles.negativeChange
                            ]}>
                                {isPositive ? '+' : ''}{stock.change}
                            </Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const getStockColor = (symbol) => {
        const colors = [
            '#007AFF', '#34c759', '#ff3b30', '#ff9500',
            '#5856d6', '#af52de', '#ff2d92', '#64d2ff',
            '#5ac8fa', '#30b0c7', '#32d74b', '#ffcc02'
        ];
        const index = symbol.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const createRows = (stocks) => {
        const rows = [];
        for (let i = 0; i < stocks.length; i += 2) {
            const row = stocks.slice(i, i + 2);
            rows.push(row);
        }
        return rows;
    };

    if (!watchlist) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading watchlist...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContentContainer}
            >
                {watchlist.stocks.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>No Stocks</Text>
                        <Text style={styles.emptyDescription}>
                            Add stocks to this watchlist by navigating to a stock's details page and selecting "Add to Watchlist".
                        </Text>
                    </View>
                ) : (
                    <View style={styles.stocksContainer}>
                        {createRows(watchlist.stocks).map((row, rowIndex) => (
                            <View key={rowIndex} style={styles.stockRow}>
                                {row.map((stock, stockIndex) =>
                                    renderStockCard(stock, rowIndex * 2 + stockIndex)
                                )}
                                {/* Add empty space if row has only one item */}
                                {row.length === 1 && (
                                    <View style={[styles.stockCard, { width: CARD_WIDTH, opacity: 0 }]} />
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const getStyles = (theme) => {
    const isDark = theme === 'dark';

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#000000' : '#f2f2f7',
        },
        scrollView: {
            flex: 1,
        },
        scrollContentContainer: {
            padding: CARD_MARGIN,
            paddingBottom: 100, // Extra padding for tab navigator
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            fontSize: 16,
            color: isDark ? '#a0a0a0' : '#666666',
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 40,
            marginTop: 100,
        },
        emptyTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
            marginBottom: 12,
        },
        emptyDescription: {
            fontSize: 16,
            color: isDark ? '#a0a0a0' : '#666666',
            textAlign: 'center',
            lineHeight: 22,
        },
        stocksContainer: {
            flex: 1,
        },
        stockRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: CARD_MARGIN,
        },
        stockCard: {
            backgroundColor: isDark ? '#2c2c2e' : '#ffffff',
            borderRadius: 16,
            padding: 16,
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
        },
        cardHeader: {
            marginBottom: 12,
        },
        stockIcon: {
            width: 40,
            height: 40,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
        },
        iconText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#ffffff',
        },
        cardContent: {
            flex: 1,
            justifyContent: 'space-between',
        },
        stockSymbol: {
            fontSize: 16,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
            marginBottom: 4,
        },
        stockName: {
            fontSize: 12,
            color: isDark ? '#a0a0a0' : '#666666',
            marginBottom: 12,
            lineHeight: 16,
        },
        priceContainer: {
            marginTop: 'auto',
        },
        stockPrice: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
            marginBottom: 4,
        },
        stockChange: {
            fontSize: 14,
            fontWeight: '600',
        },
        positiveChange: {
            color: '#34c759',
        },
        negativeChange: {
            color: '#ff3b30',
        },
    });
};

export default WatchlistDetailScreen;
