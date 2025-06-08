import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Stripe types
declare var Stripe: any;

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: any;
  };
}

export interface CreatePaymentIntentRequest {
  rideId: number;
  amount: number;
  currency?: string;
  paymentMethodId?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntent?: any;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripe: any = null;
  private elements: any = null;
  private cardElement: any = null;
  private isLoadedSubject = new BehaviorSubject<boolean>(false);
  private apiUrl = environment.apiUrl;

  public isLoaded$ = this.isLoadedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStripe();
  }

  private async loadStripe(): Promise<void> {
    try {
      // Dynamic import to avoid SSR issues
      const { loadStripe } = await import('@stripe/stripe-js');
      this.stripe = await loadStripe(environment.stripePublishableKey);

      if (this.stripe) {
        this.isLoadedSubject.next(true);
        console.log('Stripe loaded successfully');
      } else {
        throw new Error('Stripe failed to load');
      }
    } catch (error) {
      console.error('Error loading Stripe:', error);
      this.isLoadedSubject.next(false);
    }
  }

  async waitForStripe(): Promise<any> {
    if (this.stripe) {
      return this.stripe;
    }

    return new Promise((resolve, reject) => {
      const subscription = this.isLoaded$.subscribe(loaded => {
        if (loaded && this.stripe) {
          subscription.unsubscribe();
          resolve(this.stripe);
        }
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        subscription.unsubscribe();
        reject(new Error('Stripe loading timeout'));
      }, 10000);
    });
  }

  async createElements(options?: any): Promise<any> {
    const stripe = await this.waitForStripe();

    const defaultOptions = {
      fonts: [{
        cssSrc: 'https://fonts.googleapis.com/css?family=Inter:400,500,600,700'
      }],
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#3880ff',
          colorBackground: '#ffffff',
          colorText: '#1a1a1a',
          colorDanger: '#eb445a',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          spacingUnit: '4px',
          borderRadius: '8px'
        },
        rules: {
          '.Input': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '2px solid transparent',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '16px',
            transition: 'all 0.3s ease'
          },
          '.Input:focus': {
            borderColor: '#3880ff',
            boxShadow: '0 0 0 3px rgba(56, 128, 255, 0.1)',
            backgroundColor: '#ffffff'
          },
          '.Input--invalid': {
            borderColor: '#eb445a'
          },
          '.Label': {
            fontSize: '14px',
            fontWeight: '500',
            color: '#666666',
            marginBottom: '8px'
          }
        }
      }
    };

    this.elements = stripe.elements({ ...defaultOptions, ...options });
    return this.elements;
  }

  async createCardElement(containerId: string, options?: any): Promise<any> {
    if (!this.elements) {
      await this.createElements();
    }

    const defaultOptions = {
      style: {
        base: {
          fontSize: '16px',
          color: '#1a1a1a',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          fontWeight: '400',
          '::placeholder': {
            color: '#999999'
          }
        },
        invalid: {
          color: '#eb445a',
          iconColor: '#eb445a'
        }
      },
      hidePostalCode: false,
      iconStyle: 'solid'
    };

    this.cardElement = this.elements.create('card', { ...defaultOptions, ...options });

    const container = document.getElementById(containerId);
    if (container) {
      this.cardElement.mount(`#${containerId}`);
    }

    return this.cardElement;
  }

  async createPaymentMethod(billingDetails?: any): Promise<{ paymentMethod?: any; error?: any }> {
    if (!this.cardElement) {
      throw new Error('Card element not created');
    }

    const stripe = await this.waitForStripe();

    const result = await stripe.createPaymentMethod({
      type: 'card',
      card: this.cardElement,
      billing_details: billingDetails || {}
    });

    return result;
  }

  async confirmPayment(clientSecret: string, paymentMethod?: any): Promise<PaymentResult> {
    const stripe = await this.waitForStripe();

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod || {
          card: this.cardElement,
          billing_details: {}
        }
      });

      if (result.error) {
        return {
          success: false,
          error: result.error.message
        };
      }

      return {
        success: true,
        paymentIntent: result.paymentIntent
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Payment failed'
      };
    }
  }

  // Backend API calls
  createPaymentIntent(request: CreatePaymentIntentRequest): Observable<PaymentIntent> {
    return this.http.post<PaymentIntent>(`${this.apiUrl}/payments/create-intent`, request);
  }

  confirmPaymentIntent(paymentIntentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments/confirm/${paymentIntentId}`, {});
  }

  getPaymentHistory(limit?: number, offset?: number): Observable<any> {
    const params: any = {};
    if (limit) params.limit = limit.toString();
    if (offset) params.offset = offset.toString();

    return this.http.get(`${this.apiUrl}/payments/history`, { params });
  }

  // Card validation
  validateCard(): { complete: boolean; error?: any } {
    if (!this.cardElement) {
      return { complete: false, error: { message: 'Card element not initialized' } };
    }

    // This would typically be handled by Stripe's real-time validation
    return { complete: true };
  }

  // Cleanup
  destroyCardElement(): void {
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }
  }

  destroyElements(): void {
    this.destroyCardElement();
    this.elements = null;
  }

  // Utility methods
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getCardBrandIcon(brand: string): string {
    const icons: { [key: string]: string } = {
      'visa': 'assets/icons/visa.svg',
      'mastercard': 'assets/icons/mastercard.svg',
      'amex': 'assets/icons/amex.svg',
      'discover': 'assets/icons/discover.svg',
      'diners': 'assets/icons/diners.svg',
      'jcb': 'assets/icons/jcb.svg',
      'unionpay': 'assets/icons/unionpay.svg'
    };

    return icons[brand] || 'assets/icons/card-default.svg';
  }
}
