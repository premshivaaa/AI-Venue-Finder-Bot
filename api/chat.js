const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, history } = req.body;
        
        // For demo purposes, we'll simulate venue data
        // In a real app, you'd integrate with a venue API or database
        const venueTypes = ['sports', 'personal meetings', 'business meetings', 'marriages', 'party events'];
        const detectedType = venueTypes.find(type => message.toLowerCase().includes(type)) || 'event';
        
        // Extract number of people (simple regex for demo)
        const peopleMatch = message.match(/\d+/);
        const people = peopleMatch ? parseInt(peopleMatch[0]) : 50;
        
        // Generate sample venues (in real app, this would come from an API)
        const sampleVenues = generateSampleVenues(detectedType, people);
        
        return res.status(200).json({
            type: 'venues',
            venues: sampleVenues
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

function generateSampleVenues(type, capacity) {
    const venues = [];
    const venueCount = Math.min(10, Math.max(3, Math.floor(Math.random() * 8) + 3));
    
    const typeNames = {
        'sports': ['Stadium', 'Arena', 'Sports Complex', 'Gymnasium'],
        'personal meetings': ['Cafe', 'Restaurant', 'Community Center', 'Library'],
        'business meetings': ['Conference Center', 'Hotel', 'Coworking Space', 'Business Lounge'],
        'marriages': ['Banquet Hall', 'Garden Venue', 'Hotel Ballroom', 'Vineyard'],
        'party events': ['Nightclub', 'Rooftop Venue', 'Event Space', 'Bar']
    };
    
    const baseNames = typeNames[type] || typeNames['party events'];
    
    for (let i = 0; i < venueCount; i++) {
        const name = `${baseNames[i % baseNames.length]} ${Math.floor(Math.random() * 5) + 1}`;
        const adjustedCapacity = Math.max(capacity, Math.floor(Math.random() * capacity * 2));
        
        venues.push({
            id: `venue-${i}-${Date.now()}`,
            name: name,
            type: type,
            capacity: adjustedCapacity,
            price_range: getRandomPriceRange(),
            rating: (Math.random() * 2 + 3).toFixed(1),
            location: `${Math.floor(Math.random() * 100) + 1} ${['Main St', 'Oak Ave', 'Park Blvd', 'Central Rd'][i % 4]}`,
            image: getRandomImage(type),
            description: `A beautiful ${type} venue perfect for your needs. This ${name.toLowerCase()} can accommodate up to ${adjustedCapacity} people and offers excellent amenities.`,
            amenities: getRandomAmenities(type),
            contact: `contact@${name.replace(/\s+/g, '').toLowerCase()}.com`,
            availability: ['Available this weekend', 'Open dates next month', 'Flexible scheduling'][i % 3],
            map_link: `https://www.google.com/maps?q=${name.replace(/\s+/g, '+')}`
        });
    }
    
    return venues;
}

function getRandomPriceRange() {
    const ranges = ['$', '$$', '$$$', '$$$$'];
    return ranges[Math.floor(Math.random() * ranges.length)];
}

function getRandomImage(type) {
    const typeImages = {
        'sports': 'https://source.unsplash.com/random/400x200/?stadium',
        'personal meetings': 'https://source.unsplash.com/random/400x200/?cafe',
        'business meetings': 'https://source.unsplash.com/random/400x200/?conference',
        'marriages': 'https://source.unsplash.com/random/400x200/?wedding',
        'party events': 'https://source.unsplash.com/random/400x200/?party'
    };
    return typeImages[type] || 'https://source.unsplash.com/random/400x200/?event';
}

function getRandomAmenities(type) {
    const common = ['WiFi', 'Parking', 'Restrooms', 'Accessible'];
    const typeSpecific = {
        'sports': ['Scoreboard', 'Locker Rooms', 'Seating', 'Concessions'],
        'personal meetings': ['Coffee', 'Outdoor Seating', 'Whiteboard', 'Projector'],
        'business meetings': ['Projector', 'Whiteboards', 'Catering', 'AV Equipment'],
        'marriages': ['Dance Floor', 'Catering Kitchen', 'Bridal Suite', 'Outdoor Space'],
        'party events': ['DJ Booth', 'Lighting', 'Bar', 'Dance Floor']
    };
    
    const amenities = [...common, ...(typeSpecific[type] || [])];
    // Shuffle and return 3-5 amenities
    return amenities.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 3);
}
