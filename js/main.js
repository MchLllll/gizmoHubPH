document.documentElement.classList.add('js');
const btn=document.querySelector('.menu'),list=document.getElementById('links');
btn.addEventListener('click',()=>{const o=list.classList.toggle('open');btn.setAttribute('aria-expanded',o)});
list.addEventListener('click',e=>{if(e.target.closest('a')){list.classList.remove('open');btn.setAttribute('aria-expanded','false')}});
addEventListener('keydown',e=>{if(e.key==='Escape'&&list.classList.contains('open')){list.classList.remove('open');btn.setAttribute('aria-expanded','false');btn.focus()}});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));
