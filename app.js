const tileContainer = document.querySelector('.tile-container');
const keyboard = document.querySelector('.key-container');

let wordle;

const getWordle = async () => {
  await fetch(`https://six-letter-wordle.herokuapp.com/wordle/api/v1/word`)
    .then((response) => response.json())
    .then((json) => {
      console.log(json.message);
      wordle = json.message.toUpperCase();
    })
    .catch((err) => console.log(err));
};

getWordle();

const keys = [
  'Q',
  'W',
  'E',
  'R',
  'T',
  'Y',
  'U',
  'I',
  'O',
  'P',
  'A',
  'S',
  'D',
  'F',
  'G',
  'H',
  'J',
  'K',
  'L',
  'ENTER',
  'Z',
  'X',
  'C',
  'V',
  'B',
  'N',
  'M',
  'BACK',
];

const guessRows = [
  ['', '', '', '', '', ''],
  ['', '', '', '', '', ''],
  ['', '', '', '', '', ''],
  ['', '', '', '', '', ''],
  ['', '', '', '', '', ''],
  ['', '', '', '', '', ''],
];

const icons = [
  ['', '', '', '', '', ''],
  ['', '', '', '', '', ''],
  ['', '', '', '', '', ''],
  ['', '', '', '', '', ''],
  ['', '', '', '', '', ''],
  ['', '', '', '', '', ''],
];

let currentRow = 0;
let currentTile = 0;
let isGameOver = false;
let message = '';
const date = new Date();

guessRows.forEach((guessRow, guessRowIndex) => {
  const rowElement = document.createElement('div');
  rowElement.setAttribute('id', `guessRow-${guessRowIndex}`);

  guessRow.forEach((guess, guessIndex) => {
    const tileElement = document.createElement('div');
    tileElement.setAttribute(
      'id',
      `guessRow-${guessRowIndex}-tile-${guessIndex}`
    );
    tileElement.classList.add('tile');
    rowElement.append(tileElement);
  });

  tileContainer.append(rowElement);
});

keys.forEach((key) => {
  const button = document.createElement('button');
  button.textContent = key;
  button.setAttribute('id', key);
  button.addEventListener('click', () => handleClick(key));
  keyboard.append(button);
});

const handleClick = (letter) => {
  if (!isGameOver) {
    if (letter === 'BACK') {
      deleteLetter();
      return;
    }
    if (letter === 'ENTER') {
      checkRow();
      return;
    }
    addLetter(letter);
  }
};

const addLetter = (letter) => {
  if (currentTile <= 5 && currentRow <= 5) {
    const tile = document.getElementById(
      `guessRow-${currentRow}-tile-${currentTile}`
    );
    tile.textContent = letter;
    tile.setAttribute('data', letter);
    guessRows[currentRow][currentTile] = letter;
    currentTile++;
  }
};

const deleteLetter = () => {
  if (currentTile > 0) {
    currentTile--;
    const tile = document.getElementById(
      `guessRow-${currentRow}-tile-${currentTile}`
    );
    tile.textContent = '';
    guessRows[currentRow][currentTile] = '';
    tile.setAttribute('data', '');
  }
};

const showDialog = (message, color) => {
  const dialog = document.querySelector('.dialog');
  dialog.classList.add(color);
  const p = document.createElement('p');
  p.textContent = message;
  dialog.append(p);

  setTimeout(() => {
    dialog.classList.remove(color);
    dialog.removeChild(p);
  }, 2500);
};

const showModal = (message, color) => {
  const modal = document.querySelector('.modal');
  modal.classList.add(color);
  modal.classList.add('show');

  const header = document.querySelector('#header');
  header.textContent = message;

  if (message == 'Game over!') {
    const header = document.querySelector('#header');
    header.style.color = '#a31616';

    const copy = document.querySelector('#copy');
    copy.classList.add('warning-button');

    const share = document.querySelector('#share');
    share.classList.add('warning-button');
  }
};

const checkRow = () => {
  const guess = guessRows[currentRow].join('');

  if (currentTile > 5) {
    document.querySelector('#ENTER').disabled = true;

    fetch(
      `https://six-letter-wordle.herokuapp.com/wordle/api/v1/check/${guess}`
    )
      .then((response) => response.json())
      .then((json) => {
        if (json.message === "The word doesn't exists.") {
          showDialog('Word not in list', 'error');
          document.querySelector('#ENTER').disabled = false;
          return;
        } else {
          flipTile();
          addToIcons();
          if (wordle === guess) {
            isGameOver = true;
            currentRow++;
            showModal('You won!', 'success');
            const shareButton = document.querySelector('.share-stats');
            console.log(shareButton);
            shareButton.style.display = 'block';
            document.querySelector('#ENTER').disabled = false;
            return;
          } else {
            if (currentRow >= 5) {
              isGameOver = true;
              showModal('Game over!', 'warning');
              return;
            }
            if (currentRow <= 5) {
              currentRow++;
              currentTile = 0;
            }
            document.querySelector('#ENTER').disabled = false;
          }
        }
      });
  }
};

const addColorToKey = (keyLetter, color) => {
  const key = document.getElementById(keyLetter);
  key.classList.add(color);
};

const flipTile = () => {
  const rowTiles = document.querySelector(`#guessRow-${currentRow}`).childNodes;
  rowTiles.forEach((tile, index) => {
    const dataLetter = tile.getAttribute('data');

    setTimeout(() => {
      tile.classList.add('flip');
      if (dataLetter === wordle[index]) {
        tile.classList.add('green-overlay');
        addColorToKey(dataLetter, 'green-overlay');
      } else if (wordle.includes(dataLetter)) {
        tile.classList.add('yellow-overlay');
        addColorToKey(dataLetter, 'yellow-overlay');
      } else {
        tile.classList.add('grey-overlay');
        addColorToKey(dataLetter, 'grey-overlay');
      }
    }, 500 * index);
  });
};

const addToIcons = () => {
  const rowTiles = document.querySelector(`#guessRow-${currentRow}`).childNodes;
  rowTiles.forEach((tile, index) => {
    const dataLetter = tile.getAttribute('data');

    if (dataLetter === wordle[index]) {
      icons[currentRow][index] = '🟩';
    } else if (wordle.includes(dataLetter)) {
      icons[currentRow][index] = '🟨';
    } else {
      icons[currentRow][index] = '⬛';
    }
  });
};

document.addEventListener('keydown', (e) => {
  if (keys.includes(e.key.toUpperCase()) || e.key === 'Backspace') {
    if (e.key === 'Backspace') {
      handleClick('BACK');
    } else {
      handleClick(e.key.toUpperCase());
    }
  }
});

const hanldeCloseModal = () => {
  const modal = document.querySelector('.modal');
  modal.classList.remove('show');
};

const hanldeCopyToClipboard = () => {
  const modal = document.querySelector('.modal');

  message = icons.map((icon) => icon.join('\t')).join('\n');
  message = `Wordle Clone ${
    date.getDate() > 9 ? date.getDate() : '0' + date.getDate()
  }/${
    date.getMonth() > 8 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)
  }/${date.getFullYear()} \n\n${message} \n\nVisit: wordle-clone-app.vercel.app`;

  navigator.clipboard.writeText(message);

  modal.classList.remove('show');
};

const handleShare = () => {
  const share = document.querySelector('#share');

  message = icons.map((icon) => icon.join('\t')).join('%0A');
  message = `Wordle Clone ${
    date.getDate() > 9 ? date.getDate() : '0' + date.getDate()
  }/${
    date.getMonth() > 8 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)
  }/${date.getFullYear()} %0A%0A${message} %0A%0AVisit: wordle-clone-app.vercel.app`;

  share.setAttribute(
    'href',
    `https://twitter.com/intent/tweet?text=${message}`
  );

  modal.classList.remove('show');
};

const hanldeOpenModal = () => {
  const modal = document.querySelector('.modal');
  modal.classList.add('show');
};
