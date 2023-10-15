import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { styles } from '../Styles';


const ScannerScreen = () => {
    return (
        <View style={brcd_styles.container}>
            <Text>Scanner</Text>
        </View>
    );
};


// styles specific to Barcode Scanner Screen
const brcd_styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f4f4f4',
        padding: 20,
    }
});

export default ScannerScreen;