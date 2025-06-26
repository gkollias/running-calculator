# Running Pace Calculator

A comprehensive web application for runners to calculate VDOT scores, training paces, race splits, heart rate zones, and more.

## Features

- **VDOT Calculator**: Calculate your VDOT score and get personalized training paces
- **Pace Calculator**: Convert between time, distance, and pace
- **Split Calculator**: Generate race splits for various distances
- **Heart Rate Zones**: Calculate training zones based on max and resting heart rate
- **Race Predictor**: Predict race times based on previous performances
- **Calorie Calculator**: Estimate calories burned during runs
- **Auto-save**: Form data is automatically saved locally
- **Analytics**: Track usage patterns and performance
- **Responsive Design**: Works on desktop and mobile devices
- **Share Results**: Share calculations on social media

## Project Structure

```
running-calculator/
├── index.html              # Main HTML file
├── css/
│   ├── styles.css          # Main stylesheet
│   └── animations.css      # Animation definitions
├── js/
│   ├── app.js             # Main application logic
│   ├── calculators.js     # Calculation functions
│   ├── analytics.js       # Analytics and tracking
│   ├── storage.js         # Local storage management
│   └── ui.js              # UI interactions
├── assets/
│   └── images/
│       └── preview-image.png
└── README.md
```

## Installation

1. Clone or download the repository
2. Open `index.html` in a web browser
3. No build process required - it's a static web application

## Usage

### VDOT Calculator
1. Select your race distance
2. Enter your race time (minutes and seconds)
3. Click "Calculate VDOT" to get your score and training paces

### Pace Calculator
1. Choose between kilometers or miles
2. Enter distance and time
3. Get pace per unit and speed calculations

### Split Calculator
1. Enter your target pace per kilometer
2. Select race distance
3. View splits for various checkpoints

### Heart Rate Zones
1. Enter your maximum heart rate
2. Optionally add resting heart rate for Karvonen method
3. Get 5 training zones with descriptions

### Race Predictor
1. Enter a known race time and distance
2. Get predicted times for other race distances

### Calorie Calculator
1. Enter your weight, distance, and time
2. Get calorie burn estimates using multiple methods

## Features in Detail

### Auto-Save
- All form inputs are automatically saved to local storage
- Data persists between browser sessions
- Privacy-focused - data never leaves your device

### Analytics
- Tracks calculator usage patterns
- Monitors performance metrics
- Respects user privacy

### Responsive Design
- Mobile-first approach
- Works on all screen sizes
- Touch-friendly interface

## Technical Details

### Technologies Used
- Vanilla JavaScript (ES6+)
- CSS3 with animations
- HTML5
- Local Storage API
- Google Analytics (optional)

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Performance
- Lightweight (~100KB total)
- Fast loading times
- Offline functionality

## Development

### File Structure
- `index.html`: Main page with all calculator forms
- `css/styles.css`: Core styling and layout
- `css/animations.css`: CSS animations and transitions
- `js/app.js`: Application initialization and coordination
- `js/calculators.js`: All calculation logic
- `js/analytics.js`: Tracking and analytics
- `js/storage.js`: Local storage management
- `js/ui.js`: UI interactions and updates

### Key Functions

#### Calculators Module
- `calculateVDOT()`: VDOT score calculation
- `calculatePace()`: Pace and speed calculations
- `calculateSplits()`: Race split generation
- `calculateHRZones()`: Heart rate zone calculation
- `predictRaceTimes()`: Race time predictions
- `calculateCalories()`: Calorie burn estimation

#### Storage Module
- `saveFormData()`: Auto-save form inputs
- `restoreFormData()`: Restore saved data
- `getUserStats()`: Get usage statistics
- `saveUserStats()`: Update statistics

#### Analytics Module
- `trackCalculator()`: Track calculator usage
- `trackScrollDepth()`: Monitor engagement
- `trackDeviceInfo()`: Collect technical data

#### UI Module
- `updateStatsBar()`: Update statistics display
- `showLoading()`: Show loading animations
- `displayResult()`: Show calculation results

## Customization

### Adding New Calculators
1. Add HTML form in `index.html`
2. Add calculation logic in `calculators.js`
3. Update analytics tracking in `analytics.js`
4. Add styling in `styles.css`

### Modifying Calculations
- VDOT calculations use Jack Daniels' formulas
- Pace calculations support km/mile conversion
- Heart rate zones use percentage-based method
- Race predictions use Riegel's formula

### Styling
- CSS custom properties for easy theme changes
- Modular CSS structure
- Animation classes for enhanced UX

## Privacy

- All data stored locally in browser
- No personal information sent to servers
- Analytics data is anonymized
- Users can clear all data

## License

This project is open source. Feel free to use, modify, and distribute.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues or questions:
1. Check the browser console for errors
2. Ensure JavaScript is enabled
3. Clear browser cache if experiencing issues
4. Verify local storage is not disabled

## Credits

- VDOT calculations based on Jack Daniels' Running Formula
- Race predictions use Riegel's formula
- Heart rate zones based on standard training methodology
- Calorie calculations use MET values from research literature