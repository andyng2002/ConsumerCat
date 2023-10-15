import React, { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, Button } from 'react-native';
import { styles } from '../Styles';
import { BarCodeScanner } from 'expo-barcode-scanner'

/*
resources: https://www.youtube.com/watch?v=LtbuOgoQJAg
*/

const ScannerScreen = () => {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        const getBarCodeScannerPermissions = async () => {
          const { status } = await BarCodeScanner.requestPermissionsAsync();
          setHasPermission(status === 'granted');
        };

        getBarCodeScannerPermissions();
    }, []);

    const handleBarCodeScanned = ({type, data}) => {
        setScanned(true);
        alert(`Bar code with type ${type} and data ${data} has been scanned!`)
    }


    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <Text>Requesting for camera permisson</Text>
            </View>
        )
    }
    
    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <Text>No access to camera</Text> 
                <Button title={'Allow Camera'} onPress={() => getBarCodeScannerPermissions()}/>
            </View>
        )
    }

    return (
        <View style={brcd_styles.container}>
            <BarCodeScanner
                onBarCodeScanned={ scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />
            {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
        </View>
    );
};


// styles specific to Barcode Scanner Screen
const brcd_styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E3FDE0',
        padding: 20,
    },

    barcodebox: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    }
});

export default ScannerScreen;