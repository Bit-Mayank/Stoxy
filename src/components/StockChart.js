import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Platform,
} from 'react-native';
import {
    VictoryChart,
    VictoryLine,
    VictoryAxis,
    VictoryTheme,
    VictoryArea,
} from 'victory-native';
import { UserPreferencesContext } from '../context/UserPreferences';
import stockApiService from '../services/api';

const { width: screenWidth } = Dimensions.get('window');

const StockChart = ({ symbol, onPriceUpdate }) => {
    const { theme } = useContext(UserPreferencesContext);
    const styles = getStyles(theme);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRange, setSelectedRange] = useState('1M');
    const [currentPrice, setCurrentPrice] = useState(null);
    const [priceChange, setPriceChange] = useState(null);
    const [priceChangePercent, setPriceChangePercent] = useState(null);

    const timeRanges = [
        { label: '1D', value: '1D' },
        { label: '1W', value: '1W' },
        { label: '1M', value: '1M' },
        { label: '3M', value: '3M' },
        { label: '1Y', value: '1Y' },
    ];

    useEffect(() => {
        if (symbol) {
            fetchChartData(selectedRange);
        }
    }, [symbol, selectedRange]);

    const fetchChartData = async (range) => {
        try {
            setLoading(true);
            setError(null);

            // Use IBM for demo API key, otherwise use provided symbol
            const chartSymbol = symbol || 'IBM';

            let chartData;
            if (range === '1D') {
                chartData = await stockApiService.getIntradayData(chartSymbol);
            } else {
                chartData = await stockApiService.getDailyData(chartSymbol, range);
            }

            if (chartData && chartData.length > 0) {
                setData(chartData);

                // Calculate price change from first to last data point
                const firstPrice = chartData[0]?.y || 0;
                const lastPrice = chartData[chartData.length - 1]?.y || 0;
                const change = lastPrice - firstPrice;
                const changePercent = firstPrice !== 0 ? (change / firstPrice) * 100 : 0;

                setCurrentPrice(lastPrice);
                setPriceChange(change);
                setPriceChangePercent(changePercent);

                // Update parent component with current price
                if (onPriceUpdate) {
                    onPriceUpdate({
                        price: lastPrice,
                        change: change,
                        changePercent: changePercent,
                    });
                }
            } else {
                setData([]);
                setCurrentPrice(null);
                setPriceChange(null);
                setPriceChangePercent(null);
            }
        } catch (err) {
            console.error('Error fetching chart data:', err);
            setError('Failed to load chart data');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        if (!price) return '$0.00';
        return `$${price.toFixed(2)}`;
    };

    const formatChange = (change, percent) => {
        if (change === null || percent === null) return '';
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
    };

    const getChangeColor = (change) => {
        if (change === null || change === 0) return theme === 'dark' ? '#8e8e93' : '#666666';
        return change >= 0 ? '#34c759' : '#ff3b30';
    };

    const handleRangeSelect = (range) => {
        setSelectedRange(range);
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Price Chart</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading chart data...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Price Chart</Text>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => fetchChartData(selectedRange)}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Price Chart</Text>
                {currentPrice && (
                    <View style={styles.priceInfo}>
                        <Text style={styles.currentPrice}>{formatPrice(currentPrice)}</Text>
                        <Text style={[styles.priceChange, { color: getChangeColor(priceChange) }]}>
                            {formatChange(priceChange, priceChangePercent)}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.chartContainer}>
                {data.length > 0 ? (
                    <VictoryChart
                        theme={VictoryTheme.material}
                        width={screenWidth - 48}
                        height={250}
                        padding={{ left: 60, top: 20, right: 40, bottom: 60 }}
                        standalone={true}
                    >
                        <VictoryAxis
                            dependentAxis
                            tickFormat={(t) => `$${t}`}
                            style={{
                                axis: { stroke: theme === 'dark' ? '#3a3a3c' : '#e0e0e0' },
                                tickLabels: {
                                    fontSize: 12,
                                    fill: theme === 'dark' ? '#8e8e93' : '#666666',
                                    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
                                },
                                grid: { stroke: theme === 'dark' ? '#2c2c2e' : '#f0f0f0', strokeWidth: 0.5 }
                            }}
                        />
                        <VictoryAxis
                            fixLabelOverlap
                            tickCount={5}
                            style={{
                                axis: { stroke: theme === 'dark' ? '#3a3a3c' : '#e0e0e0' },
                                tickLabels: {
                                    fontSize: 12,
                                    fill: theme === 'dark' ? '#8e8e93' : '#666666',
                                    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
                                }
                            }}
                        />
                        <VictoryLine
                            data={data}
                            style={{
                                data: {
                                    stroke: priceChange >= 0 ? '#34c759' : '#ff3b30',
                                    strokeWidth: 2.5
                                }
                            }}
                            animate={{
                                duration: 1000,
                                onLoad: { duration: 500 }
                            }}
                        />
                    </VictoryChart>
                ) : (
                    <View style={styles.noDataContainer}>
                        <Text style={styles.noDataText}>No chart data available</Text>
                    </View>
                )}
            </View>

            <View style={styles.rangeSelector}>
                {timeRanges.map((range) => (
                    <TouchableOpacity
                        key={range.value}
                        style={[
                            styles.rangeButton,
                            selectedRange === range.value && styles.rangeButtonActive
                        ]}
                        onPress={() => handleRangeSelect(range.value)}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.rangeButtonText,
                            selectedRange === range.value && styles.rangeButtonTextActive
                        ]}>
                            {range.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const getStyles = (theme) => {
    const isDark = theme === 'dark';

    return StyleSheet.create({
        container: {
            backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
            borderRadius: 16,
            margin: 14,
            marginTop: 0,
            marginBottom: 8,
            shadowColor: isDark ? '#000000' : '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 8,
            elevation: 3,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: 20,
            paddingBottom: 12,
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
            letterSpacing: 0.3,
        },
        priceInfo: {
            alignItems: 'flex-end',
        },
        currentPrice: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
            marginBottom: 2,
        },
        priceChange: {
            fontSize: 14,
            fontWeight: '600',
        },
        chartContainer: {
            alignItems: 'center',
            paddingHorizontal: 4,
        },
        loadingContainer: {
            height: 250,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            marginTop: 12,
            fontSize: 16,
            fontWeight: '500',
            color: isDark ? '#8e8e93' : '#666666',
        },
        errorContainer: {
            height: 250,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
        },
        errorText: {
            fontSize: 16,
            color: isDark ? '#8e8e93' : '#666666',
            textAlign: 'center',
            marginBottom: 16,
            lineHeight: 24,
        },
        retryButton: {
            backgroundColor: '#007AFF',
            paddingHorizontal: 24,
            paddingVertical: 12,
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
        noDataContainer: {
            height: 250,
            justifyContent: 'center',
            alignItems: 'center',
        },
        noDataText: {
            fontSize: 16,
            color: isDark ? '#8e8e93' : '#666666',
            fontStyle: 'italic',
        },
        rangeSelector: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderTopWidth: 0.5,
            borderTopColor: isDark ? '#3a3a3c' : '#e8e8e8',
        },
        rangeButton: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 12,
            backgroundColor: isDark ? '#2c2c2e' : '#f8f9fa',
            borderWidth: 1,
            borderColor: isDark ? '#3a3a3c' : '#e5e5e7',
            minWidth: 50,
            alignItems: 'center',
        },
        rangeButtonActive: {
            backgroundColor: '#007AFF',
            borderColor: '#007AFF',
            shadowColor: '#007AFF',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 3,
        },
        rangeButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: isDark ? '#ffffff' : '#666666',
        },
        rangeButtonTextActive: {
            color: '#ffffff',
        },
    });
};

export default StockChart;
