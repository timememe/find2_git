const gameBoard = document.getElementById('gameBoard');
const symbols = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍑', '🍍', '🥝'];
let cards = [];
let flippedCards = [];
let matchedPairs = 0;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createCard(symbol) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.symbol = symbol;
    card.addEventListener('click', flipCard);
    return card;
}

function flipCard() {
    if (flippedCards.length < 2 && !this.classList.contains('flipped') && !this.classList.contains('matched')) {
        this.classList.add('flipped');
        this.textContent = this.dataset.symbol;
        flippedCards.push(this);

        if (flippedCards.length === 2) {
            setTimeout(checkMatch, 500);
        }
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    if (card1.dataset.symbol === card2.dataset.symbol) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        if (matchedPairs === symbols.length) {
            setTimeout(() => alert('Поздравляем! Вы выиграли!'), 300);
        }
    } else {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        card1.textContent = '';
        card2.textContent = '';
    }
    flippedCards = [];
}

function initGame() {
    const gameSymbols = shuffleArray([...symbols, ...symbols]);
    gameSymbols.forEach(symbol => {
        const card = createCard(symbol);
        gameBoard.appendChild(card);
        cards.push(card);
    });
}

initGame();