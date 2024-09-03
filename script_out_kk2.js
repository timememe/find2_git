(function() {
    function initMemoryGame() {
        const container = document.getElementById('memory-game-container');
        const gameBoard = container.querySelector('#gameBoard');
        const timerDisplay = container.querySelector('#timer');
        const scoreDisplay = container.querySelector('#score');
        const languageSelect = container.querySelector('#language-select');
        const baseUrl = 'https://cdn.jsdelivr.net/gh/timememe/find2_git@main/assets/';
        const cardTypes = ['card_1', 'card_2', 'card_3', 'card_4', 'card_5', 'card_6', 'card_7', 'card_8'];
        const cacheBuster = Date.now(); 
        
        let cards = [];
        let flippedCards = [];
        let matchedPairs = 0;
        let score = 0;
        let timeLeft = 60;
        let timerInterval;
        let currentLanguage = container.getAttribute('lang') || 'kk';
        let preloadedImages = {};

        const translations = {
            en: {
                title: "Find a Pair",
                instruction: "Find all pairs in 60 seconds!",
                startGame: "Start Game",
                victory: "Victory!",
                allPairsFound: "You found all pairs!",
                gameOver: "Game Over",
                timeUp: "Time's up!",
                playAgain: "Play Again",
                time: "TIME",
                score: "SCORE"
            },
            ru: {
                title: "Найди пару",
                instruction: "Найди все пары за 60 секунд!",
                startGame: "Начать игру",
                victory: "Победа!",
                allPairsFound: "Вы нашли все пары!",
                gameOver: "Игра окончена",
                timeUp: "Время вышло!",
                playAgain: "Играть снова",
                time: "ВРЕМЯ",
                score: "ОЧКИ"
            },
            kk: {
                title: "Жұпты табыңыз",
                instruction: "Барлық жұптарды 60 секунд ішінде табыңыз!",
                startGame: "Ойынды бастау",
                victory: "Жеңіс!",
                allPairsFound: "Сіз барлық жұптарды таптыңыз!",
                gameOver: "Ойын аяқталды",
                timeUp: "Уақыт бітті!",
                playAgain: "Қайта ойнау",
                time: "УАҚЫТ",
                score: "ҰПАЙ"
            },
            uz: {
                title: "Juftni toping",
                instruction: "Barcha juftlarni 60 soniya ichida toping!",
                startGame: "O'yinni boshlash",
                victory: "G'alaba!",
                allPairsFound: "Siz barcha juftlarni topdingiz!",
                gameOver: "O'yin tugadi",
                timeUp: "Vaqt tugadi!",
                playAgain: "Qayta o'ynash",
                time: "VAQT",
                score: "OCHKO"
            },
            ka: {
                title: "იპოვე წყვილი",
                instruction: "იპოვე ყველა წყვილი 60 წამში!",
                startGame: "თამაშის დაწყება",
                victory: "გამარჯვება!",
                allPairsFound: "თქვენ იპოვეთ ყველა წყვილი!",
                gameOver: "თამაში დასრულდა",
                timeUp: "დრო ამოიწურა!",
                playAgain: "თავიდან თამაში",
                time: "დრო",
                score: "ქულა"
            }
        };

        function getImageUrl(imageName) {
            return `${baseUrl}${imageName}?v=${cacheBuster}`;
        }

        function preloadImages() {
            return new Promise((resolve, reject) => {
                let loadedCount = 0;
                const totalImages = cardTypes.length + 1; // +1 for card_close.png

                function onLoad() {
                    loadedCount++;
                    if (loadedCount === totalImages) {
                        resolve();
                    }
                }

                // Загрузка card_close.png
                const closeCard = new Image();
                closeCard.onload = onLoad;
                closeCard.onerror = reject;
                closeCard.src = getImageUrl('card_close.png');
                preloadedImages['card_close'] = closeCard;

                // Загрузка карточек
                cardTypes.forEach(cardType => {
                    const img = new Image();
                    img.onload = onLoad;
                    img.onerror = reject;
                    img.src = getImageUrl(`${cardType}.png`);
                    preloadedImages[cardType] = img;
                });
            });
        }

        function updateLanguage(currentLanguage) {
            //currentLanguage = currentLanguage;
            const elements = {
                'start-title': translations[currentLanguage].instruction,
                'start-instruction': translations[currentLanguage].instruction,
                'start-button': translations[currentLanguage].startGame,
                'win-title': translations[currentLanguage].victory,
                'win-text': translations[currentLanguage].allPairsFound,
                'end-title': translations[currentLanguage].gameOver,
                'end-text': translations[currentLanguage].timeUp,
                'play-again-button': translations[currentLanguage].playAgain,
                'play-again-button-win': translations[currentLanguage].playAgain
            };

            for (const [id, text] of Object.entries(elements)) {
                const element = container.querySelector(`#${id}`);
                if (element) {
                    element.textContent = text;
                }
            }

            updateTimer();
            updateScore();
        }

        languageSelect.style.display = 'none';

        function getCookie(name) {
            let namePattern = name + "=";
            let cookiesArray = document.cookie.split(';');
            for(let i = 0; i < cookiesArray.length; i++) {
                let cookie = cookiesArray[i].trim();
                if (cookie.indexOf(namePattern) == 0) {
                    return cookie.substring(namePattern.length, cookie.length);
                }
            }
            return null;
        }

        function setCookie(name, value, days) {
            var expires = "";
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "") + expires + "; path=/";
        }

        function awardPoints(points) {
            const data = {
                points: points,
                won: true,
                game: 'find2'
            };
            const token = getCookie('jwt_token');
            if (token) {
                fetch('https://api.oreo-promo.com/game', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-jwt-auth': token,
                    },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(result => {
                    console.log('Points awarded successfully:', result);
                    window.location="/profile";
                })
                .catch(error => {
                    console.error('Error awarding points:', error);
                    window.location="/profile";
                });
            } else {
                setCookie('guest_game', JSON.stringify(data), 90);
                window.location="#ModalLogin";
            }
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        function createCard(cardType) {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.cardType = cardType;
            card.style.backgroundImage = `url(${preloadedImages['card_close'].src})`;
            card.addEventListener('click', flipCard);
            return card;
        }

        function flipCard() {
            if (flippedCards.length < 2 && !this.classList.contains('flipped') && !this.classList.contains('matched')) {
                this.classList.add('flipped');
                const cardType = this.dataset.cardType;
                this.style.backgroundImage = `url(${preloadedImages[cardType].src})`;
                flippedCards.push(this);

                if (flippedCards.length === 2) {
                    setTimeout(checkMatch, 500);
                }
            }
        }

        function checkMatch() {
            const [card1, card2] = flippedCards;
            if (card1.dataset.cardType === card2.dataset.cardType) {
                card1.classList.add('matched');
                card2.classList.add('matched');
                matchedPairs++;
                score += 10;
                updateScore();
                if (matchedPairs === cardTypes.length) {
                    clearInterval(timerInterval);
                    setTimeout(showWinPopup, 500);
                }
            } else {
                setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                    card1.style.backgroundImage = `url(${preloadedImages['card_close'].src})`;
                    card2.style.backgroundImage = `url(${preloadedImages['card_close'].src})`;
                }, 500);
            }
            flippedCards = [];
        }

        function updateTimer() {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.innerHTML = `${translations[currentLanguage].time}:<br>${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
            if (timeLeft > 0) {
                timeLeft--;
            } else {
                clearInterval(timerInterval);
                showEndPopup();
            }
        }

        function updateScore() {
            scoreDisplay.innerHTML = `${translations[currentLanguage].score}:<br>${score}`;
        }

        function showStartPopup() {
            container.querySelector('#start-popup').style.display = 'flex';
        }

        function hideStartPopup() {
            container.querySelector('#start-popup').style.display = 'none';
        }

        function showWinPopup() {
            container.querySelector('#win-popup').style.display = 'flex';
            container.querySelector('#win-score').textContent = score;
            awardPoints(1);
        }

        function showEndPopup() {
            container.querySelector('#end-popup').style.display = 'flex';
            container.querySelector('#final-score').textContent = score;
        }

        function hidePopups() {
            container.querySelector('#win-popup').style.display = 'none';
            container.querySelector('#end-popup').style.display = 'none';
        }

        function startGame() {
            resetGame();
            hidePopups();
            timerInterval = setInterval(updateTimer, 1000);
        }

        function resetGame() {
            gameBoard.innerHTML = '';
            cards = [];
            flippedCards = [];
            matchedPairs = 0;
            score = 0;
            timeLeft = 60;
            clearInterval(timerInterval);
            updateScore();
            updateTimer();
            initGame();
        }

        function initGame() {
            updateLanguage();
            const gameCardTypes = shuffleArray([...cardTypes, ...cardTypes]);
            gameCardTypes.forEach(cardType => {
                const card = createCard(cardType);
                gameBoard.appendChild(card);
                cards.push(card);
            });
        }

        container.querySelector('#start-button').addEventListener('click', () => {
            hideStartPopup();
            startGame();
        });

        container.querySelector('#play-again-button').addEventListener('click', () => {
            hidePopups();
            startGame();
        });

        container.querySelector('#play-again-button-win').addEventListener('click', () => {
            hidePopups();
            startGame();
        });

        

        //languageSelect.addEventListener('change', updateLanguage);

        // Загрузка изображений перед началом игры
        preloadImages().then(() => {
            showStartPopup();
            initGame();
            updateLanguage();
        }).catch(error => {
            console.error('Failed to load images:', error);
            // Здесь можно добавить обработку ошибки загрузки изображений
            alert('Failed to load game images. Please refresh the page and try again.');
        });
        //showStartPopup();
        //initGame();
    }

    document.addEventListener('DOMContentLoaded', initMemoryGame);
})();