import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "@/pages/Index";
import { Calendar, MapPin, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    loadAppointments();
  }, [user.id]);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments?driverId=${user.id}`);
      const data = await res.json();
      setAppointments(data);
    } catch (e) {
      setError('Fehler beim Laden der Termine');
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentResponse = async (appointmentId: string, status: "accepted" | "declined") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Fehler beim Aktualisieren des Termins');
        setLoading(false);
        return;
      }
      loadAppointments();
      toast({
        title: status === "accepted" ? "Termin angenommen" : "Termin abgelehnt",
        description: status === "accepted"
          ? "Sie finden ihn jetzt unter 'Meine Fahrten'."
          : "Der Termin wurde abgelehnt.",
        status: status === "accepted" ? "success" : "warning",
      });
    } catch (e) {
      setError('Fehler beim Aktualisieren des Termins');
    } finally {
      setLoading(false);
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
                {appointment.startLocation && (
                  <div>
                    <span className="font-medium">Start:</span>
                    <p>{appointment.startLocation}</p>
                  </div>
                )}

                {appointment.stations && appointment.stations.length > 0 && (
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
                {appointment.startLocation && (
                  <div>
                    <span className="font-medium">Start:</span>
                    <p>{appointment.startLocation}</p>
                  </div>
                )}

                {appointment.stations && appointment.stations.length > 0 && (
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
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
