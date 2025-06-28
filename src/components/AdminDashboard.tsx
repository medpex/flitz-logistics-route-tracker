
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "@/pages/Index";
import { 
  BarChart3, 
  Users, 
  Car, 
  TrendingUp, 
  FileText, 
  Download,
  MapPin,
  Calendar
} from "lucide-react";

// Mock data for demonstration
const mockTrips = [
  {
    id: "1",
    date: "2024-01-15",
    driverName: "Max Mustermann",
    startLocation: "Hamburg",
    endLocation: "Berlin",
    startKm: 50000,
    endKm: 50300,
    purpose: "Kundenbesuch bei ABC GmbH",
    tripType: "business" as const
  },
  {
    id: "2",
    date: "2024-01-14",
    driverName: "Anna Schmidt",
    startLocation: "München",
    endLocation: "Frankfurt",
    startKm: 75000,
    endKm: 75400,
    purpose: "Lieferung an Kunde XYZ",
    tripType: "business" as const
  },
  {
    id: "3",
    date: "2024-01-13",
    driverName: "Peter Wagner",
    startLocation: "Köln",
    endLocation: "Düsseldorf",
    startKm: 45000,
    endKm: 45050,
    purpose: "Arzttermin",
    tripType: "private" as const
  }
];

const mockDrivers = [
  { id: "1", name: "Max Mustermann", totalTrips: 15, totalKm: 4500 },
  { id: "2", name: "Anna Schmidt", totalTrips: 12, totalKm: 3800 },
  { id: "3", name: "Peter Wagner", totalTrips: 8, totalKm: 2200 }
];

interface AdminDashboardProps {
  user: User;
}

export const AdminDashboard = ({ user }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState<"overview" | "trips" | "reports" | "drivers">("overview");

  const totalTrips = mockTrips.length;
  const totalKm = mockTrips.reduce((sum, trip) => sum + (trip.endKm - trip.startKm), 0);
  const businessTrips = mockTrips.filter(t => t.tripType === "business").length;
  const totalDrivers = mockDrivers.length;

  const handleExportReport = () => {
    // Mock export functionality
    console.log("Exporting report...");
    alert("Bericht wird exportiert (Demo-Funktion)");
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: "overview", label: "Übersicht", icon: BarChart3 },
          { key: "trips", label: "Alle Fahrten", icon: Car },
          { key: "reports", label: "Berichte", icon: FileText },
          { key: "drivers", label: "Fahrer", icon: Users }
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.key as any)}
            className={`gap-2 ${activeTab === tab.key ? "bg-white shadow-sm" : ""}`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gesamte Fahrten</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTrips}</div>
                <p className="text-xs text-muted-foreground">
                  +12% zum Vormonat
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
                  +8% zum Vormonat
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Geschäftliche Fahrten</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{businessTrips}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((businessTrips / totalTrips) * 100)}% aller Fahrten
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktive Fahrer</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDrivers}</div>
                <p className="text-xs text-muted-foreground">
                  Registrierte Fahrer
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Aktuelle Aktivitäten
              </CardTitle>
              <CardDescription>
                Letzte Fahrten aller Fahrer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTrips.slice(0, 5).map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Car className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{trip.driverName}</p>
                        <p className="text-sm text-gray-500">
                          {trip.startLocation} → {trip.endLocation}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={trip.tripType === "business" ? "default" : "secondary"}>
                        {trip.tripType === "business" ? "Geschäftlich" : "Privat"}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {trip.endKm - trip.startKm} km
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* All Trips Tab */}
      {activeTab === "trips" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Alle Fahrten</CardTitle>
                <CardDescription>Übersicht aller erfassten Fahrten</CardDescription>
              </div>
              <Button onClick={handleExportReport} className="gap-2">
                <Download className="h-4 w-4" />
                Exportieren
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTrips.map((trip) => (
                <div key={trip.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={trip.tripType === "business" ? "default" : "secondary"}>
                        {trip.tripType === "business" ? "Geschäftlich" : "Privat"}
                      </Badge>
                      <span className="text-sm text-gray-500">{trip.date}</span>
                      <span className="text-sm font-medium">{trip.driverName}</span>
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
          </CardContent>
        </Card>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Berichte generieren
              </CardTitle>
              <CardDescription>
                Erstellen Sie detaillierte Berichte für verschiedene Zeiträume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={handleExportReport} 
                  className="h-20 flex-col gap-2"
                  variant="outline"
                >
                  <FileText className="h-6 w-6" />
                  Monatsbericht
                </Button>
                <Button 
                  onClick={handleExportReport} 
                  className="h-20 flex-col gap-2"
                  variant="outline"
                >
                  <BarChart3 className="h-6 w-6" />
                  Jahresbericht
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Durchschnittliche Fahrtdistanz</span>
                  <span className="font-semibold">{Math.round(totalKm / totalTrips)} km</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Geschäftsfahrten Anteil</span>
                  <span className="font-semibold">{Math.round((businessTrips / totalTrips) * 100)}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Fahrten pro Fahrer (Durchschnitt)</span>
                  <span className="font-semibold">{Math.round(totalTrips / totalDrivers)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Drivers Tab */}
      {activeTab === "drivers" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Fahrer Übersicht
            </CardTitle>
            <CardDescription>
              Alle registrierten Fahrer und ihre Statistiken
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockDrivers.map((driver) => (
                <div key={driver.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{driver.name}</p>
                      <p className="text-sm text-gray-500">Fahrer</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{driver.totalTrips} Fahrten</p>
                    <p className="text-sm text-gray-500">{driver.totalKm.toLocaleString()} km</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
