const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcrypt');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const stream = require('stream');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Login-API
app.post('/api/login', async (req, res) => {
  try {
    const { role, name, employeeNumber, email, password } = req.body;

    if (role === 'driver') {
      // Fahrer-Login: Name + Personalnummer
      if (!name || !employeeNumber) {
        return res.status(400).json({ error: 'Name und Personalnummer erforderlich' });
      }
      const driver = await prisma.driver.findFirst({
        where: {
          name,
          employeeNumber,
          status: 'active',
        },
      });
      if (!driver) {
        return res.status(401).json({ error: 'Fahrer nicht gefunden oder inaktiv' });
      }
      return res.json({ id: driver.id, name: driver.name, role: 'driver' });
    }

    if (role === 'admin') {
      // Admin-Login: Email + Passwort
      if (!email || !password) {
        return res.status(400).json({ error: 'E-Mail und Passwort erforderlich' });
      }
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Admin nicht gefunden' });
      }
      console.log('Vergleiche:', password, user.password);
      const valid = await bcrypt.compare(password, user.password);
      console.log('Vergleichsergebnis:', valid);
      if (!valid) {
        return res.status(401).json({ error: 'Falsches Passwort' });
      }
      return res.json({ id: user.id, name: user.name, role: 'admin' });
    }

    return res.status(400).json({ error: 'Ungültige Rolle' });
  } catch (err) {
    console.error('Login-Fehler:', err);
    return res.status(500).json({ error: 'Serverfehler. Bitte versuchen Sie es später erneut.' });
  }
});

// Neue Fahrer-API
app.post('/api/drivers', async (req, res) => {
  try {
    const { name, employeeNumber, email } = req.body;
    if (!name || !employeeNumber) {
      return res.status(400).json({ error: 'Name und Personalnummer erforderlich' });
    }
    // Prüfen ob Personalnummer schon existiert
    const exists = await prisma.driver.findUnique({ where: { employeeNumber } });
    if (exists) {
      return res.status(409).json({ error: 'Personalnummer existiert bereits' });
    }
    const driver = await prisma.driver.create({
      data: {
        name,
        employeeNumber,
        status: 'active',
        createdAt: new Date(),
      },
    });
    res.json(driver);
  } catch (err) {
    console.error('Fahrer-Fehler:', err);
    res.status(500).json({ error: 'Serverfehler beim Anlegen des Fahrers' });
  }
});

// Fahrer-Liste
app.get('/api/drivers', async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(drivers);
  } catch (err) {
    console.error('Fahrer-Fehler:', err);
    res.status(500).json({ error: 'Serverfehler beim Laden der Fahrer' });
  }
});

// Neue Trip-API
app.post('/api/trips', async (req, res) => {
  try {
    const { driverId, driverName, date, time, startLocation, stations, endLocation, purpose, status, startKm, startTime, endKm, endTime, totalDistance, appointmentId, businessPartner, detourReason, changedBy } = req.body;
    if (!driverId || !driverName || !date || !startLocation || !endLocation || !purpose || !businessPartner) {
      return res.status(400).json({ error: 'Pflichtfelder fehlen (inkl. Geschäftspartner)' });
    }
    if (detourReason !== undefined && detourReason !== null && detourReason.trim() === "") {
      return res.status(400).json({ error: 'Umweg-Begründung muss angegeben werden, wenn Umweg gewählt wurde.' });
    }
    const trip = await prisma.trip.create({
      data: {
        driverId,
        driverName,
        date: new Date(date),
        time,
        startLocation,
        stations: stations || [],
        endLocation,
        purpose,
        status: status || 'completed',
        startKm: startKm ? Number(startKm) : null,
        startTime: startTime || null,
        endKm: endKm ? Number(endKm) : null,
        endTime: endTime || null,
        totalDistance: totalDistance ? Number(totalDistance) : null,
        appointmentId: appointmentId || null,
        createdAt: new Date(),
        businessPartner,
        detourReason: detourReason || null
      },
    });
    // Audit-Log anlegen
    await prisma.tripLog.create({
      data: {
        tripId: trip.id,
        driverId: trip.driverId,
        driverName: trip.driverName,
        date: trip.date,
        time: trip.time,
        startLocation: trip.startLocation,
        stations: trip.stations,
        endLocation: trip.endLocation,
        purpose: trip.purpose,
        businessPartner: trip.businessPartner,
        detourReason: trip.detourReason,
        status: trip.status,
        appointmentId: trip.appointmentId,
        startKm: trip.startKm,
        startTime: trip.startTime,
        endKm: trip.endKm,
        endTime: trip.endTime,
        totalDistance: trip.totalDistance,
        changedBy: changedBy || trip.driverId,
        changeType: 'create',
      }
    });
    res.json(trip);
  } catch (err) {
    console.error('Trip-Fehler:', err);
    res.status(500).json({ error: 'Serverfehler beim Anlegen der Fahrt' });
  }
});

app.get('/api/trips', async (req, res) => {
  try {
    const { driverId } = req.query;
    const where = driverId ? { driverId: String(driverId) } : {};
    const trips = await prisma.trip.findMany({ where, orderBy: { date: 'desc' } });
    res.json(trips);
  } catch (err) {
    console.error('Trip-Fehler:', err);
    res.status(500).json({ error: 'Serverfehler beim Laden der Fahrten' });
  }
});

// PATCH Trip (Änderung nur wenn nicht completed und innerhalb von 7 Tagen, Audit-Trail)
app.patch('/api/trips/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    // Aktuelle Fahrt laden
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      return res.status(404).json({ error: 'Fahrt nicht gefunden' });
    }
    if (trip.status === 'completed') {
      return res.status(403).json({ error: 'Abgeschlossene Fahrten können nicht mehr geändert werden.' });
    }
    // Fristenkontrolle: Änderung nur bis 7 Tage nach Fahrtende
    const now = new Date();
    const endDate = trip.endTime ? new Date(trip.date.toISOString().split('T')[0] + 'T' + trip.endTime) : trip.date;
    const diffDays = Math.floor((now - endDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 7) {
      return res.status(403).json({ error: 'Fahrten können nur bis spätestens 7 Tage nach Fahrtende geändert werden.' });
    }
    // Pflichtfelder prüfen
    if (!updateData.businessPartner) {
      return res.status(400).json({ error: 'Geschäftspartner ist Pflichtfeld.' });
    }
    if (updateData.detourReason !== undefined && updateData.detourReason !== null && updateData.detourReason.trim() === "") {
      return res.status(400).json({ error: 'Umweg-Begründung muss angegeben werden, wenn Umweg gewählt wurde.' });
    }
    // Alten Stand als Log speichern
    await prisma.tripLog.create({
      data: {
        tripId: trip.id,
        driverId: trip.driverId,
        driverName: trip.driverName,
        date: trip.date,
        time: trip.time,
        startLocation: trip.startLocation,
        stations: trip.stations,
        endLocation: trip.endLocation,
        purpose: trip.purpose,
        businessPartner: trip.businessPartner,
        detourReason: trip.detourReason,
        status: trip.status,
        appointmentId: trip.appointmentId,
        startKm: trip.startKm,
        startTime: trip.startTime,
        endKm: trip.endKm,
        endTime: trip.endTime,
        totalDistance: trip.totalDistance,
        changedBy: updateData.changedBy || trip.driverId,
        changeType: 'update',
      }
    });
    // Änderung durchführen
    const updated = await prisma.trip.update({
      where: { id },
      data: updateData
    });
    res.json(updated);
  } catch (err) {
    console.error('Trip-Update-Fehler:', err);
    res.status(500).json({ error: 'Serverfehler beim Ändern der Fahrt' });
  }
});

// DELETE Trip (nur wenn nicht completed und innerhalb von 7 Tagen, Audit-Trail)
app.delete('/api/trips/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { changedBy } = req.body;
    // Aktuelle Fahrt laden
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      return res.status(404).json({ error: 'Fahrt nicht gefunden' });
    }
    if (trip.status === 'completed') {
      return res.status(403).json({ error: 'Abgeschlossene Fahrten können nicht gelöscht werden.' });
    }
    // Fristenkontrolle: Löschung nur bis 7 Tage nach Fahrtende
    const now = new Date();
    const endDate = trip.endTime ? new Date(trip.date.toISOString().split('T')[0] + 'T' + trip.endTime) : trip.date;
    const diffDays = Math.floor((now - endDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 7) {
      return res.status(403).json({ error: 'Fahrten können nur bis spätestens 7 Tage nach Fahrtende gelöscht werden.' });
    }
    // Alten Stand als Log speichern
    await prisma.tripLog.create({
      data: {
        tripId: trip.id,
        driverId: trip.driverId,
        driverName: trip.driverName,
        date: trip.date,
        time: trip.time,
        startLocation: trip.startLocation,
        stations: trip.stations,
        endLocation: trip.endLocation,
        purpose: trip.purpose,
        businessPartner: trip.businessPartner,
        detourReason: trip.detourReason,
        status: trip.status,
        appointmentId: trip.appointmentId,
        startKm: trip.startKm,
        startTime: trip.startTime,
        endKm: trip.endKm,
        endTime: trip.endTime,
        totalDistance: trip.totalDistance,
        changedBy: changedBy || trip.driverId,
        changeType: 'delete',
      }
    });
    // Fahrt löschen
    await prisma.trip.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Trip-Delete-Fehler:', err);
    res.status(500).json({ error: 'Serverfehler beim Löschen der Fahrt' });
  }
});

// Neue Appointment-API
app.post('/api/appointments', async (req, res) => {
  try {
    console.log('POST /api/appointments body:', req.body);
    const { driverId, driverName, date, time, startLocation, stations, endLocation, purpose, status } = req.body;
    if (!driverId || !driverName || !date || !startLocation || !endLocation || !purpose) {
      return res.status(400).json({ error: 'Pflichtfelder fehlen' });
    }
    const appointment = await prisma.appointment.create({
      data: {
        driverId,
        driverName,
        date: new Date(date),
        time,
        startLocation,
        stations: stations || [],
        endLocation,
        purpose,
        status: status || 'pending',
        createdAt: new Date(),
      },
    });
    res.json(appointment);
  } catch (err) {
    console.error('Appointment-Fehler:', err);
    res.status(500).json({ error: 'Serverfehler beim Anlegen des Termins' });
  }
});

app.get('/api/appointments', async (req, res) => {
  try {
    const { driverId } = req.query;
    const where = driverId ? { driverId: String(driverId) } : {};
    const appointments = await prisma.appointment.findMany({ where, orderBy: { date: 'desc' } });
    res.json(appointments);
  } catch (err) {
    console.error('Appointment-Fehler:', err);
    res.status(500).json({ error: 'Serverfehler beim Laden der Termine' });
  }
});

// PATCH Appointment-Status
app.patch('/api/appointments/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    if (!status || !['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Ungültiger Status' });
    }
    const updated = await prisma.appointment.update({
      where: { id },
      data: { status },
    });
    res.json(updated);
  } catch (err) {
    console.error('Appointment-Update-Fehler:', err);
    res.status(500).json({ error: 'Serverfehler beim Aktualisieren des Termins' });
  }
});

// DELETE Appointment
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.appointment.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Appointment-Delete-Fehler:', err);
    res.status(500).json({ error: 'Serverfehler beim Löschen des Termins' });
  }
});

// CSV-Export aller Fahrten (inkl. Audit-Trail)
app.get('/api/trips/export/csv', async (req, res) => {
  try {
    const { driverId, from, to } = req.query;
    const where = {};
    if (driverId) where.driverId = driverId;
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }
    // Alle Fahrten laden
    const trips = await prisma.trip.findMany({
      where,
      orderBy: { date: 'asc' },
      include: { logs: true }
    });
    // CSV-Felder
    const fields = [
      'id', 'driverName', 'date', 'time', 'startLocation', 'endLocation', 'purpose', 'businessPartner', 'detourReason',
      'startKm', 'endKm', 'totalDistance', 'startTime', 'endTime', 'status',
      'createdAt'
    ];
    // Audit-Trail als separate Spalte
    const auditFields = ['logs'];
    const data = trips.map(trip => ({
      ...trip,
      date: trip.date.toISOString().split('T')[0],
      createdAt: trip.createdAt.toISOString(),
      logs: trip.logs.map(log => `${log.changeType} (${log.changedBy} @ ${log.createdAt.toISOString()})`).join('; ')
    }));
    const parser = new Parser({ fields: [...fields, ...auditFields] });
    const csv = parser.parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment('fahrtenbuch.csv');
    res.send(csv);
  } catch (err) {
    console.error('CSV-Export-Fehler:', err);
    res.status(500).json({ error: 'Fehler beim CSV-Export' });
  }
});

// PDF-Export aller Fahrten (inkl. Audit-Trail)
app.get('/api/trips/export/pdf', async (req, res) => {
  try {
    const { driverId, from, to } = req.query;
    const where = {};
    if (driverId) where.driverId = driverId;
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }
    const trips = await prisma.trip.findMany({
      where,
      orderBy: { date: 'asc' },
      include: { logs: true }
    });
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const pass = new stream.PassThrough();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=fahrtenbuch.pdf');
    doc.pipe(pass);
    doc.fontSize(18).text('Fahrtenbuch Export', { align: 'center' });
    doc.moveDown();
    trips.forEach((trip, idx) => {
      doc.fontSize(12).text(`Fahrt #${idx + 1}`);
      doc.text(`Datum: ${trip.date.toISOString().split('T')[0]}`);
      doc.text(`Fahrer: ${trip.driverName}`);
      doc.text(`Start: ${trip.startLocation} (${trip.startKm} km) um ${trip.startTime}`);
      doc.text(`Ziel: ${trip.endLocation} (${trip.endKm} km) um ${trip.endTime}`);
      doc.text(`Zweck: ${trip.purpose}`);
      doc.text(`Geschäftspartner: ${trip.businessPartner}`);
      if (trip.detourReason) doc.text(`Umweg/Begründung: ${trip.detourReason}`);
      doc.text(`Status: ${trip.status}`);
      doc.text(`Erstellt am: ${trip.createdAt.toISOString()}`);
      doc.text(`Audit-Trail: ${trip.logs.map(log => `${log.changeType} (${log.changedBy} @ ${log.createdAt.toISOString()})`).join('; ')}`);
      doc.moveDown();
      doc.moveDown();
    });
    doc.end();
    pass.pipe(res);
  } catch (err) {
    console.error('PDF-Export-Fehler:', err);
    res.status(500).json({ error: 'Fehler beim PDF-Export' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend listening on port ${PORT}`);
});

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
}); 