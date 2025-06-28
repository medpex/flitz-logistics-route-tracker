
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, UserRole } from "@/pages/Index";
import { Truck, Users } from "lucide-react";

interface LoginFormProps {
  onLogin: (user: User) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [name, setName] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [role, setRole] = useState<UserRole>("driver");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (role === "admin") {
      // Admin Login - nur Name erforderlich
      if (name.trim()) {
        onLogin({
          id: 'admin',
          name: name.trim(),
          role: 'admin'
        });
      }
    } else {
      // Fahrer Login - Name und Personalnummer erforderlich
      if (!name.trim() || !employeeNumber.trim()) {
        setError("Bitte Name und Personalnummer eingeben");
        return;
      }

      // Prüfen ob Fahrer existiert
      const drivers = JSON.parse(localStorage.getItem('drivers') || '[]');
      const driver = drivers.find((d: any) => 
        d.name === name.trim() && d.employeeNumber === employeeNumber.trim()
      );

      if (!driver) {
        setError("Fahrer nicht gefunden. Bitte wenden Sie sich an den Administrator.");
        return;
      }

      if (driver.status !== 'active') {
        setError("Ihr Account ist deaktiviert. Bitte wenden Sie sich an den Administrator.");
        return;
      }

      onLogin({
        id: driver.id,
        name: driver.name,
        role: 'driver'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Truck className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Fahrtenbuch App
          </CardTitle>
          <CardDescription className="text-gray-600">
            Melden Sie sich an, um fortzufahren
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Benutzerrolle</Label>
              <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="driver">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Fahrer
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Administrator
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ihr Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            {role === "driver" && (
              <div className="space-y-2">
                <Label htmlFor="employeeNumber">Personalnummer</Label>
                <Input
                  id="employeeNumber"
                  type="text"
                  placeholder="Ihre Personalnummer"
                  value={employeeNumber}
                  onChange={(e) => setEmployeeNumber(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Anmelden
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
