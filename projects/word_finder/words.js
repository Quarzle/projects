function find_word() {
	const input = document.getElementById('wordInput').value.trim().toLowerCase();
	const resultContainer = document.getElementById('resultContainer');
	resultContainer.innerHTML = '<p id="resultText">Finding definition...</p>'; // Clear previous results

	if (input.length === 0) {
		document.getElementById('resultText').textContent = 'Please enter a word.';
		return;
	}

	// Fetch the word definition from the API
	fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${input}`)
		.then(response => {
			if (!response.ok) {
				throw new Error('Word not found');
			}
			return response.json();
		})
		.then(data => {
			// Find the first available definition
			let definition = null;
			for (const meaning of data[0].meanings) {
				for (const def of meaning.definitions) {
					if (def.definition) {
						definition = def.definition;
						break;
					}
				}
				if (definition) break;
			}
			if (!definition) {
				throw new Error('No definition found for this word.');
			}

			// Find the first available phonetic spelling
			let ps = null;
			let ps_audio = null;
			for (const phonetic of data[0].phonetics) {
				if (phonetic.text && !ps) ps = phonetic.text;
				if (phonetic.audio && !ps_audio) ps_audio = phonetic.audio;
				if (ps && ps_audio) break;
			}
			if (!ps) ps = 'Phonetic spelling not available for this word.';
			if (!ps_audio) ps_audio = '';



			resultContainer.innerHTML = `<p id="resultText">Definition of <strong>${input}</strong>: ${definition}</p>`;
			resultContainer.innerHTML += `<p id="resultText">Phonetic spelling: ${ps}</p>`;
			if (ps_audio === '') {
				resultContainer.innerHTML += `<p id="resultText">Audio pronunciation not available for this word.</p>`;
			}else{
				resultContainer.innerHTML += `<audio controls><source src="${ps_audio}" type="audio/mpeg">Your browser does not support the audio element.</audio>`;
			}
		})
		.catch(error => {
			resultContainer.innerHTML = `<p id="resultText">Error: ${error.message}</p>`;
		});
	
}

document.addEventListener('DOMContentLoaded', () => {
	// search on Enter key
    document.getElementById('wordInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            find_word();
            // this.blur();
        }
    });
});