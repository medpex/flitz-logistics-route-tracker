import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Plus, Trash2 } from "lucide-react";
import { User as UserType } from "@/pages/Index";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";

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
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: '',
    employeeNumber: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/drivers');
      const data = await res.json();
      setDrivers(data);
    } catch (e) {
      setError('Fehler beim Laden der Fahrer');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDriver),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Fehler beim Anlegen');
        setLoading(false);
        return;
      }
      setNewDriver({ name: '', employeeNumber: '', email: '' });
      setIsDialogOpen(false);
      fetchDrivers();
    } catch (e) {
      setError('Fehler beim Anlegen des Fahrers');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDriver = (driverId: string) => {
    setDrivers(drivers.filter(d => d.id !== driverId));
    setDeleteDialogOpen(null);
  };

  const toggleDriverStatus = (driverId: string) => {
    const updatedDrivers = drivers.map(d => 
      d.id === driverId 
        ? { ...d, status: d.status === 'active' ? 'inactive' as const : 'active' as const }
        : d
    );
    // toggleDriverStatus ggf. anpassen, falls Backend-API vorhanden
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
                      asChild
                    >
                      <AlertDialogTrigger asChild>
                        <span className="flex items-center"><Trash2 className="h-4 w-4" /></span>
                      </AlertDialogTrigger>
                    </Button>
                    <AlertDialog open={deleteDialogOpen === driver.id} onOpenChange={open => setDeleteDialogOpen(open ? driver.id : null)}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Fahrer wirklich löschen?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Diese Aktion kann nicht rückgängig gemacht werden. Der Fahrer wird dauerhaft entfernt.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteDriver(driver.id)} autoFocus>Löschen</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
