# Spanino Pizza Beheersoftware

## Eerste keer opstarten

1. Dubbelklik op `start.bat`
2. Wacht tot beide vensters open zijn
3. Ga naar http://localhost:5173 in je browser
4. Log in met wachtwoord: **spanino2026**

## Daarna opstarten

Open twee aparte command prompt vensters en voer uit:

**Venster 1 (Backend):**
```
cd spanino-pizza\backend
npm run dev
```

**Venster 2 (Frontend):**
```
cd spanino-pizza\frontend
npm run dev
```

Ga dan naar: http://localhost:5173

---

## Eerste stap: Instellingen invullen

Ga naar **Instellingen** en vul in:
- Restaurantnaam, adres, telefoon
- KvK-nummer en BTW-nummer
- IBAN voor facturen
- Gmail-adres en App-wachtwoord

### Gmail App-wachtwoord instellen
1. Ga naar myaccount.google.com
2. Beveiliging → App-wachtwoorden
3. Kies "Mail" en "Windows computer"
4. Kopieer het 16-cijferige wachtwoord
5. Plak het in de instellingen

Klik daarna op **"Test e-mailverbinding"** om te controleren of het werkt.

---

## Feestverzoeken

Wanneer iemand belt of mailt voor een feest:
1. Ga naar **Feestverzoeken** → **Nieuw verzoek invoeren**
2. Vul de gegevens in
3. Klik op **"Standaard e-mail versturen"**
4. Bekijk de preview en klik op **"Verstuur e-mail"**

De klant ontvangt automatisch de standaard informatie-e-mail.

## Facturen

1. Ga naar **Klanten** → voeg de klant toe (eenmalig)
2. Ga naar **Facturen** → **Nieuwe factuur**
3. Kies de klant, voeg regelitems toe
4. Klik op **"Factuur aanmaken"**
5. Download de PDF of verstuur per e-mail

## E-mailtemplates aanpassen

Ga naar **Templates** om de standaard e-mailteksten aan te passen.
Gebruik variabelen zoals `{{naam}}`, `{{datum_evenement}}` die automatisch worden ingevuld.

---

## Wachtwoord wijzigen

Ga naar **Instellingen** → vul je nieuwe wachtwoord in → **Opslaan**
