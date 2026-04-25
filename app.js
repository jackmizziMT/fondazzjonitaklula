async function loadSite() {
    const response = await fetch('klula-content.json');
    const data = await response.json();

    // Set Global Site Info
    document.getElementById('footer-tagline').innerText = data.footer.tagline;
    document.getElementById('footer-reg').innerText = data.footer.registration;
    document.getElementById('footer-email').innerText = data.site.email;

    // Load Navigation
    const navLinks = document.getElementById('nav-links');
    data.nav.items.forEach(item => {
        navLinks.innerHTML += `<li><a href="${item.page}">${item.label}</a></li>`;
    });

    // Load Home Hero
    const home = data.pages.home;
    document.getElementById('hero-heading').innerText = home.hero.heading;
    document.getElementById('hero-subheading').innerText = home.hero.subheading;
    const cta = document.getElementById('hero-cta');
    cta.innerText = home.hero.cta_label;
    cta.href = home.hero.cta_href;

    // Load Home Intro
    document.getElementById('intro-heading').innerText = home.intro.heading;
    document.getElementById('intro-body').innerText = home.intro.body;

    // Load Highlights
    const container = document.getElementById('highlights-container');
    home.highlights.forEach(h => {
        container.innerHTML += `
            <div class="highlight-card">
                <h3>${h.heading}</h3>
                <p>${h.body}</p>
            </div>
        `;
    });
}

loadSite();