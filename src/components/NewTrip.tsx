import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/pages/Index";
import { Lock, Info } from "lucide-react";

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
    isCompleted: false,
    startTime: "",
    endTime: "",
    businessPartner: "",
    detour: false,
    detourReason: ""
  });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>("");
  const [showAppointmentSelect, setShowAppointmentSelect] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [error, setError] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  // Favoriten-Logik
  const [partnerFavorites, setPartnerFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('partnerFavorites') || '[]');
    } catch { return []; }
  });
  const [purposeFavorites, setPurposeFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('purposeFavorites') || '[]');
    } catch { return []; }
  });
  const saveFavorite = (type: 'partner' | 'purpose', value: string) => {
    if (!value.trim()) return;
    if (type === 'partner') {
      const favs = [value, ...partnerFavorites.filter(f => f !== value)].slice(0, 5);
      setPartnerFavorites(favs);
      localStorage.setItem('partnerFavorites', JSON.stringify(favs));
    } else {
      const favs = [value, ...purposeFavorites.filter(f => f !== value)].slice(0, 5);
      setPurposeFavorites(favs);
      localStorage.setItem('purposeFavorites', JSON.stringify(favs));
    }
  };
  const partnerInputRef = useRef<HTMLInputElement>(null);
  const purposeInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (showAppointmentSelect) {
      fetchAppointments();
    }
  }, [showAppointmentSelect]);

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const res = await fetch(`/api/appointments?driverId=${user.id}`);
      const data = await res.json();
      // Nur akzeptierte Termine (nicht nach Datum filtern)
      const filtered = data.filter((apt: any) => apt.status === "accepted");
      setAppointments(filtered);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleSelectAppointment = (aptId: string) => {
    const apt = appointments.find(a => a.id === aptId);
    if (!apt) return;
    setSelectedAppointmentId(aptId);
    setTripData({
      ...tripData,
      startLocation: apt.startLocation || "",
      endLocation: apt.endLocation || "",
      purpose: apt.purpose || "",
      isStarted: true,
      startTime: apt.time || "",
      endTime: ""
    });
    setShowAppointmentSelect(false);
  };

  const handleStartTrip = () => {
    const now = new Date();
    const startTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTripData({
      ...tripData,
      isStarted: true,
      startTime,
      endTime: ""
    });
    setShowAppointmentSelect(false);
  };

  const handleEndTrip = async () => {
    setError("");
    if (!tripData.endKm || !tripData.endLocation || !tripData.businessPartner) {
      setError("Bitte alle Pflichtfelder ausfüllen (inkl. Geschäftspartner).");
      return;
    }
    if (tripData.detour && !tripData.detourReason.trim()) {
      setError("Bitte geben Sie eine Begründung für den Umweg an.");
      return;
    }
    const startKm = parseInt(tripData.startKm);
    const endKm = parseInt(tripData.endKm);
    if (endKm <= startKm) {
      setError("End-Kilometerstand muss höher als Start-Kilometerstand sein");
      return;
    }
    const now = new Date();
    const endTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      startTime: tripData.startTime,
      endTime: endTime,
      businessPartner: tripData.businessPartner,
      detourReason: tripData.detour ? tripData.detourReason : null
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
      setTripData({ ...tripData, isCompleted: true, endTime });
      alert("Fahrt erfolgreich beendet und gespeichert!");
      setTimeout(() => {
        setTripData({
          startKm: "",
          endKm: "",
          startLocation: "",
          endLocation: "",
          purpose: "",
          isStarted: false,
          isCompleted: false,
          startTime: "",
          endTime: "",
          businessPartner: "",
          detour: false,
          detourReason: ""
        });
      }, 2000);
      saveFavorite('partner', tripData.businessPartner);
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
      isCompleted: false,
      startTime: "",
      endTime: "",
      businessPartner: "",
      detour: false,
      detourReason: ""
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
          {showAppointmentSelect ? (
            <div>
              <h2 className="font-semibold mb-2">Angenommene Termine auswählen</h2>
              {loadingAppointments ? (
                <div>Lade Termine...</div>
              ) : appointments.length === 0 ? (
                <div className="text-red-600">Keine akzeptierten Termine vorhanden.</div>
              ) : (
                <div className="space-y-2">
                  {appointments.map((apt) => {
                    const isToday = apt.date.slice(0, 10) === today;
                    return (
                      <Button
                        key={apt.id}
                        className="w-full flex items-center justify-between"
                        variant={selectedAppointmentId === apt.id ? "default" : "outline"}
                        onClick={() => isToday && handleSelectAppointment(apt.id)}
                        disabled={!isToday}
                      >
                        <span>{apt.startLocation} → {apt.endLocation} ({apt.purpose}) am {new Date(apt.date).toLocaleDateString('de-DE')} um {apt.time}</span>
                        {!isToday && <Lock className="ml-2 text-gray-400" />}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : !tripData.isStarted ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startKm">
                    Start Kilometerstand
                    <span title="Pflichtfeld. Muss exakt mit dem Tacho übereinstimmen." className="inline-block align-middle ml-1 text-blue-500 cursor-help">
                      <Info className="inline h-4 w-4" />
                    </span>
                  </Label>
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
                <Label htmlFor="purpose">
                  Zweck der Fahrt
                  <span title="Pflichtfeld. Geben Sie den geschäftlichen Anlass an (z.B. Lieferung, Kundentermin)." className="inline-block align-middle ml-1 text-blue-500 cursor-help">
                    <Info className="inline h-4 w-4" />
                  </span>
                </Label>
                <Textarea
                  id="purpose"
                  value={tripData.purpose}
                  onChange={(e) => setTripData({ ...tripData, purpose: e.target.value })}
                  placeholder="z.B. Lieferung an Kunde XY"
                  rows={3}
                />
              </div>
            </>
          ) : (
            <>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <h3 className="font-medium text-green-800">Fahrt gestartet</h3>
                <p className="text-sm text-green-600">
                  Start: {tripData.startLocation} • {tripData.startKm} km um {tripData.startTime}
                </p>
                <p className="text-sm text-green-600">
                  Zweck: {tripData.purpose}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endKm">
                    End Kilometerstand
                    <span title="Pflichtfeld. Muss exakt mit dem Tacho übereinstimmen." className="inline-block align-middle ml-1 text-blue-500 cursor-help">
                      <Info className="inline h-4 w-4" />
                    </span>
                  </Label>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessPartner">
                    Geschäftspartner *
                    <span title="Name des aufgesuchten Kunden oder Geschäftspartners. Pflicht für das Finanzamt." className="inline-block align-middle ml-1 text-blue-500 cursor-help">
                      <Info className="inline h-4 w-4" />
                    </span>
                  </Label>
                  <Input
                    id="businessPartner"
                    value={tripData.businessPartner}
                    onChange={(e) => setTripData({ ...tripData, businessPartner: e.target.value })}
                    placeholder="z.B. Kunde XY GmbH"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="detour"
                    type="checkbox"
                    checked={tripData.detour}
                    onChange={e => setTripData({ ...tripData, detour: e.target.checked, detourReason: e.target.checked ? tripData.detourReason : "" })}
                  />
                  <Label htmlFor="detour">
                    Umweg gefahren?
                    <span title="Jeder Umweg muss mit Begründung dokumentiert werden (z.B. Baustelle, Zwischenstopp)." className="inline-block align-middle ml-1 text-blue-500 cursor-help">
                      <Info className="inline h-4 w-4" />
                    </span>
                  </Label>
                </div>
                {tripData.detour && (
                  <div>
                    <Label htmlFor="detourReason">
                      Begründung für Umweg *
                      <span title="Pflichtfeld, wenn Umweg gefahren wurde. Nur so ist das Fahrtenbuch anerkannt." className="inline-block align-middle ml-1 text-blue-500 cursor-help">
                        <Info className="inline h-4 w-4" />
                      </span>
                    </Label>
                    <Textarea
                      id="detourReason"
                      value={tripData.detourReason}
                      onChange={e => setTripData({ ...tripData, detourReason: e.target.value })}
                      placeholder="z.B. Baustelle, Umleitung, Zwischenstopp"
                      rows={2}
                    />
                  </div>
                )}
                {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleEndTrip} className="flex-1">
                  Fahrt beenden
                </Button>
                <Button onClick={handleReset} variant="outline">
                  Abbrechen
                </Button>
                {tripData.endTime && (
                  <div className="text-sm text-gray-600 mt-2">Fahrt beendet um {tripData.endTime}</div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
