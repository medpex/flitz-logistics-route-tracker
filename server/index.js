const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcrypt');

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
    const { driverId, driverName, date, time, startLocation, stations, endLocation, purpose, status, startKm, startTime, endKm, endTime, totalDistance, appointmentId } = req.body;
    if (!driverId || !driverName || !date || !startLocation || !endLocation || !purpose) {
      return res.status(400).json({ error: 'Pflichtfelder fehlen' });
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
      },
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

// Neue Appointment-API
app.post('/api/appointments', async (req, res) => {
  try {
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