
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/pages/Index";
import { Play, Square, MapPin, Calendar, Clock } from "lucide-react";

interface MyTripsProps {
  user: User;
}

interface StationEntry {
  location: string;
  km: number;
  time: string;
  completed: boolean;
}

interface Trip {
  id: string;
  driverId: string;
  driverName: string;
  date: string;
  time: string;
  startLocation: string;
  stations: string[];
  endLocation: string;
  purpose: string;
  status: "scheduled" | "active" | "completed";
  appointmentId?: string;
  stationEntries?: StationEntry[];
  startKm?: number;
  startTime?: string;
  endKm?: number;
  endTime?: string;
  totalDistance?: number;
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

export const MyTrips = ({ user }: MyTripsProps) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [startKm, setStartKm] = useState("");
  const [startTime, setStartTime] = useState("");
  const [currentStationKm, setCurrentStationKm] = useState("");
  const [currentStationTime, setCurrentStationTime] = useState("");

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
        time: apt.time,
        startLocation: apt.startLocation,
        stations: apt.stations || [],
        endLocation: apt.endLocation,
        purpose: apt.purpose,
        status: "scheduled" as const,
        appointmentId: apt.id,
        stationEntries: []
      };
    });

    // Kombiniere alle Fahrten
    const allUserTrips = [...userTrips, ...appointmentTrips.filter(trip => 
      !userTrips.some(existing => existing.appointmentId === trip.appointmentId)
    )];

    setTrips(allUserTrips.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    // Setze aktive Fahrt
    const active = allUserTrips.find(trip => trip.status === "active");
    setActiveTrip(active || null);
  };

  const handleStartTrip = (trip: Trip) => {
    if (!startKm || !startTime) {
      alert("Bitte Start-Kilometerstand und Uhrzeit eingeben");
      return;
    }

    // Initialisiere Station Entries für alle Stationen
    const stationEntries: StationEntry[] = [
      ...trip.stations.map(station => ({
        location: station,
        km: 0,
        time: "",
        completed: false
      })),
      {
        location: trip.endLocation,
        km: 0,
        time: "",
        completed: false
      }
    ];

    const updatedTrip = {
      ...trip,
      startKm: parseInt(startKm),
      startTime: startTime,
      status: "active" as const,
      stationEntries: stationEntries
    };

    // Aktualisiere Fahrten
    const allTrips = JSON.parse(localStorage.getItem('trips') || '[]');
    const otherTrips = allTrips.filter((t: Trip) => t.id !== trip.id && t.appointmentId !== trip.appointmentId);
    const updatedTrips = [...otherTrips, updatedTrip];
    localStorage.setItem('trips', JSON.stringify(updatedTrips));

    setActiveTrip(updatedTrip);
    setStartKm("");
    setStartTime("");
    loadTrips();
  };

  const handleStationComplete = (stationIndex: number) => {
    if (!activeTrip || !currentStationKm || !currentStationTime) {
      alert("Bitte Kilometerstand und Uhrzeit eingeben");
      return;
    }

    const updatedStationEntries = [...(activeTrip.stationEntries || [])];
    updatedStationEntries[stationIndex] = {
      ...updatedStationEntries[stationIndex],
      km: parseInt(currentStationKm),
      time: currentStationTime,
      completed: true
    };

    const updatedTrip = {
      ...activeTrip,
      stationEntries: updatedStationEntries
    };

    // Prüfen ob alle Stationen abgeschlossen sind
    const allCompleted = updatedStationEntries.every(entry => entry.completed);
    if (allCompleted) {
      const lastStation = updatedStationEntries[updatedStationEntries.length - 1];
      updatedTrip.endKm = lastStation.km;
      updatedTrip.endTime = lastStation.time;
      updatedTrip.totalDistance = lastStation.km - (activeTrip.startKm || 0);
      updatedTrip.status = "completed";
    }

    // Aktualisiere Fahrten
    const allTrips = JSON.parse(localStorage.getItem('trips') || '[]');
    const otherTrips = allTrips.filter((t: Trip) => t.id !== activeTrip.id && t.appointmentId !== activeTrip.appointmentId);
    const updatedTrips = [...otherTrips, updatedTrip];
    localStorage.setItem('trips', JSON.stringify(updatedTrips));

    if (allCompleted) {
      setActiveTrip(null);
      alert("Fahrt erfolgreich abgeschlossen!");
    } else {
      setActiveTrip(updatedTrip);
    }
    
    setCurrentStationKm("");
    setCurrentStationTime("");
    loadTrips();
  };

  const scheduledTrips = trips.filter(trip => trip.status === "scheduled");
  const activeTrips = trips.filter(trip => trip.status === "active");
  const completedTrips = trips.filter(trip => trip.status === "completed");

  const getNextIncompleteStation = (trip: Trip) => {
    if (!trip.stationEntries) return null;
    const index = trip.stationEntries.findIndex(entry => !entry.completed);
    return index >= 0 ? { index, station: trip.stationEntries[index] } : null;
  };

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
            {activeTrips.map(trip => {
              const nextStation = getNextIncompleteStation(trip);
              
              return (
                <div key={trip.id} className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div><strong>Datum:</strong> {new Date(trip.date).toLocaleDateString('de-DE')} um {trip.time}</div>
                    <div><strong>Start:</strong> {trip.startLocation}</div>
                    <div><strong>Start-KM:</strong> {trip.startKm?.toLocaleString()} um {trip.startTime}</div>
                    <div><strong>Zweck:</strong> {trip.purpose}</div>
                  </div>

                  {/* Stationen Status */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Stationen:</h4>
                    <div className="space-y-2">
                      {trip.stationEntries?.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span className={entry.completed ? "line-through text-gray-500" : ""}>
                              {entry.location}
                            </span>
                          </div>
                          {entry.completed && (
                            <div className="text-sm text-gray-600">
                              {entry.km} km um {entry.time}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {nextStation && (
                    <div className="bg-yellow-50 p-4 rounded border">
                      <h4 className="font-medium mb-3">
                        Nächste Station: {nextStation.station.location}
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Kilometerstand</Label>
                          <Input
                            type="number"
                            value={currentStationKm}
                            onChange={(e) => setCurrentStationKm(e.target.value)}
                            placeholder="z.B. 50100"
                          />
                        </div>
                        <div>
                          <Label>Uhrzeit</Label>
                          <Input
                            type="time"
                            value={currentStationTime}
                            onChange={(e) => setCurrentStationTime(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleStationComplete(nextStation.index)}
                        className="mt-3 w-full"
                      >
                        Station abschließen
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
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
                    {new Date(trip.date).toLocaleDateString('de-DE')} um {trip.time}
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

                {trip.stations.length > 0 && (
                  <div>
                    <span className="font-medium">Stationen:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {trip.stations.map((station, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {station}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="font-medium">Zweck:</span>
                  <p className="text-sm text-gray-600 mt-1">{trip.purpose}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`startKm-${trip.id}`}>Start-Kilometerstand</Label>
                    <Input
                      id={`startKm-${trip.id}`}
                      type="number"
                      value={startKm}
                      onChange={(e) => setStartKm(e.target.value)}
                      placeholder="z.B. 50000"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`startTime-${trip.id}`}>Start-Uhrzeit</Label>
                    <Input
                      id={`startTime-${trip.id}`}
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleStartTrip(trip)}
                  className="w-full bg-green-600 hover:bg-green-700 gap-2"
                >
                  <Play className="h-4 w-4" />
                  Fahrt starten
                </Button>
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Kilometer:</span>
                    <p>{trip.startKm} km → {trip.endKm} km</p>
                  </div>
                  <div>
                    <span className="font-medium">Distanz:</span>
                    <p>{trip.totalDistance} km</p>
                  </div>
                  <div>
                    <span className="font-medium">Zeit:</span>
                    <p>{trip.startTime} → {trip.endTime}</p>
                  </div>
                </div>

                {trip.stationEntries && trip.stationEntries.length > 0 && (
                  <div>
                    <span className="font-medium">Stationen:</span>
                    <div className="mt-2 space-y-1">
                      {trip.stationEntries.map((entry, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{entry.location}</span>
                          <span>{entry.km} km um {entry.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="font-medium">Zweck:</span>
                  <p className="text-sm text-gray-600 mt-1">{trip.purpose}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
