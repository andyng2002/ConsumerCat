import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, Button, TouchableOpacity, Image } from 'react-native';
import { styles } from '../Styles';

const WeeklyReportScreen = () => {
    return (
        <View style={wkrp_styles.container}>
            <Text style={styles.header}>Weekly Report</Text>
            <View style={styles.horizontal_line} />
            <View style={wkrp_styles.viewImage}>
                <Image source={require('../assets/weekly.png')} style={wkrp_styles.image}/>
            </View>
        </View>
    );
};

// styles specific to Weekly Report Screen
const wkrp_styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E3FDE0',
        padding: 20,
    },
    viewImage: {
        maxWidth: '100%',
        maxHeight: '100%'
    },
    image: {
        maxWidth: '50%',
        maxHeight: '50%'
    }
});

export default WeeklyReportScreen;