import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Droplet, Calendar, Phone, AlertCircle } from "lucide-react";

export function PatientProfileCard({ user, profile }) {
  const patientData = {
    name: profile?.full_name || user?.user_metadata?.full_name || user?.email,
    patientId: profile?.patient_id || `P${user?.id?.slice(0, 8)}`,
    role: user?.user_metadata?.role || 'citizen',
    blood_group: profile?.blood_group || 'Not Set',
    age: profile?.age || 'Not Set',
    contact: profile?.contact || user?.phone || 'Not Set',
    emergency_contact: profile?.emergency_contact || 'Not Set',
    gender: profile?.gender || 'Not Set',
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-purple-500/10">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white text-2xl font-bold">
          {patientData.name?.charAt(0).toUpperCase()}
        </div>

        {/* Patient Info */}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-xl font-bold">{patientData.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {patientData.patientId}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {patientData.role}
              </Badge>
            </div>
          </div>

          {/* Health Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            <div className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-xs text-muted-foreground">Blood Group</p>
                <p className="text-sm font-semibold">{patientData.blood_group}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="text-sm font-semibold">{patientData.age}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="text-sm font-semibold capitalize">{patientData.gender}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">Contact</p>
                <p className="text-sm font-semibold">{patientData.contact}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:col-span-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Emergency Contact</p>
                <p className="text-sm font-semibold">{patientData.emergency_contact}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
