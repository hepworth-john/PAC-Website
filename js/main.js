// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
  });

  // Close nav when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// Contact form: submit straight to Supabase via the contact-form
// Edge Function (see supabase/functions/contact-form and
// js/supabase-config.js).
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const formError = document.getElementById('formError');

if (contactForm && formSuccess) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    if (formError) formError.style.display = 'none';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.dataset.originalText || submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
    }

    const data = new FormData(contactForm);
    const payload = {
      firstName: data.get('firstName'),
      lastName: data.get('lastName'),
      email: data.get('email'),
      reason: data.get('reason'),
      message: data.get('message'),
      mailingList: data.get('mailingList'),
      _gotcha: data.get('_gotcha')
    };

    try {
      const response = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        contactForm.style.display = 'none';
        formSuccess.style.display = 'block';
        return;
      }

      const result = await response.json().catch(() => ({}));
      if (formError) {
        formError.textContent = result.error || 'Something went wrong. Please try again or email us directly.';
        formError.style.display = 'block';
      }
    } catch (err) {
      console.error('Contact form submission failed:', err);
      if (formError) {
        formError.textContent = 'Something went wrong. Please check your connection and try again.';
        formError.style.display = 'block';
      }
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtn.dataset.originalText;
    }
  });
}

// RSVP modal: opens from any .rsvp-trigger button on events.html, submits
// to Supabase via the event-rsvp Edge Function (see
// supabase/functions/event-rsvp and js/supabase-config.js).
const rsvpOverlay = document.getElementById('rsvpOverlay');
const rsvpForm = document.getElementById('rsvpForm');

if (rsvpOverlay && rsvpForm) {
  const rsvpModalTitle = document.getElementById('rsvpModalTitle');
  const rsvpEventId = document.getElementById('rsvpEventId');
  const rsvpEventName = document.getElementById('rsvpEventName');
  const rsvpFormWrap = document.getElementById('rsvpFormWrap');
  const rsvpSuccess = document.getElementById('rsvpSuccess');
  const rsvpError = document.getElementById('rsvpError');
  const rsvpClose = document.getElementById('rsvpClose');
  const rsvpDone = document.getElementById('rsvpDone');

  function openRsvpModal(eventId, eventName) {
    rsvpEventId.value = eventId;
    rsvpEventName.value = eventName;
    rsvpModalTitle.textContent = eventName;

    // Reset to a fresh form each time it's opened
    rsvpForm.reset();
    rsvpEventId.value = eventId;
    rsvpEventName.value = eventName;
    if (rsvpError) rsvpError.style.display = 'none';
    rsvpFormWrap.style.display = 'block';
    rsvpSuccess.style.display = 'none';

    rsvpOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeRsvpModal() {
    rsvpOverlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.rsvp-trigger').forEach((btn) => {
    btn.addEventListener('click', () => {
      openRsvpModal(btn.dataset.eventId, btn.dataset.eventName);
    });
  });

  if (rsvpClose) rsvpClose.addEventListener('click', closeRsvpModal);
  if (rsvpDone) rsvpDone.addEventListener('click', closeRsvpModal);

  rsvpOverlay.addEventListener('click', (e) => {
    if (e.target === rsvpOverlay) closeRsvpModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && rsvpOverlay.style.display === 'flex') closeRsvpModal();
  });

  rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = rsvpForm.querySelector('button[type="submit"]');
    if (rsvpError) rsvpError.style.display = 'none';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.dataset.originalText || submitBtn.textContent;
      submitBtn.textContent = 'Submitting...';
    }

    const data = new FormData(rsvpForm);
    const payload = {
      eventId: data.get('eventId'),
      eventName: data.get('eventName'),
      firstName: data.get('firstName'),
      lastName: data.get('lastName'),
      email: data.get('email'),
      guests: data.get('guests'),
      notes: data.get('notes'),
      _gotcha: data.get('_gotcha')
    };

    try {
      const response = await fetch(SUPABASE_EVENT_RSVP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        rsvpFormWrap.style.display = 'none';
        rsvpSuccess.style.display = 'block';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.originalText;
        }
        return;
      }

      const result = await response.json().catch(() => ({}));
      if (rsvpError) {
        rsvpError.textContent = result.error || 'Something went wrong. Please try again or email us directly.';
        rsvpError.style.display = 'block';
      }
    } catch (err) {
      console.error('RSVP submission failed:', err);
      if (rsvpError) {
        rsvpError.textContent = 'Something went wrong. Please check your connection and try again.';
        rsvpError.style.display = 'block';
      }
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtn.dataset.originalText;
    }
  });
}

// Events page: group into "upcoming" (soonest first, stays at the
// top) and "past" (most recently happened first, moved below a
// divider with an inactive "Event Passed" label instead of an
// action button). Runs on every load using the visitor's own clock,
// so the page never needs manual reordering as events happen --
// each event card just needs a data-date="YYYY-MM-DD" attribute.
const eventsList = document.querySelector('.events-list');

if (eventsList) {
  const cards = Array.from(eventsList.querySelectorAll(':scope > .event-card'));

  function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  const today = todayISO();
  const upcoming = [];
  const past = [];

  cards.forEach((card) => {
    const date = card.dataset.date;
    if (!date) {
      // No date to sort by -- leave it with the upcoming events
      // rather than risk hiding it in the past group.
      upcoming.push(card);
      return;
    }
    if (date >= today) {
      upcoming.push(card);
    } else {
      past.push(card);
    }
  });

  upcoming.sort((a, b) => a.dataset.date.localeCompare(b.dataset.date));
  past.sort((a, b) => b.dataset.date.localeCompare(a.dataset.date));

  past.forEach((card) => {
    card.classList.add('event-card--past');
    const action = card.querySelector('.event-action');
    if (action) {
      action.innerHTML = '<span class="btn btn-passed" style="white-space: nowrap;">Event Passed</span>';
    }
  });

  upcoming.forEach((card) => eventsList.appendChild(card));

  if (past.length > 0) {
    const heading = document.createElement('h3');
    heading.className = 'past-events-heading';
    heading.textContent = 'Past Events';
    eventsList.appendChild(heading);
    past.forEach((card) => eventsList.appendChild(card));
  }
}
