
const projectCards = [
    {
        title: "Constellation Maker",
        description: "A simple algorithm for generating an image with fake constellations",
        link: "projects/constellation_generator/constellation.html",
        meta: "2025-website-misc"
    },
    {
        title: "OST minigame jam 2",
        description: "A collection of songs made for the OST minigame jam 2",
        link: "projects/ostminigamejam2/ostjam.html",
        meta: "2024-music"
    },
    {
        title: "Impossible platformer",
        description: "An old scratch platformer game",
        link: "projects/almost_impossible_platformer/game_page.html",
        meta: "2021-games"
    },
    {
        title: "Days until...",
        description: "A site that tells you the days until certain dates",
        link: "projects/dates/dates.html",
        meta: "2025-website"
    },
    {
        title: "Asteroids",
        description: "A downloadable LibGDX remake of the classic game Asteroids",
        link: "projects/asteroids/game_download.html",
        meta: "2023-games-java"
    },
    {
        title: "Hatching demo",
        description: "A proof of concept 3d shader demo made with godot",
        link: "projects/hatching_demo/demo_download.html",
        meta: "2025-misc"
    },
    {
        title: "Old songs",
        description: "Some of the first songs I made",
        link: "projects/old_songs/song_list.html",
        meta: "2022-2023-2024-music"
    },
    {
        title: "Scratch flappy bird",
        description: "A scratch version of the game flappy bird",
        link: "projects/flappy_bird/scratch_container.html",
        meta: "2021-games"
    },
    {
        title: "Desmos 3D renderer",
        description: "A desmos graph that projects into 3d",
        link: "projects/desmos3d/desholder.html",
        meta: "2023-maths-misc"
    },
    {
        title: "Bee datapack",
        description: "A minecraft datapack that lets you turn into bees",
        link: "projects/beepack/bees.html",
        meta: "2023-misc"
    },
    {
        title: "Kuwahara filter",
        description: "A paintlike image stylization filter",
        link: "projects/kuwahara/filter_upload.html",
        meta: "2025-website-misc"
    },
    {
        title: "Piano sheet music",
        description: "My first time making music playable on an instrument",
        link: "projects/lustre/lustre.html",
        meta: "2025-music"
    },
    {
        title: "Dice roller",
        description: "For all your dice rolling needs",
        link: "projects/diceroller/dice.html",
        meta: "2025-misc-tools-website"
    },
	{
        title: "The Tower",
        description: "An ascii art game about escaping a tower",
		link: "projects/the_tower/tower.html",
        meta: "2025-games"
    },
	{
        title: "Word finder",
        description: "Find definitions and phonetic spellings of words",
		link: "projects/word_finder/words.html",
        meta: "2025-website-misc"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.getElementById('cardHolder');
    const orderButton = document.getElementById('orderButton');

    // Render all cards initially
    orderCards(projectCards);

    // search on Enter key
    document.getElementById('searchInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            orderCards();
            this.blur();
        }
    });

    // search on click
    orderButton.addEventListener('click', orderCards);

    function createCardElement({ title, description, link, meta }) {
        const card = document.createElement('div');
        card.className = 'card';

        const titleEl = document.createElement('h2');
        titleEl.textContent = title;

        const descEl = document.createElement('p');
        descEl.textContent = description;

        const linkEl = document.createElement('a');
        linkEl.href = link;
        const buttonEl = document.createElement('button');
        buttonEl.textContent = 'Go';
        linkEl.appendChild(buttonEl);

        const metaEl = document.createElement('p');
        metaEl.className = 'meta';
        metaEl.style.display = 'none';
        metaEl.textContent = meta;

        // event listener for favourites
        // card.addEventListener('click', (e) => {
        //     if (!e.target.closest('a')) {
        //         onCardClick(title, card);
        //     }
        // });

        card.append(titleEl, descEl, linkEl, metaEl);
        return card;
    }

    function renderCards(cardData) {
        cardContainer.innerHTML = '';
        let c_num = 0;
        const palette = generateAnalogousPalette(cardData.length);

        cardData.forEach(project => {
            const card = createCardElement(project);
            const colour = palette[c_num];
            c_num++;

            card.style.border = "thick solid " + colour;
            card.style.setProperty('--button-colour', colour);
            card.style.setProperty('--button-text-colour', getOppositeColor(colour));
            cardContainer.appendChild(card);
        });

        if (cardData.length === 0) {
            const noResults = document.createElement('div');
            noResults.textContent = 'No projects found';
            noResults.className = 'no_results';
            cardContainer.appendChild(noResults);
        }
    }

    function orderCards() {
        //alert(getCookie("is_fav"))
        const searchValue = document.getElementById('searchInput').value.toLowerCase();

        const filtered = projectCards.filter(({ title, description, meta }) => {
            return (
                title.toLowerCase().includes(searchValue) ||
                description.toLowerCase().includes(searchValue) ||
                meta.toLowerCase().includes(searchValue)
            );
        });

        filtered.sort((a, b) => a.title.localeCompare(b.title));
        renderCards(filtered);
    }
    
function initializeFavourites() {
    const favourites = getCookie('favourites') || [];
    
    favourites.forEach(project => {
        const cardElement = document.querySelector(`[data-project="${project}"]`);
        if (cardElement && !cardElement.querySelector('.card-icon')) {
            const icon = document.createElement('div');
            icon.className = 'card-icon';
            icon.innerHTML = '⭐';
            cardElement.appendChild(icon);
        }
    });
}

function onCardClick(project, cardElement) {
    // Check if the icon already exists
    if (cardElement.querySelector('.card-icon')) {
        cardElement.querySelector('.card-icon').remove()
        //setCookie("is_fav", "false", 10)
        return
    }
    
    //setCookie("is_fav", "true", 10)
    const icon = document.createElement('div');
    icon.className = 'card-icon';
    icon.innerHTML = '⭐'; // You can use any emoji, icon, or even SVG
    cardElement.appendChild(icon);
}
});
