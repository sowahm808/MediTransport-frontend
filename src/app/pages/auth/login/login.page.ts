import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonText,
  IonSpinner,
  IonCheckbox,
  IonGrid,
  IonRow,
  IonCol,
  IonAlert,
  AlertController,
  LoadingController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, mailOutline, lockClosedOutline, personOutline } from 'ionicons/icons';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonText,
    IonSpinner,
    IonCheckbox,
    IonGrid,
    IonRow,
    IonCol,
    IonAlert
  ],
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  rememberMe = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    addIcons({ eyeOutline, eyeOffOutline, mailOutline, lockClosedOutline, personOutline });
  }

  ngOnInit() {
    this.initializeForm();
    this.loadRememberedCredentials();
  }

  initializeForm() {
    this.loginForm = this.formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8)
        ]
      ]
    });
  }

  loadRememberedCredentials() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.loginForm.patchValue({ email: rememberedEmail });
      this.rememberMe = true;
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field && field.touched && field.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email'] || field.errors['pattern']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.touched && field.errors);
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;

      const loading = await this.loadingController.create({
        message: 'Signing in...',
        spinner: 'crescent'
      });
      await loading.present();

      try {
        const credentials = this.loginForm.value;

        const response = await this.authService.login(credentials).toPromise();

        // Handle remember me functionality
        if (this.rememberMe) {
          localStorage.setItem('rememberedEmail', credentials.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        await loading.dismiss();

        // Show success toast
        const toast = await this.toastController.create({
          message: `Welcome back, ${response?.user.name}!`,
          duration: 3000,
          position: 'top',
          color: 'success',
          icon: 'checkmark-circle-outline'
        });
        await toast.present();

        // Navigate to appropriate dashboard
        this.authService.navigateToRoleDashboard();

      } catch (error: any) {
        await loading.dismiss();
        await this.showErrorAlert(error.message || 'Login failed. Please try again.');
        this.isLoading = false;
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });

      const toast = await this.toastController.create({
        message: 'Please fill in all required fields correctly',
        duration: 3000,
        position: 'bottom',
        color: 'warning'
      });
      await toast.present();
    }
  }

  async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Login Error',
      message: message,
      buttons: ['OK'],
      cssClass: 'error-alert'
    });
    await alert.present();
  }

  navigateToRegister() {
    this.router.navigate(['/auth/register']);
  }

  async forgotPassword() {
    if (!this.loginForm.get('email')?.value) {
      const toast = await this.toastController.create({
        message: 'Please enter your email address first',
        duration: 3000,
        position: 'bottom',
        color: 'warning'
      });
      await toast.present();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Password Reset',
      message: 'Password reset functionality will be implemented soon. Please contact support for assistance.',
      buttons: ['OK']
    });
    await alert.present();
  }

  // Demo quick login methods for testing
  async quickLoginPatient() {
    this.loginForm.patchValue({
      email: 'patient@demo.com',
      password: 'password123'
    });
  }

  async quickLoginDriver() {
    this.loginForm.patchValue({
      email: 'driver@demo.com',
      password: 'password123'
    });
  }

  async quickLoginAdmin() {
    this.loginForm.patchValue({
      email: 'admin@demo.com',
      password: 'password123'
    });
  }
}
