module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            // Standard reanimated plugin for Expo
            // This should resolve most reanimated-related warnings
            'react-native-reanimated/plugin',
        ],
    };
};
