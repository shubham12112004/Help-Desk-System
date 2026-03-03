# 💳 RAZORPAY SETUP GUIDE - Complete Integration

## 🎯 What You're Seeing

You're on the Razorpay onboarding page. This guide will walk you through completing the setup so payments work in your Hospital Help Desk system.

---

## ✅ STEP 1: Complete Razorpay Account Setup

### 1.1 Fill Business Details
**On the page you're viewing:**
1. **Website:** Enter `http://localhost:5175` (for development)
2. **Android:** Leave empty (optional for now)
3. **iOS:** Leave empty (optional for now)
4. Click **Continue**

### 1.2 Complete KYC Details
1. Razorpay will ask for your business information
2. Fill in required fields (this is for business verification)
3. Submit KYC details

### 1.3 Wait for Approval
- Razorpay will verify your details (usually 24-48 hours)
- You'll get email confirmation
- Once approved, you can see API keys

---

## 🔑 STEP 2: Get Your API Keys

Once your account is activated:

### 2.1 Go to Razorpay Dashboard
```
1. Visit: https://dashboard.razorpay.com/
2. Login with your credentials
3. Look for "Settings" or "API Keys" in the left sidebar
```

### 2.2 Copy Your Keys
```
You'll see two keys:
- Key ID (starts with "rzp_live_" for production)
- Key Secret (keep this SECRET!)

⚠️ NEVER share or commit Key Secret to GitHub
```

---

## ⚙️ STEP 3: Configure in Your Application

### 3.1 Find or Create .env File

In your project root (`c:\Users\raosh\Downloads\Help+Desk\`):

**If `.env` file exists:**
1. Open it in VS Code
2. Find the Razorpay section

**If `.env` file doesn't exist:**
1. Copy `.env.example` and rename to `.env`
2. Add your values in the Razorpay section

### 3.2 Add Your Keys

Open `.env` and update:

```env
# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
VITE_RAZORPAY_KEY_SECRET=your_key_secret_here
```

**Example (DO NOT USE - just for reference):**
```env
VITE_RAZORPAY_KEY_ID=rzp_live_1DP5ibkldkasdm
VITE_RAZORPAY_KEY_SECRET=asdkfj2309843jSFDj2094
```

### 3.3 Save the File

```
Ctrl+S (save)
```

---

## 🧪 STEP 4: Test the Integration

### 4.1 Restart Your Application

1. Stop the dev server (press Ctrl+C in terminal)
2. Start it again:
```bash
npm run dev
```

### 4.2 Test Payment Flow

1. Open: http://localhost:5175/billing
2. Click **"Pay Now"** on any bill
3. Payment modal opens
4. You should see **"🔒 Secure Payment by Razorpay"** label

**If you see this label:** ✅ Razorpay is connected!

### 4.3 Make a Test Payment

1. In the payment modal, there will be **both options:**
   - Demo Mode (with PIN)
   - Razorpay Payment (secure)

2. Click "Pay Now (Razorpay)" button

3. Razorpay checkout modal will open

4. **Use Razorpay Test Credentials:**
   ```
   Card Number: 4111 1111 1111 1111
   Expiry: 12/25 (any future date)
   CVV: 123
   OTP: 123456
   ```

5. Complete payment
6. Bill status should change to **"PAID ✓"**

---

## 📋 Quick Checklist

| Step | Task | Status |
|------|------|-----------|
| 1 | Complete Razorpay account setup | ⬜ |
| 2 | Fill website/app links | ⬜ |
| 3 | Complete KYC verification | ⬜ |
| 4 | Get API keys from dashboard | ⬜ |
| 5 | Copy Key ID to .env | ⬜ |
| 6 | Copy Key Secret to .env | ⬜ |
| 7 | Save .env file | ⬜ |
| 8 | Restart dev server (npm run dev) | ⬜ |
| 9 | Test payment in /billing page | ⬜ |
| 10 | Verify "Secure Payment by Razorpay" label shows | ⬜ |

---

## 🚀 How It Works in Your System

### Payment Flow:
```
Patient clicks "Pay Now"
         ↓
Payment Modal Opens
         ↓
   ┌─────────────┬──────────────┐
   │  Demo Mode  │  Razorpay    │
   ├─────────────┼──────────────┤
   │ Enter PIN   │ Razorpay SDK │
   │ (testing)   │ Opens modal  │
   │             │              │
   │ Success!    │ Card/UPI    │
   │ Status→PAID │ Payment     │
   │             │             │
   │             │ Success!    │
   │             │ Status→PAID │
   └─────────────┴──────────────┘
         ↓
Bill marked as PAID in database
         ↓
Invoice email sent to patient
         ↓
Admin sees payment in dashboard (real-time)
```

---

## 🔐 Security Notes

### What's Secure:
✅ Razorpay SDK is PCI-DSS compliant  
✅ Card details never touch your server  
✅ HTTPS encryption for all data  
✅ Payment ID stored (not card details)

### What You Must Do:
🔒 **NEVER commit .env to GitHub**  
🔒 **NEVER share Key Secret with anyone**  
🔒 **Use different keys for test/production**

### .gitignore Check
Make sure `.env` is in `.gitignore` file:
```bash
# Open .gitignore
*.env
.env
```

---

## 🎮 Test Payment Details

### Razorpay Test Mode Cards

**Success Card:**
```
Number: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
```

**Failed Card:**
```
Number: 4000 0000 0000 0002  
Expiry: 12/25
CVV: 123
```

**OTP for all test cards:** `123456`

### Expected Results

| Test Card | Result | Status |
|-----------|--------|--------|
| 4111 1111 1111 1111 | Success | Bill marked PAID ✓ |
| 4000 0000 0000 0002 | Fails | Shows error message |

---

## 🎧 Multiple Payment Methods Available

Once enabled, patients can pay using:

1. **🏦 UPI & QR Code** - UPI apps (PhonePe, Google Pay, etc.)
2. **💳 Credit/Debit Cards** - All major banks
3. **🏛️ Net Banking** - Direct bank transfer
4. **📱 Wallets** - Paytm, Amazon Pay, etc.
5. **💰 Cash on Delivery** - If configured

---

## ✨ Features Included

| Feature | Status | Notes |
|---------|--------|-------|
| UPI Payments | ✅ Enabled | Most popular in India |
| Card Payments | ✅ Enabled | Debit/Credit cards |
| Net Banking | ✅ Enabled | All major banks |
| International Cards | ✅ Available | If enabled by Razorpay |
| Recurring Payments | ⚙️ Available | Not yet configured |
| Webhooks | ⚙️ Available | For order updates |
| Settlement | ✅ Automatic | Funds transferred to account |

---

## 📊 What Gets Stored

After each payment, your system stores:

```javascript
{
  bill_id: "uuid-xxx",
  patient_id: "uuid-xxx",
  amount: 5000,
  status: "paid",
  payment_method: "razorpay",
  razorpay_payment_id: "pay_xxx",  // Razorpay's transaction ID
  razorpay_order_id: "order_xxx",  // Order reference
  razorpay_signature: "signature", // Payment verification
  created_at: "2026-02-25T10:30:00Z",
  updated_at: "2026-02-25T10:35:00Z"
}
```

---

## 🐛 Troubleshooting

### Error: "Razorpay Key ID not configured"
**Solution:** Add `VITE_RAZORPAY_KEY_ID` to `.env` file and restart dev server

### Error: "Razorpay SDK not loaded"
**Solution:** Check internet connection, refresh page (F5), make sure Razorpay CDN is accessible

### Button doesn't appear / Says "Razorpay not configured"
**Solution:**
1. Check .env file has the correct keys
2. Restart dev server (npm run dev)
3. Hard refresh browser (Ctrl+Shift+R)

### Payment modal opens but gives error
**Solution:**
1. Check you're using correct test card numbers
2. Verify Key ID starts with "rzp_live_" (not "rzp_test_")
3. Make sure amount is in INR
4. Try with different test card

### Payment succeeds but bill status doesn't change
**Solution:**
1. Check browser console (F12) for errors
2. Verify Supabase database connection
3. Hard refresh page to see updated status
4. Check that RLS policies allow database updates

---

## 📈 Next Steps

### After Setup Works:

1. **Explore Razorpay Dashboard:**
   - Monitor payments
   - View transaction history
   - Check settlement status
   - Download reports

2. **Configure Webhooks (Advanced):**
   - Get real-time payment updates
   - Auto-generate invoices
   - Send confirmation emails

3. **Customize Payment Experience:**
   - Add custom branding
   - Configure payment methods
   - Set up recurring payments

4. **Go Live:**
   - Switch from test keys to live keys
   - Enable production mode
   - Deploy to production server

---

## 🔗 Useful Links

| Resource | URL |
|----------|-----|
| Razorpay Dashboard | https://dashboard.razorpay.com/ |
| API Documentation | https://razorpay.com/docs/api/payments/ |
| Test Card Details | https://razorpay.com/docs/payments/payments/test-cards/ |
| Integration Guide | https://razorpay.com/docs/integration/ |
| Support | https://support.razorpay.com/ |

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] .env file has `VITE_RAZORPAY_KEY_ID`
- [ ] .env file has `VITE_RAZORPAY_KEY_SECRET`
- [ ] Dev server restarted (`npm run dev`)
- [ ] Browser hard refreshed (Ctrl+Shift+R)
- [ ] Go to http://localhost:5175/billing
- [ ] Click "Pay Now" on a bill
- [ ] See "🔒 Secure Payment by Razorpay" label
- [ ] Pay with test card (4111 1111 1111 1111)
- [ ] Bill status changed to "PAID ✓"
- [ ] Success message with receipt ID shown

**If all checkmarks complete → Razorpay is ready! ✅**

---

## 📞 Need Help?

1. **Check error in browser console** (F12 → Console tab)
2. **Verify .env file has correct keys**
3. **Hard refresh** (Ctrl+Shift+R)
4. **Restart dev server** (npm run dev)
5. **Check Razorpay dashboard** if account is active

---

**Status:** Ready to configure
**Time to setup:** ~10 minutes
**Time for approval:** 24-48 hours (for live payments)
