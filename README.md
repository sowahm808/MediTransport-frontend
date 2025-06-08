# MediTransport Frontend

A modern, responsive Angular Ionic application for the Medical Transportation platform. Built with Angular standalone components, Ionic for mobile-first UI, and TypeScript for type safety.

## 🚀 Features

- **Responsive Design**: Mobile-first approach with Ionic components
- **Role-Based Access**: Different interfaces for patients, drivers, and admins
- **Real-time Tracking**: Live ride tracking with Socket.IO integration
- **Secure Authentication**: JWT-based authentication with automatic token refresh
- **Payment Integration**: Stripe integration for secure payment processing
- **PWA Support**: Progressive Web App capabilities
- **Offline Support**: Service worker for offline functionality
- **Push Notifications**: Real-time notifications for ride updates

## 🏗 Tech Stack

- **Framework**: Angular 17+ with Standalone Components
- **UI Library**: Ionic 7+
- **Language**: TypeScript
- **State Management**: RxJS
- **HTTP Client**: Angular HttpClient with interceptors
- **Real-time**: Socket.IO
- **Payment**: Stripe
- **Maps**: Google Maps API
- **PWA**: Angular Service Worker

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/sowahm808/MediTransport-frontend.git
cd MediTransport-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Edit src/environments/environment.ts
```

Update with your API endpoints and keys:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  socketUrl: 'http://localhost:3000',
  stripePublishableKey: 'pk_test_your_stripe_key',
  googleMapsApiKey: 'your_google_maps_key'
};
```

4. Start the development server:
```bash
npm run serve
# or
ionic serve
```

## 🎯 Application Structure

```
src/
├── app/
│   ├── core/                    # Core functionality
│   │   ├── services/           # Shared services
│   │   ├── guards/             # Route guards
│   │   └── interceptors/       # HTTP interceptors
│   ├── pages/                  # Application pages
│   │   ├── welcome/            # Landing page
│   │   ├── auth/               # Authentication pages
│   │   ├── dashboard/          # Role-based dashboards
│   │   ├── rides/              # Ride management
│   │   ├── payments/           # Payment processing
│   │   └── profile/            # User profile
│   ├── shared/                 # Shared components
│   └── app.component.ts        # Root component
├── environments/               # Environment configurations
├── theme/                      # Ionic theme variables
└── assets/                     # Static assets
```

## 🔐 Authentication & Authorization

The app implements role-based access control with three user types:

### Patient Dashboard
- Book medical transportation rides
- View ride history and status
- Track current rides in real-time
- Manage payment methods
- Update profile and emergency contacts

### Driver Dashboard
- View assigned rides
- Update availability status
- Navigate to pickup/drop-off locations
- Update ride status and location
- View earnings and statistics

### Admin Dashboard
- Manage users, drivers, and vehicles
- View system analytics and reports
- Handle ride assignments
- Monitor real-time operations
- Manage payment and billing

## 🚗 Key Features

### Ride Booking
- **Smart Booking**: Address autocomplete with Google Places API
- **Vehicle Selection**: Choose from regular, wheelchair-accessible, or stretcher-enabled vehicles
- **Scheduling**: Book immediate or future rides
- **Special Requirements**: Add medical equipment or assistance needs
- **Fare Estimation**: Real-time fare calculation

### Real-time Tracking
- **Live Location**: Real-time driver location updates
- **Route Optimization**: Best route calculation with traffic data
- **ETA Updates**: Dynamic arrival time estimates
- **Push Notifications**: Ride status updates

### Payment Processing
- **Secure Payments**: Stripe integration for credit/debit cards
- **Multiple Payment Methods**: Support for insurance, cash, and digital wallets
- **Payment History**: Detailed transaction records
- **Automatic Billing**: Seamless payment processing

## 📱 Mobile Features

### Progressive Web App (PWA)
- **Installable**: Add to home screen functionality
- **Offline Support**: Core features work offline
- **Push Notifications**: Background notifications
- **App-like Experience**: Native app feel

### Ionic Native Features
- **Geolocation**: Access device location
- **Camera**: Photo capture for verification
- **Contacts**: Emergency contact management
- **Haptic Feedback**: Touch feedback
- **Status Bar**: Native status bar control

## 🎨 UI/UX Design

### Design System
- **Ionic Components**: Consistent, accessible UI components
- **Custom Theme**: Medical-focused color palette
- **Typography**: Clear, readable fonts
- **Icons**: Ionicons with custom medical icons
- **Responsive**: Mobile-first responsive design

### Accessibility
- **WCAG Compliance**: Web Content Accessibility Guidelines
- **Screen Reader Support**: Proper ARIA labels
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: High contrast for readability
- **Large Touch Targets**: Easy touch interaction

## 🔧 Development

### Code Organization
- **Standalone Components**: Angular standalone architecture
- **Lazy Loading**: Route-based code splitting
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Comprehensive error management
- **Loading States**: User-friendly loading indicators

### Performance Optimization
- **OnPush Strategy**: Optimized change detection
- **TrackBy Functions**: Efficient list rendering
- **Image Optimization**: Lazy loading and compression
- **Bundle Splitting**: Optimized build output
- **Service Workers**: Caching and background sync

## 🧪 Testing

Run unit tests:
```bash
npm run test
```

Run end-to-end tests:
```bash
npm run e2e
```

Run linting:
```bash
npm run lint
```

## 📱 Building for Production

### Web Build
```bash
npm run build:prod
```

### Mobile Build (Capacitor)
```bash
# Add platforms
npx cap add ios
npx cap add android

# Build and sync
npm run build:prod
npx cap sync

# Open in native IDEs
npx cap open ios
npx cap open android
```

## 🌐 Environment Configuration

### Development
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  socketUrl: 'http://localhost:3000',
  // ... other config
};
```

### Production
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.meditransport.com/api',
  socketUrl: 'https://api.meditransport.com',
  // ... other config
};
```

## 🚀 Deployment

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build:prod
firebase deploy
```

### Netlify
```bash
# Build command: npm run build:prod
# Publish directory: dist
```

### Vercel
```bash
npm i -g vercel
vercel --prod
```

## 🔗 API Integration

The frontend integrates with the MediTransport Backend API:

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `GET /auth/verify` - Token verification

### Ride Management
- `GET /rides` - Get user rides
- `POST /rides` - Create new ride
- `PATCH /rides/:id` - Update ride status
- `GET /rides/:id/tracking` - Get tracking data

### Real-time Events
- `join-ride` - Join ride room
- `location-update` - Receive location updates
- `status-update` - Receive status updates

## 🛡️ Security

### Authentication Security
- **JWT Tokens**: Secure token-based authentication
- **Token Refresh**: Automatic token renewal
- **Route Guards**: Protected routes
- **Role-based Access**: Permission-based navigation

### Data Security
- **HTTPS**: Secure data transmission
- **Input Validation**: Client-side validation
- **XSS Protection**: Cross-site scripting prevention
- **CSRF Protection**: Cross-site request forgery prevention

## 📊 Analytics & Monitoring

### Error Tracking
- **Sentry Integration**: Real-time error monitoring
- **Performance Monitoring**: App performance tracking
- **User Analytics**: Usage pattern analysis

### Logging
- **Console Logging**: Development debugging
- **Remote Logging**: Production error logging
- **Performance Metrics**: Loading time tracking

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow Angular style guide
- Use TypeScript strictly
- Write unit tests for components
- Follow Ionic design patterns
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Email: support@meditransport.com
- Documentation: [docs.meditransport.com](https://docs.meditransport.com)

---

## 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `npm run serve` | Start development server |
| `npm run build` | Build for production |
| `npm run test` | Run unit tests |
| `npm run lint` | Run code linting |
| `ionic generate` | Generate new components |
| `ionic build` | Build Ionic app |
| `ionic capacitor` | Capacitor commands |

## 📱 Platform Support

- **iOS**: 11.0+ (via Capacitor)
- **Android**: 5.0+ (API 21+) (via Capacitor)
- **Web**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **PWA**: All major browsers with PWA support

## 🔄 State Management

The app uses RxJS for reactive state management:

- **Services**: Centralized data management
- **BehaviorSubjects**: State streams
- **Observables**: Reactive data flow
- **Error Handling**: Comprehensive error management
