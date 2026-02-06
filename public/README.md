# Eventful Frontend Interface

## Overview
The Eventful frontend is a modern, responsive single-page application (SPA) that showcases all platform functionalities with a beautiful light/dark mode interface. Built with vanilla HTML, CSS, and JavaScript—no framework dependencies required.

## Features

### 🎨 **Theme Support**
- **Light Mode**: Bright, clean interface optimized for daytime use
- **Dark Mode**: Eye-friendly interface for low-light environments
- **Persistent Theme**: User preference saved to localStorage
- **Smooth Transitions**: All theme changes animate smoothly

### 🔐 **Authentication**
- Sign Up and Sign In modals
- User profile management
- Role-based differentiation (Creator vs Eventee)
- Session persistence using localStorage

### 🎭 **Event Management**
- Browse all available events
- Filter events by category, date, and location
- Search events in real-time
- View event details
- Share events on social media
- Create new events (creator role)

### 🎫 **Ticket Management**
- View purchased tickets with QR codes
- Download tickets
- Share tickets
- Track ticket status
- Display ticket details and purchase information

### 💳 **Payment Integration**
- Payment history view
- Transaction details
- Payment status tracking
- Integration-ready for Paystack API
- Payment statistics and summaries

### 📊 **Analytics Dashboard**
- Event performance metrics
- Revenue tracking
- Attendee statistics
- QR code scan analytics
- Daily sales charts
- Conversion rate metrics

### 🔔 **Notifications**
- Notification panel with badge count
- Real-time notification updates
- Multiple notification types
- Persistent notification history

### 🌐 **Social Sharing**
- Share events on Facebook, Twitter, LinkedIn, WhatsApp
- Copy shareable links
- Auto-generated share URLs

## File Structure

```
public/
├── index.html           # Main HTML interface
├── css/
│   └── styles.css      # Complete styling with light/dark themes
├── js/
│   └── app.js          # JavaScript functionality and interactions
└── assets/             # Images, icons, and other assets
```

## How to Use

### 1. **Starting the Application**
```bash
npm run dev
```
The frontend will be served at `http://localhost:5000`

### 2. **Accessing Different Sections**
- **Home**: Overview and featured events
- **Events**: Browse and search all events
- **My Tickets**: View purchased tickets
- **Payments**: Payment history and statistics
- **Analytics**: View event performance metrics

### 3. **Toggling Light/Dark Mode**
Click the theme toggle button in the top-right corner of the navbar. Your preference is automatically saved.

### 4. **Authentication Flow**
1. Click "Sign Up" or use the auth button
2. Choose Sign Up or Sign In mode
3. Fill in the required details
4. Submit the form
5. You'll see a confirmation notification

### 5. **Creating Events** (Creator role)
1. Click "Create Event" button
2. Fill in event details:
   - Title
   - Category (Concert, Theater, Sports, Conference, Workshop)
   - Description
   - Date and Time
   - Location
   - Capacity
   - Ticket Price
3. Submit to create the event

### 6. **Buying Tickets**
1. Browse events or search for specific events
2. Click "Buy Ticket" on any event
3. Complete the payment form
4. System will redirect to Paystack (in production)
5. Receive ticket confirmation via email

### 7. **Sharing Events**
1. Click "Share" on any event
2. Choose a platform:
   - Facebook
   - Twitter
   - LinkedIn
   - WhatsApp
3. Or copy the direct link

### 8. **Viewing Notifications**
Click the bell icon in the navbar to view all notifications.

## Styling System

### CSS Variables
All colors and values are managed through CSS variables for easy theme switching:

```css
:root {
    --bg-primary: #ffffff;
    --text-primary: #1a1a1a;
    --accent-color: #7c3aed;
    /* ... more variables */
}

[data-theme="dark"] {
    --bg-primary: #1a1a1a;
    --text-primary: #f5f5f5;
    /* ... dark mode overrides */
}
```

### Responsive Breakpoints
- **Desktop**: Full layout (1200px+)
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px
- **Small Mobile**: < 480px

## JavaScript Architecture

### Main Classes and Modules

#### **ThemeManager**
Handles light/dark mode switching and persistence
```javascript
const themeManager = new ThemeManager();
themeManager.toggle(); // Switch theme
```

#### **AppState**
Manages application state including user, events, and notifications
```javascript
const appState = new AppState();
appState.setUser(user);
appState.addNotification(notification);
```

#### **Navigation Functions**
```javascript
navigateTo(sectionId);  // Switch between sections
```

#### **Modal Management**
```javascript
openModal(modalId);     // Open a modal
closeModal(modalId);    // Close a modal
```

#### **Authentication**
```javascript
showAuthModal(mode);    // Show sign up/sign in
```

#### **Event Management**
```javascript
showEventModal();       // Create event
buyTicket(eventId);     // Purchase ticket
shareEvent(eventId);    // Share event
```

#### **Notifications**
```javascript
showToast(message);     // Show temporary notification
appState.addNotification(notification); // Add to notification panel
```

## API Integration Points

The frontend is ready to integrate with the Eventful API:

```javascript
// Example integration (to be implemented)
async function fetchEvents() {
    const response = await fetch('/api/events');
    return response.json();
}

async function createEvent(eventData) {
    const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
    });
    return response.json();
}
```

## Accessibility Features

- Semantic HTML structure
- Proper heading hierarchy
- Form labels and placeholders
- Keyboard navigation support
- High contrast colors for readability
- Focus indicators for interactive elements

## Performance Optimizations

- Smooth scrolling behavior
- CSS transitions for theme changes
- Efficient DOM manipulation
- LocalStorage for theme and user data persistence
- Minimal JavaScript dependencies

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Changing Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --accent-color: #7c3aed; /* Change primary color */
    --success-color: #10b981; /* Change success color */
    /* ... */
}
```

### Modifying Sections
Edit section content in `index.html` and corresponding logic in `app.js`.

### Adding New Features
1. Add HTML structure to `index.html`
2. Add styles to `styles.css`
3. Add JavaScript logic to `app.js`

## Known Features

✅ Responsive design
✅ Light/Dark mode toggle
✅ Event browsing and filtering
✅ Ticket management
✅ Payment history
✅ Analytics dashboard
✅ Notifications system
✅ Event sharing
✅ Authentication modals
✅ Real-time search
✅ Toast notifications
✅ Modal dialogs
✅ Theme persistence

## Future Enhancements

- Real API integration
- User profile customization
- Advanced analytics charts (Chart.js)
- File upload for event images
- Map integration for event locations
- Real-time notifications (WebSocket)
- PWA support (offline functionality)
- Mobile app version

## Troubleshooting

### Theme not switching?
- Check if localStorage is enabled in your browser
- Clear browser cache and reload

### Modals not closing?
- Make sure JavaScript is enabled
- Check browser console for errors

### Responsive layout issues?
- Clear CSS cache
- Test in incognito/private window
- Try different browser

## Development Notes

The frontend is built to be framework-agnostic and can be easily integrated with:
- React, Vue, Angular for enhanced functionality
- Backend API at `/api` endpoints
- Real payment processing via Paystack
- WebSocket for real-time updates

## License

Part of the Eventful Event Ticketing Platform
© 2026 All rights reserved
