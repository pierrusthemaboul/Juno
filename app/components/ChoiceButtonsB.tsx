import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ChoiceButtonsBProps {
    onChoice: (chosenEventId: string) => void;
    disabled?: boolean;
    event1Id?: string;
    event2Id?: string;
}

const ChoiceButtonsB: React.FC<ChoiceButtonsBProps> = ({ 
    onChoice, 
    disabled,
    event1Id,
    event2Id 
}) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={[styles.button, disabled && styles.disabled]} 
                onPress={() => event1Id && onChoice(event1Id)}
                disabled={disabled}
            >
                <Text style={styles.text}>Plus récent</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.button, disabled && styles.disabled]}
                onPress={() => event2Id && onChoice(event2Id)}
                disabled={disabled}
            >
                <Text style={styles.text}>Plus ancien</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        padding: 15
    },
    button: {
        backgroundColor: '#4a90e2',
        padding: 15,
        borderRadius: 8,
        width: '45%',
        alignItems: 'center'
    },
    disabled: {
        backgroundColor: '#cccccc'
    },
    text: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default ChoiceButtonsB;