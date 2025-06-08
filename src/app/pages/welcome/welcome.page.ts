import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { carOutline, medicalOutline, shieldCheckmarkOutline, timeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol
  ],
})
export class WelcomePage {
  features = [
    {
      icon: 'medical-outline',
      title: 'Medical Transportation',
      description: 'Specialized vehicles for medical appointments and emergencies'
    },
    {
      icon: 'time-outline',
      title: '24/7 Availability',
      description: 'Round-the-clock service for your medical transportation needs'
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Certified Drivers',
      description: 'Professional drivers trained in medical transportation'
    },
    {
      icon: 'car-outline',
      title: 'Accessible Vehicles',
      description: 'Wheelchair accessible and stretcher-enabled vehicles available'
    }
  ];

  constructor(private router: Router) {
    addIcons({ carOutline, medicalOutline, shieldCheckmarkOutline, timeOutline });
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/auth/register']);
  }
}
