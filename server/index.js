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
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Falsches Passwort' });
    }
    return res.json({ id: user.id, name: user.name, role: 'admin' });
  }

  return res.status(400).json({ error: 'Ungültige Rolle' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
}); 