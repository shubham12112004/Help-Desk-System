-- Create payment_transactions table to track all payment attempts and history
-- This table stores both successful and failed payment transactions

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bill_id UUID NOT NULL REFERENCES billing(id) ON DELETE CASCADE,
  
  -- Payment details
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL, -- 'razorpay', 'cash', 'card', etc.
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed'
  
  -- Razorpay specific fields
  razorpay_payment_id VARCHAR(100),
  razorpay_order_id VARCHAR(100),
  razorpay_signature VARCHAR(200),
  
  -- Error tracking (for failed payments)
  error_code VARCHAR(100),
  error_description TEXT,
  
  -- Timestamps
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes for faster queries
  CONSTRAINT payment_transactions_amount_check CHECK (amount > 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_bill_id ON payment_transactions(bill_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_razorpay_payment_id ON payment_transactions(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_date ON payment_transactions(transaction_date DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_payment_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_transactions_updated_at();

-- Enable Row Level Security
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own payment transactions
CREATE POLICY "Users can view own payment transactions"
  ON payment_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own payment transactions (system inserts)
CREATE POLICY "Users can create own payment transactions"
  ON payment_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Staff and admin can view all payment transactions
CREATE POLICY "Staff can view all payment transactions"
  ON payment_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff', 'doctor')
    )
  );

-- Admin can update payment transactions (for corrections/refunds)
CREATE POLICY "Admin can update payment transactions"
  ON payment_transactions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add comment to table
COMMENT ON TABLE payment_transactions IS 'Stores all payment transaction attempts including successful and failed payments for billing';
COMMENT ON COLUMN payment_transactions.status IS 'pending: Payment initiated, success: Payment completed, failed: Payment failed';
COMMENT ON COLUMN payment_transactions.payment_method IS 'Payment gateway or method used: razorpay, cash, card, upi, netbanking, etc.';
