
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { User } from "@/pages/Index";

interface ReportsProps {
  user: User;
}

export const Reports = ({ user }: ReportsProps) => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Berichte</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Monatsübersicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Detaillierte Übersicht aller Fahrten des aktuellen Monats
            </p>
            <Button className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              PDF erstellen
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Fahrerübersicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Kilometerleistung und Fahrten pro Fahrer
            </p>
            <Button className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              PDF erstellen
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Jahresbericht
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Vollständiger Jahresbericht für Steuerzwecke
            </p>
            <Button className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              PDF erstellen
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Kostenauswertung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Detaillierte Kostenaufstellung nach Fahrten
            </p>
            <Button className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              PDF erstellen
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
