const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'components');
const files = fs.readdirSync(directoryPath).filter(f => f.endsWith('.tsx'));
files.push('../App.tsx'); // Include App.tsx

const replacements = [
    { regex: /bg-\[#f7f9fb\]/g, replacement: 'bg-[#f7f9fb] dark:bg-[#0d1117]' },
    { regex: /text-\[#191c1e\]/g, replacement: 'text-[#191c1e] dark:text-white' },
    { regex: /bg-white/g, replacement: 'bg-white dark:bg-[#1a1d24]' },
    { regex: /text-\[#495770\]/g, replacement: 'text-[#495770] dark:text-slate-100' },
    { regex: /text-\[#424656\]/g, replacement: 'text-[#424656] dark:text-slate-300' },
    { regex: /border-slate-100/g, replacement: 'border-slate-100 dark:border-slate-800' },
    { regex: /border-slate-200/g, replacement: 'border-slate-200 dark:border-slate-800' },
    { regex: /bg-\[#f2f4f6\]/g, replacement: 'bg-[#f2f4f6] dark:bg-[#2e3440]' },
    { regex: /bg-slate-300/g, replacement: 'bg-slate-300 dark:bg-slate-700' },
    { regex: /shadow-\[([^\]]+)\]/g, replacement: (match) => {
        if(match.includes('rgba(25,28,30')) return match + ' dark:shadow-none';
        return match;
    }},
];

files.forEach(file => {
    let filePath = path.join(directoryPath, file);
    if(file === '../App.tsx') filePath = path.join(__dirname, 'src', 'App.tsx');
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Prevent double replacements if we run it multiple times
    if(content.includes('dark:bg-[#0d1117]') && file !== '../App.tsx') {
        return; // already processed or partially processed
    }
    
    replacements.forEach(({regex, replacement}) => {
        if (typeof replacement === 'function') {
            content = content.replace(regex, replacement);
        } else {
            // naive replacement but careful not to replace already injected variants
            content = content.replace(regex, (match, offset, string) => {
                // If it already has dark: nearby, don't replace
                const substr = string.substring(offset, offset + 30);
                if (substr.includes('dark:')) return match;
                return replacement;
            });
        }
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
});
