class Time {

    constructor(element) {
        this._element = element;
        this._start = new Date();
        this._elapsed = 0;
        this._id = setInterval(() => this.count(), 1000);
    }

    count() {
        this._elapsed = new Date() - this._start;
        this._element.textContent = Time.format(this._elapsed);
    }

    stop() {
        clearInterval(this._id);
    }

    static format(ms) {
        let d = new Date(Number(ms));
        let m = d.getMinutes();
        let s = d.getSeconds();
        return `${m < 10 ? '0' + m : m}.${s < 10 ? '0' + s : s}`;
    }
}

class Game {
    constructor() {
        this._indices = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9];
        this._card = '<div class="-z-index"><span class="card-back"></span><span class="card-front"></span></div>';
        this._game = document.body.querySelector('.game');
        this._menu = this._game.querySelector('.game-menu');
        this._board = this._game.querySelector('.game-board');
        this._over = this._game.querySelector('.game-over');
    }

    static repeat(string, times) {
        return new Array(Number(times) + 1).join(string);
    };

    static random() {
        return 0.5 - Math.random();
    };
}

class Menu extends Game {

    constructor() {
        super();
        this._difficulty = 6;
    }

    addMenuListeners() {
        this._game.querySelector('.menu-back').addEventListener('click', this._chooseBack.bind(this));
        this._game.querySelector('.menu-difficulty').addEventListener('click', this._chooseDifficuty.bind(this));
        this._game.querySelector('.menu-button').addEventListener('click', this._begin.bind(this));
    }

    _chooseBack(event) {
        let target = event.target;
        if (target.tagName === 'SPAN') {
            target.parentElement.querySelector('.-selected').classList.remove('-selected');
            target.classList.add('-selected');
            this._board.className = `game-board back-background-0${target.className.match(/[1-9]/)}`;
        }
    };

    _chooseDifficuty(event) {
        let target = event.target;
        if (target.tagName === 'SPAN') {
            target.parentElement.querySelector('.-selected').classList.remove('-selected');
            target.classList.add('-selected');
            this._difficulty = target.dataset.difficulty;
            this._board.innerHTML = Game.repeat(this._card, this._difficulty);
        }
    };

    _shuffleCards(end) {
        let randomIndices = this._indices.slice(0, end).sort(Game.random);
        [].forEach.call(this._board.children, (e, i) => e.className = `front-background-0${randomIndices[i]}`);
    };

    _begin() {
        this._shuffleCards(this._difficulty);
        new Board(this._difficulty).addBoardListeners();
        this._menu.style.display = 'none';
    }
}

class Board extends Game {

    constructor(difficulty) {
        super();
        this._difficulty = difficulty;
        this._flipped = this._game.getElementsByClassName('-flipped');
        this._hidden = this._game.getElementsByClassName('-hidden');
        this._time = new Time(this._game.querySelector('.game-time').lastElementChild);
    }

    addBoardListeners() {
        this._board.addEventListener('click', this._flipCard.bind(this));
        this._board.addEventListener('click', this._doCardsMatch.bind(this));
        this._game.querySelector('.game-score').addEventListener('click', this._showScore.bind(this));
        this._game.querySelector('.button-close').addEventListener('click', this._hideElement);
    };

    _flipCard(event) {
        if (this._flipped.length === 2) return;
        let target = event.target;
        if (target.tagName === 'SPAN') target.parentElement.classList.add('-flipped');
    };

    _doCardsMatch(event) {
        if (this._flipped.length === 2) {
            setTimeout(() => {
                let flipped = Array.prototype.slice.call(this._flipped);
                if (flipped.every(e => e.className === event.target.parentElement.className)) {
                    flipped.forEach(e => e.classList.add('-hidden'));
                    setTimeout(() => flipped.forEach(e => e.classList.remove('-flipped')), 300);
                    this._isGameOver();
                    return;
                }
                flipped.forEach(e => e.classList.remove('-flipped'));
            }, 300);
        }
    };

    _isGameOver() {
        if (this._hidden.length == this._difficulty) {
            this._time.stop();
            this._over.style.display = 'block';
            this._over.lastElementChild.lastElementChild.innerHTML = `You've won! ${Time.format(this._time._elapsed)} is a nice result, but there's always room for improvement. Why don't you give it another try?`;
            this._addScore(this._time._elapsed, this._menu.querySelector('input').value || 'John Doe');
        }
    };

    _addScore(time, name) {
        let score = window.localStorage.getItem('score');
        if (score === null) {
            window.localStorage.setItem('score', `{"${time}":"${name}"}`);
            return;
        }
        window.localStorage.setItem('score', `${score.slice(0, -1)},"${time}":"${name}"}`);
    }

    _showScore() {
        let score = JSON.parse(window.localStorage.getItem('score'));
        let div = this._game.querySelector('.score-window').lastElementChild;
        let i = 1;
        for (let key in score) {
            if (i > 10) break;
            div.innerHTML += `<span>${i++}</span><span>${Time.format(key)}</span><span>${score[key]}</span>`
        }
        div.parentElement.style.visibility = 'visible';
    }

    _hideElement() {
        this.parentElement.style.visibility = 'hidden';
    }
}

new Menu().addMenuListeners();