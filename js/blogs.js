(function () {
  const blogs = [
    {
      id: "blog-1",
      title: "The Wellness Equation: Why True Health is More Than Just the Absence of Illness",
      category: "wellness",
      author: "Campaign Editorial Team",
      publishedAt: "2026-05-18",
      imageUrl: "/assets/images/TrueHealth.png",
      excerpt: "Health is a snapshot, but wellness is an active journey. Real well-being starts when we move from simply being illness-free to intentionally thriving.",
      content: [
        { type: "p", text: "We often use the words health and wellness interchangeably, but they mean very different things. Health is often a neutral, static state: if your tests are normal and you are free from immediate illness, you are considered healthy." },
        { type: "p", text: "Wellness is dynamic and intentional. It is not a destination but a continuous process of making choices that maximize your quality of life. Health can be the foundation, but wellness is the life you build on top of it." },
        { type: "p", text: "Just as a balanced diet supports physical nutrition, balanced wellness supports the whole person: body, mind, and spirit. Mental health is central in this equation. When we manage stress, protect boundaries, and build positive habits, we move from surviving to thriving." },
        { type: "p", text: "This shift in mindset changes everything. Instead of asking, Am I sick?, we ask, Am I well? That simple difference encourages daily action, not passive waiting. In that action, resilient and fulfilling living begins." }
      ]
    },
    {
      id: "blog-2",
      title: "The 8 Pillars of Holistic Harmony: Balancing Your Wellness Dimensions",
      category: "wellness",
      author: "Campaign Editorial Team",
      publishedAt: "2026-05-17",
      imageUrl: "/assets/images/8pillars.png",
      excerpt: "Emotional, physical, occupational, interpersonal, spiritual, intellectual, environmental, and financial dimensions all work together to shape your wellness.",
      content: [
        { type: "p", text: "True wellness is not one target. It is a system of connected dimensions that influence each other over time." },
        { type: "list", items: ["Emotional: understanding and managing feelings.", "Physical: movement, nutrition, and sleep.", "Occupational: meaning and growth at work.", "Interpersonal: supportive relationships.", "Spiritual: purpose, values, and inner peace.", "Intellectual: curiosity and mental stimulation.", "Environmental: clean, safe, positive spaces.", "Financial: resource stability and reduced stress."] },
        { type: "p", text: "If one dimension is neglected, it can affect all the others. For example, prolonged financial stress can harm emotional wellness and eventually physical health. On the other hand, strong relationships and purpose can provide stability when work or environment becomes difficult." },
        { type: "p", text: "Picture wellness as a wheel with eight spokes. If one spoke is weak, the ride becomes unsteady. A balanced life does not require perfection, but it does require attention. Small, consistent improvements across each dimension create lasting harmony." }
      ]
    },
    {
      id: "blog-3",
      title: "Raising Our Voices: Why Mental Health Advocacy Matters to Everyone",
      category: "advocacy",
      author: "Campaign Editorial Team",
      publishedAt: "2026-05-16",
      imageUrl: "/assets/images/voices.png",
      excerpt: "Mental health advocacy protects rights, fights stigma, and pushes for fair policy so people can access care without shame.",
      content: [
        { type: "p", text: "Mental health is part of our overall well-being. It shapes how we think, feel, and act in daily life, so caring for it is essential to a balanced and fulfilling life." },
        { type: "p", text: "Many people still struggle silently because of stigma and systemic barriers. Advocacy means standing with them: protecting rights, improving policy, and normalizing mental healthcare as real healthcare." },
        { type: "p", text: "No one should feel ashamed of a medical challenge simply because it affects the brain. Advocacy replaces judgment with education and demands that mental healthcare receives equal urgency, funding, and dignity." },
        { type: "p", text: "You can advocate in simple ways: speak openly, check in on others, support inclusive policies, and vote for better healthcare access. Every action helps create a safer society where seeking help is seen as courage." }
      ]
    },
    {
      id: "blog-4",
      title: "The Power of Human Connection in an Isolated World",
      category: "connection",
      author: "Campaign Editorial Team",
      publishedAt: "2026-05-15",
      imageUrl: "/assets/images/HumanC.png",
      excerpt: "Connection is the first of the 5 C's and one of the strongest protective factors for emotional resilience and mental well-being.",
      content: [
        { type: "p", text: "Human beings are wired for connection. In the 5 C's framework, Connection means meaningful relationships with family, friends, and colleagues." },
        { type: "p", text: "In a hyper-digital world, we can feel socially busy but emotionally disconnected. Genuine connection does more than feel good: it lowers stress, improves mood, and strengthens resilience during difficult times." },
        { type: "p", text: "Quality matters more than quantity. You do not need a large circle to protect your mental health. A few trusted relationships where you are seen, heard, and supported can anchor you through major life challenges." },
        { type: "p", text: "Connection is an active practice. Reach out, listen deeply, and make room for honest conversations. Small moments of presence create long-term emotional safety." }
      ]
    },
    {
      id: "blog-5",
      title: "Radical Kindness: Cultivating Self-Compassion and Empathy",
      category: "compassion",
      author: "Campaign Editorial Team",
      publishedAt: "2026-05-14",
      imageUrl: "/assets/images/RadicalKindness.png",
      excerpt: "Compassion means replacing harsh self-criticism with understanding and extending that same grace to others.",
      content: [
        { type: "p", text: "When we fail or struggle, our inner critic often becomes loud and unforgiving. The second C, Compassion, offers a healthier response: kindness toward ourselves and others." },
        { type: "p", text: "Self-compassion is not excuses. It is emotional honesty plus care. Instead of saying, I ruined everything, we say, This is hard, and I am still worthy of support. That shift builds resilience and reduces shame." },
        { type: "p", text: "Compassion also strengthens communities. We rarely see the full burden another person carries. Choosing empathy, patience, and practical support can ease silent suffering and deepen trust." },
        { type: "p", text: "The compassion we practice becomes a culture. When we treat ourselves and others gently, everyone benefits from safer relationships and stronger emotional health." }
      ]
    },
    {
      id: "blog-6",
      title: "Mastering the Storm: Adopting Healthy Coping Strategies",
      category: "coping",
      author: "Campaign Editorial Team",
      publishedAt: "2026-05-13",
      imageUrl: "/assets/images/Storm.png",
      excerpt: "Healthy coping tools such as movement, mindfulness, and social support help us respond to stress with control and clarity.",
      content: [
        { type: "p", text: "Life includes uncertainty, pressure, and setbacks. Coping is the toolkit we use to navigate those moments without losing balance." },
        { type: "p", text: "Healthy coping differs from temporary escape. Numbing, doom-scrolling, and substance misuse can intensify distress over time. Constructive coping builds long-term capacity." },
        { type: "p", text: "Helpful strategies include daily mindfulness, regular physical activity, reflective journaling, structured breathing, and asking for support early. These practices improve emotional regulation and problem-solving under stress." },
        { type: "p", text: "Coping is personal. Experiment, observe, and keep what works. The goal is to build habits before a crisis so your mind has reliable tools when pressure rises." }
      ]
    },
    {
      id: "blog-7",
      title: "Finding Your Tribe: The Vital Role of Community in Mental Well-being",
      category: "community",
      author: "Campaign Editorial Team",
      publishedAt: "2026-05-12",
      imageUrl: "/assets/images/Tribe.png",
      excerpt: "Community creates belonging, purpose, and support, reducing isolation and strengthening day-to-day mental resilience.",
      content: [
        { type: "p", text: "Community means belonging to a network that offers support, accountability, and shared purpose. It can be local or online, formal or informal." },
        { type: "p", text: "Strong communities reduce isolation, a major contributor to depression and anxiety. They also create opportunities for shared goals, which improve motivation and emotional stability." },
        { type: "p", text: "Community is reciprocal. Giving your time and energy to others strengthens your own sense of meaning. Helping and being helped are both essential parts of social wellness." },
        { type: "p", text: "If you cannot find support in one space, try another. There are communities for every stage and experience. Your tribe exists, and finding it can be life-changing." }
      ]
    },
    {
      id: "blog-8",
      title: "The Proactive Mindset: Taking Charge of Your Mental Care",
      category: "care",
      author: "Campaign Editorial Team",
      publishedAt: "2026-05-11",
      imageUrl: "/assets/images/proactive.png",
      excerpt: "Care means taking proactive ownership of mental well-being through self-care habits and professional support when needed.",
      content: [
        { type: "p", text: "Care, the final C, is about intentional action. Mental health does not improve by chance. It improves through consistent choices that protect mind and body." },
        { type: "p", text: "Core practices are simple but powerful: exercise, balanced eating, restful sleep, and regular recovery time. These are not luxuries. They are biological requirements for a healthy brain." },
        { type: "p", text: "Care also includes seeking professional support when challenges persist. Therapy, counseling, and psychiatric care are valid healthcare options, not last resorts." },
        { type: "p", text: "There is no one perfect routine. Effective self-care is personalized, realistic, and repeatable. Build a rhythm that fits your real life and protects your long-term well-being." }
      ]
    },
    {
      id: "blog-9",
      title: "Marked on the Calendar: Turning Awareness into Daily Action",
      category: "awareness",
      author: "Campaign Editorial Team",
      publishedAt: "2026-05-10",
      imageUrl: "/assets/images/Youth Day.png",
      excerpt: "Mental health awareness dates are powerful reminders, but the real impact comes when awareness becomes a daily practice.",
      content: [
        { type: "p", text: "Global mental health dates unite communities and elevate urgent conversations." },
        { type: "list", items: ["May: Mental Health Awareness Month", "May 11-17: Mental Health Awareness Week", "September 10: World Suicide Prevention Day", "October 10: World Mental Health Day"] },
        { type: "p", text: "These observances help reduce stigma and drive policy attention, but their impact should not end after the calendar date passes." },
        { type: "p", text: "Use each awareness period as a personal reset point: check stress levels, adjust coping tools, reconnect with supportive people, and renew self-compassion. Awareness matters most when it leads to sustained daily action." }
      ]
    },
    {
      id: "blog-10",
      title: "Navigating the Lifelong Journey of Mental Resilience",
      category: "resilience",
      author: "Campaign Editorial Team",
      publishedAt: "2026-05-09",
      imageUrl: "/assets/images/Green Karen.png",
      excerpt: "Mental health is not a final destination. The 5 C's help us stay steady through life changes, setbacks, and growth.",
      content: [
        { type: "p", text: "Mental resilience develops over time. Like physical fitness, it shifts with life seasons and requires ongoing practice." },
        { type: "p", text: "The 5 C's provide a dependable framework: Connection, Compassion, Coping, Community, and Care. Together they form practical support for daily mental health." },
        { type: "list", items: ["Connect deeply with trusted people.", "Practice compassion when you make mistakes.", "Use healthy coping tools under stress.", "Lean into community support.", "Care for your body and mind proactively."] },
        { type: "p", text: "Most importantly, seek help when needed. Support from professionals, friends, or family is not weakness. It is a strong and necessary step in lifelong wellness." }
      ]
    }
  ];

  let currentCategory = "all";
  let searchTerm = "";

  function esc(t) {
    if (!t) return "";
    const d = document.createElement("div");
    d.textContent = t;
    return d.innerHTML;
  }

  function formatDate(input) {
    if (!input) return "Date unavailable";
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) return input;
    return date.toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  function plainTextFromContent(content) {
    if (!Array.isArray(content)) return "";
    return content
      .map(function (part) {
        if (part.type === "list") return (part.items || []).join(" ");
        return part.text || "";
      })
      .join(" ");
  }

  function renderContent(content) {
    if (!Array.isArray(content)) return "";
    return content
      .map(function (part) {
        if (part.type === "h3") {
          return '<h3 style="margin:1rem 0 0.5rem;font-size:1.15rem">' + esc(part.text || "") + "</h3>";
        }
        if (part.type === "list") {
          const items = (part.items || [])
            .map(function (item) {
              return "<li>" + esc(item) + "</li>";
            })
            .join("");
          return '<ul style="margin:0.2rem 0 1rem 1.1rem;color:var(--text-light);line-height:1.65">' + items + "</ul>";
        }
        return '<p style="color:var(--text-light);line-height:1.75;margin-bottom:0.9rem">' + esc(part.text || "") + "</p>";
      })
      .join("");
  }

  function categoryLabel(cat) {
    const map = {
      wellness: "Wellness",
      advocacy: "Advocacy",
      connection: "Connection",
      compassion: "Compassion",
      coping: "Coping",
      community: "Community",
      care: "Care",
      awareness: "Awareness",
      resilience: "Resilience"
    };
    return map[cat] || cat || "General";
  }

  function ensureCategoryButtons(items) {
    const wrap = document.getElementById("categoryFilters");
    if (!wrap) return;

    const seen = {};
    const categories = ["all"];
    items.forEach(function (item) {
      const slug = (item.category || "").toLowerCase();
      if (slug && !seen[slug]) {
        seen[slug] = true;
        categories.push(slug);
      }
    });

    wrap.innerHTML = categories
      .map(function (cat, idx) {
        const active = idx === 0 ? " active" : "";
        const label = cat === "all" ? "All Posts" : categoryLabel(cat);
        return '<button class="filter-btn' + active + '" data-category="' + esc(cat) + '">' + esc(label) + "</button>";
      })
      .join("");

    wrap.querySelectorAll(".filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        wrap.querySelectorAll(".filter-btn").forEach(function (x) {
          x.classList.remove("active");
        });
        btn.classList.add("active");
        currentCategory = btn.dataset.category;
        renderBlogs();
      });
    });
  }

  function filteredBlogs() {
    let filtered = blogs.slice();

    if (currentCategory !== "all") {
      filtered = filtered.filter(function (blog) {
        return (blog.category || "").toLowerCase() === currentCategory;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(function (blog) {
        const combined = [blog.title, blog.excerpt, plainTextFromContent(blog.content)].join(" ").toLowerCase();
        return combined.includes(searchTerm);
      });
    }

    return filtered;
  }

  function renderBlogs() {
    const grid = document.getElementById("articlesGrid");
    if (!grid) return;

    const filtered = filteredBlogs();
    if (!filtered.length) {
      grid.innerHTML = '<div style="text-align:center;grid-column:1/-1;padding:50px 10px;color:var(--text-muted)">No blog posts found. Try a different keyword or category.</div>';
      return;
    }

    grid.innerHTML = filtered
      .map(function (blog) {
        return (
          '<article class="article-card">' +
          '<div class="article-img"><img src="' + esc(blog.imageUrl) + '" alt="' + esc(blog.title) + '" loading="lazy"></div>' +
          '<div class="article-content">' +
          '<div class="article-meta"><span class="badge badge-gold">' + esc(categoryLabel(blog.category)) + '</span><span class="article-date">' + esc(formatDate(blog.publishedAt)) + "</span></div>" +
          '<div class="article-source"><i class="fas fa-user-edit"></i> ' + esc(blog.author) + "</div>" +
          '<h3 class="article-title">' + esc(blog.title) + "</h3>" +
          '<p class="article-excerpt">' + esc(blog.excerpt) + "</p>" +
          '<a href="#" class="read-more" data-id="' + esc(blog.id) + '">Read More <i class="fas fa-book-open"></i></a>' +
          "</div></article>"
        );
      })
      .join("");

    grid.querySelectorAll(".read-more").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        previewBlog(btn.dataset.id);
      });
    });
  }

  function previewBlog(id) {
    const blog = blogs.find(function (item) {
      return item.id === id;
    });
    if (!blog) return;

    document.getElementById("modalBody").innerHTML =
      '<span class="badge badge-gold" style="margin-bottom:1rem">' + esc(categoryLabel(blog.category)) + "</span>" +
      '<h2 style="margin:0.5rem 0 0.35rem;font-size:1.4rem;line-height:1.35">' + esc(blog.title) + "</h2>" +
      '<p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem">' + esc(formatDate(blog.publishedAt)) + ' · <span style="color:var(--accent-light)">' + esc(blog.author) + "</span></p>" +
      '<div style="width:100%;border-radius:16px;overflow:hidden;margin-bottom:1rem"><img src="' + esc(blog.imageUrl) + '" alt="' + esc(blog.title) + '" style="width:100%;display:block;max-height:280px;object-fit:cover"></div>' +
      renderContent(blog.content);

    document.getElementById("articleModal").classList.add("active");
  }

  function closeModal() {
    document.getElementById("articleModal").classList.remove("active");
  }

  document.addEventListener("DOMContentLoaded", function () {
    const statusEl = document.getElementById("cmsStatus");
    if (statusEl) {
      statusEl.textContent = "10 hardcoded mental wellness blogs loaded.";
    }

    ensureCategoryButtons(blogs);
    renderBlogs();

    document.getElementById("searchInput").addEventListener("input", function () {
      searchTerm = this.value.toLowerCase().trim();
      renderBlogs();
    });

    document.getElementById("articleModal").addEventListener("click", function (e) {
      if (e.target === this) closeModal();
    });

    const closeButton = document.querySelector(".modal-close");
    if (closeButton) {
      closeButton.addEventListener("click", closeModal);
    }
  });
})();
