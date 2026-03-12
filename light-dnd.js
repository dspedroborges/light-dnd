const createCSSRule = (selector, rules) => {
    const style = document.createElement('style');
    style.textContent = `${selector} { ${rules} }`;
    document.head.appendChild(style);
};
createCSSRule('[dnd="drag"].dragging', 'opacity: 0.5; border: 2px dashed black');

const draggables = document.querySelectorAll('[dnd="drag"]');
draggables.forEach(d => {
    d.style.userSelect = 'none';
    d.style.webkitUserSelect = 'none';
    d.style.msUserSelect = 'none';
    d.style.cursor = 'grab';
    d.draggable = true;
});

const drops = document.querySelectorAll('[dnd="drop"]');

const getElementPosition = (drop, element) => {
    return [...drop.querySelectorAll('[dnd="drag"]')].map(el => el.id).indexOf(element);
};

function getDropState() {
    const result = {};
    document.querySelectorAll('[dnd="drop"]').forEach(drop => {
        const dragIds = [...drop.querySelectorAll('[dnd="drag"]')].map(drag => drag.id);
        result[drop.id] = dragIds;
    });
    return result;
}

const familyMatches = (drag, drop) => {
    const dragFamily = drag.getAttribute('dnd_family');
    const dropFamily = drop.getAttribute('dnd_family');
    // both have no family → compatible
    // one has family, other doesn't → incompatible
    // both have same family → compatible
    if (!dragFamily && !dropFamily) return true;
    return dragFamily === dropFamily;
};

draggables.forEach(d => {
    d.addEventListener("dragstart", () => d.classList.add("dragging"));
    d.addEventListener("dragend", () => d.classList.remove("dragging"));
});

drops.forEach(c => {
    c.addEventListener("dragover", (e) => {
        const drag = document.querySelector('[dnd="drag"].dragging');
        if (!drag || !familyMatches(drag, c)) return;

        e.preventDefault();
        const direction = c.getAttribute('dnd-direction') ?? 'vertical';
        const afterElement = getDragAfterElement(c, e.clientX, e.clientY, direction);
        afterElement ? c.insertBefore(drag, afterElement) : c.appendChild(drag);

        const update = document.querySelector('[dnd="update"]');
        update.value = JSON.stringify({ element: drag.id, drop: c.id, order: getElementPosition(c, drag.id) });
        update.dispatchEvent(new Event('change'));

        const state = document.querySelector('[dnd="state"]');
        state.value = JSON.stringify(getDropState());
        state.dispatchEvent(new Event('change'));
    });
});

function getDragAfterElement(dropzone, x, y, direction = "vertical") {
    for (const child of dropzone.querySelectorAll('[dnd="drag"]:not(.dragging)')) {
        const box = child.getBoundingClientRect();
        if (direction === "vertical"   && y < box.top  + box.height / 2) return child;
        if (direction === "horizontal" && x < box.left + box.width  / 2) return child;
    }
    return null;
}