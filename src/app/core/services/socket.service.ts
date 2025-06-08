import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface RideUpdate {
  rideId: number;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'canceled';
  timestamp: string;
  message?: string;
}

export interface LocationUpdate {
  rideId: number;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

export interface DriverStatus {
  driverId: number;
  available: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
}

export interface RideNotification {
  type: 'ride-assigned' | 'ride-started' | 'ride-completed' | 'driver-arrived' | 'emergency';
  rideId: number;
  title: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private rideUpdatesSubject = new BehaviorSubject<RideUpdate | null>(null);
  private locationUpdatesSubject = new BehaviorSubject<LocationUpdate | null>(null);
  private notificationsSubject = new BehaviorSubject<RideNotification | null>(null);
  private driverStatusSubject = new BehaviorSubject<DriverStatus | null>(null);

  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  public rideUpdates$ = this.rideUpdatesSubject.asObservable();
  public locationUpdates$ = this.locationUpdatesSubject.asObservable();
  public notifications$ = this.notificationsSubject.asObservable();
  public driverStatus$ = this.driverStatusSubject.asObservable();

  constructor(private authService: AuthService) {
    // Initialize connection when user is authenticated
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  private connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      console.error('No authentication token available');
      return;
    }

    this.socket = io(environment.socketUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      this.connectionStatusSubject.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      this.connectionStatusSubject.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      this.connectionStatusSubject.next(false);
    });

    // Ride events
    this.socket.on('ride-status-update', (data: RideUpdate) => {
      console.log('Ride status update:', data);
      this.rideUpdatesSubject.next(data);
    });

    this.socket.on('location-update', (data: LocationUpdate) => {
      console.log('Location update:', data);
      this.locationUpdatesSubject.next(data);
    });

    this.socket.on('driver-status-update', (data: DriverStatus) => {
      console.log('Driver status update:', data);
      this.driverStatusSubject.next(data);
    });

    // Notification events
    this.socket.on('ride-notification', (data: RideNotification) => {
      console.log('Ride notification:', data);
      this.notificationsSubject.next(data);
    });

    this.socket.on('emergency-alert', (data: RideNotification) => {
      console.log('Emergency alert:', data);
      this.notificationsSubject.next({
        ...data,
        type: 'emergency',
        priority: 'urgent'
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatusSubject.next(false);
    }
  }

  // Ride management methods
  joinRideRoom(rideId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('join-ride', rideId);
      console.log(`Joined ride room: ${rideId}`);
    }
  }

  leaveRideRoom(rideId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-ride', rideId);
      console.log(`Left ride room: ${rideId}`);
    }
  }

  updateRideStatus(rideId: number, status: RideUpdate['status'], message?: string): void {
    if (this.socket?.connected) {
      const update: Partial<RideUpdate> = {
        rideId,
        status,
        message,
        timestamp: new Date().toISOString()
      };
      this.socket.emit('ride-status-update', update);
    }
  }

  sendLocationUpdate(rideId: number, location: LocationUpdate): void {
    if (this.socket?.connected) {
      this.socket.emit('driver-location-update', {
        ...location,
        rideId,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Driver specific methods
  updateDriverAvailability(available: boolean, location?: { latitude: number; longitude: number }): void {
    if (this.socket?.connected) {
      const user = this.authService.getCurrentUser();
      if (user?.role === 'driver') {
        const update: Partial<DriverStatus> = {
          available,
          currentLocation: location,
          timestamp: new Date().toISOString()
        };
        this.socket.emit('driver-availability-update', update);
      }
    }
  }

  // Emergency methods
  sendEmergencyAlert(rideId: number, message: string, location?: { latitude: number; longitude: number }): void {
    if (this.socket?.connected) {
      this.socket.emit('emergency-alert', {
        rideId,
        message,
        location,
        timestamp: new Date().toISOString(),
        userId: this.authService.getCurrentUser()?.id
      });
    }
  }

  // Chat/Communication methods
  sendMessage(rideId: number, message: string, recipientRole: 'driver' | 'patient'): void {
    if (this.socket?.connected) {
      this.socket.emit('ride-message', {
        rideId,
        message,
        recipientRole,
        timestamp: new Date().toISOString(),
        senderId: this.authService.getCurrentUser()?.id
      });
    }
  }

  // Admin methods
  broadcastAnnouncement(message: string, targetRole?: 'patient' | 'driver'): void {
    if (this.socket?.connected) {
      const user = this.authService.getCurrentUser();
      if (user?.role === 'admin') {
        this.socket.emit('admin-announcement', {
          message,
          targetRole,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  // System status methods
  requestSystemStatus(): void {
    if (this.socket?.connected) {
      this.socket.emit('request-system-status');
    }
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionId(): string | null {
    return this.socket?.id || null;
  }

  // Real-time data streams
  getRideUpdatesForRide(rideId: number): Observable<RideUpdate> {
    return new Observable(observer => {
      const subscription = this.rideUpdates$.subscribe(update => {
        if (update && update.rideId === rideId) {
          observer.next(update);
        }
      });

      return () => subscription.unsubscribe();
    });
  }

  getLocationUpdatesForRide(rideId: number): Observable<LocationUpdate> {
    return new Observable(observer => {
      const subscription = this.locationUpdates$.subscribe(update => {
        if (update && update.rideId === rideId) {
          observer.next(update);
        }
      });

      return () => subscription.unsubscribe();
    });
  }

  // Error handling
  onError(): Observable<any> {
    if (!this.socket) {
      return new Observable(observer => {
        observer.error('Socket not connected');
      });
    }
    return fromEvent(this.socket, 'error');
  }

  // Reconnection handling
  onReconnect(): Observable<any> {
    if (!this.socket) {
      return new Observable(observer => {
        observer.error('Socket not connected');
      });
    }
    return fromEvent(this.socket, 'reconnect');
  }
}
