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
  // Aufklappmenü „Branchen“: Klick/Tippen öffnet, Klick daneben oder Escape schließt
  document.querySelectorAll('.dd').forEach(function(dd){
    var b=dd.querySelector('.dd-btn');
    function setze(o){dd.classList.toggle('open',o);b.setAttribute('aria-expanded',o?'true':'false');}
    b.addEventListener('click',function(e){e.stopPropagation();setze(!dd.classList.contains('open'));});
    document.addEventListener('click',function(e){if(!dd.contains(e.target))setze(false);});
    dd.addEventListener('keydown',function(e){if(e.key==='Escape'){setze(false);b.focus();}});
    dd.addEventListener('focusout',function(e){if(!dd.contains(e.relatedTarget))setze(false);});
  });

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
      var g=function(id){var e=document.getElementById(id);return e?e.textContent.replace(/ /g,' '):'';};
      var v=function(id){var e=document.getElementById(id);return e?+e.value:0;};
      d.titel='Was kostet Sie die Routine?';
      d.zeilen=[['Mitarbeitende mit Routinearbeit',g('r-pers')],['Stunden Routine pro Person und Woche',g('r-std')],['Interner Stundensatz',g('r-satz')],
                ['Routine pro Jahr',g('r-jahr-h')],['Das kostet Sie im Jahr',g('r-jahr-e')],['Davon realistisch zurückholbar',g('r-zurueck')]];
      var p=v('r-p'), h=v('r-h'), s=v('r-s'), jahr=p*h*46;
      d.zahlen={personen:p, stunden:h, satz:s, jahrStd:jahr, kosten:jahr*s, zurueck:jahr*s*0.6, stdWoche:p*h*0.6};
      d.ideen=[IDEEN.angebot,IDEEN.beleg,IDEEN.dashboard];
    } else {
      var q=document.getElementById('quiz'), fd=new FormData(q), nein=[];
      ['q1','q2','q3','q4','q5'].forEach(function(k){ if(fd.get(k)==='0') nein.push(k); });
      d.titel='Wie sehr läuft Ihr Betrieb im Takt?';
      d.zeilen=[['Ergebnis',document.getElementById('quiz-n').textContent],['Einordnung',document.getElementById('quiz-label').textContent],['',document.getElementById('quiz-text').textContent]];
      d.fragen=[].map.call(q.querySelectorAll('.qq'),function(el,i){ var a=fd.get('q'+(i+1)); return {text:el.querySelector('p').textContent.trim(), antwort:a==='1'?'ja':a==='0'?'nein':''}; });
      d.punkte=d.fragen.filter(function(f){return f.antwort==='ja';}).length;
      nein.forEach(function(k){ if(d.ideen.length<3) d.ideen.push(IDEEN[k]); });
      [IDEEN.angebot,IDEEN.beleg,IDEEN.dashboard].forEach(function(i){ if(d.ideen.length<3) d.ideen.push(i); });
    }
    return d;
  }
  // Gestaltung des PDFs: Farben wie auf der Seite (Lila = Mensch, Türkis = Maschine)
  var PC={lila:[60,0,95], lilaInk:[42,0,67], lilaPale:[235,229,239], lilaGlow:[177,153,191], tq:[0,163,176], tqInk:[0,115,125], tqGlow:[95,224,232], tqPale:[223,244,246],
          ink:[14,12,18], soft:[87,82,95], muted:[138,132,148], line:[226,222,231], weiss:[255,255,255]};
  var LOGO_FONT='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'; // Fraunces 600, nur die Zeichen der Wortmarke (SIL OFL)
  var BUCHEN='https://calendly.com/nilsrochholl/takteins-15-minuten-erstgesprach';
  function zahl(n){ return Math.round(n).toLocaleString('de-DE'); }
  function baueDoc(d){
    var J=window.jspdf.jsPDF, doc=new J({unit:'mm',format:'a4'}), W=210, M=18, IW=W-2*M, y;
    function F(c){doc.setFillColor(c[0],c[1],c[2]);} function T(c){doc.setTextColor(c[0],c[1],c[2]);} function D(c){doc.setDrawColor(c[0],c[1],c[2]);}
    function font(st,sz){doc.setFont('helvetica',st);doc.setFontSize(sz);}
    function alpha(a){ try{ doc.setGState(new doc.GState({opacity:a})); }catch(e){} }
    function kicker(t,x,yy,c,opt){ font('bold',7.5); T(c); doc.setCharSpace(0.5); doc.text(t.toUpperCase(),x,yy,opt||{}); doc.setCharSpace(0); }
    function wrap(t,b,st,sz){ font(st,sz); return doc.splitTextToSize(t,b); }
    function platz(h){ if(y+h>283){ doc.addPage(); kopfKlein(); } }
    function notenlinien(y0,von,bis,c,a){ alpha(a); D(c); doc.setLineWidth(.2); for(var i=0;i<5;i++) doc.line(von,y0+i*1.7,bis,y0+i*1.7); alpha(1); }
    function logo(x,yb,dunkel,L){
      // Wortmarke wie auf der Seite: Fraunces 600, „1 über 1“, unten Lila (auf dunklem Grund Lila-Glow)
      var ok=true; try{ if(!doc.getFontList().Fraunces){ doc.addFileToVFS('fraunces600.ttf',LOGO_FONT); doc.addFont('fraunces600.ttf','Fraunces','bold'); } }catch(e){ ok=false; }
      var mm=L*0.3528, ts=0.825*L, tsmm=ts*0.3528, lh=0.79*tsmm, c=yb-0.375*mm;
      doc.setFont(ok?'Fraunces':'helvetica','bold'); doc.setFontSize(ts); doc.setCharSpace(0);
      var w=doc.getTextWidth('1'), cx=x+w/2;
      T(dunkel?PC.weiss:PC.ink); doc.text('1',cx,c-lh/2+0.352*tsmm,{align:'center'});
      T(dunkel?PC.lilaGlow:PC.lila); doc.text('1',cx,c+lh/2+0.352*tsmm,{align:'center'});
      doc.setFontSize(L); doc.setCharSpace(-0.045*mm); T(dunkel?PC.weiss:PC.ink); doc.text('takteins',x+w+0.36*mm,yb); doc.setCharSpace(0);
    }
    function kopfKlein(){ logo(M,19,false,14); font('normal',8.5); T(PC.muted); doc.text(d.titel,W-M,17.5,{align:'right'}); D(PC.line); doc.setLineWidth(.3); doc.line(M,25,W-M,25); y=36; }
    function karte(x,yy,w,h,fill,rand){ if(fill){F(fill);} if(rand){D(rand);doc.setLineWidth(.3);} doc.roundedRect(x,yy,w,h,2.5,2.5,fill&&rand?'FD':fill?'F':'S'); }

    // Kopfband
    F(PC.lila); doc.rect(0,0,W,58,'F');
    alpha(.35); F(PC.lilaInk); doc.circle(W-14,4,46,'F'); alpha(1);
    logo(M,18,true,17);
    kicker('Ihre Auswertung',W-M,13,PC.tqGlow,{align:'right'});
    font('normal',9); T(PC.lilaGlow); doc.text('vom '+d.datum,W-M,18,{align:'right'});
    kicker(d.art==='rechner'?'Takt 03 · Zeitspar-Rechner':'Takt 09 · Selbsttest',M,28,PC.tqGlow);
    font('bold',22); T(PC.weiss); doc.text(d.titel,M,37);
    font('normal',10.5); T(PC.lilaGlow); doc.text(d.art==='rechner'?'Ihre Angaben, hochgerechnet auf ein Jahr.':'Fünf ehrliche Fragen, eine klare Standortbestimmung.',M,43.5);
    notenlinien(47,0,W,PC.lilaGlow,.45);
    [[W-M-34,50.4,1.5,PC.lilaGlow],[W-M-24,48.7,1.5,PC.lilaGlow],[W-M-14,50.4,1.5,PC.lilaGlow],[W-M-3,47,2.1,PC.tq]].forEach(function(n){ F(n[3]); doc.ellipse(n[0],n[1],n[2]*1.3,n[2],'F'); });
    y=69;

    if (d.art==='rechner' && d.zahlen){
      var z=d.zahlen, gap=5, cw=(IW-2*gap)/3;
      kicker('Ihre Angaben',M,y,PC.muted); y+=4;
      [['Mitarbeitende mit Routine',zahl(z.personen)],['Routine je Person und Woche',zahl(z.stunden)+' Std.'],['Interner Stundensatz',zahl(z.satz)+' €']].forEach(function(c,i){
        var x=M+i*(cw+gap); karte(x,y,cw,18,PC.lilaPale);
        font('normal',8); T(PC.soft); doc.text(c[0],x+5,y+6.8);
        font('bold',15); T(PC.ink); doc.text(c[1],x+5,y+14.2);
      });
      y+=25;
      kicker('Hochgerechnet auf ein Jahr',M,y,PC.muted); y+=4;
      var hw=(IW-gap)/2;
      [['Routine pro Jahr',zahl(z.jahrStd)+' Std.','46 Arbeitswochen'],['Das kostet Sie im Jahr',zahl(z.kosten)+' €','Routinestunden × Stundensatz']].forEach(function(c,i){
        var x=M+i*(hw+gap); karte(x,y,hw,23,null,PC.line);
        font('normal',8.5); T(PC.soft); doc.text(c[0],x+5,y+7.5);
        font('bold',19); T(PC.ink); doc.text(c[1],x+5,y+16);
        font('normal',7.5); T(PC.muted); doc.text(c[2],x+5,y+20.5);
      });
      y+=26;
      // Highlight: zurückholbar
      F(PC.tq); doc.roundedRect(M,y,IW,29,2.5,2.5,'F');
      alpha(.18); F(PC.weiss); doc.circle(W-M-6,y+28,24,'F'); alpha(1);
      kicker('Davon realistisch zurückholbar',M+6,y+8.5,PC.weiss);
      font('bold',28); T(PC.weiss); doc.text(zahl(z.zurueck)+' €',M+6,y+20);
      font('normal',8.5); doc.text('pro Jahr, bei 60 % automatisierbarer Routine',M+6,y+25.5);
      font('bold',22); doc.text('ca. '+zahl(z.stdWoche)+' Std.',W-M-6,y+16.5,{align:'right'});
      font('normal',8.5); doc.text('pro Woche zurück für Ihr Team',W-M-6,y+22.5,{align:'right'});
      y+=36;
      // Balken: wohin die Routinekosten gehen
      kicker('So teilen sich die Routinekosten auf',M,y,PC.muted); y+=4;
      var bw=IW*0.6;
      F(PC.tq); doc.roundedRect(M,y,IW,9,2,2,'F');
      F(PC.lilaPale); doc.roundedRect(M+bw,y,IW-bw,9,2,2,'F'); doc.rect(M+bw,y,3,9,'F');
      font('bold',8.5); T(PC.weiss); doc.text('60 %',M+4,y+5.9); T(PC.lila); doc.text('40 %',M+bw+4,y+5.9);
      y+=14;
      F(PC.tq); doc.circle(M+1.5,y-1.1,1.5,'F'); font('normal',8.5); T(PC.soft); doc.text('läuft künftig automatisch · '+zahl(z.zurueck)+' €',M+5,y);
      F(PC.lilaPale); D(PC.lilaGlow); doc.setLineWidth(.2); doc.circle(M+bw+1.5,y-1.1,1.5,'FD'); doc.text('bleibt beim Team · '+zahl(z.kosten-z.zurueck)+' €',M+bw+5,y);
      y+=8;
    } else if (d.fragen){
      // Ergebnis mit fünf Takten
      var n=d.punkte, beantwortet=d.fragen.filter(function(f){return f.antwort;}).length;
      karte(M,y-4,IW,38,PC.lilaPale);
      font('bold',38); T(PC.lila); doc.text(n+'/5',M+7,y+16);
      font('bold',12); T(PC.ink); doc.text(wrap(beantwortet<5?(beantwortet+' von 5 beantwortet'):(d.zeilen[1]?d.zeilen[1][1]:''),52,'bold',12).slice(0,2),M+7,y+25);
      var sx=M+62, sw=(IW-62-7-4*2.5)/5;
      for(var i=0;i<5;i++){ F(i<n?PC.tq:PC.weiss); doc.roundedRect(sx+i*(sw+2.5),y+3,sw,7,1.5,1.5,'F'); }
      font('normal',7.5); T(PC.muted); doc.text('Ja-Antworten',sx,y+15);
      var lt=wrap(d.zeilen[2]?d.zeilen[2][1]:'',IW-62-7,'normal',9); T(PC.soft); doc.text(lt.slice(0,3),sx,y+21);
      y+=46;
      kicker('Ihre Antworten',M,y,PC.muted); y+=6;
      d.fragen.forEach(function(f){
        var l=wrap(f.text,IW-34,'normal',9.5), h=Math.max(9,l.length*4.4+4.6);
        platz(h);
        var cy=y+2.2;
        if(f.antwort==='ja'){ F(PC.tq); doc.circle(M+3,cy,3,'F'); D(PC.weiss); doc.setLineWidth(.6); doc.setLineCap('round'); doc.line(M+1.6,cy+.1,M+2.6,cy+1.1); doc.line(M+2.6,cy+1.1,M+4.5,cy-1.1); }
        else if(f.antwort==='nein'){ D(PC.lila); doc.setLineWidth(.5); doc.circle(M+3,cy,2.75,'S'); doc.setLineCap('round'); doc.line(M+1.9,cy,M+4.1,cy); }
        else { D(PC.line); doc.setLineWidth(.5); doc.circle(M+3,cy,2.75,'S'); }
        T(PC.ink); font('normal',9.5); doc.text(l,M+10,y+3.4);
        var tag=f.antwort==='ja'?['Ja',PC.tqPale,PC.tqInk]:f.antwort==='nein'?['Nein',PC.lilaPale,PC.lila]:['offen',[244,243,246],PC.muted];
        F(tag[1]); doc.roundedRect(W-M-16,y-.3,16,5.6,2.8,2.8,'F'); font('bold',7.5); T(tag[2]); doc.text(tag[0],W-M-8,y+3.4,{align:'center'});
        y+=h; D(PC.line); doc.setLineWidth(.2); doc.line(M+10,y-2.4,W-M,y-2.4);
      });
      y+=6;
    }

    // Drei Ideen
    platz(30);
    kicker('Wo ich ansetzen würde',M,y,PC.tqInk); y+=7;
    font('bold',15); T(PC.ink); doc.text('Drei Ideen für Ihren Betrieb',M,y); y+=7;
    var ig=5, iw=(IW-2*ig)/3, ik=d.ideen.map(function(i){ return {t:wrap(i[0],iw-10,'bold',10), l:wrap(i[1],iw-10,'normal',8.5)}; });
    var ih=Math.max.apply(null,ik.map(function(c){ return 19+(c.t.length-1)*4.3+c.l.length*3.7+4; }));
    platz(ih);
    ik.forEach(function(c,k){
      var x=M+k*(iw+ig);
      karte(x,y,iw,ih,PC.weiss,PC.line);
      F(PC.tq); doc.rect(x+5,y,14,1.3,'F');
      F(PC.lila); doc.circle(x+8.6,y+9,3.6,'F'); font('bold',9.5); T(PC.weiss); doc.text(String(k+1),x+8.6,y+10.4,{align:'center'});
      font('bold',10); T(PC.ink); doc.text(c.t,x+5,y+18.5);
      font('normal',8.5); T(PC.soft); doc.text(c.l,x+5,y+18.5+(c.t.length-1)*4.3+5);
    });
    y+=ih+5;

    // Nächster Schritt
    var tl=wrap('Per Video, auf die Stelle, die Sie am meisten Nerven kostet. Sie gehen mit drei konkreten Ansatzpunkten raus. Oder mit der ehrlichen Antwort, dass es sich nicht lohnt.',IW-70,'normal',9);
    var ch=Math.max(30,tl.length*4+19);
    platz(ch);
    F(PC.lila); doc.roundedRect(M,y,IW,ch,2.5,2.5,'F');
    kicker('Nächster Schritt',M+7,y+7.5,PC.tqGlow);
    font('bold',14); T(PC.weiss); doc.text('Der Taktcheck: 15 Minuten, kostenlos',M+7,y+14);
    font('normal',9); T(PC.lilaGlow); doc.text(tl,M+7,y+20);
    var bx=W-M-7-46, by=y+8;
    F(PC.tq); doc.roundedRect(bx,by,46,11,5.5,5.5,'F');
    font('bold',10); T(PC.weiss); doc.text('Taktcheck buchen',bx+23,by+7.1,{align:'center'});
    doc.link(bx,by,46,11,{url:BUCHEN});
    font('normal',7.5); T(PC.lilaGlow); doc.text('ohne Vorbereitung · kein Verkaufsgespräch',bx+23,by+16,{align:'center'});

    // Fußzeile auf jeder Seite
    var seiten=doc.getNumberOfPages();
    for(var s=1;s<=seiten;s++){
      doc.setPage(s); D(PC.line); doc.setLineWidth(.3); doc.line(M,286,W-M,286);
      font('normal',7.5); T(PC.muted);
      doc.text('takteins · Nils Rochholl · Am Wickrather Tor 61 · 41179 Mönchengladbach',M,290.5);
      var r=W-M-(seiten>1?30:0), t1='hallo@takteins.de  ·  ', t2='takteins.de', w1=doc.getTextWidth(t1), w2=doc.getTextWidth(t2);
      doc.text(t1+t2,r,290.5,{align:'right'});
      doc.link(r-w2-w1,287.9,w1-4,3.6,{url:'mailto:hallo@takteins.de'}); doc.link(r-w2,287.9,w2,3.6,{url:'https://takteins.de/'});
      if(seiten>1) doc.text('Seite '+s+' von '+seiten,W-M,290.5,{align:'right'});
    }
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

  // Handwerks-Rechner: Feierabende und Geld, das beim Kunden liegt
  var hw = document.getElementById('hw-form');
  if (hw) {
    var eur2 = function(v){ return Math.round(v).toLocaleString('de-DE') + '\u00a0€'; };
    var w = function(id){ return +document.getElementById(id).value; };
    var hwRechne = function(){
      var abend = w('hw-a'), tage = w('hw-t'), umsatz = w('hw-u') * 1000;
      var stunden = abend * 46, abende = Math.round(stunden / 3);
      var liegt = umsatz * 12 / 365 * tage, frei = umsatz * 12 / 365 * Math.max(tage - 3, 0);
      document.getElementById('hw-abend').textContent = abend + '\u00a0Std.';
      document.getElementById('hw-tage').textContent = tage + '\u00a0Tage';
      document.getElementById('hw-umsatz').textContent = eur2(umsatz);
      document.getElementById('hw-stunden').textContent = abende.toLocaleString('de-DE') + '\u00a0Abende';
      document.getElementById('hw-liegt').textContent = eur2(liegt);
      document.getElementById('hw-frei').textContent = eur2(frei);
    };
    hw.addEventListener('input', hwRechne); hwRechne();
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
