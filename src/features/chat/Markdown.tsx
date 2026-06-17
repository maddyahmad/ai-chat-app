interface MarkdownProps {
    children: string;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function parseInline(text: string): string {
    return escapeHtml(text)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code class="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-[0.82em] font-mono">$1</code>');
}

export function Markdown({ children }: MarkdownProps) {
    const lines = children.split('\n');
    const blocks: string[] = [];
    let inList = false;
    let listItems: string[] = [];

    const flushList = () => {
        if (listItems.length) {
            blocks.push(`<ul class="list-disc list-outside pl-5 space-y-0.5">${listItems.map((li) => `<li>${li}</li>`).join('')}</ul>`);
            listItems = [];
            inList = false;
        }
    };

    for (const raw of lines) {
        const line = raw.trimEnd();

        // Ordered list
        const olMatch = line.match(/^(\d+)\.\s+(.*)/);
        if (olMatch) {
            if (inList) flushList();
            listItems.push(parseInline(olMatch[2]));
            inList = true;
            continue;
        }

        // Unordered list
        const ulMatch = line.match(/^[-*]\s+(.*)/);
        if (ulMatch) {
            listItems.push(parseInline(ulMatch[1]));
            inList = true;
            continue;
        }

        flushList();

        if (line === '') {
            // blank line – just spacing handled by prose gap
            continue;
        }

        blocks.push(`<p>${parseInline(line)}</p>`);
    }

    flushList();

    return (
        <div
            className="prose-sm leading-relaxed space-y-1.5 [&_ul]:my-1 [&_li]:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blocks.join('') }}
        />
    );
}
