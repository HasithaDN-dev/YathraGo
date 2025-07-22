import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Icon } from './Icon';

const drivers = [
  {
    id: 1,
    name: 'Suresh Alwis',
    nic: 'NIC 196787354230',
    avatar: require('../../assets/images/profile.png.jpeg'),
  },
  {
    id: 2,
    name: 'Pradeep Perera',
    nic: 'NIC 197232210507',
    avatar: require('../../assets/images/profile.png.jpeg'),
  },
];

interface BackupDriversModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function BackupDriversModal({ visible, onClose }: BackupDriversModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="X" size={24} color="gray" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Backup Drivers</Text>
          <Text style={styles.modalSubtitle}>Maximum three backup drivers can be allocated</Text>
          {drivers.map((driver) => (
            <View key={driver.id} style={styles.driverContainer}>
              <Image source={driver.avatar} style={styles.driverAvatar} />
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{driver.name}</Text>
                <Text style={styles.driverNic}>{driver.nic}</Text>
              </View>
              <TouchableOpacity style={styles.removeButton}>
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: 'gray',
    marginBottom: 24,
  },
  driverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  driverInfo: {
    flex: 1,
    marginLeft: 16,
  },
  driverName: {
    fontWeight: 'bold',
  },
  driverNic: {
    color: 'gray',
  },
  removeButton: {
    borderColor: 'red',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  removeButtonText: {
    color: 'red',
  },
});