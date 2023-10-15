import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';

const Item = (props) => {
    
    return (
        <View style={styles.item}>
            <Text style={styles.quantity}>{props.quantity}</Text>
            <Text>{props.text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    item: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
      },
    quantity: {
        backgroundColor: '#D9D9D9',
        padding: 6,
        margin: 7,
    }
});

export default Item;