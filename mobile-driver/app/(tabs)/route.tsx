import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, FlatList, TouchableOpacity } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { fetchOptimizedRouteWithGPS, decodeOverviewPolyline } from '@/lib/api/maps.api';

// Hardcode driver id = 1 as requested
const DRIVER_ID = 1;

export default function RouteScreen() {
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [markers, setMarkers] = useState<{ latitude: number; longitude: number; title?: string }[]>([]);
  const [legs, setLegs] = useState<any[]>([]);
  const [summary, setSummary] = useState<{ distance?: string; duration?: string } | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  

  // defer optimization until button press
  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading)
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={
          coords.length > 0
            ? {
                latitude: coords[0].latitude,
                longitude: coords[0].longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }
            : { latitude: 6.9271, longitude: 79.8612, latitudeDelta: 0.5, longitudeDelta: 0.5 }
        }
      >
        {coords.length > 0 && <Polyline coordinates={coords} strokeWidth={4} strokeColor="#2563eb" />}
        {markers.map((m, i) => (
          <Marker key={`m-${i}`} coordinate={{ latitude: m.latitude, longitude: m.longitude }} title={m.title} />
        ))}
      </MapView>

      {/* Bottom panel with summary and legs */}
      <View style={{ position: 'absolute', left: 12, right: 12, bottom: 12 }}>
        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 12, shadowColor: '#000', shadowOpacity: 0.1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontWeight: '600' }}>{summary ? `${summary.distance}` : '—'}</Text>
            <Text style={{ color: '#6b7280' }}>{summary ? `${summary.duration}` : ''}</Text>
          </View>

          <FlatList
            data={legs}
            keyExtractor={(_, idx) => `leg-${idx}`}
            style={{ maxHeight: 180 }}
            renderItem={({ item, index }) => (
              <View style={{ paddingVertical: 6, borderTopWidth: index === 0 ? 0 : 1, borderTopColor: '#eee' }}>
                <Text style={{ fontWeight: '600' }}>{`Segment ${index + 1}`}</Text>
                <Text style={{ color: '#374151' }}>{`${item.start_address} → ${item.end_address}`}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#6b7280' }}>{item.distance?.text ?? ''}</Text>
                  <Text style={{ color: '#6b7280' }}>{item.duration?.text ?? ''}</Text>
                </View>
              </View>
            )}
          />

          <View style={{ marginTop: 8 }}>
            <TouchableOpacity
              onPress={async () => {
                setLoading(true);
                try {
                  let latitude: number | undefined;
                  let longitude: number | undefined;
                  try {
                    const Location = await import('expo-location');
                    const perm = await Location.requestForegroundPermissionsAsync();
                    if (perm.status === 'granted') {
                      const loc = await Location.getCurrentPositionAsync({});
                      latitude = loc.coords.latitude;
                      longitude = loc.coords.longitude;
                    }
                  } catch {}
                  const result = await fetchOptimizedRouteWithGPS(DRIVER_ID, latitude, longitude);
                  if (result.polyline) {
                    const d = decodeOverviewPolyline(result.polyline);
                    setCoords(d);
                    if (d.length > 0) {
                      setMarkers([
                        { latitude: d[0].latitude, longitude: d[0].longitude, title: 'Start' },
                        { latitude: d[d.length - 1].latitude, longitude: d[d.length - 1].longitude, title: 'End' },
                      ]);
                    }
                  }
                  // compute summary from cumulative legs
                  const totalDistance = result.totalDistanceMeters;
                  const totalDuration = result.totalDurationSecs;
                  setSummary({ distance: `${(totalDistance / 1000).toFixed(2)} km`, duration: `${Math.round(totalDuration / 60)} min` });
                  // Present a simple leg list from stops
                  const legsList = result.stops.map((s) => ({
                    start_address: '',
                    end_address: s.address,
                    distance: { value: s.legDistanceMeters, text: `${(s.legDistanceMeters / 1000).toFixed(1)} km` },
                    duration: { value: s.etaSecs, text: '' },
                  }));
                  setLegs(legsList);
                  setCurrentIndex(0);
                } catch (e) {
                  console.warn(e);
                } finally {
                  setLoading(false);
                }
              }}
              style={{ alignItems: 'center', padding: 10, backgroundColor: '#0ea5e9', borderRadius: 8 }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Optimize Route</Text>
            </TouchableOpacity>
            <View style={{ height: 8 }} />
            <TouchableOpacity
              onPress={async () => {
                try {
                  // mark current as arrived (requires backend waypoint id; fallback no-op)
                  // here we just advance the index for UI simplicity
                  setCurrentIndex((i) => Math.min(i + 1, Math.max(legs.length - 1, 0)));
                } catch {}
              }}
              style={{ alignItems: 'center', padding: 10, backgroundColor: '#10b981', borderRadius: 8 }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Next Stop</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
