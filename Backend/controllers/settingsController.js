const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.error('Please add to Backend/.env:');
  console.error('  VITE_SUPABASE_URL=your-supabase-url');
  console.error('  VITE_SUPABASE_ANON_KEY=your-supabase-anon-key');
  throw new Error('Supabase credentials not configured. Check Backend/.env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ Supabase client initialized successfully');

/**
 * Get user settings
 */
exports.getUserSettings = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify user with token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Get user settings
    let { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // If no settings exist, create default settings
    if (error && error.code === 'PGRST116') {
      const { data: newSettings, error: createError } = await supabase
        .from('user_settings')
        .insert([{ user_id: user.id }])
        .select()
        .single();

      if (createError) {
        return res.status(500).json({ message: 'Error creating settings', error: createError.message });
      }
      
      return res.status(200).json({ settings: newSettings });
    }

    if (error) {
      return res.status(500).json({ message: 'Error fetching settings', error: error.message });
    }

    res.status(200).json({ settings });
  } catch (error) {
    console.error('Error in getUserSettings:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Update user settings
 */
exports.updateUserSettings = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify user with token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const settingsUpdate = req.body;

    // Remove read-only fields
    delete settingsUpdate.id;
    delete settingsUpdate.user_id;
    delete settingsUpdate.created_at;
    delete settingsUpdate.updated_at;

    // Update settings
    const { data: updatedSettings, error } = await supabase
      .from('user_settings')
      .update({ ...settingsUpdate, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error updating settings', error: error.message });
    }

    res.status(200).json({ 
      message: 'Settings updated successfully',
      settings: updatedSettings 
    });
  } catch (error) {
    console.error('Error in updateUserSettings:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Get user profile
 */
exports.getUserProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify user with token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Get user profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Update user profile
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify user with token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const profileUpdate = req.body;

    // Remove read-only fields
    delete profileUpdate.id;
    delete profileUpdate.created_at;
    delete profileUpdate.updated_at;
    delete profileUpdate.email; // Email updates should go through auth
    delete profileUpdate.role; // Role updates should be admin-only

    // Update profile
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({ ...profileUpdate, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error updating profile', error: error.message });
    }

    res.status(200).json({ 
      message: 'Profile updated successfully',
      profile: updatedProfile 
    });
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Export user data (GDPR compliance)
 */
exports.exportUserData = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify user with token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Get all user data
    const [profileResult, settingsResult, ticketsResult, commentsResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
      supabase.from('tickets').select('*').eq('created_by', user.id),
      supabase.from('ticket_comments').select('*').eq('user_id', user.id),
    ]);

    const exportData = {
      profile: profileResult.data,
      settings: settingsResult.data,
      tickets: ticketsResult.data || [],
      comments: commentsResult.data || [],
      exported_at: new Date().toISOString(),
    };

    res.status(200).json(exportData);
  } catch (error) {
    console.error('Error in exportUserData:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Deactivate user account
 */
exports.deactivateAccount = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify user with token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Deactivate account
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      return res.status(500).json({ message: 'Error deactivating account', error: error.message });
    }

    res.status(200).json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Error in deactivateAccount:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
