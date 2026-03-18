import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const templates = await prisma.emailTemplate.findMany({ orderBy: { type: 'asc' } });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!template) return res.status(404).json({ fout: 'Template niet gevonden' });
    res.json(template);
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { naam, onderwerp, inhoud } = req.body;
    const template = await prisma.emailTemplate.update({
      where: { id: parseInt(req.params.id) },
      data: { naam, onderwerp, inhoud, bijgewerktOp: new Date() },
    });
    res.json(template);
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

export default router;
