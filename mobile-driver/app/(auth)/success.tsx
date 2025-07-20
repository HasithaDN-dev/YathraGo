import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function SuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Corner Triangles */}
      <Image source={require('../../assets/images/right.png')} style={styles.topRightTriangle} />
    
      {/* Circles + Checkmark */}
      <View style={styles.circleWrapper}>
        <View style={styles.outerCircle} />
        <View style={styles.middleCircle} />
        <View style={styles.innerCircle} />
        <Image
          source={require('../../assets/images/tick.png')}
          style={styles.checkIcon}
        />
      </View>

       <Image source={require('../../assets/images/left.png')} style={styles.bottomLeftTriangle} /> 


      {/* Success Title */}
     <View> <Text style={styles.successText}>Success</Text>

      {/* Description */}
      <Text style={styles.descriptionText}>
        Your documents have been successfully submitted{'\n'}
        and are now under review
      </Text></View>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(tabs)')}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingHorizontal: 24,
    position: 'relative',
    justifyContent:'space-between'
  },
  topRightTriangle: {
    position: 'absolute',
    top: -30,
    right: -45,
    width: 200,
    height: 300,
    resizeMode: 'contain',
    
  },
  bottomLeftTriangle: {
    position: 'absolute',
    top:300,
    left: -55,
    width: 200,
    height: 300,
    resizeMode: 'contain',
    transform: [{ rotate: '0deg' }],
  },
  circleWrapper: {
    marginTop:270,
    marginBottom:0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 100,
    backgroundColor: '#4edc9c',
    opacity: 0.1,
  },
  middleCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 100,
    backgroundColor: '#32ba7c',
    opacity: 0.2,
  },
  innerCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 100,
    backgroundColor: '#0aa06e',
    opacity: 0.3,
  },
  checkIcon: {
    width: 90,
    height: 90,
    zIndex: 10,
  },
  successText: {
    fontSize: 34,
    fontWeight: '700',
    color: '#143373',
    marginTop: 80,
    marginBottom: 18,
    textAlign: 'center',
    fontFamily:'Figtree'
  },
  descriptionText: {
    fontSize: 16,
    fontWeight:'400',
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: 60,
    fontFamily:'Figtree'
  },
  button: {
    backgroundColor: '#FBBF24',
    paddingVertical: 16,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
