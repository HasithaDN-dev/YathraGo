import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import CustomButton from '@/components/ui/CustomButton';
import BackupDriversModal from '@/components/ui/BackupDriversModal';

const vehicleData = {
  name: 'TOYOTA GDH 223 GL',
  rating: 4.1,
  type: 'Hiace',
  image: require('@/assets/images/vehicle.png'),
  licensePlate: 'WP CAB 1245',
  assistant: 'Include',
  seatingCapacity: '12/14',
  airCondition: 'Yes',
  status: true,
  documentsVerified: true,
};

export default function VehicleDetails() {
  const [isEnabled, setIsEnabled] = useState(vehicleData.status);
  const [modalVisible, setModalVisible] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.vehicleName}>{vehicleData.name}</Text>
            <View style={styles.ratingContainer}>
              <FontAwesome name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{vehicleData.rating}</Text>
              <View style={styles.hiaceContainer}>
                <Text style={styles.vehicleType}>{vehicleData.type}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.imageContainer}>
          <Image source={vehicleData.image} style={styles.vehicleImage} />
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specificationsContainer}>
            <View style={styles.specBox}>
              <Icon name="CarProfile" size={20} color={Colors.primary} />
              <Text style={styles.specTitle}>License Plate</Text>
              <Text style={styles.specValue}>{vehicleData.licensePlate}</Text>
            </View>
            <View style={styles.specBox}>
              <Icon name="Users" size={20} color={Colors.primary} />
              <Text style={styles.specTitle}>Assistant</Text>
              <Text style={styles.specValue}>{vehicleData.assistant}</Text>
            </View>
            <View style={styles.specBox}>
              <Icon name="UsersFour" size={20} color={Colors.primary} />
              <Text style={styles.specTitle}>Seating Capacity</Text>
              <Text style={styles.specValue}>{vehicleData.seatingCapacity}</Text>
            </View>
            <View style={styles.specBox}>
              <Icon name="Wind" size={20} color={Colors.primary} />
              <Text style={styles.specTitle}>Air Condition</Text>
              <Text style={styles.specValue}>{vehicleData.airCondition}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Vehicle Status</Text>
          <View style={styles.statusContainer}>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isEnabled ? "#1F4EAD" : "#f4f3f4"}
              ios_backgroundColor="#fff"
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
            <View style={[styles.statusBadge, { backgroundColor: isEnabled ? '#E9F5FF' : '#F8D7DA' }]}>
              <Text style={[styles.statusText, { color: isEnabled ? '#1F4EAD' : '#721C24' }]}>
                {isEnabled ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>In case of a inactivation of vehicle, this vehicle will not be displayed as a working vehicle for any user</Text>
          </View>

          <Text style={styles.sectionTitle}>Documents</Text>
          <View style={styles.documentsContainer}>
            <View style={styles.documentHeader}>
              <View style={styles.verifiedContainer}>
                <Text style={styles.documentStatus}>{vehicleData.documentsVerified ? 'Verified' : 'Not Verified'}</Text>
              </View>
            </View>
            <Text style={styles.documentDescription}>This vehicle s documents have been approved and verified by the Yathra Go admin board.</Text>
            <View style={styles.documentItem}>
              <Text>Revenue License</Text>
              <FontAwesome name="check-circle" size={20} color="#1F4EAD" />
            </View>
            <View style={styles.documentItem}>
              <Text>Vehicle Insurance</Text>
              <FontAwesome name="check-circle" size={20} color="#1F4EAD" />
            </View>
            <View style={styles.documentItem}>
              <Text>Vehicle Registration Document</Text>
              <FontAwesome name="check-circle" size={20} color="#1F4EAD" />
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.backupButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.backupButtonText}>Backup Drivers</Text>
        </TouchableOpacity>
        <CustomButton
          title="Add Backup Driver"
          onPress={() => { }}
          bgVariant='navyBlue'
          textVariant='white'
          size='medium'
        />
      </View>
      <BackupDriversModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    padding: 8,
    zIndex: 1,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  vehicleName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 16,
    color: 'black',
  },
  vehicleType: {
    fontSize: 16,
    color: 'black',
  },
  hiaceContainer: {
    backgroundColor: '#EFEFEF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  vehicleImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  contentContainer: {
    paddingHorizontal: 24,
    backgroundColor: 'white',
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  specificationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  specBox: {
    width: '48%',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  specTitle: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  specValue: {
    marginTop: 4,
    color: 'gray',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginLeft: 10,
  },
  statusText: {
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#E9F5FF',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    color: '#00529B',
    textAlign: 'center',
  },
  documentsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verifiedContainer: {
    backgroundColor: '#E9F5FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  documentStatus: {
    color: '#1F4EAD',
    fontWeight: 'bold',
  },
  documentDescription: {
    marginVertical: 16,
    color: 'gray',
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  backupButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backupButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
    marginRight: 8,
  },
});