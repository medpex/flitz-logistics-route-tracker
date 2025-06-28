
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Plus, Trash2 } from "lucide-react";
import { User as UserType } from "@/pages/Index";

interface DriversProps {
  user: UserType;
}

interface Driver {
  id: string;
  name: string;
  employeeNumber: string;
  email: string;
  status: "active" | "inactive";
  createdAt: string;
}

export const Drivers = ({ user }: DriversProps) => {
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    return JSON.parse(localStorage.getItem('drivers') || '[]');
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: '',
    employeeNumber: '',
    email: ''
  });

  const saveDrivers = (updatedDrivers: Driver[]) => {
    localStorage.setItem('drivers', JSON.stringify(updatedDrivers));
    setDrivers(updatedDrivers);
  };

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prüfen ob Personalnummer bereits existiert
    if (drivers.some(d => d.employeeNumber === newDriver.employeeNumber)) {
      alert('Diese Personalnummer existiert bereits!');
      return;
    }

    const driver: Driver = {
      id: Math.random().toString(36).substr(2, 9),
      name: newDriver.name,
      employeeNumber: newDriver.employeeNumber,
      email: newDriver.email,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const updatedDrivers = [...drivers, driver];
    saveDrivers(updatedDrivers);
    
    setNewDriver({ name: '', employeeNumber: '', email: '' });
    setIsDialogOpen(false);
  };

  const handleDeleteDriver = (driverId: string) => {
    if (confirm('Sind Sie sicher, dass Sie diesen Fahrer löschen möchten?')) {
      const updatedDrivers = drivers.filter(d => d.id !== driverId);
      saveDrivers(updatedDrivers);
    }
  };

  const toggleDriverStatus = (driverId: string) => {
    const updatedDrivers = drivers.map(d => 
      d.id === driverId 
        ? { ...d, status: d.status === 'active' ? 'inactive' as const : 'active' as const }
        : d
    );
    saveDrivers(updatedDrivers);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Fahrer</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Fahrer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Fahrer hinzufügen</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddDriver} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="employeeNumber">Personalnummer</Label>
                <Input
                  id="employeeNumber"
                  value={newDriver.employeeNumber}
                  onChange={(e) => setNewDriver({ ...newDriver, employeeNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">E-Mail (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={newDriver.email}
                  onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="submit">
                  Fahrer hinzufügen
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-4">
        {drivers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Noch keine Fahrer angelegt</p>
              <p className="text-sm text-gray-400 mt-2">
                Klicken Sie auf "Neuer Fahrer" um den ersten Fahrer hinzuzufügen
              </p>
            </CardContent>
          </Card>
        ) : (
          drivers.map((driver) => (
            <Card key={driver.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {driver.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={driver.status === "active" ? "default" : "secondary"}>
                      {driver.status === "active" ? "Aktiv" : "Inaktiv"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleDriverStatus(driver.id)}
                    >
                      {driver.status === "active" ? "Deaktivieren" : "Aktivieren"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDriver(driver.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Personalnummer:</span>
                    <p className="font-mono text-blue-600">{driver.employeeNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium">E-Mail:</span>
                    <p>{driver.email || 'Nicht angegeben'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Erstellt:</span>
                    <p>{new Date(driver.createdAt).toLocaleDateString('de-DE')}</p>
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
