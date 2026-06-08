// Campaign AI persona: professional, accessible, empathetic, and localized to Karen Ward priorities.
const CAMPAIGN_AI_SYSTEM_PROMPT = {
  tone: "professional, accessible, empathetic",
  pillars: ["Environment", "Youth", "Transparent Governance"],
  policy: "Answer directly, stay factual and local to Karen Ward, avoid generic political slogans, and use constructive next steps when useful."
};

const campaignKnowledge = {
  greetings: ['hello','hi','habari','hujambo','mambo','hey','sasa'],
  manifesto: ['manifesto','plan','policy','policies','agenda','platform'],
  youth: ['youth','young','students','millennials','gen z','vijana','jobs','employment','internship'],
  environment: ['environment','green','trees','forest','ngong','waste','clean','nature','pollution'],
  governance: ['governance','transparent','transparency','accountability','budget','corruption','public participation'],
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
  greetings: [
    "Habari. I am Maureen's Campaign AI, ready to give clear answers about Karen Ward priorities. Ask me about environment, youth, governance, events, or volunteering.",
    "Welcome. I can help with direct information on Maureen's manifesto and community plans for Karen Ward. What would you like to know?"
  ],
  manifesto: [
    "Maureen's core manifesto pillars are Environment, Youth Empowerment, and Transparent Governance. In practice this means protecting green corridors, expanding youth opportunities, and publishing accountable ward decisions with public participation.",
    "The manifesto is structured around practical local outcomes: cleaner neighborhoods, stronger youth pathways to jobs and skills, and open governance through regular town halls and budget transparency."
  ],
  youth: [
    "For youth in Karen Ward, priorities include skills training, internship partnerships, and support for youth-led enterprise. The focus is practical pathways from training to employment.",
    "Youth empowerment plans center on mentorship, digital and vocational skills, and stronger links to county and private-sector opportunities so young people can access real income options."
  ],
  environment: [
    "Environment priorities include protecting Karen's green spaces, better waste handling, and regular community clean-up coordination. This is aimed at healthier estates and long-term sustainability.",
    "Maureen's environment approach is local and practical: safeguard key green areas, strengthen waste compliance, and support resident-led clean neighborhood programs."
  ],
  governance: [
    "Transparent governance means open forums, clear communication on ward priorities, and accountable follow-through on commitments. Residents should see what was promised, funded, and delivered.",
    "Governance commitments focus on participation and accountability: regular town halls, accessible updates, and stronger oversight of service delivery in Karen Ward."
  ],
  infrastructure: [
    "Infrastructure work is tied to governance and environment: prioritize roads and drainage hotspots, improve street lighting, and track delivery publicly so residents can verify progress.",
    "Roads, drainage, lighting, and water reliability remain practical priorities, with community feedback used to target high-impact areas first."
  ],
  health: [
    "Health priorities include stronger local clinic access, maternal and preventive health outreach, and better coordination for vulnerable households needing timely services.",
    "Community health plans emphasize access, prevention, and practical outreach, including support for families, youth wellbeing, and residents in underserved areas."
  ],
  business: [
    "Local business support focuses on enabling small traders and entrepreneurs through better policy advocacy, market linkages, and fairer conditions for growth in Karen Ward.",
    "For local enterprises, the campaign supports practical business-friendly reforms and stronger links between community producers, traders, and county opportunities."
  ],
  welfare: [
    "Social support priorities include inclusive services for vulnerable residents, women, seniors, and persons with disabilities, with dignity and fairness at the center.",
    "Community welfare is approached through targeted support programs and stronger partnerships with local groups serving vulnerable households."
  ],
  contribute: [
    "Thank you for supporting the campaign. Contribution routing details are currently marked as To Be Announced. Please check the Support section for official updates.",
    "Campaign contribution details are currently To Be Announced. Official payment instructions will be published once finalized."
  ],
  volunteer: [
    "You can volunteer through the sign-up form on the Get Involved page. Areas include outreach, events, social media, and community mobilization.",
    "Volunteers are essential. Use the volunteer form to share your details and preferred support area, and the team will follow up directly."
  ],
  events: [
    "Community engagement events include forums and resident dialogues focused on environment, youth, and governance priorities. Check Get Involved for the latest schedule.",
    "Upcoming event updates are shared through the campaign pages and social channels, with town-hall style sessions prioritized for direct resident feedback."
  ],
  karen: [
    "Karen Ward is the largest ward in Langata Constituency, with major green assets and diverse residential and business zones. This mix drives the campaign focus on sustainability, youth opportunity, and accountable local governance.",
    "Karen combines natural corridors, estates, schools, businesses, and cultural landmarks. Policy priorities are therefore balanced between environmental protection, community services, and transparent development oversight."
  ],
  contact: [
    "You can engage through the Community Forum and official campaign social channels listed in the website footer.",
    "For campaign communication and updates, use the official website channels and the forum for public questions."
  ],
  default: [
    "I can give a direct answer if you share a specific question about environment, youth, governance, volunteering, or campaign priorities in Karen Ward.",
    "Please ask a specific question, and I will respond with clear, localized information aligned to Maureen's manifesto priorities.",
    "If your question is broader, I can still help by focusing on practical implications for Karen Ward residents."
  ]
};

function enforcePersona(reply) {
  const text = String(reply || "").trim();
  if (!text) {
    return "Please share your question, and I will answer directly based on Karen Ward priorities.";
  }
  return text;
}

function getResponse(msg) {
  const lower = msg.toLowerCase();
  for (const [key, keywords] of Object.entries(campaignKnowledge)) {
    if (keywords.some(kw => lower.includes(kw))) {
      const res = responses[key];
      return enforcePersona(res[Math.floor(Math.random() * res.length)]);
    }
  }
  return enforcePersona(responses.default[Math.floor(Math.random() * responses.default.length)]);
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