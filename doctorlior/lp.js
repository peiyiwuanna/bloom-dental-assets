/* Dr. Lior cosmetic LP behaviour. Built by build_lp.py. Runs after the embed markup (loaded before </body>). */
(function(){
  var IMG = "https://cdn.jsdelivr.net/gh/peiyiwuanna/bloom-dental-assets@f5895e16db4b66234904170918ce25c75e75899a/doctorlior/cases/";
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var desktop = matchMedia('(min-width: 1024px)');
  /* f = cases for this concern (Anna's mapping, 10/27); files are normalized: before 768x384 over after 768x384 */
  var concerns = [
    {tag:"Shade", c:"Stained or yellow", s:"Coffee, tea, wine or time", d:"Surface stains, or discoloration deeper in the tooth that whitening can't reach.",
     t:"Stained or yellow teeth", rx:"Whitening, or porcelain veneers for deeper stains",
     b:"Surface stains from coffee, tea or wine usually respond to whitening. Some discoloration sits inside the tooth, where whitening can't reach. There, porcelain veneers set a new shade, and porcelain resists staining.", f:["nig7.jpg"]},
    {tag:"Shape", c:"Chipped or worn", s:"Short, uneven or rough edges", d:"Edges worn down by grinding, or small chips and cracks.",
     t:"Chipped, worn or uneven teeth", rx:"Porcelain veneers",
     b:"Years of grinding or clenching wear the front edges down and leave them rough. Chips and small cracks do the same. Veneers rebuild the shape and length each tooth has lost.", f:["n5.jpg","np2.jpg"]},
    {tag:"Spacing", c:"Gaps", s:"Spaces between front teeth", d:"Spaces that show when you smile or speak.",
     t:"Gaps between teeth", rx:"Porcelain veneers",
     b:"Veneers bonded to the teeth beside a gap make them slightly wider, so the space closes. How many teeth that involves depends on the size of the gap and the shape of your smile.", f:["n20.jpg","n23.jpg"]},
    {tag:"Gumline", c:"A gummy smile", s:"More gum than tooth shows", d:"Teeth that look short because the gumline sits low.",
     t:"A gummy smile", rx:"Gum contouring",
     b:"When the gumline sits low, teeth can look short even when they're healthy. Gum contouring reshapes the gumline so more of each tooth shows. If the teeth need reshaping too, veneers are planned alongside it.", f:["n12.jpg","np23.jpg","np12.jpg"]},
    {tag:"Restorations", c:"Old dental work", s:"Crowns or fillings that show", d:"Crowns or fillings that no longer match the teeth around them.",
     t:"Old dental work that looks dated", rx:"Replacing it within a smile makeover",
     b:"Older crowns and fillings often stop matching the teeth around them. They darken, show a grey edge at the gumline, or simply look like dental work. Replacing them in one plan brings shade and shape back in line with the rest of your smile.", f:["n19.jpg","n7.jpg"]},
    {tag:"Function", c:"A bite that's breaking down", s:"Worn, broken or missing teeth", d:"Many teeth affected at once, and the bite with them.",
     t:"A bite that's breaking down", rx:"Full mouth rehabilitation",
     b:"When many teeth are worn, broken or missing, fixing them one at a time rarely holds up. Full mouth rehabilitation plans every tooth together, rebuilding the bite and the look of your smile as one.", f:["n24.jpg","n69c.jpg"]}
  ];

  /* flip cards */
  var flips = document.getElementById('flips');
  flips.innerHTML = concerns.map(function(c, k){
    return '<div class="flip rv' + (k % 3 ? ' d' + (k % 3) : '') + '" data-k="' + k + '"><div class="in">' +
      '<div class="f" tabindex="0" role="button" aria-label="' + c.c + ': show details"><h3>' + c.c + '</h3><span class="s">' + c.s + '</span><span class="lk">See details →</span></div>' +
      '<div class="b"><h3>' + c.c + '</h3><p>' + c.d + '</p>' +
      '<button class="more go" type="button" data-k="' + k + '" aria-label="See details for ' + c.c + '">See details <i>→</i></button><div class="im" style="background-image:url(' + IMG + c.f[0] + ')"><span class="tag t1">Before</span></div>' +
      '</div>' +
      '</div></div>';
  }).join('');

  /* touch: tap the front to flip; tap again (or another card) to flip back */
  flips.addEventListener('click', function(e){
    var go = e.target.closest('.go[data-k]');
    if (go){ e.stopPropagation(); open(go.dataset.k); return; }
    if (e.target.closest('.dt')) return;
    var fc = e.target.closest('.flip'); if (fc) open(fc.dataset.k);
  });
  flips.addEventListener('keydown', function(e){
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('f')){ e.preventDefault(); var k = e.target.closest('.flip').dataset.k; open(k); }
  });

  /* before/after compare: seam follows the mouse; eases back to the middle on leave */
  function bindBA(el){
    el.addEventListener('pointermove', function(e){
      if (e.pointerType !== 'mouse') return;
      var r = el.getBoundingClientRect();
      el.classList.remove('ease');
      el.style.setProperty('--x', Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)) + '%');
    });
    el.addEventListener('pointerleave', function(){ el.classList.add('ease'); el.style.setProperty('--x', '50%'); });
  }
  function baHTML(f, ph){
    return '<div class="ba' + (ph ? ' ph' : '') + '"' + (ph ? ' data-ph="' + ph + '"' : '') + '><img class="full" loading="lazy" src="' + IMG + f + '" alt="Before and after, patient of Dr. Lior"><div class="l b" style="background-image:url(' + IMG + f + ')"></div><div class="l a" style="background-image:url(' + IMG + f + ')"></div><div class="seam"></div><span class="tag t1">Before</span><span class="tag t2">After</span></div>';
  }

  var ba = document.getElementById('aBa'), casesEl = document.getElementById('aCases');
  bindBA(ba);
  function setCase(f){
    ba.querySelector('.full').src = IMG + f;
    ba.querySelectorAll('.l').forEach(function(l){ l.style.backgroundImage = 'url(' + IMG + f + ')'; });
    casesEl.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.f === f ? 'true' : 'false'); });
    /* a short sweep shows the visitor the photo can be compared */
    if (fine && !reduce){
      ba.classList.add('ease'); ba.style.setProperty('--x', '78%');
      setTimeout(function(){ ba.style.setProperty('--x', '50%'); }, 650);
    }
  }
  casesEl.addEventListener('click', function(e){ var b = e.target.closest('button'); if (b) setCase(b.dataset.f); });
  function show(k){
    var c = concerns[k];
    flips.querySelectorAll('.flip').forEach(function(el){ el.classList.toggle('sel', el.dataset.k == k); });
    document.getElementById('aTitle').textContent = c.t;
    document.getElementById('aRx').textContent = c.rx;
    document.getElementById('aBody').textContent = c.b;
    casesEl.hidden = c.f.length < 2;
    casesEl.innerHTML = c.f.length > 1 ? '<div class="ch">' + c.f.length + ' cases · choose one</div><div class="row">' + c.f.map(function(f, i){ return '<button type="button" data-f="' + f + '" aria-label="Case ' + (i + 1) + '"><span class="th" style="background-image:url(' + IMG + f + ')"></span><span class="cn">Case ' + (i + 1) + '</span></button>'; }).join('') + '</div>' : '';
    setCase(c.f[0]);
  }

  /* detail opens inline, under the row of the chosen card; × / Esc / the same card closes it */
  var dt = document.getElementById('dt'), cur = null;
  function cols(){ return getComputedStyle(flips).gridTemplateColumns.split(' ').length; }
  function place(k){
    var cards = flips.querySelectorAll('.flip'), n = cols();
    cards[Math.min(Math.floor(k / n) * n + n - 1, cards.length - 1)].after(dt);
  }
  function glide(el, off){
    var y = el.getBoundingClientRect().top + scrollY - off;
    if (window.__lenis) window.__lenis.scrollTo(y, {duration: 1}); else window.scrollTo({top: y, behavior: reduce ? 'auto' : 'smooth'});
  }
  function open(k, quiet){
    k = +k;
    if (cur === k && !quiet){ close(); return; }
    var sameRow = cur !== null && Math.floor(cur / cols()) === Math.floor(k / cols());
    show(k);
    if (!sameRow){
      dt.classList.remove('open'); dt.hidden = true;
      place(k);
      dt.hidden = false; void dt.offsetHeight; dt.classList.add('open');
    }
    cur = k;
    if (window.__lenis) setTimeout(function(){ window.__lenis.resize(); }, 650);
    if (!quiet) setTimeout(function(){ glide(dt, Math.min(innerHeight * .28, 260)); }, sameRow ? 0 : 60);
  }
  function close(){
    if (cur === null) return;
    var card = flips.querySelector('.flip[data-k="' + cur + '"]');
    dt.classList.remove('open'); cur = null;
    flips.querySelectorAll('.flip.sel,.flip.on').forEach(function(x){ x.classList.remove('sel', 'on'); });
    setTimeout(function(){ if (cur === null){ dt.hidden = true; if (window.__lenis) window.__lenis.resize(); } }, 600);
    if (card && card.getBoundingClientRect().top < 0) glide(card, 100);
  }
  document.getElementById('aClose').addEventListener('click', close);
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
  addEventListener('resize', function(){ if (cur !== null) place(cur); });
  document.querySelectorAll('.see').forEach(function(el){
    el.addEventListener('click', function(){ open(el.dataset.go, true); glide(dt, 220); });
  });

  /* treatments on phones: swipe the top card away (either side) to bring up the next */
  (function(){
    var list = document.querySelector('.t-list'), ctl = document.getElementById('tCtl'), num = document.getElementById('tNum');
    var cards = [].slice.call(list.querySelectorAll('.tcard')), order = cards.map(function(_, i){ return i; });
    var hint = document.getElementById('tHint'), used = false, nudges = 0, timer = null;
    var phone = matchMedia('(max-width:760px)');
    function layout(){
      order.forEach(function(ci, pos){
        var c = cards[ci]; c.style.setProperty('--pos', pos); c.style.setProperty('--fx', pos ? (pos % 2 ? 1 : -1) : 0); c.classList.toggle('top', pos === 0);
        if (phone.matches) c.setAttribute('aria-hidden', pos ? 'true' : 'false'); else c.removeAttribute('aria-hidden');
      });
      num.textContent = (order[0] + 1) + ' / ' + cards.length;
    }
    /* the hint sits over the top card's photo until the visitor swipes or uses the arrows */
    function placeHint(){ var f = cards[order[0]].querySelector('figure'); if (f) hint.style.setProperty('--hy', (f.offsetTop + f.offsetHeight / 2 + list.offsetTop) + 'px'); }
    function use(){ if (used) return; used = true; hint.classList.add('off'); clearInterval(timer); }
    function nudge(){ var c = cards[order[0]]; c.classList.remove('nudge'); void c.offsetWidth; c.classList.add('nudge'); if (++nudges >= 3) clearInterval(timer); }
    function next(dir){
      var c = cards[order[0]];
      c.classList.remove('drag', 'nudge'); c.classList.add('fly');
      c.style.transform = 'translateX(' + (dir > 0 ? 120 : -120) + 'vw) rotate(' + (dir > 0 ? 14 : -14) + 'deg)';
      setTimeout(function(){
        c.classList.remove('fly'); c.classList.add('drag'); c.style.transform = '';
        order.push(order.shift()); layout();
        void c.offsetHeight; c.classList.remove('drag');
      }, 340);
    }
    function back(){ order.unshift(order.pop()); layout(); }
    var x0 = null, dx = 0, top;
    list.addEventListener('pointerdown', function(e){
      if (!phone.matches || e.target.closest('a,button')) return;
      top = e.target.closest('.tcard.top'); if (!top) return;
      x0 = e.clientX; dx = 0; top.classList.remove('nudge'); clearInterval(timer);
    });
    list.addEventListener('pointermove', function(e){
      if (x0 === null) return;
      dx = e.clientX - x0; top.classList.add('drag');
      top.style.transform = 'translateX(' + dx + 'px) rotate(' + dx / 22 + 'deg)';
    });
    function end(){
      if (x0 === null) return; x0 = null;
      if (Math.abs(dx) > 70){ use(); next(dx > 0 ? 1 : -1); }
      else { top.classList.remove('drag'); top.style.transform = ''; }
    }
    list.addEventListener('pointerup', end); list.addEventListener('pointercancel', end);
    ctl.addEventListener('click', function(e){ var b = e.target.closest('button'); if (!b) return; use(); if (b.dataset.d > 0) next(-1); else back(); });
    function mode(){ ctl.hidden = !phone.matches; cards.forEach(function(c){ c.style.transform = ''; }); layout(); placeHint(); }
    addEventListener('resize', placeHint); addEventListener('load', placeHint);
    phone.addEventListener('change', mode); mode();
    /* while the stack is on screen and untouched, the top card wiggles (up to three times) */
    if (!reduce && 'IntersectionObserver' in window){
      new IntersectionObserver(function(es){
        clearInterval(timer);
        if (es[0].isIntersecting && phone.matches && !used && nudges < 3){ placeHint(); setTimeout(nudge, 300); timer = setInterval(nudge, 3200); }
      }, {threshold: .5}).observe(list);
    }
  })();

  /* results */
  /* six cases open; six more behind "Show more" (phones swipe through all twelve) */
  /* most dramatic cases first (Lior, 10/29); no treatment captions, per Lior */
  var gallery = ["n21.jpg","n6.jpg","n26.jpg","n2c.jpg","n35.jpg","n27.jpg","n32.jpg","n70c.jpg","n25.jpg","n31.jpg","n22.jpg","n72.jpg","nig5.jpg","nig1.jpg"];
  var rgrid = document.getElementById('rgrid');
  rgrid.innerHTML = gallery.map(function(f, i){
    return '<div class="' + (i < 6 ? 'rv' + (i % 3 ? ' d' + (i % 3) : '') : 'more') + '">' + baHTML(f) + '</div>';
  }).join('');
  rgrid.querySelectorAll('.ba').forEach(bindBA);
  var moreBtn = document.getElementById('moreBtn');
  moreBtn.addEventListener('click', function(){
    var open = rgrid.classList.toggle('open');
    moreBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    moreBtn.querySelector('span').textContent = open ? 'Show fewer cases' : 'Show more cases';
    if (window.__lenis) window.__lenis.resize();
  });

  /* reviews: doctorlior.com testimonials + public reviews already used on the Bloom pages */
  var reviews = [
    ["Felicia H.", "Google", "Dr. Lior Tamir is a true artist. He’s changed my life. My only regret is I wish I met him sooner. If you’re debating because of the cost don’t, you deserve to look and feel your best. I had severe dental anxiety because of a lifetime of bad dentistry after accidents to my teeth. I have lived hiding my teeth and I don’t have to do that anymore. This is my third time with trying to fix the damage my poor teeth have endured and third time was truly the charm. Look at his instagram if you want to see his transformations. You really won’t regret going to see him even for a consultation. He is funny and eases your anxiety I promise."],
    ["Sophia C.", "Yelp", "Dr. Lior did my revision veneer case earlier this year and I couldn't be happier. A true master of his craft, he uses the latest in technology and facial esthetic techniques. He was able to mock up my new smile so I had a good idea of what my smile would look like before we started working on my teeth. Some of the veneers didn't require any shaving of my teeth and the final veneers are made by hand by an artist. Do your research! If you want the best, look no further! Thank you so much for my smile!"],
    ["Julia H.", "Yelp", "Dr. Lior Tamir at Bloom Dental had completed extensive replacement of my old crowns with addition of multiple veneers and the outcome has been an amazing transformation, both esthetically and emotionally. I feel like a new person : ) The complements of my smile have been heartwarming. During the restoration, the entire process has been explained to me in a manner that I could fully understand. He used lots of visual tools to ensure that I was a part of the decision making and fully understood the expected results he can achieve."],
    ["Yaprak A.", "", "Dr. Tamir went through the treatment plan with me with visuals and made sure I am well educated of every step. You can tell he cares about his patients."],
    ["Benjamin W.", "Google", "What truly sets Dr. Tamir apart is his commitment to perfection. He meticulously ensures a perfect fit before you leave his chair. I only wish I had found him before my previous procedures — the difference in quality is night and day."],
    ["Natasha B.", "", "Dr. Tamir was flawless. Competent, caring, enlightening. A sheer delight to be in his space."],
    ["Masha N.", "", "As a dentist myself, I was really looking to find another dentist who shares my philosophy on minimally invasive dentistry. Dr. Tamir and his staff were so incredibly thorough, gentle, informative, and the office was beautiful, sparkling clean, and equipped with the latest technology."],
    ["Adam B.", "Yelp", "I came in for a crown that my previous dentist told me I needed. During the exam Dr. Tamir noticed that in fact I didn't need the crown. He took x-rays to be safe and saw no crack — saving me money and my tooth."],
    ["Nicole P.", "", "Dr. Tamir is an absolutely exceptional dentist, extremely thorough, knowledgeable, patient, friendly and always honest. He takes the time to properly diagnose and address whatever problem there is, takes no shortcuts."],
    ["Rachel G.", "", "Dr. Tamir and the staff took the time to build trust, explain what was happening and put a plan together that was smart for longevity not just the here and now."],
    ["Theresa M.", "", "Dr. Tamir is honest and amazingly skilled. This office has state of the art dental technology with a rockstar staff. I would highly recommend — you won't be disappointed."],
    ["Andy G.", "", "Dr. Tamir and his supporting team are as skillful as they come. Not only do they strive to provide the best possible dental care but along with it the best possible customer experience."]
  ];
  function revHTML(r, clone){
    return '<figure class="rev' + (r[2].length > 300 ? ' long' : '') + '"' + (clone ? ' aria-hidden="true"' : '') + '><span class="st" aria-label="5 stars">★★★★★</span><p>“' + r[2] + '”</p><figcaption class="who"><b>' + r[0] + '</b>' + (r[1] ? ' · ' + r[1] : '') + '</figcaption></figure>';
  }
  var mTrack = document.getElementById('mTrack');
  mTrack.innerHTML = reviews.map(function(r){ return revHTML(r); }).join('') + (reduce ? '' : reviews.map(function(r){ return revHTML(r, true); }).join(''));

  /* headline per ad. ?v= is a short code set in the ad's final URL (never patient input) */
  var variants = {
    vn: {k:"Porcelain veneers · San Mateo", h:'<span class="ln">Porcelain veneers,</span><span class="ln">designed around</span><span class="ln">your <em>face.</em></span>',
         l:"Handmade porcelain veneers, made by a master ceramist.", c:1},
    sm: {k:"Smile makeover · San Mateo", h:'<span class="ln">One plan for</span><span class="ln">your whole <em>smile.</em></span>',
         l:"Veneers, whitening and gum contouring with Dr. Lior Tamir in San Mateo, decided together rather than one at a time.", c:4},
    fm: {k:"Full mouth rehabilitation · San Mateo", h:'<span class="ln">Your whole bite,</span><span class="ln">planned around</span><span class="ln">your <em>face.</em></span>',
         l:"Full mouth rehabilitation with Dr. Lior Tamir in San Mateo, rebuilding your bite and your smile in one plan.", c:5},
    gc: {k:"Gum contouring · San Mateo", h:'<span class="ln">A gumline in</span><span class="ln">proportion with</span><span class="ln">your <em>smile.</em></span>',
         l:"Gum contouring with Dr. Lior Tamir in San Mateo, so your teeth show at their full length.", c:3}
  };
  var v = new URLSearchParams(location.search).get('v') || '', start = 0;
  if (variants[v]){
    document.getElementById('hKicker').textContent = variants[v].k;
    document.getElementById('hTitle').innerHTML = variants[v].h;
    document.getElementById('hLede').textContent = variants[v].l;
    start = variants[v].c;
  }
  if (variants[v]) open(start, true);


  /* hero video: phones get a lighter 960px cut; skipped for reduced motion or Save-Data */
  var vid = document.getElementById('heroVid');
  var saveData = navigator.connection && navigator.connection.saveData;
  if (!reduce && !saveData){
    var src = vid.dataset.src;
    if (!desktop.matches) src = src.replace('.mp4', '-m.mp4');
    else if (vid.canPlayType('video/webm; codecs="vp9"')) src = src.replace('.mp4', '.webm');
    vid.src = src;
    vid.preload = 'auto';
    vid.addEventListener('playing', function(){ vid.classList.add('on'); }, {once:true});
    var p = vid.play(); if (p && p.catch) p.catch(function(){});
  }

  /* the pinned hero is taller than the screen: pin it at the point where its bottom edge is in view */
  var pin = document.querySelector('.hero-pin');
  function setPin(){ pin.style.setProperty('--pin', Math.min(0, innerHeight - pin.offsetHeight) + 'px'); }
  setPin(); addEventListener('resize', setPin);

  /* smooth scroll (desktop mouse only) + scroll-linked depth */
  var media = document.getElementById('heroMedia'), closingBg = document.getElementById('closingBg');
  var pars = document.querySelectorAll('.par');
  function depth(){
    var y = scrollY, h = innerHeight;
    if (y < h * 1.2) media.style.transform = 'translate3d(0,' + (y * .25) + 'px,0) scale(' + (1 + Math.min(y, h) / h * .08) + ')';
    pars.forEach(function(im){
      var r = im.parentNode.getBoundingClientRect(); if (r.bottom < 0 || r.top > h) return;
      var t = (r.top + r.height / 2 - h / 2) / h;
      im.style.transform = 'translate3d(0,' + (t * -100 * im.dataset.speed) + '%,0)';
    });
    var rc = closingBg.getBoundingClientRect();
    if (rc.top < h && rc.bottom > 0) closingBg.style.transform = 'translate3d(0,' + ((rc.top + rc.height / 2 - h / 2) / h * -8) + '%,0)';
  }
  if (!reduce){
    var lenis = null;
    window.addEventListener('load', function(){
      if (fine && desktop.matches && window.Lenis){
        lenis = window.__lenis = new Lenis({lerp: .085, smoothWheel: true});
        lenis.on('scroll', depth);
        (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
      }
    });
    addEventListener('scroll', function(){ if (!lenis) requestAnimationFrame(depth); }, {passive:true});
    depth();
  }

  /* observers: reveal, mini header, sticky bar */
  var mini = document.getElementById('mini'), sticky = document.getElementById('sticky');
  var heroGone = false, closingIn = false, phoneBar = matchMedia('(max-width:760px)');
  function bars(){
    mini.classList.toggle('on', heroGone);
    mini.setAttribute('aria-hidden', heroGone ? 'false' : 'true');
    mini.querySelectorAll('a').forEach(function(a){ a.tabIndex = heroGone ? 0 : -1; });
    /* phones have no CTA in the hero, so the bar is there from the first screen */
    sticky.classList.toggle('on', (heroGone || phoneBar.matches) && !closingIn);
  }
  phoneBar.addEventListener('change', bars);
  /* the hero stays pinned behind the page, so "gone" = the content above it has covered the CTA area */
  var after = document.querySelector('.after-hero'), heroCtas = document.querySelector('.hero .ctas');
  function heroState(){
    var r = (heroCtas.offsetParent ? heroCtas : document.getElementById('hLede')).getBoundingClientRect();
    var gone = after.getBoundingClientRect().top < Math.min(innerHeight, r.bottom + 20) || r.bottom < 0;
    if (gone !== heroGone){
      heroGone = gone; bars();
      if (vid.src){ if (gone) vid.pause(); else { var q = vid.play(); if (q && q.catch) q.catch(function(){}); } }
    }
  }
  addEventListener('scroll', heroState, {passive:true}); heroState();
  if ('IntersectionObserver' in window){
    var ro = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); ro.unobserve(e.target); } }); }, {rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('.rv').forEach(function(el){ ro.observe(el); });
    new IntersectionObserver(function(es){ closingIn = es[0].isIntersecting; bars(); }, {threshold:.25}).observe(document.getElementById('closing'));
  } else {
    document.querySelectorAll('.rv').forEach(function(el){ el.classList.add('in'); });
  }

  /* FAQ: one answer open at a time (name="faq" does this natively; this covers older browsers) */
  document.querySelectorAll('.faq details').forEach(function(d, _, all){
    d.addEventListener('toggle', function(){ if (d.open) all.forEach(function(o){ if (o !== d) o.open = false; }); });
  });

  /* map card: tap to choose Google or Apple Maps */
  (function(){
    var wrap = document.querySelector('.cmap-wrap'), btn = wrap.querySelector('.cmap'), pop = wrap.querySelector('.cmap-pop');
    function shut(){ pop.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function(e){ e.stopPropagation(); pop.hidden = !pop.hidden; btn.setAttribute('aria-expanded', pop.hidden ? 'false' : 'true'); });
    document.addEventListener('click', function(e){ if (!wrap.contains(e.target)) shut(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') shut(); });
  })();

  document.getElementById('video').addEventListener('click', function(){
    this.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/G0lnvcl38W4?autoplay=1&rel=0" title="The why behind the work" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
  }, {once:true});

})();
