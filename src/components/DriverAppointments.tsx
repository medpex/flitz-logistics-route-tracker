
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "@/pages/Index";
import { Calendar, Clock, MapPin, Check, X } from "lucide-react";

interface DriverAppointmentsProps {
  user: User;
}

interface Appointment {
  id: string;
  driverId: string;
  driverName: string;
  date: string;
  time: string;
  startLocation: string;
  endLocation: string;
  purpose: string;
  status: "pending" | "accepted" | "declined";
  assignedBy: string;
  assignedAt: string;
}

export const DriverAppointments = ({ user }: DriverAppointmentsProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    // Lade Termine aus localStorage
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const driverAppointments = allAppointments.filter((apt: Appointment) => apt.driverId === user.id);
    setAppointments(driverAppointments);
  }, [user.id]);

  const handleAppointmentResponse = (appointmentId: string, status: "accepted" | "declined") => {
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedAppointments = allAppointments.map((apt: Appointment) => 
      apt.id === appointmentId ? { ...apt, status } : apt
    );
    
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    setAppointments(updatedAppointments.filter((apt: Appointment) => apt.driverId === user.id));
  };

  const pendingAppointments = appointments.filter(apt => apt.status === "pending");
  const respondedAppointments = appointments.filter(apt => apt.status !== "pending");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Meine Termine</h1>
      
      {/* Pending Appointments */}
      {pendingAppointments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Offene Anfragen</h2>
          {pendingAppointments.map((appointment) => (
            <Card key={appointment.id} className="border-orange-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {new Date(appointment.date).toLocaleDateString('de-DE')} um {appointment.time}
                  </CardTitle>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700">
                    Antwort erforderlich
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{appointment.startLocation} → {appointment.endLocation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{appointment.time}</span>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Zweck:</span>
                  <p className="text-sm text-gray-600 mt-1">{appointment.purpose}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleAppointmentResponse(appointment.id, "accepted")}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Annehmen
                  </Button>
                  <Button 
                    onClick={() => handleAppointmentResponse(appointment.id, "declined")}
                    variant="outline"
                    className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Ablehnen
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Responded Appointments */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Bearbeitete Termine</h2>
        {respondedAppointments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Keine bearbeiteten Termine</p>
            </CardContent>
          </Card>
        ) : (
          respondedAppointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {new Date(appointment.date).toLocaleDateString('de-DE')} um {appointment.time}
                  </CardTitle>
                  <Badge variant={appointment.status === "accepted" ? "default" : "destructive"}>
                    {appointment.status === "accepted" ? "Angenommen" : "Abgelehnt"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{appointment.startLocation} → {appointment.endLocation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{appointment.time}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="font-medium">Zweck:</span>
                  <p className="text-sm text-gray-600 mt-1">{appointment.purpose}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
