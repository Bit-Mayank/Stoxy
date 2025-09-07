import React, { useContext, useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserPreferencesContext } from '../context/UserPreferences';
import Header from '../components/ExploreScreenComponents/Header';
import StockSection from '../components/ExploreScreenComponents/StockSection';
import CacheDebugComponent from '../components/CacheDebugComponent';
import { mockStocksData, searchStocks } from '../data/stocksData';
import stockApiService from '../services/api';

const ExploreScreen = () => {
    const { theme } = useContext(UserPreferencesContext);
    const navigation = useNavigation();
    const styles = getStyles(theme);

    const [topGainers, setTopGainers] = useState([]);
    const [topLosers, setTopLosers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStockData();
    }, []);

    useEffect(() => {
        if (searchQuery.trim()) {
            setIsSearching(true);
            const allStocks = [...topGainers, ...topLosers];
            const results = searchStocks(searchQuery, allStocks);
            setSearchResults(results);
        } else {
            setIsSearching(false);
            setSearchResults([]);
        }
    }, [searchQuery, topGainers, topLosers]);

    const fetchStockData = async () => {
        try {
            setLoading(true);
            const data = await stockApiService.getTopGainersLosers();
            const transformed = stockApiService.transformTopGainersLosers(data);
            setTopGainers(transformed.topGainers || []);
            setTopLosers(transformed.topLosers || []);
        } catch (error) {
            console.error('Failed to fetch stock data:', error);
            // Fallback to mock data
            setTopGainers(mockStocksData.topGainers);
            setTopLosers(mockStocksData.topLosers);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setIsSearching(false);
        setSearchResults([]);
    };

    const handleStockPress = (stock) => {
        navigation.navigate('StockDetails', {
            symbol: stock.ticker,
            stockData: stock  // Pass the complete stock data
        });
    };

    const handleViewAll = (sectionType) => {
        if (sectionType === 'top gainers') {
            navigation.navigate('TopGainers');
        } else if (sectionType === 'top losers') {
            navigation.navigate('TopLosers');
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header
                    title="Stocks App"
                    onSearch={handleSearch}
                    onClear={handleClearSearch}
                    placeholder="Search stocks..."
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Stocks App"
                onSearch={handleSearch}
                onClear={handleClearSearch}
                placeholder="Search stocks..."
            />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContentContainer}
            >
                {isSearching ? (
                    <StockSection
                        title="Search Results"
                        stocks={searchResults.slice(0, 6)}
                        onStockPress={handleStockPress}
                        onViewAll={() => handleViewAll('search results')}
                    />
                ) : (
                    <>
                        <StockSection
                            title="Top Gainers"
                            stocks={topGainers.slice(0, 4)}
                            onStockPress={handleStockPress}
                            onViewAll={() => handleViewAll('top gainers')}
                        />

                        <StockSection
                            title="Top Losers"
                            stocks={topLosers.slice(0, 4)}
                            onStockPress={handleStockPress}
                            onViewAll={() => handleViewAll('top losers')}
                        />

                        {/* Debug component for testing cache */}
                        <CacheDebugComponent />
                    </>
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
            paddingBottom: 100, // Extra padding for tab navigator
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });
};

export default ExploreScreen;