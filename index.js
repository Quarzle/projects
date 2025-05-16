document.addEventListener('DOMContentLoaded', () => {

    const cardContainer = document.getElementById('cardHolder');
    const cards = Array.from(cardContainer.getElementsByClassName('card'));

    cardContainer.innerHTML = '';
    let c_num = 0;
    palette = generateAnalogousPalette(cards.length+1)
    cards.forEach(card => {
        const colour = palette[c_num]
        c_num++;
        card.style.border = "thick solid "+colour;
        card.style.setProperty('--button-colour', colour);
        card.style.setProperty('--button-text-colour', getOppositeColorRGB(colour));
        // card.style.backgroundColor = colour;
        cardContainer.appendChild(card);
    });
});
