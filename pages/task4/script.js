function randomColor() {
    const h = Math.floor(Math.random() * 360);
    return `hsl(${h}, 70%, 75%)`;
}

const baseColor = randomColor();

class ListItem {
    #baseColor;
    #activeColor;

    constructor({ text, key }) {
        this.text = text;
        this.key = key;
        this.#baseColor = baseColor;
        this.#activeColor = baseColor;
        this.element = null;
        this.clone = null;
        this.isInWorkspace = false;
        this.borderColor = null;
    }

    get baseColor() { return this.#baseColor; }
    get activeColor() { return this.#activeColor; }
    set activeColor(v) { this.#activeColor = v; }

    reset() {
        this.#activeColor = this.#baseColor;
        this.isInWorkspace = false;

        if (this.element) {
            this.element.style.visibility = '';
            this.element.style.opacity = '1';
            this.element.style.backgroundColor = this.#baseColor;
            this.element.style.borderColor = this.borderColor || '';
        }

        if (this.clone) {
            this.clone.remove();
            this.clone = null;
        }
    }
}

const data_input_field = document.getElementById('data-input');
const puzzle_out_button = document.getElementById('puzzle-out');
const associative_list = document.getElementById('associative-list'); 
const workspace = document.getElementById('workspace');
const topSection = document.getElementById('top-section');

function create_associative_list(data) {
    const lower = [];
    const upper = [];
    const numbers = [];

    for (const item of data) {
        const trimmed = item.trim();
        if (!trimmed) continue;

        if (!isNaN(trimmed) && trimmed !== '') {
            numbers.push(Number(trimmed));
        } else if (trimmed[0] === trimmed[0].toUpperCase() && trimmed[0] !== trimmed[0].toLowerCase()) {
            upper.push(trimmed);
        } else {
            lower.push(trimmed);
        }
    }

    lower.sort((a, b) => a.localeCompare(b));
    upper.sort((a, b) => a.localeCompare(b));
    numbers.sort((a, b) => a - b);

    const result = {};
    lower.forEach((w, i) => { result[`a${i + 1}`] = w; });
    upper.forEach((w, i) => { result[`b${i + 1}`] = w; });
    numbers.forEach((n, i) => { result[`n${i + 1}`] = n; });

    return result;
}

const items = [];
const itemsById = new Map();

function buildItems(sortedResult) {
    items.length = 0;
    itemsById.clear();
    
    associative_list.innerHTML = '';
    workspace.innerHTML = '';

    for (const [key, value] of Object.entries(sortedResult)) {
        const item = new ListItem({
            text: String(value),
            key,
        });
        items.push(item);
        itemsById.set(key, item);
    }
}

function createItemElement(item) {
    const el = document.createElement('li');
    el.id = item.key;
    el.className = 'associative-list-items';
    el.textContent = `${item.key} ${item.text}`;
    el.style.backgroundColor = item.baseColor;
    el.style.border = '2px solid transparent'; 
    el.draggable = true;
    item.element = el;
    return el;
}

function renderPool() {
    associative_list.innerHTML = '';

    for (const item of items) {
        if (item.isInWorkspace) {
            const el = item.element;
            el.style.visibility = 'hidden';
            el.style.opacity = '0.5';
            associative_list.appendChild(el);
        } else {
            const el = item.element || createItemElement(item);
            el.style.visibility = '';
            el.style.opacity = '1';
            el.style.position = '';
            el.style.left = '';
            el.style.top = '';
            associative_list.appendChild(el);
        }
    }
}

puzzle_out_button.addEventListener('click', () => {
    const data = data_input_field.value.split('-');
    const sorted = create_associative_list(data);

    buildItems(sorted);
    renderPool();
});

let draggingId = null;

document.addEventListener('dragstart', (e) => {
    const el = e.target.closest('li');
    if (!el) return;
    
    if (el.id.startsWith('clone-')) {
        draggingId = el.id.replace('clone-', '');
    } else {
        draggingId = el.id;
    }
    
    e.dataTransfer.effectAllowed = 'move';
});

document.addEventListener('dragover', (e) => {
    const target = e.target.closest('#workspace, #associative-list');
    if (target) {
        e.preventDefault();
    }
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    if (!draggingId) return;

    const item = itemsById.get(draggingId);
    if (!item) return;

    const targetWorkspace = e.target.closest('#workspace');
    const targetPool = e.target.closest('#associative-list');

    if (targetWorkspace) {
        if (!item.isInWorkspace) {
            const cloneEl = item.element.cloneNode(true);
            cloneEl.style.visibility = 'visible'; 
            cloneEl.style.opacity = '1';
            cloneEl.style.position = 'absolute';
            cloneEl.draggable = true;
            cloneEl.id = 'clone-' + item.key;

            targetWorkspace.appendChild(cloneEl);
            item.clone = cloneEl;
            item.isInWorkspace = true;

            item.element.style.visibility = 'hidden';
            item.element.style.opacity = '0.5';
        }

        const rect = targetWorkspace.getBoundingClientRect();
        const elRect = item.clone.getBoundingClientRect();

        let x = e.clientX - rect.left - elRect.width / 2;
        let y = e.clientY - rect.top - elRect.height / 2;

        x = Math.max(0, Math.min(x, targetWorkspace.clientWidth - elRect.width));
        y = Math.max(0, Math.min(y, targetWorkspace.clientHeight - elRect.height));

        item.clone.style.left = `${x}px`;
        item.clone.style.top = `${y}px`;

        item.activeColor = randomColor();
        item.clone.style.backgroundColor = item.activeColor;
        item.clone.style.borderColor = item.activeColor;
    }
    
    else if (targetPool) {
        if (item.isInWorkspace) {
            const spans = topSection.querySelectorAll('span');
            if (spans.length > 0) {
                const lastSpan = spans[spans.length - 1];
                item.borderColor = lastSpan.style.color;
            } else {
                item.borderColor = null; 
            }

            item.reset(); 
            renderPool(); 
        }
    }

    draggingId = null;
});

workspace.addEventListener('click', (e) => {
    const clickedLi = e.target.closest('li');
    if (!clickedLi) return;

    const realId = clickedLi.id.replace('clone-', '');
    const item = itemsById.get(realId);
    
    if (!item) return;

    const wordSpan = document.createElement('span');
    wordSpan.textContent = item.text;
    wordSpan.style.color = item.activeColor; 
    wordSpan.style.marginRight = '10px';
    topSection.appendChild(wordSpan);
});