import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/pages/Index";
import { Calendar, MapPin, Plus, X } from "lucide-react";

interface AdminAppointmentsProps {
  user: User;
}

interface Driver {
  id: string;
  name: string;
  employeeNumber: string;
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

export const AdminAppointments = ({ user }: AdminAppointmentsProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [stationsInput, setStationsInput] = useState("");
  const [newAppointment, setNewAppointment] = useState({
    driverId: "",
    date: "",
    time: "",
    startLocation: "",
    endLocation: "",
    purpose: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
    loadDrivers();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      setAppointments(data);
    } catch (e) {
      setError('Fehler beim Laden der Termine');
    } finally {
      setLoading(false);
    }
  };

  const loadDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/drivers');
      const data = await res.json();
      setDrivers(data);
    } catch (e) {
      setError('Fehler beim Laden der Fahrer');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppointment.driverId || !newAppointment.date || !newAppointment.time) {
      alert("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }
    const selectedDriver = drivers.find(d => d.id === newAppointment.driverId);
    if (!selectedDriver) return;
    const stations = stationsInput
      .split(',')
      .map(station => station.trim())
      .filter(station => station.length > 0);
    const appointment = {
      driverId: newAppointment.driverId,
      driverName: selectedDriver.name,
      date: newAppointment.date,
      time: newAppointment.time,
      startLocation: newAppointment.startLocation,
      stations: stations,
      endLocation: newAppointment.endLocation,
      purpose: newAppointment.purpose,
      status: "pending"
    };
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Fehler beim Anlegen des Termins');
        setLoading(false);
        return;
      }
      setShowForm(false);
      setNewAppointment({ driverId: "", date: "", time: "", startLocation: "", endLocation: "", purpose: "" });
      setStationsInput("");
      loadAppointments();
    } catch (e) {
      setError('Fehler beim Anlegen des Termins');
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Fehler beim Löschen des Termins');
        setLoading(false);
        return;
      }
      loadAppointments();
    } catch (e) {
      setError('Fehler beim Löschen des Termins');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Terminverwaltung</h1>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Neuer Termin
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Neuen Termin erstellen</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="driver">Fahrer *</Label>
                  <Select 
                    value={newAppointment.driverId} 
                    onValueChange={(value) => setNewAppointment({...newAppointment, driverId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Fahrer auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name} (Nr. {driver.employeeNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="date">Datum *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="time">Uhrzeit *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="startLocation">Startort</Label>
                <Input
                  id="startLocation"
                  value={newAppointment.startLocation}
                  onChange={(e) => setNewAppointment({...newAppointment, startLocation: e.target.value})}
                  placeholder="z.B. Büro München"
                />
              </div>

              <div>
                <Label htmlFor="stations">Stationen (durch Komma getrennt) *</Label>
                <Input
                  id="stations"
                  value={stationsInput}
                  onChange={(e) => setStationsInput(e.target.value)}
                  placeholder="z.B. Hotel Berlin, Restaurant Hamburg, Messe Frankfurt"
                  required
                />
                {stationsInput && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {stationsInput.split(',').map((station, index) => {
                      const trimmed = station.trim();
                      if (!trimmed) return null;
                      return (
                        <Badge key={index} variant="outline">
                          {trimmed}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit">Termin erstellen</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Abbrechen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Alle Termine</h2>
        {appointments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Noch keine Termine erstellt</p>
            </CardContent>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {appointment.driverName} - {new Date(appointment.date).toLocaleDateString('de-DE')} um {appointment.time}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusText(appointment.status)}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAppointment(appointment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
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
