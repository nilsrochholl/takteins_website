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
        var auf = clamp((h - r.top) / (h * 0.9));          // 0 = kommt rein, 1 = oben angekommen
        var durch = clamp((h - r.top) / (h + r.height));   // Fortschritt über die ganze Strecke
        var rand = Math.min(48, window.innerWidth * 0.05);
        b.style.setProperty('--bi', (rand * (1 - auf)).toFixed(1) + 'px');
        b.style.setProperty('--br', (22 * (1 - auf)).toFixed(1) + 'px');
        b.style.setProperty('--bz', (1.16 - 0.16 * durch).toFixed(4));
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
