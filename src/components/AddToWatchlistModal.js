import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    Dimensions,
} from 'react-native';
import { UserPreferencesContext } from '../context/UserPreferences';
import { useWatchlist } from '../context/WatchlistContext';

const { height } = Dimensions.get('window');

const AddToWatchlistModal = ({ visible, onClose, stock }) => {
    const { theme } = useContext(UserPreferencesContext);
    const {
        watchlists,
        createWatchlist,
        addStockToWatchlist,
        isStockInWatchlist
    } = useWatchlist();

    const [newWatchlistName, setNewWatchlistName] = useState('');
    const [selectedWatchlists, setSelectedWatchlists] = useState(new Set());
    const [isCreatingWatchlist, setIsCreatingWatchlist] = useState(false);

    const styles = getStyles(theme);

    const handleWatchlistToggle = (watchlistId) => {
        const newSelected = new Set(selectedWatchlists);
        if (newSelected.has(watchlistId)) {
            newSelected.delete(watchlistId);
        } else {
            newSelected.add(watchlistId);
        }
        setSelectedWatchlists(newSelected);
    };

    const handleCreateWatchlist = async () => {
        if (!newWatchlistName.trim()) {
            Alert.alert('Error', 'Please enter a watchlist name');
            return;
        }

        try {
            setIsCreatingWatchlist(true);
            const newWatchlist = await createWatchlist(newWatchlistName.trim());
            setNewWatchlistName('');
            Alert.alert('Success', `Created "${newWatchlist.name}" successfully`);
        } catch (error) {
            Alert.alert('Error', 'Failed to create watchlist');
        } finally {
            setIsCreatingWatchlist(false);
        }
    };

    const handleAddToWatchlists = async () => {
        if (selectedWatchlists.size === 0) {
            Alert.alert('Error', 'Please select at least one watchlist');
            return;
        }

        try {
            const promises = Array.from(selectedWatchlists).map(watchlistId =>
                addStockToWatchlist(watchlistId, stock)
            );

            await Promise.all(promises);

            const addedToCount = selectedWatchlists.size;
            Alert.alert(
                'Success',
                `${stock.symbol || stock.ticker} added to ${addedToCount} ${addedToCount === 1 ? 'watchlist' : 'watchlists'}`
            );

            // Reset selections and close modal
            setSelectedWatchlists(new Set());
            onClose();
        } catch (error) {
            Alert.alert('Error', 'Failed to add stock to watchlists');
        }
    };

    const handleClose = () => {
        setSelectedWatchlists(new Set());
        setNewWatchlistName('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleClose}
                        >
                            <Text style={styles.closeButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Add to Watchlist</Text>
                        <View style={styles.headerSpacer} />
                    </View>

                    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                        {/* Stock Info */}
                        <View style={styles.stockInfo}>
                            <Text style={styles.stockSymbol}>
                                {stock?.symbol || stock?.ticker}
                            </Text>
                            <Text style={styles.stockName}>
                                {stock?.name || stock?.Name || 'Unknown Stock'}
                            </Text>
                        </View>

                        {/* Watchlists Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Watchlists</Text>

                            {/* Create New Watchlist */}
                            <View style={styles.createWatchlistContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Create new watchlist..."
                                    placeholderTextColor={theme === 'dark' ? '#666666' : '#999999'}
                                    value={newWatchlistName}
                                    onChangeText={setNewWatchlistName}
                                    returnKeyType="done"
                                    onSubmitEditing={handleCreateWatchlist}
                                />
                                <TouchableOpacity
                                    style={[
                                        styles.addButton,
                                        (!newWatchlistName.trim() || isCreatingWatchlist) && styles.addButtonDisabled
                                    ]}
                                    onPress={handleCreateWatchlist}
                                    disabled={!newWatchlistName.trim() || isCreatingWatchlist}
                                >
                                    <Text style={[
                                        styles.addButtonText,
                                        (!newWatchlistName.trim() || isCreatingWatchlist) && styles.addButtonTextDisabled
                                    ]}>
                                        {isCreatingWatchlist ? 'Creating...' : 'Create'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Divider */}
                            {watchlists.length > 0 && (
                                <View style={styles.divider} />
                            )}

                            {/* Existing Watchlists */}
                            {watchlists.length === 0 ? (
                                <View style={styles.emptyWatchlists}>
                                    <Text style={styles.emptyWatchlistsText}>
                                        No existing watchlists. Create one above to get started.
                                    </Text>
                                </View>
                            ) : (
                                watchlists.map((watchlist, index) => {
                                    const isSelected = selectedWatchlists.has(watchlist.id);
                                    const stockAlreadyInList = isStockInWatchlist(
                                        watchlist.id,
                                        stock?.symbol || stock?.ticker
                                    );
                                    const isLastItem = index === watchlists.length - 1;

                                    return (
                                        <TouchableOpacity
                                            key={watchlist.id}
                                            style={[
                                                styles.watchlistItem,
                                                stockAlreadyInList && styles.watchlistItemDisabled,
                                                isLastItem && styles.watchlistItemLast
                                            ]}
                                            onPress={() => !stockAlreadyInList && handleWatchlistToggle(watchlist.id)}
                                            disabled={stockAlreadyInList}
                                        >
                                            <View style={[
                                                styles.checkbox,
                                                isSelected && styles.checkboxSelected,
                                                stockAlreadyInList && styles.checkboxDisabled
                                            ]}>
                                                {isSelected && <Text style={styles.checkmark}>✓</Text>}
                                            </View>
                                            <View style={styles.watchlistInfo}>
                                                <Text style={[
                                                    styles.watchlistName,
                                                    stockAlreadyInList && styles.watchlistNameDisabled
                                                ]}>
                                                    {watchlist.name}
                                                </Text>
                                                <Text style={styles.watchlistStockCount}>
                                                    {watchlist.stocks.length} {watchlist.stocks.length === 1 ? 'stock' : 'stocks'}
                                                    {stockAlreadyInList && ' • Already added'}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.addToWatchlistButton,
                                selectedWatchlists.size === 0 && styles.addToWatchlistButtonDisabled
                            ]}
                            onPress={handleAddToWatchlists}
                            disabled={selectedWatchlists.size === 0}
                        >
                            <Text style={[
                                styles.addToWatchlistButtonText,
                                selectedWatchlists.size === 0 && styles.addToWatchlistButtonTextDisabled
                            ]}>
                                Add to {selectedWatchlists.size} {selectedWatchlists.size === 1 ? 'Watchlist' : 'Watchlists'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const getStyles = (theme) => {
    const isDark = theme === 'dark';

    return StyleSheet.create({
        modalContainer: {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
        },
        modalContent: {
            height: height * 0.8, // Slightly reduced height for lighter feel
            backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: -4,
            },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 20,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 20,
            backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
            borderBottomWidth: 0.5,
            borderBottomColor: isDark ? '#3a3a3c' : '#e8e8e8',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
        },
        closeButton: {
            paddingVertical: 8,
            paddingHorizontal: 4,
        },
        closeButtonText: {
            fontSize: 17,
            color: '#007AFF',
            fontWeight: '500',
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: isDark ? '#ffffff' : '#1d1d1f',
            letterSpacing: -0.4,
        },
        headerSpacer: {
            width: 60, // Same width as close button to center title
        },
        scrollView: {
            flex: 1,
            backgroundColor: isDark ? '#000000' : '#f8f9fa',
        },
        stockInfo: {
            backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
            marginHorizontal: 20,
            marginTop: 20,
            marginBottom: 12,
            padding: 24,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: isDark ? 0.3 : 0.08,
            shadowRadius: 8,
            elevation: 4,
        },
        stockSymbol: {
            fontSize: 28,
            fontWeight: '800',
            color: isDark ? '#ffffff' : '#1d1d1f',
            marginBottom: 4,
            letterSpacing: -0.6,
        },
        stockName: {
            fontSize: 16,
            color: isDark ? '#a0a0a0' : '#86868b',
            fontWeight: '500',
            lineHeight: 22,
        },
        section: {
            backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
            marginHorizontal: 20,
            marginBottom: 16,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: isDark ? 0.3 : 0.06,
            shadowRadius: 8,
            elevation: 3,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: isDark ? '#ffffff' : '#1d1d1f',
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 16,
            letterSpacing: -0.3,
        },
        createWatchlistContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingBottom: 10,
            gap: 12,
        },
        textInput: {
            flex: 1,
            height: 48,
            borderWidth: 1.5,
            borderColor: isDark ? '#3a3a3c' : '#e3e3e3',
            borderRadius: 12,
            paddingHorizontal: 16,
            fontSize: 16,
            color: isDark ? '#ffffff' : '#1d1d1f',
            backgroundColor: isDark ? '#2c2c2e' : '#ffffff',
            fontWeight: '500',
        },
        addButton: {
            backgroundColor: '#007AFF',
            paddingHorizontal: 24,
            paddingVertical: 14,
            borderRadius: 12,
            shadowColor: '#007AFF',
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 6,
        },
        addButtonDisabled: {
            backgroundColor: isDark ? '#3a3a3c' : '#e3e3e3',
            shadowOpacity: 0,
            elevation: 0,
        },
        addButtonText: {
            color: '#ffffff',
            fontSize: 16,
            fontWeight: '700',
            letterSpacing: -0.2,
        },
        addButtonTextDisabled: {
            color: isDark ? '#666666' : '#a0a0a0',
        },
        divider: {
            height: 0.5,
            backgroundColor: isDark ? '#3a3a3c' : '#e8e8e8',
            marginHorizontal: 4,
            marginVertical: 8,
        },
        emptyWatchlists: {
            padding: 32,
            alignItems: 'center',
        },
        emptyWatchlistsText: {
            fontSize: 16,
            color: isDark ? '#a0a0a0' : '#86868b',
            textAlign: 'center',
            fontWeight: '500',
            lineHeight: 24,
        },
        watchlistItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingVertical: 18,
            borderBottomWidth: 0.5,
            borderBottomColor: isDark ? '#3a3a3c' : '#e8e8e8',
        },
        watchlistItemDisabled: {
            opacity: 0.6,
        },
        watchlistItemLast: {
            borderBottomWidth: 0,
        },
        checkbox: {
            width: 28,
            height: 28,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: isDark ? '#3a3a3c' : '#d1d1d6',
            marginRight: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDark ? '#2c2c2e' : '#ffffff',
        },
        checkboxSelected: {
            backgroundColor: '#007AFF',
            borderColor: '#007AFF',
            shadowColor: '#007AFF',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
        },
        checkboxDisabled: {
            backgroundColor: isDark ? '#1c1c1e' : '#f8f9fa',
            borderColor: isDark ? '#2c2c2e' : '#e8e8e8',
        },
        checkmark: {
            color: '#ffffff',
            fontSize: 16,
            fontWeight: '800',
        },
        watchlistInfo: {
            flex: 1,
        },
        watchlistName: {
            fontSize: 17,
            fontWeight: '700',
            color: isDark ? '#ffffff' : '#1d1d1f',
            marginBottom: 4,
            letterSpacing: -0.2,
        },
        watchlistNameDisabled: {
            color: isDark ? '#666666' : '#a0a0a0',
        },
        watchlistStockCount: {
            fontSize: 15,
            color: isDark ? '#a0a0a0' : '#86868b',
            fontWeight: '500',
        },
        footer: {
            backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 24,
            borderTopWidth: 0.5,
            borderTopColor: isDark ? '#3a3a3c' : '#e8e8e8',
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: -2,
            },
            shadowOpacity: isDark ? 0.3 : 0.05,
            shadowRadius: 8,
            elevation: 8,
        },
        addToWatchlistButton: {
            backgroundColor: '#007AFF',
            paddingVertical: 18,
            borderRadius: 14,
            alignItems: 'center',
            shadowColor: '#007AFF',
            shadowOffset: {
                width: 0,
                height: 6,
            },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
        },
        addToWatchlistButtonDisabled: {
            backgroundColor: isDark ? '#3a3a3c' : '#e3e3e3',
            shadowOpacity: 0,
            elevation: 0,
        },
        addToWatchlistButtonText: {
            color: '#ffffff',
            fontSize: 18,
            fontWeight: '700',
            letterSpacing: -0.3,
        },
        addToWatchlistButtonTextDisabled: {
            color: isDark ? '#666666' : '#a0a0a0',
        },
    });
};

export default AddToWatchlistModal;
