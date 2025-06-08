import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  IonCheckbox,
  IonRadioGroup,
  IonRadio,
  IonSpinner,
  IonChip,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonSearchbar,
  LoadingController,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  locationOutline,
  navigateOutline,
  timeOutline,
  carOutline,
  callOutline,
  medicalOutline,
  cashOutline,
  mapOutline,
  searchOutline,
  closeOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { MapsService, Location, RouteInfo } from '../../../core/services/maps.service';
import { MapsMockService } from '../../../core/services/maps-mock.service';
import { AuthService, User } from '../../../core/services/auth.service';
import { RideService } from '../../../core/services/ride.service';
import { environment } from '../../../../environments/environment';

export interface VehicleOption {
  type: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
  baseRate: number;
  available: boolean;
}

export interface RideBookingData {
  pickupLocation: Location;
  dropoffLocation: Location;
  scheduledTime: string;
  vehicleType: string;
  passengerCount: number;
  specialRequirements: string;
  emergencyContact: string;
  paymentMethod: string;
  estimatedFare: number;
  route?: RouteInfo;
}

@Component({
  selector: 'app-book-ride',
  templateUrl: './book-ride.page.html',
  styleUrls: ['./book-ride.page.scss'],
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
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
    IonCheckbox,
    IonRadioGroup,
    IonRadio,
    IonSpinner,
    IonChip,
    IonBadge,
    IonGrid,
    IonRow,
    IonCol,
    IonList,
    IonSearchbar
  ],
})
export class BookRidePage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  @ViewChild('pickupSearch', { static: false }) pickupSearch!: ElementRef;
  @ViewChild('dropoffSearch', { static: false }) dropoffSearch!: ElementRef;

  bookingForm!: FormGroup;
  currentUser: User | null = null;
  isLoading = false;
  step = 1;
  totalSteps = 4;

  // Location data
  pickupLocation: Location | null = null;
  dropoffLocation: Location | null = null;
  pickupSuggestions: google.maps.places.AutocompletePrediction[] = [];
  dropoffSuggestions: google.maps.places.AutocompletePrediction[] = [];
  showPickupSuggestions = false;
  showDropoffSuggestions = false;
  currentLocationLoading = false;

  // Route and fare data
  routeInfo: RouteInfo | null = null;
  estimatedFare = 0;
  selectedVehicle: VehicleOption | null = null;

  // Available vehicles
  vehicleOptions: VehicleOption[] = [
    {
      type: 'standard',
      name: 'Standard Vehicle',
      description: 'Comfortable sedan for up to 3 passengers',
      icon: 'car-outline',
      features: ['Air conditioning', 'Comfortable seating', 'Professional driver'],
      baseRate: 2.5,
      available: true
    },
    {
      type: 'wheelchair-accessible',
      name: 'Wheelchair Accessible',
      description: 'Specially equipped vehicle with wheelchair access',
      icon: 'accessibility-outline',
      features: ['Wheelchair ramp', 'Securing equipment', 'Trained driver'],
      baseRate: 3.5,
      available: true
    },
    {
      type: 'stretcher-enabled',
      name: 'Stretcher Vehicle',
      description: 'Medical transport with stretcher capability',
      icon: 'medical-outline',
      features: ['Stretcher bed', 'Medical equipment', 'Certified EMT'],
      baseRate: 4.0,
      available: true
    },
    {
      type: 'van',
      name: 'Large Vehicle',
      description: 'Spacious van for groups or medical equipment',
      icon: 'bus-outline',
      features: ['Up to 6 passengers', 'Extra storage', 'Accessibility options'],
      baseRate: 3.0,
      available: true
    }
  ];

  private subscriptions: Subscription[] = [];
  private useMockService = environment.googleMapsApiKey === 'AIzaSyDemo_Key_For_Development';

  private get activeMapService() {
    return this.useMockService ? this.mapsMockService : this.mapsService;
  }

  constructor(
    private formBuilder: FormBuilder,
    private mapsService: MapsService,
    private mapsMockService: MapsMockService,
    private authService: AuthService,
    private rideService: RideService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      locationOutline,
      navigateOutline,
      timeOutline,
      carOutline,
      callOutline,
      medicalOutline,
      cashOutline,
      mapOutline,
      searchOutline,
      closeOutline,
      checkmarkCircleOutline
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.initializeForm();
    this.setupLocationSearches();
  }

  ngAfterViewInit() {
    // Initialize map after view is ready
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initializeForm() {
    const now = new Date();
    const minTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now

    this.bookingForm = this.formBuilder.group({
      pickupAddress: ['', Validators.required],
      dropoffAddress: ['', Validators.required],
      scheduledTime: [minTime.toISOString(), Validators.required],
      vehicleType: ['standard', Validators.required],
      passengerCount: [1, [Validators.required, Validators.min(1), Validators.max(6)]],
      specialRequirements: [''],
      emergencyContact: [''],
      paymentMethod: ['card', Validators.required],
      bookingType: ['now', Validators.required] // 'now' or 'scheduled'
    });

    // Watch for changes in booking type
    this.bookingForm.get('bookingType')?.valueChanges.subscribe(type => {
      if (type === 'now') {
        this.bookingForm.get('scheduledTime')?.setValue(new Date().toISOString());
      }
    });
  }

  setupLocationSearches() {
    // Setup pickup search
    const pickupControl = this.bookingForm.get('pickupAddress');
    if (pickupControl) {
      const pickupSub = pickupControl.valueChanges
        .pipe(debounceTime(300), distinctUntilChanged())
        .subscribe(query => {
          if (query && query.length > 2) {
            this.searchPickupLocations(query);
          } else {
            this.pickupSuggestions = [];
            this.showPickupSuggestions = false;
          }
        });
      this.subscriptions.push(pickupSub);
    }

    // Setup dropoff search
    const dropoffControl = this.bookingForm.get('dropoffAddress');
    if (dropoffControl) {
      const dropoffSub = dropoffControl.valueChanges
        .pipe(debounceTime(300), distinctUntilChanged())
        .subscribe(query => {
          if (query && query.length > 2) {
            this.searchDropoffLocations(query);
          } else {
            this.dropoffSuggestions = [];
            this.showDropoffSuggestions = false;
          }
        });
      this.subscriptions.push(dropoffSub);
    }

    // Watch for vehicle type changes to update fare
    this.bookingForm.get('vehicleType')?.valueChanges.subscribe(vehicleType => {
      this.selectedVehicle = this.vehicleOptions.find(v => v.type === vehicleType) || null;
      this.calculateFare();
    });
  }

  async initializeMap() {
    if (this.mapContainer?.nativeElement) {
      try {
        await this.activeMapService.initializeMap(this.mapContainer.nativeElement);
        console.log('Map initialized successfully');
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }
  }

  async getCurrentLocation() {
    this.currentLocationLoading = true;
    try {
      const location = await this.activeMapService.getCurrentLocation();
      this.pickupLocation = location;
      this.bookingForm.get('pickupAddress')?.setValue(location.address);
      this.showPickupSuggestions = false;

      // Add marker to map
      this.activeMapService.addMarker(location, 'Your Location', 'assets/icons/current-location.png');

      this.showToast('Current location set as pickup', 'success');
    } catch (error) {
      console.error('Error getting current location:', error);
      this.showToast('Unable to get current location', 'warning');
    } finally {
      this.currentLocationLoading = false;
    }
  }

  async searchPickupLocations(query: string) {
    try {
      this.pickupSuggestions = await this.mapsService.searchPlaces(query);
      this.showPickupSuggestions = this.pickupSuggestions.length > 0;
    } catch (error) {
      console.error('Error searching pickup locations:', error);
    }
  }

  async searchDropoffLocations(query: string) {
    try {
      this.dropoffSuggestions = await this.mapsService.searchPlaces(query);
      this.showDropoffSuggestions = this.dropoffSuggestions.length > 0;
    } catch (error) {
      console.error('Error searching dropoff locations:', error);
    }
  }

  async selectPickupLocation(prediction: google.maps.places.AutocompletePrediction) {
    try {
      this.pickupLocation = await this.mapsService.getPlaceDetails(prediction.place_id!);
      this.bookingForm.get('pickupAddress')?.setValue(prediction.description);
      this.showPickupSuggestions = false;

      this.mapsService.addMarker(this.pickupLocation, 'Pickup Location', 'assets/icons/pickup-marker.png');
      this.calculateRoute();
    } catch (error) {
      console.error('Error selecting pickup location:', error);
    }
  }

  async selectDropoffLocation(prediction: google.maps.places.AutocompletePrediction) {
    try {
      this.dropoffLocation = await this.mapsService.getPlaceDetails(prediction.place_id!);
      this.bookingForm.get('dropoffAddress')?.setValue(prediction.description);
      this.showDropoffSuggestions = false;

      this.mapsService.addMarker(this.dropoffLocation, 'Dropoff Location', 'assets/icons/dropoff-marker.png');
      this.calculateRoute();
    } catch (error) {
      console.error('Error selecting dropoff location:', error);
    }
  }

  async calculateRoute() {
    if (this.pickupLocation && this.dropoffLocation) {
      try {
        this.routeInfo = await this.mapsService.calculateRoute(this.pickupLocation, this.dropoffLocation);
        this.mapsService.displayRoute(this.pickupLocation, this.dropoffLocation);
        this.calculateFare();
      } catch (error) {
        console.error('Error calculating route:', error);
      }
    }
  }

  calculateFare() {
    if (this.routeInfo && this.selectedVehicle) {
      this.estimatedFare = this.mapsService.estimateFare(
        this.routeInfo.distance,
        this.routeInfo.duration,
        this.selectedVehicle.type
      );
    }
  }

  nextStep() {
    if (this.step < this.totalSteps) {
      this.step++;
    }
  }

  previousStep() {
    if (this.step > 1) {
      this.step--;
    }
  }

  canProceedToStep(stepNumber: number): boolean {
    switch (stepNumber) {
      case 2:
        return !!(this.pickupLocation && this.dropoffLocation);
      case 3:
        return !!(this.selectedVehicle && this.routeInfo);
      case 4:
        return this.bookingForm.valid;
      default:
        return true;
    }
  }

  async confirmBooking() {
    if (!this.bookingForm.valid || !this.pickupLocation || !this.dropoffLocation) {
      this.showToast('Please complete all required fields', 'warning');
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Booking your ride...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const bookingData: RideBookingData = {
        pickupLocation: this.pickupLocation,
        dropoffLocation: this.dropoffLocation,
        scheduledTime: this.bookingForm.get('scheduledTime')?.value,
        vehicleType: this.bookingForm.get('vehicleType')?.value,
        passengerCount: this.bookingForm.get('passengerCount')?.value,
        specialRequirements: this.bookingForm.get('specialRequirements')?.value,
        emergencyContact: this.bookingForm.get('emergencyContact')?.value,
        paymentMethod: this.bookingForm.get('paymentMethod')?.value,
        estimatedFare: this.estimatedFare,
        route: this.routeInfo || undefined
      };

      const ride = await firstValueFrom(this.rideService.createRide(bookingData));
      console.log('Ride created:', ride);

      await loading.dismiss();

      const alert = await this.alertController.create({
        header: 'Booking Confirmed!',
        message: 'Your ride has been booked successfully. You will receive confirmation details shortly.',
        buttons: [{
          text: 'View Rides',
          handler: () => {
            this.router.navigate(['/rides/history']);
          }
        }],
        cssClass: 'success-alert'
      });
      await alert.present();

    } catch (error) {
      await loading.dismiss();
      console.error('Booking error:', error);
      this.showToast('Failed to book ride. Please try again.', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  getStepTitle(step: number): string {
    switch (step) {
      case 1: return 'Pickup & Destination';
      case 2: return 'Vehicle Selection';
      case 3: return 'Trip Details';
      case 4: return 'Confirmation';
      default: return 'Book Ride';
    }
  }

  formatTime(isoString: string): string {
    return new Date(isoString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
