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
function isUrlOrWebsite(input) {
    // Check for common URL patterns
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    
    // Check for common top-level domains
    const commonTLDs = ["com", "org", "net", "info", "biz", "xyz", "online", "site", "tech", "design", "me", "in", "us", "uk", "ca", "au", "de", "fr", "jp", "cn", "ru", "it", "edu", "gov", "mil", "int", "aero", "coop", "museum", "app", "blog", "shop", "social", "cloud", "bank", "health", "ai"];
    
    return urlPattern.test(input) || commonTLDs.some(tld => input.endsWith(`.${tld}`));
}

function performSearch() {
    const query = searchInput.value.trim();
    
    if (isUrlOrWebsite(query)) {
        let url = query;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        console.log(`Opening URL: ${url}`);
        window.open(url, '_blank');
    } else {
        console.log(`Searching for: ${query}`);
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    }
    
    // Clear the input field
    searchInput.value = '';
    
    // Hide suggestions
    hideSuggestions();
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
    }, 60);
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
        e.preventDefault(); // Prevent form submission if within a form
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