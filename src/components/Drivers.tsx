
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Plus } from "lucide-react";
import { User as UserType } from "@/pages/Index";

interface DriversProps {
  user: UserType;
}

export const Drivers = ({ user }: DriversProps) => {
  // Beispieldaten - später aus der Datenbank
  const drivers = [
    {
      id: 1,
      name: "Max Mustermann",
      email: "max@transport.de",
      totalTrips: 25,
      totalKm: 3500,
      status: "active"
    },
    {
      id: 2,
      name: "Anna Schmidt",
      email: "anna@transport.de",
      totalTrips: 18,
      totalKm: 2800,
      status: "active"
    },
    {
      id: 3,
      name: "Peter Weber",
      email: "peter@transport.de",
      totalTrips: 12,
      totalKm: 1900,
      status: "inactive"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Fahrer</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Fahrer
        </Button>
      </div>
      
      <div className="grid gap-4">
        {drivers.map((driver) => (
          <Card key={driver.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {driver.name}
                </CardTitle>
                <Badge variant={driver.status === "active" ? "default" : "secondary"}>
                  {driver.status === "active" ? "Aktiv" : "Inaktiv"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">E-Mail:</span>
                  <p>{driver.email}</p>
                </div>
                <div>
                  <span className="font-medium">Fahrten:</span>
                  <p>{driver.totalTrips}</p>
                </div>
                <div>
                  <span className="font-medium">Gesamt-Km:</span>
                  <p>{driver.totalKm.toLocaleString()} km</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
