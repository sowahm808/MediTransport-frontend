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
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonFab,
  IonFabButton,
  IonBadge,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonChip
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  timeOutline,
  cardOutline,
  personOutline,
  carOutline,
  locationOutline,
  calendarOutline,
  notificationsOutline
} from 'ionicons/icons';

import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.page.html',
  styleUrls: ['./patient-dashboard.page.scss'],
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
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonFab,
    IonFabButton,
    IonBadge,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonChip
  ],
})
export class PatientDashboardPage implements OnInit {
  currentUser: User | null = null;
  upcomingRides = [
    {
      id: 1,
      date: new Date(Date.now() + 86400000), // Tomorrow
      time: '10:30 AM',
      from: 'Home',
      to: 'City Hospital',
      status: 'confirmed',
      driver: 'John Doe'
    }
  ];

  recentRides = [
    {
      id: 2,
      date: new Date(Date.now() - 86400000), // Yesterday
      time: '2:00 PM',
      from: 'City Hospital',
      to: 'Home',
      status: 'completed',
      fare: 25.50
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({
      addOutline,
      timeOutline,
      cardOutline,
      personOutline,
      carOutline,
      locationOutline,
      calendarOutline,
      notificationsOutline
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }

  bookNewRide() {
    this.router.navigate(['/rides/book']);
  }

  viewRideHistory() {
    this.router.navigate(['/rides/history']);
  }

  viewPaymentHistory() {
    this.router.navigate(['/payments/history']);
  }

  viewProfile() {
    this.router.navigate(['/profile']);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed': return 'primary';
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'medium';
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }
}
