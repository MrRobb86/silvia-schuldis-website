/* Termine aus termine.json auf der Seite anzeigen.
 *
 * Warum eine eigene Datei statt Text direkt im HTML: Silvia soll Termine selbst
 * aendern koennen, ohne HTML anzufassen. In termine.json stehen nur drei
 * Textfelder je Angebot - mehr kann dort nicht kaputtgehen.
 *
 * Zwei Darstellungen:
 *   <div class="terminbox" data-termin="kraftkurs"></div>   auf der Angebotsseite
 *   <div class="termin-band" data-termin="kraftkurs retreat"></div>   als Zeile
 *
 * Ist "datum" leer, bleibt die Stelle unsichtbar. Die Seite sieht dann genauso
 * aus wie vorher - deshalb kann ein leeres Feld nichts zerstoeren.
 */
(function () {
  'use strict';

  var ziele = document.querySelectorAll('[data-termin]');
  if (!ziele.length) return;

  // Zeitstempel haengt an der Adresse, damit der Browser nicht die alte Fassung
  // aus dem Zwischenspeicher nimmt. Sonst sieht Silvia ihre Aenderung nicht.
  fetch('termine.json?v=' + Date.now(), { cache: 'no-store' })
    .then(function (antwort) {
      if (!antwort.ok) throw new Error('HTTP ' + antwort.status);
      return antwort.json();
    })
    .then(function (daten) {
      Array.prototype.forEach.call(ziele, function (ziel) {
        var schluessel = (ziel.getAttribute('data-termin') || '').split(/\s+/);
        var eintraege = schluessel
          .map(function (s) { return daten[s]; })
          .filter(function (e) { return e && e.datum && String(e.datum).trim(); });

        if (!eintraege.length) return;   // nichts hinterlegt: Stelle bleibt leer

        if (ziel.classList.contains('termin-band')) {
          ziel.innerHTML = eintraege.map(zeile).join('');
        } else {
          ziel.innerHTML = eintraege.map(karte).join('');
        }
        ziel.hidden = false;
      });
    })
    .catch(function (fehler) {
      // Lieber gar kein Termin als eine kaputte Seite.
      if (window.console) console.warn('Termine konnten nicht geladen werden:', fehler);
    });

  function text(wert) {
    var d = document.createElement('div');
    d.textContent = String(wert == null ? '' : wert).trim();
    return d.innerHTML;
  }

  function karte(e) {
    return '<p class="termin-label">' + text(e.ueberschrift || 'Nächster Termin') + '</p>' +
           '<p class="termin-datum">' + text(e.datum) + '</p>' +
           (e.zusatz && String(e.zusatz).trim()
             ? '<p class="termin-zusatz">' + text(e.zusatz) + '</p>' : '');
  }

  function zeile(e) {
    return '<span class="termin-zeile"><strong>' + text(e.ueberschrift || 'Termin') + ':</strong> ' +
           text(e.datum) +
           (e.zusatz && String(e.zusatz).trim() ? ' · ' + text(e.zusatz) : '') +
           '</span>';
  }
})();
