import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { testEmailVerbinding } from '../services/emailService.js';

const router = Router();
const prisma = new PrismaClient();

// Haal alle instellingen op als object
router.get('/', async (req, res) => {
  try {
    const rijen = await prisma.instelling.findMany();
    const instellingen = {};
    for (const rij of rijen) {
      instellingen[rij.sleutel] = rij.waarde;
    }
    // Verberg wachtwoord in response
    if (instellingen['smtp_wachtwoord']) {
      instellingen['smtp_wachtwoord'] = '••••••••';
    }
    res.json(instellingen);
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

// Sla instellingen op (meerdere tegelijk)
router.put('/', async (req, res) => {
  try {
    const updates = req.body;
    for (const [sleutel, waarde] of Object.entries(updates)) {
      // Sla lege wachtwoorden niet op (behoudt het bestaande wachtwoord)
      if (sleutel === 'smtp_wachtwoord' && waarde === '••••••••') continue;
      await prisma.instelling.upsert({
        where: { sleutel },
        update: { waarde: String(waarde) },
        create: { sleutel, waarde: String(waarde) },
      });
    }
    res.json({ succes: true });
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

// Test e-mailverbinding
router.post('/test-email', async (req, res) => {
  try {
    const rijen = await prisma.instelling.findMany();
    const instellingen = {};
    for (const rij of rijen) {
      instellingen[rij.sleutel] = rij.waarde;
    }
    await testEmailVerbinding(instellingen);
    res.json({ succes: true, bericht: 'Test e-mail verstuurd! Controleer je inbox.' });
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

export default router;
