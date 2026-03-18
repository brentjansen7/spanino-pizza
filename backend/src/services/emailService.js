import nodemailer from 'nodemailer';
import { vervangVariabelen } from './templateService.js';

/**
 * Maakt een Nodemailer transporter op basis van SMTP-instellingen uit de database
 */
function maakTransporter(instellingen) {
  const smtpHost = instellingen['smtp_host'] || 'smtp.gmail.com';
  const smtpPort = parseInt(instellingen['smtp_port'] || '587');
  const smtpGebruiker = instellingen['smtp_gebruiker'];
  const smtpWachtwoord = instellingen['smtp_wachtwoord'];

  if (!smtpGebruiker || !smtpWachtwoord) {
    throw new Error('SMTP-instellingen zijn niet geconfigureerd. Vul je e-mailinstellingen in bij Instellingen.');
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpGebruiker,
      pass: smtpWachtwoord,
    },
  });
}

/**
 * Verstuurt een e-mail
 * @param {Object} opties
 * @param {Object} instellingen - SMTP-instellingen uit de database
 * @param {string} opties.aan - Ontvanger e-mailadres
 * @param {string} opties.onderwerp - E-mail onderwerp
 * @param {string} opties.inhoud - E-mail inhoud (HTML)
 * @param {Buffer} [opties.bijlage] - Optionele PDF bijlage
 * @param {string} [opties.bijlageNaam] - Naam van de bijlage
 */
export async function verstuurEmail({ aan, onderwerp, inhoud, bijlage, bijlageNaam }, instellingen) {
  const transporter = maakTransporter(instellingen);
  const vanNaam = instellingen['restaurant_naam'] || 'Spanino Pizza';
  const vanEmail = instellingen['smtp_gebruiker'];

  const mailOpties = {
    from: `"${vanNaam}" <${vanEmail}>`,
    to: aan,
    subject: onderwerp,
    html: inhoud,
  };

  if (bijlage && bijlageNaam) {
    mailOpties.attachments = [
      {
        filename: bijlageNaam,
        content: bijlage,
        contentType: 'application/pdf',
      },
    ];
  }

  await transporter.sendMail(mailOpties);
}

/**
 * Test of de SMTP-verbinding werkt
 */
export async function testEmailVerbinding(instellingen) {
  const transporter = maakTransporter(instellingen);
  await transporter.verify();

  await verstuurEmail(
    {
      aan: instellingen['smtp_gebruiker'],
      onderwerp: 'Test e-mail van Spanino Pizza Beheer',
      inhoud: `<p>De e-mailverbinding werkt correct! Je kunt nu e-mails versturen vanuit de Spanino Pizza beheersoftware.</p>`,
    },
    instellingen
  );
}

/**
 * Verstuurt een feestverzoek antwoord e-mail
 */
export async function verstuurFeestverzoekEmail(feestverzoek, template, instellingen) {
  const variabelen = {
    naam: feestverzoek.naam,
    email: feestverzoek.email,
    datum_evenement: feestverzoek.datumEvenement
      ? new Intl.DateTimeFormat('nl-NL').format(new Date(feestverzoek.datumEvenement))
      : '',
    aantal_personen: feestverzoek.aantalPersonen || '',
    type_evenement: feestverzoek.typeEvenement || '',
    restaurant_naam: instellingen['restaurant_naam'] || 'Spanino Pizza',
    restaurant_telefoon: instellingen['restaurant_telefoon'] || '',
    restaurant_email: instellingen['smtp_gebruiker'] || '',
  };

  const onderwerp = vervangVariabelen(template.onderwerp, variabelen);
  const inhoud = vervangVariabelen(template.inhoud, variabelen);

  await verstuurEmail({ aan: feestverzoek.email, onderwerp, inhoud }, instellingen);
}

/**
 * Verstuurt een factuur per e-mail met PDF bijlage
 */
export async function verstuurFactuurEmail(factuur, klant, template, pdfBuffer, instellingen) {
  const subtotaal = factuur.regels.reduce((s, r) => s + r.aantal * r.eenheidsprijs, 0);
  const btw = subtotaal * (factuur.btwPercentage / 100);
  const totaal = subtotaal + btw;

  const variabelen = {
    klant_naam: klant.naam,
    factuur_nummer: factuur.factuurNummer,
    vervaldatum: factuur.vervaldatum
      ? new Intl.DateTimeFormat('nl-NL').format(new Date(factuur.vervaldatum))
      : '',
    totaal_bedrag: new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(totaal),
    restaurant_naam: instellingen['restaurant_naam'] || 'Spanino Pizza',
  };

  const onderwerp = vervangVariabelen(template.onderwerp, variabelen);
  const inhoud = vervangVariabelen(template.inhoud, variabelen);

  await verstuurEmail(
    {
      aan: klant.email,
      onderwerp,
      inhoud,
      bijlage: pdfBuffer,
      bijlageNaam: `factuur-${factuur.factuurNummer}.pdf`,
    },
    instellingen
  );
}
