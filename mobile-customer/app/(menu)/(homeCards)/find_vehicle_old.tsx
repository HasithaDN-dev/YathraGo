import React, { useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Star, User, MapPin } from 'phosphor-react-native';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';

// Header switched to ScreenHeader (no profile switcher required)

interface VehicleListing {
  id: string;
  name: string;
  type: 'Toyota HIACE' | 'Laylend Bus';
  category: 'Van' | 'Bus';
  availableSeats: number;
  backupDrivers?: number;
  backupVehicles?: number;
  driverName: string;
  driverRating: number;
  vehicleId: string;
  route: string;
  pickupTime: string; // HH.MM
  dropTime: string;   // HH.MM
  startTime: string;  // Duplicate for UI labels (same as pickupTime)
  endTime: string;    // Duplicate for UI labels (same as dropTime)
  image: number; // require() returns a number in React Native
}

// Profiles removed since ScreenHeader is used instead of Header

const vehicleListings: VehicleListing[] = [
  // Vans (10)
  { id: 'v1', name: 'Toyota HIACE', type: 'Toyota HIACE', category: 'Van', availableSeats: 8, backupDrivers: 2, backupVehicles: 1, driverName: 'Hemal Perera', driverRating: 4.9, vehicleId: 'WP-5562', route: 'Maharagama → Nugegoda → Colombo 07', pickupTime: '05.30', dropTime: '16.00', startTime: '05.30', endTime: '16.00', image: require('../../../assets/images/van.png') },
  { id: 'v2', name: 'Toyota HIACE', type: 'Toyota HIACE', category: 'Van', availableSeats: 7, driverName: 'Sunil Silva', driverRating: 4.5, vehicleId: 'WP-3210', route: 'Piliyandala → Nugegoda → Bambalapitiya', pickupTime: '06.00', dropTime: '16.15', startTime: '06.00', endTime: '16.15', backupDrivers: 0, backupVehicles: 2, image: require('../../../assets/images/van.png') },
  { id: 'v3', name: 'Toyota HIACE', type: 'Toyota HIACE', category: 'Van', availableSeats: 6, driverName: 'Nuwan Fernando', driverRating: 4.2, vehicleId: 'WP-8899', route: 'Kottawa → Maharagama → Borella', pickupTime: '05.45', dropTime: '15.50', startTime: '05.45', endTime: '15.50', backupDrivers: 1, backupVehicles: 0, image: require('../../../assets/images/van.png') },
  { id: 'v4', name: 'Toyota HIACE', type: 'Toyota HIACE', category: 'Van', availableSeats: 10, driverName: 'Ruwan Jayasuriya', driverRating: 4.7, vehicleId: 'WP-4567', route: 'Battaramulla → Rajagiriya → Colombo 03', pickupTime: '06.10', dropTime: '16.30', startTime: '06.10', endTime: '16.30', backupDrivers: 3, backupVehicles: 2, image: require('../../../assets/images/van.png') },
  { id: 'v5', name: 'Toyota HIACE', type: 'Toyota HIACE', category: 'Van', availableSeats: 8, driverName: 'Kasun Perera', driverRating: 3.9, vehicleId: 'WP-1144', route: 'Thalawathugoda → Nugegoda → Colombo 04', pickupTime: '05.15', dropTime: '15.45', startTime: '05.15', endTime: '15.45', backupDrivers: 0, backupVehicles: 0, image: require('../../../assets/images/van.png') },
  { id: 'v6', name: 'Toyota HIACE', type: 'Toyota HIACE', category: 'Van', availableSeats: 9, driverName: 'Dilshan Abeysekera', driverRating: 4.8, vehicleId: 'WP-7788', route: 'Dehiwala → Wellawatte → Kollupitiya', pickupTime: '05.40', dropTime: '16.10', startTime: '05.40', endTime: '16.10', backupDrivers: 1, backupVehicles: 1, image: require('../../../assets/images/van.png') },
  { id: 'v7', name: 'Toyota HIACE', type: 'Toyota HIACE', category: 'Van', availableSeats: 7, driverName: 'Sahan Mendis', driverRating: 4.1, vehicleId: 'WP-2301', route: 'Homagama → Kottawa → Colombo 05', pickupTime: '05.20', dropTime: '16.05', startTime: '05.20', endTime: '16.05', backupDrivers: 2, backupVehicles: 0, image: require('../../../assets/images/van.png') },
  { id: 'v8', name: 'Toyota HIACE', type: 'Toyota HIACE', category: 'Van', availableSeats: 8, driverName: 'Gayan Wickramasinghe', driverRating: 4.4, vehicleId: 'WP-9922', route: 'Malabe → Battaramulla → Colombo 07', pickupTime: '05.50', dropTime: '16.20', startTime: '05.50', endTime: '16.20', backupDrivers: 0, backupVehicles: 3, image: require('../../../assets/images/van.png') },
  { id: 'v9', name: 'Toyota HIACE', type: 'Toyota HIACE', category: 'Van', availableSeats: 6, driverName: 'Tharindu Weerasinghe', driverRating: 3.8, vehicleId: 'WP-6400', route: 'Pannipitiya → Nugegoda → Colombo 02', pickupTime: '05.25', dropTime: '15.55', startTime: '05.25', endTime: '15.55', backupDrivers: 3, backupVehicles: 1, image: require('../../../assets/images/van.png') },
  { id: 'v10', name: 'Toyota HIACE', type: 'Toyota HIACE', category: 'Van', availableSeats: 8, driverName: 'Chathura Bandara', driverRating: 4.6, vehicleId: 'WP-7512', route: 'Kotte → Rajagiriya → Colombo 08', pickupTime: '06.05', dropTime: '16.25', startTime: '06.05', endTime: '16.25', backupDrivers: 1, backupVehicles: 0, image: require('../../../assets/images/van.png') },
  // Buses (10)
  { id: 'b1', name: 'Laylend Bus', type: 'Laylend Bus', category: 'Bus', availableSeats: 25, driverName: 'Ajith Kumara', driverRating: 4.3, vehicleId: 'WP-3500', route: 'Homagama → Maharagama → Royal College Colombo 7', pickupTime: '05.00', dropTime: '16.00', startTime: '05.00', endTime: '16.00', backupDrivers: 2, backupVehicles: 2, image: require('../../../assets/images/bus.png') },
  { id: 'b2', name: 'Laylend Bus', type: 'Laylend Bus', category: 'Bus', availableSeats: 30, driverName: 'Ranjith Perera', driverRating: 4.0, vehicleId: 'WP-3601', route: 'Dehiwala → Wellawatte → Bambalapitiya', pickupTime: '05.20', dropTime: '16.10', startTime: '05.20', endTime: '16.10', backupDrivers: 0, backupVehicles: 1, image: require('../../../assets/images/bus.png') },
  { id: 'b3', name: 'Laylend Bus', type: 'Laylend Bus', category: 'Bus', availableSeats: 28, driverName: 'Priyantha Silva', driverRating: 4.7, vehicleId: 'WP-4123', route: 'Kottawa → Nugegoda → Colombo 04', pickupTime: '05.45', dropTime: '16.30', startTime: '05.45', endTime: '16.30', backupDrivers: 3, backupVehicles: 0, image: require('../../../assets/images/bus.png') },
  { id: 'b4', name: 'Laylend Bus', type: 'Laylend Bus', category: 'Bus', availableSeats: 26, driverName: 'Rasika Tennakoon', driverRating: 4.1, vehicleId: 'WP-4789', route: 'Battaramulla → Rajagiriya → Borella', pickupTime: '05.35', dropTime: '16.05', startTime: '05.35', endTime: '16.05', backupDrivers: 1, backupVehicles: 1, image: require('../../../assets/images/bus.png') },
  { id: 'b5', name: 'Laylend Bus', type: 'Laylend Bus', category: 'Bus', availableSeats: 24, driverName: 'Suresh Madushanka', driverRating: 3.7, vehicleId: 'WP-5099', route: 'Borella → Town Hall → Fort', pickupTime: '05.10', dropTime: '15.50', startTime: '05.10', endTime: '15.50', backupDrivers: 0, backupVehicles: 0, image: require('../../../assets/images/bus.png') },
  { id: 'b6', name: 'Laylend Bus', type: 'Laylend Bus', category: 'Bus', availableSeats: 32, driverName: 'Isuru Dissanayake', driverRating: 4.9, vehicleId: 'WP-6008', route: 'Piliyandala → Kohuwala → Colombo 03', pickupTime: '06.00', dropTime: '16.40', startTime: '06.00', endTime: '16.40', backupDrivers: 2, backupVehicles: 3, image: require('../../../assets/images/bus.png') },
  { id: 'b7', name: 'Laylend Bus', type: 'Laylend Bus', category: 'Bus', availableSeats: 27, driverName: 'Harsha Premathilake', driverRating: 4.6, vehicleId: 'WP-6221', route: 'Malabe → Battaramulla → Colombo 07', pickupTime: '05.25', dropTime: '16.15', startTime: '05.25', endTime: '16.15', backupDrivers: 1, backupVehicles: 0, image: require('../../../assets/images/bus.png') },
  { id: 'b8', name: 'Laylend Bus', type: 'Laylend Bus', category: 'Bus', availableSeats: 29, driverName: 'Chaminda Jayasena', driverRating: 4.2, vehicleId: 'WP-7342', route: 'Kirulapone → Thimbirigasyaya → Kollupitiya', pickupTime: '05.50', dropTime: '16.35', startTime: '05.50', endTime: '16.35', backupDrivers: 0, backupVehicles: 2, image: require('../../../assets/images/bus.png') },
  { id: 'b9', name: 'Laylend Bus', type: 'Laylend Bus', category: 'Bus', availableSeats: 31, driverName: 'Mahesh Weerasekara', driverRating: 3.9, vehicleId: 'WP-8455', route: 'Kotte → Rajagiriya → Colombo 02', pickupTime: '05.30', dropTime: '16.00', startTime: '05.30', endTime: '16.00', backupDrivers: 3, backupVehicles: 1, image: require('../../../assets/images/bus.png') },
  { id: 'b10', name: 'Laylend Bus', type: 'Laylend Bus', category: 'Bus', availableSeats: 26, driverName: 'Niroshan Ranasinghe', driverRating: 4.4, vehicleId: 'WP-9012', route: 'Kaduwela → Malabe → Borella', pickupTime: '05.40', dropTime: '16.20', startTime: '05.40', endTime: '16.20', backupDrivers: 2, backupVehicles: 0, image: require('../../../assets/images/bus.png') },
];

export default function HomeScreen() {
  const [selectedVehicleType, setSelectedVehicleType] = useState<'Bus' | 'Van' | null>(null);
  const [pickupTime, setPickupTime] = useState('');
  const [dropTime, setDropTime] = useState('');
  const [rating, setRating] = useState(1);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [requestedMap, setRequestedMap] = useState<Record<string, boolean>>({});

  // 24-hour time helpers (HH.MM)
  const sanitizeTimeInput = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    if (digits.length <= 2) return digits; // typing hours
    const hh = digits.slice(0, 2);
    const mm = digits.slice(2, 4);
    return `${hh}${mm.length ? '.' + mm : ''}`;
  };

  const clampTime = (val: string) => {
    // Expect HH.MM, pad and clamp to 24-hour
    const parts = val.split('.') as [string, string?];
    let hh = parts[0] ?? '';
    let mm = parts[1] ?? '';
    if (hh.length === 1) hh = `0${hh}`;
    if (mm.length === 1) mm = `0${mm}`;
    const hNum = Math.max(0, Math.min(23, parseInt(hh || '0', 10)));
    const mNum = Math.max(0, Math.min(59, parseInt(mm || '0', 10)));
    const hStr = hNum.toString().padStart(2, '0');
    const mStr = mNum.toString().padStart(2, '0');
    return `${hStr}.${mStr}`;
  };

  // Filtered list derived from filters
  const filteredVehicles = useMemo(() => {
    const pt = pickupTime;
    const dt = dropTime;
    const pick = pickupLocation.trim().toLowerCase();
    const drop = dropLocation.trim().toLowerCase();
    return vehicleListings.filter(v => {
      const typeMatch = !selectedVehicleType || selectedVehicleType === v.category;
      const ratingMatch = v.driverRating >= rating;
      const pickupMatch = !pick || v.route.toLowerCase().includes(pick);
      const dropMatch = !drop || v.route.toLowerCase().includes(drop);
      const pickupTimeMatch = !pt || v.pickupTime === pt;
      const dropTimeMatch = !dt || v.dropTime === dt;
      return typeMatch && ratingMatch && pickupMatch && dropMatch && pickupTimeMatch && dropTimeMatch;
    });
  }, [selectedVehicleType, rating, pickupLocation, dropLocation, pickupTime, dropTime]);

  const VehicleCard = ({ vehicle }: { vehicle: VehicleListing }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/(menu)/(homeCards)/transport_overview', params: { tab: 'Vehicle' } })}
      className="mb-4"
    >
  <Card className="p-4 !bg-brand-deepNavy">
        <View className="flex-row">
        {/* Vehicle Image */}
        <View className="mr-4">
          <Image
            source={vehicle.image}
            style={{ width: 80, height: 60, borderRadius: 8 }}
            resizeMode="cover"
          />
        </View>

        {/* Vehicle Details */}
        <View className="flex-1">
          <View className="flex-row items-start justify-between mb-1">
            <Typography variant="title-3" weight="semibold" className="text-white mr-2">
              {vehicle.name}
            </Typography>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => {
                const already = requestedMap[vehicle.id];
                if (already) return; // no-op if already requested
                Alert.alert(
                  'Confirm',
                  'Request a seat from this vehicle?',
                  [
                    { text: 'No', style: 'cancel' },
                    {
                      text: 'Yes',
                      onPress: () => setRequestedMap((m) => ({ ...m, [vehicle.id]: true })),
                    },
                  ]
                );
              }}
              activeOpacity={0.85}
              className="px-3 py-1.5 rounded-full"
              style={{ backgroundColor: requestedMap[vehicle.id] ? Colors.successGreen : Colors.warmYellow }}
            >
              <Typography variant="caption-1" weight="semibold" style={{ color: Colors.deepNavy }}>
                {requestedMap[vehicle.id] ? 'Requested' : 'Request'}
              </Typography>
            </TouchableOpacity>
          </View>
          <Typography variant="footnote" className="text-white mb-1">
            Available seats: {vehicle.availableSeats}
          </Typography>
          {(vehicle.backupDrivers ?? 0) > 0 && (
            <Typography variant="caption-1" className="text-white mb-1">
              Backup Drivers: {vehicle.backupDrivers}
            </Typography>
          )}
          {(vehicle.backupVehicles ?? 0) > 0 && (
            <Typography variant="caption-1" className="text-white mb-2">
              Backup Vehicles: {vehicle.backupVehicles}
            </Typography>
          )}

          {/* Driver Info */}
          <View className="flex-row items-center mb-2">
            <View className="w-7 h-7 bg-yellow-300 rounded-full items-center justify-center mr-2">
              <User size={16} color="#143373" weight="fill" />
            </View>
            <Typography variant="footnote" className="text-white mr-3">
              {vehicle.driverName}
            </Typography>
            <View className="flex-row items-center">
              <Star size={14} color="#f5b301" weight="fill" />
              <Typography variant="footnote" className="text-white ml-1">
                {vehicle.driverRating}
              </Typography>
            </View>
          </View>

          {/* Vehicle ID and Route (stacked rows) */}
          <View className="mt-1">
            <Typography variant="caption-1" className="text-white">
              {vehicle.vehicleId}
            </Typography>
            {/* Start and End time in the same row */}
            <View className="flex-row mt-1 items-center">
              <Typography variant="caption-1" className="text-white mr-1">Start :</Typography>
              <Typography variant="caption-1" className="text-white mr-3">{vehicle.startTime}</Typography>
              <Typography variant="caption-1" className="text-white mr-1">End :</Typography>
              <Typography variant="caption-1" className="text-white">{vehicle.endTime}</Typography>
            </View>
            <Typography variant="caption-1" className="text-white mt-1">
              {vehicle.route}
            </Typography>
          </View>
        </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header - match Transport Overview style */}
        <ScreenHeader title="Find Vehicle" showBackButton />

        {/* Search and Filter Section (dark gray background) */}
        <Card className="mx-4 mb-4 p-4" style={{ backgroundColor: Colors.darkGray }}>
          {/* Pickup and Drop-off */}
          <View className="flex-row mb-4">
            <View className="flex-1 mr-3">
              <Typography variant="footnote" className="text-black mb-2">Pickup</Typography>
                <View className="rounded-full px-3 flex-row items-center" style={{ backgroundColor: Colors.white, height: 40 }}>
                  <MapPin size={16} color={Colors.neutralGray} />
                <TextInput
                  value={pickupLocation}
                  onChangeText={setPickupLocation}
                  placeholder="From"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-2 text-black"
                />
              </View>
            </View>
            <View className="flex-1">
              <Typography variant="footnote" className="text-black mb-2">Drop</Typography>
                <View className="rounded-full px-3 flex-row items-center" style={{ backgroundColor: Colors.white, height: 40 }}>
                  <MapPin size={16} color={Colors.neutralGray} />
                <TextInput
                  value={dropLocation}
                  onChangeText={setDropLocation}
                  placeholder="To"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-2 text-black"
                />
              </View>
            </View>
          </View>

          {/* Time and Ratings - Row 1 */}
          <View className="flex-row mb-4">
            <View className="flex-1 mr-3">
              <Typography variant="footnote" className="text-black mb-2">Pickup Time</Typography>
                <View className="rounded-full px-3 justify-center" style={{ backgroundColor: Colors.lightGray, height: 40 }}>
                <TextInput
          value={pickupTime}
          onChangeText={(t) => setPickupTime(sanitizeTimeInput(t))}
                  onBlur={() => setPickupTime((v) => (v ? clampTime(v) : v))}
                  keyboardType="numeric"
                  maxLength={5}
                  placeholder="HH.MM"
                  placeholderTextColor="#9CA3AF"
                  className="text-black text-center"
                />
              </View>
            </View>
            <View className="flex-1">
              <Typography variant="footnote" className="text-black mb-2">Ratings</Typography>
              <View className="rounded-full px-3 justify-center relative" style={{ backgroundColor: Colors.lightGray, height: 40 }}>
                <View className="absolute inset-0 items-center justify-center pointer-events-none">
                  <Typography variant="footnote" weight="medium" style={{ color: Colors.black }}>
                    {rating}
                  </Typography>
                </View>
                <Picker
                  selectedValue={rating}
                  onValueChange={(val) => setRating(Number(val))}
                  mode="dropdown"
                  dropdownIconColor={Colors.black}
                  style={{ height: 36, color: Colors.black }}
                >
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((v) => (
                    <Picker.Item key={v} label={`${v}`} value={v} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

      {/* Time and Type - Row 2 (Drop Time) */}
          <View className="flex-row">
            <View className="flex-1 mr-3">
        <Typography variant="footnote" className="text-black mb-2">Drop Time</Typography>
                <View className="rounded-full px-3 justify-center" style={{ backgroundColor: Colors.lightGray, height: 40 }}>
                <TextInput
          value={dropTime}
          onChangeText={(t) => setDropTime(sanitizeTimeInput(t))}
                  onBlur={() => setDropTime((v) => (v ? clampTime(v) : v))}
                  keyboardType="numeric"
                  maxLength={5}
                  placeholder="HH.MM"
                  placeholderTextColor="#9CA3AF"
                  className="text-black text-center"
                />
              </View>
            </View>

            <View className="flex-1">
              <Typography variant="footnote" className="text-black mb-2">Vehicle Type</Typography>
              <View className="rounded-full p-1 flex-row" style={{ backgroundColor: Colors.lightGray }}>
                <TouchableOpacity
                  className={`flex-1 items-center py-2 rounded-full`}
                  style={{ backgroundColor: selectedVehicleType === 'Bus' ? Colors.brightOrange : 'transparent' }}
                  onPress={() => setSelectedVehicleType('Bus')}
                  activeOpacity={0.8}
                >
                  <Typography
                    variant="footnote"
                    weight="medium"
                    className={`${selectedVehicleType === 'Bus' ? 'text-white' : ''}`}
                    style={{ color: selectedVehicleType === 'Bus' ? Colors.white : Colors.black }}
                  >
                    Bus
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 items-center py-2 rounded-full`}
                  style={{ backgroundColor: selectedVehicleType === 'Van' ? Colors.brightOrange : 'transparent' }}
                  onPress={() => setSelectedVehicleType('Van')}
                  activeOpacity={0.8}
                >
                  <Typography
                    variant="footnote"
                    weight="medium"
                    className={`${selectedVehicleType === 'Van' ? 'text-white' : ''}`}
                    style={{ color: selectedVehicleType === 'Van' ? Colors.white : Colors.black }}
                  >
                    Van
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Card>

        {/* Vehicle Listings (scrollable area) */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-4 pb-6">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
