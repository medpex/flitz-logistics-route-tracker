
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@/pages/Index";

interface AllTripsProps {
  user: User;
}

export const AllTrips = ({ user }: AllTripsProps) => {
  // Fahrten aus localStorage laden
  const trips = JSON.parse(localStorage.getItem('trips') || '[]');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Alle Fahrten</h1>
      
      <div className="grid gap-4">
        {trips.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Noch keine Fahrten erfasst</p>
              <p className="text-sm text-gray-400 mt-2">
                Fahrten werden hier angezeigt, sobald sie von den Fahrern eingetragen wurden
              </p>
            </CardContent>
          </Card>
        ) : (
          trips.map((trip: any) => (
            <Card key={trip.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {trip.startLocation} → {trip.endLocation}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{trip.driverName}</Badge>
                    <Badge variant="secondary">{new Date(trip.date).toLocaleDateString('de-DE')}</Badge>
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
          ))
        )}
      </div>
    </div>
  );
};
