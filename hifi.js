/* ---------------------------------------------------------------------
   Bloom Dental — shared page behaviour.

   Everything below runs only once the DOM is ready. That matters because
   this file is also loaded inside Webflow, where the markup lives in an
   Embed element and the script tag may end up running before that markup
   exists. Without this, every lookup returns null and nothing initialises.
   --------------------------------------------------------------------- */
(function(){
  function boot(){

    (function(){
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      /* ----- hero slideshow: slow cross-dissolve, no dip to black ----- */
      var heroSlides = document.getElementById('heroSlides');
      if (heroSlides) {
        var sl = [].slice.call(heroSlides.querySelectorAll('.sl'));
        var HOLD = 6800, FADE = 2600, cur = 0, zc = 1;

        // 依序預載，第一張已內嵌
        function preload(i){
          if (i >= sl.length) return;
          var src = sl[i].getAttribute('data-src');
          if (!src) { preload(i+1); return; }
          var im = new Image();
          im.onload = im.onerror = function(){ sl[i].style.backgroundImage = "url('" + src + "')"; preload(i+1); };
          im.src = src;
        }
        preload(1);

        if (!reduce && sl.length > 1) {
          setInterval(function(){
            var next = (cur + 1) % sl.length;
            if (!sl[next].style.backgroundImage) return;   // 尚未載完就跳過這輪
            zc++;
            sl[next].style.zIndex = zc;                     // 新的一張疊在最上層淡入
            sl[next].classList.add('on');                   // 舊的維持不透明，避免中間變暗
            var showing = next;
            setTimeout(function(){
              sl.forEach(function(s, k){
                if (k === showing) return;
                s.style.transition = 'none';
                s.classList.remove('on');
                s.style.zIndex = 0;
                void s.offsetWidth;
                s.style.transition = '';
              });
            }, FADE + 120);
            cur = next;
          }, HOLD + FADE);
        }

        if (!reduce) {
          var ticking = false;
          window.addEventListener('scroll', function(){
            if (ticking) return; ticking = true;
            requestAnimationFrame(function(){
              var y = window.scrollY;
              if (y < 1200) heroSlides.style.transform = 'translateY(' + (-y * 0.06) + 'px)';
              ticking = false;
            });
          }, {passive:true});
        }
      }

      /* Guarded: this file also runs inside Webflow, where the markup arrives in
         an Embed element and may not be in the DOM when the script executes. */
      var nav = document.getElementById('nav');
      if (nav) {
        var onScroll = function(){ nav.classList.toggle('solid', window.scrollY > 60); };
        onScroll(); window.addEventListener('scroll', onScroll, {passive:true});
      }

      var revs = document.querySelectorAll('.rv');
      if ('IntersectionObserver' in window && !reduce) {
        var io = new IntersectionObserver(function(es){
          es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
        }, {threshold:0.12, rootMargin:'0px 0px -70px 0px'});
        revs.forEach(function(el){ io.observe(el); });
      } else { revs.forEach(function(el){ el.classList.add('in'); }); }

      function runCount(el){
        var fixed = el.getAttribute('data-fixed');
        var target = fixed ? parseFloat(fixed) : parseInt(el.getAttribute('data-int'), 10);
        var render = function(v){ el.textContent = fixed ? v.toFixed(1) : Math.round(v); };
        if (reduce) { render(target); return; }
        var dur=1200, t0=performance.now();
        (function step(now){
          var p=Math.min((now-t0)/dur,1), e=1-Math.pow(1-p,3);
          render(target*e);
          if(p<1) requestAnimationFrame(step);
        })(performance.now());
      }
      var counters = document.querySelectorAll('[data-count]');
      if ('IntersectionObserver' in window) {
        var cio=new IntersectionObserver(function(es){
          es.forEach(function(e){ if(e.isIntersecting){ runCount(e.target); cio.unobserve(e.target);} });
        },{threshold:0.6});
        counters.forEach(function(el){ cio.observe(el); });
      } else { counters.forEach(runCount); }
    })();

    /* service-page hero: single photo, same slow parallax */
    (function(){
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var ph = document.querySelector('.hero-photo');
      if (!ph || reduce) return;
      var ticking = false;
      window.addEventListener('scroll', function(){
        if (ticking) return; ticking = true;
        requestAnimationFrame(function(){
          var y = window.scrollY;
          if (y < 1200) ph.style.transform = 'translateY(' + (-y * 0.06) + 'px) scale(1.06)';
          ticking = false;
        });
      }, {passive:true});
      ph.style.transform = 'scale(1.06)';
    })();

    /* ---------------------------------------------------------------------
       Mobile navigation. Builds a call button, a burger and a full-screen
       menu out of the existing desktop nav, so there is one source of truth
       for the links. Roughly half of Bloom's traffic is phone.
       --------------------------------------------------------------------- */
    (function(){
      var nav = document.getElementById('nav');
      if (!nav || nav.querySelector('.nav-mobile')) return;
      var inner = nav.querySelector('.nav-in');
      var links = nav.querySelector('.nav-links');
      if (!inner || !links) return;

      var PHONE = 'tel:+16504583727', PHONE_LABEL = '(650) 458-3727';
      var phoneSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>';

      /* Bar holds the burger only. Booking and calling live in the sticky
         action bar at the bottom, inside easy thumb reach. */
      var bar = document.createElement('div');
      bar.className = 'nav-mobile';
      var burger = document.createElement('button');
      burger.className = 'burger';
      burger.type = 'button';
      burger.setAttribute('aria-label', 'Open menu');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-controls', 'mnav');
      burger.innerHTML = '<span></span><span></span>';
      bar.appendChild(burger);
      inner.appendChild(bar);

      /* --- panel, built from the desktop links --- */
      var panel = document.createElement('div');
      panel.className = 'mnav';
      panel.id = 'mnav';
      var box = document.createElement('div');
      box.className = 'mnav-in';

      var services = links.querySelectorAll('.drop-menu a');
      if (services.length) {
        var k = document.createElement('span');
        k.className = 'mnav-k';
        k.textContent = 'Services';
        box.appendChild(k);
        var sub = document.createElement('div');
        sub.className = 'mnav-sub';
        Array.prototype.forEach.call(services, function(a){
          var c = a.cloneNode(true);
          sub.appendChild(c);
        });
        box.appendChild(sub);
        box.appendChild(Object.assign(document.createElement('span'), {className:'mnav-sep'}));
      }

      var cta = null;
      Array.prototype.forEach.call(links.children, function(el){
        if (el.classList.contains('drop')) return;
        if (el.tagName !== 'A') return;
        if (el.classList.contains('nav-cta')) { cta = el; return; }
        if (el.classList.contains('nav-tel')) return;   // phone is added below
        box.appendChild(el.cloneNode(true));
      });

      var tel = document.createElement('a');
      tel.className = 'mnav-tel';
      tel.href = PHONE;
      tel.textContent = PHONE_LABEL;
      box.appendChild(tel);

      var book = document.createElement('a');
      book.className = 'mnav-cta';
      book.href = cta ? cta.getAttribute('href') : '#';
      book.target = '_blank';
      book.rel = 'noopener';
      book.textContent = cta ? cta.textContent.trim() : 'Book appointment';
      box.appendChild(book);

      var foot = document.createElement('div');
      foot.className = 'mnav-foot';
      foot.innerHTML = 'Bloom Dental Group<br>800 S B St, Suite 200, San Mateo, CA 94401<br>Mon&ndash;Fri 8am&ndash;5pm';
      box.appendChild(foot);

      panel.appendChild(box);
      document.body.appendChild(panel);

      /* --- open / close --- */
      var open = false;
      function stagger(){
        var items = panel.querySelectorAll('a');
        Array.prototype.forEach.call(items, function(a, i){
          a.style.transitionDelay = open ? (0.05 + i * 0.035).toFixed(3) + 's' : '0s';
        });
      }
      function setOpen(next){
        open = next;
        panel.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        document.body.classList.toggle('mnav-lock', open);
        stagger();
      }
      burger.addEventListener('click', function(){ setOpen(!open); });
      panel.addEventListener('click', function(e){
        if (e.target.tagName === 'A') setOpen(false);
      });
      document.addEventListener('keydown', function(e){
        if (e.key === 'Escape' && open) setOpen(false);
      });
      window.addEventListener('resize', function(){
        if (open && window.innerWidth > 1000) setOpen(false);
      });
    })();

    /* ---------------------------------------------------------------------
       Bubbly directional button fill.
       Injects a hidden 10x2 cell grid into every .btn so the hover fill
       originates from the edge the cursor actually crossed. Pure CSS after
       this — the JS only builds the cells so the markup stays readable.
       --------------------------------------------------------------------- */
    (function(){
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      document.querySelectorAll('.btn').forEach(function(b){
        if (b.querySelector('.btn-cells')) return;
        var content = document.createElement('span');
        content.className = 'btn-content';
        while (b.firstChild) content.appendChild(b.firstChild);
        var cells = document.createElement('span');
        cells.className = 'btn-cells';
        cells.setAttribute('aria-hidden', 'true');
        for (var i = 0; i < 20; i++) cells.appendChild(document.createElement('i'));
        b.appendChild(cells);
        b.appendChild(content);
      });
    })();

    /* ---------------------------------------------------------------------
       Sticky action bar (phones). Appears once the hero's own CTAs are gone,
       retreats when the closing CTA is on screen so the two never compete —
       which also means the footer is never covered. Driven by position, not
       scroll direction: people scroll back up to re-read before they convert,
       and that is the worst possible moment to take the button away.
       --------------------------------------------------------------------- */
    (function(){
      if (document.querySelector('.abar')) return;
      var hero = document.querySelector('.hero');
      if (!hero) return;

      var PHONE = 'tel:+16504583727';
      var phoneSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>';
      var isEmergency = !!document.querySelector('.hero-emg');

      /* The booking destination lives in the markup, on the nav CTA, so the
         portal URL has a single source of truth per page rather than being
         duplicated here. */
      var navCta = document.querySelector('.nav-cta');
      var BOOK = navCta ? navCta.getAttribute('href') : '#';

      var bar = document.createElement('div');
      bar.className = 'abar' + (isEmergency ? ' emg' : '');
      var callLabel = isEmergency ? 'Call now' : 'Call';
      var bookLabel = isEmergency ? 'Book' : 'Book an appointment';
      bar.innerHTML =
        '<span class="abar-scrim" aria-hidden="true"></span>' +
        '<a class="abar-call" href="' + PHONE + '">' + phoneSvg + callLabel + '</a>' +
        '<a class="abar-book" href="' + BOOK + '" target="_blank" rel="noopener">' + bookLabel + '</a>';
      document.body.appendChild(bar);

      /* Direction-driven, with a movement threshold so the small back-and-forth
         of real thumb scrolling does not make the buttons flicker. Down reveals,
         up hides; inside the hero they stay away because the hero has its own
         CTAs right there. */
      var THRESH = 48;
      var lastY = window.pageYOffset || 0, acc = 0, shown = false;

      function setShown(next){
        if (next === shown) return;
        shown = next;
        bar.classList.toggle('on', shown);
      }

      function evaluate(){
        var y = window.pageYOffset || 0;
        var max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        var dy = y - lastY;
        lastY = y;

        /* ignore iOS rubber-band overscroll at either end */
        if (y < 0 || y > max) return;

        if (hero.getBoundingClientRect().bottom > 60) { acc = 0; setShown(false); return; }

        if (dy > 0) acc = (acc > 0 ? acc : 0) + dy;
        else if (dy < 0) acc = (acc < 0 ? acc : 0) + dy;

        if (acc > THRESH) { setShown(true); acc = 0; }
        else if (acc < -THRESH) { setShown(false); acc = 0; }

        bar.classList.toggle('on-dark', overDark());
      }

      /* Which kind of section sits under the buttons right now. Checked against
         the known dark sections by geometry rather than hit-testing, which would
         be thrown off by the bar's own pointer-events rules. */
      var darkEls = document.querySelectorAll('.close, .band, .hero');
      function overDark(){
        var probe = window.innerHeight - 46;
        for (var i = 0; i < darkEls.length; i++) {
          var r = darkEls[i].getBoundingClientRect();
          if (r.top <= probe && r.bottom >= probe) return true;
        }
        return false;
      }

      var ticking = false;
      function onScroll(){
        if (ticking) return; ticking = true;
        requestAnimationFrame(function(){ evaluate(); ticking = false; });
      }
      window.addEventListener('scroll', onScroll, {passive:true});
      window.addEventListener('resize', onScroll, {passive:true});
      evaluate();
    })();

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
