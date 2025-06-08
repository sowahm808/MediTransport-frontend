import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { delay, of } from 'rxjs';

export interface Location {
  lat: number;
  lng: number;
  address: string;
  placeId?: string;
}

export interface RouteInfo {
  distance: string;
  duration: string;
  steps: any[];
  polyline: any;
}

@Injectable({
  providedIn: 'root'
})
export class MapsMockService {
  private userLocationSubject = new BehaviorSubject<Location | null>(null);
  public userLocation$ = this.userLocationSubject.asObservable();

  constructor() {}

  async initializeMap(mapElement: HTMLElement, center?: Location): Promise<any> {
    // Create a mock map div
    mapElement.innerHTML = `
      <div style="
        width: 100%;
        height: 300px;
        background: linear-gradient(45deg, #e8f5e8 25%, #f0f8f0 25%, #f0f8f0 50%, #e8f5e8 50%, #e8f5e8 75%, #f0f8f0 75%, #f0f8f0);
        background-size: 20px 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ddd;
        border-radius: 8px;
        color: #666;
        font-family: Arial, sans-serif;
        position: relative;
      ">
        <div style="text-align: center; background: rgba(255,255,255,0.9); padding: 20px; border-radius: 8px;">
          <div style="font-size: 24px; margin-bottom: 10px;">🗺️</div>
          <div style="font-weight: bold; margin-bottom: 5px;">Demo Map View</div>
          <div style="font-size: 12px;">Google Maps will load here with API key</div>
        </div>
      </div>
    `;

    return Promise.resolve({});
  }

  async getCurrentLocation(): Promise<Location> {
    // Mock current location (New York)
    const location: Location = {
      lat: 40.7128,
      lng: -74.0060,
      address: '123 Main St, New York, NY 10001'
    };

    this.userLocationSubject.next(location);
    return Promise.resolve(location);
  }

  async searchPlaces(query: string): Promise<any[]> {
    // Mock search results
    const mockResults = [
      {
        description: `${query} - Main Street Hospital`,
        place_id: 'mock_place_1',
        structured_formatting: {
          main_text: `${query} - Main Street Hospital`,
          secondary_text: 'Medical Center, New York, NY'
        }
      },
      {
        description: `${query} - Central Medical Plaza`,
        place_id: 'mock_place_2',
        structured_formatting: {
          main_text: `${query} - Central Medical Plaza`,
          secondary_text: 'Healthcare Facility, New York, NY'
        }
      },
      {
        description: `${query} - Downtown Clinic`,
        place_id: 'mock_place_3',
        structured_formatting: {
          main_text: `${query} - Downtown Clinic`,
          secondary_text: 'Medical Office, New York, NY'
        }
      }
    ];

    return new Promise(resolve => {
      setTimeout(() => resolve(mockResults), 300);
    });
  }

  async getPlaceDetails(placeId: string): Promise<Location> {
    // Mock place details
    const mockLocations: { [key: string]: Location } = {
      'mock_place_1': {
        lat: 40.7589,
        lng: -73.9851,
        address: 'Main Street Hospital, 456 Main St, New York, NY 10013',
        placeId: placeId
      },
      'mock_place_2': {
        lat: 40.7505,
        lng: -73.9934,
        address: 'Central Medical Plaza, 789 Central Ave, New York, NY 10019',
        placeId: placeId
      },
      'mock_place_3': {
        lat: 40.7282,
        lng: -74.0776,
        address: 'Downtown Clinic, 321 Downtown Blvd, New York, NY 10014',
        placeId: placeId
      }
    };

    return Promise.resolve(mockLocations[placeId] || {
      lat: 40.7128 + (Math.random() - 0.5) * 0.1,
      lng: -74.0060 + (Math.random() - 0.5) * 0.1,
      address: 'Mock Address, New York, NY',
      placeId: placeId
    });
  }

  async calculateRoute(origin: Location, destination: Location): Promise<RouteInfo> {
    // Mock route calculation
    const distance = Math.sqrt(
      Math.pow(destination.lat - origin.lat, 2) +
      Math.pow(destination.lng - origin.lng, 2)
    ) * 69; // Rough miles conversion

    return Promise.resolve({
      distance: `${distance.toFixed(1)} mi`,
      duration: `${Math.ceil(distance * 2)} min`,
      steps: [],
      polyline: null
    });
  }

  displayRoute(origin: Location, destination: Location): void {
    console.log('Mock: Displaying route from', origin.address, 'to', destination.address);
  }

  addMarker(location: Location, title?: string, icon?: string): any {
    console.log('Mock: Adding marker at', location.address, 'with title:', title);
    return {};
  }

  clearMap(): void {
    console.log('Mock: Clearing map');
  }

  estimateFare(distance: string, duration: string, vehicleType: string = 'standard'): number {
    const baseRate = 5.0;
    const perMileRate = vehicleType === 'wheelchair-accessible' ? 3.5 :
                       vehicleType === 'stretcher-enabled' ? 4.0 : 2.5;

    const distanceValue = parseFloat(distance.replace(/[^\d.]/g, '')) || 5;
    const estimatedFare = baseRate + (distanceValue * perMileRate);

    return Math.max(estimatedFare, 10); // Minimum fare
  }
}
