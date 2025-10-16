import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform, Text, FlatList, TouchableOpacity } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { getLatestRoute, fetchOptimizedRoute, decodeOverviewPolyline } from '@/lib/api/maps.api';

// Hardcode driver id = 1 as requested
const DRIVER_ID = 1;

export default function RouteScreen() {
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [markers, setMarkers] = useState<Array<{ latitude: number; longitude: number; title?: string }>>([]);
  const [legs, setLegs] = useState<any[]>([]);
  const [summary, setSummary] = useState<{ distance?: string; duration?: string } | null>(null);
  

  useEffect(() => {
    const run = async () => {
      try {
        // Trigger optimization on backend (hardcoded driver id 1)
        await fetchOptimizedRoute(DRIVER_ID);
      } catch (e) {
        console.warn('Optimize call failed', e);
      }

      // fetch the latest saved route
      const route = await getLatestRoute(DRIVER_ID);
      const details = route?.routeDetails;
      const overview = details?.routes?.[0]?.overview_polyline?.points;
      const routeLegs = details?.routes?.[0]?.legs ?? [];
      if (overview) {
        const decoded = decodeOverviewPolyline(overview);
        setCoords(decoded);
        // mark start and end
        if (decoded.length > 0) {
          setMarkers([
            { latitude: decoded[0].latitude, longitude: decoded[0].longitude, title: 'Start' },
            { latitude: decoded[decoded.length - 1].latitude, longitude: decoded[decoded.length - 1].longitude, title: 'End' },
          ]);
        }
      }
      // set legs and summary for UI
      if (routeLegs.length > 0) {
        setLegs(routeLegs);
        // compute total
        const totalDistance = routeLegs.reduce((acc: number, l: any) => acc + (l.distance?.value ?? 0), 0);
        const totalDuration = routeLegs.reduce((acc: number, l: any) => acc + (l.duration?.value ?? 0), 0);
        setSummary({ distance: `${(totalDistance / 1000).toFixed(2)} km`, duration: `${Math.round(totalDuration / 60)} min` });
      }
      setLoading(false);
    };
    run();
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
                  await fetchOptimizedRoute(DRIVER_ID);
                  const r = await getLatestRoute(DRIVER_ID);
                  const ov = r?.routeDetails?.routes?.[0]?.overview_polyline?.points;
                  if (ov) {
                    const d = decodeOverviewPolyline(ov);
                    setCoords(d);
                    setMarkers([
                      { latitude: d[0].latitude, longitude: d[0].longitude, title: 'Start' },
                      { latitude: d[d.length - 1].latitude, longitude: d[d.length - 1].longitude, title: 'End' },
                    ]);
                  }
                  const newLegs = r?.routeDetails?.routes?.[0]?.legs ?? [];
                  setLegs(newLegs);
                  const totalDistance = newLegs.reduce((acc: number, l: any) => acc + (l.distance?.value ?? 0), 0);
                  const totalDuration = newLegs.reduce((acc: number, l: any) => acc + (l.duration?.value ?? 0), 0);
                  setSummary({ distance: `${(totalDistance / 1000).toFixed(2)} km`, duration: `${Math.round(totalDuration / 60)} min` });
                } catch (e) {
                  console.warn(e);
                } finally {
                  setLoading(false);
                }
              }}
              style={{ alignItems: 'center', padding: 10, backgroundColor: '#0ea5e9', borderRadius: 8 }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Re-optimize Route</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
