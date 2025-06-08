import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RideLocation {
  lat: number;
  lng: number;
  address: string;
  placeId?: string;
}

export interface Ride {
  id: number;
  pickupLocation: RideLocation;
  dropoffLocation: RideLocation;
  scheduledTime: string;
  vehicleType: string;
  passengerCount: number;
  specialRequirements?: string;
  emergencyContact?: string;
  paymentMethod: string;
  status: string;
}

export interface RideBookingRequest {
  pickupLocation: RideLocation;
  dropoffLocation: RideLocation;
  scheduledTime: string;
  vehicleType: string;
  passengerCount: number;
  specialRequirements?: string;
  emergencyContact?: string;
  paymentMethod: string;
  estimatedFare: number;
  route?: any;
}

@Injectable({
  providedIn: 'root'
})
export class RideService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createRide(data: RideBookingRequest): Observable<Ride> {
    return this.http.post<Ride>(`${this.apiUrl}/rides`, data);
  }

  getUserRides(): Observable<Ride[]> {
    return this.http.get<Ride[]>(`${this.apiUrl}/rides`);
  }

  getRideById(id: number): Observable<Ride> {
    return this.http.get<Ride>(`${this.apiUrl}/rides/${id}`);
  }
}
