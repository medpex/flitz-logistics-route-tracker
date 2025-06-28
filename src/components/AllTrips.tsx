
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@/pages/Index";

interface AllTripsProps {
  user: User;
}

export const AllTrips = ({ user }: AllTripsProps) => {
  // Beispieldaten - später aus der Datenbank
  const trips = [
    {
      id: 1,
      date: "2024-01-15",
      driver: "Max Mustermann",
      startLocation: "Büro München",
      endLocation: "Kunde Berlin",
      startKm: 50000,
      endKm: 50125,
      distance: 125,
      purpose: "Lieferung an Kunde XY"
    },
    {
      id: 2,
      date: "2024-01-14",
      driver: "Anna Schmidt",
      startLocation: "Büro München",
      endLocation: "Lager Hamburg",
      startKm: 49850,
      endKm: 50000,
      distance: 150,
      purpose: "Warenabholung"
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Alle Fahrten</h1>
      
      <div className="grid gap-4">
        {trips.map((trip) => (
          <Card key={trip.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {trip.startLocation} → {trip.endLocation}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{trip.driver}</Badge>
                  <Badge variant="secondary">{trip.date}</Badge>
                </div>
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
        ))}
      </div>
    </div>
  );
};
