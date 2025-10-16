export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationDetails {
  name: string;
  address: string;
  coordinates: LocationCoordinates;
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
  types: string[];
  vicinity?: string;
}

export interface LocationPickerProps {
  initialLocation?: LocationDetails;
  onLocationSelect: (location: LocationDetails) => void;
  title?: string;
  placeholder?: string;
  isVisible: boolean;
  onClose: () => void;
}
