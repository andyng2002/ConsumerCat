import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'left',
        justifyContent: 'center',
        backgroundColor: '#E3FDE0',
        padding: 20,
    },
    
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#3F6C51",
        borderBottomColor: 'black',
        borderBottomWidth: 5, 
    },

    horizontal_line: {
        width: '100%',     // Set the width to 100% to span the whole screen
        height: 1,         // Set the height to the desired thickness of the line
        backgroundColor: '#3F6C51',
        marginBottom: 15
    },

    vertical_line: {
        height: '100%',
        width: 2,
        backgroundColor: '#AAAAAA'
    },

    hz_align_items: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        marginTop: 10
    },

    valign_items: {
        alignItems: 'center',
        justifyContent:'center'
    },

    input: {
        borderColor: 'white',
        backgroundColor: '#e3e3e3',
        borderWidth: 1,
        paddingLeft: 10,
        borderRadius: 5,
    },
})

export { styles }