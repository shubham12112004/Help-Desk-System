# AI Chatbot Guide

## Overview
The Hospital AI Assistant is a fully functional chatbot available to both patients and staff members throughout the application. It provides context-aware help and quick access to various hospital services.

## Features

### 🎯 Role-Based Interface
The chatbot automatically adapts based on the user's role:
- **Patient Portal**: Focuses on booking, treatment, and medical services
- **Staff Portal**: Provides administrative and management features

### 📍 Global Availability
- Fixed floating button at bottom-right corner of all pages
- Persists across navigation
- Accessible with a single click
- Animated bounce effect to draw attention

### 💬 Chat Functionality

#### For Patients
**Quick Actions:**
1. 📅 **Book Appointment** - Direct assistance with appointment scheduling
2. 🎟️ **Check Token Status** - OPD token queue information
3. 💊 **Medicine Request** - Pharmacy and prescription help
4. 🚨 **Emergency Help** - Immediate emergency response guidance

**AI Responses Cover:**
- Appointment booking and scheduling
- OPD token queue status
- Medicine and pharmacy requests
- Lab reports and test results
- Room and bed allocation
- Billing and payment information
- Emergency services and ambulance requests

#### For Staff
**Quick Actions:**
1. 📋 **Manage Appointments** - Appointment management guidance
2. 👥 **View Patients** - Patient record access help
3. 📦 **Check Inventory** - Stock and medicine inventory
4. 📊 **View Reports** - Analytics and reporting assistance

**AI Responses Cover:**
- Patient record management
- Appointment scheduling and coordination
- Inventory tracking and alerts
- Reports and analytics generation
- Ticket management
- Administrative tasks

### 🗄️ Chat Persistence
- All conversations are saved to database
- Chat history is preserved across sessions
- Messages include timestamps
- Previous conversations load automatically on reopening

### 🎨 User Interface
**Chat Window:**
- 400px width × 600px height
- Fixed position (bottom-right)
- Responsive message bubbles
- User and bot avatar indicators
- Scroll area for message history
- Loading states with spinner animations

**Message Display:**
- User messages: Right-aligned, primary color
- Bot messages: Left-aligned, muted background
- Timestamps for all messages
- Auto-scroll to latest message

**Input Area:**
- Text input field with placeholder
- Send button with icon
- Enter key support for quick sending
- Disabled state during loading

## Technical Implementation

### Components Used
- **File**: `src/components/HospitalAIChatbot.jsx`
- **Lines of Code**: 345+
- **Dependencies**: 
  - Lucide React icons
  - Shadcn/ui components
  - Supabase for persistence
  - Custom hospital services

### Backend Services
Located in `src/services/hospital.js`:
```javascript
createChat(userId, title)      // Create new chat session
getChats(userId)               // Get user's chat history
getChatMessages(chatId)        // Load messages for a chat
sendMessage(chatId, role, content) // Send new message
```

### Database Tables
- `ai_chats`: Stores chat sessions
- `ai_messages`: Stores individual messages

### Response Generation
**Current Implementation**: Rule-based AI responses
- Fast and reliable
- No external API costs
- Covers all hospital services
- Context-aware based on keywords

**Future Enhancement**: OpenAI API integration
- More natural conversations
- Better context understanding
- Personalized responses
- Multi-turn conversations

## User Experience

### How Patients Use It
1. Click floating chatbot button
2. See 4 quick action buttons
3. Click button or type message
4. Receive instant guidance
5. Follow links to relevant dashboard sections
6. Chat history preserved for later

### How Staff Use It
1. Click floating chatbot button
2. See staff-specific quick actions
3. Get administrative guidance
4. Quick access to management features
5. Generate reports and view analytics
6. Manage patient workflows efficiently

## Key Benefits

### ✅ Always Available
- No need to search for help
- Instant access from any page
- Consistent user experience

### ✅ Context-Aware
- Knows user role (patient vs staff)
- Provides relevant suggestions
- Directs to appropriate sections

### ✅ Reduces Support Load
- Answers common questions
- Guides users step-by-step
- Available 24/7

### ✅ Improves Navigation
- Quick access to features
- Reduces clicks to reach goals
- Better feature discovery

### ✅ Saves Time
- Instant responses
- No waiting for support staff
- Quick action buttons

## Usage Examples

### Patient Scenarios

**Scenario 1: Booking an Appointment**
```
User: "I want to book an appointment"
Bot: "I can help you book an appointment! Please visit the 
      Appointments section from your dashboard or tell me which 
      department you'd like to see (e.g., Cardiology, Neurology)."
```

**Scenario 2: Checking Token**
```
User: "What's my token status?"
Bot: "You can check your OPD token status in the Token Queue 
      section on your dashboard. Would you like me to create a 
      new token for you? If yes, please specify the department."
```

**Scenario 3: Emergency**
```
User: "Need emergency help"
Bot: "🚨 For emergencies, please:
      1. Call 108 immediately
      2. Or use the Ambulance Request feature on your dashboard
      3. Visit the Emergency department directly
      
      Is this a medical emergency?"
```

### Staff Scenarios

**Scenario 1: Managing Appointments**
```
Staff: "How do I manage appointments?"
Bot: "To manage appointments:
      • View today's appointments from the Admin Dashboard
      • Approve/reschedule patient requests
      • Check doctor availability
      • Update appointment status
      
      Which action would you like to perform?"
```

**Scenario 2: Checking Inventory**
```
Staff: "Show me medicine stock"
Bot: "Inventory management:
      • Check current medicine stock levels
      • View low-stock alerts
      • Update inventory records
      • Generate reorder reports
      
      Navigate to the Inventory section for detailed information."
```

**Scenario 3: Generating Reports**
```
Staff: "I need to see reports"
Bot: "Available reports:
      • Patient admission statistics
      • Department-wise appointments
      • Billing and revenue reports
      • Bed occupancy rates
      • Medicine usage analytics
      
      Which report would you like to generate?"
```

## Customization

### Adding New Quick Actions
Edit `PATIENT_QUICK_ACTIONS` or `STAFF_QUICK_ACTIONS` arrays:
```javascript
const PATIENT_QUICK_ACTIONS = [
  { label: "New Action", icon: "🔧", action: "new_action" },
  // ... existing actions
];
```

### Adding New Response Patterns
Update `generateAIResponse` function:
```javascript
if (input.includes('your_keyword')) {
  return "Your helpful response here...";
}
```

### Changing Appearance
Modify the Card component styling:
```javascript
<Card className="fixed bottom-6 right-6 w-96 h-[600px] ...">
```

## Best Practices

### For Patients
1. **Use Quick Actions** for common tasks
2. **Be Specific** in your questions
3. **Check Chat History** for previous answers
4. **Follow Links** to relevant sections

### For Staff
1. **Leverage Quick Actions** for daily tasks
2. **Use Keywords** like "patient", "report", "inventory"
3. **Reference Documentation** for complex tasks
4. **Train New Staff** using chatbot guidance

## Troubleshooting

### Chatbot Not Appearing
- Check if you're logged in
- Verify JavaScript is enabled
- Refresh the page

### Messages Not Sending
- Check internet connection
- Verify Supabase is accessible
- Check browser console for errors

### Slow Responses
- Database might be busy
- Network latency issues
- Check server status

## Future Enhancements

### Planned Features
1. **OpenAI Integration** - More natural conversations
2. **Voice Input** - Speak instead of typing
3. **Multi-language** - Support regional languages
4. **Smart Suggestions** - Predictive text based on context
5. **File Upload** - Share documents in chat
6. **Video Call** - Quick connect with staff
7. **Appointment Booking** - Direct booking from chat
8. **Prescription Requests** - Medicine requests via chat

### Under Consideration
- **Chatbot Analytics** - Track usage patterns
- **Feedback System** - Rate responses
- **Custom Avatars** - Personalized bot appearance
- **Rich Media** - Images, videos in responses
- **Notification Integration** - Chat alerts

## Technical Notes

### Performance
- Lightweight component (~350 lines)
- Minimal re-renders
- Efficient message loading
- Optimized scroll behavior

### Security
- Role-based access control
- User authentication required
- Database row-level security
- No sensitive data in chat logs

### Accessibility
- Keyboard navigation support
- Screen reader compatible
- Clear focus indicators
- Proper ARIA labels

## Support

### For Issues
1. Check browser console for errors
2. Verify database connectivity
3. Review server logs
4. Contact development team

### For Feature Requests
- Submit via GitHub issues
- Discuss in team meetings
- Prioritize based on user feedback

---

**Version**: 1.0  
**Last Updated**: 2024  
**Component**: HospitalAIChatbot.jsx  
**Status**: ✅ Fully Functional
