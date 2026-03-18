import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Genereert een factuur PDF als Buffer
 */
export function genereerFactuurPDF(factuur, klant, instellingen) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const restaurantNaam = instellingen['restaurant_naam'] || 'Spanino Pizza';
    const restaurantAdres = instellingen['restaurant_adres'] || '';
    const restaurantStad = instellingen['restaurant_stad'] || '';
    const restaurantPostcode = instellingen['restaurant_postcode'] || '';
    const restaurantTelefoon = instellingen['restaurant_telefoon'] || '';
    const restaurantEmail = instellingen['smtp_gebruiker'] || '';
    const restaurantKvk = instellingen['restaurant_kvk'] || '';
    const restaurantBtw = instellingen['restaurant_btw'] || '';
    const restaurantIban = instellingen['restaurant_iban'] || '';

    const logoPath = instellingen['logo_pad'];

    // === HEADER ===
    const headerY = 50;

    // Logo (links) als het bestaat
    if (logoPath && fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, 50, headerY, { width: 100 });
      } catch (e) {
        // Logo kon niet geladen worden, ga door zonder
      }
    }

    // Restaurant info (rechts)
    doc.fontSize(10).fillColor('#333333');
    doc.text(restaurantNaam, 350, headerY, { width: 200, align: 'right' });
    if (restaurantAdres) doc.text(restaurantAdres, 350, doc.y, { width: 200, align: 'right' });
    if (restaurantPostcode || restaurantStad)
      doc.text(`${restaurantPostcode} ${restaurantStad}`.trim(), 350, doc.y, { width: 200, align: 'right' });
    if (restaurantTelefoon) doc.text(`Tel: ${restaurantTelefoon}`, 350, doc.y, { width: 200, align: 'right' });
    if (restaurantEmail) doc.text(restaurantEmail, 350, doc.y, { width: 200, align: 'right' });

    // === FACTUUR TITEL ===
    doc.moveDown(3);
    doc.fontSize(22).fillColor('#e63946').font('Helvetica-Bold').text('FACTUUR', 50, 180);
    doc.fontSize(10).fillColor('#555555').font('Helvetica');

    const aangemaakt = new Intl.DateTimeFormat('nl-NL').format(new Date(factuur.aangemaaktOp || new Date()));
    const vervaldatum = factuur.vervaldatum
      ? new Intl.DateTimeFormat('nl-NL').format(new Date(factuur.vervaldatum))
      : 'Niet opgegeven';

    doc.text(`Factuurnummer: ${factuur.factuurNummer}`, 50, 215);
    doc.text(`Datum: ${aangemaakt}`);
    doc.text(`Vervaldatum: ${vervaldatum}`);

    // === KLANTGEGEVENS ===
    doc.moveDown(1);
    doc.fontSize(10).fillColor('#333333').font('Helvetica-Bold').text('Factuur aan:');
    doc.font('Helvetica').fillColor('#555555');
    doc.text(klant.naam);
    if (klant.adres) doc.text(klant.adres);
    if (klant.postcode || klant.stad) doc.text(`${klant.postcode || ''} ${klant.stad || ''}`.trim());
    if (klant.email) doc.text(klant.email);
    if (klant.telefoon) doc.text(klant.telefoon);

    // === HORIZONTALE LIJN ===
    doc.moveDown(1.5);
    const lijny = doc.y;
    doc.moveTo(50, lijny).lineTo(545, lijny).strokeColor('#e63946').lineWidth(2).stroke();
    doc.moveDown(0.5);

    // === TABELHEADER ===
    const col1 = 50;   // Omschrijving
    const col2 = 320;  // Aantal
    const col3 = 390;  // Prijs
    const col4 = 460;  // Totaal

    doc.fontSize(9).fillColor('#333333').font('Helvetica-Bold');
    doc.text('Omschrijving', col1, doc.y);
    doc.text('Aantal', col2, doc.y - doc.currentLineHeight(), { width: 65, align: 'right' });
    doc.text('Prijs', col3, doc.y - doc.currentLineHeight(), { width: 65, align: 'right' });
    doc.text('Totaal', col4, doc.y - doc.currentLineHeight(), { width: 85, align: 'right' });

    doc.moveDown(0.3);
    const lijnY2 = doc.y;
    doc.moveTo(50, lijnY2).lineTo(545, lijnY2).strokeColor('#cccccc').lineWidth(1).stroke();
    doc.moveDown(0.3);

    // === REGELITEMS ===
    doc.font('Helvetica').fillColor('#555555').fontSize(9);
    let subtotaal = 0;

    const sorteerdeRegels = [...(factuur.regels || [])].sort((a, b) => a.volgorde - b.volgorde);

    for (const regel of sorteerdeRegels) {
      const regelTotaal = regel.aantal * regel.eenheidsprijs;
      subtotaal += regelTotaal;

      const regelY = doc.y;
      doc.text(regel.omschrijving, col1, regelY, { width: 260 });
      doc.text(String(regel.aantal), col2, regelY, { width: 65, align: 'right' });
      doc.text(formateerBedrag(regel.eenheidsprijs), col3, regelY, { width: 65, align: 'right' });
      doc.text(formateerBedrag(regelTotaal), col4, regelY, { width: 85, align: 'right' });
      doc.moveDown(0.2);
    }

    // === TOTALEN ===
    doc.moveDown(0.5);
    const totaalLijnY = doc.y;
    doc.moveTo(50, totaalLijnY).lineTo(545, totaalLijnY).strokeColor('#cccccc').lineWidth(1).stroke();
    doc.moveDown(0.5);

    const btw = subtotaal * (factuur.btwPercentage / 100);
    const totaal = subtotaal + btw;

    doc.fontSize(9);

    // Subtotaal
    const subY = doc.y;
    doc.fillColor('#555555').text('Subtotaal:', col3, subY, { width: 65, align: 'right' });
    doc.text(formateerBedrag(subtotaal), col4, subY, { width: 85, align: 'right' });
    doc.moveDown(0.3);

    // BTW
    const btwY = doc.y;
    doc.text(`BTW (${factuur.btwPercentage}%):`, col3, btwY, { width: 65, align: 'right' });
    doc.text(formateerBedrag(btw), col4, btwY, { width: 85, align: 'right' });
    doc.moveDown(0.3);

    // Totaal
    const totaalY = doc.y;
    doc.font('Helvetica-Bold').fillColor('#333333').fontSize(10);
    doc.text('Totaal:', col3, totaalY, { width: 65, align: 'right' });
    doc.text(formateerBedrag(totaal), col4, totaalY, { width: 85, align: 'right' });

    // === BETALINGSINFORMATIE ===
    doc.moveDown(3);
    doc.fontSize(9).fillColor('#555555').font('Helvetica');

    if (restaurantIban) {
      doc.font('Helvetica-Bold').fillColor('#333333').text('Betalingsinformatie:');
      doc.font('Helvetica').fillColor('#555555');
      doc.text(`Gelieve het bedrag van ${formateerBedrag(totaal)} over te maken naar:`);
      doc.text(`IBAN: ${restaurantIban}`);
      doc.text(`T.n.v.: ${restaurantNaam}`);
      if (factuur.vervaldatum) {
        doc.text(`Voor: ${vervaldatum}`);
      }
      doc.text(`Onder vermelding van factuurnummer: ${factuur.factuurNummer}`);
    }

    if (restaurantKvk) doc.text(`KvK: ${restaurantKvk}`);
    if (restaurantBtw) doc.text(`BTW-nummer: ${restaurantBtw}`);

    if (factuur.notities) {
      doc.moveDown(1);
      doc.font('Helvetica-Bold').fillColor('#333333').text('Notities:');
      doc.font('Helvetica').fillColor('#555555').text(factuur.notities);
    }

    doc.end();
  });
}

function formateerBedrag(bedrag) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(bedrag);
}
