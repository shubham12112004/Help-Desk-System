const supabase = require("../utils/supabaseClient");
const Profile = require("../models/Profile");

async function requireSupabaseAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

    if (!token) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = data.user;
    const email = (user.email || "").toLowerCase().trim();
    const defaultRole = user.user_metadata?.role || "citizen";

    let profile = null;
    try {
      profile = await Profile.findOne({ userId: user.id });

      if (!profile) {
        profile = await Profile.create({
          userId: user.id,
          email: email || `${user.id}@unknown.local`,
          full_name: user.user_metadata?.full_name || "",
          role: defaultRole,
        });
      } else if (email && profile.email !== email) {
        profile.email = email;
        await profile.save();
      }
    } catch (profileError) {
      if (profileError?.code === 11000) {
        profile = await Profile.findOne({ userId: user.id });
      }

      if (!profile) {
        console.warn("Profile sync warning:", profileError.message);
      }
    }

    req.user = {
      id: user.id,
      email: user.email || "",
      metadata: user.user_metadata || {},
    };
    req.profile =
      profile ||
      {
        userId: user.id,
        email: user.email || "",
        role: defaultRole,
      };

    return next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(500).json({ message: "Authentication failed" });
  }
}

module.exports = requireSupabaseAuth;
