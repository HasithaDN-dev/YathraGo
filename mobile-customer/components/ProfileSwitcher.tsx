// This component acts as the header for the main app, allowing profile switching.

import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, SafeAreaView, ActivityIndicator, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useProfileStore } from '../lib/stores/profile.store';
import { useAuthStore } from '../lib/stores/auth.store';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';

export default function ProfileSwitcher() {
  const { profiles, activeProfile, setActiveProfile, setDefaultProfile, isLoading } = useProfileStore();
  const { logout } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.header}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#143373" size="small" />
          <Typography variant="body" className="ml-2 text-brand-neutralGray">
            Loading profiles...
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  if (!activeProfile) {
    return (
      <SafeAreaView style={styles.header}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#143373" size="small" />
          <Typography variant="body" className="ml-2 text-brand-neutralGray">
            Loading profile...
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  const handleProfileSelect = (profileId: string) => {
    setActiveProfile(profileId);
    setModalVisible(false);
  };

  const handleSetDefault = async (profileId: string) => {
    await setDefaultProfile(profileId);
    // Don't close modal, just show feedback
  };

  const getProfileIcon = (type: string) => {
    switch (type) {
      case 'child':
        return 'school';
      case 'staff':
        return 'briefcase';
      default:
        return 'person';
    }
  };

  const getProfileColor = (type: string) => {
    switch (type) {
      case 'child':
        return '#fdc334';
      case 'staff':
        return '#22c55e';
      default:
        return '#143373';
    }
  };

  return (
    <>
      <SafeAreaView style={styles.header}>
        <Pressable style={styles.pressable} onPress={() => setModalVisible(true)}>
          <View style={styles.profileInfo}>
            {activeProfile.profileImageUrl ? (
              <Image 
                source={{ uri: activeProfile.profileImageUrl }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileIcon, { backgroundColor: getProfileColor(activeProfile.type) }]}>
                <Ionicons 
                  name={getProfileIcon(activeProfile.type) as any} 
                  size={20} 
                  color="white" 
                />
              </View>
            )}
            <View style={styles.profileText}>
              <Typography variant="title-3" weight="semibold" className="text-brand-deepNavy">
                {activeProfile.name}
              </Typography>
              <Typography variant="caption-1" className="text-brand-neutralGray capitalize">
                {activeProfile.type}
              </Typography>
            </View>
          </View>
          <Ionicons name="chevron-down" size={20} color="#143373" />
        </Pressable>
      </SafeAreaView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography variant="title-2" weight="bold" className="text-brand-deepNavy">
                Switch Profile
              </Typography>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#143373" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={profiles}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.profileRow, 
                    activeProfile.id === item.id && styles.activeProfileRow
                  ]} 
                  onPress={() => handleProfileSelect(item.id)}
                >
                  <View style={styles.profileRowContent}>
                    {item.profileImageUrl ? (
                      <Image 
                        source={{ uri: item.profileImageUrl }} 
                        style={styles.profileRowImage}
                      />
                    ) : (
                      <View style={[styles.profileRowIcon, { backgroundColor: getProfileColor(item.type) }]}>
                        <Ionicons 
                          name={getProfileIcon(item.type) as any} 
                          size={16} 
                          color="white" 
                        />
                      </View>
                    )}
                    <View style={styles.profileRowText}>
                      <Typography variant="body" weight="medium" className="text-brand-deepNavy">
                        {item.name}
                      </Typography>
                      <Typography variant="caption-1" className="text-brand-neutralGray capitalize">
                        {item.type}
                      </Typography>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleSetDefault(item.id)}
                    style={styles.defaultButton}
                  >
                    <Ionicons 
                      name="star" 
                      size={20} 
                      color={activeProfile.id === item.id ? "#fdc334" : "#d1d5db"} 
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
              style={styles.profileList}
            />
            
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={() => { 
                setModalVisible(false); 
                logout(); 
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Typography variant="body" weight="medium" className="ml-2 text-white">
                Logout
              </Typography>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: { 
    backgroundColor: 'white', 
    borderBottomWidth: 1, 
    borderBottomColor: '#f3f4f6' 
  },
  pressable: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16 
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    flex: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  modalBackdrop: { 
    flex: 1, 
    justifyContent: 'flex-end', 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalContent: { 
    backgroundColor: 'white', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    padding: 20, 
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  profileList: {
    maxHeight: 400,
  },
  profileRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16, 
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  activeProfileRow: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#143373',
  },
  profileRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileRowImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  profileRowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileRowText: {
    flex: 1,
  },
  defaultButton: {
    padding: 8,
  },
  logoutButton: { 
    backgroundColor: '#ef4444', 
    padding: 16, 
    borderRadius: 12, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20 
  },
});