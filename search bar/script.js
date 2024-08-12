const suggestionsContainer = document.getElementById('suggestions-container');
const searchButton = document.getElementById('search-button');
const websiteButton = document.getElementById('website-button');
const websiteIcon = document.getElementById('website-icon');
const searchInput = document.getElementById('search-input');

const websites = [
  { name: 'Google', url: 'https://www.google.in', icon: './logos/google.svg' },
  { name: 'YouTube', url: 'https://www.youtube.com', icon: './logos/youtube.svg' },
  { name: 'Youtube Music', url: 'https://music.youtube.com', icon: './logos/youtubemusic.svg' },
  { name: 'ChatGPT', url: 'https://www.chatgpt.com', icon: './logos/chatgpt.svg' },
  { name: 'Google Drive', url: 'https://drive.google.com/', icon: './logos/googledrive.svg' },
  { name: 'Google Meet', url: 'https://meet.google.com', icon: './logos/googlemeet.svg' },
  { name: 'Claude', url: 'https://www.claude.ai', icon: './logos/claude.svg' },
  { name: 'Meta', url: 'https://www.meta.ai', icon: './logos/meta.svg' },
  { name: 'Mistral', url: 'https://chat.mistral.ai/chat', icon: './logos/mistral.svg' },
  { name: 'Desmos', url: 'https://www.desmos.com/calculator', icon: './logos/desmos.svg' },
  { name: 'Physics Wallah', url: 'https://www.pw.live', icon: './logos/pw.svg' },
  { name: 'Perplexity', url: 'https://www.perplexity.ai', icon: './logos/perplexity.svg' },
  { name: 'Gmail', url: 'https://mail.google.com/', icon: './logos/googlemail.svg' },
  { name: 'Bing', url: 'https://www.bing.com', icon: './logos/bing.svg' },
  { name: 'Duck Duck Go', url: 'https://duckduckgo.com', icon: './logos/duckduckgo.svg' },
  { name: 'Brave', url: 'https://search.brave.com', icon: './logos/brave.svg' },
];
let touchStartY = 0;
let touchEndY = 0;

let currentWebsiteIndex = 0;

function updateWebsiteButton() {
  const website = websites[currentWebsiteIndex];
  websiteIcon.src = website.icon;
  websiteIcon.alt = website.name;
}

function handleTouchStart(event) {
    touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
    event.preventDefault(); // Prevent scrolling
}

function handleTouchEnd(event) {
    touchEndY = event.changedTouches[0].clientY;
    handleSwipe();
}

function handleSwipe() {
    const swipeThreshold = 10; // Minimum distance to be considered a swipe
    if (touchStartY - touchEndY > swipeThreshold) {
        // Swipe up
        cycleWebsite(1);
    } else if (touchEndY - touchStartY > swipeThreshold) {
        // Swipe down
        cycleWebsite(-1);
    }
}

function cycleWebsite(direction) {
    currentWebsiteIndex = (currentWebsiteIndex + direction + websites.length) % websites.length;
    updateWebsiteButton();
    
    // Add a brief scaling animation for feedback
    websiteButton.style.transform = 'scale(1.1)';
    setTimeout(() => {
        websiteButton.style.transform = 'scale(1)';
    }, 200);
}

websiteButton.addEventListener('click', () => {
  const website = websites[currentWebsiteIndex];
  console.log(`Navigating to: ${website.url}`);
  // Send the website URL to the parent window
  window.parent.postMessage({ action: 'navigate', url: website.url }, '*');
});

websiteButton.addEventListener('touchstart', handleTouchStart, false);
websiteButton.addEventListener('touchmove', handleTouchMove, false);
websiteButton.addEventListener('touchend', handleTouchEnd, false);


document.addEventListener('keydown', (e) => {
  if (document.activeElement !== searchInput) {
    if (e.key === 'ArrowUp') {
      cycleWebsite(-1);
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      cycleWebsite(1);
      e.preventDefault();
    }
  }
});

websiteButton.addEventListener('wheel', (e) => {
  if (e.deltaY < 0) {
    cycleWebsite(-1);
  } else {
    cycleWebsite(1);
  }
  e.preventDefault();
});

// Initialize the button
updateWebsiteButton();

let selectedIndex = -1;

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
      // Send the URL to the parent window
      window.parent.postMessage({ action: 'navigate', url: url }, '*');
  } else {
      console.log(`Searching for: ${query}`);
      // Send the search URL to the parent window
      window.parent.postMessage({ action: 'navigate', url: `https://www.google.com/search?q=${encodeURIComponent(query)}` }, '*');
  } 
  
  searchInput.value = '';
  hideSuggestions();
}


searchInput.addEventListener('input', function() {
    const query = this.value.trim();
    if (query.length > 0) {
        fetchSuggestions(query);
    } else {
        hideSuggestions();
    }
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
