const fs = require('fs');

async function test() {
  const buffer = fs.readFileSync('package.json'); // Just to have a buffer
  let mod;
  try { mod = require('pdf-parse'); }
  catch (_) { mod = await import('pdf-parse'); }

  let Parser = mod.PDFParse || mod.default?.PDFParse || mod.default || mod;
  if (typeof Parser !== 'function' && Parser?.default) {
    Parser = Parser.default;
  }
  
  console.log("Parser type:", typeof Parser);
  
  try {
    const parser = new Parser({ data: buffer });
    console.log("parser instantiated", Object.keys(parser));
    const text = await parser.getText();
    console.log("parser.getText returned text length:", text.length);
  } catch (err) {
    console.error("error instantiated or getText", err);
  }
}
test();
