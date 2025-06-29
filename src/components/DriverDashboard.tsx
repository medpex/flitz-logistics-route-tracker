import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User } from "@/pages/Index";
import { Plus, Car, MapPin, Calendar, FileText, Play, Square, Download } from "lucide-react";
import { NewTrip } from "./NewTrip";
import { differenceInDays, addDays, format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Trip {
  id: string;
  date: string;
  startLocation: string;
  endLocation?: string;
  startKm: number;
  endKm?: number;
  purpose: string;
  driverId: string;
  status: "active" | "completed";
  endTime?: string;
  businessPartner?: string;
}

interface DriverDashboardProps {
  user: User;
}

export const DriverDashboard = ({ user }: DriverDashboardProps) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showNewTripForm, setShowNewTripForm] = useState(false);
  const [showEndTripForm, setShowEndTripForm] = useState<string | null>(null);
  const [newTrip, setNewTrip] = useState({
    date: new Date().toISOString().split('T')[0],
    startLocation: "",
    startKm: "",
    purpose: ""
  });
  const [endTrip, setEndTrip] = useState({
    endLocation: "",
    endKm: ""
  });

  // Filter-States
  const [filterText, setFilterText] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPurpose, setFilterPurpose] = useState("");
  const [filterPartner, setFilterPartner] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // Sort-States
  const [sortBy, setSortBy] = useState<'date' | 'distance' | 'status'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Gefilterte Fahrten
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      if (filterStatus && trip.status !== filterStatus) return false;
      if (filterPurpose && !(trip.purpose || "").toLowerCase().includes(filterPurpose.toLowerCase())) return false;
      if (filterPartner && !(trip.businessPartner || "").toLowerCase().includes(filterPartner.toLowerCase())) return false;
      if (filterFrom && new Date(trip.date) < new Date(filterFrom)) return false;
      if (filterTo && new Date(trip.date) > new Date(filterTo)) return false;
      if (filterText) {
        const text = filterText.toLowerCase();
        if (!(
          (trip.startLocation || "").toLowerCase().includes(text) ||
          (trip.endLocation || "").toLowerCase().includes(text) ||
          (trip.purpose || "").toLowerCase().includes(text) ||
          (trip.businessPartner || "").toLowerCase().includes(text)
        )) return false;
      }
      return true;
    });
  }, [trips, filterStatus, filterPurpose, filterPartner, filterFrom, filterTo, filterText]);

  const sortedTrips = useMemo(() => {
    const arr = [...filteredTrips];
    arr.sort((a, b) => {
      if (sortBy === 'date') {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        return sortDir === 'asc' ? da - db : db - da;
      }
      if (sortBy === 'distance') {
        const distA = (a.endKm && a.startKm) ? a.endKm - a.startKm : 0;
        const distB = (b.endKm && b.startKm) ? b.endKm - b.startKm : 0;
        return sortDir === 'asc' ? distA - distB : distB - distA;
      }
      if (sortBy === 'status') {
        return sortDir === 'asc'
          ? String(a.status).localeCompare(String(b.status))
          : String(b.status).localeCompare(String(a.status));
      }
      return 0;
    });
    return arr;
  }, [filteredTrips, sortBy, sortDir]);

  const handleStartTrip = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trip: Trip = {
      id: Math.random().toString(36).substr(2, 9),
      date: newTrip.date,
      startLocation: newTrip.startLocation,
      startKm: parseInt(newTrip.startKm),
      purpose: newTrip.purpose,
      driverId: user.id,
      status: "active"
    };

    setTrips([trip, ...trips]);
    setNewTrip({
      date: new Date().toISOString().split('T')[0],
      startLocation: "",
      startKm: "",
      purpose: ""
    });
    setShowNewTripForm(false);
  };

  const handleEndTrip = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showEndTripForm) return;
    
    setTrips(trips.map(trip => 
      trip.id === showEndTripForm 
        ? {
            ...trip,
            endLocation: endTrip.endLocation,
            endKm: parseInt(endTrip.endKm),
            status: "completed" as const
          }
        : trip
    ));
    
    setEndTrip({
      endLocation: "",
      endKm: ""
    });
    setShowEndTripForm(null);
  };

  const handleExport = (type: 'csv' | 'pdf') => {
    const url = `/api/trips/export/${type}?driverId=${user.id}`;
    window.open(url, '_blank');
  };

  const activeTrip = trips.find(trip => trip.status === "active");
  const completedTrips = trips.filter(trip => trip.status === "completed");
  const totalKm = completedTrips.reduce((sum, trip) => sum + ((trip.endKm || 0) - trip.startKm), 0);

  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('onboarding_shown')) {
      setShowOnboarding(true);
      localStorage.setItem('onboarding_shown', '1');
    }
  }, []);

  return (
    <div className="space-y-6">
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Willkommen im Fahrtenbuch!</DialogTitle>
            <DialogDescription>
              <ul className="list-disc pl-5 space-y-2 text-sm mt-2">
                <li>Alle Fahrten müssen lückenlos, zeitnah und manipulationssicher dokumentiert werden.</li>
                <li>Erfassen Sie Start- und End-Kilometerstand, Zweck, Geschäftspartner und ggf. Umwege mit Begründung.</li>
                <li>Nachträgliche Änderungen sind nur 7 Tage nach Fahrtende möglich.</li>
                <li>Exportieren Sie Ihr Fahrtenbuch jederzeit als PDF oder CSV für das Finanzamt.</li>
                <li>Weitere Hinweise finden Sie bei den jeweiligen Feldern und Aktionen.</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowOnboarding(false)}>Verstanden</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Buttons */}
      <div className="flex gap-2 justify-end">
        <Button onClick={() => handleExport('csv')} variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> CSV Export
        </Button>
        <Button onClick={() => handleExport('pdf')} variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> PDF Export
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamte Fahrten</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTrips.length}</div>
            <p className="text-xs text-muted-foreground">
              Abgeschlossene Fahrten
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamte Kilometer</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKm.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Kilometer gefahren
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktuelle Fahrt</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTrip ? "Unterwegs" : "Keine"}</div>
            <p className="text-xs text-muted-foreground">
              {activeTrip ? "Fahrt beenden" : "Neue Fahrt starten"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Trip Alert */}
      {activeTrip && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Play className="h-5 w-5" />
              Aktive Fahrt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Start:</strong> {activeTrip.startLocation}</div>
              <div><strong>Start-KM:</strong> {activeTrip.startKm.toLocaleString()}</div>
              <div><strong>Zweck:</strong> {activeTrip.purpose}</div>
            </div>
            <Button 
              onClick={() => setShowEndTripForm(activeTrip.id)} 
              className="mt-4 bg-red-600 hover:bg-red-700 gap-2"
            >
              <Square className="h-4 w-4" />
              Fahrt beenden
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Meine Fahrten</h2>
        {!activeTrip && (
          <Button 
            onClick={() => setShowNewTripForm(true)} 
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Neue Fahrt starten
          </Button>
        )}
      </div>

      {/* Start Trip Form */}
      {showNewTripForm && <NewTrip user={user} />}

      {/* End Trip Form */}
      {showEndTripForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Square className="h-5 w-5" />
              Fahrt beenden
            </CardTitle>
            <CardDescription>
              Erfassen Sie die End-Details Ihrer Fahrt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEndTrip} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endLocation">Zielort</Label>
                  <Input
                    id="endLocation"
                    value={endTrip.endLocation}
                    onChange={(e) => setEndTrip({...endTrip, endLocation: e.target.value})}
                    placeholder="z.B. Berlin"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endKm">Kilometerstand Ende</Label>
                  <Input
                    id="endKm"
                    type="number"
                    value={endTrip.endKm}
                    onChange={(e) => setEndTrip({...endTrip, endKm: e.target.value})}
                    placeholder="z.B. 50300"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  Fahrt beenden
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEndTripForm(null)}
                >
                  Abbrechen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filter & Suche + Sortierung */}
      <Card className="mb-4">
        <CardContent className="flex flex-wrap gap-4 items-end">
          <div>
            <Label htmlFor="filterText">Suche</Label>
            <Input id="filterText" value={filterText} onChange={e => setFilterText(e.target.value)} placeholder="Suche..." />
          </div>
          <div>
            <Label htmlFor="filterStatus">Status</Label>
            <select id="filterStatus" className="border rounded px-2 py-1" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Alle</option>
              <option value="active">Aktiv</option>
              <option value="completed">Abgeschlossen</option>
            </select>
          </div>
          <div>
            <Label htmlFor="filterPurpose">Zweck</Label>
            <Input id="filterPurpose" value={filterPurpose} onChange={e => setFilterPurpose(e.target.value)} placeholder="z.B. Lieferung" />
          </div>
          <div>
            <Label htmlFor="filterPartner">Geschäftspartner</Label>
            <Input id="filterPartner" value={filterPartner} onChange={e => setFilterPartner(e.target.value)} placeholder="z.B. Kunde XY" />
          </div>
          <div>
            <Label htmlFor="filterFrom">Von</Label>
            <Input id="filterFrom" type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="filterTo">Bis</Label>
            <Input id="filterTo" type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="sortBy">Sortieren nach</Label>
            <select id="sortBy" className="border rounded px-2 py-1" value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
              <option value="date">Datum</option>
              <option value="distance">Distanz</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div>
            <Label htmlFor="sortDir">Richtung</Label>
            <select id="sortDir" className="border rounded px-2 py-1" value={sortDir} onChange={e => setSortDir(e.target.value as any)}>
              <option value="desc">Absteigend</option>
              <option value="asc">Aufsteigend</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Trips List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Letzte Fahrten
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTrips.length > 0 ? (
            <div className="space-y-4">
              {sortedTrips.map((trip) => {
                // Fristberechnung
                let editable = false;
                let editUntil = null;
                if (trip.status !== 'completed') {
                  editable = true;
                } else if (trip.endTime || trip.date) {
                  const endDate = trip.endTime
                    ? new Date(trip.date.split('T')[0] + 'T' + trip.endTime)
                    : new Date(trip.date);
                  editUntil = addDays(endDate, 7);
                  editable = new Date() <= editUntil;
                }
                return (
                  <div key={trip.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={trip.status === "completed" ? "default" : "secondary"}>
                          {trip.status === "completed" ? "Abgeschlossen" : "Aktiv"}
                        </Badge>
                        <span className="text-sm text-gray-500">{trip.date}</span>
                      </div>
                      <span className="font-semibold text-blue-600">
                        {trip.status === "completed" && trip.endKm 
                          ? `${trip.endKm - trip.startKm} km`
                          : "Unterwegs"
                        }
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Route:</span>
                        <span className="ml-2">
                          {trip.startLocation}
                          {trip.endLocation && ` → ${trip.endLocation}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Kilometerstand:</span>
                        <span className="ml-2">
                          {trip.startKm.toLocaleString()}
                          {trip.endKm && ` - ${trip.endKm.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Zweck:</span>
                      <span className="ml-2">{trip.purpose}</span>
                    </div>
                    <div className="mt-2 text-xs">
                      {editable && trip.status === 'completed' && editUntil && (
                        <span className="text-green-700">Bearbeitbar bis {format(editUntil, 'dd.MM.yyyy')}</span>
                      )}
                      {!editable && trip.status === 'completed' && editUntil && (
                        <span className="text-red-600">Nicht mehr bearbeitbar (Frist abgelaufen)</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Car className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Noch keine Fahrten eingetragen</p>
              <p className="text-sm">Klicken Sie auf "Neue Fahrt starten" um zu beginnen</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
