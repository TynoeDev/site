# WhatsApp Business API Integration for 156Euphoria Boutique Villa

This document provides information on setting up and configuring the WhatsApp Business API for 156Euphoria Boutique Villa's website.

## Overview

The WhatsApp API integration enables:
- Customer support via WhatsApp
- Promotional broadcasts to opted-in customers
- Abandoned cart reminders
- Template messages for booking confirmations and other notifications

## Requirements

1. A WhatsApp Business account
2. Facebook Business Manager account
3. Approved WhatsApp Business API access
4. An approved phone number for WhatsApp Business API

## Setup Process

### 1. Facebook Business Manager Setup

1. Go to [Facebook Business Manager](https://business.facebook.com/)
2. Create or access your business account
3. Navigate to "Business Settings" > "Accounts" > "WhatsApp accounts"
4. Add a new WhatsApp account or connect existing one

### 2. WhatsApp Business API Configuration

1. Access the [WhatsApp Business Platform](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
2. Follow the steps to connect your WhatsApp Business number
3. Apply for WhatsApp API access
4. Obtain your API credentials:
   - WhatsApp Business Account ID
   - Phone Number ID
   - Access Token

### 3. Message Templates

For this integration, you need to create and get approval for the following message templates:

1. **Welcome Message**
   - Purpose: Initial message for new subscribers
   - Example: "Welcome to 156Euphoria Boutique Villa! Thank you for subscribing to our updates. Reply with HELP for assistance or STOP to unsubscribe."

2. **Booking Confirmation**
   - Purpose: Confirm booking details
   - Example: "Your booking for {{1}} nights at 156Euphoria Boutique Villa has been confirmed. Check-in: {{2}}. Your booking reference is {{3}}. Need help? Reply to this message."

3. **Abandoned Cart**
   - Purpose: Reminder for incomplete bookings
   - Example: "We noticed you were looking to book our villa for {{1}} with {{2}} guests. Your booking wasn't completed. Need help? Use this link to return to your booking: {{3}}"

4. **Promotional Offer**
   - Purpose: Special offers and promotions
   - Example: "Special offer: {{1}} - Get {{2}}% off your stay at 156Euphoria Boutique Villa! Valid until {{3}}. Book now: {{4}}"

### 4. Website Integration

1. Update the configuration in `js/whatsapp-api.js`:
   ```javascript
   const whatsAppConfig = {
       phoneNumber: 'YOUR_PHONE_NUMBER',
       businessAccount: true,
       apiEndpoint: 'https://graph.facebook.com/v18.0/',
       ...
   };
   ```

2. Update the API credentials in `php/whatsapp-api.php`:
   ```php
   $whatsappConfig = [
       'accessToken' => 'YOUR_WHATSAPP_BUSINESS_API_TOKEN',
       'phoneNumberId' => 'YOUR_PHONE_NUMBER_ID',
       ...
   ];
   ```

## Security Considerations

1. Always store API credentials securely, preferably as environment variables
2. Implement rate limiting to prevent abuse
3. Encrypt all communication between your server and WhatsApp API
4. Maintain proper privacy policies and obtain user consent before sending messages
5. Comply with WhatsApp's Business Policy and Meta's data usage terms

## Testing

Before going live, test each template message and feature to ensure they work as expected:

1. Send test welcome messages to your own number
2. Test the abandoned cart flow
3. Test the promotional broadcast feature with a small group
4. Verify opt-in/opt-out functionality works properly

## Support

If you encounter any issues with the WhatsApp API integration, contact:
- WhatsApp Business API support: https://www.facebook.com/business/help
- Your website developer for technical implementation issues
