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
                
                // Show loading state
                const submitButton = bookingForm.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.textContent;
                submitButton.textContent = 'Submitting...';
                submitButton.disabled = true;
                
                // Prepare WhatsApp message and open chat
                const waNumber = '447501073623';
                // Friendly labels for vehicle and service
                const vehicleNames = {
                    'e-class': 'Mercedes E-Class',
                    's-class': 'Mercedes S-Class',
                    'v-class': 'Mercedes V-Class'
                };
                const serviceNames = {
                    'airport': 'Airport Transfer',
                    'corporate': 'Corporate Travel',
                    'event': 'Special Event',
                    'hourly': 'Hourly Hire',
                    'distance': 'Long Distance',
                    'other': 'Other'
                };

                const lines = [];
                lines.push('Booking request from website:');
                lines.push(`Name: ${formData.fullName}`);
                lines.push(`Email: ${formData.email}`);
                lines.push(`Phone: ${formData.phone}`);
                lines.push(`Vehicle: ${vehicleNames[formData.vehicle] || formData.vehicle}`);
                lines.push(`Service: ${serviceNames[formData.serviceType] || formData.serviceType}`);
                lines.push(`Passengers: ${formData.passengers}`);
                lines.push(`Pickup: ${formData.pickupLocation}`);
                lines.push(`Dropoff: ${formData.dropoffLocation}`);
                lines.push(`Date: ${formData.pickupDate}`);
                lines.push(`Time: ${formData.pickupTime}`);
                if (formData.returnJourney === 'yes' && formData.returnDate) {
                    lines.push(`Return: ${formData.returnDate}`);
                }
                if (formData.specialRequests) {
                    lines.push(`Requests: ${formData.specialRequests}`);
                }
                lines.push('Please wait for approval. We will confirm shortly.');
                const waText = encodeURIComponent(lines.join('\n'));
                const waUrl = `https://wa.me/${waNumber}?text=${waText}`;

                // Open WhatsApp chat in new tab/window (user will send the message)
                window.open(waUrl, '_blank');

                // Also send to API in background so server records the booking
                fetch('/api/bookings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                })
                .then(response => response.json())
                .then(data => {
                    // Show success message regardless of API response since WhatsApp was opened
                    bookingForm.style.display = 'none';
                    const formSuccess = document.getElementById('formSuccess');
                    if (formSuccess) {
                        formSuccess.style.display = 'block';
                        const successMessage = formSuccess.querySelector('p');
                        if (successMessage) {
                            if (data && data.data && data.data.bookingReference) {
                                successMessage.innerHTML = `Thank you. Your booking reference is <strong>${data.data.bookingReference}</strong>. We have opened WhatsApp for you to send the booking details. Please wait for approval.`;
                            } else {
                                successMessage.innerHTML = `Thank you. We have opened WhatsApp for you to send the booking details. Please wait for approval and we will confirm shortly.`;
                            }
                        }
                    }

                    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    // Reset form after a delay
                    setTimeout(() => {
                        bookingForm.reset();
                        bookingForm.style.display = 'block';
                        formSuccess.style.display = 'none';
                        submitButton.textContent = originalButtonText;
                        submitButton.disabled = false;
                    }, 10000);
                })
                .catch(error => {
                    console.error('Booking submission error:', error);
                    // Still show success because WhatsApp chat was opened
                    bookingForm.style.display = 'none';
                    const formSuccess = document.getElementById('formSuccess');
                    if (formSuccess) {
                        formSuccess.style.display = 'block';
                        const successMessage = formSuccess.querySelector('p');
                        if (successMessage) {
                            successMessage.innerHTML = `Thank you. We have opened WhatsApp for you to send the booking details. Please wait for approval. (Saving to server failed — please follow up if you do not receive confirmation.)`;
                        }
                    }

                    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    setTimeout(() => {
                        bookingForm.reset();
                        bookingForm.style.display = 'block';
                        formSuccess.style.display = 'none';
                        submitButton.textContent = originalButtonText;
                        submitButton.disabled = false;
                    }, 10000);
                });
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
