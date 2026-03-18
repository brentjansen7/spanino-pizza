import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { genereerFactuurPDF } from '../services/pdfService.js';
import { verstuurFactuurEmail } from '../services/emailService.js';
import { vervangVariabelen } from '../services/templateService.js';

const router = Router();
const prisma = new PrismaClient();

// Genereer factuurnummer (bijv. 2026-001)
async function genereerFactuurNummer() {
  const jaar = new Date().getFullYear();
  const prefix = `${jaar}-`;
  const laatste = await prisma.factuur.findFirst({
    where: { factuurNummer: { startsWith: prefix } },
    orderBy: { factuurNummer: 'desc' },
  });
  if (!laatste) return `${prefix}001`;
  const volgNummer = parseInt(laatste.factuurNummer.split('-')[1]) + 1;
  return `${prefix}${String(volgNummer).padStart(3, '0')}`;
}

// Lijst alle facturen
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const facturen = await prisma.factuur.findMany({
      where: status ? { status } : undefined,
      orderBy: { aangemaaktOp: 'desc' },
      include: {
        klant: true,
        regels: true,
      },
    });
    res.json(facturen);
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

// Haal één factuur op
router.get('/:id', async (req, res) => {
  try {
    const factuur = await prisma.factuur.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { klant: true, regels: { orderBy: { volgorde: 'asc' } } },
    });
    if (!factuur) return res.status(404).json({ fout: 'Factuur niet gevonden' });
    res.json(factuur);
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

// Maak nieuwe factuur aan
router.post('/', async (req, res) => {
  try {
    const { klantId, vervaldatum, btwPercentage, notities, regels } = req.body;
    if (!klantId) return res.status(400).json({ fout: 'Klant is verplicht' });
    if (!regels || regels.length === 0) return res.status(400).json({ fout: 'Minimaal één regelitem vereist' });

    const factuurNummer = await genereerFactuurNummer();

    const factuur = await prisma.factuur.create({
      data: {
        factuurNummer,
        klantId: parseInt(klantId),
        vervaldatum: vervaldatum ? new Date(vervaldatum) : null,
        btwPercentage: btwPercentage ? parseFloat(btwPercentage) : 21.0,
        notities,
        regels: {
          create: regels.map((r, i) => ({
            omschrijving: r.omschrijving,
            aantal: parseFloat(r.aantal),
            eenheidsprijs: parseFloat(r.eenheidsprijs),
            volgorde: i,
          })),
        },
      },
      include: { klant: true, regels: true },
    });

    res.status(201).json(factuur);
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

// Bewerk factuur
router.put('/:id', async (req, res) => {
  try {
    const { klantId, vervaldatum, btwPercentage, notities, status, regels } = req.body;

    // Verwijder bestaande regels en vervang ze
    await prisma.factuurRegel.deleteMany({ where: { factuurId: parseInt(req.params.id) } });

    const factuur = await prisma.factuur.update({
      where: { id: parseInt(req.params.id) },
      data: {
        klantId: klantId ? parseInt(klantId) : undefined,
        vervaldatum: vervaldatum ? new Date(vervaldatum) : null,
        btwPercentage: btwPercentage ? parseFloat(btwPercentage) : undefined,
        notities,
        status,
        regels: regels
          ? {
              create: regels.map((r, i) => ({
                omschrijving: r.omschrijving,
                aantal: parseFloat(r.aantal),
                eenheidsprijs: parseFloat(r.eenheidsprijs),
                volgorde: i,
              })),
            }
          : undefined,
      },
      include: { klant: true, regels: { orderBy: { volgorde: 'asc' } } },
    });

    res.json(factuur);
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

// Verwijder factuur
router.delete('/:id', async (req, res) => {
  try {
    await prisma.factuur.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ succes: true });
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

// Genereer PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    const factuur = await prisma.factuur.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { klant: true, regels: { orderBy: { volgorde: 'asc' } } },
    });
    if (!factuur) return res.status(404).json({ fout: 'Factuur niet gevonden' });

    const rijen = await prisma.instelling.findMany();
    const instellingen = {};
    for (const rij of rijen) instellingen[rij.sleutel] = rij.waarde;

    const pdfBuffer = await genereerFactuurPDF(factuur, factuur.klant, instellingen);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=factuur-${factuur.factuurNummer}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

// Preview factuur e-mail
router.get('/:id/preview-email', async (req, res) => {
  try {
    const factuur = await prisma.factuur.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { klant: true, regels: true },
    });
    if (!factuur) return res.status(404).json({ fout: 'Factuur niet gevonden' });

    const template = await prisma.emailTemplate.findFirst({ where: { type: 'factuur' } });
    if (!template) return res.status(404).json({ fout: 'Factuur e-mailtemplate niet gevonden' });

    const rijen = await prisma.instelling.findMany();
    const instellingen = {};
    for (const rij of rijen) instellingen[rij.sleutel] = rij.waarde;

    const subtotaal = factuur.regels.reduce((s, r) => s + r.aantal * r.eenheidsprijs, 0);
    const btw = subtotaal * (factuur.btwPercentage / 100);
    const totaal = subtotaal + btw;

    const variabelen = {
      klant_naam: factuur.klant.naam,
      factuur_nummer: factuur.factuurNummer,
      vervaldatum: factuur.vervaldatum
        ? new Intl.DateTimeFormat('nl-NL').format(new Date(factuur.vervaldatum))
        : '',
      totaal_bedrag: new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(totaal),
      restaurant_naam: instellingen['restaurant_naam'] || 'Spanino Pizza',
    };

    res.json({
      aan: factuur.klant.email,
      onderwerp: vervangVariabelen(template.onderwerp, variabelen),
      inhoud: vervangVariabelen(template.inhoud, variabelen),
    });
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

// Verstuur factuur per e-mail
router.post('/:id/verstuur-email', async (req, res) => {
  try {
    const factuur = await prisma.factuur.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { klant: true, regels: { orderBy: { volgorde: 'asc' } } },
    });
    if (!factuur) return res.status(404).json({ fout: 'Factuur niet gevonden' });
    if (!factuur.klant.email) return res.status(400).json({ fout: 'Klant heeft geen e-mailadres' });

    const template = await prisma.emailTemplate.findFirst({ where: { type: 'factuur' } });
    if (!template) return res.status(404).json({ fout: 'Factuur e-mailtemplate niet gevonden' });

    const rijen = await prisma.instelling.findMany();
    const instellingen = {};
    for (const rij of rijen) instellingen[rij.sleutel] = rij.waarde;

    const pdfBuffer = await genereerFactuurPDF(factuur, factuur.klant, instellingen);
    await verstuurFactuurEmail(factuur, factuur.klant, template, pdfBuffer, instellingen);

    await prisma.factuur.update({
      where: { id: factuur.id },
      data: { status: 'verstuurd', verstuurdOp: new Date() },
    });

    res.json({ succes: true, bericht: `Factuur verstuurd naar ${factuur.klant.email}` });
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

// Markeer als betaald
router.post('/:id/markeer-betaald', async (req, res) => {
  try {
    const factuur = await prisma.factuur.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'betaald', betaaldOp: new Date() },
    });
    res.json(factuur);
  } catch (err) {
    res.status(500).json({ fout: err.message });
  }
});

export default router;
