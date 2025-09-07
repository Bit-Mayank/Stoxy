import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { UserPreferencesContext } from '../context/UserPreferences';
import { useWatchlist } from '../context/WatchlistContext';
import AddToWatchlistModal from '../components/AddToWatchlistModal';
import stockApiService from '../services/api';
import BookmarkIcon from '../components/BookmarkIcon';

const StockDetailsScreen = ({ route, navigation }) => {
    const { symbol, stockData } = route.params;
    const { theme } = useContext(UserPreferencesContext);
    const { isStockInAnyWatchlist } = useWatchlist();
    const styles = getStyles(theme);

    const [companyData, setCompanyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        fetchCompanyOverview();
    }, [symbol]);

    const fetchCompanyOverview = async () => {
        try {
            setLoading(true);

            // Only fetch company overview data, use stockData for price info
            const companyOverview = await stockApiService.getCompanyOverview(symbol);

            setCompanyData(companyOverview);
            setError(null);
        } catch (err) {
            console.error('Error fetching company overview:', err);
            setError('Failed to load company details');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToWatchlist = () => {
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    const formatCurrency = (value) => {
        if (!value || value === 'None') return '-';
        const num = parseFloat(value);
        if (isNaN(num)) return '-';

        if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
        return `$${num.toFixed(2)}`;
    };

    const formatPercentage = (value) => {
        if (!value || value === 'None') return '-';
        const num = parseFloat(value);
        if (isNaN(num)) return '-';
        return `${(num * 100).toFixed(2)}%`;
    };

    const formatRatio = (value) => {
        if (!value || value === 'None') return '-';
        const num = parseFloat(value);
        if (isNaN(num)) return '-';
        return num.toFixed(2);
    };

    const getCurrentPrice = () => {
        if (stockData && stockData.price) {
            return parseFloat(stockData.price) || 0;
        }
        // Fallback to calculated price from company data if no stockData
        if (companyData && companyData.PERatio && companyData.EPS) {
            return parseFloat(companyData.PERatio) * parseFloat(companyData.EPS) || 0;
        }
        return 0;
    };

    const getPriceChange = () => {
        if (stockData && stockData.change_amount) {
            return parseFloat(stockData.change_amount) || 0;
        }
        // No fallback for price change, return 0
        return 0;
    };

    const getPriceChangePercent = () => {
        if (stockData && stockData.change_percentage) {
            const changePercent = stockData.change_percentage;
            if (changePercent) {
                return parseFloat(changePercent.replace('%', '')) || 0;
            }
        }
        // No fallback for percentage change, return 0
        return 0;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading company details...</Text>
            </View>
        );
    }

    if (error || !companyData) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error || 'No data available'}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchCompanyOverview}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <View style={styles.headerSection}>
                <View style={styles.companyHeader}>
                    <View style={[styles.companyIcon, { backgroundColor: '#007AFF' }]}>
                        <Text style={styles.iconText}>
                            {companyData.Symbol ? companyData.Symbol.charAt(0) : 'S'}
                        </Text>
                    </View>
                    <View style={styles.companyInfo}>
                        <View style={styles.companyNameRow}>
                            <View style={styles.companyTextContainer}>
                                <Text style={styles.companySymbol}>{companyData.Symbol}</Text>
                                <Text style={styles.companyName} numberOfLines={2}>
                                    {companyData.Name}
                                </Text>
                                <Text style={styles.exchange}>{companyData.Exchange}</Text>
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.bookmarkButton,
                                    isStockInAnyWatchlist(symbol) && styles.bookmarkButtonActive
                                ]}
                                onPress={handleAddToWatchlist}
                                activeOpacity={0.7}
                            >
                                <BookmarkIcon
                                    width={26}
                                    height={26}
                                    stroke={isStockInAnyWatchlist(symbol) ? '#ffffff' : (theme === 'dark' ? '#8e8e93' : '#666666')}
                                    fill={isStockInAnyWatchlist(symbol) ? '#007AFF' : 'none'}
                                    strokeWidth={isStockInAnyWatchlist(symbol) ? 1 : 2}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.priceSection}>
                    <Text style={styles.currentPrice}>
                        {formatCurrency(getCurrentPrice())}
                    </Text>
                    {stockData && (getPriceChange() !== 0 || getPriceChangePercent() !== 0) ? (
                        <View style={styles.priceChangeContainer}>
                            <Text style={[
                                styles.priceChange,
                                getPriceChange() >= 0 ? styles.positiveChange : styles.negativeChange
                            ]}>
                                {getPriceChange() >= 0 ? '+' : ''}{getPriceChange().toFixed(2)}
                            </Text>
                            <Text style={[
                                styles.priceChangePercent,
                                getPriceChange() >= 0 ? styles.positiveChange : styles.negativeChange
                            ]}>
                                ({getPriceChangePercent() >= 0 ? '+' : ''}{getPriceChangePercent().toFixed(2)}%)
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.noDataText}>
                            No change data available
                        </Text>
                    )}
                </View>
            </View>

            {/* Add to Watchlist Modal */}
            <AddToWatchlistModal
                visible={modalVisible}
                onClose={handleCloseModal}
                stock={{
                    symbol: symbol,
                    name: companyData?.Name,
                    Symbol: companyData?.Symbol,
                    price: getCurrentPrice(),
                }}
            />

            {/* About Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About {companyData.Symbol}</Text>
                <Text style={styles.description}>
                    {companyData.Description || 'No description available for this company.'}
                </Text>

                <View style={styles.tagContainer}>
                    {companyData.Industry && (
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>Industry: {companyData.Industry}</Text>
                        </View>
                    )}
                    {companyData.Sector && (
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>Sector: {companyData.Sector}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Key Metrics Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Key Metrics</Text>

                {/* Price Range */}
                <View style={styles.priceRangeContainer}>
                    <Text style={styles.priceRangeTitle}>52-Week Range</Text>
                    <View style={styles.priceRangeBar}>
                        <View style={styles.priceRangeTrack}>
                            <View style={styles.priceRangeIndicator} />
                        </View>
                        <View style={styles.priceRangeLabels}>
                            <Text style={styles.priceRangeLabel}>
                                {formatCurrency(companyData['52WeekLow'])}
                            </Text>
                            <Text style={[styles.priceRangeLabel, styles.currentPriceLabel]}>
                                Current: {formatCurrency(getCurrentPrice())}
                            </Text>
                            <Text style={styles.priceRangeLabel}>
                                {formatCurrency(companyData['52WeekHigh'])}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Financial Metrics Grid */}
                <View style={styles.metricsContainer}>
                    <View style={styles.metricRow}>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Market Cap</Text>
                            <Text style={styles.metricValue}>
                                {formatCurrency(companyData.MarketCapitalization)}
                            </Text>
                        </View>

                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>P/E Ratio</Text>
                            <Text style={styles.metricValue}>
                                {formatRatio(companyData.PERatio)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.metricRow}>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Beta</Text>
                            <Text style={styles.metricValue}>
                                {formatRatio(companyData.Beta)}
                            </Text>
                        </View>

                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Dividend Yield</Text>
                            <Text style={styles.metricValue}>
                                {formatPercentage(companyData.DividendYield)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.metricRow}>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Profit Margin</Text>
                            <Text style={styles.metricValue}>
                                {formatPercentage(companyData.ProfitMargin)}
                            </Text>
                        </View>

                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>EPS</Text>
                            <Text style={styles.metricValue}>
                                {formatCurrency(companyData.EPS)}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const getStyles = (theme) => {
    const isDark = theme === 'dark';

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#000000' : '#f8f9fa',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDark ? '#000000' : '#f8f9fa',
        },
        loadingText: {
            marginTop: 16,
            fontSize: 16,
            fontWeight: '500',
            color: isDark ? '#ffffff' : '#666666',
        },
        errorContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDark ? '#000000' : '#f8f9fa',
            padding: 20,
        },
        errorText: {
            fontSize: 16,
            color: isDark ? '#ffffff' : '#666666',
            textAlign: 'center',
            marginBottom: 20,
            lineHeight: 24,
        },
        retryButton: {
            backgroundColor: '#007AFF',
            paddingHorizontal: 32,
            paddingVertical: 14,
            borderRadius: 12,
            shadowColor: '#007AFF',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
        },
        retryButtonText: {
            color: '#ffffff',
            fontSize: 16,
            fontWeight: '600',
        },
        headerSection: {
            backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
            padding: 24,
            borderBottomWidth: 1,
            marginBottom: 8,
            borderBottomColor: isDark ? '#2c2c2e' : '#e5e5e7',
            shadowColor: isDark ? '#000000' : '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 8,
            elevation: 4,
        },
        companyHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
        },
        companyIcon: {
            width: 56,
            height: 56,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
        },
        iconText: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#ffffff',
        },
        companyInfo: {
            flex: 1,
        },
        companyNameRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
        },
        companyTextContainer: {
            flex: 1,
            marginRight: 12,
        },
        bookmarkButton: {
            padding: 10,
            borderRadius: 12,
            backgroundColor: isDark ? '#2c2c2e' : '#f8f9fa',
            shadowColor: isDark ? '#000000' : '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 4,
            elevation: 2,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: isDark ? '#3a3a3c' : '#e5e5e7',
            minWidth: 48,
            minHeight: 48,
        },
        bookmarkButtonActive: {
            backgroundColor: '#007AFF',
            borderColor: '#007AFF',
            shadowColor: '#007AFF',
            shadowOpacity: 0.3,
        },
        companySymbol: {
            fontSize: 24,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
            letterSpacing: 0.5,
        },
        companyName: {
            fontSize: 16,
            color: isDark ? '#a0a0a0' : '#666666',
            marginTop: 4,
            fontWeight: '500',
            lineHeight: 20,
        },
        exchange: {
            fontSize: 13,
            color: isDark ? '#8e8e93' : '#8e8e93',
            marginTop: 4,
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        priceSection: {
            alignItems: 'center',
            marginBottom: 24,
            paddingVertical: 16,
            backgroundColor: isDark ? '#2c2c2e' : '#f8f9fa',
            borderRadius: 12,
        },
        currentPrice: {
            fontSize: 36,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
            letterSpacing: -0.5,
        },
        priceChangeContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 8,
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 8,
            backgroundColor: isDark ? '#3a3a3c' : '#ffffff',
        },
        priceChange: {
            fontSize: 16,
            fontWeight: '600',
            marginRight: 6,
        },
        priceChangePercent: {
            fontSize: 16,
            fontWeight: '600',
        },
        positiveChange: {
            color: '#34c759',
        },
        negativeChange: {
            color: '#ff3b30',
        },
        noDataText: {
            fontSize: 14,
            color: isDark ? '#8e8e93' : '#8e8e93',
            marginTop: 8,
            fontStyle: 'italic',
        },
        section: {
            backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
            margin: 14,
            marginTop: 0,
            marginBottom: 8,
            padding: 24,
            borderRadius: 16,
            shadowColor: isDark ? '#000000' : '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 8,
            elevation: 3,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
            marginBottom: 20,
            letterSpacing: 0.3,
        },
        description: {
            fontSize: 15,
            lineHeight: 22,
            color: isDark ? '#a0a0a0' : '#666666',
            marginBottom: 20,
            fontWeight: '400',
        },
        tagContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
        },
        tag: {
            backgroundColor: isDark ? '#2c2c2e' : '#f0f0f0',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: isDark ? '#3a3a3c' : '#e0e0e0',
        },
        tagText: {
            fontSize: 13,
            color: isDark ? '#ffffff' : '#666666',
            fontWeight: '500',
        },
        priceRangeContainer: {
            marginBottom: 24,
        },
        priceRangeTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: isDark ? '#ffffff' : '#000000',
            marginBottom: 12,
        },
        priceRangeBar: {
            backgroundColor: isDark ? '#2c2c2e' : '#f0f0f0',
            borderRadius: 12,
            padding: 16,
        },
        priceRangeTrack: {
            height: 6,
            backgroundColor: isDark ? '#3a3a3c' : '#e0e0e0',
            borderRadius: 3,
            marginBottom: 12,
            position: 'relative',
        },
        priceRangeIndicator: {
            position: 'absolute',
            left: '50%',
            top: -2,
            width: 10,
            height: 10,
            backgroundColor: '#007AFF',
            borderRadius: 5,
            transform: [{ translateX: -5 }],
        },
        priceRangeLabels: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        priceRangeLabel: {
            fontSize: 13,
            color: isDark ? '#8e8e93' : '#8e8e93',
            fontWeight: '500',
        },
        currentPriceLabel: {
            color: '#007AFF',
            fontWeight: '600',
        },
        metricsContainer: {
            gap: 12,
        },
        metricRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 12,
        },
        metricCard: {
            backgroundColor: isDark ? '#2c2c2e' : '#f8f9fa',
            borderRadius: 12,
            padding: 16,
            flex: 1,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: isDark ? '#3a3a3c' : '#e5e5e7',
            minHeight: 80,
        },
        metricLabel: {
            fontSize: 13,
            color: isDark ? '#8e8e93' : '#8e8e93',
            marginBottom: 8,
            textAlign: 'center',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        metricValue: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
            textAlign: 'center',
        },
    });
};

export default StockDetailsScreen;
