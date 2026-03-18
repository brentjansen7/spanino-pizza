import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Lijst alle klanten
router.get('/', async (req, res) => {
  try {
    const klanten = await prisma.klant.findMany({
      orderBy: { naam: 'asc' },
      include: { _count: { select: { facturen: true } } },
    });
    res.json(klanten);
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

// Haal één klant op
router.get('/:id', async (req, res) => {
  try {
    const klant = await prisma.klant.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        facturen: {
          orderBy: { aangemaaktOp: 'desc' },
          include: { regels: true },
        },
      },
    });
    if (!klant) return res.status(404).json({ fout: 'Klant niet gevonden' });
    res.json(klant);
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

// Maak nieuwe klant aan
router.post('/', async (req, res) => {
  try {
    const { naam, email, telefoon, adres, stad, postcode, notities } = req.body;
    if (!naam) return res.status(400).json({ fout: 'Naam is verplicht' });
    const klant = await prisma.klant.create({
      data: { naam, email, telefoon, adres, stad, postcode, notities },
    });
    res.status(201).json(klant);
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

// Bewerk klant
router.put('/:id', async (req, res) => {
  try {
    const { naam, email, telefoon, adres, stad, postcode, notities } = req.body;
    const klant = await prisma.klant.update({
      where: { id: parseInt(req.params.id) },
      data: { naam, email, telefoon, adres, stad, postcode, notities },
    });
    res.json(klant);
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

// Verwijder klant
router.delete('/:id', async (req, res) => {
  try {
    await prisma.klant.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ succes: true });
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

export default router;
