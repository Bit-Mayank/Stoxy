import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserPreferencesContext } from '../context/UserPreferences';
import { useWatchlist } from '../context/WatchlistContext';

const WatchListScreen = () => {
    const { theme } = useContext(UserPreferencesContext);
    const { watchlists, loading, deleteWatchlist } = useWatchlist();
    const navigation = useNavigation();
    const styles = getStyles(theme);

    const handleWatchlistPress = (watchlist) => {
        navigation.navigate('WatchlistDetail', {
            watchlistId: watchlist.id,
            watchlistName: watchlist.name
        });
    };

    const handleDeleteWatchlist = (watchlist) => {
        Alert.alert(
            'Delete Watchlist',
            `Are you sure you want to delete "${watchlist.name}"? This action cannot be undone.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteWatchlist(watchlist.id);
                            Alert.alert('Success', 'Watchlist deleted successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete watchlist');
                        }
                    },
                },
            ]
        );
    };

    const handleLongPress = (watchlist) => {
        Alert.alert(
            watchlist.name,
            'Choose an action',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => handleDeleteWatchlist(watchlist),
                },
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Watchlist</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading watchlists...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* <View style={styles.header}>
                <Text style={styles.headerTitle}>Watchlist</Text>
            </View> */}

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContentContainer}
            >
                {watchlists.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>No Watchlists</Text>
                        <Text style={styles.emptyDescription}>
                            Your watchlists will appear here. Add stocks to watchlists from the stock details page.
                        </Text>
                    </View>
                ) : (
                    watchlists.map((watchlist) => (
                        <TouchableOpacity
                            key={watchlist.id}
                            style={styles.watchlistItem}
                            onPress={() => handleWatchlistPress(watchlist)}
                            onLongPress={() => handleLongPress(watchlist)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.watchlistContent}>
                                <Text style={styles.watchlistName}>
                                    {watchlist.name}
                                </Text>
                                <Text style={styles.stockCount}>
                                    {watchlist.stocks.length} {watchlist.stocks.length === 1 ? 'stock' : 'stocks'}
                                </Text>
                            </View>
                            <View style={styles.chevronContainer}>
                                <Text style={styles.chevron}>›</Text>
                            </View>
                        </TouchableOpacity>
                    ))
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
        header: {
            backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#2c2c2e' : '#e5e5e7',
        },
        headerTitle: {
            fontSize: 32,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
        },
        scrollView: {
            flex: 1,
        },
        scrollContentContainer: {
            padding: 0,
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
        watchlistItem: {
            backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#2c2c2e' : '#e5e5e7',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        watchlistContent: {
            flex: 1,
        },
        watchlistName: {
            fontSize: 18,
            fontWeight: '600',
            color: isDark ? '#ffffff' : '#000000',
            marginBottom: 4,
        },
        stockCount: {
            fontSize: 14,
            color: isDark ? '#a0a0a0' : '#666666',
        },
        chevronContainer: {
            paddingLeft: 12,
        },
        chevron: {
            fontSize: 20,
            color: isDark ? '#a0a0a0' : '#666666',
            fontWeight: '300',
        },
    });
};

export default WatchListScreen;