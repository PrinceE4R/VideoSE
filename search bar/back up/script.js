const searchInput = document.getElementById('search-input');
const suggestionsContainer = document.getElementById('suggestions-container');
const searchButton = document.getElementById('search-button');

let selectedIndex = -1;
let debounceTimer;

function fetchSuggestions(query) {
    const script = document.createElement('script');
    script.src = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}&callback=handleSuggestions`;
    document.body.appendChild(script);
    document.body.removeChild(script);
}

function handleSuggestions(suggestions) {
    suggestionsContainer.innerHTML = '';
    selectedIndex = -1;
    if (suggestions[1].length > 0) {
        suggestions[1].forEach((suggestion, index) => {
            const div = document.createElement('div');
            div.textContent = suggestion;
            div.className = 'suggestion';
            div.addEventListener('click', () => {
                searchInput.value = suggestion;
                hideSuggestions();
                performSearch();
            });
            suggestionsContainer.appendChild(div);
        });
        showSuggestions();
    } else {
        hideSuggestions();
    }
}

function showSuggestions() {
    suggestionsContainer.style.display = 'block';
    // Use requestAnimationFrame to ensure the display change has taken effect
    requestAnimationFrame(() => {
        suggestionsContainer.classList.add('active');
    });
}

function hideSuggestions() {
    suggestionsContainer.classList.remove('active');
    // Wait for the transition to complete before hiding
    setTimeout(() => {
        suggestionsContainer.style.display = 'none';
    }, 300); // This should match the transition duration
    selectedIndex = -1;
}

function performSearch() {
    const query = searchInput.value;
    console.log(`Searching for: ${query}`);
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
}

searchInput.addEventListener('input', function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const query = this.value.trim();
        if (query.length > 0) {
            fetchSuggestions(query);
        } else {
            hideSuggestions();
        }
    }, 45);
});

searchInput.addEventListener('keydown', (e) => {
    const suggestions = suggestionsContainer.children;
    if (e.key === 'ArrowDown') {
        selectedIndex = (selectedIndex + 1) % suggestions.length;
        updateSelection();
    } else if (e.key === 'ArrowUp') {
        selectedIndex = (selectedIndex - 1 + suggestions.length) % suggestions.length;
        updateSelection();
    } else if (e.key === 'Enter') {
        if (selectedIndex >= 0) {
            searchInput.value = suggestions[selectedIndex].textContent;
            hideSuggestions();
        }
        performSearch();
    }
});

function updateSelection() {
    const suggestions = suggestionsContainer.children;
    for (let i = 0; i < suggestions.length; i++) {
        suggestions[i].classList.toggle('selected', i === selectedIndex);
    }
    if (selectedIndex >= 0) {
        suggestions[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
}

searchButton.addEventListener('click', performSearch);

document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
        hideSuggestions();
    }
});