import React, { useContext, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserPreferencesContext } from '../context/UserPreferences';
import StockSection from '../components/ExploreScreenComponents/StockSection';
import stockApiService from '../services/api';
import { mockStocksData } from '../data/stocksData';

const TopLosersScreen = () => {
    const { theme } = useContext(UserPreferencesContext);
    const navigation = useNavigation();
    const styles = getStyles(theme);

    const [topLosers, setTopLosers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTopLosers();
    }, []);

    const fetchTopLosers = async () => {
        try {
            setLoading(true);
            const data = await stockApiService.getTopGainersLosers();
            const transformed = stockApiService.transformTopGainersLosers(data);
            setTopLosers(transformed.topLosers);
        } catch (error) {
            console.error('Failed to fetch top losers:', error);
            // Fallback to mock data
            setTopLosers(mockStocksData.topLosers);
        } finally {
            setLoading(false);
        }
    };

    const handleStockPress = (stock) => {
        navigation.navigate('StockDetails', {
            symbol: stock.ticker,
            stockData: stock  // Pass the complete stock data
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading Top Losers...</Text>
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
                <StockSection
                    title="All Top Losers"
                    stocks={topLosers}
                    onStockPress={handleStockPress}
                    hideHeader={true}
                />
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
            paddingBottom: 20,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            marginTop: 16,
            fontSize: 16,
            color: isDark ? '#ffffff' : '#000000',
        },
    });
};

export default TopLosersScreen;
