import React, { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, Image, Pressable, Modal} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Svg, { G, Circle } from 'react-native-svg'
import { differenceInCalendarDays } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { styles } from '../Styles';
import { auth, db } from '../firebaseConfig';

// creating graph: https://dev.to/franciscomendes10866/how-to-create-a-donut-chart-using-react-native-svg-30m9 

const WeeklyReportScreen = () => {
    const [ totalQuantity, setTotalQuantity ] = useState(0);
    const [ totalExpired, setTotalExpired ] = useState(0);
    const [ catPicIndex, setCatPicIndex ] = useState(-1)
    const [ customizeModalVisible, setCustomizeModalVisible ] = useState(false);
    const isFocused = useIsFocused();

    const graphRadius = 70;
    const graphCircumference = 2 * Math.PI * graphRadius;

    var percentage = totalQuantity === 0 ? 0 : Math.round(((totalQuantity - totalExpired)/totalQuantity) * 100);
    const strokeDashoffset = 
        graphCircumference - (graphCircumference * percentage) / 100;

    var cat_status = 'HAPPY';

    var accessory_images = [
        require('../assets/HAPPY_CAT.png'),
        require('../assets/SAD_CAT.png'),
        require('../assets/cat-accessories/happy_bow.png'),
        require('../assets/cat-accessories/sad_bow.png'),
        require('../assets/cat-accessories/happy_hat.png'),
        require('../assets/cat-accessories/sad_hat.png'),
        require('../assets/cat-accessories/happy_glasses.png'),
        require('../assets/cat-accessories/sad_glasses.png'),
    ]

    var imageSource = require(`../assets/HAPPY_CAT.png`);

    if (percentage > 50) {
        cat_status = 'HAPPY';
        imageSource = require(`../assets/HAPPY_CAT.png`);
    } else {
        cat_status = 'SAD';
        imageSource = require(`../assets/SAD_CAT.png`);
    }

    const fetchFoodReport = async () => {
        var inventoryTotal = 0;
        var expired = 0;

        try {
            const user = auth.currentUser;
            if (user) {
                const userDoc = await db.collection('users').doc(user.uid)
                .collection('items')
                .onSnapshot((snapshot) => {
                  const inventoryData = snapshot.docs.map((doc) => doc.data());
                  if (inventoryData) {
                    inventoryData.forEach(item => {
                        const expDateRaw = item.expirationDate.split('/');
                        const expDateFormatted = new Date(parseInt(expDateRaw[2], 10), parseInt(expDateRaw[0], 10) - 1, parseInt(expDateRaw[1], 10));
                        const daysLeft = differenceInCalendarDays(expDateFormatted, new Date())

                        inventoryTotal += parseInt(item.quantity);
                        if (daysLeft < 1) {
                            expired += parseInt(item.quantity);
                        }

                      }) 
                    setTotalQuantity(inventoryTotal);
                    setTotalExpired(expired);
                  } else {
                    setTotalQuantity(0);
                    setTotalExpired(0);
                  }
                });
            }
        } catch (error) {
            console.error('Error fetching inventory items:', error);
        }
      };

    const handleCustomizationPurchase = async (index) => {
         var i = index;
        if (cat_status === 'SAD') {
            i += 1;
        }
        if (index == 4 || index == 6) {
            const user = auth.currentUser;
            const userDoc = await db.collection('users').doc(user.uid)
            let userPoints = 0;
            userDoc.get().then(async (doc) => {
                userPoints = doc.data().points || 0;
            }).then(() => {
    
                    if ((userPoints < 10 && index == 4) || (userPoints < 25 && index == 6)) {
                        Alert.alert(
                            'Insufficient Funds',
                            'You do not have enough coins to purchase this accessory.',
                            [
                                {
                                    text: 'OK',
                                },
                            ]
                        );
                    } else {
                        setCatPicIndex(i);
                        if (index == 4) {
                            userDoc.update({
                                points: userPoints - 10
                            })
                        } else if (index == 6) {
                            userDoc.update({
                                points: userPoints - 25
                            })
                        }
                        Alert.alert(
                            'Item Purchased!',
                            'New customization unlocked',
                            [
                                {
                                    text: 'OK',
                                },
                            ]
                        );
                    }
            })
        } else {
            setCatPicIndex(i);
        }
        
        try {
            await AsyncStorage.setItem('catPicIndex', i.toString());
        } catch (error) {
            console.error('Error saving catPicIndex value to AsyncStorage:', error);
        }
    }

    const customizeModal = () => {
        return (
            <Modal
                animationType="slide"
                visible={customizeModalVisible}
                transparent={true}
                onRequestClose={() => {
                    setCustomizeModalVisible(!customizeModalVisible);
                }}>
                <View style={{ backgroundColor: '#0000000aa', flex: 1, justifyContent: 'center' }}>
                    <View style={wkrp_styles.customize_modal}>
                        <Text style={{fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 15}}>Customize</Text>
                        <Image source={catPicIndex === -1 ? imageSource : accessory_images[catPicIndex]} style={{width: 200, height: 200, alignSelf: 'center'}}/>
                        <View style={{borderWidth: 1, borderColor: '#000', height: 80, borderRadius: 4, alignItems: 'center', justifyContent: 'space-around', flexDirection: 'row' }}>
                            <Pressable
                                onPress={() => {
                                    handleCustomizationPurchase(0)
                                }}>
                                <View style={styles.valign_items}>
                                    <Image source={require(`../assets/default_none.png`)} style={{height: 50, width: 50, resizeMode: 'contain'}}/>
                                    <Text>Free</Text>
                                </View>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    handleCustomizationPurchase(2)
                                }}>
                                <View style={styles.valign_items}>
                                    <Image source={require(`../assets/pink-blue-bow.png`)} style={{height: 50, width: 50, resizeMode: 'contain'}}/>
                                    <Text>Free</Text>
                                </View>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    handleCustomizationPurchase(4)
                                }}>
                                <View style={styles.valign_items}>
                                    <Image source={require(`../assets/blue-hat.png`)} style={{height: 50, width: 60, resizeMode: 'contain'}}/>
                                    <Text>10 coins</Text>
                                </View>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    handleCustomizationPurchase(6)
                                }}>
                                <View style={styles.valign_items}>
                                    <Image source={require(`../assets/circle-glasses.png`)} style={{height: 50, width: 50, resizeMode: 'contain'}}/>
                                    <Text>25 coins</Text>
                                </View>
                            </Pressable>
                        </View>
                        <View style={{alignItems: 'center', justifyContent: 'center', backgroundColor: '#3F6C51', paddingVertical: 8, borderRadius: 15}}>
                            <Pressable
                                onPress={() => setCustomizeModalVisible(false)}>
                                <Text style={{fontSize: 18, fontWeight: '500', color: 'white',}}>Close</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }

    // refreshes report data whenever user goes to Weekly Report Screen
    useEffect(() => {
        if (isFocused) {
            fetchFoodReport();
            const loadCatPic = async () => {
                try {
                  const value = await AsyncStorage.getItem('catPicIndex');
                  if (value !== null) {
                    setCatPicIndex(parseInt(value));
                  }
                } catch (error) {
                  console.error('Error loading catPicIndex value from AsyncStorage:', error);
                }
            }
            loadCatPic();
        }
    }, [isFocused])

    
    return (
        <View style={wkrp_styles.container}>
            <Text style={styles.header}>Weekly Report</Text>
            <View style={styles.horizontal_line} />
            <View style={wkrp_styles.status_block}>
                <View style={styles.valign_items}>
                    <Text>Your cat is...</Text>
                    <Text style={{fontWeight: 'bold'}}>{cat_status}</Text>
                    <Image source={catPicIndex === -1 ? imageSource : accessory_images[catPicIndex]} style={wkrp_styles.image}/>
                    <Pressable
                        style={{backgroundColor: '#3F6C51', padding: 5, borderRadius: 5}}
                        onPress={() => {setCustomizeModalVisible(true)}}
                        >
                        <Text style={{color: 'white'}}>Customize</Text>
                    </Pressable>
                </View>
                <View style={wkrp_styles.graphWrapper}>
                    <Svg height='200' width='200' viewBox='0 0 180 180'>
                        <G rotation={-90} originX='90' originY='90'>
                            <Circle
                                // how it becomes a donut
                                cx={'50%'}
                                cy={'50%'}
                                r={graphRadius}
                                stroke='#F1F6F9'
                                fill='transparent'
                                strokeWidth='25'
                            />
                            <Circle
                                cx={'50%'}
                                cy={'50%'}
                                r={graphRadius}
                                stroke='#9DE5F5'
                                fill='transparent'
                                strokeWidth='25'
                                strokeDasharray={graphCircumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap='round'
                            />
                        </G>
                    </Svg>
                    <View style={[{position: 'absolute'}, styles.valign_items]}>
                        <Text style={wkrp_styles.graphPercentText}>{percentage}%</Text>
                        <Text style={wkrp_styles.graphSmallText}>of your food was</Text>
                        <Text style={wkrp_styles.graphSmallText}>NOT wasted</Text>
                        <Text style={wkrp_styles.graphSmallText}>this week</Text>
                    </View>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'top', justifyContent: 'space-evenly', paddingTop: 5}}>
                    <View style={{alignItems: 'center', marginVertical: 5}}>
                        <Text style={wkrp_styles.savingsText}>{totalQuantity-totalExpired}</Text>
                        <Text>items ready</Text>
                        <Text>to be consumed</Text>
                        {/* <Text>they expired</Text> */}
                    </View>
                    <View style={styles.vertical_line}></View>
                    <View style={{alignItems: 'center', marginVertical: 5}}>
                        <Text style={wkrp_styles.wastedText}>{totalExpired}</Text>
                        <Text>items wasted</Text>
                        <Text>due to expiration</Text>
                    </View>
                </View>
            </View>
            {customizeModal()}
        </View>
    );
};

// styles specific to Weekly Report Screen
const wkrp_styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'top',
        backgroundColor: '#E3FDE0',
        paddingTop: 60, 
        padding: 20,
    },
    image: {
        width: 132,
        height: 132,
        margin: 10, 
    },

    status_block: {
        width: 316,
        height: 650,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#000000',
        paddingVertical: 15,
        justifyContent: 'space-evenly'
    },

    customize_modal: {
        backgroundColor: '#fff', 
        width: '80%', // fixed width
        height: '50%', // fixed height
        margin: 50,
        padding: 20, 
        borderRadius: 10, 
        alignSelf: 'center',
        justifyContent: 'space-between', 
        borderWidth: 1, 
        borderColor: '#000',
    }, 

    graphWrapper: {
        alignItems: 'center',
        justifyContent: 'center'
    },

    graphPercentText: {
        fontWeight: 'bold',
        fontSize: 28,
        color: '#75BE6F'
    },
    
    graphSmallText: {
        fontWeight: 'bold',
        fontSize: 10,
        color: '#75BE6F'
    },

    savingsText: {
        fontWeight: 'bold',
        fontSize: 32,
        color: '#75BE6F'
    }, 

    wastedText: {
        fontWeight: 'bold',
        fontSize: 32,
        color: '#EB4242'
    }, 
});

export default WeeklyReportScreen;