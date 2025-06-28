
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User } from "@/pages/Index";
import { Calendar, Plus, Clock, MapPin } from "lucide-react";

interface AdminAppointmentsProps {
  user: User;
}

interface Driver {
  id: string;
  name: string;
  employeeNumber: string;
  status: string;
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

export const AdminAppointments = ({ user }: AdminAppointmentsProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    driverId: '',
    date: '',
    time: '',
    startLocation: '',
    endLocation: '',
    purpose: ''
  });

  useEffect(() => {
    // Lade Termine und Fahrer aus localStorage
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const allDrivers = JSON.parse(localStorage.getItem('drivers') || '[]');
    setAppointments(allAppointments);
    setDrivers(allDrivers.filter((d: Driver) => d.status === 'active'));
  }, []);

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAppointment.driverId || !newAppointment.date || !newAppointment.time || 
        !newAppointment.startLocation || !newAppointment.endLocation || !newAppointment.purpose) {
      alert('Bitte füllen Sie alle Felder aus');
      return;
    }

    const selectedDriver = drivers.find(d => d.id === newAppointment.driverId);
    if (!selectedDriver) return;

    const appointment: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      driverId: newAppointment.driverId,
      driverName: selectedDriver.name,
      date: newAppointment.date,
      time: newAppointment.time,
      startLocation: newAppointment.startLocation,
      endLocation: newAppointment.endLocation,
      purpose: newAppointment.purpose,
      status: 'pending',
      assignedBy: user.name,
      assignedAt: new Date().toISOString()
    };

    const updatedAppointments = [...appointments, appointment];
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    setAppointments(updatedAppointments);
    
    setNewAppointment({
      driverId: '',
      date: '',
      time: '',
      startLocation: '',
      endLocation: '',
      purpose: ''
    });
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700">Ausstehend</Badge>;
      case 'accepted':
        return <Badge variant="default">Angenommen</Badge>;
      case 'declined':
        return <Badge variant="destructive">Abgelehnt</Badge>;
      default:
        return <Badge variant="secondary">Unbekannt</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Terminverwaltung</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Termin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Neuen Termin zuweisen</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <Label htmlFor="driverId">Fahrer</Label>
                <Select value={newAppointment.driverId} onValueChange={(value) => setNewAppointment({ ...newAppointment, driverId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fahrer auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} ({driver.employeeNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="date">Datum</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Uhrzeit</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="startLocation">Startort</Label>
                <Input
                  id="startLocation"
                  value={newAppointment.startLocation}
                  onChange={(e) => setNewAppointment({ ...newAppointment, startLocation: e.target.value })}
                  placeholder="z.B. Büro München"
                  required
                />
              </div>
              <div>
                <Label htmlFor="endLocation">Zielort</Label>
                <Input
                  id="endLocation"
                  value={newAppointment.endLocation}
                  onChange={(e) => setNewAppointment({ ...newAppointment, endLocation: e.target.value })}
                  placeholder="z.B. Kunde Berlin"
                  required
                />
              </div>
              <div>
                <Label htmlFor="purpose">Zweck</Label>
                <Textarea
                  id="purpose"
                  value={newAppointment.purpose}
                  onChange={(e) => setNewAppointment({ ...newAppointment, purpose: e.target.value })}
                  placeholder="z.B. Lieferung an Kunde XY"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="submit">
                  Termin zuweisen
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-4">
        {appointments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Noch keine Termine erstellt</p>
              <p className="text-sm text-gray-400 mt-2">
                Klicken Sie auf "Neuer Termin" um den ersten Termin zu erstellen
              </p>
            </CardContent>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {appointment.driverName} - {new Date(appointment.date).toLocaleDateString('de-DE')}
                  </CardTitle>
                  {getStatusBadge(appointment.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{appointment.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{appointment.startLocation} → {appointment.endLocation}</span>
                  </div>
                  <div>
                    <span className="font-medium">Zugewiesen:</span>
                    <p>{new Date(appointment.assignedAt).toLocaleDateString('de-DE')}</p>
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
