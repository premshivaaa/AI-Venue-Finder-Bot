document.addEventListener('DOMContentLoaded', function() {
    const chatDisplay = document.getElementById('chatDisplay');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    
    let chatHistory = [];
    
    // Initialize chat with bot greeting
    addToChatHistory('bot', `Hello! I'm your AI Venue Finder. I can help you find perfect venues for:
    - Sports events
    - Personal meetings
    - Business meetings
    - Marriages
    - Party events
    
    Tell me what type of venue you're looking for and how many people will attend.`);
    
    // Send message on button click
    sendButton.addEventListener('click', sendMessage);
    
    // Send message on Enter key
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addToChatHistory('user', message);
            userInput.value = '';
            
            // Show loading indicator
            const loadingId = showLoading();
            
            // Send message to serverless function
            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    history: chatHistory
                })
            })
            .then(response => response.json())
            .then(data => {
                removeLoading(loadingId);
                if (data.error) {
                    addToChatHistory('bot', `Sorry, I encountered an error: ${data.error}`);
                } else {
                    // Process the response which could be text or venue cards
                    if (data.type === 'text') {
                        addToChatHistory('bot', data.content);
                    } else if (data.type === 'venues') {
                        displayVenueCards(data.venues);
                    }
                }
            })
            .catch(error => {
                removeLoading(loadingId);
                addToChatHistory('bot', 'Sorry, there was an error processing your request. Please try again.');
                console.error('Error:', error);
            });
        }
    }
    
    function addToChatHistory(sender, message) {
        chatHistory.push({ sender, message });
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `${sender}-message`;
        
        // Check if message is HTML (like venue cards) or plain text
        if (typeof message === 'string') {
            messageDiv.innerHTML = `<p>${message.replace(/\n/g, '<br>')}</p>`;
        } else {
            messageDiv.appendChild(message);
        }
        
        chatDisplay.appendChild(messageDiv);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }
    
    function showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'bot-message';
        loadingDiv.id = 'loading-' + Date.now();
        loadingDiv.innerHTML = '<p>Searching for venues<span class="loading-dots"><span></span><span></span><span></span></span></p>';
        chatDisplay.appendChild(loadingDiv);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
        return loadingDiv.id;
    }
    
    function removeLoading(id) {
        const loadingElement = document.getElementById(id);
        if (loadingElement) {
            loadingElement.remove();
        }
    }
    
    function displayVenueCards(venues) {
        const venuesContainer = document.createElement('div');
        venuesContainer.className = 'venues-container';
        
        if (venues.length === 0) {
            venuesContainer.innerHTML = '<p>No venues found matching your criteria. Try adjusting your search.</p>';
            addToChatHistory('bot', venuesContainer);
            return;
        }
        
        venues.forEach(venue => {
            const card = document.createElement('div');
            card.className = 'venue-card';
            
            // Basic info
            let cardHTML = `
                <img src="${venue.image || 'https://via.placeholder.com/400x200?text=Venue+Image'}" alt="${venue.name}">
                <h3>${venue.name}</h3>
                <p><strong>Type:</strong> ${venue.type}</p>
                <p><strong>Capacity:</strong> ${venue.capacity} people</p>
                <p><strong>Price Range:</strong> ${venue.price_range}</p>
                <p><strong>Rating:</strong> ${'★'.repeat(Math.floor(venue.rating))}${'☆'.repeat(5 - Math.floor(venue.rating))} (${venue.rating})</p>
                <p><strong>Location:</strong> ${venue.location}</p>
                <button class="details-button" data-venue-id="${venue.id}">View Details</button>
                
                <div class="venue-details" id="details-${venue.id}">
                    <h4>Full Details</h4>
                    <p><strong>Description:</strong> ${venue.description}</p>
                    <p><strong>Amenities:</strong> ${venue.amenities.join(', ')}</p>
                    <p><strong>Contact:</strong> ${venue.contact}</p>
                    <p><strong>Availability:</strong> ${venue.availability}</p>
                    <a href="${venue.map_link}" target="_blank" class="details-button">View on Map</a>
                    <button class="details-button" style="background: #4CAF50;">Book Now</button>
                </div>
            `;
            
            card.innerHTML = cardHTML;
            venuesContainer.appendChild(card);
        });
        
        addToChatHistory('bot', venuesContainer);
        
        // Add event listeners to details buttons
        document.querySelectorAll('.details-button').forEach(button => {
            if (button.textContent === 'View Details') {
                button.addEventListener('click', function() {
                    const venueId = this.getAttribute('data-venue-id');
                    const detailsDiv = document.getElementById(`details-${venueId}`);
                    detailsDiv.style.display = detailsDiv.style.display === 'block' ? 'none' : 'block';
                });
            }
        });
    }
});
