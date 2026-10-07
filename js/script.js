function toggleMenu(){document.getElementById('navLinks')?.classList.toggle('active');}
function setLanguage(lang){
  document.documentElement.lang=lang;
  document.querySelectorAll('[data-en][data-mr]').forEach(el=>{
    if(el.tagName==='OPTION') el.textContent=el.getAttribute('data-'+lang);
    else el.textContent=el.getAttribute('data-'+lang);
  });
  document.querySelectorAll('.lang-switch button').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
  localStorage.setItem('ddecor-language',lang);
}
let selectedBudget=0;
let cart={};
const WA_NUMBER='919890021266';
const EMAIL_TO='DDecor@gmail.com';
function selectBudget(amount,el){
  selectedBudget=amount;
  cart={};
  document.querySelectorAll('.budget-card').forEach(c=>c.classList.remove('active'));
  el?.classList.add('active');
  const display=document.getElementById('displayBudget'); if(display) display.textContent=amount;
  const section=document.getElementById('productSection'); if(section) section.style.display='block';
  document.querySelectorAll('.gift-product').forEach(p=>{
    p.classList.remove('selected');
    const min=Number(p.dataset.min||0);
    p.style.display=min<=amount?'block':'none';
  });
  renderCart(); updateGiftSummary();
  setTimeout(()=>section?.scrollIntoView({behavior:'smooth',block:'start'}),80);
}
function toggleProduct(el){
  if(!selectedBudget)return;
  const name=el.dataset.name,price=Number(el.dataset.price||0);
  if(cart[name]) delete cart[name]; else cart[name]={name,price,qty:1};
  el.classList.toggle('selected',!!cart[name]);
  renderCart(); updateGiftSummary();
}
function changeQty(name,delta){
  if(!cart[name])return;
  cart[name].qty=Math.max(1,cart[name].qty+delta);
  renderCart(); updateGiftSummary();
}
function removeProduct(name){
  delete cart[name];
  document.querySelectorAll('.gift-product').forEach(p=>{if(p.dataset.name===name)p.classList.remove('selected')});
  renderCart(); updateGiftSummary();
}
function getSelectedProducts(){return Object.values(cart);}
function renderCart(){
  const box=document.getElementById('selectedProductsList'); if(!box)return;
  const items=getSelectedProducts();
  const count=items.reduce((s,p)=>s+p.qty,0);
  const counter=document.getElementById('cartCount'); if(counter) counter.textContent=`${count} item${count===1?'':'s'}`;
  if(!items.length){box.innerHTML='<p>No products selected yet.</p>';return;}
  box.innerHTML=items.map(p=>`<div class="cart-row">
    <div class="cart-name"><strong>${escapeHtml(p.name)}</strong><small>₹${p.price} each</small></div>
    <div class="qty-control"><button type="button" onclick="changeQty('${escapeAttr(p.name)}',-1)">−</button><span>${p.qty}</span><button type="button" onclick="changeQty('${escapeAttr(p.name)}',1)">+</button></div>
    <div class="cart-price">₹${p.price*p.qty}</div>
    <button type="button" class="remove-btn" onclick="removeProduct('${escapeAttr(p.name)}')">Remove</button>
  </div>`).join('');
}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function escapeAttr(s){return String(s).replace(/'/g,"\\'");}
function updateGiftSummary(){
  const items=getSelectedProducts();
  const total=items.reduce((sum,p)=>sum+p.price*p.qty,0);
  const budgetQty=Math.max(1,Number(document.getElementById('quantity')?.value||1));
  const budgetOrder=selectedBudget*budgetQty;
  const remaining=budgetOrder-total;
  const b=document.getElementById('budgetSummary'); if(b)b.textContent=`Budget per gift: ₹${selectedBudget||0}`;
  const ps=document.getElementById('productSummary'); if(ps)ps.innerHTML=items.length?items.map(p=>`${escapeHtml(p.name)} × ${p.qty} = ₹${p.price*p.qty}`).join('<br>'):'No products selected';
  const t=document.getElementById('totalSummary'); if(t)t.textContent=`Selected Total: ₹${total}`;
  const r=document.getElementById('remainingSummary'); if(r){r.textContent=remaining>=0?`Remaining Budget: ₹${remaining}`:`Over Budget: ₹${Math.abs(remaining)}`;r.className='remaining '+(remaining>=0?'good':'over');}
  const g=document.getElementById('grandTotal'); if(g)g.innerHTML=`<strong>Estimated Order Value: ₹${total}</strong>`;
}
function enquiryText(){
  const items=getSelectedProducts();
  const qty=Math.max(1,Number(document.getElementById('quantity')?.value||1));
  const name=document.getElementById('customerName')?.value.trim()||'Not provided';
  const phone=document.getElementById('customerPhone')?.value.trim()||'Not provided';
  const occasion=document.getElementById('occasion')?.value||'Not selected';
  const date=document.getElementById('deliveryDate')?.value||'Not decided';
  const note=document.getElementById('specialMessage')?.value.trim()||'None';
  const total=items.reduce((s,p)=>s+p.price*p.qty,0);
  return `DDECOR - GIFT ENQUIRY\n\nName: ${name}\nWhatsApp: ${phone}\nOccasion: ${occasion}\nBudget per Gift: ₹${selectedBudget||0}\nTotal Gift Quantity: ${qty}\nDelivery Date: ${date}\n\nSelected Products:\n${items.length?items.map(p=>`- ${p.name} | Qty: ${p.qty} | ₹${p.price} each | ₹${p.price*p.qty}`).join('\n'):'No products selected'}\n\nEstimated Order Value: ₹${total}\n\nSpecial Requirement:\n${note}\n\nPlease confirm availability, packaging and final pricing.`;
}
function sendWhatsAppEnquiry(){window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(enquiryText())}`,'_blank');}
function sendEmailEnquiry(){
  const subject='Gift Enquiry - DDecor';
  const body=enquiryText();
  const status=document.getElementById('emailStatus'); if(status)status.textContent='Opening your email app…';
  window.location.href=`mailto:${EMAIL_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
document.addEventListener('DOMContentLoaded',()=>{setLanguage(localStorage.getItem('ddecor-language')||'en');renderCart();updateGiftSummary();});
