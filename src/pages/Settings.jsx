import { AppLayout } from "@/components/AppLayout";
import { Settings as SettingsIcon } from "lucide-react";
const Settings = () => {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your help desk preferences
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-12 shadow-card text-center animate-fade-in">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-accent-foreground mx-auto mb-4">
            <SettingsIcon className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold text-card-foreground">
            Settings coming soon
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            We're working on adding customizable settings for your help desk.
            Stay tuned
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
