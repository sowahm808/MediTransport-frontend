import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Location {
  lat: number;
  lng: number;
  address: string;
  placeId?: string;
}

export interface RouteInfo {
  distance: string;
  duration: string;
  steps: google.maps.DirectionsStep[];
  polyline: google.maps.DirectionsRoute['overview_polyline'];
}

@Injectable({
  providedIn: 'root'
})
export class MapsService {
  private map: google.maps.Map | null = null;
  private directionsService: google.maps.DirectionsService | null = null;
  private directionsRenderer: google.maps.DirectionsRenderer | null = null;
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private geocoder: google.maps.Geocoder | null = null;
  private userLocationSubject = new BehaviorSubject<Location | null>(null);

  public userLocation$ = this.userLocationSubject.asObservable();

  constructor() {
    this.loadGoogleMaps();
  }

  private async loadGoogleMaps(): Promise<void> {
    try {
      // Dynamic import to avoid SSR issues
      const { Loader } = await import('@googlemaps/js-api-loader');

      const loader = new Loader({
        apiKey: environment.googleMapsApiKey,
        version: 'weekly',
        libraries: ['places', 'geometry']
      });

      await loader.load();
      this.initializeServices();
    } catch (error) {
      console.error('Error loading Google Maps:', error);
    }
  }

  private initializeServices(): void {
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#3880ff',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    });
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.geocoder = new google.maps.Geocoder();
  }

  async initializeMap(
    mapElement: HTMLElement,
    center: Location = { lat: 40.7128, lng: -74.0060, address: 'New York, NY' }
  ): Promise<google.maps.Map> {
    if (!google?.maps) {
      throw new Error('Google Maps not loaded');
    }

    this.map = new google.maps.Map(mapElement, {
      center: { lat: center.lat, lng: center.lng },
      zoom: 13,
      styles: this.getMapStyles(),
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true
    });

    if (!this.placesService) {
      this.placesService = new google.maps.places.PlacesService(this.map);
    }

    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(this.map);
    }

    return this.map;
  }

  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Current Location'
          };

          try {
            const address = await this.reverseGeocode(location.lat, location.lng);
            location.address = address;
          } catch (error) {
            console.warn('Reverse geocoding failed:', error);
          }

          this.userLocationSubject.next(location);
          resolve(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  }

  async searchPlaces(query: string): Promise<google.maps.places.AutocompletePrediction[]> {
    if (!this.autocompleteService || !query.trim()) {
      return [];
    }

    return new Promise((resolve, reject) => {
      this.autocompleteService!.getPlacePredictions(
        {
          input: query,
          types: ['establishment', 'geocode'],
          componentRestrictions: { country: 'us' }
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            resolve(predictions);
          } else {
            resolve([]);
          }
        }
      );
    });
  }

  async getPlaceDetails(placeId: string): Promise<Location> {
    if (!this.placesService) {
      throw new Error('Places service not initialized');
    }

    return new Promise((resolve, reject) => {
      this.placesService!.getDetails(
        { placeId, fields: ['geometry', 'formatted_address', 'name'] },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
            resolve({
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              address: place.formatted_address || place.name || 'Unknown location',
              placeId
            });
          } else {
            reject(new Error('Place details not found'));
          }
        }
      );
    });
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    if (!this.geocoder) {
      throw new Error('Geocoder not initialized');
    }

    return new Promise((resolve, reject) => {
      this.geocoder!.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
            resolve(results[0].formatted_address);
          } else {
            reject(new Error('Reverse geocoding failed'));
          }
        }
      );
    });
  }

  async calculateRoute(origin: Location, destination: Location): Promise<RouteInfo> {
    if (!this.directionsService) {
      throw new Error('Directions service not initialized');
    }

    return new Promise((resolve, reject) => {
      this.directionsService!.route(
        {
          origin: { lat: origin.lat, lng: origin.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          travelMode: google.maps.TravelMode.DRIVING,
          avoidHighways: false,
          avoidTolls: false
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result?.routes?.[0]) {
            const route = result.routes[0];
            const leg = route.legs[0];

            resolve({
              distance: leg.distance?.text || 'Unknown',
              duration: leg.duration?.text || 'Unknown',
              steps: leg.steps || [],
              polyline: route.overview_polyline
            });
          } else {
            reject(new Error(`Route calculation failed: ${status}`));
          }
        }
      );
    });
  }

  displayRoute(origin: Location, destination: Location): void {
    if (!this.directionsRenderer || !this.map) {
      console.error('Map or directions renderer not initialized');
      return;
    }

    this.directionsService?.route(
      {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.directionsRenderer!.setDirections(result);
        }
      }
    );
  }

  addMarker(location: Location, title?: string, icon?: string): google.maps.Marker | null {
    if (!this.map) {
      console.error('Map not initialized');
      return null;
    }

    return new google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: this.map,
      title: title || location.address,
      icon: icon || {
        url: 'assets/icons/marker-default.png',
        scaledSize: new google.maps.Size(32, 32)
      }
    });
  }

  clearMap(): void {
    if (this.directionsRenderer) {
      this.directionsRenderer.setDirections({ routes: [] } as any);
    }
  }

  private getMapStyles(): google.maps.MapTypeStyle[] {
    return [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'transit',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#a2daf2' }]
      },
      {
        featureType: 'landscape.man_made',
        elementType: 'geometry.fill',
        stylers: [{ color: '#f7f1df' }]
      }
    ];
  }

  estimateFare(distance: string, duration: string, vehicleType: string = 'standard'): number {
    // Basic fare calculation
    const baseRate = 5.0;
    const perMileRate = vehicleType === 'wheelchair-accessible' ? 3.5 :
                       vehicleType === 'stretcher-enabled' ? 4.0 : 2.5;

    const distanceValue = parseFloat(distance.replace(/[^\d.]/g, '')) || 0;
    const estimatedFare = baseRate + (distanceValue * perMileRate);

    return Math.max(estimatedFare, 10); // Minimum fare
  }
}
