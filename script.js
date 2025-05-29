let draggedItem = null;
let part1Complete = false;

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
  });
}

setupDraggables();

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
document.getElementById('checkPart1').addEventListener('click', () => {
  const expected = ['star', 'fire', 'air', 'water', 'earth'];
  const zones = document.querySelectorAll('.drop-zone[data-part="1"]');
  validateAnswer(zones, expected, 1);
});

// Answer checking for Part 2
document.getElementById('checkPart2').addEventListener('click', () => {
  const expected = ['fire2', 'earth2', 'air2', 'water2'];
  const zones = document.querySelectorAll('.drop-zone[data-part="2"]');
  validateAnswer(zones, expected, 2);
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
document.getElementById('toPart2').addEventListener('click', () => {
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
});

document.getElementById('toPart1').addEventListener('click', () => {
  document.getElementById('part2').style.display = 'none';
  document.getElementById('part1').style.display = 'block';

  // Restore original heading and paragraph for Part 1
  document.querySelector('h1').textContent = 'Can You Arrange the Elements?';
  document.querySelector('p').textContent = 'Match the elements to Aristotle\'s law of natural motion by dragging them into place on the sphere.';

  // Show Part 1 symbols
  document.querySelectorAll('.draggable[data-part="1"]').forEach(el => el.style.display = 'inline');

  // Hide Part 2 symbols
  document.querySelectorAll('.draggable[data-part="2"]').forEach(el => el.style.display = 'none');
});

// Initially disable the Next button
const nextBtn = document.getElementById('toPart2');
nextBtn.disabled = true;
nextBtn.classList.add('disabled');
