/* =====================================================================
   Chequeo de consistência: todos os IDs usados no script.js existem no
   index.html?  Executar: node tools/chequear_ids.js
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '..', 'app');
const html = fs.readFileSync(path.join(base, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(base, 'script.js'), 'utf8');

const idsHtml = new Set();
const reHtml = /id="([^"]+)"/g;
let m;
while ((m = reHtml.exec(html)) !== null) idsHtml.add(m[1]);

const idsJs = new Set();
const reJs = /\$\('([^']+)'\)/g;
while ((m = reJs.exec(js)) !== null) idsJs.add(m[1]);

let falhas = 0;
idsJs.forEach(function (id) {
  if (!idsHtml.has(id)) {
    console.log('❌ ID usado no script.js e NÃO existe no HTML: ' + id);
    falhas++;
  }
});

console.log('IDs no HTML: ' + idsHtml.size);
console.log('IDs referenciados no JS: ' + idsJs.size);
if (falhas === 0) {
  console.log('✅ Todos os IDs existem no HTML.');
} else {
  console.log(falhas + ' ID(s) em falta!');
  process.exit(1);
}