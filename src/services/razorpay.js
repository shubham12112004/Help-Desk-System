/**
 * Razorpay Payment Integration Service
 * Handles payment gateway integration with UPI, Cards, and other methods
 */

import { supabase } from '@/integrations/supabase/client';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

/**
 * Initialize Razorpay payment
 * @param {Object} options - Payment configuration
 * @returns {Promise<Object>} Payment result
 */
export async function initiateRazorpayPayment({
  amount,
  currency = 'INR',
  billId,
  billNumber,
  userName,
  userEmail,
  userPhone,
  description,
  onSuccess,
  onFailure,
}) {
  return new Promise((resolve, reject) => {
    if (!RAZORPAY_KEY_ID) {
      reject(new Error('Razorpay Key ID not configured. Please add VITE_RAZORPAY_KEY_ID to .env'));
      return;
    }

    if (!window.Razorpay) {
      reject(new Error('Razorpay SDK not loaded. Please check your internet connection.'));
      return;
    }

    // Convert amount to paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: currency,
      name: 'MedDesk Hospital',
      description: description || `Payment for Bill #${billNumber}`,
      image: '/help desk.png', // Hospital logo
      
      // Order details
      order_id: '', // Generate order_id from backend if needed
      
      // Prefill customer details
      prefill: {
        name: userName || '',
        email: userEmail || '',
        contact: userPhone || '',
      },
      
      // Notes for reference
      notes: {
        bill_id: billId,
        bill_number: billNumber,
        payment_type: 'hospital_bill',
      },
      
      // Theme customization
      theme: {
        color: '#3b82f6', // Primary blue color
        backdrop_color: 'rgba(0, 0, 0, 0.5)',
      },
      
      // Payment methods configuration
      config: {
        display: {
          blocks: {
            // Enable UPI as first option
            upi: {
              name: 'UPI & QR',
              instruments: [
                {
                  method: 'upi',
                  flows: ['qr', 'intent', 'collect'],
                },
              ],
            },
            // Cards
            card: {
              name: 'Credit/Debit Card',
              instruments: [
                {
                  method: 'card',
                },
              ],
            },
            // Netbanking
            netbanking: {
              name: 'Net Banking',
              instruments: [
                {
                  method: 'netbanking',
                },
              ],
            },
            // Wallets
            wallet: {
              name: 'Wallets',
              instruments: [
                {
                  method: 'wallet',
                },
              ],
            },
          },
          sequence: ['block.upi', 'block.card', 'block.netbanking', 'block.wallet'],
          preferences: {
            show_default_blocks: true,
          },
        },
      },
      
      // Callback handlers
      handler: async function (response) {
        try {
          // Payment successful
          const paymentData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            bill_id: billId,
            amount: amount,
            status: 'success',
            payment_method: 'razorpay',
          };

          // Save payment record to database
          await savePaymentRecord(paymentData);

          if (onSuccess) {
            await onSuccess(paymentData);
          }

          resolve({
            success: true,
            data: paymentData,
          });
        } catch (error) {
          console.error('Error processing successful payment:', error);
          reject(error);
        }
      },
      
      modal: {
        ondismiss: function () {
          // Payment modal closed
          if (onFailure) {
            onFailure({ error: 'Payment cancelled by user' });
          }
          resolve({
            success: false,
            error: 'Payment cancelled',
          });
        },
        
        // Enable escape key to close
        escape: true,
        
        // Handle back button
        backdropclose: true,
        
        confirm_close: true, // Show confirmation before closing
      },
      
      retry: {
        enabled: true,
        max_count: 3,
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      
      // Handle payment failure
      rzp.on('payment.failed', async function (response) {
        const errorData = {
          code: response.error.code,
          description: response.error.description,
          source: response.error.source,
          step: response.error.step,
          reason: response.error.reason,
          metadata: response.error.metadata,
          bill_id: billId,
          amount: amount,
        };

        // Log failed payment attempt
        await logFailedPayment(errorData);

        if (onFailure) {
          onFailure(errorData);
        }

        reject(errorData);
      });

      // Open payment modal
      rzp.open();
    } catch (error) {
      console.error('Error initializing Razorpay:', error);
      reject(error);
    }
  });
}

/**
 * Save successful payment record to database
 * @param {Object} paymentData - Payment details
 */
async function savePaymentRecord(paymentData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Update bill payment
    const { error: billError } = await supabase
      .from('billing')
      .update({
        status: 'paid',
        payment_method: 'razorpay',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentData.bill_id);

    if (billError) throw billError;

    // Create payment transaction record (if you have a payments table)
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        bill_id: paymentData.bill_id,
        amount: paymentData.amount,
        payment_method: 'razorpay',
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_order_id: paymentData.razorpay_order_id,
        status: 'success',
        transaction_date: new Date().toISOString(),
      });

    // Ignore error if table doesn't exist
    if (transactionError && !transactionError.message.includes('does not exist')) {
      console.warn('Could not save payment transaction:', transactionError);
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving payment record:', error);
    throw error;
  }
}

/**
 * Log failed payment attempt
 * @param {Object} errorData - Error details
 */
async function logFailedPayment(errorData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Log to payment_transactions or a separate failed_payments table
    await supabase.from('payment_transactions').insert({
      user_id: user.id,
      bill_id: errorData.bill_id,
      amount: errorData.amount,
      payment_method: 'razorpay',
      status: 'failed',
      error_code: errorData.code,
      error_description: errorData.description,
      transaction_date: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging failed payment:', error);
  }
}

/**
 * Verify Razorpay payment signature (for backend verification)
 * @param {Object} data - Payment verification data
 */
export function verifyPaymentSignature(data) {
  // This should ideally be done on the backend for security
  // Frontend verification is not secure
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
  
  // In production, send this to your backend for verification
  // Backend should use Razorpay secret to verify signature
  
  return {
    verified: true, // Placeholder
    message: 'Payment signature verification should be done on backend',
  };
}

/**
 * Check if Razorpay is configured
 */
export function isRazorpayConfigured() {
  return Boolean(RAZORPAY_KEY_ID && window.Razorpay);
}

/**
 * Get supported payment methods
 */
export function getSupportedPaymentMethods() {
  return [
    {
      id: 'upi',
      name: 'UPI',
      description: 'Google Pay, PhonePe, Paytm, BHIM',
      icon: '📱',
      enabled: true,
      recommended: true,
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, RuPay, Amex',
      icon: '💳',
      enabled: true,
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'All major Indian banks',
      icon: '🏦',
      enabled: true,
    },
    {
      id: 'wallet',
      name: 'Wallets',
      description: 'Paytm, PhonePe, Amazon Pay',
      icon: '👛',
      enabled: true,
    },
  ];
}

export default {
  initiateRazorpayPayment,
  verifyPaymentSignature,
  isRazorpayConfigured,
  getSupportedPaymentMethods,
};
