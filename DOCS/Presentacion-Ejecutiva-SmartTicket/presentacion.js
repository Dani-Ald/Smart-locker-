(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const previous = document.getElementById('prev');
  const next = document.getElementById('next');
  const screenPrevious = document.getElementById('screen-prev');
  const screenNext = document.getElementById('screen-next');
  const screenContent = document.getElementById('screen-content');
  const screenTitle = document.getElementById('journey-title');
  const screenDescription = document.getElementById('journey-description');
  const screenCount = document.getElementById('journey-count');
  const screenTag = document.getElementById('journey-tag');
  const screenDots = document.getElementById('screen-dots');
  const fullscreen = document.getElementById('fullscreen');
  const phoneHeader = '<div class="screen-status"><span>9:41</span><span>● ● ▰</span></div><div class="screen-logo">smart<span>ticket</span></div>';
  const bottom = '<div class="mock-bottom">⌂　　　 ▣　　　 ◷　　　 ◉</div>';
  const screens = [
    { title: 'Bienvenida', tag: 'INICIO', description: 'Al abrir Smart Ticket, la identidad de la aplicación introduce la experiencia mientras se prepara el inicio.', body: '<div style="height:70%;display:grid;place-items:center;text-align:center"><div><div style="font-size:55px;color:#1557ff">✳</div><div class="screen-logo" style="font-size:24px">smart<span>ticket</span></div><p>Tus experiencias, contigo.</p></div></div>' },
    { title: 'Preparando tu experiencia', tag: 'CARGA', description: 'La aplicación muestra un estado de carga mientras restaura la información necesaria para continuar.', body: `${phoneHeader}<div style="height:65%;display:grid;place-items:center;text-align:center"><div><div style="font-size:35px;color:#1557ff">◌</div><p>Preparando tu experiencia…</p></div></div>` },
    { title: 'Inicia sesión', tag: 'ACCESO', description: 'Con su correo y contraseña, la persona accede a su cuenta. Si aún no tiene una, puede registrarse.', body: `${phoneHeader}<h4>Qué gusto<br>verte de nuevo.</h4><p>Inicia sesión para continuar.</p><div class="mock-panel"><b>Bienvenido</b><div class="mock-field">✉ &nbsp; Correo electrónico</div><div class="mock-field">◇ &nbsp; Contraseña</div><div class="mock-button">Iniciar sesión →</div><p style="text-align:center">¿No tienes cuenta? Regístrate</p></div>` },
    { title: 'Crea tu cuenta', tag: 'REGISTRO', description: 'El formulario reúne los datos básicos y valida que el correo y las contraseñas tengan el formato esperado.', body: `${phoneHeader}<h4>Empieza tu<br>experiencia.</h4><p>Crear tu cuenta es muy sencillo.</p><div class="mock-panel"><div class="mock-field">◉ &nbsp; Nombre</div><div class="mock-field">✉ &nbsp; Correo electrónico</div><div class="mock-field">◇ &nbsp; Contraseña</div><div class="mock-field">◇ &nbsp; Confirmar contraseña</div><div class="mock-button">Crear cuenta →</div></div>` },
    { title: 'Verifica tu correo', tag: 'VERIFICACIÓN', description: 'El usuario ingresa el código recibido por correo y puede solicitar su reenvío cuando corresponda.', body: `${phoneHeader}<h4>Verifica tu<br>correo.</h4><p>Ingresa el código que enviamos a tu correo electrónico.</p><div class="mock-panel"><div style="font-size:32px;text-align:center;color:#1557ff">✉</div><div class="mock-field" style="text-align:center;letter-spacing:7px">· · · · · ·</div><div class="mock-button">Verificar cuenta</div><p style="text-align:center">Reenviar código</p></div>` },
    { title: 'Tu wallet', tag: 'BOLETOS', description: 'La pantalla principal reúne los boletos asociados a la cuenta y muestra la información sincronizada disponible.', body: `${phoneHeader}<p style="margin-top:25px">TUS PRÓXIMOS EVENTOS</p><h4>Tu próxima<br>experiencia.</h4><div class="mock-ticket"><small>BOLETO DIGITAL</small><b>Festival del Valle</b><p>Una experiencia para recordar</p><hr style="border:0;border-top:1px dashed #aac9eb"><small>VIE · 19:00 &nbsp; / &nbsp; VALLE DEL MEZQUITAL</small></div>${bottom}` },
    { title: 'Detalle del boleto', tag: 'QR LOCAL', description: 'El detalle muestra la información del evento y representa el QR en el dispositivo. El uso en acceso depende de un validador disponible.', body: `${phoneHeader}<p style="margin-top:20px">← &nbsp; DETALLE DEL BOLETO</p><div class="mock-ticket"><small>BOLETO DIGITAL</small><b>Festival del Valle</b><p>Valle del Mezquital · 19:00</p><hr style="border:0;border-top:1px dashed #aac9eb"><div class="qr" style="margin:20px auto;width:85px;height:85px;background-size:12px 12px"></div><p style="text-align:center">Código ilustrativo</p></div>${bottom}` },
    { title: 'Explora eventos', tag: 'PLATAFORMA WEB', description: 'La sección Explorar ofrece accesos hacia la cartelera y hacia la publicación de eventos en la web.', body: `${phoneHeader}<div class="mock-panel"><small>SMART TICKET / CARTELERA</small><h4>Vive tu próxima<br>experiencia.</h4><p>Descubre eventos y encuentra tu siguiente momento.</p><div class="mock-button">Explorar eventos ↗</div><div class="mock-button light">Publicar un evento ↗</div></div>${bottom}` },
    { title: 'Consulta tu historial', tag: 'HISTORIAL', description: 'La persona puede consultar la sección de historial desde la navegación principal.', body: `${phoneHeader}<p style="margin-top:25px">TUS MOMENTOS</p><h4>Tu historial.</h4><p>Consulta tus experiencias anteriores.</p><div class="mock-panel"><b>Experiencias anteriores</b><p>Aquí encontrarás tus boletos del historial.</p></div>${bottom}` },
    { title: 'Tu perfil', tag: 'CUENTA Y AJUSTES', description: 'La sección de perfil concentra información de la cuenta y opciones de la aplicación. La app se distribuye mediante compilaciones instalables y admite actualizaciones compatibles.', body: `${phoneHeader}<h4>Tu perfil.</h4><p>Tu cuenta en un solo lugar.</p><div class="mock-panel"><div style="font-size:28px;color:#1557ff">◉</div><b>Mi cuenta</b><div class="mock-field">Información personal</div><div class="mock-field">Preferencias</div><div class="mock-field">Seguridad</div></div>${bottom}` },
  ];
  let active = 0;
  let revealIndex = 0;
  let screenIndex = 0;

  function renderScreen() {
    const screen = screens[screenIndex];
    screenContent.innerHTML = screen.body;
    screenTitle.textContent = screen.title;
    screenDescription.textContent = screen.description;
    screenTag.textContent = screen.tag;
    screenCount.textContent = `${String(screenIndex + 1).padStart(2, '0')} / ${String(screens.length).padStart(2, '0')}`;
    screenDots.innerHTML = screens.map((_, index) => `<i${index === screenIndex ? ' class="active"' : ''}></i>`).join('');
    screenPrevious.disabled = screenIndex === 0;
    screenNext.disabled = screenIndex === screens.length - 1;
  }

  function renderSlide() {
    slides.forEach((slide, index) => {
      const selected = index === active;
      slide.classList.toggle('active', selected);
      slide.setAttribute('aria-hidden', String(!selected));
      slide.setAttribute('aria-label', `Diapositiva ${index + 1} de ${slides.length}: ${slide.dataset.title}`);
      slide.querySelectorAll('.reveal').forEach((element, step) => element.classList.toggle('visible', selected && step < revealIndex));
    });
    document.getElementById('slide-count').textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    document.getElementById('slide-title').textContent = slides[active].dataset.title;
    document.getElementById('progress-fill').style.width = `${(active + 1) / slides.length * 100}%`;
    previous.disabled = active === 0 && revealIndex === 0 && screenIndex === 0;
    next.disabled = active === slides.length - 1;
    document.title = `${slides[active].dataset.title} · Smart Ticket`;
    history.replaceState(null, '', `#diapositiva-${active + 1}`);
    renderScreen();
  }

  function goNext() {
    const reveals = slides[active].querySelectorAll('.reveal');
    if (revealIndex < reveals.length) revealIndex += 1;
    else if (slides[active].classList.contains('journey-slide') && screenIndex < screens.length - 1) screenIndex += 1;
    else if (active < slides.length - 1) { active += 1; revealIndex = 0; screenIndex = 0; }
    renderSlide();
  }
  function goPrevious() {
    if (slides[active].classList.contains('journey-slide') && screenIndex > 0) screenIndex -= 1;
    else if (revealIndex > 0) revealIndex -= 1;
    else if (active > 0) {
      active -= 1;
      revealIndex = slides[active].querySelectorAll('.reveal').length;
      screenIndex = slides[active].classList.contains('journey-slide') ? screens.length - 1 : 0;
    }
    renderSlide();
  }

  previous.addEventListener('click', goPrevious);
  next.addEventListener('click', goNext);
  screenPrevious.addEventListener('click', () => { if (screenIndex > 0) screenIndex -= 1; renderSlide(); });
  screenNext.addEventListener('click', () => { if (screenIndex < screens.length - 1) screenIndex += 1; renderSlide(); });
  document.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('button, a, input, textarea, select')) return;
    if (['ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); goNext(); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(event.key)) { event.preventDefault(); goPrevious(); }
    else if (event.key === 'Home') { event.preventDefault(); active = 0; revealIndex = 0; screenIndex = 0; renderSlide(); }
    else if (event.key === 'End') { event.preventDefault(); active = slides.length - 1; revealIndex = 0; screenIndex = 0; renderSlide(); }
  });
  fullscreen.hidden = !document.fullscreenEnabled;
  fullscreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (error) {
      console.error('No se pudo cambiar el modo de pantalla completa.', error);
    }
  });
  document.addEventListener('fullscreenchange', () => {
    fullscreen.setAttribute('aria-label', document.fullscreenElement ? 'Salir de pantalla completa' : 'Activar pantalla completa');
  });
  const initial = Number(location.hash.match(/^#diapositiva-(\d+)$/)?.[1]);
  if (initial >= 1 && initial <= slides.length) active = initial - 1;
  renderSlide();
})();
