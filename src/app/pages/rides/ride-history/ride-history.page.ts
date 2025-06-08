import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { RideService, Ride } from '../../../core/services/ride.service';

@Component({
  selector: 'app-ride-history',
  templateUrl: './ride-history.page.html',
  styleUrls: ['./ride-history.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge
  ],
})
export class RideHistoryPage implements OnInit {
  rides: Ride[] = [];

  constructor(private rideService: RideService, private router: Router) {}

  ngOnInit() {
    this.loadRides();
  }

  async loadRides() {
    try {
      this.rides = await firstValueFrom(this.rideService.getUserRides());
    } catch (error) {
      console.error('Failed to load rides', error);
    }
  }

  viewRide(id: number) {
    this.router.navigate(['/rides/details', id]);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'canceled':
        return 'danger';
      default:
        return 'primary';
    }
  }
}
