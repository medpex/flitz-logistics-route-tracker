
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "@/pages/Index";
import { Calendar, MapPin, Check, X } from "lucide-react";

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
  stations: string[];
  endLocation: string;
  purpose: string;
  status: "pending" | "accepted" | "declined";
}

export const DriverAppointments = ({ user }: DriverAppointmentsProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    loadAppointments();
  }, [user.id]);

  const loadAppointments = () => {
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const userAppointments = allAppointments.filter(
      (apt: Appointment) => apt.driverId === user.id
    );
    setAppointments(userAppointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleAppointmentResponse = (appointmentId: string, status: "accepted" | "declined") => {
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedAppointments = allAppointments.map((apt: Appointment) => 
      apt.id === appointmentId ? { ...apt, status } : apt
    );
    
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    loadAppointments();
    
    if (status === "accepted") {
      alert("Termin angenommen! Sie finden ihn jetzt unter 'Meine Fahrten'.");
    } else {
      alert("Termin abgelehnt.");
    }
  };

  const pendingAppointments = appointments.filter(apt => apt.status === "pending");
  const respondedAppointments = appointments.filter(apt => apt.status !== "pending");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-green-100 text-green-800";
      case "declined": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "accepted": return "Angenommen";
      case "declined": return "Abgelehnt";
      default: return "Ausstehend";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Meine Termine</h1>
      
      {/* Ausstehende Termine */}
      {pendingAppointments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Neue Termine</h2>
          {pendingAppointments.map((appointment) => (
            <Card key={appointment.id} className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {new Date(appointment.date).toLocaleDateString('de-DE')} um {appointment.time}
                  </CardTitle>
                  <Badge className={getStatusColor(appointment.status)}>
                    {getStatusText(appointment.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Start:</span>
                    <p>{appointment.startLocation}</p>
                  </div>
                  <div>
                    <span className="font-medium">Ziel:</span>
                    <p>{appointment.endLocation}</p>
                  </div>
                </div>

                {appointment.stations.length > 0 && (
                  <div>
                    <span className="font-medium">Stationen:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {appointment.stations.map((station, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {station}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {appointment.purpose && (
                  <div>
                    <span className="font-medium">Zweck:</span>
                    <p className="text-sm text-gray-600 mt-1">{appointment.purpose}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={() => handleAppointmentResponse(appointment.id, "accepted")}
                    className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Annehmen
                  </Button>
                  <Button 
                    onClick={() => handleAppointmentResponse(appointment.id, "declined")}
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 gap-2"
                  >
                    <X className="h-4 w-4" />
                    Ablehnen
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bearbeitete Termine */}
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
                  <Badge className={getStatusColor(appointment.status)}>
                    {getStatusText(appointment.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Start:</span>
                    <p>{appointment.startLocation}</p>
                  </div>
                  <div>
                    <span className="font-medium">Ziel:</span>
                    <p>{appointment.endLocation}</p>
                  </div>
                </div>

                {appointment.stations.length > 0 && (
                  <div>
                    <span className="font-medium">Stationen:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {appointment.stations.map((station, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {station}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {appointment.purpose && (
                  <div>
                    <span className="font-medium">Zweck:</span>
                    <p className="text-sm text-gray-600 mt-1">{appointment.purpose}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
