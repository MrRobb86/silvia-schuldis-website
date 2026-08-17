// Terminbuchung — Selbstprüfung der Calendly-Einbettung
//
// Warum es das braucht: Ein iframe auf eine fremde Domain lässt sich vom
// Elternfenster nicht auslesen. Ist die Buchungsseite bei Calendly nicht
// veröffentlicht, liefert sie eine leere Seite — der Besucher sähe einen
// weißen Kasten und wüsste nicht, was er tun soll.
//
// Calendly schickt beim Start des Widgets Nachrichten per postMessage an das
// Elternfenster. Kommt innerhalb von 8 Sekunden keine solche Nachricht, gilt
// die Einbettung als nicht verfügbar: Der Kasten wird ausgeblendet und
// stattdessen ein Hinweis mit Formular und Telefonnummer gezeigt.
(function () {
  var rahmen = document.querySelector('.booking-embed iframe');
  var hinweis = document.getElementById('terminHinweis');
  if (!rahmen || !hinweis) return;

  var geladen = false;

  function istVonCalendly(e) {
    return typeof e.origin === 'string' && e.origin.indexOf('calendly.com') !== -1;
  }

  window.addEventListener('message', function (e) {
    if (!istVonCalendly(e)) return;
    geladen = true;
    rahmen.hidden = false;
    hinweis.hidden = true;
  });

  window.setTimeout(function () {
    if (geladen) return;
    rahmen.hidden = true;
    hinweis.hidden = false;
  }, 8000);
})();
