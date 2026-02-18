import { AlertTriangle, ExternalLink } from "lucide-react";

export function EmailTimeoutHelp() {
  return (
    <div className="mt-4 rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-sm">
          <p className="font-semibold text-yellow-900 mb-2">
            ⚠️ Email Service Issue (Supabase Free Tier)
          </p>
          <p className="text-yellow-800 mb-3">
            <strong>Problem:</strong> Supabase free tier has STRICT email limits (only 3-4 emails/hour) and very slow email sending (40-90 seconds).
          </p>
          <p className="text-yellow-800 mb-3 font-semibold">
            ✅ SOLUTION: Disable email confirmation for instant signup
          </p>
          <ol className="text-yellow-800 space-y-2 ml-4 list-decimal">
            <li>
              <strong>Quick Fix (Recommended):</strong>
              <ul className="ml-4 mt-1 text-xs space-y-1">
                <li>
                  • Go to{" "}
                  <a
                    href="https://supabase.com/dashboard/project/yoifuexgukjsfbqsmwrn/auth/providers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold inline-flex items-center gap-1"
                  >
                    Supabase Auth Settings
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>• Find "Email" provider and click to configure</li>
                <li>• Toggle OFF "Confirm email"</li>
                <li>• Click Save</li>
                <li>• Signup will now be INSTANT (1-2 seconds)! ⚡</li>
              </ul>
            </li>
            <li>
              <strong>Why this happens:</strong> Free tier email quota is only 3-4 per hour. You've exceeded it.
            </li>
            <li>
              <strong>Verify project status:</strong>{" "}
              <a
                href="https://supabase.com/dashboard/projects"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold inline-flex items-center gap-1"
              >
                Check Dashboard
                <ExternalLink className="h-3 w-3" />
              </a>
              {" "}(ensure project isn't paused)
            </li>
          </ol>
          <div className="mt-3 p-2 bg-yellow-100 rounded border border-yellow-300">
            <p className="text-xs text-yellow-900 font-semibold">
              💡 After disabling email confirmation, users can sign up and log in immediately without waiting for email verification!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
