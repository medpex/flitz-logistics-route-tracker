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

// Neue Typen für Route-Checkpoints
interface RouteCheckpoint {
  location: string;
  km: string;
  time: string;
}

export const NewTrip = ({ user }: NewTripProps) => {
  const [tripData, setTripData] = useState({
    checkpoints: [
      // { location: string, km: string, time: string }
    ],
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
  const [newCheckpoint, setNewCheckpoint] = useState({ location: "", km: "" });
  const partnerInputRef = useRef<HTMLInputElement>(null);
  const purposeInputRef = useRef<HTMLTextAreaElement>(null);
  const [route, setRoute] = useState<RouteCheckpoint[]>([]);
  const [inputValues, setInputValues] = useState<{ km: string; time: string }[]>([]);

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
    // Route aus Termin: Start, optionale Zwischenhalte, Ziel
    // Annahme: apt.route = [{ location: string }] (falls vorhanden), sonst nur Start/Ziel
    let checkpoints: RouteCheckpoint[] = [];
    if (Array.isArray(apt.route) && apt.route.length > 0) {
      checkpoints = apt.route.map((r: any) => ({ location: r.location, km: "", time: "" }));
    } else {
      checkpoints = [
        { location: apt.startLocation || "", km: "", time: "" },
        { location: apt.endLocation || "", km: "", time: "" }
      ];
    }
    setRoute(checkpoints);
    setInputValues(checkpoints.map(() => ({ km: "", time: "" })));
    setTripData({
      ...tripData,
      purpose: apt.purpose || "",
      isStarted: true,
      startTime: apt.time || "",
      endTime: ""
    });
    setShowAppointmentSelect(false);
  };

  const handleInputChange = (idx: number, field: 'km' | 'time', value: string) => {
    setInputValues(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  };

  const handleAddCheckpoint = () => {
    if (!newCheckpoint.location.trim() || !newCheckpoint.km.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTripData(prev => ({
      ...prev,
      checkpoints: [...prev.checkpoints, { ...newCheckpoint, time }]
    }));
    setNewCheckpoint({ location: "", km: "" });
  };

  const handleRemoveCheckpoint = (idx: number) => {
    setTripData(prev => ({
      ...prev,
      checkpoints: prev.checkpoints.filter((_, i) => i !== idx)
    }));
  };

  const handleStartTrip = () => {
    const now = new Date();
    const startTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTripData({
      ...tripData,
      isStarted: true,
      startTime,
      checkpoints: tripData.checkpoints.length === 0 ? [] : tripData.checkpoints,
    });
    setShowAppointmentSelect(false);
  };

  const handleEndTrip = async () => {
    setError("");
    // Validierung: alle km und time müssen ausgefüllt sein
    if (inputValues.some(v => !v.km.trim() || !v.time.trim())) {
      setError("Bitte für alle Punkte Kilometerstand und Uhrzeit eintragen.");
      return;
    }
    if (!tripData.businessPartner) {
      setError("Bitte Geschäftspartner angeben.");
      return;
    }
    if (tripData.detour && !tripData.detourReason.trim()) {
      setError("Bitte geben Sie eine Begründung für den Umweg an.");
      return;
    }
    const startKm = parseInt(inputValues[0].km);
    const endKm = parseInt(inputValues[inputValues.length - 1].km);
    if (endKm <= startKm) {
      setError("End-Kilometerstand muss höher als Start-Kilometerstand sein");
      return;
    }
    const now = new Date();
    const endTime = inputValues[inputValues.length - 1].time;
    const trip = {
      driverId: user.id,
      driverName: user.name,
      date: new Date().toISOString(),
      startKm: startKm,
      endKm: endKm,
      totalDistance: endKm - startKm,
      startLocation: route[0].location,
      endLocation: route[route.length - 1].location,
      purpose: tripData.purpose,
      status: 'completed',
      startTime: inputValues[0].time,
      endTime: endTime,
      businessPartner: tripData.businessPartner,
      detourReason: tripData.detour ? tripData.detourReason : null,
      checkpoints: route.map((r, i) => ({ location: r.location, km: inputValues[i].km, time: inputValues[i].time }))
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
          checkpoints: [],
          purpose: "",
          isStarted: false,
          isCompleted: false,
          startTime: "",
          endTime: "",
          businessPartner: "",
          detour: false,
          detourReason: ""
        });
        setRoute([]);
        setInputValues([]);
      }, 2000);
      saveFavorite('partner', tripData.businessPartner);
    } catch (e) {
      alert('Fehler beim Speichern der Fahrt');
    }
  };

  const handleReset = () => {
    setTripData({
      checkpoints: [],
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
                  <Label htmlFor="checkpointKm">
                    Start Kilometerstand
                    <span title="Pflichtfeld. Muss exakt mit dem Tacho übereinstimmen." className="inline-block align-middle ml-1 text-blue-500 cursor-help">
                      <Info className="inline h-4 w-4" />
                    </span>
                  </Label>
                  <Input
                    id="checkpointKm"
                    type="number"
                    value={newCheckpoint.km}
                    onChange={(e) => setNewCheckpoint({ ...newCheckpoint, km: e.target.value })}
                    placeholder="z.B. 50000"
                  />
                </div>
                <div>
                  <Label htmlFor="checkpointLocation">Startort</Label>
                  <Input
                    id="checkpointLocation"
                    value={newCheckpoint.location}
                    onChange={(e) => setNewCheckpoint({ ...newCheckpoint, location: e.target.value })}
                    placeholder="z.B. Büro München"
                  />
                </div>
              </div>
              <Button onClick={handleAddCheckpoint} className="mt-2">Startpunkt hinzufügen</Button>
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
              {tripData.checkpoints.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold">Bisherige Checkpoints</h4>
                  <ul className="list-disc ml-6">
                    {tripData.checkpoints.map((cp, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        {cp.location} • {cp.km} km um {cp.time}
                        <Button size="sm" variant="ghost" onClick={() => handleRemoveCheckpoint(idx)} disabled={tripData.isStarted}>Entfernen</Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <h3 className="font-medium text-green-800">Fahrt gestartet</h3>
                <p className="text-sm text-green-600">
                  Start: {tripData.checkpoints[0]?.location} • {tripData.checkpoints[0]?.km} km um {tripData.startTime}
                </p>
                <p className="text-sm text-green-600">
                  Zweck: {tripData.purpose}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkpointKm">
                    Nächster Checkpoint Kilometerstand
                    <span title="Pflichtfeld. Muss exakt mit dem Tacho übereinstimmen." className="inline-block align-middle ml-1 text-blue-500 cursor-help">
                      <Info className="inline h-4 w-4" />
                    </span>
                  </Label>
                  <Input
                    id="checkpointKm"
                    type="number"
                    value={newCheckpoint.km}
                    onChange={(e) => setNewCheckpoint({ ...newCheckpoint, km: e.target.value })}
                    placeholder="z.B. 50100"
                  />
                </div>
                <div>
                  <Label htmlFor="checkpointLocation">Checkpoint-Ort</Label>
                  <Input
                    id="checkpointLocation"
                    value={newCheckpoint.location}
                    onChange={(e) => setNewCheckpoint({ ...newCheckpoint, location: e.target.value })}
                    placeholder="z.B. Zwischenstopp, Zielort"
                  />
                </div>
              </div>
              <Button onClick={handleAddCheckpoint} className="mt-2">Checkpoint hinzufügen</Button>
              <div className="mt-4">
                <h4 className="font-semibold">Bisherige Checkpoints</h4>
                <ol className="space-y-4">
                  {route.map((cp, idx) => (
                    <li key={idx} className="border rounded-lg p-4 bg-gray-50">
                      <div className="font-bold text-lg">
                        {idx === 0 ? "Start" : idx === route.length - 1 ? "Ziel" : `Zwischenhalt ${idx}`}: {cp.location}
                      </div>
                      <div className="flex flex-col md:flex-row gap-4 mt-2">
                        <div>
                          <Label>Kilometerstand *</Label>
                          <Input
                            type="number"
                            value={inputValues[idx]?.km || ""}
                            onChange={e => handleInputChange(idx, 'km', e.target.value)}
                            placeholder="z.B. 50000"
                          />
                        </div>
                        <div>
                          <Label>Uhrzeit *</Label>
                          <Input
                            type="time"
                            value={inputValues[idx]?.time || ""}
                            onChange={e => handleInputChange(idx, 'time', e.target.value)}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
              <div className="flex gap-2 mt-4">
                <Button onClick={handleEndTrip} className="flex-1" disabled={inputValues.some(v => !v.km.trim() || !v.time.trim())}>
                  Fahrt abschließen
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
