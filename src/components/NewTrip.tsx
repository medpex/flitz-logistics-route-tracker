import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/pages/Index";

interface NewTripProps {
  user: User;
}

export const NewTrip = ({ user }: NewTripProps) => {
  const [tripData, setTripData] = useState({
    startKm: "",
    endKm: "",
    startLocation: "",
    endLocation: "",
    purpose: "",
    isStarted: false,
    isCompleted: false
  });

  const handleStartTrip = () => {
    if (!tripData.startKm || !tripData.startLocation || !tripData.purpose) {
      alert("Bitte füllen Sie alle Felder aus");
      return;
    }
    setTripData({ ...tripData, isStarted: true });
  };

  const handleEndTrip = async () => {
    if (!tripData.endKm || !tripData.endLocation) {
      alert("Bitte füllen Sie alle Felder aus");
      return;
    }

    const startKm = parseInt(tripData.startKm);
    const endKm = parseInt(tripData.endKm);
    
    if (endKm <= startKm) {
      alert("End-Kilometerstand muss höher als Start-Kilometerstand sein");
      return;
    }

    // Fahrt per API speichern
    const trip = {
      driverId: user.id,
      driverName: user.name,
      date: new Date().toISOString(),
      startKm: startKm,
      endKm: endKm,
      totalDistance: endKm - startKm,
      startLocation: tripData.startLocation,
      endLocation: tripData.endLocation,
      purpose: tripData.purpose,
      status: 'completed',
    };

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Fehler beim Speichern der Fahrt');
        return;
      }
      setTripData({ ...tripData, isCompleted: true });
      alert("Fahrt erfolgreich beendet und gespeichert!");
      setTimeout(() => {
        setTripData({
          startKm: "",
          endKm: "",
          startLocation: "",
          endLocation: "",
          purpose: "",
          isStarted: false,
          isCompleted: false
        });
      }, 2000);
    } catch (e) {
      alert('Fehler beim Speichern der Fahrt');
    }
  };

  const handleReset = () => {
    setTripData({
      startKm: "",
      endKm: "",
      startLocation: "",
      endLocation: "",
      purpose: "",
      isStarted: false,
      isCompleted: false
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Neue Fahrt</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {!tripData.isStarted ? "Fahrt starten" : "Fahrt beenden"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!tripData.isStarted ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startKm">Start Kilometerstand</Label>
                  <Input
                    id="startKm"
                    type="number"
                    value={tripData.startKm}
                    onChange={(e) => setTripData({ ...tripData, startKm: e.target.value })}
                    placeholder="z.B. 50000"
                  />
                </div>
                <div>
                  <Label htmlFor="startLocation">Startort</Label>
                  <Input
                    id="startLocation"
                    value={tripData.startLocation}
                    onChange={(e) => setTripData({ ...tripData, startLocation: e.target.value })}
                    placeholder="z.B. Büro München"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="purpose">Zweck der Fahrt</Label>
                <Textarea
                  id="purpose"
                  value={tripData.purpose}
                  onChange={(e) => setTripData({ ...tripData, purpose: e.target.value })}
                  placeholder="z.B. Lieferung an Kunde XY"
                  rows={3}
                />
              </div>
              
              <Button onClick={handleStartTrip} className="w-full">
                Fahrt starten
              </Button>
            </>
          ) : (
            <>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <h3 className="font-medium text-green-800">Fahrt gestartet</h3>
                <p className="text-sm text-green-600">
                  Start: {tripData.startLocation} • {tripData.startKm} km
                </p>
                <p className="text-sm text-green-600">
                  Zweck: {tripData.purpose}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endKm">End Kilometerstand</Label>
                  <Input
                    id="endKm"
                    type="number"
                    value={tripData.endKm}
                    onChange={(e) => setTripData({ ...tripData, endKm: e.target.value })}
                    placeholder="z.B. 50125"
                  />
                </div>
                <div>
                  <Label htmlFor="endLocation">Zielort</Label>
                  <Input
                    id="endLocation"
                    value={tripData.endLocation}
                    onChange={(e) => setTripData({ ...tripData, endLocation: e.target.value })}
                    placeholder="z.B. Kunde Berlin"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleEndTrip} className="flex-1">
                  Fahrt beenden
                </Button>
                <Button onClick={handleReset} variant="outline">
                  Abbrechen
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
