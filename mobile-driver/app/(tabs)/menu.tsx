import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../../lib/stores/auth.store';
import { useDriverStore } from '../../lib/stores/driver.store';
import ProfileMenuItem from '@/components/ui/ProfileMenuItem';
import { Icon } from '@/components/ui/Icon';

export default function MenuScreen() {
  const { logout } = useAuthStore();
  const { profile } = useDriverStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.profileImageContainer}>
          <Image
            source={require('../../assets/images/profile.png.jpeg')}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.cameraButton}>
            <Icon name="Camera" size={20} color="#143373" />
          </TouchableOpacity>
        </View>
        <Text style={styles.profileName}>{profile?.name || 'Nihal Perera'}</Text>
        <Text style={styles.profileType}>Driver</Text>
      </View>

      <View style={{ marginTop: 24 }}>
        <ProfileMenuItem icon="User" text="Personal Details" onPress={() => router.push('../profile/(personal)/personal')} />
        <ProfileMenuItem icon="Receipt" text="Transactions" onPress={() => router.push('/profile/earnings')} />
        <ProfileMenuItem icon="ChartLineUp" text="Trip Statistics" onPress={() => router.push('/profile/rides')} />
        <ProfileMenuItem icon="Car" text="Manage Vehicles" onPress={() => router.push('/profile/vehicle-details')} />
        <ProfileMenuItem icon="Headset" text="Help and Support" onPress={() => { }} />
        <ProfileMenuItem icon="Info" text="About Us" onPress={() => { }} />
        <ProfileMenuItem icon="SignOut" text="Logout" onPress={logout} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>©YathraGo 2025</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#fdc334',
    alignItems: 'center',
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#143373',
    marginTop: 24,
  },
  profileImageContainer: {
    position: 'relative',
    marginTop: 16,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#143373',
    marginTop: 8,
  },
  profileType: {
    color: '#143373',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerText: {
    color: '#6b7280',
  },
});
