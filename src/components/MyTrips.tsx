
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/pages/Index";
import { Play, Square, MapPin, Calendar } from "lucide-react";

interface MyTripsProps {
  user: User;
}

interface Trip {
  id: string;
  driverId: string;
  driverName: string;
  date: string;
  startLocation: string;
  endLocation: string;
  purpose: string;
  startKm?: number;
  endKm?: number;
  distance?: number;
  status: "scheduled" | "active" | "completed";
  appointmentId?: string;
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
}

export const MyTrips = ({ user }: MyTripsProps) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [startKm, setStartKm] = useState("");
  const [endKm, setEndKm] = useState("");

  useEffect(() => {
    loadTrips();
  }, [user.id]);

  const loadTrips = () => {
    // Lade alle Fahrten aus localStorage
    const allTrips = JSON.parse(localStorage.getItem('trips') || '[]');
    const userTrips = allTrips.filter((trip: Trip) => trip.driverId === user.id);
    
    // Lade angenommene Termine und konvertiere sie zu geplanten Fahrten
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const acceptedAppointments = appointments.filter(
      (apt: Appointment) => apt.driverId === user.id && apt.status === "accepted"
    );

    // Erstelle Fahrten aus angenommenen Terminen, falls sie noch nicht existieren
    const appointmentTrips = acceptedAppointments.map((apt: Appointment) => {
      // Prüfe ob bereits eine Fahrt für diesen Termin existiert
      const existingTrip = userTrips.find((trip: Trip) => trip.appointmentId === apt.id);
      if (existingTrip) {
        return existingTrip;
      }

      return {
        id: `apt-${apt.id}`,
        driverId: apt.driverId,
        driverName: apt.driverName,
        date: apt.date,
        startLocation: apt.startLocation,
        endLocation: apt.endLocation,
        purpose: apt.purpose,
        status: "scheduled" as const,
        appointmentId: apt.id
      };
    });

    // Kombiniere alle Fahrten
    const allUserTrips = [...userTrips, ...appointmentTrips.filter(trip => 
      !userTrips.some(existing => existing.appointmentId === trip.appointmentId)
    )];

    setTrips(allUserTrips.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleStartTrip = (trip: Trip) => {
    if (!startKm) {
      alert("Bitte Start-Kilometerstand eingeben");
      return;
    }

    const updatedTrip = {
      ...trip,
      startKm: parseInt(startKm),
      status: "active" as const
    };

    // Aktualisiere Fahrten
    const allTrips = JSON.parse(localStorage.getItem('trips') || '[]');
    const otherTrips = allTrips.filter((t: Trip) => t.id !== trip.id && t.appointmentId !== trip.appointmentId);
    const updatedTrips = [...otherTrips, updatedTrip];
    localStorage.setItem('trips', JSON.stringify(updatedTrips));

    setActiveTrip(updatedTrip);
    setStartKm("");
    loadTrips();
  };

  const handleEndTrip = () => {
    if (!activeTrip || !endKm) {
      alert("Bitte End-Kilometerstand eingeben");
      return;
    }

    const endKmNum = parseInt(endKm);
    if (endKmNum <= (activeTrip.startKm || 0)) {
      alert("End-Kilometerstand muss höher als Start-Kilometerstand sein");
      return;
    }

    const completedTrip = {
      ...activeTrip,
      endKm: endKmNum,
      distance: endKmNum - (activeTrip.startKm || 0),
      status: "completed" as const
    };

    // Aktualisiere Fahrten
    const allTrips = JSON.parse(localStorage.getItem('trips') || '[]');
    const otherTrips = allTrips.filter((t: Trip) => t.id !== activeTrip.id && t.appointmentId !== activeTrip.appointmentId);
    const updatedTrips = [...otherTrips, completedTrip];
    localStorage.setItem('trips', JSON.stringify(updatedTrips));

    setActiveTrip(null);
    setEndKm("");
    loadTrips();
    alert("Fahrt erfolgreich beendet!");
  };

  const scheduledTrips = trips.filter(trip => trip.status === "scheduled");
  const activeTrips = trips.filter(trip => trip.status === "active");
  const completedTrips = trips.filter(trip => trip.status === "completed");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Meine Fahrten</h1>
      
      {/* Aktive Fahrt */}
      {activeTrips.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Play className="h-5 w-5" />
              Aktive Fahrt
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTrips.map(trip => (
              <div key={trip.id} className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div><strong>Datum:</strong> {new Date(trip.date).toLocaleDateString('de-DE')}</div>
                  <div><strong>Route:</strong> {trip.startLocation} → {trip.endLocation}</div>
                  <div><strong>Start-KM:</strong> {trip.startKm?.toLocaleString()}</div>
                  <div><strong>Zweck:</strong> {trip.purpose}</div>
                </div>
                
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="endKm">End-Kilometerstand</Label>
                    <Input
                      id="endKm"
                      type="number"
                      value={endKm}
                      onChange={(e) => setEndKm(e.target.value)}
                      placeholder="z.B. 50300"
                    />
                  </div>
                  <Button 
                    onClick={handleEndTrip}
                    className="bg-red-600 hover:bg-red-700 gap-2"
                  >
                    <Square className="h-4 w-4" />
                    Fahrt beenden
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Geplante Fahrten */}
      {scheduledTrips.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Geplante Fahrten</h2>
          {scheduledTrips.map((trip) => (
            <Card key={trip.id} className="border-green-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {new Date(trip.date).toLocaleDateString('de-DE')}
                  </CardTitle>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Geplant
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{trip.startLocation} → {trip.endLocation}</span>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Zweck:</span>
                  <p className="text-sm text-gray-600 mt-1">{trip.purpose}</p>
                </div>
                
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor={`startKm-${trip.id}`}>Start-Kilometerstand</Label>
                    <Input
                      id={`startKm-${trip.id}`}
                      type="number"
                      value={startKm}
                      onChange={(e) => setStartKm(e.target.value)}
                      placeholder="z.B. 50000"
                    />
                  </div>
                  <Button 
                    onClick={() => handleStartTrip(trip)}
                    className="bg-green-600 hover:bg-green-700 gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Fahrt starten
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Abgeschlossene Fahrten */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Abgeschlossene Fahrten</h2>
        {completedTrips.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Noch keine Fahrten abgeschlossen</p>
            </CardContent>
          </Card>
        ) : (
          completedTrips.map((trip) => (
            <Card key={trip.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {trip.startLocation} → {trip.endLocation}
                  </CardTitle>
                  <Badge variant="secondary">{new Date(trip.date).toLocaleDateString('de-DE')}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Kilometer:</span>
                    <p>{trip.startKm} km → {trip.endKm} km</p>
                  </div>
                  <div>
                    <span className="font-medium">Distanz:</span>
                    <p>{trip.distance} km</p>
                  </div>
                  <div>
                    <span className="font-medium">Zweck:</span>
                    <p>{trip.purpose}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
