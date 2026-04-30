# WMC Executive Private Hire Website

A modern, elegant website for WMC Executive Private Hire - a luxury private hire taxi service in Northampton, UK.

## Features

- **Premium Design**: Black, gold, and silver color scheme for a luxury feel
- **6 Pages**: Home, About, Services, Fleet, Prices, and Contact
- **Responsive**: Mobile-friendly design that works on all devices
- **SEO Optimized**: Includes meta tags and keywords for search engines
- **Booking Form**: Contact form with validation
- **Google Maps**: Integrated map showing service area
- **WhatsApp Button**: Floating WhatsApp button for easy contact
- **Accessibility**: Alt text for images and ARIA labels
- **Fast Loading**: Optimized CSS and JavaScript

## Pages

1. **Home (index.html)**: Hero section, services overview, fleet showcase, and why choose us
2. **About (about.html)**: Company information, values, licensed service details, and chauffeur information
3. **Services (services.html)**: Detailed service descriptions including airport transfers, corporate travel, special events, and long distance
4. **Fleet (fleet.html)**: Mercedes E-Class, S-Class, and V-Class vehicle details with specifications
5. **Prices (prices.html)**: Transparent pricing for airport transfers and hourly rates
6. **Contact (contact.html)**: Booking form, contact details, Google Maps, and FAQ

## Technology Stack

- **HTML5**: Semantic markup with SEO optimization
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript**: Vanilla JS for interactivity and form validation
- **Google Fonts**: Playfair Display and Montserrat
- **Google Maps**: Embedded map integration

## Setup Instructions

1. **Add Images**: Place your images in the `images/` folder with the following names:
   - `hero-background.jpg` - Hero section background
   - `mercedes-e-class.jpg` - E-Class for home page
   - `mercedes-s-class.jpg` - S-Class for home page
   - `mercedes-v-class.jpg` - V-Class for home page
   - `mercedes-e-class-main.jpg` - E-Class detail page
   - `mercedes-s-class-main.jpg` - S-Class detail page
   - `mercedes-v-class-main.jpg` - V-Class detail page
   - `about-luxury-car.jpg` - About page
   - `professional-chauffeur.jpg` - About page
   - `chauffeur-service.jpg` - About page
   - `airport-transfer.jpg` - Services page
   - `corporate-travel.jpg` - Services page
   - `special-events.jpg` - Services page
   - `long-distance.jpg` - Services page

2. **Update Contact Information**: Replace placeholder phone numbers and email addresses:
   - Search for `+441604XXXXXX` and replace with your actual phone number
   - Search for `help@wmcprivatehire.com` and replace with your actual email

3. **Update Google Maps**: In `contact.html`, update the Google Maps embed URL with your actual location coordinates

4. **SSL Certificate**: Ensure your website has an SSL certificate for secure HTTPS connection

5. **Test**: Open `index.html` in a web browser to test the website

## SEO Keywords

The website is optimized for the following keywords:
- Northampton taxi
- Private hire Northampton
- Airport transfers Northampton
- Executive cars Northampton
- Luxury taxi Northampton
- Mercedes taxi service
- Chauffeur service Northampton

## Color Scheme

- **Primary Black**: #000000
- **Gold**: #D4AF37
- **Silver**: #C0C0C0
- **Dark Gray**: #1a1a1a
- **Medium Gray**: #333333
- **Light Gray**: #f5f5f5

## Fonts

- **Headings**: Playfair Display (serif)
- **Body**: Montserrat (sans-serif)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility Features

- Semantic HTML5 elements
- ARIA labels for interactive elements
- Alt text for all images
- Keyboard navigation support
- Focus indicators
- Responsive text sizing
- High contrast colors

## Performance Optimization

- Lazy loading for images
- Minified CSS and JavaScript (recommended for production)
- Optimized images (recommended: WebP format)
- Efficient CSS Grid and Flexbox layouts
- Minimal external dependencies

## Customization

### Changing Colors
Edit the CSS variables in `css/styles.css`:
```css
:root {
    --color-black: #000000;
    --color-gold: #D4AF37;
    --color-silver: #C0C0C0;
    /* ... */
}
```

### Adding New Pages
1. Copy an existing HTML file
2. Update the navigation links
3. Add your content
4. Update the footer

### Modifying Prices
Edit the price tables in `prices.html` to reflect your actual rates

## Form Handling

The booking form currently uses client-side validation. For production:
1. Set up a backend server (PHP, Node.js, etc.)
2. Update the form action in `contact.html`
3. Implement server-side validation
4. Set up email notifications
5. Add CAPTCHA for spam protection

## Deployment

1. Upload all files to your web hosting server
2. Ensure the folder structure is maintained
3. Test all links and forms
4. Submit sitemap to search engines
5. Set up Google Analytics (optional)

## Maintenance

- Regularly update prices
- Add new vehicle photos
- Update testimonials
- Keep contact information current
- Monitor and respond to form submissions

## License

This website template is created for WMC Executive Private Hire. All rights reserved.

## Support

For questions or support, contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Developer**: BLACKBOXAI
