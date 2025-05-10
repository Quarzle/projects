//Order cards using the html searchbar
// and the order button

document.addEventListener('DOMContentLoaded', () => {
    // Get the button input
    const orderButton = document.getElementById('orderButton');
    const cardContainer = document.getElementById('cardHolder');
    const cards = Array.from(cardContainer.getElementsByClassName('card'));

    // Add event listener to the order button
    orderButton.addEventListener('click', orderCards);

    function orderCards() {
        
        const searchInput = document.getElementById('searchInput');
        const searchValue = searchInput.value.toLowerCase();

        const filteredCards = cards.filter(card => {
            const cardText = card.textContent.toLowerCase();
            return cardText.includes(searchValue);
        });

        filteredCards.sort((a, b) => {
            const textA = a.textContent.toLowerCase();
            const textB = b.textContent.toLowerCase();
            return textA.localeCompare(textB);
        });

        cardContainer.innerHTML = '';
        filteredCards.forEach(card => {
            cardContainer.appendChild(card);
        });
        // if no cards are found, show a message
        if (filteredCards.length === 0) {
            const noResults = document.createElement('div');
            noResults.textContent = 'No projects found';
            noResults.className = 'no-results';
            cardContainer.appendChild(noResults);
        } else {
            const noResults = document.querySelector('.no-results');
            if (noResults) {
                cardContainer.removeChild(noResults);
            }
        }
    }
});
