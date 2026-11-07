/**
 * Falafelverse shared API.
 * Required bindings: KV namespace SITE_CONFIG; Secret ADMIN_PASSWORD.
 * Optional variable: ALLOWED_ORIGIN = https://falafelwithfeelings.github.io
 *
 * Routes: GET /config, POST /admin/login, POST /admin/config,
 * GET /blog, POST /admin/blog, POST /blog/interaction,
 * POST /blog/sparkle, GET /blog/sparkle?code=..., GET/POST /calendar,
 * PATCH/DELETE /calendar/:id
 */
const CONFIG_KEY='falafelverse-site-config-v1';
const BLOG_KEY='falafelverse-blog-data-v1';
const CALENDAR_PREFIX='falafelverse-calendar-event-v1:';
const REPO_RAW='https://raw.githubusercontent.com/falafelwithfeelings/falafelandfeelingdeep/main/';
const DEFAULT_CONFIG={
 profileName:'Falafel',profileMood:'gacha goblin',profileImageUrl:REPO_RAW+'me',
 webmasterParagraphs:[
  "hi!!! im this website's webmaster! I rlly enjoy learning to code even tho it pmo sometimes. I made this on a macbook air using chrome (2560x1600 px), so it will probably look best on that device. Hopefully it doesn't look to bad on other devices tho.",
  "I love art, and I'm going to be studying animation at my dream school soon YAYAYAYYYYY (I NEED A WAY TO PAY FOR IT THO HELP) I used to be a trad artist, but now, I seem to be getting more used to digital art. I also love journaling and collecting CD's, and drinking ramune."
 ],
 bannerImageUrl:REPO_RAW+'EMU%20BANNER.jpe',
 blinkies:[REPO_RAW+'DANCING%20MIKUUU.png',REPO_RAW+'NO%20EMU.png',REPO_RAW+'badge%20genshin!%20(make%20it%20transparent.jpe',REPO_RAW+'Screenshot%202026-11-06%20170703.png'],
 foodLog:[{name:'Strawberry Roll',recipe:'Sponge cake, cream, strawberries.',emoji:'🍰'},{name:'Sushi Roll',recipe:'Rice, seaweed, salmon, avocado.',emoji:'🍣'}]
};
const json=(r)=>JSON.stringify(r);
function cors(env){return {'Access-Control-Allow-Origin':env.ALLOWED_ORIGIN||'*','Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,OPTIONS','Access-Control-Allow-Headers':'Content-Type,X-Admin-Password','Access-Control-Max-Age':'86400','Vary':'Origin'};}
function reply(body,status,env){return new Response(json(body),{status,headers:{...cors(env),'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});}
function text(v,n,def=''){return String(v??def).slice(0,n);}
function httpUrl(v){try{const u=new URL(v);return typeof v==='string'&&v.length<=1200&&(u.protocol==='https:'||u.protocol==='http:');}catch{return false;}}
function normalizeConfig(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('The submitted site configuration must be an object.');
 const paragraphs=Array.isArray(input.webmasterParagraphs)?input.webmasterParagraphs.slice(0,2).map(v=>text(v,1200)):DEFAULT_CONFIG.webmasterParagraphs.slice();while(paragraphs.length<2)paragraphs.push('');
 const blinkies=Array.isArray(input.blinkies)?input.blinkies.filter(httpUrl).slice(0,40):DEFAULT_CONFIG.blinkies.slice();
 const foodLog=Array.isArray(input.foodLog)?input.foodLog.slice(0,60).filter(v=>v&&typeof v==='object').map(v=>({name:text(v.name,80,'Mystery treat'),recipe:text(v.recipe,2000),emoji:text(v.emoji,12,'🍽️')})):DEFAULT_CONFIG.foodLog.slice();
 return {profileName:text(input.profileName,50,'Falafel')||'Falafel',profileMood:text(input.profileMood,120),profileImageUrl:httpUrl(input.profileImageUrl)?input.profileImageUrl:DEFAULT_CONFIG.profileImageUrl,webmasterParagraphs:paragraphs,bannerImageUrl:httpUrl(input.bannerImageUrl)?input.bannerImageUrl:DEFAULT_CONFIG.bannerImageUrl,blinkies,foodLog};
}
function constantTimeEqual(a,b){const x=new TextEncoder().encode(String(a||'')),y=new TextEncoder().encode(String(b||''));let d=x.length^y.length;for(let i=0;i<Math.max(x.length,y.length);i++)d|=(x[i]||0)^(y[i]||0);return d===0;}
function admin(request,env){return !!env.ADMIN_PASSWORD&&constantTimeEqual(request.headers.get('X-Admin-Password')||'',env.ADMIN_PASSWORD);}
async function body(request,max=200000){const raw=await request.text();if(raw.length>max)throw Error('Request is too large.');try{return JSON.parse(raw||'{}');}catch{throw Error('Request body must be valid JSON.');}}
function slugId(p,i){return 'legacy-'+i+'-'+btoa(unescape(encodeURIComponent(String(p.date||'')+'|'+String(p.title||'')))).replace(/[^a-zA-Z0-9]/g,'').slice(0,28);}
function normalizeBlog(input){
 const source=input&&typeof input==='object'?input:{};
 const posts=Array.isArray(source.posts)?source.posts.slice(0,250).filter(p=>p&&typeof p==='object').map((p,i)=>({...p,id:text(p.id,100)||slugId(p,i),type:p.type==='announcement'?'announcement':'blog',title:text(p.title,200),content:text(p.content,30000),snippet:text(p.snippet,500),likes:Math.max(0,Number(p.likes)||0),likedBy:Array.isArray(p.likedBy)?p.likedBy.filter(v=>typeof v==='string').slice(-5000):[],images:Array.isArray(p.images)?p.images.filter(httpUrl).slice(0,8):[],comments:Array.isArray(p.comments)?p.comments.slice(0,1000).map(c=>({...c,id:text(c.id,100)||crypto.randomUUID(),alias:text(c.alias,40,'Anonymous'),text:text(c.text,2000),replies:Array.isArray(c.replies)?c.replies.slice(0,100).map(r=>({alias:text(r.alias,40,'Anonymous'),text:text(r.text,1000),timestamp:text(r.timestamp,50)})):[],hearts:Math.max(0,Number(c.hearts)||0),heartedBy:Array.isArray(c.heartedBy)?c.heartedBy.filter(v=>typeof v==='string').slice(-5000):[],timestamp:text(c.timestamp,50),ownerKey:text(c.ownerKey,100),adminLiked:!!c.adminLiked})):[]})):[];
 const syncCodes=source.syncCodes&&typeof source.syncCodes==='object'?source.syncCodes:{};
 return {posts,syncCodes};
}
async function getBlog(env){return normalizeBlog(await env.SITE_CONFIG.get(BLOG_KEY,'json')||{});}
async function putBlog(env,data){const clean=normalizeBlog(data);await env.SITE_CONFIG.put(BLOG_KEY,json(clean),{metadata:{updatedAt:new Date().toISOString()}});return clean;}
function validDate(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const [y,m,d]=value.split('-').map(Number),dt=new Date(Date.UTC(y,m-1,d));return y>=2000&&y<=2100&&dt.getUTCFullYear()===y&&dt.getUTCMonth()===m-1&&dt.getUTCDate()===d;}
function makeEvent(input,isAdmin,existing=null){const date=input.date??existing?.date,title=text(input.title??existing?.title,90).trim(),time=text(input.time??existing?.time,5).trim(),description=text(input.description??existing?.description,300).trim();if(!validDate(date))throw Error('Choose a valid calendar date.');if(!title)throw Error('Event name is required.');if(time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw Error('Choose a valid time.');return {id:existing?.id||crypto.randomUUID(),date,title,time,description,creatorAlias:isAdmin?'Falafelverse Webmaster':text(input.creatorAlias,32,'Anonymous').trim()||'Anonymous',isAdmin,createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};}
async function allEvents(env){const page=await env.SITE_CONFIG.list({prefix:CALENDAR_PREFIX,limit:1000});const values=await Promise.all(page.keys.map(k=>env.SITE_CONFIG.get(k.name,'json')));return values.filter(Boolean).sort((a,b)=>a.date.localeCompare(b.date)||(a.time||'99:99').localeCompare(b.time||'99:99'));}
function findPost(data,id){return data.posts.find(p=>String(p.id)===String(id));}
export default {async fetch(request,env){
 const url=new URL(request.url),path=url.pathname.replace(/\/+$/,'')||'/';
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors(env)});
 if(!env.SITE_CONFIG)return reply({error:'Missing SITE_CONFIG KV binding.'},500,env);
 try{
  if(request.method==='GET'&&path==='/config'){const saved=await env.SITE_CONFIG.get(CONFIG_KEY,'json');return reply({...normalizeConfig(saved||DEFAULT_CONFIG),_initialized:!!saved},200,env);}
  if(request.method==='POST'&&path==='/admin/login'){if(!env.ADMIN_PASSWORD)return reply({error:'ADMIN_PASSWORD secret has not been configured.'},503,env);const supplied=request.headers.get('X-Admin-Password')||'';if(!constantTimeEqual(supplied,env.ADMIN_PASSWORD))return reply({error:'Incorrect admin password.'},401,env);return reply({ok:true},200,env);}
  if(request.method==='POST'&&path==='/admin/config'){if(!admin(request,env))return reply({error:'Admin authentication required.'},401,env);const clean=normalizeConfig(await body(request,60000));await env.SITE_CONFIG.put(CONFIG_KEY,json(clean),{metadata:{updatedAt:new Date().toISOString()}});return reply({ok:true,savedAt:new Date().toISOString()},200,env);}

  if(request.method==='GET'&&path==='/blog'){return reply(await getBlog(env),200,env);}
  if(request.method==='POST'&&path==='/admin/blog'){if(!admin(request,env))return reply({error:'Only the signed-in webmaster can publish or manage blog posts.'},401,env);const data=await body(request,220000);const saved=await putBlog(env,data);return reply({ok:true,posts:saved.posts.length},200,env);}
  if(request.method==='POST'&&path==='/blog/interaction'){
   const data=await getBlog(env),input=await body(request,10000),post=findPost(data,input.postId);if(!post)return reply({error:'Blog post not found.'},404,env);
   const action=text(input.action,40),visitor=text(input.visitorKey,100),alias=text(input.alias,40,'Anonymous');if(!visitor)return reply({error:'Visitor identity is missing.'},400,env);
   if(action==='togglePostLike'){
    const likedBy=Array.isArray(post.likedBy)?post.likedBy:[];const shouldLike=input.liked===true;const at=likedBy.indexOf(visitor);
    if(shouldLike&&at<0)likedBy.push(visitor);if(!shouldLike&&at>=0)likedBy.splice(at,1);
    post.likedBy=likedBy.slice(-5000);post.likes=post.likedBy.length;
   }else if(action==='addComment'){
    const commentText=text(input.text,2000).trim();if(!commentText)return reply({error:'Comment cannot be empty.'},400,env);
    post.comments.push({id:crypto.randomUUID(),alias,text:commentText,timestamp:new Date().toISOString(),replies:[],hearts:0,heartedBy:[],ownerKey:visitor,adminLiked:false});
   }else{
    const comment=(post.comments||[]).find(c=>String(c.id)===String(input.commentId));if(!comment)return reply({error:'Comment not found.'},404,env);
    if(action==='editComment'){
     if(!admin(request,env)&&(comment.ownerKey?comment.ownerKey!==visitor:comment.alias!==alias))return reply({error:'You can only edit your own comment.'},403,env);
     const newText=text(input.text,2000).trim();if(!newText)return reply({error:'Comment cannot be empty.'},400,env);comment.text=newText;
    }else if(action==='deleteComment'){
     if(!admin(request,env))return reply({error:'Only the webmaster can delete comments.'},403,env);post.comments=post.comments.filter(c=>String(c.id)!==String(input.commentId));
    }else if(action==='toggleCommentHeart'){
     if(admin(request,env)){comment.adminLiked=!comment.adminLiked;}
     else {const list=Array.isArray(comment.heartedBy)?comment.heartedBy:[];const at=list.indexOf(visitor);if(at>=0){list.splice(at,1);comment.hearts=Math.max(0,(Number(comment.hearts)||1)-1);}else{list.push(visitor);comment.hearts=(Number(comment.hearts)||0)+1;}comment.heartedBy=list.slice(-5000);}
    }else if(action==='addReply'){
     const replyText=text(input.text,1000).trim();if(!replyText)return reply({error:'Reply cannot be empty.'},400,env);comment.replies=Array.isArray(comment.replies)?comment.replies:[];comment.replies.push({alias,text:replyText,timestamp:new Date().toISOString()});
    }else return reply({error:'Unknown blog interaction.'},400,env);
   }
   const saved=await putBlog(env,data);const updated=findPost(saved,input.postId);return reply({ok:true,likes:updated?.likes||0,data:saved},200,env);
  }
  if(request.method==='POST'&&path==='/blog/sparkle'){
   const input=await body(request,2000),alias=text(input.alias,40,'Anonymous');const data=await getBlog(env);const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let code='';do{code='FALAFEL-'+Array.from({length:4},()=>alphabet[Math.floor(Math.random()*alphabet.length)]).join('')+'-'+Array.from({length:4},()=>alphabet[Math.floor(Math.random()*alphabet.length)]).join('');}while(data.syncCodes[code]);data.syncCodes[code]={alias,timestamp:new Date().toISOString()};await putBlog(env,data);return reply({ok:true,code},201,env);
  }
  if(request.method==='GET'&&path==='/blog/sparkle'){
   const code=text(url.searchParams.get('code'),40).toUpperCase(),data=await getBlog(env),entry=data.syncCodes[code];if(!entry)return reply({error:'Sparkle Code not found.'},404,env);return reply({ok:true,alias:text(entry.alias,40,'Anonymous')},200,env);
  }

  if(request.method==='GET'&&path==='/calendar')return reply({events:await allEvents(env)},200,env);
  if(request.method==='POST'&&path==='/calendar'){
   const input=await body(request,8000),isAdmin=admin(request,env),event=makeEvent(input,isAdmin);await env.SITE_CONFIG.put(CALENDAR_PREFIX+event.id,json(event),{metadata:{date:event.date,isAdmin:event.isAdmin}});return reply({ok:true,event},201,env);
  }
  const match=path.match(/^\/calendar\/([a-f0-9-]{20,50})$/i);
  if(match&&(request.method==='DELETE'||request.method==='PATCH')){
   if(!admin(request,env))return reply({error:'Only the signed-in webmaster can manage calendar events.'},401,env);
   const key=CALENDAR_PREFIX+match[1],existing=await env.SITE_CONFIG.get(key,'json');if(!existing)return reply({error:'Calendar event not found.'},404,env);
   if(request.method==='DELETE'){await env.SITE_CONFIG.delete(key);return reply({ok:true},200,env);}
   const updated=makeEvent(await body(request,8000),true,existing);await env.SITE_CONFIG.put(key,json(updated),{metadata:{date:updated.date,isAdmin:true}});return reply({ok:true,event:updated},200,env);
  }
  return reply({error:'Not found.'},404,env);
 }catch(error){return reply({error:error?.message||'Unexpected Worker error.'},400,env);}
}};