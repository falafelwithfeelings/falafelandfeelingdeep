/* Falafelverse shared calendar */
(()=>{'use strict';const API='https://falafelverseapi.falafelwithfeelings.workers.dev', $=id=>document.getElementById(id),s={month:new Date(new Date().getFullYear(),new Date().getMonth(),1),selected:key(new Date()),events:[]};function key(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}function admin(){return typeof isSiteAdmin==='function'&&isSiteAdmin()}function headers(json){let h=json?{'Content-Type':'application/json'}:{};if(admin()&&typeof sharedAdminPassword!=='undefined'&&sharedAdminPassword)h['X-Admin-Password']=sharedAdminPassword;return h}async function api(path,opt={}){let r=await fetch(API+path,{...opt,headers:{...headers(!!opt.body),...(opt.headers||{})},cache:'no-store'}),d={};try{d=await r.json()}catch{}if(!r.ok)throw Error(d.error||'Calendar request failed');return d}function onDay(k){return s.events.filter(e=>e.date===k)}function render(){let g=$('calendar-grid'),l=$('calendar-month-label');if(!g||!l)return;l.textContent=s.month.toLocaleDateString(undefined,{month:'long',year:'numeric'});g.replaceChildren();['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(x=>{let e=document.createElement('div');e.className='calendar-weekday';e.textContent=x;g.append(e)});let y=s.month.getFullYear(),m=s.month.getMonth(),off=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate(),today=key(new Date());for(let i=0;i<off;i++){let e=document.createElement('div');e.className='calendar-day is-outside';g.append(e)}for(let d=1;d<=n;d++){let dt=new Date(y,m,d),k=key(dt),ev=onDay(k),b=document.createElement('button');b.type='button';b.className='calendar-day';b.textContent=d;if(k===today)b.classList.add('is-today');if(k===s.selected)b.classList.add('is-selected');if(ev.length)b.classList.add('has-events');if(ev.some(x=>x.isAdmin))b.classList.add('has-admin-events');b.addEventListener('click',()=>{s.selected=k;render();list()});b.addEventListener('dblclick',()=>{s.selected=k;render();list();open()});g.append(b)}}function list(){let box=$('calendar-event-list'),h=$('calendar-selected-label');if(!box||!h)return;h.textContent=new Date(s.selected+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})+' \u00b7 EVENTS';box.replaceChildren();let ev=onDay(s.selected).slice().sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));if(!ev.length){let p=document.createElement('p');p.className='calendar-empty';p.textContent='Nothing planned yet. Double-click this date to add something';box.append(p);return}ev.forEach(x=>{let c=document.createElement('article');c.className='calendar-event-card'+(x.isAdmin?' is-admin':'');let t=document.createElement('div');t.className='calendar-event-title';t.textContent=x.title;let meta=document.createElement('div');meta.className='calendar-event-meta';if(x.time){let tm=document.createElement('span');tm.textContent=x.time;meta.append(tm)}let who=document.createElement('span');who.textContent='by '+(x.creatorAlias||'Anonymous');let badge=document.createElement('span');badge.className='calendar-event-badge'+(x.isAdmin?' admin':'');badge.textContent=x.isAdmin?'WEBMASTER / ADMIN':'COMMUNITY';meta.append(who,badge);c.append(t,meta);if(x.description){let d=document.createElement('div');d.className='calendar-event-description';d.textContent=x.description;c.append(d)}if(admin()){let del=document.createElement('button');del.className='calendar-event-delete';del.textContent='delete';del.onclick=()=>remove(x.id);c.append(del)}box.append(c)})}async function load(){try{s.events=(await api('/calendar')).events||[];render();list()}catch(e){let b=$('calendar-event-list');if(b){b.textContent='Shared calendar unavailable. Deploy the updated Worker.';b.className='calendar-error'}console.error(e)}}function open(){let m=$('calendar-event-modal');$('calendar-modal-date').textContent=new Date(s.selected+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'});$('calendar-event-title').value='';$('calendar-event-time').value='';$('calendar-event-description').value='';$('calendar-admin-hint').textContent=admin()?'Webmaster event: this will be labelled ADMIN.':'Community events are shared with everyone.';m.hidden=false;$('calendar-event-title').focus()}function close(){$('calendar-event-modal').hidden=true}async function save(){let title=$('calendar-event-title').value.trim();if(!title)return alert('Give your event a name first!');let b=$('calendar-event-submit');b.disabled=true;try{let d=await api('/calendar',{method:'POST',body:JSON.stringify({date:s.selected,title,time:$('calendar-event-time').value,description:$('calendar-event-description').value.trim(),creatorAlias:localStorage.getItem('visitor_alias')||'Anonymous'})});s.events.push(d.event);close();render();list()}catch(e){alert(e.message)}finally{b.disabled=false}}async function remove(id){if(!admin()||!confirm('Delete this event?'))return;try{await api('/calendar/'+encodeURIComponent(id),{method:'DELETE'});s.events=s.events.filter(e=>e.id!==id);render();list()}catch(e){alert(e.message)}}function init(){if(!$('calendar-app'))return;$('calendar-prev').onclick=()=>{s.month=new Date(s.month.getFullYear(),s.month.getMonth()-1,1);render()};$('calendar-next').onclick=()=>{s.month=new Date(s.month.getFullYear(),s.month.getMonth()+1,1);render()};$('calendar-today').onclick=()=>{let d=new Date();s.month=new Date(d.getFullYear(),d.getMonth(),1);s.selected=key(d);render();list()};$('calendar-add-event').onclick=open;$('calendar-event-submit').onclick=save;$('calendar-modal-close').onclick=close;$('calendar-event-cancel').onclick=close;$('calendar-event-modal').onclick=e=>{if(e.target.id==='calendar-event-modal')close()};$('calendar-event-title').onkeydown=e=>{if(e.key==='Enter')save()};render();load();setInterval(load,30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)load()});setInterval(()=>{let d=new Date();if(d.getMonth()!==s.month.getMonth()||d.getFullYear()!==s.month.getFullYear()){s.month=new Date(d.getFullYear(),d.getMonth(),1);s.selected=key(d);render();list();load()}},60000)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init()})();

/* === FALAFELVERSE LAYOUT ENFORCER === */
(() => {
  function enforceLayout() {
    const app = document.getElementById('app-container');
    const left = document.querySelector('#app-container > .left-sidebar');
    const center = document.querySelector('#app-container > .center-column');
    const right = document.querySelector('#app-container > .right-sidebar');
    if (!app || !left || !center || !right) return;

    app.appendChild(left);
    app.appendChild(center);
    app.appendChild(right);

    Object.assign(app.style, {
      display: 'block',
      position: 'relative',
      flex: '1 1 0',
      minHeight: '0',
      height: '100%',
      overflow: 'hidden',
      padding: '11px',
      boxSizing: 'border-box'
    });

    Object.assign(left.style, {
      position: 'absolute',
      left: '11px',
      top: '11px',
      bottom: '11px',
      width: '180px',
      maxWidth: '180px',
      overflowY: 'auto',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      zIndex: '5'
    });

    Object.assign(right.style, {
      position: 'absolute',
      right: '11px',
      top: '11px',
      bottom: '11px',
      width: '112px',
      maxWidth: '112px',
      overflowY: 'auto',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      zIndex: '6'
    });

    Object.assign(center.style, {
      position: 'absolute',
      left: '200px',
      right: '132px',
      top: '11px',
      bottom: '11px',
      display: 'flex',
      flexDirection: 'column',
      minWidth: '0',
      overflow: 'hidden',
      zIndex: '4'
    });

    const box = center.querySelector('.main-content-box');
    if (box) {
      Object.assign(box.style, {
        flex: '1 1 auto',
        minHeight: '0',
        width: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      });
    }

    right.querySelectorAll('.v-tab').forEach((tab) => {
      Object.assign(tab.style, {
        display: 'block',
        width: '100%',
        boxSizing: 'border-box',
        background: tab.classList.contains('active')
          ? 'linear-gradient(180deg, #ff6eb4 0%, #e83d8a 55%, #c9186c 100%)'
          : 'linear-gradient(180deg, #ffc0e0 0%, #ff8ec8 50%, #f56eb0 100%)',
        border: '2px solid #fff',
        borderLeft: '3px solid #ffe0f0',
        padding: '11px 8px',
        color: '#fff',
        textAlign: 'center',
        textTransform: 'lowercase',
        borderRadius: '0 16px 16px 0',
        boxShadow: '3px 3px 0 rgba(180, 60, 120, 0.35)',
        textDecoration: 'none',
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '0.48rem',
        cursor: 'pointer'
      });
    });
  }

  function run() {
    enforceLayout();
    setTimeout(enforceLayout, 100);
    setTimeout(enforceLayout, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
  window.addEventListener('resize', enforceLayout);
})();
