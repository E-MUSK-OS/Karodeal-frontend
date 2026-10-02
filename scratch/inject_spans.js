const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We will look for span, a, Link tags that have a className,
      // and if they don't contain any sizing class (text-xs, sm, base, lg, etc)
      // AND they contain some text-related utilities like font-bold, text-neutral, hover:text, tracking, leading
      // OR they have double spaces where text-base might have been removed.
      
      const newContent = content.replace(/<(span|a|Link)\s+([^>]*?)className=["']([^"']*)["']/g, (match, tag, before, classes) => {
        // Check if there is NO text sizing class
        if (!/text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|\[)/.test(classes)) {
          // Check if it seems like a text element (has text color, font weight, or double spaces indicating removal)
          if (/(text-[a-z]+-\d+|font-|tracking-|leading-|hover:text-|\s\s)/.test(classes)) {
             return `<${tag} ${before}className="text-sm lg:text-[15px] xl:text-base ${classes.trim()}"`;
          }
        }
        return match;
      });
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, '..', 'app'));
processDir(path.join(__dirname, '..', 'components'));
