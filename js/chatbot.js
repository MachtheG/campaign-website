// Maureen Ndungu Campaign Chatbot
class CampaignChatbot {
    constructor() {
        this.responses = {
            // Greetings
            'hello': "Habari! I'm Maureen's campaign assistant. Ask me about her vision for Karen Ward!",
            'hi': "Karibu! How can I help you learn about Maureen's campaign?",
            'jambo': "Jambo! Welcome to Maureen Ndungu's campaign website!",
            
            // Candidate info
            'maureen': "Maureen Nyaguthii Ndungu is a passionate community leader running for MCA in Karen Ward, Langata. She's committed to accountable leadership and community development.",
            'who is maureen': "Maureen is a dedicated advocate for Karen Ward. She has a background in community development and a heart for serving others. Check out her LinkedIn for more!",
            
            // Voting
            'vote': "You can vote for Maureen on election day at your local polling station in Karen Ward. Make sure you're registered!",
            'register': "You can register to vote at the IEBC offices in Langata or online at iebc.or.ke. We can help if you need assistance!",
            
            // Manifesto
            'manifesto': "Maureen's manifesto focuses on: 1) Youth Empowerment, 2) Environment, 3) Infrastructure, 4) Healthcare, and 5) Small Business Support. Check the Manifesto page for details!",
            'economy': "Maureen supports small businesses through market access, business training, and advocacy for trader-friendly policies.",
            'youth': "Maureen's youth agenda includes skills training centers, internship programs, and entrepreneurship support for young people in Karen Ward.",
            'environment': "Maureen plans to plant 10,000 trees, implement waste management programs, and protect Karen's green spaces.",
            'roads': "Infrastructure improvement is a priority. Maureen will advocate for road repairs, street lighting, and better drainage across Karen Ward.",
            'health': "Maureen supports accessible healthcare for all residents, including supporting local clinics and organizing medical camps.",
            
            // Volunteering
            'volunteer': "We'd love your help! You can volunteer for door-to-door campaigns, events, phone banking, or social media support. Sign up on our Get Involved page!",
            'donate': "Every contribution matters! You can donate via M-Pesa Paybill: 123456 Account: MAUREEN. Thank you for your support!",
            
            // Contact
            'contact': "You can reach Maureen's team at info@maureen4karen.com or call 0712345678. Better yet, post your question on our Community Forum!",
            'forum': "Visit our Community Forum page to ask Maureen directly! She personally responds to resident concerns and ideas.",
            
            // Default
            'default': "That's a great question! Visit our Community Forum to ask Maureen directly, or check out the Manifesto page for detailed policies."
        };
        
        this.keywords = Object.keys(this.responses);
    }
    
    getResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check for keywords
        for (const keyword of this.keywords) {
            if (lowerMessage.includes(keyword)) {
                return this.responses[keyword];
            }
        }
        
        // Specific patterns
        if (lowerMessage.includes('where') && lowerMessage.includes('vote')) {
            return "Your polling station in Karen Ward will be announced closer to election day. We'll help you find it!";
        }
        
        if (lowerMessage.includes('when') && lowerMessage.includes('election')) {
            return "The general election will be announced by IEBC. Follow our page for updates!";
        }
        
        if (lowerMessage.includes('how') && lowerMessage.includes('help')) {
            return "You can volunteer, donate, attend events, share our message, or join the Community Forum. Every bit helps! What interests you most?";
        }
        
        return this.responses['default'];
    }
}

// Initialize chatbot
document.addEventListener('DOMContentLoaded', function() {
    const chatbot = new CampaignChatbot();
    const chatToggle = document.getElementById('toggle-chatbot');
    const chatWindow = document.getElementById('chatbot-window');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    
    if (chatToggle) {
        chatToggle.addEventListener('click', function() {
            chatWindow.classList.toggle('hidden');
        });
    }
    
    if (chatForm) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const userMessage = chatInput.value.trim();
            
            if (userMessage) {
                addMessage(userMessage, 'user');
                chatInput.value = '';
                
                setTimeout(() => {
                    const botResponse = chatbot.getResponse(userMessage);
                    addMessage(botResponse, 'bot');
                }, 500);
            }
        });
    }
    
    function addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                chatForm.dispatchEvent(new Event('submit'));
            }
        });
    }
});