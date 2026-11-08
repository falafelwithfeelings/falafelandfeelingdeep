/** Falafelverse shared config + calendar API. Bindings: SITE_CONFIG KV, ADMIN_PASSWORD secret. Optional ALLOWED_ORIGIN. */
const CONFIG_KEY='falafelverse-site-config-v1',CAL_PREFIX='falafelverse-calendar-event-v1:',SHOP_KEY='falafelverse-shop-catalog-v1',USER_PREFIX='falafelverse-user-v1:',RAW='https://raw.githubusercontent.com/falafelwithfeelings/falafelandfeelingdeep/main/';
const DEFAULT_CONFIG={
 profileName:'Falafel',profileMood:'gacha goblin',profileImageUrl:RAW+'me',
 webmasterParagraphs:["hi!!! im this website's webmaster! I rlly enjoy learning to code even tho it pmo sometimes. I made this on a macbook air using chrome (2560x1600 px), so it will probably look best on that device. Hopefully it doesn't look to bad on other devices tho.","I love art, and I'm going to be studying animation at my dream school soon YAYAYAYYYYY (I NEED A WAY TO PAY FOR IT THO HELP) I used to be a trad artist, but now, I seem to be getting more used to digital art. I also love journaling and collecting CD's, and drinking ramune."],
 webmasterFields:[
  {emoji:'🍟',label:'my favorite food',value:'falafel (duh!) and crispy fries'},
  {emoji:'🫧',label:'my favorite drink',value:'ramune'},
  {emoji:'🎮',label:'my favorite games',value:'Genshin Impact, Honkai Star Rail, Project Sekai'},
  {emoji:'⭐',label:'my favorite characters',value:'Emu Otori, Akito Shinonome, Blade'}
 ],
 bannerImageUrl:RAW+'EMU%20BANNER.jpe',postGemReward:5,
 blinkies:[RAW+'DANCING%20MIKUUU.png',RAW+'NO%20EMU.png',RAW+'badge%20genshin!%20(make%20it%20transparent.jpe',RAW+'Screenshot%202026-11-06%20170703.png'],
 foodLog:[{name:'Strawberry Roll',recipe:'Sponge cake, cream, strawberries.',emoji:'🍰'},{name:'Sushi Roll',recipe:'Rice, seaweed, salmon, avocado.',emoji:'🍣'}]
};
function cors(e){return {'Access-Control-Allow-Origin':e.ALLOWED_ORIGIN||'*','Access-Control-Allow-Methods':'GET, POST, DELETE, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-Admin-Password, X-Sparkle-Code','Access-Control-Max-Age':'86400','Vary':'Origin'}}function out(b,s,e){return new Response(JSON.stringify(b),{status:s,headers:{...cors(e),'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}})}function txt(v,n,f=''){return String(v??f).slice(0,n)}function url(v){try{return typeof v==='string'&&v.length<1200&&['https:','http:'].includes(new URL(v).protocol)}catch{return false}}function norm(x){
 if(!x||typeof x!=='object'||Array.isArray(x))throw Error('Configuration must be an object.');
 const paragraphs=Array.isArray(x.webmasterParagraphs)?x.webmasterParagraphs.slice(0,2).map(v=>txt(v,1200)):DEFAULT_CONFIG.webmasterParagraphs.slice();
 while(paragraphs.length<2)paragraphs.push('');
 const webmasterFields=Array.isArray(x.webmasterFields)
  ?x.webmasterFields.slice(0,24).filter(v=>v&&typeof v==='object').map(v=>({
    emoji:txt(v.emoji,8,'✿'),label:txt(v.label,48).trim(),value:txt(v.value,240).trim()
   })).filter(v=>v.label&&v.value)
  :DEFAULT_CONFIG.webmasterFields.map(v=>({...v}));
 return {
  profileName:txt(x.profileName,50,'Falafel')||'Falafel',
  profileMood:txt(x.profileMood,120),
  profileImageUrl:url(x.profileImageUrl)?x.profileImageUrl:DEFAULT_CONFIG.profileImageUrl,
  webmasterParagraphs:paragraphs,
  webmasterFields,
  bannerImageUrl:url(x.bannerImageUrl)?x.bannerImageUrl:DEFAULT_CONFIG.bannerImageUrl,
  postGemReward:Math.max(0,Math.min(1000,Math.floor(Number.isFinite(Number(x.postGemReward))?Number(x.postGemReward):5))),
  blinkies:Array.isArray(x.blinkies)?x.blinkies.filter(url).slice(0,40):DEFAULT_CONFIG.blinkies.slice(),
  foodLog:Array.isArray(x.foodLog)?x.foodLog.slice(0,60).filter(v=>v&&typeof v==='object').map(v=>({
    name:txt(v.name,80,'Mystery treat'),recipe:txt(v.recipe,2000),emoji:txt(v.emoji,12,'🍽️')
   })):DEFAULT_CONFIG.foodLog.slice()
 };
}
function isAdmin(r,e){let p=r.headers.get('X-Admin-Password')||'';return !!e.ADMIN_PASSWORD&&p.length===e.ADMIN_PASSWORD.length&&p===e.ADMIN_PASSWORD}async function read(r,max=60000){let s=await r.text();if(s.length>max)throw Error('Request is too large.');try{return JSON.parse(s||'{}')}catch{throw Error('Invalid JSON body.')}}function validDate(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;let [y,m,d]=s.split('-').map(Number),x=new Date(Date.UTC(y,m-1,d));return y>=2000&&y<=2100&&x.getUTCFullYear()===y&&x.getUTCMonth()===m-1&&x.getUTCDate()===d}function makeEvent(x,a){if(!validDate(x.date))throw Error('Choose a valid date.');let title=txt(x.title,90).trim(),time=txt(x.time,5).trim();if(!title)throw Error('Event name is required.');if(time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw Error('Invalid event time.');return {id:crypto.randomUUID(),date:x.date,title,time,description:txt(x.description,300).trim(),creatorAlias:a?'Falafelverse Webmaster':txt(x.creatorAlias,32,'Anonymous'),isAdmin:a,createdAt:new Date().toISOString()}}

const SPARKLE_ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function makeSparkleCode(){const b=new Uint8Array(20);crypto.getRandomValues(b);const raw=Array.from(b,x=>SPARKLE_ALPHABET[x%SPARKLE_ALPHABET.length]).join('');return 'FALAFEL-'+raw.match(/.{1,4}/g).join('-')}
async function sparkleIdentity(code){const value=String(code||'').trim().toUpperCase();if(!/^FALAFEL-(?:[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}-){4}[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/.test(value))throw Error('Invalid Sparkle Code format.');const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));const hash=Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');return {key:USER_PREFIX+hash,id:hash.slice(0,16)}}
function normalizeAccountRecord(a,id=''){
 const source=a&&typeof a==='object'&&!Array.isArray(a)?a:{};
 const inventory=Array.isArray(source.inventory)?Array.from(new Set(source.inventory.filter(v=>typeof v==='string').slice(0,1000))):[];
 const claimedPosts=Array.isArray(source.claimedPosts)?Array.from(new Set(source.claimedPosts.filter(v=>typeof v==='string').slice(-10000))):[];
 return {
  ...source,
  id:txt(source.id||id,64),
  alias:txt(source.alias,32,'Anonymous').trim()||'Anonymous',
  gems:Math.max(0,Math.min(1000000000,Math.floor(Number.isFinite(Number(source.gems))?Number(source.gems):0))),
  inventory,
  claimedPosts,
  purchaseReceipts:Array.isArray(source.purchaseReceipts)?source.purchaseReceipts.filter(v=>typeof v==='string').slice(-100):[]
 };
}
function safeUser(a){
 const account=normalizeAccountRecord(a,a&&a.id);
 return {id:account.id,alias:account.alias,gems:account.gems,inventory:account.inventory,claimedPosts:account.claimedPosts,createdAt:account.createdAt};
}
async function readSparkleUser(r,e){
 const identity=await sparkleIdentity(r.headers.get('X-Sparkle-Code'));
 const stored=await e.SITE_CONFIG.get(identity.key,'json',{cacheTtl:30});
 if(!stored||typeof stored!=='object'||Array.isArray(stored))return null;
 return {identity,account:normalizeAccountRecord(stored,identity.id)};
}
const USER_MUTATION_LOCKS=new Map();
// KV has no cross-isolate transaction primitive. This lock only serializes updates
// handled by the same Worker isolate; strict global atomicity requires Durable Objects or D1.
async function withUserMutationLock(key,task){
 const previous=USER_MUTATION_LOCKS.get(key)||Promise.resolve();
 let release;
 const gate=new Promise(resolve=>{release=resolve;});
 const queued=previous.then(()=>gate);
 USER_MUTATION_LOCKS.set(key,queued);
 await previous;
 try{return await task();}
 finally{release();if(USER_MUTATION_LOCKS.get(key)===queued)USER_MUTATION_LOCKS.delete(key);}
}
export default{async fetch(r,e){let u=new URL(r.url),p=u.pathname.replace(/\/+$/,'')||'/';if(r.method==='OPTIONS')return new Response(null,{status:204,headers:cors(e)});if(!e.SITE_CONFIG)return out({error:'Missing SITE_CONFIG KV binding.'},500,e);if(r.method==='GET'&&p==='/blog'){
 try{
  const headers=e.JSONBIN_ACCESS_KEY?{'X-Access-Key':e.JSONBIN_ACCESS_KEY}:{};
  const response=await fetch('https://api.jsonbin.io/v3/b/6aca4a7dac6210605a2587db/latest',{headers});
  if(!response.ok)throw Error('JSONBin returned '+response.status);
  const payload=await response.json();
  const record=payload&&payload.record&&typeof payload.record==='object'&&!Array.isArray(payload.record)?payload.record:{};
  const blog={posts:Array.isArray(record.posts)?record.posts:[],syncCodes:record.syncCodes&&typeof record.syncCodes==='object'?record.syncCodes:{}};
  await e.SITE_CONFIG.put('falafelverse-legacy-blog-v1',JSON.stringify(blog),{metadata:{syncedAt:new Date().toISOString(),source:'jsonbin'}});
  return out(blog,200,e);
 }catch(error){
  const cached=await e.SITE_CONFIG.get('falafelverse-legacy-blog-v1','json');
  if(cached&&Array.isArray(cached.posts))return out({...cached,stale:true},200,e);
  return out({error:'The legacy JSONBin record is not publicly readable yet. Add a restricted JSONBin access key as the Worker secret JSONBIN_ACCESS_KEY, then retry.'},503,e);
 }
}if(r.method==='GET'&&p==='/config'){try{let v=await e.SITE_CONFIG.get(CONFIG_KEY,'json');return out({...norm(v||DEFAULT_CONFIG),_initialized:!!v},200,e)}catch{return out({error:'Could not read site config.'},500,e)}}if(r.method==='POST'&&p==='/admin/login'){if(!e.ADMIN_PASSWORD)return out({error:'ADMIN_PASSWORD secret missing.'},503,e);if(!isAdmin(r,e))return out({error:'Incorrect password.'},401,e);return out({ok:true},200,e)}if(r.method==='POST'&&p==='/admin/config'){if(!isAdmin(r,e))return out({error:'Admin authentication required.'},401,e);try{let v=norm(await read(r));await e.SITE_CONFIG.put(CONFIG_KEY,JSON.stringify(v),{metadata:{updatedAt:new Date().toISOString()}});return out({ok:true},200,e)}catch(x){return out({error:x.message},400,e)}}if(r.method==='GET'&&p==='/shop'){try{let items=await e.SITE_CONFIG.get(SHOP_KEY,'json');return out({items:Array.isArray(items)?items:[]},200,e)}catch{return out({error:'Could not read shop items.'},500,e)}}if(r.method==='POST'&&p==='/shop'){if(!isAdmin(r,e))return out({error:'Only the webmaster can manage shop items.'},401,e);try{let x=await read(r,12000),name=txt(x.name,80).trim(),imageUrl=txt(x.imageUrl,1200).trim(),description=txt(x.description,600).trim(),priceGems=Number(x.priceGems),category=txt(x.category,30,'Other').trim(),placement=txt(x.placement,20,'hat').trim();if(!name)throw Error('Item name is required.');if(!url(imageUrl))throw Error('A valid http:// or https:// image URL is required.');if(!Number.isInteger(priceGems)||priceGems<0||priceGems>1000000)throw Error('Price must be a whole number of Miku Gems (0–1,000,000).');if(!['Hats','Cosmetics','Accessories','Backgrounds','Other'].includes(category))category='Other';if(!['hat','face','neck','body','hand','background'].includes(placement))placement=category==='Backgrounds'?'background':'hat';if(category==='Backgrounds')placement='background';let items=await e.SITE_CONFIG.get(SHOP_KEY,'json');items=Array.isArray(items)?items:[];let idx=x.id?items.findIndex(item=>item.id===x.id):-1;if(idx<0&&items.length>=100)throw Error('The shop has reached its 100-item limit.');let item={id:idx>=0?items[idx].id:crypto.randomUUID(),name,imageUrl,description,priceGems,price:priceGems+' Miku Gems',category,placement,createdAt:idx>=0?items[idx].createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};if(idx>=0)items[idx]=item;else items.unshift(item);await e.SITE_CONFIG.put(SHOP_KEY,JSON.stringify(items),{metadata:{updatedAt:new Date().toISOString()}});return out({ok:true,item,items},200,e)}catch(x){return out({error:x.message||'Could not save shop item.'},400,e)}}if(r.method==='POST'&&p==='/shop/purchase'){
 try{
  const identity=await sparkleIdentity(r.headers.get('X-Sparkle-Code'));
  return await withUserMutationLock(identity.key,async()=>{
   const found=await readSparkleUser(r,e);
   if(!found)return out({error:'Sign in with your Sparkle Code first.'},401,e);
   const x=await read(r,3000),itemId=txt(x.itemId,100).trim(),requestId=txt(x.requestId,80).trim();
   if(!itemId)throw Error('Missing shop item.');
   if(requestId&&found.account.purchaseReceipts.includes(requestId))return out({ok:true,duplicate:true,user:safeUser(found.account)},200,e);
   const items=await e.SITE_CONFIG.get(SHOP_KEY,'json');
   const item=(Array.isArray(items)?items:[]).find(v=>v&&v.id===itemId);
   if(!item)return out({error:'That item is no longer on the shelf.'},404,e);
   if(found.account.inventory.includes(itemId))return out({ok:true,alreadyOwned:true,user:safeUser(found.account)},200,e);
   const price=Number.isInteger(item.priceGems)?item.priceGems:(/^[0-9]+$/.test(String(item.price||''))?Number(item.price):null);
   if(price===null||price<0)return out({error:'This item needs a valid Miku Gem price from the webmaster.'},400,e);
   if(found.account.gems<price)return out({error:'Not enough Miku Gems for this item.',needed:price,balance:found.account.gems},400,e);
   found.account.gems-=price;
   found.account.inventory.push(itemId);
   if(requestId)found.account.purchaseReceipts.push(requestId);
   found.account.purchaseReceipts=found.account.purchaseReceipts.slice(-100);
   await e.SITE_CONFIG.put(found.identity.key,JSON.stringify(found.account));
   return out({ok:true,purchased:true,amount:price,itemId,user:safeUser(found.account)},200,e);
  });
 }catch(x){return out({error:x.message||'Could not complete this Gem purchase.'},400,e);}
}
let shopMatch=p.match(/^\/shop\/([a-f0-9-]{20,50})$/i);if(shopMatch&&r.method==='DELETE'){if(!isAdmin(r,e))return out({error:'Only the webmaster can remove shop items.'},401,e);try{let items=await e.SITE_CONFIG.get(SHOP_KEY,'json');items=Array.isArray(items)?items:[];let next=items.filter(item=>item.id!==shopMatch[1]);if(next.length===items.length)return out({error:'Shop item not found.'},404,e);await e.SITE_CONFIG.put(SHOP_KEY,JSON.stringify(next),{metadata:{updatedAt:new Date().toISOString()}});return out({ok:true,items:next},200,e)}catch{return out({error:'Could not remove shop item.'},500,e)}}
if(r.method==='POST'&&p==='/account/create'){try{const x=await read(r,2000),alias=txt(x.alias,32,'Anonymous').trim()||'Anonymous';const code=makeSparkleCode(),identity=await sparkleIdentity(code);const account={id:identity.id,alias,gems:0,inventory:[],claimedPosts:[],createdAt:new Date().toISOString()};await e.SITE_CONFIG.put(identity.key,JSON.stringify(account));return out({ok:true,code,user:safeUser(account)},201,e)}catch(x){return out({error:x.message||'Could not create account.'},400,e)}}
if(r.method==='POST'&&p==='/account/login'){
 try{
  const x=await read(r,2000),identity=await sparkleIdentity(x.code),stored=await e.SITE_CONFIG.get(identity.key,'json',{cacheTtl:30});
  if(!stored)return out({error:'Sparkle Code not found.'},404,e);
  const account=normalizeAccountRecord(stored,identity.id);
  await e.SITE_CONFIG.put(identity.key,JSON.stringify(account));
  return out({ok:true,user:safeUser(account)},200,e);
 }catch(x){return out({error:x.message||'Could not sign in.'},400,e);}
}
if(r.method==='GET'&&p==='/account/me'){try{const found=await readSparkleUser(r,e);if(!found)return out({error:'Sparkle Code not found.'},404,e);return out({user:safeUser(found.account)},200,e)}catch(x){return out({error:x.message||'Could not load account.'},400,e)}}
if(r.method==='POST'&&p==='/account/reward'){
 try{
  const identity=await sparkleIdentity(r.headers.get('X-Sparkle-Code'));
  return await withUserMutationLock(identity.key,async()=>{
   const found=await readSparkleUser(r,e);
   if(!found)return out({error:'Sign in first.'},401,e);
   const x=await read(r,2000),postId=txt(x.postId,120).trim();
   if(!postId)throw Error('Missing post ID.');
   if(found.account.claimedPosts.includes(postId))return out({ok:true,awarded:false,amount:0,user:safeUser(found.account)},200,e);
   const config=await e.SITE_CONFIG.get(CONFIG_KEY,'json');
   const amount=Math.max(0,Math.min(1000,Math.floor(Number.isFinite(Number(config?.postGemReward))?Number(config.postGemReward):5)));
   found.account.claimedPosts.push(postId);
   found.account.gems+=amount;
   await e.SITE_CONFIG.put(found.identity.key,JSON.stringify(found.account));
   return out({ok:true,awarded:true,amount,user:safeUser(found.account)},200,e);
  });
 }catch(x){return out({error:x.message||'Could not award Gems.'},400,e);}
}
if(r.method==='GET'&&p==='/calendar'){try{let page=await e.SITE_CONFIG.list({prefix:CAL_PREFIX,limit:1000}),events=(await Promise.all(page.keys.map(k=>e.SITE_CONFIG.get(k.name,'json')))).filter(Boolean).sort((a,b)=>a.date.localeCompare(b.date)||(a.time||'99:99').localeCompare(b.time||'99:99'));return out({events},200,e)}catch{return out({error:'Could not read calendar.'},500,e)}}if(r.method==='POST'&&p==='/calendar'){try{let x=makeEvent(await read(r,8000),isAdmin(r,e));await e.SITE_CONFIG.put(CAL_PREFIX+x.id,JSON.stringify(x),{metadata:{date:x.date,isAdmin:x.isAdmin}});return out({ok:true,event:x},201,e)}catch(x){return out({error:x.message},400,e)}}let m=p.match(/^\/calendar\/([a-f0-9-]{20,50})$/i);if(m&&r.method==='DELETE'){if(!isAdmin(r,e))return out({error:'Admin access required.'},401,e);let k=CAL_PREFIX+m[1];if(!await e.SITE_CONFIG.get(k))return out({error:'Event not found.'},404,e);await e.SITE_CONFIG.delete(k);return out({ok:true},200,e)}return out({error:'Not found.'},404,e)}};
