function roll(number){
    num = randint(1, number)
    die = document.getElementById("d"+number)
    die.children[1].textContent = num
}

function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const cardContainer = document.getElementById('diceHolder');
const cards = Array.from(cardContainer.getElementsByClassName('die'));

cardContainer.innerHTML = '';
let c_num = 0;
palette = generateAnalogousPalette(cards.length+1)
cards.forEach(card => {
    const colour = palette[c_num]
    c_num++;
    card.style.border = "2px solid "+colour;
    card.style.setProperty('--button-colour', colour);
    card.style.setProperty('--button-text-colour', getOppositeColor(colour));
    // card.style.backgroundColor = colour;
    cardContainer.appendChild(card);
});