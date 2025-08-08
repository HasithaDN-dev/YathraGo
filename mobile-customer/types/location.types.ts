export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationDetails {
  name: string;
  address: string;
  coordinates: LocationCoordinates;
  placeId?: string;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface GooglePlace {
  place_id: string;
  formatted_address: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface LocationPickerProps {
  initialLocation?: LocationDetails;
  onLocationSelect: (location: LocationDetails) => void;
  title?: string;
  placeholder?: string;
  isVisible: boolean;
  onClose: () => void;
}
