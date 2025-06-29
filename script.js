// [Unchanged initial variables]
let draggedItem = null;
let part1Complete = false;
let dragClone = null;
let touchOffsetX = 0;
let touchOffsetY = 0;

// Track original containers for part 2
const originalContainers = new Map();

// Auto-scroll for touch
function autoScroll(y) {
  const threshold = 60;
  const speed = 20;
  const vh = window.innerHeight;
  if (y > vh - threshold) window.scrollBy(0, speed);
  else if (y < threshold) window.scrollBy(0, -speed);
}

// Enable draggables
function setupDraggables() {
  document.querySelectorAll('.draggable').forEach(item => {
    if (item.dataset.part === '2') {
      originalContainers.set(item.id, item.parentElement);
    }

    item.addEventListener('dragstart', () => {
      draggedItem = item;
      setTimeout(() => item.style.display = 'none', 0);
    });

    item.addEventListener('dragend', () => {
      setTimeout(() => {
        item.style.display = 'block';
        draggedItem = null;
      }, 0);
    });

    item.addEventListener('touchstart', touchStartHandler, { passive: false });
    item.addEventListener('touchmove', touchMoveHandler, { passive: false });
    item.addEventListener('touchend', touchEndHandler);
  });
}

setupDraggables();

// Touch handlers
function touchStartHandler(e) {
  e.preventDefault();
  draggedItem = e.currentTarget;
  const rect = draggedItem.getBoundingClientRect();
  dragClone = draggedItem.cloneNode(true);
  dragClone.style.position = 'fixed';
  dragClone.style.left = `${rect.left}px`;
  dragClone.style.top = `${rect.top}px`;
  dragClone.style.width = `${rect.width}px`;
  dragClone.style.height = `${rect.height}px`;
  dragClone.style.pointerEvents = 'none';
  dragClone.style.zIndex = '1000';
  document.body.appendChild(dragClone);
  draggedItem.classList.add('dragging');
  draggedItem.style.display = 'none';
  const touch = e.touches[0];
  touchOffsetX = touch.clientX - rect.left;
  touchOffsetY = touch.clientY - rect.top;
}

function touchMoveHandler(e) {
  e.preventDefault();
  if (!dragClone) return;
  const touch = e.touches[0];
  dragClone.style.left = `${touch.clientX - touchOffsetX}px`;
  dragClone.style.top = `${touch.clientY - touchOffsetY}px`;
  autoScroll(touch.clientY);
}

function touchEndHandler(e) {
  e.preventDefault();
  if (!draggedItem) return;
  const touch = e.changedTouches[0];
  let placed = false;

  document.querySelectorAll('.drop-zone').forEach(zone => {
    const rect = zone.getBoundingClientRect();
    const isInside =
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom;

    const part = draggedItem.dataset.part;
    const isValidDropZone = zone.dataset.part === part;

    if (isInside && isValidDropZone) {
      if (zone.classList.contains('drag-bank')) {
        if (part === '2') {
          const original = originalContainers.get(draggedItem.id);
          if (original) original.appendChild(draggedItem);
        }
        placed = true;
        return;
      }

      if (zone.firstChild && zone.firstChild !== draggedItem) {
        const displaced = zone.firstChild;
        if (part === '1') {
          const dragBank = document.querySelector('#part1 .drag-bank');
          dragBank.appendChild(displaced);
        } else {
          const home = originalContainers.get(displaced.id);
          if (home) home.appendChild(displaced);
        }
      }

      zone.appendChild(draggedItem);
      placed = true;
    }
  });

  if (!placed) {
    const originalBank =
      draggedItem.dataset.part === '2'
        ? originalContainers.get(draggedItem.id)
        : document.querySelector('#part1 .drag-bank:has(#' + draggedItem.id + ')');

    if (originalBank) originalBank.appendChild(draggedItem);
  }

  draggedItem.classList.remove('dragging');
  draggedItem.style.display = 'block';
  if (dragClone) dragClone.remove();
  dragClone = null;
  draggedItem = null;
}

// Mouse drop zones
document.querySelectorAll('.drop-zone').forEach(zone => {
  zone.addEventListener('dragover', e => e.preventDefault());

  zone.addEventListener('drop', () => {
    if (!draggedItem) return;

    const part = draggedItem.dataset.part;
    const isValidDropZone = zone.dataset.part === part;

    if (part === '2' && zone.classList.contains('drag-bank')) {
      const home = originalContainers.get(draggedItem.id);
      if (home) home.appendChild(draggedItem);
      return;
    }

    if (isValidDropZone) {
      if (zone.firstChild && zone.firstChild !== draggedItem) {
        const displaced = zone.firstChild;
        if (part === '1') {
          const dragBank = document.querySelector('#part1 .drag-bank');
          dragBank.appendChild(displaced);
        } else {
          const home = originalContainers.get(displaced.id);
          if (home) home.appendChild(displaced);
        }
      }

      zone.appendChild(draggedItem);
    }
  });
});

// Drag bank drop zone
document.querySelectorAll('.drag-bank').forEach(bank => {
  bank.addEventListener('dragover', e => e.preventDefault());
  bank.addEventListener('drop', () => {
    if (draggedItem) {
      if (draggedItem.dataset.part === '2') {
        const home = originalContainers.get(draggedItem.id);
        if (home === bank) bank.appendChild(draggedItem);
      } else if (draggedItem.dataset.part === '1' && bank.closest('#part1')) {
        bank.appendChild(draggedItem);
      }
    }
  });
});

// Check answers
function checkPart1Handler() {
  const expected = ['star', 'fire', 'air', 'water', 'earth'];
  const zones = document.querySelectorAll('.drop-zone[data-part="1"]');
  validateAnswer(zones, expected, 1);
}

function checkPart2Handler() {
  const expected = ['fire2', 'earth2', 'air2', 'water2'];
  const zones = document.querySelectorAll('.drop-zone[data-part="2"]');
  validateAnswer(zones, expected, 2);
}

document.getElementById('checkPart1').addEventListener('click', checkPart1Handler);
document.getElementById('checkPart1').addEventListener('touchend', e => {
  e.preventDefault();
  checkPart1Handler();
});

document.getElementById('checkPart2').addEventListener('click', checkPart2Handler);
document.getElementById('checkPart2').addEventListener('touchend', e => {
  e.preventDefault();
  checkPart2Handler();
});

// Validate
function validateAnswer(zones, expected, partNumber) {
  for (let i = 0; i < expected.length; i++) {
    const child = zones[i].firstChild;
    if (!child || child.id !== expected[i]) {
      showSplashScreen(false);
      return;
    }
  }
  if (partNumber === 1) {
    part1Complete = true;
    document.getElementById('toPart2').disabled = false;
    document.getElementById('toPart2').classList.remove('disabled');
    showSplashScreen(true, partNumber);
  } else {
    showSplashScreen(true, partNumber);
  }
}

// Splash screen
function showSplashScreen(success, partNumber = 1) {
  const splash = document.createElement('div');
  splash.id = 'splash-screen';
  splash.innerHTML = success
    ? `
      <div class="splash-content">
        <h2>🎉 Correct!</h2>
        <p>${partNumber === 2 ? "Your partner's password is: <strong>cosmos</strong>" : "Success! Proceed to part 2 by clicking Next →"}</p>
        <p><em>Click anywhere to continue.</em></p>
      </div>
    `
    : `
      <div class="splash-content">
        <h2>❌ Try Again</h2>
        <p>Check the order and try again.</p>
      </div>
    `;
  splash.addEventListener('click', () => splash.remove());
  document.body.appendChild(splash);
  if (!success) setTimeout(() => splash.remove(), 2000);
}

// Navigation
function toPart2Handler() {
  if (!part1Complete) return;
  document.getElementById('part1').style.display = 'none';
  document.getElementById('part2').style.display = 'block';
  document.querySelector('h1').textContent = 'Which symbol goes in each question mark?';
  document.querySelector('p').textContent = 'Aristotle speaks of one Element being able to easily transmute by changing one “quality”.';
  document.querySelectorAll('.draggable[data-part="1"]').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.draggable[data-part="2"]').forEach(el => el.style.display = 'inline');
  document.querySelectorAll('.instruction-extra').forEach(el => el.remove());
}

function toPart1Handler() {
  document.getElementById('part2').style.display = 'none';
  document.getElementById('part1').style.display = 'block';
  document.querySelector('h1').textContent = 'Can You Arrange the Elements?';
  document.querySelector('p').textContent = 'Match the elements to Aristotle\'s law of natural motion by dragging them into place on the sphere.';
  document.querySelectorAll('.draggable[data-part="1"]').forEach(el => el.style.display = 'inline');
  document.querySelectorAll('.draggable[data-part="2"]').forEach(el => el.style.display = 'none');
}

document.getElementById('toPart2').addEventListener('click', toPart2Handler);
document.getElementById('toPart2').addEventListener('touchend', e => {
  e.preventDefault();
  toPart2Handler();
});
document.getElementById('toPart1').addEventListener('click', toPart1Handler);
document.getElementById('toPart1').addEventListener('touchend', e => {
  e.preventDefault();
  toPart1Handler();
});

// Disable Next by default
document.getElementById('toPart2').disabled = true;
document.getElementById('toPart2').classList.add('disabled');
