// ── CAMPAIGN AI CHATBOT ──
const campaignKnowledge = {
  greetings: ['hello','hi','habari','hujambo','mambo','hey','sasa'],
  manifesto: ['manifesto','plan','policy','policies','agenda','platform'],
  youth: ['youth','young','students','millennials','gen z','vijana','jobs','employment','internship'],
  environment: ['environment','green','trees','forest','ngong','waste','clean','nature','pollution'],
  infrastructure: ['roads','road','infrastructure','drainage','water','flooding','lights','street'],
  health: ['health','clinic','hospital','medical','maternal','healthcare'],
  business: ['business','trade','market','entrepreneur','sme','traders','vendors','economy'],
  welfare: ['welfare','disabled','elderly','vulnerable','women','family','social'],
  contribute: ['donate','contribute','support','fund','mpesa','money','contribution'],
  volunteer: ['volunteer','help','join','involved','campaign'],
  events: ['event','meeting','baraza','rally','town hall','forum'],
  karen: ['karen','ward','langata','constituency','history','blixen'],
  contact: ['contact','reach','email','phone','call','social media'],
};

const responses = {
  greetings: ["Habari! 👋 I'm Maureen's Campaign AI. Ask me about her vision for Karen Ward, her manifesto, events, or how to get involved!", "Hujambo! Welcome to Maureen's campaign. I'm here to answer your questions about her plans for Karen Ward. What would you like to know?"],
  manifesto: ["Maureen's manifesto focuses on 6 key pillars: 🌱 Environment & Green Spaces, 🛣️ Infrastructure & Roads, 👩‍⚕️ Healthcare Access, 💼 Youth Employment, 🏪 Small Business Support, and 🤝 Social Welfare. Visit the Manifesto page for full details!", "Her platform includes protecting Karen's green spaces, improving roads and drainage, expanding healthcare, empowering youth with skills training, and supporting local businesses. Download the full manifesto PDF from the homepage!"],
  youth: ["Maureen is passionate about youth! Her plan includes: digital skills training hubs, government internship placements, startup incubator funding, and sports/arts facilities. Over 60% of Karen's residents are under 35 — they deserve real opportunities! 🌟", "For youth empowerment, Maureen plans to establish a Karen Youth Skills Centre, partner with tech companies for internships, and advocate for county youth enterprise funds. Vijana wa Karen wanastahili nafasi bora!"],
  environment: ["Karen's green spaces are under threat! Maureen will champion: protection of Ngong Forest corridors, strict tree-cutting regulations, waste management overhaul, community clean-up programs, and green infrastructure in new developments. 🌳", "The environment is a top priority. Maureen plans to: expand recycling programs, protect wildlife corridors to Nairobi National Park, increase tree cover, and ensure new developments meet green standards."],
  infrastructure: ["Infrastructure is critical for Karen! Maureen's road plan includes: rehabilitating key arteries like Karen Road and Marula Lane, fixing drainage to prevent flooding, improving street lighting for safety, and ensuring reliable water supply. 🛣️", "For roads and infrastructure, Maureen will push for: county budget allocation for Karen road maintenance, community-reported pothole fixing system, improved drainage, and emergency lighting on unsafe roads."],
  health: ["Healthcare access for all Karen residents is essential. Maureen plans to: support expansion of local clinics, improve maternal health services, run community health drives, and advocate for a fully equipped health facility in underserved areas. 🏥", "Maureen's health priorities include mobile health clinics for estates without facilities, maternal health programs to reduce mother/infant mortality, mental health awareness campaigns, and subsidized healthcare for seniors."],
  business: ["Karen's economy is driven by small businesses! Maureen will: advocate for lower business license fees, create a Karen Business Hub for training and networking, support the Karen Market's growth, and connect local businesses with county procurement. 💼", "For small businesses, Maureen plans a one-stop business support centre, market linkages for local artisans, advocacy for fair taxation, and a Karen entrepreneurs' network."],
  welfare: ["No one in Karen should be left behind. Maureen's social welfare plans include: bursary fund for needy students, support for persons with disabilities, elderly care programs, and women's economic empowerment groups. 🤝", "Social welfare priorities include ensuring vulnerable families get county assistance, supporting CBOs working with disabled residents, women's skills training cooperatives, and protecting children's rights."],
  contribute: ["Thank you for wanting to support the campaign! 🙏 You can contribute via M-Pesa Paybill or bank transfer — see the Support section on the homepage. Every contribution is 100% anonymous — only the total count is tracked. Asante sana!", "Your support matters! Visit the homepage's 'Support The Campaign' section for M-Pesa and bank transfer details. All contributions are completely anonymous."],
  volunteer: ["Join the movement! 🌟 You can volunteer for: door-to-door outreach, phone banking, event coordination, or social media support. Visit the Get Involved page or email volunteer@maureen4karen.com", "Volunteers are the backbone of this campaign! Sign up on the Get Involved page. Every hour you give makes a difference for Karen Ward."],
  events: ["Upcoming events: 🗓️ Community Baraza at Karen Shopping Centre, Youth Forum at Karen Community Hall, Women's Empowerment Workshop, and Environmental Clean-up Drive. Check the Get Involved page for exact dates!", "Maureen regularly holds town halls and community meetings. Follow the campaign on social media for the latest event updates."],
  karen: ["Karen Ward is the largest ward in Langata Constituency, spanning approximately 232 km². It's named after Karen Blixen, Danish author of 'Out of Africa.' The ward has the Karen Blixen Museum, Ngong Forest, Karen Market, and borders Nairobi National Park. 📍", "Karen Ward is a unique mix of residential estates, green spaces, wildlife corridors, and commercial areas. It hosts diverse communities and is strategically located at the gateway to Nairobi's natural heritage."],
  contact: ["You can reach Maureen's campaign at: 📧 info@maureen4karen.com | 📱 Social media links in the footer. You can also ask questions directly on the Community Forum! 🗣️", "Connect with the campaign on Facebook, Twitter, Instagram, and LinkedIn. Or post your question on the Community Forum and Maureen's team will respond personally!"],
  default: ["That's a great question! I'm focused on Maureen's Karen Ward campaign topics. Try asking about: her manifesto, youth empowerment, environment, roads, healthcare, or how to get involved! 😊", "I may not have that specific info, but I'm happy to help with questions about Maureen's campaign plans, Karen Ward facts, events, volunteering, or contributing. What would you like to know?", "Interesting! For detailed information on that topic, I'd suggest visiting the relevant page or posting a question in the Community Forum where Maureen's team will respond. 🙏"]
};

function getResponse(msg) {
  const lower = msg.toLowerCase();
  for (const [key, keywords] of Object.entries(campaignKnowledge)) {
    if (keywords.some(kw => lower.includes(kw))) {
      const res = responses[key];
      return res[Math.floor(Math.random() * res.length)];
    }
  }
  return responses.default[Math.floor(Math.random() * responses.default.length)];
}

const quickReplies = [
  "What's your manifesto?",
  "Youth empowerment plans?",
  "How to volunteer?",
  "Environment plans?",
  "How to contribute?",
  "Upcoming events?"
];

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle-chatbot');
  const chatWindow = document.getElementById('chatbot-window');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');

  if (!toggleBtn || !chatWindow) return;

  // Toggle
  toggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden')) {
      chatInput && chatInput.focus();
      renderQuickReplies();
    }
  });

  function renderQuickReplies() {
    const existing = chatWindow.querySelector('.quick-replies');
    if (existing) return;
    const qr = document.createElement('div');
    qr.className = 'quick-replies';
    quickReplies.forEach(q => {
      const btn = document.createElement('button');
      btn.className = 'quick-reply';
      btn.textContent = q;
      btn.addEventListener('click', () => { addMessage(q, 'user'); respondToUser(q); qr.remove(); });
      qr.appendChild(btn);
    });
    chatMessages.after(qr);
  }

  function addMessage(text, role) {
    const div = document.createElement('div');
    div.className = role === 'user' ? 'user-message' : 'bot-message';
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'bot-message typing-indicator';
    t.innerHTML = '<span></span><span></span><span></span>';
    t.id = 'typing';
    chatMessages.appendChild(t);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return t;
  }

  function respondToUser(msg) {
    const typing = showTyping();
    setTimeout(() => {
      typing.remove();
      addMessage(getResponse(msg), 'bot');
    }, 900 + Math.random() * 600);
  }

  chatForm && chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = chatInput.value.trim();
    if (!msg) return;
    addMessage(msg, 'user');
    chatInput.value = '';
    respondToUser(msg);
    const qr = chatWindow.querySelector('.quick-replies');
    if (qr) qr.remove();
  });
});