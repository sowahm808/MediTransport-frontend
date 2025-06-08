import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { carOutline, peopleOutline, statsChartOutline } from 'ionicons/icons';

import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-driver-dashboard',
  templateUrl: './driver-dashboard.page.html',
  styleUrls: ['./driver-dashboard.page.scss'],
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
    IonIcon
  ],
})
export class DriverDashboardPage implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {
    addIcons({ carOutline, peopleOutline, statsChartOutline });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }
}
