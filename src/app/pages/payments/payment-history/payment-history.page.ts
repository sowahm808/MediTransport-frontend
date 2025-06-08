import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-payment-history',
  template: '<ion-header><ion-toolbar color="primary"><ion-title>Payment History</ion-title></ion-toolbar></ion-header><ion-content><div style="padding: 1rem;">Payment history coming soon!</div></ion-content>',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar],
})
export class PaymentHistoryPage {}
