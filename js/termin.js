// Terminbuchung — Calendly lädt erst nach ausdrücklicher Einwilligung
//
// § 25 Abs. 1 TDDDG verlangt eine Einwilligung, BEVOR etwas auf dem Endgerät
// des Besuchers gespeichert oder ausgelesen wird. Calendly setzt beim Laden
// Cookies (cal_anonymous_id, __stripe_mid, __stripe_sid, country, Optanon*)
// und schreibt Statsig-Einträge in den localStorage — nichts davon ist für
// die Website erforderlich. Deshalb entsteht das iframe erst hier, im Moment
// des Klicks.
//
// Die Einwilligung wird bewusst NICHT gespeichert. Dadurch bleibt die Website
// vollständig frei von eigenen Cookies, und der Widerruf ist das Neuladen der
// Seite. Der Preis: Wer zweimal kommt, klickt zweimal. Das ist der bewusste
// Tausch gegen ein Consent-Banner auf allen zwölf Seiten.
(function () {
  var karte   = document.getElementById('terminConsent');
  var haken   = document.getElementById('terminEinwilligung');
  var knopf   = document.getElementById('terminLaden');
  var fehler  = document.getElementById('terminFehler');
  var rahmen  = document.getElementById('terminRahmen');
  var hinweis = document.getElementById('terminHinweis');
  if (!karte || !haken || !knopf || !rahmen) return;

  var KALENDER = 'https://calendly.com/silvia-gm7h/30-minuten-kostenfreies-gesprach'
               + '?embed_domain=silviaschuldis.de&embed_type=Inline';

  /** Meldet sich Calendly nicht, war die Buchungsseite nicht erreichbar. */
  function ueberwache() {
    var geladen = false;
    window.addEventListener('message', function (e) {
      if (typeof e.origin === 'string' && e.origin.indexOf('calendly.com') !== -1) {
        geladen = true;
      }
    });
    window.setTimeout(function () {
      if (geladen || !hinweis) return;
      rahmen.innerHTML = '';
      hinweis.hidden = false;
    }, 8000);
  }

  knopf.addEventListener('click', function () {
    if (!haken.checked) {
      if (fehler) fehler.hidden = false;
      haken.focus();
      return;
    }
    if (fehler) fehler.hidden = true;

    var rahmenEl = document.createElement('iframe');
    rahmenEl.src = KALENDER;
    rahmenEl.title = 'Terminbuchung: 30 Minuten kostenfreies Gespräch mit Silvia Schuldis';
    rahmenEl.width = '100%';
    rahmenEl.height = '760';
    rahmenEl.style.border = '0';
    rahmen.appendChild(rahmenEl);

    karte.hidden = true;
    rahmenEl.focus();
    ueberwache();
  });

  // Häkchen gesetzt: Fehlerhinweis verschwindet sofort wieder.
  haken.addEventListener('change', function () {
    if (haken.checked && fehler) fehler.hidden = true;
  });
})();
