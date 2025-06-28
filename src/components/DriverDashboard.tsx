
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User } from "@/pages/Index";
import { Plus, Car, MapPin, Calendar, FileText } from "lucide-react";

interface Trip {
  id: string;
  date: string;
  startLocation: string;
  endLocation: string;
  startKm: number;
  endKm: number;
  purpose: string;
  tripType: "business" | "private";
  driverId: string;
}

interface DriverDashboardProps {
  user: User;
}

export const DriverDashboard = ({ user }: DriverDashboardProps) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showNewTripForm, setShowNewTripForm] = useState(false);
  const [newTrip, setNewTrip] = useState({
    date: new Date().toISOString().split('T')[0],
    startLocation: "",
    endLocation: "",
    startKm: "",
    endKm: "",
    purpose: "",
    tripType: "business" as "business" | "private"
  });

  const handleSubmitTrip = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trip: Trip = {
      id: Math.random().toString(36).substr(2, 9),
      date: newTrip.date,
      startLocation: newTrip.startLocation,
      endLocation: newTrip.endLocation,
      startKm: parseInt(newTrip.startKm),
      endKm: parseInt(newTrip.endKm),
      purpose: newTrip.purpose,
      tripType: newTrip.tripType,
      driverId: user.id
    };

    setTrips([trip, ...trips]);
    setNewTrip({
      date: new Date().toISOString().split('T')[0],
      startLocation: "",
      endLocation: "",
      startKm: "",
      endKm: "",
      purpose: "",
      tripType: "business"
    });
    setShowNewTripForm(false);
  };

  const totalKm = trips.reduce((sum, trip) => sum + (trip.endKm - trip.startKm), 0);
  const businessKm = trips.filter(t => t.tripType === "business").reduce((sum, trip) => sum + (trip.endKm - trip.startKm), 0);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamte Fahrten</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trips.length}</div>
            <p className="text-xs text-muted-foreground">
              Fahrten diesen Monat
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
            <CardTitle className="text-sm font-medium">Geschäftliche Fahrten</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessKm.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Geschäftliche Kilometer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* New Trip Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Meine Fahrten</h2>
        <Button 
          onClick={() => setShowNewTripForm(true)} 
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Neue Fahrt hinzufügen
        </Button>
      </div>

      {/* New Trip Form */}
      {showNewTripForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Neue Fahrt eintragen
            </CardTitle>
            <CardDescription>
              Erfassen Sie hier die Details Ihrer Fahrt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitTrip} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Datum</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTrip.date}
                    onChange={(e) => setNewTrip({...newTrip, date: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tripType">Fahrttyp</Label>
                  <Select value={newTrip.tripType} onValueChange={(value: "business" | "private") => setNewTrip({...newTrip, tripType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Geschäftlich</SelectItem>
                      <SelectItem value="private">Privat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startLocation">Startort</Label>
                  <Input
                    id="startLocation"
                    value={newTrip.startLocation}
                    onChange={(e) => setNewTrip({...newTrip, startLocation: e.target.value})}
                    placeholder="z.B. Hamburg"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endLocation">Zielort</Label>
                  <Input
                    id="endLocation"
                    value={newTrip.endLocation}
                    onChange={(e) => setNewTrip({...newTrip, endLocation: e.target.value})}
                    placeholder="z.B. Berlin"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startKm">Kilometerstand Start</Label>
                  <Input
                    id="startKm"
                    type="number"
                    value={newTrip.startKm}
                    onChange={(e) => setNewTrip({...newTrip, startKm: e.target.value})}
                    placeholder="z.B. 50000"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endKm">Kilometerstand Ende</Label>
                  <Input
                    id="endKm"
                    type="number"
                    value={newTrip.endKm}
                    onChange={(e) => setNewTrip({...newTrip, endKm: e.target.value})}
                    placeholder="z.B. 50300"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purpose">Zweck der Fahrt</Label>
                <Textarea
                  id="purpose"
                  value={newTrip.purpose}
                  onChange={(e) => setNewTrip({...newTrip, purpose: e.target.value})}
                  placeholder="Beschreiben Sie den Zweck der Fahrt..."
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Fahrt speichern
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewTripForm(false)}
                >
                  Abbrechen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Trips List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Letzte Fahrten
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trips.length > 0 ? (
            <div className="space-y-4">
              {trips.map((trip) => (
                <div key={trip.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={trip.tripType === "business" ? "default" : "secondary"}>
                        {trip.tripType === "business" ? "Geschäftlich" : "Privat"}
                      </Badge>
                      <span className="text-sm text-gray-500">{trip.date}</span>
                    </div>
                    <span className="font-semibold text-blue-600">
                      {trip.endKm - trip.startKm} km
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Route:</span>
                      <span className="ml-2">{trip.startLocation} → {trip.endLocation}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Kilometerstand:</span>
                      <span className="ml-2">{trip.startKm.toLocaleString()} - {trip.endKm.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm">
                    <span className="text-gray-500">Zweck:</span>
                    <span className="ml-2">{trip.purpose}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Car className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Noch keine Fahrten eingetragen</p>
              <p className="text-sm">Klicken Sie auf "Neue Fahrt hinzufügen" um zu beginnen</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
