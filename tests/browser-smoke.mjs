// Optional browser tooling is kept outside production dependencies.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright-core');
import fs from 'node:fs';
import assert from 'node:assert/strict';
const origin = process.env.BASE_URL || 'http://localhost:3200';
if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(origin).hostname)) throw new Error('Run smoke tests against a local read-only fixture only');
const outputDir = process.env.BROWSER_OUTPUT_DIR || '/tmp';
fs.mkdirSync(outputDir, { recursive: true });
const data=JSON.parse(fs.readFileSync(new URL('../lib/productsData.json', import.meta.url),'utf8'));
const locales=['uk','ru','en','pl','de'];
const baseline = process.env.BASELINE_HTTP_REPORT ? JSON.parse(fs.readFileSync(process.env.BASELINE_HTTP_REPORT,'utf8')) : [];
const reports=[]; const errors=[]; const mutations=[]; const external=[];
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
async function context(options={}) {
 const c=await browser.newContext(options);
 await c.route('**/*',async route=>{
  const r=route.request(),u=new URL(r.url());
  if(r.method()!=='GET'){mutations.push({url:r.url(),method:r.method()});await route.abort();return;}
  if(u.origin!==origin){external.push(r.url());await route.abort();return;}
  await route.continue();
 });
 c.on('page',p=>{p.on('pageerror',e=>errors.push({url:p.url(),error:e.message}));p.on('dialog',d=>d.dismiss());});
 return c;
}
function canonical(locale,path){return 'https://autovarka.com.ua'+(locale==='uk'?'':'/'+locale)+path;}
function name(p,locale){return p[{uk:'name',ru:'nameRu',en:'nameEn',pl:'namePl',de:'nameDe'}[locale]];}
async function alternates(p,path){
 const canonicalURL=await p.locator('link[rel=canonical]').getAttribute('href');
 const map=await p.locator('link[rel=alternate][hreflang]').evaluateAll(a=>Object.fromEntries(a.map(x=>[x.hreflang,x.href])));
 const expected=Object.fromEntries([...locales.map(l=>[l,canonical(l,path.replace(/^\/(uk|ru|en|pl|de)(?=\/|$)/,''))]),['x-default',canonical('uk',path.replace(/^\/(uk|ru|en|pl|de)(?=\/|$)/,''))]]);
 assert.deepEqual(map,expected);
 const before=baseline.find(x=>x.path===path);
 if(before){assert.equal(canonicalURL,before.canonicals[0]);assert.deepEqual(map,Object.fromEntries(before.hreflang));}
 return {canonical:canonicalURL,hreflang:map};
}
try {
 const noJS=await context({javaScriptEnabled:false,viewport:{width:390,height:844}});
 for(const locale of locales){
  const prefix=locale==='uk'?'':'/'+locale; const p=await noJS.newPage();
  const response=await p.goto(origin+prefix+'/products',{waitUntil:'load'});assert.equal(response.status(),200);
  for(const product of data){
   assert.equal(await p.locator(`a[href="${prefix}/products/${product.id}"]`).count(),1);
   assert.equal(await p.getByRole('heading',{level:3,name:name(product,locale),exact:true}).count(),1);
   const card=await p.getByRole('heading',{level:3,name:name(product,locale),exact:true}).evaluate(el=>el.closest('div.group')?.textContent);
   assert.ok(card?.includes(product.price+' ₴'), `${locale}: correct price for ${product.id}`);
  }
  const a=await alternates(p,prefix+'/products');assert.equal(a.canonical,canonical(locale,'/products'));
  reports.push({check:'no-JS SSR catalog',locale,products:data.length,status:response.status(),...a});
  const product=data[0],path=prefix+'/products/'+product.id;
  const productResponse=await p.goto(origin+path,{waitUntil:'load'});assert.equal(productResponse.status(),200);
  assert.equal(await p.locator('h1').textContent(),name(product,locale));
  const schemas=await p.locator('script[type="application/ld+json"]').evaluateAll(s=>s.map(x=>JSON.parse(x.textContent)));
  const types=schemas.map(s=>s['@type']).sort();assert.deepEqual(types,['BreadcrumbList','Organization','Product','WebSite']);
  const productSchema=schemas.find(s=>s['@type']==='Product');assert.equal(productSchema.name,name(product,locale));assert.equal(productSchema.offers.price,product.price);assert.equal(productSchema.offers.availability,'https://schema.org/InStock');assert.equal(productSchema.offers.url,canonical(locale,'/products/'+product.id));
  assert.equal(await p.locator('iframe').count(),0);
  const pa=await alternates(p,path);assert.equal(pa.canonical,canonical(locale,'/products/'+product.id));
  reports.push({check:'no-JS product schemas/metadata',locale,status:productResponse.status(),types,...pa});
  await p.close();
 }
 await noJS.close();
 for(const [device,viewport] of [['mobile',{width:390,height:844}],['desktop',{width:1440,height:900}]]){
  const c=await context({viewport,reducedMotion:'reduce'});const p=await c.newPage();
  for(const [label,path] of [['home','/en'],['catalog','/en/products'],['product','/en/products/'+data[0].id]]){
   await p.goto(origin+path,{waitUntil:'networkidle'});await p.locator('h1').waitFor({state:'visible'});
   const style=await p.locator('h1').evaluate(el=>({opacity:getComputedStyle(el).opacity,rect:el.getBoundingClientRect().toJSON(),width:document.documentElement.scrollWidth}));
   assert.equal(style.opacity,'1');assert.ok(style.width<=viewport.width);
   await p.screenshot({path:`${outputDir}/autovarka-after-${label}-${device}.png`,fullPage:false});
   reports.push({check:'reduced motion / screenshot',device,path,h1Opacity:style.opacity,noHorizontalOverflow:true});
  }
  await c.close();
 }
 const c=await context({viewport:{width:1365,height:900}});const p=await c.newPage();
 await p.goto(origin+'/en/products/'+data[0].id,{waitUntil:'networkidle'});
 // Change thumbnail, then navigate through the real related-product Link.
 const gallery=p.locator('div.relative.aspect-square').first();
 const mainPhoto=gallery.locator('img');const firstSource=await mainPhoto.getAttribute('src');
 const thumbnails=p.locator('button').filter({has:p.locator('img')});
 await thumbnails.nth(1).click();await p.waitForFunction(src=>document.querySelector('div.relative.aspect-square img')?.getAttribute('src')!==src,firstSource);
 const secondSource=await mainPhoto.getAttribute('src');assert.notEqual(secondSource,firstSource);
 const relatedPath='/en/products/'+data[1].id;
 await p.locator(`a[href="${relatedPath}"]`).first().click();await p.waitForURL(origin+relatedPath);await p.waitForLoadState('networkidle');
 assert.equal(await p.locator('h1').textContent(),name(data[1],'en'));
 assert.ok((await p.locator('div.relative.aspect-square img').getAttribute('src')).includes(encodeURIComponent(data[1].images[0])));
 const newSchemas=await p.locator('script[type="application/ld+json"]').evaluateAll(s=>s.map(x=>JSON.parse(x.textContent)));
 assert.equal(newSchemas.filter(s=>s['@type']==='Product').length,1);assert.equal(newSchemas.find(s=>s['@type']==='Product').sku,data[1].id);
 reports.push({check:'gallery selection / client navigation / fresh schema',passed:true});
 await p.locator('input[type=number]').fill('2');
 await p.getByRole('button',{name:/Add to Cart/i}).click();
 await p.goto(origin+'/en/cart',{waitUntil:'networkidle'});
 assert.equal(await p.getByRole('heading',{level:3,name:name(data[1],'en')}).count(),1);
 const readCart=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('cart-storage')).state.items);
 assert.equal((await readCart())[0].quantity,2);
 await p.getByRole('button',{name:'+',exact:true}).click();assert.equal((await readCart())[0].quantity,3);
 await p.getByRole('button',{name:'-',exact:true}).click();assert.equal((await readCart())[0].quantity,2);
 await p.reload({waitUntil:'networkidle'});assert.equal((await readCart())[0].quantity,2);
 // Inspect checkout and native validity only; never submit an order.
 await p.getByRole('button',{name:'Checkout',exact:true}).click();
 const checkout = p.locator('form');
 assert.equal(await checkout.locator('input[required]').count(),5);
 assert.equal(await checkout.locator('input[type=tel][required]').count(),1);
 assert.equal(await checkout.locator('input[type=email]').getAttribute('required'),null);
 assert.equal(await checkout.locator('select option').count(),3);
 assert.equal(await checkout.evaluate(form=>form.checkValidity()),false);
 const textInputs=checkout.locator('input[type=text]');
 for(let index=0;index<await textInputs.count();index++) await textInputs.nth(index).fill('SEO fixture');
 await checkout.locator('input[type=tel]').fill('+380000000000');
 assert.equal(await checkout.evaluate(form=>form.checkValidity()),true);
 await checkout.locator('select').selectOption('card');
 await checkout.locator('select').selectOption('prepayment');
 await checkout.locator('select').selectOption('cashOnDelivery');
 await checkout.getByRole('button',{name:'Cancel',exact:true}).click();
 assert.equal(await p.locator('form').count(),0);
 reports.push({check:'checkout required fields, payment choices, native validity and cancel; no submission',passed:true});
 await p.getByRole('button',{name:'Remove',exact:true}).click();assert.equal((await readCart()).length,0);
 reports.push({check:'cart add 2 / plus / minus / persist / remove; no checkout submission',passed:true});
 await p.goto(origin+'/en/products/'+data[0].id,{waitUntil:'networkidle'});assert.equal(await p.locator('iframe').count(),0);
 await p.getByRole('button',{name:/^Play video:/}).click();
 const iframe=p.locator('iframe');await iframe.waitFor({state:'attached'});
 assert.equal(await iframe.getAttribute('src'),'https://www.youtube.com/embed/vnwhJnRX8b4?autoplay=1');
 reports.push({check:'video click facade / no early iframe / correct video',passed:true,playbackExternalBlocked:true});
 await p.goto(origin+'/en/admin',{waitUntil:'networkidle'});
 await p.locator('#username').waitFor({state:'visible'});
 assert.equal(await p.locator('#password').getAttribute('type'),'password');
 assert.equal(await p.locator('#username').getAttribute('required'),'');
 assert.equal(await p.locator('#password').getAttribute('required'),'');
 for (const path of ['/api/auth/session','/api/orders']) {
  const response=await p.request.get(origin+path);
  assert.equal(response.status(),401);
 }
 reports.push({check:'admin login UI, required credentials, unauthorized session/orders 401; no login or writes',passed:true});
 await c.close();
 assert.deepEqual(errors,[]);assert.deepEqual(mutations,[]);
 console.log(JSON.stringify({passed:true,reports,pageErrors:errors,mutations,externalBlocked:external},null,2));
 fs.writeFileSync(`${outputDir}/autovarka-final-browser-regression.json`,JSON.stringify({passed:true,reports,pageErrors:errors,mutations,externalBlocked:external},null,2));
} catch(error){console.error(error.stack);console.error(JSON.stringify({reports,pageErrors:errors,mutations,externalBlocked:external},null,2));fs.writeFileSync(`${outputDir}/autovarka-final-browser-regression.json`,JSON.stringify({passed:false,error:error.stack,reports,pageErrors:errors,mutations,externalBlocked:external},null,2));process.exitCode=1;} finally{await browser.close();}
