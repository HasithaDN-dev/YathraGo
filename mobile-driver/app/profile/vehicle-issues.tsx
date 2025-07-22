import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  StyleProp,
  ViewStyle,
  TextInput,
  Image,
} from 'react-native';
// For icons, you would typically install a library like react-native-vector-icons
// For this example, we'll use simple text placeholders and emojis.
// import { Ionicons } from '@expo/vector-icons';

// --- Type Definitions ---

type Status = 'Accepted' | 'Pending';

interface Driver {
  id: string;
  name: string;
  regNo: string;
  status: Status;
  currentLocation: string;
  avatarUrl: string;
  vehicleImageUrl: string;
}

// --- Mock Data ---
// Updated with more details for the search view
const driversData: Driver[] = [
  {
    id: '1',
    name: 'Robert Davis',
    regNo: '457',
    status: 'Accepted',
    currentLocation: 'Maharagama',
    avatarUrl: 'https://placehold.co/120x120/E3F2FD/333?text=RD',
    vehicleImageUrl: 'https://placehold.co/600x400/F9A825/white?text=Bus',
  },
  {
    id: '2',
    name: 'Hemal Perera',
    regNo: '321',
    status: 'Pending',
    currentLocation: 'Kottawa',
    avatarUrl: 'https://placehold.co/120x120/E3F2FD/333?text=HP',
    vehicleImageUrl: 'https://placehold.co/600x400/F9A825/white?text=Van',
  },
  {
    id: '3',
    name: 'Supun Thilina',
    regNo: '589',
    status: 'Accepted',
    currentLocation: 'Nugegoda',
    avatarUrl: 'https://placehold.co/120x120/E3F2FD/333?text=ST',
    vehicleImageUrl: 'https://placehold.co/600x400/F9A825/white?text=Bus',
  },
  {
    id: '4',
    name: 'John Doe',
    regNo: '123',
    status: 'Pending',
    currentLocation: 'Piliyandala',
    avatarUrl: 'https://placehold.co/120x120/E3F2FD/333?text=JD',
    vehicleImageUrl: 'https://placehold.co/600x400/F9A825/white?text=Car',
  },
];

// --- Color Palette & Theme ---
const theme = {
  colors: {
    background: '#F4F6F8',
    primary: '#0D1B4E',
    secondary: '#F9A825',
    text: '#333333',
    subtleText: '#888888',
    white: '#FFFFFF',
    success: '#2E7D32',
    border: '#E0E0E0',
    shadow: '#000000',
    inputBackground: '#EFEFEF',
  },
  spacing: {
    s: 8,
    m: 16,
    l: 24,
    xl: 40,
  },
  typography: {
    header: 24,
    title: 18,
    body: 16,
    caption: 12,
  },
};

// --- Reusable Components ---

// Status Badge for the List View
interface StatusBadgeProps {
  status: Status;
}
const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const badgeStyle: StyleProp<ViewStyle> = {
    backgroundColor: status === 'Accepted' ? theme.colors.success : theme.colors.secondary,
  };
  return (
    <View style={[styles.badge, badgeStyle]}>
      <Text style={styles.badgeText}>{status}</Text>
    </View>
  );
};

// Driver List Item for the List View
interface DriverListItemProps {
  driver: Driver;
}
const DriverListItem: React.FC<DriverListItemProps> = ({ driver }) => (
  <View style={styles.driverItemContainer}>
    <View style={styles.driverInfo}>
      <Image source={{ uri: driver.avatarUrl }} style={styles.avatar} />
      <View>
        <Text style={styles.driverName}>{driver.name}</Text>
        <Text style={styles.driverRegNo}>Reg No: {driver.regNo}</Text>
      </View>
    </View>
    <StatusBadge status={driver.status} />
  </View>
);

// Search Result Card for the Search View
interface SearchResultCardProps {
    driver: Driver;
}
const SearchResultCard: React.FC<SearchResultCardProps> = ({ driver }) => (
    <View style={styles.searchCard}>
        <View style={styles.searchCardHeader}>
            <Image source={{ uri: driver.avatarUrl }} style={styles.searchAvatar} />
            <View>
                <Text style={styles.searchDriverName}>{driver.name}</Text>
                <Text style={styles.searchRegNo}>Reg No: {driver.regNo}</Text>
            </View>
        </View>
        <View style={styles.searchCardBody}>
            <Text style={styles.locationLabel}>Current Location</Text>
            <View style={styles.locationContainer}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.locationText}>{driver.currentLocation}</Text>
            </View>
        </View>
        <Image source={{ uri: driver.vehicleImageUrl }} style={styles.vehicleImage} resizeMode="cover" />
    </View>
);


// --- Main App Screen Component ---
const VehicleIssuesScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('List');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>(driversData);
  const tabs = ['List', 'Search', 'Requests'];

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDrivers(driversData);
    } else {
      const filtered = driversData.filter(driver =>
        driver.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDrivers(filtered);
    }
  }, [searchQuery]);

  const renderContent = () => {
    switch (activeTab) {
      case 'List':
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Backup Drivers</Text>
            <View>
              {driversData.map((driver, index) => (
                <React.Fragment key={driver.id}>
                  <DriverListItem driver={driver} />
                  {index < driversData.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        );
      case 'Search':
        return (
          <View>
            <View style={styles.searchBarContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by driver name..."
                placeholderTextColor={theme.colors.subtleText}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            {filteredDrivers.map(driver => (
                <SearchResultCard key={driver.id} driver={driver} />
            ))}
          </View>
        );
      case 'Requests':
        return (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Requests</Text>
                <Text style={styles.bodyText}>Requests will be shown here.</Text>
            </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={{ fontSize: 24 }}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vehicle Issues</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
              <View style={styles.tab}>
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab}
                </Text>
                {activeTab === tab && <View style={styles.activeTabIndicator} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default VehicleIssuesScreen;

// --- Stylesheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    height: 60,
  },
  backButton: {
    padding: theme.spacing.s,
  },
  headerTitle: {
    fontSize: theme.typography.header,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    paddingVertical: theme.spacing.m,
    alignItems: 'center',
  },
  tabText: {
    fontSize: theme.typography.body,
    color: theme.colors.subtleText,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  activeTabIndicator: {
    height: 3,
    width: '100%',
    backgroundColor: theme.colors.primary,
    marginTop: theme.spacing.s,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: theme.spacing.m,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: theme.spacing.m,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  cardTitle: {
    fontSize: theme.typography.title,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },
  bodyText: {
    fontSize: theme.typography.body,
    color: theme.colors.subtleText,
  },
  driverItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: theme.spacing.m,
  },
  driverName: {
    fontSize: theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
  },
  driverRegNo: {
    fontSize: theme.typography.caption,
    color: theme.colors.subtleText,
    marginTop: 4,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: theme.typography.caption,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.s,
  },
  // Search View Styles
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.m,
    height: 50,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: theme.spacing.s,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.body,
    color: theme.colors.text,
  },
  searchCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    marginBottom: theme.spacing.m,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden', // to keep image corners rounded
  },
  searchCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
  },
  searchAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: theme.spacing.m,
  },
  searchDriverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  searchRegNo: {
    fontSize: 14,
    color: theme.colors.subtleText,
    marginTop: 4,
  },
  searchCardBody: {
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.m,
  },
  locationLabel: {
    fontSize: 14,
    color: theme.colors.subtleText,
    marginBottom: theme.spacing.s,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 16,
    marginRight: theme.spacing.s,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  vehicleImage: {
    width: '100%',
    height: 150,
  },
});
