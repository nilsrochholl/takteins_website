(function(){
  // Fotos nur einblenden, wenn die Datei existiert. Sonst bleibt der gestaltete Bildplatz sichtbar.
  document.querySelectorAll('.shot img[data-src]').forEach(function(img){
    var probe=new Image();
    probe.onload=function(){img.src=img.dataset.src;img.classList.add('on');img.closest('.shot').classList.add('loaded');};
    probe.src=img.dataset.src;
  });

  // Menü auf dem Handy
  var btn=document.querySelector('.menu-btn'), nav=document.querySelector('nav.main');
  if(btn&&nav){btn.addEventListener('click',function(){var o=nav.classList.toggle('open');btn.setAttribute('aria-expanded',o?'true':'false');btn.textContent=o?'Schließen':'Menü';});}

  // E-Mail-Adresse kopieren
  document.querySelectorAll('[data-copy]').forEach(function(b){
    b.addEventListener('click',function(){
      var el=document.getElementById(b.dataset.copy);
      function sel(){var r=document.createRange();r.selectNodeContents(el);var s=window.getSelection();s.removeAllRanges();s.addRange(r);b.textContent='Markiert, jetzt kopieren';}
      try{navigator.clipboard.writeText(el.textContent.trim()).then(function(){b.textContent='Kopiert';setTimeout(function(){b.textContent='Adresse kopieren';},2000);},sel);}catch(e){sel();}
    });
  });


  // Flow-Screenshots vergrößern (Lupe)
  document.querySelectorAll('.lupe-auf').forEach(function(b){
    b.addEventListener('click',function(){
      var img=b.querySelector('img'), d=document.createElement('dialog'); d.className='lupe';
      d.innerHTML='<button class="zu" type="button">Schließen</button>';
      var i=new Image(); i.src=img.currentSrc||img.src; i.alt=img.alt; d.appendChild(i);
      document.body.appendChild(d); d.showModal();
      function zu(){ d.close(); d.remove(); }
      d.querySelector('.zu').addEventListener('click',zu); d.addEventListener('cancel',function(e){e.preventDefault();zu();});
      i.addEventListener('click',zu);
    });
  });


  // ===== Auswertung als PDF (Rechner und Selbsttest) =====
  var basis = (function(){ var s=document.querySelector('script[src*="assets/site.js"]'); return s ? s.getAttribute('src').replace(/assets\/site\.js.*$/,'') : ''; })();
  function ladePdf(cb){
    if (window.jspdf) return cb();
    var s=document.createElement('script'); s.src=basis+'assets/jspdf.umd.min.js'; s.onload=cb;
    s.onerror=function(){ alert('Das PDF konnte gerade nicht erstellt werden. Bitte später noch einmal versuchen.'); };
    document.head.appendChild(s);
  }
  var IDEEN = {
    q1:['Zahlen jeden Morgen aktuell','Ein Flow holt Umsatz, Aufträge und offene Posten aus Ihren Systemen und schreibt sie in ein Dashboard, das um 6 Uhr fertig ist.'],
    q2:['Wissen aus Köpfen in Abläufe holen','Die drei Aufgaben, die nur eine Person kann, werden beschrieben und automatisiert. Urlaub und Krankheit bringen nichts mehr zum Stehen.'],
    q3:['Schnittstellen statt Abtippen','Daten fließen automatisch zwischen ERP, Shop, Buchhaltung und Microsoft 365. Niemand kopiert mehr von A nach B.'],
    q4:['Leistungen prüfen, bevor die Rechnung rausgeht','Jede gebuchte Zeit wird gegen Auftrag und Vertrag geprüft. Lücken landen mit Begründung bei der richtigen Person.'],
    q5:['Frühwarnung statt Feuerwehr','Ein Flow meldet Auffälligkeiten jeden Morgen in einer kurzen Übersicht, bevor Ihre Kunden anrufen.'],
    angebot:['Angebote nachfassen','Nach sieben Tagen kommt automatisch eine Erinnerung mit fertigem Entwurf. Kein Angebot geht mehr verloren.'],
    beleg:['Belegfreigabe mit einem Klick','Eingangsrechnungen liegen jeden Morgen in Teams zur Freigabe, mit Buchungsvorschlag für die Buchhaltung.'],
    dashboard:['Ein Dashboard für das Montagsmeeting','Fünf Kennzahlen, auf die jemand reagiert, jeden Morgen aktuell und mit Quelle.']
  };
  function auswertungDaten(art){
    var d={art:art, datum:new Date().toLocaleDateString('de-DE'), zeilen:[], ideen:[], titel:''};
    if (art==='rechner'){
      var g=function(id){var e=document.getElementById(id);return e?e.textContent.replace(/ /g,' '):'';};
      d.titel='Was kostet Sie die Routine?';
      d.zeilen=[['Mitarbeitende mit Routinearbeit',g('r-pers')],['Stunden Routine pro Person und Woche',g('r-std')],['Interner Stundensatz',g('r-satz')],
                ['Routine pro Jahr',g('r-jahr-h')],['Das kostet Sie im Jahr',g('r-jahr-e')],['Davon realistisch zurückholbar',g('r-zurueck')]];
      d.ideen=[IDEEN.angebot,IDEEN.beleg,IDEEN.dashboard];
    } else {
      var q=document.getElementById('quiz'), fd=new FormData(q), nein=[];
      ['q1','q2','q3','q4','q5'].forEach(function(k){ if(fd.get(k)==='0') nein.push(k); });
      d.titel='Wie sehr läuft Ihr Betrieb im Takt?';
      d.zeilen=[['Ergebnis',document.getElementById('quiz-n').textContent],['Einordnung',document.getElementById('quiz-label').textContent],['',document.getElementById('quiz-text').textContent]];
      nein.forEach(function(k){ if(d.ideen.length<3) d.ideen.push(IDEEN[k]); });
      [IDEEN.angebot,IDEEN.beleg,IDEEN.dashboard].forEach(function(i){ if(d.ideen.length<3) d.ideen.push(i); });
    }
    return d;
  }
  function baueDoc(d){
    var J=window.jspdf.jsPDF, doc=new J({unit:'mm',format:'a4'}), x=20, y=24, w=170;
    doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(60,0,95); doc.text('takteins',x,y);
    doc.setFont('helvetica','normal'); doc.setTextColor(120,120,130); doc.setFontSize(9); doc.text('Auswertung vom '+d.datum,190,y,{align:'right'});
    y+=16; doc.setTextColor(14,12,18); doc.setFont('helvetica','bold'); doc.setFontSize(20); doc.text(doc.splitTextToSize(d.titel,w),x,y); y+=12;
    doc.setFontSize(11);
    d.zeilen.forEach(function(z){
      if(z[0]){ doc.setFont('helvetica','normal'); doc.setTextColor(87,82,95); doc.text(z[0],x,y); doc.setFont('helvetica','bold'); doc.setTextColor(14,12,18); doc.text(String(z[1]),190,y,{align:'right'}); y+=8; }
      else { doc.setFont('helvetica','normal'); var l=doc.splitTextToSize(z[1],w); doc.text(l,x,y); y+=l.length*5.5+3; }
    });
    y+=6; doc.setDrawColor(60,0,95); doc.setLineWidth(.6); doc.line(x,y,190,y); y+=12;
    doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.setTextColor(60,0,95); doc.text('Drei Ideen für Ihren Betrieb',x,y); y+=9;
    d.ideen.forEach(function(i,n){
      doc.setFont('helvetica','bold'); doc.setFontSize(11.5); doc.setTextColor(14,12,18); doc.text((n+1)+'. '+i[0],x,y); y+=6;
      doc.setFont('helvetica','normal'); doc.setFontSize(10.5); doc.setTextColor(87,82,95); var l=doc.splitTextToSize(i[1],w-6); doc.text(l,x+5,y); y+=l.length*5+6;
    });
    y+=4; doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.setTextColor(14,12,18); doc.text('Nächster Schritt: der Taktcheck',x,y); y+=6;
    doc.setFont('helvetica','normal'); doc.setFontSize(10.5); doc.setTextColor(87,82,95);
    var l=doc.splitTextToSize('15 Minuten, kostenlos, per Video. Wir schauen auf die Stelle, die Sie am meisten Nerven kostet. Sie gehen mit drei konkreten Ansatzpunkten raus, oder mit der ehrlichen Antwort, dass es sich nicht lohnt.',w); doc.text(l,x,y); y+=l.length*5+4;
    doc.setTextColor(60,0,95); doc.textWithLink('Jetzt Termin wählen: takteins.de',x,y,{url:'https://takteins.de/kontakt.html'});
    doc.setFontSize(8.5); doc.setTextColor(140,140,150); doc.text('takteins · Nils Rochholl · Am Wickrather Tor 61 · 41179 Mönchengladbach · hallo@takteins.de',105,285,{align:'center'});
    return doc;
  }
  document.querySelectorAll('form.auswertung').forEach(function(f){
    var art=f.dataset.art, status=f.querySelector('.aw-status'), mailBox=f.querySelector('.aw-mail');
    if (window.TK_AUSWERTUNG_URL && mailBox) mailBox.hidden=false;
    f.querySelector('.aw-laden').addEventListener('click',function(){
      ladePdf(function(){ baueDoc(auswertungDaten(art)).save('takteins-auswertung.pdf'); status.textContent='Das PDF ist heruntergeladen.'; });
    });
    var send=f.querySelector('.aw-senden');
    if (send) send.addEventListener('click',function(){
      var mail=f.querySelector('input[name=mail]').value.trim();
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)){ status.textContent='Bitte eine gültige E-Mail-Adresse eingeben.'; return; }
      if(!f.querySelector('input[name=ok]').checked){ status.textContent='Bitte bestätigen Sie, dass wir die Auswertung an diese Adresse schicken dürfen.'; return; }
      status.textContent='Wird verschickt …'; send.disabled=true;
      ladePdf(function(){
        var d=auswertungDaten(art), pdf=baueDoc(d).output('datauristring').split(',')[1];
        fetch(window.TK_AUSWERTUNG_URL,{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({art:art,mail:mail,kontakt:f.querySelector('input[name=kontakt]').checked,daten:d,pdf:pdf,seite:location.href})})
        .then(function(r){ if(!r.ok) throw 0; status.textContent='Danke! Die Auswertung ist unterwegs. Schauen Sie auch im Spam-Ordner nach.'; })
        .catch(function(){ status.textContent='Das hat leider nicht geklappt. Laden Sie das PDF oben herunter oder schreiben Sie an hallo@takteins.de.'; send.disabled=false; });
      });
    });
  });
  // Selbsttest-Ergebnis an die Buchung übergeben
  var qb=document.getElementById('quiz-buchen');
  if (qb && document.getElementById('quiz')) {
    var basisHref=qb.getAttribute('href');
    document.getElementById('quiz').addEventListener('change',function(){ setTimeout(function(){
      var n=(document.getElementById('quiz-n').textContent||'').replace('/','-von-');
      qb.setAttribute('href', basisHref + (basisHref.indexOf('?')>-1?'&':'?') + 'utm_source=website&utm_medium=selbsttest&utm_content=ergebnis-' + encodeURIComponent(n));
    },0); });
  }

  // Blog-Filter nach Rubrik
  var chips=document.querySelectorAll('.chip[data-filter]');
  chips.forEach(function(c){
    c.addEventListener('click',function(){
      var f=c.dataset.filter;
      chips.forEach(function(x){x.setAttribute('aria-pressed',x===c?'true':'false');});
      document.querySelectorAll('[data-rubrik]').forEach(function(p){p.hidden=!(f==='alle'||p.dataset.rubrik===f);});
    });
  });

  // ===== Bewegung beim Scrollen =====
  var ruhig = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');
  if (ruhig) document.querySelectorAll('.buehne').forEach(function(b){ b.classList.add('da'); });
  var vh = function(){ return window.innerHeight || 800; };
  var clamp = function(x){ return Math.max(0, Math.min(1, x)); };

  // Satz füllt sich Wort für Wort
  document.querySelectorAll('[data-fill]').forEach(function(el){
    var teile = [];
    [].slice.call(el.childNodes).forEach(function(n){
      var cls = n.nodeType === 1 ? (n.className || '') : '';
      // Satzteil mit Verlauf: EIN gemeinsamer Verlauf über alle Wörter
      var huelle = null;
      if (/\bh\b/.test(cls)) { huelle = document.createElement('span'); huelle.className = 'hgroup'; teile.push(huelle); cls = ''; }
      n.textContent.split(/(\s+)/).forEach(function(w){
        if (!w) return;
        var ziel = huelle || null;
        if (/^\s+$/.test(w)) { var t = document.createTextNode(w); ziel ? ziel.appendChild(t) : teile.push(t); return; }
        var s = document.createElement('span'); s.className = 'w ' + cls; s.textContent = w;
        ziel ? ziel.appendChild(s) : teile.push(s);
      });
    });
    el.textContent = ''; teile.forEach(function(t){ el.appendChild(t); });
    if (ruhig) el.querySelectorAll('.w').forEach(function(w){ w.classList.add('on'); });
  });

  // Zahlen zählen hoch
  var fmt = function(v, dec){ return v.toLocaleString('de-DE', {minimumFractionDigits: dec, maximumFractionDigits: dec}); };
  if ('IntersectionObserver' in window && !ruhig) {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (!e.isIntersecting) return; io.unobserve(e.target);
        var el = e.target, ziel = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || '', t0 = null;
        function f(t){ if (!t0) t0 = t; var p = clamp((t - t0) / 1400); p = 1 - Math.pow(1 - p, 3);
          el.innerHTML = fmt(ziel * p, dec) + suf; if (p < 1) requestAnimationFrame(f); }
        requestAnimationFrame(f);
      });
    }, {threshold: .6});
    document.querySelectorAll('[data-count]').forEach(function(el){ io.observe(el); });

    // Textmarker ziehen sich beim Hineinscrollen
    var io4 = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io4.unobserve(e.target);} }); }, {threshold: .9});
    document.querySelectorAll('mark, .hl').forEach(function(m){ m.classList.add('zieh'); io4.observe(m); });

    // Diagrammlinien zeichnen sich
    var io3 = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io3.unobserve(e.target);} }); }, {threshold: .4});
    document.querySelectorAll('.chart').forEach(function(c){ c.classList.add('draw'); io3.observe(c); });

    // Abschnitte gleiten herein (nur was beim Laden unterhalb des Bildschirms liegt)
    var io2 = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io2.unobserve(e.target);} }); }, {threshold: .12});
    document.querySelectorAll('.sec-head, .quotes, .paths, .person, .issues, .offers, .beats, .flowgroups, .gain, .flows, .flowviz-wrap, .posts').forEach(function(el){
      if (el.getBoundingClientRect().top > vh()) { el.classList.add('reveal-pending'); io2.observe(el); }
    });
  }

  // Screenshots zoomen heran
  document.querySelectorAll('.frame').forEach(function(f){ f.classList.add('zoom'); });

  function tick(){
    var h = vh();
    // Scroll-Story
    document.querySelectorAll('.story').forEach(function(st){
      var r = st.getBoundingClientRect(); if (r.height === 0) return;
      var p = clamp(-r.top / (r.height - h));
      var n = Math.min(3, Math.floor(p * 4 * 0.999));
      st.dataset.step = n;
      var seg = st.querySelectorAll('.beatline i');
      seg.forEach(function(s, i){ s.style.setProperty('--f', clamp(p * 4 - i)); });
      var min = 360 + Math.round(p * 160); // 06:00 → 08:40
      var c = st.querySelector('.clock');
      if (c) c.textContent = String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');
    });
    // Satz füllen
    document.querySelectorAll('[data-fill]').forEach(function(el){
      if (ruhig) return;
      var r = el.getBoundingClientRect(); if (r.height === 0) return;
      var p = clamp((h * 0.85 - r.top) / (r.height + h * 0.35));
      var ws = el.querySelectorAll('.w'), k = Math.round(p * ws.length);
      ws.forEach(function(w, i){ w.classList.toggle('on', i < k); });
    });
    // Zoom und Parallaxe
    if (!ruhig) {
      document.querySelectorAll('.zoom').forEach(function(z){
        var r = z.getBoundingClientRect(); if (r.height === 0) return;
        var p = clamp((h - r.top) / (h * 0.8));
        z.style.setProperty('--z', (0.88 + 0.12 * p).toFixed(3));
      });
      // Bühne öffnet sich auf volle Breite, Bild zoomt langsam heraus
      document.querySelectorAll('.buehne').forEach(function(b){
        var r = b.getBoundingClientRect(); if (r.height === 0) return;
        var auf = clamp((h - r.top) / (h * 0.6));          // 0 = kommt rein, 1 = oben angekommen
        var durch = clamp((h - r.top) / (h + r.height));   // Fortschritt über die ganze Strecke
        var rand = Math.min(48, window.innerWidth * 0.05);
        b.style.setProperty('--bi', (rand * (1 - auf)).toFixed(1) + 'px');
        b.style.setProperty('--br', (22 * (1 - auf)).toFixed(1) + 'px');
        b.style.setProperty('--bz', (1.06 - 0.06 * durch).toFixed(4));
        if (auf > 0.55) b.classList.add('da');
      });
      document.querySelectorAll('[data-parallax]').forEach(function(img){
        var r = img.parentNode.getBoundingClientRect(); if (r.height === 0) return;
        img.style.transform = 'translateY(' + (r.top * -parseFloat(img.dataset.parallax)).toFixed(1) + 'px) scale(1.12)';
      });
    }
  }
  var geplant = false;
  function plane(){ if (!geplant){ geplant = true; requestAnimationFrame(function(){ geplant = false; tick(); }); } }
  window.addEventListener('scroll', plane, {passive: true});
  window.addEventListener('resize', plane);
  window.addEventListener('hashchange', function(){ setTimeout(tick, 30); });
  tick();


  // ===== Terminbuchung im Overlay (Calendly wird erst beim Öffnen geladen) =====
  var dlg = null, letzterFokus = null;
  function baueDialog(){
    dlg = document.createElement('dialog');
    dlg.className = 'booking';
    dlg.setAttribute('aria-labelledby', 'booking-titel');
    dlg.innerHTML =
      '<div class="booking-head">' +
        '<div><p class="eyebrow">Taktcheck · 15 Minuten · kostenlos</p><h2 id="booking-titel">Termin wählen</h2></div>' +
        '<button type="button" class="booking-close" aria-label="Fenster schließen">×</button>' +
      '</div>' +
      '<div class="booking-body">' +
        '<aside class="booking-side"><ul class="promise dark"><li>per Video</li><li>ohne Vorbereitung</li><li>kein Verkaufsgespräch</li><li>mit kurzer Notiz danach</li></ul>' +
        '<p class="small">Die Terminbuchung läuft über Calendly. Mit dem Öffnen dieses Fensters werden Daten an Calendly übertragen.</p></aside>' +
        '<div class="booking-frame"></div>' +
      '</div>';
    document.body.appendChild(dlg);
    dlg.querySelector('.booking-close').addEventListener('click', schliessen);
    dlg.addEventListener('click', function(e){ if (e.target === dlg) schliessen(); });
    dlg.addEventListener('cancel', function(e){ e.preventDefault(); schliessen(); });
    dlg.addEventListener('close', function(){ document.documentElement.classList.remove('booking-open'); if (letzterFokus) letzterFokus.focus(); });
  }
  function schliessen(){
    if (!dlg || !dlg.open) return;
    if (ruhig) { dlg.close(); return; }
    dlg.classList.add('zu');
    setTimeout(function(){ dlg.classList.remove('zu'); dlg.close(); }, 220);
  }
  function oeffnen(url){
    if (!dlg) baueDialog();
    var box = dlg.querySelector('.booking-frame');
    if (window.TK_VORSCHAU) {
      box.innerHTML = '<div class="booking-fallback"><p>In der Vorschau kann der Kalender nicht eingebettet werden. Auf takteins.de erscheint er genau hier.</p>' +
        '<a class="btn" href="' + url + '" target="_blank" rel="noopener">Kalender in neuem Tab öffnen</a></div>';
    } else if (!box.querySelector('iframe')) {
      var sep = url.indexOf('?') < 0 ? '?' : '&';
      var f = document.createElement('iframe');
      f.src = url + sep + 'embed_type=PopupWidget&hide_gdpr_banner=1&embed_domain=' + encodeURIComponent(location.hostname || 'takteins.de');
      f.title = 'Terminbuchung Taktcheck'; f.loading = 'eager';
      box.innerHTML = '<div class="booking-loading">Kalender wird geladen …</div>';
      box.appendChild(f);
      f.addEventListener('load', function(){ var l = box.querySelector('.booking-loading'); if (l) l.remove(); });
    }
    letzterFokus = document.activeElement;
    if (typeof dlg.showModal === 'function') { dlg.showModal(); document.documentElement.classList.add('booking-open'); }
    else { window.open(url, '_blank', 'noopener'); }
  }
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[data-buchen]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); oeffnen(a.href);
  });


  // Zeitspar-Rechner
  var rf = document.getElementById('rechner-form');
  if (rf) {
    var eur = function(v){ return Math.round(v).toLocaleString('de-DE') + '\u00a0€'; };
    var rechne = function(){
      var p = +document.getElementById('r-p').value, h = +document.getElementById('r-h').value, st = +document.getElementById('r-s').value;
      var jahr = p * h * 46, kosten = jahr * st;
      document.getElementById('r-pers').textContent = p;
      document.getElementById('r-std').textContent = h;
      document.getElementById('r-satz').textContent = st + '\u00a0€';
      document.getElementById('r-jahr-h').textContent = jahr.toLocaleString('de-DE') + '\u00a0Std.';
      document.getElementById('r-jahr-e').textContent = eur(kosten);
      document.getElementById('r-zurueck').textContent = eur(kosten * 0.6);
    };
    rf.addEventListener('input', rechne); rechne();
  }

  // Vorher/Nachher-Regler
  document.querySelectorAll('.compare input[type=range]').forEach(function(r){
    var c=r.closest('.compare');
    function set(){c.style.setProperty('--pos',r.value+'%');}
    r.addEventListener('input',set); set();
  });

  // Selbsttest
  var quiz=document.getElementById('quiz');
  if(quiz){
    var stufen=[
      ['Viel Luft nach oben','Hier hängt vieles an Handarbeit und einzelnen Köpfen. Gute Nachricht: Genau da bringt der erste Schritt am meisten.'],
      ['Viel Luft nach oben','Hier hängt vieles an Handarbeit und einzelnen Köpfen. Gute Nachricht: Genau da bringt der erste Schritt am meisten.'],
      ['Solide, aber anstrengend','Einiges läuft, aber Sie zahlen mit Zeit und Nerven. Im Taktcheck finden wir die zwei Stellen mit der größten Wirkung.'],
      ['Solide, aber anstrengend','Einiges läuft, aber Sie zahlen mit Zeit und Nerven. Im Taktcheck finden wir die zwei Stellen mit der größten Wirkung.'],
      ['Fast im Takt','Sie sind weiter als die meisten. Oft fehlt nur noch ein Baustein, damit es wirklich von allein läuft.'],
      ['Voll im Takt','Respekt. Sie brauchen mich vermutlich nicht. Wenn Sie trotzdem über das nächste Level reden wollen, gerne.']
    ];
    function upd(){
      var fd=new FormData(quiz), n=0, a=0;
      for(var i=1;i<=5;i++){var v=fd.get('q'+i); if(v!==null){a++; n+=+v;}}
      document.getElementById('quiz-n').textContent=n+'/5';
      document.querySelectorAll('.quiz-bars i').forEach(function(b,i){b.classList.toggle('on',i<n);});
      if(a<5){document.getElementById('quiz-label').textContent=a+' von 5 beantwortet';document.getElementById('quiz-text').textContent='Beantworten Sie alle fünf Fragen, dann sehen Sie hier Ihr Ergebnis.';return;}
      document.getElementById('quiz-label').textContent=stufen[n][0];
      document.getElementById('quiz-text').textContent=stufen[n][1];
    }
    quiz.addEventListener('change',upd);
  }

  // YouTube erst nach Klick laden (Datenschutz)
  document.querySelectorAll('.video[data-youtube]').forEach(function(v){
    var b=v.querySelector('button');
    if(!b)return;
    b.addEventListener('click',function(){
      var f=document.createElement('iframe');
      f.src='https://www.youtube-nocookie.com/embed/'+v.dataset.youtube+'?autoplay=1&rel=0';
      f.allow='accelerometer; autoplay; encrypted-media; picture-in-picture';
      f.allowFullscreen=true; f.title=v.dataset.title||'Video';
      v.innerHTML=''; v.appendChild(f);
    });
  });
})();
