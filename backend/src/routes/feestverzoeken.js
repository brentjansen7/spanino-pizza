import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { verstuurFeestverzoekEmail } from '../services/emailService.js';
import { vervangVariabelen } from '../services/templateService.js';

const router = Router();
const prisma = new PrismaClient();

// Lijst alle feestverzoeken
router.get('/', async (req, res) => {
  try {
    const verzoeken = await prisma.feestverzoek.findMany({
      orderBy: { aangemaaktOp: 'desc' },
    });
    res.json(verzoeken);
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

// Haal één feestverzoek op
router.get('/:id', async (req, res) => {
  try {
    const verzoek = await prisma.feestverzoek.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!verzoek) return res.status(404).json({ fout: 'Feestverzoek niet gevonden' });
    res.json(verzoek);
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

// Maak nieuw feestverzoek aan
router.post('/', async (req, res) => {
  try {
    const { naam, email, telefoon, datumEvenement, aantalPersonen, typeEvenement, bericht } = req.body;
    if (!naam || !email) return res.status(400).json({ fout: 'Naam en e-mail zijn verplicht' });
    const verzoek = await prisma.feestverzoek.create({
      data: {
        naam,
        email,
        telefoon,
        datumEvenement: datumEvenement ? new Date(datumEvenement) : null,
        aantalPersonen: aantalPersonen ? parseInt(aantalPersonen) : null,
        typeEvenement,
        bericht,
      },
    });
    res.status(201).json(verzoek);
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

// Bewerk feestverzoek
router.put('/:id', async (req, res) => {
  try {
    const { naam, email, telefoon, datumEvenement, aantalPersonen, typeEvenement, bericht, status } = req.body;
    const verzoek = await prisma.feestverzoek.update({
      where: { id: parseInt(req.params.id) },
      data: {
        naam,
        email,
        telefoon,
        datumEvenement: datumEvenement ? new Date(datumEvenement) : null,
        aantalPersonen: aantalPersonen ? parseInt(aantalPersonen) : null,
        typeEvenement,
        bericht,
        status,
      },
    });
    res.json(verzoek);
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

// Verwijder feestverzoek
router.delete('/:id', async (req, res) => {
  try {
    await prisma.feestverzoek.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ succes: true });
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

// Preview e-mail (zonder versturen)
router.post('/:id/preview-email', async (req, res) => {
  try {
    const verzoek = await prisma.feestverzoek.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!verzoek) return res.status(404).json({ fout: 'Feestverzoek niet gevonden' });

    const template = await prisma.emailTemplate.findFirst({ where: { type: 'feest' } });
    if (!template) return res.status(404).json({ fout: 'Feest e-mailtemplate niet gevonden' });

    const rijen = await prisma.instelling.findMany();
    const instellingen = {};
    for (const rij of rijen) instellingen[rij.sleutel] = rij.waarde;

    const variabelen = {
      naam: verzoek.naam,
      email: verzoek.email,
      datum_evenement: verzoek.datumEvenement
        ? new Intl.DateTimeFormat('nl-NL').format(new Date(verzoek.datumEvenement))
        : '',
      aantal_personen: verzoek.aantalPersonen || '',
      type_evenement: verzoek.typeEvenement || '',
      restaurant_naam: instellingen['restaurant_naam'] || 'Spanino Pizza',
      restaurant_telefoon: instellingen['restaurant_telefoon'] || '',
      restaurant_email: instellingen['smtp_gebruiker'] || '',
    };

    res.json({
      aan: verzoek.email,
      onderwerp: vervangVariabelen(template.onderwerp, variabelen),
      inhoud: vervangVariabelen(template.inhoud, variabelen),
    });
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

// Verstuur standaard e-mail
router.post('/:id/verstuur-email', async (req, res) => {
  try {
    const verzoek = await prisma.feestverzoek.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!verzoek) return res.status(404).json({ fout: 'Feestverzoek niet gevonden' });

    const template = await prisma.emailTemplate.findFirst({ where: { type: 'feest' } });
    if (!template) return res.status(404).json({ fout: 'Feest e-mailtemplate niet gevonden' });

    const rijen = await prisma.instelling.findMany();
    const instellingen = {};
    for (const rij of rijen) instellingen[rij.sleutel] = rij.waarde;

    await verstuurFeestverzoekEmail(verzoek, template, instellingen);

    await prisma.feestverzoek.update({
      where: { id: verzoek.id },
      data: { status: 'beantwoord', emailVerstuurdOp: new Date() },
    });

    res.json({ succes: true, bericht: `E-mail verstuurd naar ${verzoek.email}` });
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

export default router;
