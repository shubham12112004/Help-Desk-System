/**
 * API-Based Chatbot Service
 * Handles AI-powered responses with context awareness
 * Uses OpenAI API or Groq (free alternative)
 */

const HOSPITAL_SYSTEM_PROMPT = `You are a helpful Hospital Assistant AI for a comprehensive hospital management system. 
You are specially designed to help patients and hospital staff with hospital-related inquiries only.

YOUR SCOPE:
✅ Hospital Services (Appointments, Emergencies, Lab Tests, Pharmacy, Billing, etc.)
✅ Patient Information (Medical History, Prescriptions, Room Allocations, etc.)
✅ Staff Operations (Patient Management, Inventory, Reports, Schedules, etc.)
✅ General Medical Advice (Within hospital context only)
✅ Help Navigation (How to use different features)

OUT OF SCOPE (Redirect politely):
❌ General Knowledge Questions (Philosophy, History, Geography, etc.)
❌ Personal Finance (Unrelated to hospital billing)
❌ Tech Support (Unless hospital system related)
❌ Politics, Religion, Controversial Topics
❌ Code Writing/Programming Help
❌ Other Business/Services

RESPONSE GUIDELINES:
1. Be friendly, professional, and helpful
2. For hospital-related questions: Provide detailed, accurate guidance
3. For out-of-scope questions: Politely say "I'm made specifically for hospital assistance only" and redirect
4. Be concise (max 2-3 sentences, unless detailed info is needed)
5. Use bullet points for lists
6. For ambiguous questions, ask for clarification about the hospital context
7. Always mention relevant hospital sections/features when applicable
8. If urgency detected (emergency, pain, critical symptoms): Immediately advise calling 108 or visiting ER

HOSPITAL FEATURES TO REFERENCE:
- Appointments: Booking, rescheduling, tracking
- OPD Token Queue: Checking status, creating tokens
- Pharmacy: Medicine requests, prescription management
- Lab Tests: Ordering, checking results
- Billing: Payments, invoices, records
- Emergency Services: Ambulance, urgent care
- Medical Records: Patient history, prescriptions
- Room Allocation: Bed management, admission details
- Administrative: Tickets, complaints, feedback

ALWAYS be supportive and guide users to the right feature or department.`;

// Use Groq API (free, no key needed for demo or low volume) or OpenAI
const API_PROVIDER = import.meta.env.VITE_CHATBOT_API_PROVIDER || 'groq';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

/**
 * Check if question is out of scope
 */
function isOutOfScope(userMessage) {
  const outOfScopeKeywords = [
    // General knowledge
    'tell me about', 'who is', 'what is', 'when was', 'where is',
    'climate change', 'history of', 'philosophy', 'politics', 'history',
    
    // Not hospital related
    'math problem', 'solve', 'code', 'programming', 'javascript', 'python',
    'write a', 'create a', 'build a', 'how to bake', 'recipe', 'cooking',
    'how to play', 'game rules', 'sports', 'movies', 'music',
    
    // Generic AI things
    'are you', 'who are you', 'what are you', 'your purpose',
    'tell me a joke', 'tell me a story', 'write a poem',
    
    // Other services
    'book a hotel', 'book a flight', 'weather', 'stock market',
    'real estate', 'car', 'insurance claim'
  ];

  const lowerMessage = userMessage.toLowerCase();
  
  // Check exact hospital/medical keywords (these are IN scope)
  const inScopeKeywords = [
    'appointment', 'doctor', 'medicine', 'pharmacy', 'prescription',
    'emergency', 'ambulance', 'hospital', 'patient', 'billing',
    'lab', 'test', 'report', 'bed', 'room', 'token', 'queue',
    'admission', 'discharge', 'nurses', 'staff', 'clinic',
    'treatment', 'symptom', 'pain', 'checkup', 'consultation',
    'help desk', 'ticket', 'complaint', 'feedback'
  ];

  // If message contains IN scope keywords, it's definitely in scope
  if (inScopeKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return false;
  }

  // Check if message contains out-of-scope keywords
  return outOfScopeKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Generate out-of-scope response
 */
function generateOutOfScopeResponse(userMessage) {
  const responses = [
    `I'm made specifically for hospital assistance only. I can help you with appointments, medicine, billing, emergency services, and other hospital-related queries. 

What hospital service can I help you with today? 🏥`,
    
    `That question is outside my area of expertise. I'm your hospital assistant, designed to help with:
    
📅 Appointments & Doctor Scheduling
💊 Pharmacy & Medicine Requests
🚑 Emergency Services
💰 Billing & Payments
🔬 Lab Tests & Reports
🏥 Room Allocation & Admission

How can I assist with your hospital needs?`,
    
    `I appreciate the question, but I'm specialized for hospital support only! I can't help with that, but I'm here for anything related to your medical care and hospital services.

Would you like help with booking an appointment or checking your medical records?`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Call OpenAI API
 */
async function callOpenAI(messages) {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: HOSPITAL_SYSTEM_PROMPT
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Call Groq API (free alternative)
 */
async function callGroq(messages) {
  // For free usage, we'll use a fallback
  // In production, use Groq API key from https://console.groq.com
  
  const groqKey = GROQ_API_KEY || 'demo-key';
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: HOSPITAL_SYSTEM_PROMPT
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error('Groq API error');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    // Fallback to rule-based responses
    console.warn('Groq API unavailable, using fallback responses');
    return null;
  }
}

/**
 * Generate intelligent response based on message
 */
function generateIntelligentFallback(userMessage) {
  const input = userMessage.toLowerCase();
  
  // TICKET-RELATED QUESTIONS - MOST DETAILED
  if (input.includes('ticket') || input.includes('create ticket') || input.includes('issue') || input.includes('complaint')) {
    return `**HOW TO CREATE A SUPPORT TICKET - STEP BY STEP**

**Step 1: Login to Your Account**
   → Click "Get Started" button on the landing page
   → Enter your email and password
   → OR use Google Sign-in for quick login
   → You'll be redirected to your dashboard

**Step 2: Navigate to Tickets**
   → Look for "Tickets" option in the left sidebar
   → Click on "Create Ticket" button (blue button)

**Step 3: Fill Ticket Details**
   ✅ **Title** - Brief description of your issue
   ✅ **Category** - Select category (Appointment, Billing, Technical, Other)
   ✅ **Description** - Detailed explanation of your problem
   ✅ **Priority** - Low, Medium, High, or Urgent
   ✅ **Attachments** (Optional) - Add images/documents (up to 10MB)

**Step 4: Submit Your Ticket**
   → Click "Create Ticket" button
   → You'll receive a ticket number (e.g., #TK-12345)
   → Check your email for confirmation

**Step 5: Track Your Ticket**
   → Go to "My Tickets" section
   → Click on your ticket to see updates in real-time
   → Chat with support staff assigned to your ticket
   → Ticket resolves when marked "Completed"

**Priority Response Times:**
   🟢 Low (24-48 hours) | 🟡 Medium (8-12 hours) | 🔴 High (4-6 hours) | 🚨 Urgent (30 min)

Need help with a specific issue? Ask me and I'll guide you further!`;
  }
  
  // LOGIN PROCESS
  if (input.includes('login') || input.includes('sign in') || input.includes('how do i login')) {
    return `**HOW TO LOGIN - STEP BY STEP**

**Method 1: Email & Password Login**
   
   Step 1: Go to http://localhost:5174/auth
   Step 2: Click on "Sign In" tab
   Step 3: Enter your registered email
   Step 4: Enter your password
   Step 5: Click "Sign In" button
   Step 6: You'll be redirected to your dashboard ✅

**Method 2: Google Login (Fastest)**
   
   Step 1: Go to http://localhost:5174/auth
   Step 2: Click "Sign in with Google" button
   Step 3: Select your Google account
   Step 4: Allow permissions
   Step 5: Automatic redirect to dashboard ✅

**Don't Have an Account?**
   
   Click "Create New Account" tab and:
   1. Enter your full name
   2. Enter your email
   3. Create a strong password
   4. Select your role (Patient/Doctor/Staff)
   5. Click "Sign Up"
   6. Check email for verification (if required)
   7. Login with your credentials ✅

**Forgot Password?**
   → Click "Forgot Password" on login page
   → Enter your email
   → Check email for reset link
   → Create new password
   → Login with new password ✅

After login, you can:
   📅 Book Appointments
   🎟️ Check OPD Queue
   💊 Request Medicine
   🏥 View Medical Records
   🎫 Create Support Tickets

What would you like to do after logging in?`;
  }
  
  // APPOINTMENT BOOKING
  if (input.includes('appointment') || input.includes('book') || input.includes('schedule doctor')) {
    return `**HOW TO BOOK AN APPOINTMENT - STEP BY STEP**

**Step 1: Login to Your Account**
   ✅ (See login instructions above)

**Step 2: Go to Appointments Section**
   → Click "Appointments" in the left sidebar
   → Click "Book New Appointment" button

**Step 3: Select Department & Specialist**
   → Choose department:
      ❤️ Cardiology | 👶 Pediatrics | 🧠 Neurology
      🦴 Orthopedics | 🏥 General Surgery | Other
   → Select your preferred doctor from the list
   → View doctor's qualifications and experience

**Step 4: Choose Date & Time**
   📅 Calendar shows available dates
   🕐 Green slots = Available | Gray slots = Booked
   → Click on your preferred slot
   → Confirm the date and time

**Step 5: Add Patient Information**
   → Your name (auto-filled)
   → Patient ID (auto-filled)
   → Contact number
   → Reason for visit (optional)
   → Medical history (optional)

**Step 6: Review & Confirm**
   → Check all details
   → Click "Confirm Appointment"
   → You'll receive:
      📧 Email confirmation
      🎫 Appointment ID (e.g., APT-12345)
      📱 SMS reminder (if enabled)

**Step 7: Track Your Appointment**
   → Go to "My Appointments"
   → See all upcoming and past appointments
   → Get OTP token when appointment is near
   → Rate the doctor after completion

**Tips:**
   💡 Book 24-48 hours in advance for better slots
   💡 Bring your appointment ID to hospital
   💡 Arrive 10 minutes early
   💡 Reschedule if needed (at least 2 hours before)

Ready to book? Would you like to know about a specific specialty?`;
  }
  
  // TOKEN QUEUE
  if (input.includes('token') || input.includes('queue') || input.includes('opd')) {
    return `**OPD TOKEN QUEUE - STEP BY STEP**

**What is OPD Token?**
   🎫 Digital token for outpatient department visits
   ⏱️ Know your exact position in queue
   📊 See real-time waiting time

**How to Create a Token:**
   
   Step 1: Login to your account
   Step 2: Click "Token Queue" in left sidebar
   Step 3: Click "Create New Token"
   Step 4: Select your department:
      🏫 General OPD | ❤️ Cardiology | 👶 Pediatrics | etc.
   Step 5: Click "Generate Token"
   Step 6: You get Token Number (e.g., 🎟️ Token #A-042)
   
**Your Token Shows:**
   ✅ Your position in queue (e.g., "You are 5th")
   ✅ Estimated wait time (e.g., "~25 minutes")
   ✅ Average consultation time
   ✅ Department details
   ✅ Assigned doctor/nurse

**Track Your Token:**
   → Keep checking "My Tokens" section
   → Queue position updates in real-time
   → You'll get notification when called
   → Show token number at reception counter

**Token Status:**
   🟢 Active - You're in queue
   🟡 Waiting - Coming soon to consultation
   🟢 Called - Go to doctor now
   ✅ Completed - Consultation done
   ❌ Cancelled - If you cancel

**Tips:**
   💡 Arrive before your token called
   💡 Keep token number safe
   💡 You can leave queue by canceling
   💡 Generate new token if needed

Need help with specific department?`;
  }
  
  // PHARMACY & MEDICINE
  if (input.includes('medicine') || input.includes('pharmacy') || input.includes('prescription')) {
    return `**PHARMACY & MEDICINE REQUEST - STEP BY STEP**

**View Your Prescriptions:**
   
   Step 1: Login to account
   Step 2: Click "Medical" or "Pharmacy" section
   Step 3: Click "My Prescriptions"
   Step 4: See all active and past prescriptions
   Step 5: Doctor's name, date, and medicines listed

**Request Medicine from Pharmacy:**
   
   Step 1: Go to "Pharmacy" section
   Step 2: Click "Request Medicine"
   Step 3: Search medicine by name
   💊 See available quantity
   💊 Check price
   💊 See expiry date
   Step 4: Select quantity needed
   Step 5: Add your location (delivery address)
   Step 6: Choose delivery method:
      🏪 Pick up at pharmacy
      🚚 Delivery to your home
   Step 7: Make payment (if needed)
   Step 8: Confirm request

**Track Your Medicine Request:**
   → Go to "Medicine Requests"
   → See status: 📝 Pending | 🔄 Processing | 🚚 Out for Delivery | ✅ Delivered
   → Get real-time updates
   → Receive notification when ready

**Medicine History:**
   → View all past medicine requests
   → Reorder previous medicines with 1 click
   → See your medicine consumption patterns

**Tips:**
   💡 Upload prescription image for verification
   💡 Order through doctor's digital prescription
   💡 Check medicine interactions
   💡 Pharmacist available for consultation

Questions about a specific medicine?`;
  }

  // THE REST OF THE FALLBACK RESPONSES...
  if (input.includes('appointment') || input.includes('book') || input.includes('schedule')) {
    return `I'd be happy to help with appointments!`;
  }
  
  if (input.includes('emergency') || input.includes('urgent') || input.includes('ambulance')) {
    return `🚨 **EMERGENCY RESPONSE**

If this is a medical emergency:
1. **CALL 108 IMMEDIATELY**
2. Or visit the nearest Emergency Department
3. Use Ambulance Request feature in your dashboard

For non-urgent issues, I'm here to help with appointments and general queries.`;
  }
  
  if (input.includes('lab') || input.includes('test') || input.includes('report')) {
    return `**LAB TESTS & REPORTS - STEP BY STEP**

**Order Lab Tests:**
   Step 1: Login to account
   Step 2: Click "Lab Tests" section
   Step 3: Click "Order New Test"
   Step 4: Select test type (Blood, X-ray, CT Scan, etc.)
   Step 5: Choose collection time/date
   Step 6: Pay for test
   Step 7: Receive collection date

**View Your Lab Reports:**
   Step 1: Go to "Lab Reports"
   Step 2: See all completed tests
   Step 3: Click on report to view PDF
   Step 4: Download or share with doctor
   Step 5: Add personal notes if needed

**Expected Timeline:**
   📋 Sample collection: Immediate
   ⏳ Test processing: 24-48 hours
   📊 Report ready: Same day (urgent) or next day
   📧 Email notification when ready

Need specific test information?`;
  }
  
  if (input.includes('billing') || input.includes('payment') || input.includes('invoice')) {
    return `**BILLING & PAYMENT - STEP BY STEP**

**View Your Bills:**
   Step 1: Login to account
   Step 2: Click "Billing" section
   Step 3: See all invoices and statements
   Step 4: Click on bill for details
   Step 5: Download PDF copy

**Make Payment:**
   Step 1: Click "Make Payment"
   Step 2: Select bill to pay
   Step 3: Choose payment method:
      💳 Credit/Debit Card
      🏦 Netbanking
      📱 UPI
      💰 Cash at counter
   Step 4: Enter amount
   Step 5: Complete payment
   Step 6: Get receipt

**Payment History:**
   → See all paid and pending bills
   → Track payment status
   → Download receipts anytime

Can I help with a specific billing question?`;
  }
  
  if (input.includes('room') || input.includes('bed') || input.includes('admission')) {
    return `**ROOM & BED ALLOCATION - HELP**

**Check Your Current Room:**
   Step 1: Login and go to "Dashboard"
   Step 2: See current room details:
      🛏️ Room number
      👨‍⚕️ Assigned doctor
      👩‍⚕️ Assigned nurse
      📍 Ward location
      🔧 Facilities available

**Room Amenities:**
   ✅ AC/Cooling
   ✅ Attached Bathroom
   ✅ TV & Entertainment
   ✅ WiFi Internet
   ✅ 24/7 Nursing
   ✅ Room Service

**Need Room Change:**
   → Contact nursing station
   → Speak with hospital administration
   → Request submitted and reviewed

Is this for current admission?`;
  }
  
  return `I'm your Hospital Assistant! I can help you with:

📅 **Appointments** - Booking and rescheduling
🎫 **Tickets** - Creating support requests
🎟️ **OPD Queue** - Token status
💊 **Pharmacy** - Medicine requests
🚑 **Emergency** - Urgent care
🔬 **Lab Tests** - Results and reports
💰 **Billing** - Payments
🏥 **Room Info** - Bed allocation
📞 **Help Desk** - Complaints

What would you like help with? Just type your question! 😊`;
}

/**
 * Main function to get chatbot response
 */
export async function getChatbotResponse(userMessage, conversationHistory = []) {
  try {
    // Check if message is out of scope
    if (isOutOfScope(userMessage)) {
      return generateOutOfScopeResponse(userMessage);
    }

    // Ensure conversationHistory is always an array (handle string context parameter)
    const historyArray = Array.isArray(conversationHistory) ? conversationHistory : [];
    
    // Prepare messages for API
    const messages = historyArray.map(msg => ({
      role: msg.role || 'user',
      content: msg.content || msg
    }));
    messages.push({
      role: 'user',
      content: userMessage
    });

    let response = null;

    // Try API call based on provider
    if (OPENAI_API_KEY && API_PROVIDER === 'openai') {
      try {
        response = await callOpenAI(messages);
      } catch (error) {
        console.warn('OpenAI API error:', error);
        response = null;
      }
    }

    // Try Groq if OpenAI not available
    if (!response && GROQ_API_KEY) {
      try {
        response = await callGroq(messages);
      } catch (error) {
        console.warn('Groq API error:', error);
        response = null;
      }
    }

    // Fallback to intelligent response
    if (!response) {
      response = generateIntelligentFallback(userMessage);
    }

    return response; // Return string directly, not object

  } catch (error) {
    console.error('Chatbot error:', error);
    
    return `I apologize, but I'm having trouble processing your request. Please try again or contact our help desk for assistance. Error: ${error.message}`;
  }
}

/**
 * Get quick suggestions based on current page/context
 */
export function getQuickSuggestions(userData = {}) {
  const { role = 'patient', department = null } = userData;

  if (role === 'staff' || role === 'admin') {
    return [
      "How do I manage appointments?",
      "Show patient records",
      "Check inventory status",
      "Generate reports"
    ];
  }

  // Patient suggestions
  const suggestions = [
    "Book an appointment",
    "Check my token status",
    "Request medicine",
    "View lab results"
  ];

  if (department) {
    suggestions.unshift(`Show ${department} doctors`);
  }

  return suggestions;
}

/**
 * Validate API configuration
 */
export function validateChatbotConfig() {
  const config = {
    provider: API_PROVIDER,
    hasOpenAIKey: !!OPENAI_API_KEY,
    hasGroqKey: !!GROQ_API_KEY,
    fallbackEnabled: true, // Always available
  };

  if (!OPENAI_API_KEY && !GROQ_API_KEY) {
    console.info('ℹ️ No API keys configured. Using intelligent fallback responses.');
    console.info('To enable AI responses, add:');
    console.info('  - VITE_OPENAI_API_KEY=your-key (for OpenAI)');
    console.info('  - VITE_GROQ_API_KEY=your-key (for Groq - free alternative)');
  }

  return config;
}
