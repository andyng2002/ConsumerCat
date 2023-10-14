import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';


const ScannerScreen = () => {
    return (
        <View style={styles.container}>
            <Text>Scanner</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f4f4f4',
        padding: 20,
    }
});

export default ScannerScreen;