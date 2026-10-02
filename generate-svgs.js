const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'images', 'logos');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const svgs = {
  amazon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#fff" rx="128"/><path d="M352 288c-30 25-75 38-118 38-54 0-102-18-144-48-6-4-6-12 1-16 48-26 102-40 160-40 52 0 102 12 147 32 8 4 9 14 2 20-13 12-26 22-41 32 0 0-3 2-3 2z" fill="#FF9900"/><path d="M386 270c5-10 16-18 26-22 17-6 36-5 52 4 12 8 19 20 22 34 3 13 2 27-2 39-7 19-23 34-41 41-14 6-29 6-44 3-10-2-19-7-27-13-6-5-10-12-10-20-2-18 6-34 17-46 1-2 3-4 5-3z" fill="#FF9900"/></svg>`,
  flipkart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#FFC200" rx="128"/><path d="M352 144H208c-18 0-32 14-32 32v224c0 18 14 32 32 32h144c18 0 32-14 32-32V176c0-18-14-32-32-32zm-64 192h-48v-32h48v32zm0-64h-48v-32h48v32zm48-64h-96v-32h96v32z" fill="#2874F0"/></svg>`,
  myntra: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#fff" rx="128"/><path d="M112 384V128l96 64v192l-96-64zm192-64l96-64v256l-96-64V320zm-48-128l-48 48-48-48L208 96l48 48z" fill="#F13AB1"/></svg>`,
  ajio: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#000" rx="128"/><text x="50%" y="54%" font-family="Arial, sans-serif" font-weight="900" font-size="160" fill="#fff" text-anchor="middle" dominant-baseline="central">AJIO</text></svg>`,
  meesho: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#F43397" rx="128"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-weight="900" font-size="280" fill="#fff" text-anchor="middle" dominant-baseline="central">m</text></svg>`,
  nykaa: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#FC2779" rx="128"/><text x="50%" y="54%" font-family="Arial, sans-serif" font-weight="900" font-size="140" fill="#fff" text-anchor="middle" dominant-baseline="central">NYKAA</text></svg>`,
  tatacliq: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#212121" rx="128"/><text x="50%" y="54%" font-family="Arial, sans-serif" font-weight="900" font-size="110" fill="#fff" text-anchor="middle" dominant-baseline="central">TATA CLIQ</text></svg>`,
  croma: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#00E9C5" rx="128"/><text x="50%" y="54%" font-family="Arial, sans-serif" font-weight="900" font-size="140" fill="#000" text-anchor="middle" dominant-baseline="central">croma</text></svg>`
};

for (const [key, value] of Object.entries(svgs)) {
  fs.writeFileSync(path.join(dir, `${key}.svg`), value);
}
console.log('SVGs created successfully in ' + dir);
