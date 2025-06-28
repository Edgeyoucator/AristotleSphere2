let draggedItem = null;
let part1Complete = false;
let dragClone = null;
let touchOffsetX = 0;
let touchOffsetY = 0;

// Auto-scroll when dragging near screen edges on touch devices
function autoScroll(y) {
  const threshold = 60; // distance from edge to start scrolling
  const speed = 20; // pixels per frame
  const vh = window.innerHeight;

  if (y > vh - threshold) {
    window.scrollBy(0, speed);
  } else if (y < threshold) {
    window.scrollBy(0, -speed);
  }
}


// Enable drag-and-drop for all draggable items

function setupDraggables() {
  document.querySelectorAll('.draggable').forEach(item => {
    item.addEventListener('dragstart', () => {
      draggedItem = item;
      setTimeout(() => {
        item.style.display = 'none';
      }, 0);
    });

    item.addEventListener('dragend', () => {
      setTimeout(() => {
        item.style.display = 'block';
        draggedItem = null;
      }, 0);
    });

    // Touch support
    item.addEventListener('touchstart', touchStartHandler, { passive: false });
    item.addEventListener('touchmove', touchMoveHandler, { passive: false });
    item.addEventListener('touchend', touchEndHandler);
  });
}


setupDraggables();

// Touch drag handlers
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
    if (
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom
    ) {
      if (zone.firstChild) {
        document.querySelector('.drag-bank').appendChild(zone.firstChild);
      }
      zone.appendChild(draggedItem);
      placed = true;
    }
  });

  if (!placed) {
    document.querySelector('.drag-bank').appendChild(draggedItem);
  }

  draggedItem.classList.remove('dragging');
  draggedItem.style.display = 'block';
  if (dragClone) dragClone.remove();
  dragClone = null;
  draggedItem = null;
}


// Set up each drop zone

document.querySelectorAll('.drop-zone').forEach(zone => {

  zone.addEventListener('dragover', e => e.preventDefault());



  zone.addEventListener('drop', () => {

    if (draggedItem) {

      if (zone.firstChild) {

        document.querySelector('.drag-bank').appendChild(zone.firstChild);

      }

      zone.appendChild(draggedItem);

    }

  });

});



document.querySelector('.drag-bank').addEventListener('dragover', e => {

  e.preventDefault();

});



document.querySelector('.drag-bank').addEventListener('drop', () => {

  if (draggedItem) {

    document.querySelector('.drag-bank').appendChild(draggedItem);

  }

});

// Answer checking for Part 1
function checkPart1Handler() {
  const expected = ['star', 'fire', 'air', 'water', 'earth'];
  const zones = document.querySelectorAll('.drop-zone[data-part="1"]');
  validateAnswer(zones, expected, 1);
}

const checkPart1Btn = document.getElementById('checkPart1');
checkPart1Btn.addEventListener('click', checkPart1Handler);
checkPart1Btn.addEventListener('touchend', e => {
  e.preventDefault();
  checkPart1Handler();
});

// Answer checking for Part 2
function checkPart2Handler() {
  const expected = ['fire2', 'earth2', 'air2', 'water2'];
  const zones = document.querySelectorAll('.drop-zone[data-part="2"]');
  validateAnswer(zones, expected, 2);
}

const checkPart2Btn = document.getElementById('checkPart2');
checkPart2Btn.addEventListener('click', checkPart2Handler);
checkPart2Btn.addEventListener('touchend', e => {
  e.preventDefault();
  checkPart2Handler();
});

// Validation function
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

// Display feedback splash
function showSplashScreen(success, partNumber = 1) {
  const splash = document.createElement('div');
  splash.id = 'splash-screen';
  splash.innerHTML = success
    ? `
      <div class="splash-content">
        <h2>🎉 Correct!</h2>
        <p>${partNumber === 2 ? "Your partner's password is: <strong>universe</strong>" : "Success! Proceed to part 2 by clicking Next →"}</p>
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

  if (!success) {
    setTimeout(() => splash.remove(), 2000);
  }
}

// Navigation buttons
function toPart2Handler() {
  if (!part1Complete) return;

  document.getElementById('part1').style.display = 'none';
  document.getElementById('part2').style.display = 'block';

  // Update heading and paragraph for Part 2
  document.querySelector('h1').textContent = 'Which symbol goes in each question mark?';
  document.querySelector('p').textContent = 'Aristotle speaks of one Element being able to easily transmute by changing one “quality”.';

  // Hide Part 1 symbols
  document.querySelectorAll('.draggable[data-part="1"]').forEach(el => el.style.display = 'none');

  // Show Part 2 symbols
  document.querySelectorAll('.draggable[data-part="2"]').forEach(el => el.style.display = 'inline');

  // remove extra instruction
  document.querySelectorAll('.instruction-extra').forEach(el => el.remove());
}

const toPart2Btn = document.getElementById('toPart2');
toPart2Btn.addEventListener('click', toPart2Handler);
toPart2Btn.addEventListener('touchend', e => {
  e.preventDefault();
  toPart2Handler();
});

function toPart1Handler() {
  document.getElementById('part2').style.display = 'none';
  document.getElementById('part1').style.display = 'block';

  // Restore original heading and paragraph for Part 1
  document.querySelector('h1').textContent = 'Can You Arrange the Elements?';
  document.querySelector('p').textContent = 'Match the elements to Aristotle\'s law of natural motion by dragging them into place on the sphere.';

  // Show Part 1 symbols
  document.querySelectorAll('.draggable[data-part="1"]').forEach(el => el.style.display = 'inline');

  // Hide Part 2 symbols
  document.querySelectorAll('.draggable[data-part="2"]').forEach(el => el.style.display = 'none');
}

const toPart1Btn = document.getElementById('toPart1');
toPart1Btn.addEventListener('click', toPart1Handler);
toPart1Btn.addEventListener('touchend', e => {
  e.preventDefault();
  toPart1Handler();
});

// Initially disable the Next button
const nextBtn = document.getElementById('toPart2');
nextBtn.disabled = true;
nextBtn.classList.add('disabled');

