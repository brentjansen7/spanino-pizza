import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('Database seeden...');

  // Standaard instellingen
  const standaardInstellingen = [
    { sleutel: 'restaurant_naam', waarde: 'Spanino Pizza' },
    { sleutel: 'restaurant_adres', waarde: '' },
    { sleutel: 'restaurant_stad', waarde: '' },
    { sleutel: 'restaurant_postcode', waarde: '' },
    { sleutel: 'restaurant_telefoon', waarde: '' },
    { sleutel: 'restaurant_kvk', waarde: '' },
    { sleutel: 'restaurant_btw', waarde: '' },
    { sleutel: 'restaurant_iban', waarde: '' },
    { sleutel: 'smtp_host', waarde: 'smtp.gmail.com' },
    { sleutel: 'smtp_port', waarde: '587' },
    { sleutel: 'smtp_gebruiker', waarde: '' },
    { sleutel: 'smtp_wachtwoord', waarde: '' },
  ];

  for (const inst of standaardInstellingen) {
    await prisma.instelling.upsert({
      where: { sleutel: inst.sleutel },
      update: {},
      create: inst,
    });
  }

  // Zorg dat beheer wachtwoord altijd ingesteld is (nooit leeg)
  const ww = await prisma.instelling.findUnique({ where: { sleutel: 'beheer_wachtwoord' } });
  if (!ww || !ww.waarde) {
    await prisma.instelling.upsert({
      where: { sleutel: 'beheer_wachtwoord' },
      update: { waarde: 'spanino2026' },
      create: { sleutel: 'beheer_wachtwoord', waarde: 'spanino2026' },
    });
    console.log('Beheer wachtwoord ingesteld op: spanino2026');
  }

  // Standaard e-mailtemplates
  const bestaandeFeest = await prisma.emailTemplate.findFirst({ where: { type: 'feest' } });
  if (!bestaandeFeest) {
    await prisma.emailTemplate.create({
      data: {
        naam: 'Standaard feestverzoek antwoord',
        type: 'feest',
        onderwerp: 'Re: Feestverzoek bij {{restaurant_naam}}',
        inhoud: `<p>Beste {{naam}},</p>

<p>Bedankt voor je aanvraag voor een feest/evenement bij {{restaurant_naam}}!</p>

<p>We hebben je verzoek ontvangen voor een <strong>{{type_evenement}}</strong> op <strong>{{datum_evenement}}</strong> voor <strong>{{aantal_personen}} personen</strong>.</p>

<p>We stellen je graag een passend aanbod voor. Hieronder vind je alvast informatie over onze feestpakketten:</p>

<ul>
  <li><strong>Basis pakket</strong>: Pizza buffet naar keuze, inclusief frisdranken</li>
  <li><strong>Uitgebreid pakket</strong>: Pizza buffet + saladebar + dessert + dranken</li>
  <li><strong>Volledig verzorgd</strong>: Alles inclusief, wij regelen alles voor jullie</li>
</ul>

<p>Neem contact met ons op voor een persoonlijk gesprek en een offerte op maat:</p>
<p>📞 <strong>{{restaurant_telefoon}}</strong><br>
📧 <strong>{{restaurant_email}}</strong></p>

<p>We hopen je snel te mogen verwelkomen!</p>

<p>Met vriendelijke groet,<br>
<strong>{{restaurant_naam}}</strong></p>`,
      },
    });
  }

  const bestaandeFactuur = await prisma.emailTemplate.findFirst({ where: { type: 'factuur' } });
  if (!bestaandeFactuur) {
    await prisma.emailTemplate.create({
      data: {
        naam: 'Standaard factuur e-mail',
        type: 'factuur',
        onderwerp: 'Factuur {{factuur_nummer}} van {{restaurant_naam}}',
        inhoud: `<p>Beste {{klant_naam}},</p>

<p>Hierbij ontvangt u factuur <strong>{{factuur_nummer}}</strong> van {{restaurant_naam}}.</p>

<p>Het totaalbedrag van <strong>{{totaal_bedrag}}</strong> dient uiterlijk <strong>{{vervaldatum}}</strong> voldaan te zijn.</p>

<p>De factuur vindt u als bijlage bij deze e-mail (PDF).</p>

<p>Heeft u vragen over deze factuur? Neem dan gerust contact met ons op.</p>

<p>Met vriendelijke groet,<br>
<strong>{{restaurant_naam}}</strong></p>`,
      },
    });
  }

  console.log('Seeden voltooid!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
