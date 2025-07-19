// This component acts as the header for the main app, allowing profile switching.

import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, SafeAreaView, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useProfileStore } from '../lib/stores/profile.store'; // Confirmed usage of useProfileStore
import { useAuthStore } from '../lib/stores/auth.store';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileSwitcher() {
  const { profiles, activeProfile, setActiveProfile, setDefaultProfile } = useProfileStore();
  const { logout } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);

  if (!activeProfile) {
    return (
      <SafeAreaView style={styles.header}>
        <ActivityIndicator color="#000" />
      </SafeAreaView>
    );
  }

  const handleProfileSelect = (profileId: string) => {
    setActiveProfile(profileId);
    setModalVisible(false);
  };

  return (
    <>
      <SafeAreaView style={styles.header}>
        <Pressable style={styles.pressable} onPress={() => setModalVisible(true)}>
          <View>
            <Text style={styles.activeProfileName}>{activeProfile.name}</Text>
            <Text style={styles.activeProfileType}>{activeProfile.type}</Text>
          </View>
          <Ionicons name="chevron-down" size={24} color="black" />
        </Pressable>
      </SafeAreaView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Switch Profile</Text>
            <FlatList
              data={profiles}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.profileRow} onPress={() => handleProfileSelect(item.id)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.profileName}>{item.name}</Text>
                    <Text style={styles.profileType}>{item.type}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setDefaultProfile(item.id)}>
                    <Ionicons name="star-outline" size={24} color="gray" />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.logoutButton} onPress={() => { setModalVisible(false); logout(); }}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}



const styles = StyleSheet.create({
    header: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
    pressable: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    activeProfileName: { fontSize: 18, fontWeight: '600' },
    activeProfileType: { fontSize: 14, color: 'gray', textTransform: 'capitalize' },
    modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    profileRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    profileName: { fontSize: 18 },
    profileType: { fontSize: 14, color: 'gray', textTransform: 'capitalize' },
    logoutButton: { backgroundColor: '#ff3b30', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
    logoutText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});