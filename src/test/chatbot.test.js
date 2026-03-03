import { describe, it, expect } from 'vitest';
import { getChatbotResponse } from '@/services/chatbot';

describe('Chatbot Service', () => {
  it('should return a string for ticket creation query', async () => {
    const response = await getChatbotResponse('How do I create a support ticket?');
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(100);
    expect(response.toUpperCase()).toContain('TICKET');
    expect(response).toContain('Step');
  });

  it('should return a string for login query', async () => {
    const response = await getChatbotResponse('How do I login?');
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(100);
    expect(response.toUpperCase()).toContain('LOGIN');
  });

  it('should return a string for appointment query', async () => {
    const response = await getChatbotResponse('Can I book an appointment?');
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(100);
    expect(response.toUpperCase()).toContain('APPOINTMENT');
  });

  it('should return a string for token query', async () => {
    const response = await getChatbotResponse('What is OPD token?');
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(100);
  });

  it('should handle out of scope questions gracefully', async () => {
    const response = await getChatbotResponse('What is the weather today?');
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });
});
