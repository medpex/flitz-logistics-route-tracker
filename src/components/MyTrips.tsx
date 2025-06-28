
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@/pages/Index";

interface MyTripsProps {
  user: User;
}

export const MyTrips = ({ user }: MyTripsProps) => {
  // Fahrten aus localStorage laden, gefiltert nach dem aktuellen Fahrer
  const allTrips = JSON.parse(localStorage.getItem('trips') || '[]');
  const trips = allTrips.filter((trip: any) => trip.driverId === user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Meine Fahrten</h1>
      
      <div className="grid gap-4">
        {trips.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Noch keine Fahrten erfasst</p>
              <p className="text-sm text-gray-400 mt-2">
                Ihre Fahrten werden hier angezeigt, sobald Sie welche eingetragen haben
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
