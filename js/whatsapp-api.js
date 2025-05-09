/**
 * WhatsApp API Integration for 156Euphoria Boutique Villa
 * Handles WhatsApp Business API interactions for customer support, promotional messages,
 * and automated notifications.
 */

// WhatsApp API Configuration
const whatsAppConfig = {
    phoneNumber: '27798393537', // South African phone number
    businessAccount: true,
    apiEndpoint: 'https://graph.facebook.com/v18.0/', // Facebook Graph API endpoint for WhatsApp Business
    templates: {
        welcome: {
            name: 'welcome_message',
            language: {
                code: 'en'
            }
        },
        bookingConfirmation: {
            name: 'booking_confirmation',
            language: {
                code: 'en'
            }
        },
        abandonedCart: {
            name: 'abandoned_cart',
            language: {
                code: 'en'
            }
        },
        promotionalOffer: {
            name: 'promotional_offer',
            language: {
                code: 'en'
            }
        }
    }
};

// WhatsApp API Helper class
class WhatsAppAPI {
    constructor(config) {
        this.config = config;
        this.accessToken = null; // Will be set after authentication
        this.initialize();
    }

    // Initialize and authenticate the API
    initialize() {
        // Check if we have a stored token
        this.accessToken = localStorage.getItem('whatsapp_access_token');

        // Add event listeners for WhatsApp-related actions
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
        });

        console.log('WhatsApp API initialized');
    }

    // Set up event listeners for relevant page interactions
    setupEventListeners() {
        // Direct WhatsApp chat button
        const whatsappLinks = document.querySelectorAll('a[href^="http://wa.me"], a[href^="https://wa.me"]');
        whatsappLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.trackWhatsAppClick(e);
            });
        });

        // Booking form listeners
        const bookingForm = document.getElementById('searchform');
        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => {
                // Capture booking intent data for potential abandoned cart messages
                this.captureBookingIntent(e);
            });
        }

        // Contact form submission
        const contactForm = document.getElementById('contactform');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                // Option to send confirmation via WhatsApp
                this.captureContactInfo(e);
            });
        }
    }

    // Track clicks on WhatsApp links for analytics
    trackWhatsAppClick(event) {
        // Analytics tracking code
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
                'event_category': 'WhatsApp',
                'event_label': 'Direct Chat',
                'value': 1
            });
        }

        // We don't prevent default as we want the WhatsApp link to work normally
        console.log('WhatsApp link clicked');
    }

    // Capture booking intent data
    captureBookingIntent(event) {
        // Don't prevent the default form submission
        const dates = document.getElementById('res_date').value;
        const guests = document.querySelector('input[name="guests_quantity"]').value;

        // Store this data for potential abandoned cart follow-up
        if (dates && guests) {
            const bookingIntent = {
                dates: dates,
                guests: guests,
                timestamp: new Date().toISOString()
            };

            localStorage.setItem('booking_intent', JSON.stringify(bookingIntent));
            console.log('Booking intent captured', bookingIntent);

            // You could also send this to your server for processing
        }
    }

    // Capture contact form info with option for WhatsApp
    captureContactInfo(event) {
        // Get the form data
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const comments = document.getElementById('comments').value;

        // Optional: Check if user opted-in to WhatsApp communications
        const whatsappCheckbox = document.getElementById('whatsapp_optin');
        let whatsappOptin = false;

        if (whatsappCheckbox && whatsappCheckbox.checked) {
            whatsappOptin = true;
        }

        // Store contact info
        const contactInfo = {
            name: name,
            email: email,
            comments: comments,
            whatsappOptin: whatsappOptin,
            timestamp: new Date().toISOString()
        };

        // Store locally and/or send to server
        if (whatsappOptin) {
            localStorage.setItem('contact_whatsapp_optin', JSON.stringify(contactInfo));
            console.log('Contact with WhatsApp opt-in captured', contactInfo);

            // Show confirmation with WhatsApp option
            this.showWhatsAppFollowUp();
        }
    }

    // Show WhatsApp follow-up option after form submission
    showWhatsAppFollowUp() {
        // Create and show a modal or message with WhatsApp option
        const messageContainer = document.getElementById('message');
        if (messageContainer) {
            const whatsappLink = `https://wa.me/${this.config.phoneNumber}?text=${encodeURIComponent('Hello, I just submitted an inquiry about 156Euphoria Boutique Villa. I would like to receive updates via WhatsApp.')}`;

            messageContainer.innerHTML = `
                <div class="alert_message success">
                    <p>Thank you for your message! We'll get back to you soon.</p>
                    <p>Would you like to receive updates via WhatsApp?</p>
                    <a href="${whatsappLink}" class="btn" target="_blank" rel="noopener noreferrer">
                        <i class="fa-brands fa-whatsapp"></i> Continue on WhatsApp
                    </a>
                </div>
            `;
        }
    }

    // Send template message via WhatsApp Business API
    sendTemplateMessage(phoneNumber, template, parameters = []) {
        // This would normally make an authenticated API call to WhatsApp Business API
        // For front-end implementation, this would connect to your backend service

        console.log(`Template message "${template.name}" would be sent to ${phoneNumber}`);

        // In production, you'd make an API call to your backend:
        /*
        fetch('/api/whatsapp/send-template', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phoneNumber: phoneNumber,
                template: template.name,
                language: template.language.code,
                parameters: parameters
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
        */
    }

    // Send an abandoned cart reminder
    sendAbandonedCartReminder(phoneNumber) {
        // Get stored booking intent
        const bookingIntent = JSON.parse(localStorage.getItem('booking_intent') || '{}');

        // Check if we have valid data and it's recent (within last 24 hours)
        if (bookingIntent.dates && bookingIntent.guests) {
            const timestamp = new Date(bookingIntent.timestamp);
            const now = new Date();
            const hoursSinceIntent = (now - timestamp) / (1000 * 60 * 60);

            if (hoursSinceIntent < 24) {
                // Parameters for template
                const parameters = [
                    bookingIntent.dates,
                    bookingIntent.guests,
                    "https://156euphoriavilla.co.za/booking"
                ];

                // Send the template message
                this.sendTemplateMessage(
                    phoneNumber,
                    this.config.templates.abandonedCart,
                    parameters
                );
            }
        }
    }

    // Send a promotional broadcast
    sendPromotionalBroadcast(phoneNumbers, offerDetails) {
        // This would send a promotional message to all opted-in numbers
        phoneNumbers.forEach(phoneNumber => {
            // Parameters for template
            const parameters = [
                offerDetails.title,
                offerDetails.discount,
                offerDetails.validUntil,
                offerDetails.bookingLink
            ];

            // Send the template message
            this.sendTemplateMessage(
                phoneNumber,
                this.config.templates.promotionalOffer,
                parameters
            );
        });
    }
}

// Initialize the WhatsApp API
const whatsAppAPI = new WhatsAppAPI(whatsAppConfig);

// Export for use in other scripts
window.whatsAppAPI = whatsAppAPI;