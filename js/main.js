// WMC Executive Private Hire - Main JavaScript

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Form validation and submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        // Return journey toggle
        const returnJourney = document.getElementById('returnJourney');
        const returnDateGroup = document.getElementById('returnDateGroup');
        const returnDate = document.getElementById('returnDate');
        
        if (returnJourney && returnDateGroup) {
            returnJourney.addEventListener('change', function() {
                if (this.value === 'yes') {
                    returnDateGroup.style.display = 'block';
                    returnDate.required = true;
                } else {
                    returnDateGroup.style.display = 'none';
                    returnDate.required = false;
                }
            });
        }
        
        // Form submission
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous errors
            const errorMessages = document.querySelectorAll('.error-message');
            errorMessages.forEach(msg => msg.textContent = '');
            
            let isValid = true;
            
            // Validate full name
            const fullName = document.getElementById('fullName');
            if (!fullName.value.trim()) {
                showError('fullNameError', 'Please enter your full name');
                isValid = false;
            }
            
            // Validate email
            const email = document.getElementById('email');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email.value.trim()) {
                showError('emailError', 'Please enter your email address');
                isValid = false;
            } else if (!emailRegex.test(email.value)) {
                showError('emailError', 'Please enter a valid email address');
                isValid = false;
            }
            
            // Validate phone
            const phone = document.getElementById('phone');
            if (!phone.value.trim()) {
                showError('phoneError', 'Please enter your phone number');
                isValid = false;
            }
            
            // Validate vehicle
            const vehicle = document.getElementById('vehicle');
            if (!vehicle.value) {
                showError('vehicleError', 'Please select a vehicle type');
                isValid = false;
            }
            
            // Validate service type
            const serviceType = document.getElementById('serviceType');
            if (!serviceType.value) {
                showError('serviceTypeError', 'Please select a service type');
                isValid = false;
            }
            
            // Validate passengers
            const passengers = document.getElementById('passengers');
            if (!passengers.value || passengers.value < 1) {
                showError('passengersError', 'Please enter number of passengers');
                isValid = false;
            }
            
            // Validate pickup location
            const pickupLocation = document.getElementById('pickupLocation');
            if (!pickupLocation.value.trim()) {
                showError('pickupLocationError', 'Please enter pickup location');
                isValid = false;
            }
            
            // Validate dropoff location
            const dropoffLocation = document.getElementById('dropoffLocation');
            if (!dropoffLocation.value.trim()) {
                showError('dropoffLocationError', 'Please enter drop-off location');
                isValid = false;
            }
            
            // Validate pickup date
            const pickupDate = document.getElementById('pickupDate');
            if (!pickupDate.value) {
                showError('pickupDateError', 'Please select pickup date');
                isValid = false;
            } else {
                const selectedDate = new Date(pickupDate.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (selectedDate < today) {
                    showError('pickupDateError', 'Pickup date cannot be in the past');
                    isValid = false;
                }
            }
            
            // Validate pickup time
            const pickupTime = document.getElementById('pickupTime');
            if (!pickupTime.value) {
                showError('pickupTimeError', 'Please select pickup time');
                isValid = false;
            }
            
            // Validate terms
            const terms = document.getElementById('terms');
            if (!terms.checked) {
                showError('termsError', 'Please agree to the terms and conditions');
                isValid = false;
            }
            
            if (isValid) {
                // Prepare form data
                const formData = {
                    fullName: fullName.value.trim(),
                    email: email.value.trim(),
                    phone: phone.value.trim(),
                    vehicle: vehicle.value,
                    serviceType: serviceType.value,
                    passengers: parseInt(passengers.value),
                    pickupLocation: pickupLocation.value.trim(),
                    dropoffLocation: dropoffLocation.value.trim(),
                    pickupDate: pickupDate.value,
                    pickupTime: pickupTime.value,
                    returnJourney: returnJourney.value,
                    returnDate: returnDate.value || null,
                    specialRequests: document.getElementById('specialRequests').value.trim()
                };
                
                const submitButton = bookingForm.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.textContent;
                submitButton.textContent = 'Opening WhatsApp...';
                submitButton.disabled = true;

                const bookingMessage = buildWhatsAppBookingMessage(formData);
                const whatsappUrl = `https://wa.me/447501073623?text=${encodeURIComponent(bookingMessage)}`;
                const whatsappWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

                if (!whatsappWindow) {
                    window.location.href = whatsappUrl;
                }

                const formSuccess = document.getElementById('formSuccess');
                if (formSuccess) {
                    formSuccess.style.display = 'block';
                    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }

                showBookingNotification();

                setTimeout(() => {
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                }, 1200);
            } else {
                // Scroll to first error
                const firstError = document.querySelector('.error-message:not(:empty)');
                if (firstError) {
                    firstError.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }
    
    // Helper function to show error messages
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    function buildWhatsAppBookingMessage(formData) {
        const vehicleLabels = {
            'e-class': 'Mercedes E-Class / Comfort',
            's-class': 'Mercedes S-Class / Executive',
            'v-class': 'Mercedes V-Class / Executive MPV'
        };
        const serviceLabels = {
            airport: 'Airport Transfer',
            corporate: 'Corporate Travel',
            event: 'Special Event',
            hourly: 'Hourly Hire',
            distance: 'Long Distance',
            other: 'Other'
        };
        const returnDetails = formData.returnJourney === 'yes'
            ? `Yes${formData.returnDate ? ` - ${formData.returnDate}` : ''}`
            : 'No';

        return [
            'Hello WMC Executive Private Hire, I would like to request a booking.',
            '',
            `Name: ${formData.fullName}`,
            `Email: ${formData.email}`,
            `Phone: ${formData.phone}`,
            `Vehicle: ${vehicleLabels[formData.vehicle] || formData.vehicle}`,
            `Service: ${serviceLabels[formData.serviceType] || formData.serviceType}`,
            `Passengers: ${formData.passengers}`,
            `Pickup: ${formData.pickupLocation}`,
            `Drop-off: ${formData.dropoffLocation}`,
            `Date: ${formData.pickupDate}`,
            `Time: ${formData.pickupTime}`,
            `Return journey: ${returnDetails}`,
            `Special requests: ${formData.specialRequests || 'None'}`,
            '',
            'Please reply on WhatsApp with availability and quote.'
        ].join('\n');
    }

    function showBookingNotification() {
        const existingNotification = document.querySelector('.booking-whatsapp-toast');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'booking-whatsapp-toast';
        notification.setAttribute('role', 'status');
        notification.innerHTML = `
            <div class="booking-whatsapp-toast-icon">✓</div>
            <div>
                <strong>WhatsApp booking ready</strong>
                <p>Send the message, then wait for our reply on WhatsApp.</p>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('is-visible');
        }, 50);

        setTimeout(() => {
            notification.classList.remove('is-visible');
            setTimeout(() => notification.remove(), 300);
        }, 7000);
    }
    
    // Set minimum date for date inputs to today
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => {
        input.setAttribute('min', today);
    });
    
    // Animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .fleet-card, .benefit-item, .value-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // WhatsApp button click tracking
    const whatsappButton = document.querySelector('.whatsapp-float');
    if (whatsappButton) {
        whatsappButton.addEventListener('click', function() {
            console.log('WhatsApp button clicked');
            // You can add analytics tracking here
        });
    }
    
    // Phone number formatting (UK format)
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                // Format as UK number
                if (value.startsWith('44')) {
                    value = '+' + value;
                } else if (value.startsWith('0')) {
                    value = '+44' + value.substring(1);
                }
            }
        });
    });
    
    // Lazy loading for images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        });
        
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
    
    // Print functionality
    const printButtons = document.querySelectorAll('[data-print]');
    printButtons.forEach(button => {
        button.addEventListener('click', function() {
            window.print();
        });
    });
    
    // Back to top button (if added)
    const backToTopButton = document.getElementById('backToTop');
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopButton.style.display = 'block';
            } else {
                backToTopButton.style.display = 'none';
            }
        });
        
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}
