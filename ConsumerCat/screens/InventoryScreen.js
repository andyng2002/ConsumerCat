import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { styles } from '../Styles';


const InventoryScreen = () => {
    return (
        <View style={inv_styles.container}>
            <Text style={inv_styles.hello_text}>Hello!</Text>
            <Text style={styles.header}>Your Inventory</Text>
            <View style={styles.horizontal_line} />
        </View>
    );
}


// styles specific to Inventory Screen
const inv_styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'left',
        justifyContent: 'top',
        backgroundColor: '#E3FDE0',
        paddingTop: 80,
        padding: 20,
    },

    hello_text: {
        fontSize: 22,
        fontWeight: "bold",
        marginHorizontal: 5
        
    }
});

export default InventoryScreen;