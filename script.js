const navToggle = document.querySelector('.menu-toggle');
const navList = document.querySelector('.main-nav ul');
const yearEl = document.getElementById('year');

if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navList.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const fallbackBandData = {
  bandName: 'Drowning Violets',
  hero: {
    tagline: 'Official bio update in progress',
    headline: 'Drowning Violets',
    description:
      "We're gathering verified copy from Spotify and TikTok so the story you read here matches the band's official profiles.",
    primaryCta: {
      label: 'Listen on Spotify',
      url: ''
    },
    secondaryCta: {
      label: 'Follow on TikTok',
      url: ''
    }
  },
  about: {
    paragraphs: [
      'Replace this copy with the biography from Spotify for Artists or your press kit so fans and promoters see the same story everywhere.',
      'If you have follower counts, hometown details, or release highlights, add them below once verified.'
    ],
    highlights: [
      'Document your monthly listeners, notable playlists, or TikTok milestones.',
      'Add press quotes or achievements once you verify them.'
    ],
    members: []
  },
  music: {
    releases: []
  },
  shows: {
    events: []
  },
  gallery: {
    items: []
  },
  contact: {
    copy:
      'Keep booking, press, and fan outreach aligned with the details you publish on Spotify and TikTok. Update the contact list once you have confirmed addresses.',
    emails: [],
    links: []
  },
  social: {
    spotify: '',
    tiktok: '',
    instagram: '',
    youtube: '',
    bandcamp: '',
    facebook: ''
  }
};

async function loadBandData() {
  try {
    const response = await fetch('band-data.json', { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Unable to load band-data.json, falling back to defaults.', error);
    return null;
  }
}

function setTextContent(element, value, fallback = '') {
  if (!element) return;
  element.textContent = value || fallback;
}

function applyHero(data) {
  const hero = data.hero || {};
  setTextContent(document.querySelector('[data-hero-tagline]'), hero.tagline, fallbackBandData.hero.tagline);
  setTextContent(document.querySelector('[data-hero-headline]'), hero.headline, fallbackBandData.hero.headline);
  setTextContent(
    document.querySelector('[data-hero-description]'),
    hero.description,
    fallbackBandData.hero.description
  );

  const ctasWrapper = document.querySelector('[data-hero-ctas]');
  const primary = document.querySelector('[data-hero-primary]');
  const secondary = document.querySelector('[data-hero-secondary]');

  const applyCta = (anchor, cta) => {
    if (!anchor) return false;
    if (cta && cta.url) {
      anchor.textContent = cta.label || anchor.textContent;
      anchor.href = cta.url;
      anchor.classList.remove('is-hidden');
      if (cta.url.startsWith('http')) {
        anchor.target = '_blank';
        anchor.rel = 'noreferrer noopener';
      } else {
        anchor.removeAttribute('target');
        anchor.removeAttribute('rel');
      }
      return true;
    }

    anchor.classList.add('is-hidden');
    anchor.removeAttribute('href');
    anchor.removeAttribute('target');
    anchor.removeAttribute('rel');
    return false;
  };

  const hasPrimary = applyCta(primary, hero.primaryCta);
  const hasSecondary = applyCta(secondary, hero.secondaryCta);

  if (ctasWrapper && !hasPrimary && !hasSecondary) {
    ctasWrapper.classList.add('is-hidden');
  }
}

function applyAbout(data) {
  const about = data.about || {};
  const bioContainer = document.querySelector('[data-about-bio]');
  if (bioContainer) {
    bioContainer.innerHTML = '';
    const paragraphs = Array.isArray(about.paragraphs) && about.paragraphs.length
      ? about.paragraphs
      : fallbackBandData.about.paragraphs;

    paragraphs.forEach((text) => {
      if (!text) return;
      const p = document.createElement('p');
      p.textContent = text;
      bioContainer.appendChild(p);
    });
  }

  const highlightsWrapper = document.querySelector('[data-about-highlights]');
  if (highlightsWrapper) {
    const list = highlightsWrapper.querySelector('ul');
    if (list) {
      list.innerHTML = '';
      const highlights = Array.isArray(about.highlights) && about.highlights.length
        ? about.highlights
        : fallbackBandData.about.highlights;

      highlights.forEach((item) => {
        if (!item) return;
        const li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
      });
    }
  }

  const lineupList = document.querySelector('[data-lineup]');
  if (lineupList) {
    lineupList.innerHTML = '';
    const members = Array.isArray(about.members) && about.members.length ? about.members : null;
    if (members) {
      members.forEach((member) => {
        const li = document.createElement('li');
        const name = document.createElement('span');
        name.textContent = member.name || 'Member name';
        const role = document.createElement('span');
        role.textContent = member.role || 'Role';
        li.append(name, role);
        lineupList.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.className = 'empty-state';
      li.innerHTML = 'Add each member\'s name and role in <code>band-data.json</code>.';
      lineupList.appendChild(li);
    }
  }
}

function applyReleases(data) {
  const releaseContainer = document.querySelector('[data-releases]');
  const template = document.getElementById('release-template');
  if (!releaseContainer || !template) return;

  releaseContainer.innerHTML = '';
  const releases = data.music && Array.isArray(data.music.releases) ? data.music.releases : [];

  if (!releases.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'Add release details with Spotify, Apple Music, or TikTok audio links.';
    releaseContainer.appendChild(empty);
    return;
  }

  releases.forEach((release) => {
    const fragment = template.content.cloneNode(true);
    const art = fragment.querySelector('[data-release-art]');
    const title = fragment.querySelector('[data-release-title]');
    const description = fragment.querySelector('[data-release-description]');
    const linksWrapper = fragment.querySelector('[data-release-links]');

    if (art) {
      if (release.artwork) {
        art.style.backgroundImage = `url(${release.artwork})`;
        art.classList.add('has-image');
        art.textContent = '';
      } else {
        art.textContent = release.artworkLabel || release.title || 'Artwork coming soon';
      }
    }

    if (title) {
      title.textContent = release.title || 'Untitled release';
    }

    if (description) {
      description.textContent = release.description || '';
    }

    if (linksWrapper) {
      linksWrapper.innerHTML = '';
      const links = Array.isArray(release.links) ? release.links.filter((link) => link && link.url) : [];
      if (links.length) {
        links.forEach((link) => {
          const anchor = document.createElement('a');
          anchor.href = link.url;
          anchor.textContent = link.label || 'Listen';
          anchor.className = 'badge';
          anchor.target = '_blank';
          anchor.rel = 'noreferrer noopener';
          linksWrapper.appendChild(anchor);
        });
      } else {
        linksWrapper.remove();
      }
    }

    releaseContainer.appendChild(fragment);
  });
}

function applyShows(data) {
  const showsList = document.querySelector('[data-shows]');
  const template = document.getElementById('show-template');
  if (!showsList || !template) return;

  showsList.innerHTML = '';
  const events = data.shows && Array.isArray(data.shows.events) ? data.shows.events : [];

  if (!events.length) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'Post confirmed tour dates once they\'re announced on TikTok or Songkick.';
    showsList.appendChild(empty);
    return;
  }

  events.forEach((event) => {
    const fragment = template.content.cloneNode(true);
    setTextContent(fragment.querySelector('[data-show-date]'), event.date || 'TBA');
    setTextContent(fragment.querySelector('[data-show-venue]'), event.venue || 'Venue TBA');
    setTextContent(fragment.querySelector('[data-show-location]'), event.location || 'City, ST');

    const link = fragment.querySelector('[data-show-link]');
    if (link) {
      if (event.url) {
        link.href = event.url;
        link.textContent = event.linkLabel || 'Tickets';
        link.target = '_blank';
        link.rel = 'noreferrer noopener';
      } else {
        link.remove();
      }
    }

    showsList.appendChild(fragment);
  });
}

function applyGallery(data) {
  const gallery = document.querySelector('[data-gallery]');
  const template = document.getElementById('gallery-template');
  if (!gallery || !template) return;

  gallery.innerHTML = '';
  const items = data.gallery && Array.isArray(data.gallery.items) ? data.gallery.items : [];

  if (!items.length) {
    const fallback = document.createElement('figure');
    fallback.className = 'gallery-item empty-state';
    fallback.innerHTML = '<figcaption>Swap in press photos or TikTok stills once you have usage rights.</figcaption>';
    gallery.appendChild(fallback);
    return;
  }

  items.forEach((item) => {
    const fragment = template.content.cloneNode(true);
    const image = fragment.querySelector('[data-gallery-image]');
    const caption = fragment.querySelector('[data-gallery-caption]');

    if (image) {
      if (item.image) {
        image.style.backgroundImage = `url(${item.image})`;
        image.classList.add('has-image');
      }
      if (item.alt) {
        image.setAttribute('role', 'img');
        image.setAttribute('aria-label', item.alt);
      }
    }

    if (caption) {
      caption.textContent = item.caption || '';
    }

    gallery.appendChild(fragment);
  });
}

function applyContact(data) {
  const contact = data.contact || {};
  setTextContent(
    document.querySelector('[data-contact-copy]'),
    contact.copy,
    fallbackBandData.contact.copy
  );

  const contactList = document.querySelector('[data-contact-links]');
  if (contactList) {
    contactList.innerHTML = '';
    const entries = [];

    if (Array.isArray(contact.emails)) {
      contact.emails.forEach((email) => {
        if (!email || !email.address) return;
        entries.push({
          label: email.label || email.address,
          href: `mailto:${email.address}`,
          text: email.address
        });
      });
    }

    if (Array.isArray(contact.links)) {
      contact.links.forEach((link) => {
        if (!link || !link.url) return;
        entries.push({
          label: link.label || link.url,
          href: link.url,
          text: link.label || link.url,
          external: true
        });
      });
    }

    if (!entries.length) {
      const li = document.createElement('li');
      li.className = 'empty-state';
      li.innerHTML = 'Add your booking and press emails in <code>band-data.json</code>.';
      contactList.appendChild(li);
    } else {
      entries.forEach((entry) => {
        const li = document.createElement('li');
        const anchor = document.createElement('a');
        anchor.href = entry.href;
        anchor.textContent = entry.text;
        if (entry.external) {
          anchor.target = '_blank';
          anchor.rel = 'noreferrer noopener';
        }
        li.appendChild(anchor);
        if (entry.label && entry.label !== entry.text) {
          anchor.setAttribute('aria-label', entry.label);
        }
        contactList.appendChild(li);
      });
    }
  }
}

function applyFooter(data) {
  const socialsWrapper = document.querySelector('[data-footer-socials]');
  const footerName = document.querySelector('[data-footer-name]');
  setTextContent(footerName, data.bandName || fallbackBandData.bandName);

  if (!socialsWrapper) return;

  socialsWrapper.innerHTML = '';
  const socialEntries = Object.entries(data.social || {}).filter(([, url]) => url);

  if (!socialEntries.length) {
    const placeholder = document.createElement('a');
    placeholder.className = 'empty-state';
    placeholder.href = '#';
    placeholder.textContent = 'Add official social links';
    placeholder.addEventListener('click', (event) => event.preventDefault());
    socialsWrapper.appendChild(placeholder);
    return;
  }

  const socialLabels = {
    spotify: 'Spotify',
    tiktok: 'TikTok',
    instagram: 'Instagram',
    youtube: 'YouTube',
    bandcamp: 'Bandcamp',
    facebook: 'Facebook',
    twitter: 'Twitter',
    threads: 'Threads'
  };

  socialEntries.forEach(([network, url]) => {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noreferrer noopener';
    anchor.textContent = socialLabels[network.toLowerCase()] || network;
    socialsWrapper.appendChild(anchor);
  });
}

async function hydrateBandSite() {
  const data = (await loadBandData()) || fallbackBandData;
  applyHero(data);
  applyAbout(data);
  applyReleases(data);
  applyShows(data);
  applyGallery(data);
  applyContact(data);
  applyFooter(data);
}

hydrateBandSite();

const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    const summary = `Thanks, ${name}! We'll reach out to ${email} soon.\n\nMessage: ${message}`;
    alert(summary);
    form.reset();
  });
}
