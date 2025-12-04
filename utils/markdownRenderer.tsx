export const renderMarkdownAsHtml = (markdown: string): string => {
    if (!markdown) return '';

    const lines = markdown.split('\n');
    let html: string[] = [];
    let inList = false;
    let inTable = false;
    let tableHeaderDone = false;

    const endList = () => {
        if (inList) {
            html.push('</ul>');
            inList = false;
        }
    };

    const endTable = () => {
        if (inTable) {
            html.push('</tbody></table>');
            inTable = false;
            tableHeaderDone = false;
        }
    };
    
    const processLine = (line: string) => {
        // Bold and Italic
        return line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    };

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Headers
        if (line.startsWith('### ')) {
            endList();
            endTable();
            html.push(`<h3 class="text-xl font-medium text-gray-200 mt-4 mb-2">${processLine(line.substring(4))}</h3>`);
            continue;
        }
        if (line.startsWith('## ')) {
            endList();
            endTable();
            html.push(`<h2 class="text-2xl font-semibold text-indigo-400 mt-6 mb-3 border-b border-indigo-700 pb-1">${processLine(line.substring(3))}</h2>`);
            continue;
        }
        if (line.startsWith('# ')) {
            endList();
            endTable();
            html.push(`<h1 class="text-3xl font-bold text-indigo-300 mt-8 mb-4">${processLine(line.substring(2))}</h1>`);
            continue;
        }
        
        // Horizontal Rule
        if (line.trim() === '---') {
            endList();
            endTable();
            html.push('<hr class="border-slate-600 my-4">');
            continue;
        }

        // Table
        if (line.startsWith('|')) {
            endList();
            const cells = line.split('|').map(c => c.trim()).slice(1, -1);
            if (cells.length === 0) continue;

            if (!inTable) {
                inTable = true;
                html.push('<table class="w-full my-4 text-left border-collapse">');
                // Header row
                html.push('<thead><tr>');
                cells.forEach(cell => {
                    html.push(`<th class="p-2 border-b-2 border-slate-600 bg-slate-700 text-indigo-300 font-semibold">${processLine(cell)}</th>`);
                });
                html.push('</tr></thead><tbody>');
                tableHeaderDone = true;
                // Skip the separator line
                if (lines[i + 1] && lines[i + 1].includes('---')) {
                    i++;
                }
            } else {
                // Data rows
                html.push('<tr class="border-t border-slate-700 hover:bg-slate-700/50">');
                cells.forEach(cell => {
                    html.push(`<td class="p-2">${processLine(cell)}</td>`);
                });
                html.push('</tr>');
            }
            continue;
        } else if (inTable) {
            endTable();
        }


        // Lists
        const listMatch = line.match(/^(\s*)(\*|-)\s+(.*)/);
        if (listMatch) {
            endTable();
            if (!inList) {
                html.push('<ul class="list-disc pl-5 mt-2 space-y-1">');
                inList = true;
            }
            html.push(`<li>${processLine(listMatch[3])}</li>`);
            continue;
        } else if (inList) {
            endList();
        }

        // Paragraphs
        if (line.trim().length > 0) {
            endList();
            endTable();
            html.push(`<p class="mb-3">${processLine(line)}</p>`);
        }
    }

    endList();
    endTable();
    return html.join('\n');
};
