let articlesData = [];
let currentCategory = 'All';
let searchQuery = '';

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
}

window.copyCode = function(btn) {
    const pre = btn.parentElement.nextElementSibling;
    const text = pre.innerText;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.innerText;
        btn.innerText = 'Copied!';
        setTimeout(() => btn.innerText = originalText, 2000);
    });
};

document.addEventListener('DOMContentLoaded', async () => {
    if (!document.getElementById('app-container')) return;

    try {
        // Configure Marked.js
        const renderer = new marked.Renderer();
        
        renderer.code = function({text, lang, escaped}) {
            const validLang = Prism.languages[lang] ? lang : 'plaintext';
            return `
                <div class="code-block-wrapper">
                    <div class="code-header">
                        <span class="lang-badge">${validLang}</span>
                        <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                    </div>
                    <pre><code class="language-${validLang}">${escaped ? text : escapeHTML(text)}</code></pre>
                </div>
            `;
        };

        renderer.blockquote = function({tokens}) {
            if (tokens && tokens[0] && tokens[0].text) {
                let text = tokens[0].text;
                if (text.startsWith('[!TIP]')) {
                    return `<div class="callout tip"><div class="callout-title">💡 Tip</div>${marked.parse(text.replace('[!TIP]', ''))}</div>`;
                } else if (text.startsWith('[!WARNING]')) {
                    return `<div class="callout warning"><div class="callout-title">⚠️ Warning</div>${marked.parse(text.replace('[!WARNING]', ''))}</div>`;
                }
            }
            let content = '';
            for (let t of tokens) {
                if(t.type === 'paragraph') content += `<p>${t.text}</p>`;
                else content += t.raw || t.text;
            }
            return `<blockquote>${content}</blockquote>`;
        };

        marked.use({ renderer });

        const res = await fetch('articles.json');
        if (!res.ok) throw new Error("Could not fetch articles.json. Are you running a local server?");
        articlesData = await res.json();
        
        // Setup Routing
        window.addEventListener('hashchange', handleRoute);
        handleRoute(); // Initial load
        
        setupScrollProgress();
    } catch (e) {
        console.error("Initialization Error:", e);
        document.getElementById('app-container').innerHTML = `
            <div style="text-align:center; padding: 5rem 1rem;">
                <h2>⚠️ Error loading Knowledge Base</h2>
                <p style="color:var(--text-secondary); margin-top:1rem;">${e.message}</p>
                <p style="margin-top:1rem;">If you are opening the file directly from your computer (file://), you must use a local server like Live Server instead.</p>
            </div>
        `;
    }
});

function handleRoute() {
    const hash = window.location.hash;
    window.scrollTo(0, 0);
    
    if (hash.startsWith('#/article/')) {
        const id = hash.replace('#/article/', '');
        renderArticleView(id);
    } else {
        renderHomeView();
    }
}

// =======================
// HOME VIEW
// =======================
function renderHomeView() {
    const app = document.getElementById('app-container');
    app.innerHTML = `
        <div class="kb-hero reveal">
            <h1 class="kb-title">Knowledge Base</h1>
            <p class="kb-subtitle">Practical software engineering, AI, machine learning and development articles designed to help developers understand concepts—not just copy code.</p>
            
            <div class="search-wrapper">
                <input type="text" id="kb-search" class="search-input" placeholder="Search articles..." oninput="handleSearch(this.value)">
                <svg class="search-icon w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            
            <div class="kb-categories" id="category-container">
                <!-- Categories injected here -->
            </div>
        </div>

        <div id="home-content">
            <section class="kb-section reveal" id="featured-section">
                <h2 class="kb-section-title">Featured Articles</h2>
                <div class="featured-container" id="featured-container"></div>
            </section>

            <section class="kb-section reveal">
                <h2 class="kb-section-title" id="latest-title">Latest Articles</h2>
                <div class="article-grid" id="grid-container"></div>
            </section>
        </div>
    `;

    // Extract unique categories and counts
    const categoryCounts = {'All': articlesData.length};
    articlesData.forEach(a => {
        categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    });

    const catContainer = document.getElementById('category-container');
    catContainer.innerHTML = Object.keys(categoryCounts).map(cat => `
        <button class="category-pill ${cat === currentCategory ? 'active' : ''}" onclick="filterCategory('${cat}')">
            ${cat} <span class="category-count">${categoryCounts[cat]}</span>
        </button>
    `).join('');

    updateHomeGrids();
    
    // Trigger animations for dynamically injected elements
    setTimeout(() => {
        document.querySelectorAll('#app-container .reveal').forEach(el => el.classList.add('active'));
    }, 50);
}

window.handleSearch = function(query) {
    searchQuery = query.toLowerCase();
    updateHomeGrids();
};

window.filterCategory = function(cat) {
    currentCategory = cat;
    // Update active class
    document.querySelectorAll('.category-pill').forEach(btn => {
        if(btn.innerText.startsWith(cat)) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    updateHomeGrids();
};

function updateHomeGrids() {
    let filtered = articlesData.filter(a => {
        const matchesCat = currentCategory === 'All' || a.category === currentCategory;
        const matchesSearch = a.title.toLowerCase().includes(searchQuery) || 
                              a.description.toLowerCase().includes(searchQuery) ||
                              a.tags.some(t => t.toLowerCase().includes(searchQuery));
        return matchesCat && matchesSearch;
    });

    // Hide/Show Featured based on search/category
    const featuredSection = document.getElementById('featured-section');
    if (currentCategory === 'All' && searchQuery === '') {
        featuredSection.style.display = 'block';
        const featured = filtered.filter(a => a.featured).slice(0, 2);
        document.getElementById('featured-container').innerHTML = featured.map(a => `
            <a href="#/article/${a.id}" class="featured-card">
                <div class="featured-content">
                    <div class="article-meta">
                        <span class="badge ${a.category === 'AI' || a.category === 'LLM' ? 'purple' : ''}">${a.category}</span>
                        <span>⏱ ${a.readingTime}</span>
                        <span>📅 ${a.date}</span>
                    </div>
                    <h3 class="article-title">${a.title}</h3>
                    <p class="article-desc">${a.description}</p>
                </div>
            </a>
        `).join('');
    } else {
        featuredSection.style.display = 'none';
        document.getElementById('latest-title').innerText = 'Search Results';
    }

    // Regular Grid
    document.getElementById('grid-container').innerHTML = filtered.map(a => `
        <a href="#/article/${a.id}" class="article-card">
            <div class="article-meta" style="margin-bottom: 0.5rem;">
                <span style="color: var(--neon-cyan); font-weight: 600; font-size: 0.85rem;">${a.category}</span>
                <span style="font-size: 0.8rem;">${a.difficulty}</span>
            </div>
            <h3 class="article-title">${a.title}</h3>
            <p class="article-desc" style="font-size: 0.9rem; margin-bottom: 1rem;">${a.description}</p>
            <div class="article-tags">
                ${a.tags.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
        </a>
    `).join('');
}

// =======================
// ARTICLE VIEW
// =======================
async function renderArticleView(id) {
    const articleMeta = articlesData.find(a => a.id === id);
    if (!articleMeta) {
        handleRoute(); // Go home if not found
        return;
    }

    const app = document.getElementById('app-container');
    
    // Skeleton structure
    app.innerHTML = `
        <div class="article-layout reveal">
            <aside class="article-sidebar">
                <a href="#" class="back-btn">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Knowledge Base
                </a>
                <div class="sidebar-title">Table of Contents</div>
                <ul class="toc-list" id="toc"></ul>
            </aside>
            
            <article class="article-main">
                <header class="article-header">
                    <div class="article-meta">
                        <span class="badge ${articleMeta.category === 'AI' ? 'purple' : ''}">${articleMeta.category}</span>
                        <span>⏱ ${articleMeta.readingTime}</span>
                        <span>📊 ${articleMeta.difficulty}</span>
                        <span>📅 ${articleMeta.date}</span>
                    </div>
                    <h1 class="article-title">${articleMeta.title}</h1>
                    <p class="article-desc" style="font-size: 1.2rem;">${articleMeta.description}</p>
                </header>
                <div class="md-content" id="md-content">
                    Loading article content...
                </div>
            </article>
        </div>
    `;

    // Fetch Markdown
    try {
        const res = await fetch(`articles/${id}.md`);
        if (!res.ok) throw new Error("File not found");
        let mdText = await res.text();
        
        // Parse markdown
        document.getElementById('md-content').innerHTML = marked.parse(mdText);
        
        // Post-processing
        Prism.highlightAll();
        if (mdText.includes('```mermaid')) {
            mermaid.initialize({startOnLoad: false, theme: 'dark'});
            mermaid.run();
        }
        
        generateTOC();
    } catch(e) {
        document.getElementById('md-content').innerHTML = `<p>Coming soon! This article is currently being drafted.</p>`;
    }

    // Trigger animations
    setTimeout(() => {
        document.querySelectorAll('#app-container .reveal').forEach(el => el.classList.add('active'));
    }, 50);
}

function generateTOC() {
    const content = document.getElementById('md-content');
    const headers = content.querySelectorAll('h2, h3');
    const toc = document.getElementById('toc');
    
    if(headers.length === 0) {
        toc.innerHTML = '<li class="toc-link" style="color:var(--text-secondary);">No sections found</li>';
        return;
    }

    let html = '';
    headers.forEach((h, i) => {
        const id = 'heading-' + i;
        h.id = id;
        html += `<li><a href="#/article/${window.location.hash.split('/').pop()}?scrollTo=${id}" class="toc-link ${h.tagName.toLowerCase() === 'h3' ? 'toc-h3' : ''}" data-target="${id}">${h.innerText}</a></li>`;
    });
    toc.innerHTML = html;

    // Scroll Observer for TOC active state
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('.toc-link').forEach(l => l.classList.remove('active'));
                const activeLink = document.querySelector(`.toc-link[data-target="${entry.target.id}"]`);
                if(activeLink) activeLink.classList.add('active');
            }
        });
    }, { rootMargin: '-20% 0px -80% 0px' });

    headers.forEach(h => observer.observe(h));
    
    // Handle smooth scroll if URL has query param (very basic)
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const scrollId = urlParams.get('scrollTo');
    if (scrollId) {
        setTimeout(() => {
            const el = document.getElementById(scrollId);
            if(el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 100;
                window.scrollTo({top: y, behavior: 'smooth'});
            }
        }, 100);
    }

    // Intercept TOC clicks to just scroll smoothly instead of hash change
    document.querySelectorAll('.toc-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            const el = document.getElementById(targetId);
            if(el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 100;
                window.scrollTo({top: y, behavior: 'smooth'});
            }
        });
    });
}

function setupScrollProgress() {
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const bar = document.getElementById('progress-bar');
        if(bar) bar.style.width = scrolled + "%";
    });
}
