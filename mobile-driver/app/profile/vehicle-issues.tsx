import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/ui/Icon';

// --- Type Definitions ---

type Status = 'Accepted' | 'Pending';

interface Driver {
  id: string;
  name: string;
  regNo: string;
  status: Status;
}

// --- Mock Data ---
const driversData: Driver[] = [
  {
    id: '1',
    name: 'Robert Davis',
    regNo: '457',
    status: 'Accepted',
  },
  {
    id: '2',
    name: 'Hemal Perera',
    regNo: '321',
    status: 'Pending',
  },
  {
    id: '3',
    name: 'Supun Thilina',
    regNo: '589',
    status: 'Accepted',
  },
  {
    id: '4',
    name: 'John Doe',
    regNo: '123',
    status: 'Pending',
  },
];

// --- Reusable Components ---

const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const isAccepted = status === 'Accepted';
  const badgeStyle = {
    backgroundColor: isAccepted ? '#E0FFE0' : '#FFF3E0',
  };
  const textStyle = {
    color: isAccepted ? '#28A745' : '#FF9800',
  };

  return (
    <View style={[styles.badge, badgeStyle]}>
      <Text style={[styles.badgeText, textStyle]}>{status}</Text>
    </View>
  );
};

const DriverListItem: React.FC<{ driver: Driver }> = ({ driver }) => (
  <View style={styles.driverItemContainer}>
    <View style={styles.driverInfo}>
      <View style={styles.avatar}>
        <Icon name="User" size={32} color={Colors.primary} />
      </View>
      <View>
        <Text style={styles.driverName}>{driver.name}</Text>
        <Text style={styles.driverRegNo}>Reg No: {driver.regNo}</Text>
      </View>
    </View>
    <StatusBadge status={driver.status} />
  </View>
);

// --- Main App Screen Component ---
export default function VehicleIssuesScreen() {
  const [activeTab, setActiveTab] = useState('List');
  const tabs = ['List', 'Search', 'Requests'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vehicle Issues</Text>
          <View style={{ width: 24 }} /> {/* Spacer for centering title */}
        </View>

        {/* Tab Navigator */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tab}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Content Area */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Backup Drivers Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Backup Drivers</Text>
            <View style={styles.listContainer}>
              {driversData.map((driver, index) => (
                <React.Fragment key={driver.id}>
                  <DriverListItem driver={driver} />
                  {index < driversData.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#F4F6F8',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: '#888888',
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  activeTabIndicator: {
    height: 3,
    width: '100%',
    backgroundColor: Colors.primary,
    marginTop: 8,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  listContainer: {},
  driverItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E9F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  driverRegNo: {
    fontSize: 14,
    color: '#888888',
    marginTop: 2,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
});