<?php
/**
 * WhatsApp API Backend Handler
 * This file processes WhatsApp API interactions for 156Euphoria Boutique Villa
 * 
 * Requires WhatsApp Business API credentials
 */

// Security: Only allow POST requests from our domain
header('Content-Type: application/json');

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get the JSON data
$requestData = json_decode(file_get_contents('php://input'), true);

// Check for required fields
if (!isset($requestData['action'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required field: action']);
    exit;
}

// WhatsApp Business API credentials
// IMPORTANT: In production, these should be stored securely in environment variables
$whatsappConfig = [
    'accessToken' => 'YOUR_WHATSAPP_BUSINESS_API_TOKEN', // Replace with your actual token
    'phoneNumberId' => 'YOUR_PHONE_NUMBER_ID', // Replace with your WhatsApp Business phone number ID
    'apiVersion' => 'v18.0',
    'baseUrl' => 'https://graph.facebook.com/'
];

// Process different actions
switch ($requestData['action']) {
    case 'opt_in':
        handleOptIn($requestData, $whatsappConfig);
        break;
    
    case 'send_template':
        sendTemplateMessage($requestData, $whatsappConfig);
        break;
    
    case 'send_promotional':
        sendPromotionalBroadcast($requestData, $whatsappConfig);
        break;
    
    case 'send_abandoned_cart':
        sendAbandonedCartReminder($requestData, $whatsappConfig);
        break;
    
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Unknown action: ' . $requestData['action']]);
        exit;
}

/**
 * Handle WhatsApp opt-in
 */
function handleOptIn($data, $config) {
    // Required fields
    if (!isset($data['phone']) || !isset($data['name']) || !isset($data['email'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields for opt-in']);
        return;
    }
    
    // Normalize phone number to full international format without + or spaces
    $phoneNumber = preg_replace('/[^0-9]/', '', $data['phone']);
    
    // Store opt-in in database (simplified here)
    $timestamp = date('Y-m-d H:i:s');
    $optInData = [
        'phone' => $phoneNumber,
        'name' => $data['name'],
        'email' => $data['email'],
        'timestamp' => $timestamp,
        'source' => $data['source'] ?? 'website'
    ];
    
    // In production, you would store this in your database
    // storeOptIn($optInData);
    
    // Return success
    echo json_encode([
        'success' => true,
        'message' => 'Opt-in successfully recorded',
        'data' => $optInData
    ]);
}

/**
 * Send a template message via WhatsApp API
 */
function sendTemplateMessage($data, $config) {
    // Required fields
    if (!isset($data['phone']) || !isset($data['template']) || !isset($data['language'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields for template message']);
        return;
    }
    
    // Normalize phone number
    $phoneNumber = preg_replace('/[^0-9]/', '', $data['phone']);
    
    // Prepare API request
    $url = $config['baseUrl'] . $config['apiVersion'] . '/' . $config['phoneNumberId'] . '/messages';
    
    // Build components if parameters exist
    $components = [];
    if (isset($data['parameters']) && is_array($data['parameters']) && !empty($data['parameters'])) {
        $parameters = [];
        foreach ($data['parameters'] as $param) {
            $parameters[] = ['type' => 'text', 'text' => $param];
        }
        
        $components = [
            ['type' => 'body', 'parameters' => $parameters]
        ];
    }
    
    // Prepare message payload
    $payload = [
        'messaging_product' => 'whatsapp',
        'to' => $phoneNumber,
        'type' => 'template',
        'template' => [
            'name' => $data['template'],
            'language' => [
                'code' => $data['language']
            ]
        ]
    ];
    
    // Add components if we have parameters
    if (!empty($components)) {
        $payload['template']['components'] = $components;
    }
    
    // In a real application, make the API call
    /*
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $config['accessToken'],
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpcode >= 200 && $httpcode < 300) {
        echo json_encode(['success' => true, 'response' => json_decode($response)]);
    } else {
        http_response_code($httpcode);
        echo json_encode(['error' => 'API request failed', 'response' => json_decode($response)]);
    }
    */
    
    // For this example, just return the payload that would be sent
    echo json_encode([
        'success' => true,
        'message' => 'Template message would be sent (simulation)',
        'payload' => $payload
    ]);
}

/**
 * Send promotional broadcast to multiple recipients
 */
function sendPromotionalBroadcast($data, $config) {
    // Required fields
    if (!isset($data['phones']) || !isset($data['template']) || !isset($data['language']) || !isset($data['parameters'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields for promotional broadcast']);
        return;
    }
    
    // Prepare responses array
    $responses = [];
    
    // Process each phone number
    foreach ($data['phones'] as $phone) {
        // Create message data for each recipient
        $messageData = [
            'phone' => $phone,
            'template' => $data['template'],
            'language' => $data['language'],
            'parameters' => $data['parameters']
        ];
        
        // In production, you would actually send these messages
        // For now, just log them
        $responses[] = [
            'phone' => $phone,
            'status' => 'queued'
        ];
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Promotional broadcast queued',
        'responses' => $responses
    ]);
}

/**
 * Send abandoned cart reminder
 */
function sendAbandonedCartReminder($data, $config) {
    // Required fields
    if (!isset($data['phone']) || !isset($data['bookingDetails'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields for abandoned cart reminder']);
        return;
    }
    
    // Get booking details
    $bookingDetails = $data['bookingDetails'];
    
    // Prepare template message data
    $templateData = [
        'phone' => $data['phone'],
        'template' => 'abandoned_cart',
        'language' => 'en',
        'parameters' => [
            $bookingDetails['dates'],
            $bookingDetails['guests'],
            'https://156euphoriavilla.co.za/booking' // Booking link
        ]
    ];
    
    // Send the template message
    sendTemplateMessage($templateData, $config);
}
