/* ComparIA: historial compartido opt-in, backend Supabase con RLS.
   El acceso a lectura depende del SQL aplicado; usar el SQL 02 para modo privado. Los documentos originales nunca se suben. */
(() => {
  'use strict';
  let client = null;
  let session = null;
  let loadedReports = [];
  let visible = false;
  const el = id => document.getElementById(id);
  const text = s => String(s ?? '');
  const html = s => text(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number = v => Number.isFinite(Number(v)) && v !== null ? new Intl.NumberFormat('es-DO',{maximumFractionDigits:2}).format(Number(v)) : '—';
  const shortDate = v => { try { return new Date(v).toLocaleString('es-DO',{year:'numeric',month:'short',day:'2-digit'}); } catch { return '—'; } };
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const originPath = () => `${location.origin}${location.pathname}`;
  const reportsLink = () => `${originPath()}#historial`;
  const reportLink = id => `${originPath()}#comparativo=${encodeURIComponent(id)}`;
  function tell(message, error=false) { if (typeof note === 'function') note(message,error); else console[error?'error':'info'](message); }
  function connection(message, kind='info') { const target=el('history-connection'); if(target){target.textContent=message;target.dataset.kind=kind;} }
  function updateAuth() { const a=el('history-auth-btn');if(!a)return;a.textContent=session?.user?.email?`Sesión: ${session.user.email} · Salir`:'Acceso para guardar'; }
  function init() {
    const settings=window.COMPARIA_DB_CONFIG || {};
    if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(String(settings.url||'')) || !String(settings.publishableKey||'').trim()){
      connection('Historial no conectado todavía. Configura db-config.js y ejecuta el SQL incluido. Mientras tanto, los comparativos solo existen en tu navegador.', 'warning');
      el('history-results').innerHTML='<div class="history-empty">La página está lista para conectarse a la base de datos gratuita. Consulta el archivo <b>CONFIGURAR_HISTORIAL.md</b> incluido en la descarga.</div>';
      if(location.hash==='#historial') open();
      return;
    }
    if(!window.supabase?.createClient){connection('No se cargó el servicio de historial. Revisa la conexión y el CDN.', 'error');return;}
    try {
      client=window.supabase.createClient(settings.url.trim().replace(/\/$/,''),settings.publishableKey.trim(),{auth:{detectSessionInUrl:true,persistSession:true,autoRefreshToken:true}});
      client.auth.getSession().then(({data,error})=>{if(error)throw error;session=data.session;updateAuth();}).catch(err=>connection(`Error de sesión: ${err.message}`,'error'));
      client.auth.onAuthStateChange((_event,current)=>{session=current;updateAuth();});
      connection('Historial conectado. El acceso a los registros depende de los permisos configurados.', 'success');
      if(location.hash==='#historial') open();
      else {
        const match=location.hash.match(/^#comparativo=([0-9a-f-]{36})$/i);
        if(match) setTimeout(()=>load(match[1]),300);
      }
    } catch(err){connection(`No se pudo conectar con el historial: ${err.message}`,'error');}
  }
  function open(){visible=true;el('shared-history').classList.remove('hidden');el('shared-history').scrollIntoView({behavior:'smooth',block:'start'});if(client)refresh();}
  function close(){visible=false;el('shared-history').classList.add('hidden');}
  function toggle(){visible?close():open();}
  async function refresh(){
    if(!client){connection('Historial no conectado. Configura Supabase antes de publicar comparativos.', 'warning');return;}
    connection('Cargando comparativos del equipo…');
    try{
      const {data,error}=await client.from('comparia_reports')
        .select('id,created_at,author_email,project,request_code,report_date,supplier_count,winner_name,winner_score,total_evaluated')
        .order('created_at',{ascending:false}).limit(100);
      if(error)throw error;
      loadedReports=data||[];
      connection(`Historial conectado · ${loadedReports.length}${loadedReports.length===100?' recientes':''} comparativo(s). Los datos se muestran en modo de solo lectura.`, 'success');
      draw();
    }catch(error){connection(`No se pudo consultar el historial: ${error.message}. Revisa SQL, permisos y conexión.`, 'error'); el('history-results').innerHTML='<div class="history-empty">No fue posible cargar la biblioteca compartida.</div>';}
  }
  function draw(){
    const q=(el('history-search')?.value||'').toLocaleLowerCase('es').trim();
    const items=loadedReports.filter(x=>[x.project,x.request_code,x.winner_name,x.author_email].some(y=>text(y).toLocaleLowerCase('es').includes(q)));
    if(!items.length){el('history-results').innerHTML='<div class="history-empty">No hay comparativos visibles. Si el historial es privado, inicia sesión con una cuenta autorizada. También puede que todavía no existan registros.</div>';return;}
    el('history-results').innerHTML=`<div class="history-table-wrap"><table class="history-table"><thead><tr><th>Fecha</th><th>Proyecto y solicitud</th><th>Creado por</th><th>Proveedores</th><th>Mejor evaluado</th><th>Acciones</th></tr></thead><tbody>${items.map(r=>`<tr><td>${html(shortDate(r.created_at))}</td><td><b>${html(r.project)}</b><small>${html(r.request_code||'Sin folio')}</small></td><td>${html(r.author_email)}</td><td>${html(r.supplier_count)}</td><td>${html(r.winner_name||'En revisión')}${r.winner_score!==null?`<small>${number(r.winner_score)} / 100 · RD$ ${number(r.total_evaluated)}</small>`:''}</td><td><div class="history-buttons"><button class="btn btn-primary history-small" data-action="history-open" data-id="${html(r.id)}">Abrir</button><button class="btn btn-outline history-small" data-action="history-copy" data-id="${html(r.id)}">Copiar enlace</button></div></td></tr>`).join('')}</tbody></table></div>`;
  }
  async function load(id){
    if(!client){tell('Falta configurar el historial compartido.',true);open();return;}
    if(!uuidPattern.test(id)){tell('Identificador de comparativo inválido.',true);return;}
    try {
      connection('Abriendo comparativo compartido…');
      const {data,error}=await client.from('comparia_reports').select('id,snapshot,project,author_email,created_at').eq('id',id).single();
      if(error)throw error;
      const saved=data.snapshot;
      if(!saved||!Array.isArray(saved.suppliers)||!Array.isArray(saved.requirements)||!saved.weights||!saved.rates)throw Error('El registro no contiene un comparativo válido.');
      if(!window.CompariaBridge?.set)throw Error('El comparador todavía no está listo.');
      window.CompariaBridge.set({...saved,demo:false});
      close();
      history.replaceState(null,'',`#comparativo=${id}`);
      window.scrollTo({top:0,behavior:'smooth'});
      tell(`Abierto: ${data.project}. Es una copia de la versión guardada, no modifica el original.`);
    } catch(err) {tell(`No se pudo abrir: ${err.message}`,true);open();}
  }
  async function login(){
    if(!client){tell('Primero hay que conectar la base de datos desde db-config.js.',true);open();return;}
    if(session){if(!confirm(`¿Quieres cerrar sesión de ${session.user.email}?`))return;const {error}=await client.auth.signOut();if(error)tell(error.message,true);else tell('Sesión cerrada.');return;}
    launchModal('Acceso para publicar','Los compradores autorizados pueden guardar nuevos comparativos. En modo privado también es necesario iniciar sesión para consultar el historial.',
      `<div class="modal-grid"><div class="span3 oauth-entry"><button type="button" class="btn btn-primary" data-action="history-oauth">Entrar con GitHub (sin correos de verificación)</button><small>Para compradores con cuenta GitHub, cuando el administrador configure este acceso en Supabase.</small></div><div class="span3 login-separator">O utiliza un enlace por correo</div><label class="modal-field span3">Correo autorizado <input data-field="email-auth" type="email" placeholder="correo@empresa.com" autocomplete="email"></label><p class="span3 muted">El acceso por correo necesita un servicio de envío configurado para el equipo. El servicio gratuito predeterminado de Supabase tiene fuertes restricciones de destinatarios y envíos. El administrador también debe autorizar tu correo para publicar.</p></div>`,
      async ()=>{const email=inputVal('email-auth').trim();if(!/^\S+@\S+\.\S+$/.test(email)){tell('Escribe un correo válido.',true);return;}
        const button=el('modal-save');button.disabled=true;
        try{const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:originPath()}});if(error)throw error;modalClose();tell('Enviamos un enlace para iniciar sesión. Revisa tu correo.');}
        catch(e){tell('Error de inicio de sesión: '+e.message,true);}
        finally{button.disabled=false;}
      });
  }
  async function githubLogin(){
    if(!client){tell('Falta configurar Supabase.',true);return;}
    try{
      const {error}=await client.auth.signInWithOAuth({provider:'github',options:{redirectTo:originPath()}});
      if(error)throw error;
    }catch(e){tell('No se pudo acceder con GitHub: '+e.message,true);}
  }
  function askSave(){
    if(!client){open();tell('Para guardar registros que todos puedan ver, primero conecta la base de datos compartida.',true);return;}
    if(!session){login();tell('Inicia sesión con un correo autorizado y luego pulsa Guardar.',false);return;}
    const original=window.CompariaBridge?.get?.();
    if(!original?.suppliers?.length){tell('Carga al menos un proveedor antes de publicar.',true);return;}
    const snapshot=window.CompariaBridge.get();
    const weightSum=Object.values(snapshot.weights||{}).reduce((a,b)=>a+Number(b||0),0);
    launchModal('Publicar versión en el historial', 'Los registros del historial son versiones fechadas: guardar otra vez crea una versión nueva, sin cambiar la anterior.',
      `<div class="publish-summary"><b>${html(snapshot.project||'Sin título')}</b><span>${html(snapshot.request||'Sin folio')} · ${snapshot.suppliers.length} proveedor(es)</span></div>
       <p class="security-warning"><b>Atención:</b> Antes de guardar, verifica que esté activa la política de acceso PRIVADO en Supabase. Si solo ejecutaste el SQL 01, el historial todavía es público: no guardes datos confidenciales.</p>
       ${Math.abs(weightSum-100)>.001?'<p class="security-warning">Las ponderaciones no suman 100%. Se publicará como versión en revisión.</p>':''}
       <label class="public-consent"><input id="publish-consent" type="checkbox"> Confirmo que los datos han sido revisados y que tengo autorización para compartirlos con los usuarios permitidos por la política de acceso configurada.</label>`,
       async ()=>{
         if(!el('publish-consent')?.checked){tell('Debes confirmar el permiso para compartir antes de publicar.',true);return;}
         const button=el('modal-save');button.disabled=true;
         try{
           const data=window.CompariaBridge.get();
           // Nunca se suben documentos originales: solo datos estructurados y resultados.
           const report=window.CompariaBridge.scores();
           const winner=report.winner;
           const payload={owner_id:session.user.id,author_email:session.user.email,project:text(data.project||'Sin título').slice(0,200),request_code:text(data.request||'').slice(0,100),report_date:data.date||null,supplier_count:data.suppliers.length,winner_name:winner?.s?.name||null,winner_score:winner&&Number.isFinite(winner.score)?Math.round(winner.score*10)/10:null,total_evaluated:winner&&Number.isFinite(winner.total)?winner.total:null,snapshot:data};
           if(JSON.stringify(payload).length>370000)throw Error('El comparativo es demasiado grande para el historial. Divide el proyecto en varios análisis.');
           const {data:created,error}=await client.from('comparia_reports').insert(payload).select('id').single();
           if(error)throw error;
           modalClose();
           const url=reportLink(created.id);
           await copy(url);
           tell('Versión guardada en historial. El enlace del comparativo se copió.');
           open();
         }catch(error){tell(`No se pudo guardar: ${error.message}. Comprueba que tu correo esté autorizado.`,true);}
         finally{button.disabled=false;}
       });
  }
  async function copy(value){
    try{if(navigator.clipboard && window.isSecureContext)await navigator.clipboard.writeText(value);
      else window.prompt('Copia este enlace:',value);}catch{window.prompt('Copia este enlace:',value);}
  }
  function copyHistory(){copy(reportsLink());tell('Enlace al historial compartido listo para copiar.');}
  document.addEventListener('click',event=>{
    const action=event.target.closest('[data-action]')?.dataset.action;
    const id=event.target.closest('[data-action]')?.dataset.id;
    if(action==='history-open')load(id);
    else if(action==='history-copy')copy(reportLink(id));
    else if(action==='history-share-link')copyHistory();
    else if(action==='history-oauth')githubLogin();
  });
  window.CompariaHistory={init,open,close,toggle,refresh,load,login,askSave,copyHistory,draw};
})();
