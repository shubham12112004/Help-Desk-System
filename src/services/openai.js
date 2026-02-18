/**
 * OpenAI Integration Service
 * Provides AI features: ticket summary, priority detection, and reply suggestions
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Make a request to OpenAI API
 */
async function makeOpenAIRequest(messages, temperature = 0.7, maxTokens = 500) {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API request failed');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Generate auto summary for a ticket
 * @param {string} title - Ticket title
 * @param {string} description - Ticket description
 * @param {string} category - Ticket category
 * @returns {Promise<string>} Generated summary
 */
export async function generateTicketSummary(title, description, category) {
  const messages = [
    {
      role: 'system',
      content: `You are a helpful assistant for a hospital help desk system. Generate a concise, professional summary (2-3 sentences) of the patient/citizen ticket. Focus on the key issue and urgency.`,
    },
    {
      role: 'user',
      content: `Title: ${title}\nCategory: ${category}\nDescription: ${description}\n\nGenerate a brief summary:`,
    },
  ];

  return await makeOpenAIRequest(messages, 0.5, 150);
}

/**
 * Auto-detect ticket priority based on content
 * @param {string} title - Ticket title
 * @param {string} description - Ticket description
 * @param {string} category - Ticket category
 * @returns {Promise<string>} Priority level (low, medium, high, urgent, critical)
 */
export async function detectTicketPriority(title, description, category) {
  const messages = [
    {
      role: 'system',
      content: `You are a triage assistant for a hospital help desk. Analyze the ticket and determine the priority level.
      
Priority Levels:
- critical: Life-threatening emergencies, severe pain, urgent medical attention needed
- urgent: Serious but not immediately life-threatening, significant pain/discomfort
- high: Important medical issues that need prompt attention within 24 hours
- medium: Standard medical inquiries, prescription refills, non-urgent appointments
- low: General questions, routine administrative issues

Respond with ONLY ONE WORD: low, medium, high, urgent, or critical`,
    },
    {
      role: 'user',
      content: `Category: ${category}\nTitle: ${title}\nDescription: ${description}\n\nPriority:`,
    },
  ];

  const result = await makeOpenAIRequest(messages, 0.3, 10);
  const priority = result.trim().toLowerCase();
  
  // Validate and return
  const validPriorities = ['low', 'medium', 'high', 'urgent', 'critical'];
  return validPriorities.includes(priority) ? priority : 'medium';
}

/**
 * Generate reply suggestions for staff responding to tickets
 * @param {string} ticketTitle - Ticket title
 * @param {string} ticketDescription - Ticket description
 * @param {string} category - Ticket category
 * @param {Array} conversationHistory - Array of previous messages
 * @returns {Promise<Array<string>>} Array of 3 suggested replies
 */
export async function generateReplySuggestions(ticketTitle, ticketDescription, category, conversationHistory = []) {
  const historyText = conversationHistory.length > 0
    ? conversationHistory.map(msg => `${msg.isAgent ? 'Staff' : 'Patient'}: ${msg.content}`).join('\n')
    : 'No previous messages';

  const messages = [
    {
      role: 'system',
      content: `You are a helpful assistant for hospital staff. Generate 3 professional, empathetic reply suggestions for responding to a patient ticket. Each reply should be:
- Professional and compassionate
- Specific to the issue
- Actionable (e.g., requesting information, providing guidance, or explaining next steps)
- 1-2 sentences each

Format: Return exactly 3 suggestions separated by "|||" (no numbering).`,
    },
    {
      role: 'user',
      content: `Ticket Category: ${category}
Title: ${ticketTitle}
Description: ${ticketDescription}

Conversation History:
${historyText}

Generate 3 reply suggestions:`,
    },
  ];

  const result = await makeOpenAIRequest(messages, 0.8, 300);
  const suggestions = result.split('|||').map(s => s.trim()).filter(s => s.length > 0);
  
  // Return 3 suggestions, use fallbacks if needed
  while (suggestions.length < 3) {
    suggestions.push('Thank you for your message. We are reviewing your request and will respond shortly.');
  }
  
  return suggestions.slice(0, 3);
}

/**
 * Analyze ticket sentiment
 * @param {string} content - Ticket or message content
 * @returns {Promise<string>} Sentiment (positive, neutral, negative, urgent)
 */
export async function analyzeSentiment(content) {
  const messages = [
    {
      role: 'system',
      content: 'Analyze the sentiment of this hospital ticket message. Respond with ONE WORD: positive, neutral, negative, or urgent.',
    },
    {
      role: 'user',
      content,
    },
  ];

  const result = await makeOpenAIRequest(messages, 0.2, 10);
  const sentiment = result.trim().toLowerCase();
  
  const validSentiments = ['positive', 'neutral', 'negative', 'urgent'];
  return validSentiments.includes(sentiment) ? sentiment : 'neutral';
}

/**
 * Suggest appropriate department for routing
 * @param {string} title - Ticket title
 * @param {string} description - Ticket description
 * @param {string} category - Ticket category
 * @returns {Promise<string>} Suggested department
 */
export async function suggestDepartment(title, description, category) {
  const messages = [
    {
      role: 'system',
      content: `You are a hospital ticket routing assistant. Based on the ticket, suggest the most appropriate department.

Available departments:
- emergency: Life-threatening situations
- cardiology: Heart-related issues
- neurology: Brain and nervous system
- orthopedics: Bones, joints, muscles
- pediatrics: Children's health
- radiology: Imaging and scans
- pharmacy: Medications and prescriptions
- billing: Financial and insurance matters
- general: General inquiries and other issues

Respond with ONLY the department name.`,
    },
    {
      role: 'user',
      content: `Category: ${category}\nTitle: ${title}\nDescription: ${description}\n\nDepartment:`,
    },
  ];

  const result = await makeOpenAIRequest(messages, 0.3, 20);
  return result.trim().toLowerCase();
}

export default {
  generateTicketSummary,
  detectTicketPriority,
  generateReplySuggestions,
  analyzeSentiment,
  suggestDepartment,
};
