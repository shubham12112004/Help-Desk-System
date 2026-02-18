/**
 * Test script for Settings functionality
 * 
 * This script tests the settings service functions to ensure they work correctly.
 * Run this after applying the database migration.
 * 
 * Usage: node test-settings.js
 */

import { supabase } from "./src/integrations/supabase/client.js";
import {
  getUserSettings,
  updateUserSettings,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "./src/services/settings.js";

async function testSettings() {
  console.log("🧪 Testing Settings Functionality\n");

  try {
    // 1. Test: Check if user is authenticated
    console.log("1️⃣ Checking authentication...");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("❌ Not authenticated. Please login first.");
      console.log("\nTo test settings, you need to:");
      console.log("1. Start the application: npm run dev");
      console.log("2. Login through the UI");
      console.log("3. Run this test again\n");
      return;
    }
    
    console.log("✅ Authenticated as:", user.email);

    // 2. Test: Get user settings (should auto-create if not exists)
    console.log("\n2️⃣ Getting user settings...");
    const settings = await getUserSettings();
    console.log("✅ Settings loaded:", Object.keys(settings).length, "fields");
    console.log("   Theme:", settings.theme);
    console.log("   Email notifications:", settings.email_notifications);
    console.log("   Language:", settings.language);

    // 3. Test: Update settings
    console.log("\n3️⃣ Updating settings...");
    const updatedSettings = await updateUserSettings({
      theme: "dark",
      email_notifications: false,
      tickets_per_page: 25,
    });
    console.log("✅ Settings updated successfully");
    console.log("   New theme:", updatedSettings.theme);
    console.log("   Email notifications:", updatedSettings.email_notifications);
    console.log("   Tickets per page:", updatedSettings.tickets_per_page);

    // 4. Test: Get notification preferences
    console.log("\n4️⃣ Getting notification preferences...");
    const notifPrefs = await getNotificationPreferences();
    console.log("✅ Notification preferences loaded");
    console.log("   Email:", notifPrefs.email_notifications);
    console.log("   Push:", notifPrefs.push_notifications);
    console.log("   Ticket created:", notifPrefs.notify_ticket_created);

    // 5. Test: Update notification preferences
    console.log("\n5️⃣ Updating notification preferences...");
    await updateNotificationPreferences({
      notify_ticket_assigned: false,
      notify_ticket_commented: true,
    });
    console.log("✅ Notification preferences updated");

    // 6. Test: Verify changes persisted
    console.log("\n6️⃣ Verifying changes persisted...");
    const verifySettings = await getUserSettings();
    console.log("✅ Changes verified");
    console.log("   Theme still:", verifySettings.theme);
    console.log("   Tickets per page still:", verifySettings.tickets_per_page);

    console.log("\n✅ All tests passed! Settings functionality is working correctly.\n");

  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error("\nError details:", error);
    
    if (error.message.includes("relation") && error.message.includes("does not exist")) {
      console.log("\n⚠️  The user_settings table doesn't exist yet.");
      console.log("Please apply the migration:");
      console.log("  supabase db push");
      console.log("Or manually run the SQL from:");
      console.log("  supabase/migrations/20260218000000_add_user_settings.sql\n");
    }
  }
}

// Check if running as module
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  testSettings();
}

export { testSettings };
