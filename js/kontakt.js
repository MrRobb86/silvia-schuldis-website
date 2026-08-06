// Kontaktformular — Versand über Formspree
//
// Die Nachricht geht direkt von der Seite an Formspree, das sie per E-Mail
// weiterleitet. Das Mailprogramm des Besuchers wird NICHT geöffnet (der frühere
// mailto-Weg scheiterte auf Handys regelmäßig, weil dort oft kein Mailprogramm
// eingerichtet ist).
//
// Formular „Website Kontaktformular" im Formspree-Konto von Silvia Schuldis.
// Empfängerin: silvia@silviaschuldis.de (verifiziert). Free Plan, 50 Einsendungen
// pro Monat — bei Bedarf im Konto nachsehen, der Zähler läuft ohne Warnung voll.
var FORMSPREE_ID = 'xaewnqkr';

(function () {
  var form = document.getElementById('kontaktForm');
  if (!form) return;

  var hinweis = document.getElementById('formHint');
  var knopf = document.getElementById('kontaktSenden');
  var dank = document.getElementById('dankKarte');

  var MAIL = 'schuldis@googlemail.com';
  var TEL = '0176 39521792';

  function melde(text, art) {
    hinweis.textContent = text;
    hinweis.className = 'form-hint' + (art ? ' ' + art : '');
  }

  /** Fehlermeldung mit Rückfallebene — der Besucher soll nie ohne Weg dastehen. */
  function melderFehler() {
    hinweis.className = 'form-hint error';
    hinweis.textContent = '';

    var link = function (ziel, text) {
      var a = document.createElement('a');
      a.href = ziel;
      a.textContent = text;
      return a;
    };
    hinweis.append(
      'Die Nachricht konnte gerade nicht versendet werden. Bitte schreib direkt an ',
      link('mailto:' + MAIL, MAIL),
      ' oder ruf an: ',
      link('tel:+4917639521792', TEL),
      '.'
    );
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Pflichtfelder über die Browser-Prüfung (das Formular trägt novalidate).
    if (!form.checkValidity()) {
      form.reportValidity();
      melde('Bitte fülle die Pflichtfelder aus und bestätige den Datenschutzhinweis.', 'error');
      return;
    }

    // Netz für den Fall, dass die Kennung einmal leer ist oder wieder auf einen
    // Platzhalter zurückfällt — dann lieber die Rückfallmeldung als ein toter Knopf.
    if (!FORMSPREE_ID || FORMSPREE_ID.indexOf('HIER') === 0) {
      melderFehler();
      return;
    }

    knopf.disabled = true;
    knopf.textContent = 'Wird gesendet …';
    melde('', '');

    fetch('https://formspree.io/f/' + FORMSPREE_ID, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (antwort) {
        if (!antwort.ok) throw new Error('HTTP ' + antwort.status);
        // Formular ausblenden, Dank einblenden — die Seite bleibt stehen.
        form.hidden = true;
        dank.hidden = false;
        dank.setAttribute('tabindex', '-1');
        dank.focus();
        dank.scrollIntoView({ block: 'center' });
      })
      .catch(function () {
        melderFehler();
      })
      .finally(function () {
        knopf.disabled = false;
        knopf.textContent = 'Nachricht senden';
      });
  });
})();
