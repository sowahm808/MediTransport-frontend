import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, FormsModule } from '@angular/forms';
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
  IonSelect,
  IonSelectOption,
  IonGrid,
  IonRow,
  IonCol,
  IonAlert,
  IonSegment,
  IonSegmentButton,
  IonTextarea,
  AlertController,
  LoadingController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  eyeOutline,
  eyeOffOutline,
  mailOutline,
  lockClosedOutline,
  personOutline,
  callOutline,
  carOutline,
  documentTextOutline,
  medicalOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';

import { AuthService, RegisterRequest } from '../../../core/services/auth.service';

// Custom validators
export class CustomValidators {
  static passwordMatch(control: AbstractControl): { [key: string]: any } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  static phoneValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;

    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value) ? null : { invalidPhone: true };
  }

  static licenseValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;

    const licenseRegex = /^[A-Z0-9]{6,20}$/i;
    return licenseRegex.test(value) ? null : { invalidLicense: true };
  }
}

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
    IonSelect,
    IonSelectOption,
    IonGrid,
    IonRow,
    IonCol,
    IonAlert,
    IonSegment,
    IonSegmentButton,
    IonTextarea
  ],
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  selectedRole: 'patient' | 'driver' | 'admin' = 'patient';
  agreeToTerms = false;

  vehicleTypes = [
    { value: 'car', label: 'Standard Car' },
    { value: 'van', label: 'Van' },
    { value: 'wheelchair-accessible', label: 'Wheelchair Accessible' },
    { value: 'stretcher-enabled', label: 'Stretcher Enabled' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    addIcons({
      eyeOutline,
      eyeOffOutline,
      mailOutline,
      lockClosedOutline,
      personOutline,
      callOutline,
      carOutline,
      documentTextOutline,
      medicalOutline,
      shieldCheckmarkOutline
    });
  }

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.registerForm = this.formBuilder.group({
      // Basic fields for all users
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s]+$/)
        ]
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        ]
      ],
      phone: [
        '',
        [
          Validators.required,
          CustomValidators.phoneValidator
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        ]
      ],
      confirmPassword: [
        '',
        [Validators.required]
      ],
      role: [this.selectedRole, Validators.required],

      // Driver-specific fields
      licenseNumber: [''],
      vehicleType: [''],

      // Additional fields
      emergencyContact: [''],
      medicalConditions: ['']
    }, {
      validators: CustomValidators.passwordMatch
    });

    this.updateFormValidation();
  }

  onRoleChange(event: any) {
    this.selectedRole = event.detail.value;
    this.registerForm.patchValue({ role: this.selectedRole });
    this.updateFormValidation();
  }

  updateFormValidation() {
    const licenseNumberControl = this.registerForm.get('licenseNumber');
    const vehicleTypeControl = this.registerForm.get('vehicleType');

    if (this.selectedRole === 'driver') {
      licenseNumberControl?.setValidators([
        Validators.required,
        CustomValidators.licenseValidator
      ]);
      vehicleTypeControl?.setValidators([Validators.required]);
    } else {
      licenseNumberControl?.clearValidators();
      vehicleTypeControl?.clearValidators();
    }

    licenseNumberControl?.updateValueAndValidity();
    vehicleTypeControl?.updateValueAndValidity();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field && field.touched && field.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email'] || field.errors['pattern']) {
        if (fieldName === 'email') {
          return 'Please enter a valid email address';
        }
        if (fieldName === 'name') {
          return 'Name can only contain letters and spaces';
        }
        if (fieldName === 'password') {
          return 'Password must contain uppercase, lowercase, number and special character';
        }
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be less than ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['invalidPhone']) {
        return 'Please enter a valid phone number';
      }
      if (field.errors['invalidLicense']) {
        return 'License number must be 6-20 alphanumeric characters';
      }
    }

    if (fieldName === 'confirmPassword' && this.registerForm.errors?.['passwordMismatch']) {
      return 'Passwords do not match';
    }

    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.touched && (field.errors ||
      (fieldName === 'confirmPassword' && this.registerForm.errors?.['passwordMismatch'])));
  }

  async onSubmit() {
    if (this.registerForm.valid && this.agreeToTerms) {
      this.isLoading = true;

      const loading = await this.loadingController.create({
        message: 'Creating your account...',
        spinner: 'crescent'
      });
      await loading.present();

      try {
        const formData = this.registerForm.value;

        const registerData: RegisterRequest = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role
        };

        // Add driver-specific fields if role is driver
        if (formData.role === 'driver') {
          registerData.licenseNumber = formData.licenseNumber;
          registerData.vehicleType = formData.vehicleType;
        }

        const response = await this.authService.register(registerData).toPromise();

        await loading.dismiss();

        // Show success message
        const alert = await this.alertController.create({
          header: 'Registration Successful!',
          message: `Welcome to MediTransport, ${response?.user.name}! Your account has been created successfully.`,
          buttons: [{
            text: 'Continue',
            handler: () => {
              this.authService.navigateToRoleDashboard();
            }
          }],
          cssClass: 'success-alert'
        });
        await alert.present();

      } catch (error: any) {
        await loading.dismiss();
        await this.showErrorAlert(error.message || 'Registration failed. Please try again.');
        this.isLoading = false;
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });

      if (!this.agreeToTerms) {
        const toast = await this.toastController.create({
          message: 'Please agree to the Terms of Service and Privacy Policy',
          duration: 3000,
          position: 'bottom',
          color: 'warning'
        });
        await toast.present();
      } else {
        const toast = await this.toastController.create({
          message: 'Please fill in all required fields correctly',
          duration: 3000,
          position: 'bottom',
          color: 'warning'
        });
        await toast.present();
      }
    }
  }

  async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Registration Error',
      message: message,
      buttons: ['OK'],
      cssClass: 'error-alert'
    });
    await alert.present();
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }

  async showTermsOfService() {
    const alert = await this.alertController.create({
      header: 'Terms of Service',
      message: `
        <div style="text-align: left;">
          <h3>MediTransport Terms of Service</h3>
          <p><strong>1. Service Agreement</strong><br>
          By using MediTransport, you agree to our medical transportation services.</p>

          <p><strong>2. User Responsibilities</strong><br>
          - Provide accurate medical information<br>
          - Arrive on time for scheduled rides<br>
          - Treat drivers and staff with respect</p>

          <p><strong>3. Driver Requirements</strong><br>
          - Valid driver's license<br>
          - Medical transportation certification<br>
          - Background check clearance</p>

          <p><strong>4. Privacy & HIPAA Compliance</strong><br>
          We protect your medical information according to HIPAA regulations.</p>

          <p><strong>5. Emergency Procedures</strong><br>
          Emergency contacts will be notified in case of medical emergencies.</p>
        </div>
      `,
      buttons: ['Close'],
      cssClass: 'terms-alert'
    });
    await alert.present();
  }

  async showPrivacyPolicy() {
    const alert = await this.alertController.create({
      header: 'Privacy Policy',
      message: `
        <div style="text-align: left;">
          <h3>MediTransport Privacy Policy</h3>
          <p><strong>Data Collection</strong><br>
          We collect only necessary information for medical transportation services.</p>

          <p><strong>Medical Information</strong><br>
          Your medical data is encrypted and HIPAA compliant.</p>

          <p><strong>Location Tracking</strong><br>
          Location is tracked only during active rides for safety.</p>

          <p><strong>Data Sharing</strong><br>
          We never share personal data without consent, except for emergencies.</p>

          <p><strong>Data Security</strong><br>
          All data is encrypted and stored securely.</p>
        </div>
      `,
      buttons: ['Close'],
      cssClass: 'privacy-alert'
    });
    await alert.present();
  }

  getRoleDescription(role: string): string {
    switch (role) {
      case 'patient':
        return 'Book medical transportation rides';
      case 'driver':
        return 'Provide medical transportation services';
      case 'admin':
        return 'Manage the transportation system';
      default:
        return '';
    }
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'patient':
        return 'medical-outline';
      case 'driver':
        return 'car-outline';
      case 'admin':
        return 'shield-checkmark-outline';
      default:
        return 'person-outline';
    }
  }
}
