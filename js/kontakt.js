// Kontaktformular – Anfrage per E-Mail
// Baut aus den Formularfeldern eine vorformulierte E-Mail an Silvia und öffnet
// das Mailprogramm der Besucherin/des Besuchers. Es werden keine Daten an Dritte
// übermittelt (DSGVO-freundlich, kein externer Formulardienst nötig).
//
// UPGRADE-HINWEIS: Sobald die Seite auf einem eigenen Hosting mit Formular-Backend
// läuft (z. B. Web3Forms, Formspree oder ein PHP-Skript), kann hier stattdessen ein
// echter fetch()-POST an den Endpunkt gesetzt werden. Dann muss der Dienst in der
// Datenschutzerklärung ergänzt werden.

(function () {
  var form = document.getElementById('kontaktForm');
  if (!form) return;

  var hint = document.getElementById('formHint');
  var EMPFAENGER = 'schuldis@googlemail.com';

  function setHint(msg, type) {
    hint.textContent = msg;
    hint.className = 'form-hint' + (type ? ' ' + type : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Pflichtfelder prüfen (nutzt die native Validierung des Browsers)
    if (!form.checkValidity()) {
      form.reportValidity();
      setHint('Bitte fülle die Pflichtfelder aus und bestätige den Datenschutzhinweis.', 'error');
      return;
    }

    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var telefon = form.telefon.value.trim();
    var anliegen = form.anliegen.value;
    var nachricht = form.nachricht.value.trim();

    var betreff = 'Anfrage über die Website: ' + anliegen;

    var zeilen = [
      'Name: ' + name,
      'E-Mail: ' + email,
      'Telefon: ' + (telefon || '–'),
      'Anliegen: ' + anliegen,
      '',
      'Nachricht:',
      nachricht,
      '',
      '— gesendet über das Kontaktformular auf silvia-schuldis (Website)'
    ];

    var mailto = 'mailto:' + EMPFAENGER +
      '?subject=' + encodeURIComponent(betreff) +
      '&body=' + encodeURIComponent(zeilen.join('\r\n'));

    // Mailprogramm öffnen
    window.location.href = mailto;

    setHint('Dein E-Mail-Programm öffnet sich mit der fertigen Nachricht – bitte nur noch auf „Senden“ klicken. Klappt das nicht, schreib mir direkt an ' + EMPFAENGER + '.', 'success');
  });
})();
