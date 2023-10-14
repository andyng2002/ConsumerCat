import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';


const WeeklyReportScreen = () => {
    return (
        <View style={styles.container}>
            <Text>Weekly Report</Text>
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

export default WeeklyReportScreen;