<!-- src/routes/+page.svelte -->
 <!-- Color Pallet
  var(--color-danger) - Light Red
  var(--color-accent) - Light Blue
  var(--color-bg) - Dark Gray
  var(--color-border) - Medium Gray
  var(--color-text-faint) - Light Gray
  var(--color-text) - Beige
  var(--color-accent) - Light Steel Blue
  var(--color-text) - Light Cyan
  #ffffff - White
 
 -->

<script lang="ts">
  import { onMount } from 'svelte';

  let { data } = $props();
  const authenticated = data.authenticated;

  let scrollY = $state(0);
  let showScrollHint = $state(false);
  const scrollHintVisible = $derived(showScrollHint && scrollY < 10);

  onMount(() => {
    const hintTimer = setTimeout(() => { showScrollHint = true; }, 3000);

    // Lazy-load the tile texture after first paint
    const tileImg = new Image();
    tileImg.src = '/images/tile.webp';
    tileImg.onload = () => document.documentElement.classList.add('tile-loaded');

    return () => {
      clearTimeout(hintTimer);
    };
  });

  const subtitle = data.yswsConfig.program.tagline;

  const eventPhotos = [
    { src: '/images/frames/75 teens at Campfire Flagship.webp', caption: '75 teens at Campfire Flagship' },
    { src: '/images/frames/Teen hackers at Assemble.webp', caption: 'Teen hackers at Assemble' },
    { src: '/images/frames/Winners of Parthenon Hackathon.webp', caption: 'Winners of Parthenon Hackathon' },
    { src: '/images/frames/Teens at a local game Jam.webp', caption: 'Teens at a local game Jam' },
    { src: '/images/frames/Hackathon on an island.webp', caption: 'Hackathon on an island' },
    { src: '/images/frames/hackers debugging together.webp', caption: 'Hackers debugging together' }
  ];
  let currentPhoto = $state(0);

  onMount(() => {
    const photoInterval = setInterval(() => {
      currentPhoto = (currentPhoto + 1) % eventPhotos.length;
    }, 3000);
    return () => clearInterval(photoInterval);
  });

  let topEmail = $state('');
  let bottomEmail = $state('');
  let topStatus = $state<'idle' | 'sending' | 'error'>('idle');
  let bottomStatus = $state<'idle' | 'sending' | 'error'>('idle');

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const topValid = $derived(emailRe.test(topEmail.trim()));
  const bottomValid = $derived(emailRe.test(bottomEmail.trim()));

  function submitRsvp(
    email: string,
    setStatus: (s: 'idle' | 'sending' | 'error') => void
  ) {
    const cleaned = email.trim().replace(/[<>"'&\\]/g, '');
    if (!cleaned || !emailRe.test(cleaned)) {
      setStatus('error');
      return;
    }
    setStatus('sending');

    // Navigate to server endpoint — it handles state, cookies, and redirect
    window.location.href = `/api/auth/login?email=${encodeURIComponent(cleaned)}`;
  }

  async function submitAuthenticatedRsvp(
    setStatus: (s: 'idle' | 'sending' | 'error') => void
  ) {
    setStatus('sending');
    try {
      const res = await fetch('/api/auth/rsvp', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/home';
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  const shopItems = [
    { src: '/images/shop/blahaj.webp', caption: 'Blåhaj Plush' },
    { src: '/images/shop/flight-stipend.webp', caption: 'Flight Stipend' },
    { src: '/images/shop/framework.webp', caption: 'Framework Laptop' },
    { src: '/images/shop/headphones.webp', caption: 'Headphones' },
    { src: '/images/shop/polaroid.webp', caption: 'Instax Camera' },
    { src: '/images/shop/printer.webp', caption: '3D Printer' },
    { src: '/images/shop/stickers.webp', caption: 'Sticker Pack' }
  ];

  // Wall of Fame — replace with real shipped projects from your own program.
  // These are placeholder examples; the originals were real participants'
  // names/projects/screenshots and don't belong in a generic template.
  const wallOfFameProjects: {
    title: string;
    author: string;
    description: string;
    link: string;
    image?: string;
    alt?: string;
  }[] = [
    {
      title: 'Example Project One',
      author: 'A Builder',
      description:
        'A short description of a real project someone shipped through this program.',
      link: '#'
    },
    {
      title: 'Example Project Two',
      author: 'Another Builder',
      description:
        'Swap these placeholder entries for your own community\'s shipped work.',
      link: '#'
    },
  ];

  // three copies so the belt can loop seamlessly by exactly one copy's width
  const fameBelt = [...wallOfFameProjects, ...wallOfFameProjects, ...wallOfFameProjects];
</script>


<svelte:window bind:scrollY />

<div class="scroll-hint" class:visible={scrollHintVisible}>
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 5v14M5 12l7 7 7-7" />
  </svg>
</div>

<div class="saturate-wrap" style="--sy:{scrollY}">
<div class="page-wrap">

<div class="top-bg">
<div class="hero-scroll-space">
<div class="hero-wrap">
  <a class="hc-flag" href="https://hackclub.com" target="_blank" rel="noreferrer" aria-label="Hack Club">
    <img src="/images/hack-club-flag.svg" alt="" decoding="async" />
  </a>
  {#snippet heroStrata()}
    <svg class="hero-strata" viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polygon points="0,50 1440,25 1440,80 0,80" fill="var(--color-bg)" />
    </svg>
  {/snippet}
  {#snippet heroPlaceholder()}
    <div class="hero-placeholder">
      <span>Insert your hero artwork here</span>
    </div>
  {/snippet}
  <div class="hero-mobile">
    {@render heroPlaceholder()}
    {@render heroStrata()}
  </div>
  <div class="hero-crop">
  <div class="hero-parallax">
    {@render heroPlaceholder()}
    {@render heroStrata()}
  </div>
  </div><!-- hero-crop -->
  <div class="hero-overlay">
    <div class="hero-copy">
      <h1 class="hero-title hero-title-text">{data.yswsConfig.program.name}</h1>
      <p class="hero-subtitle">{subtitle}</p>
    </div>
    <div class="hero-signup" aria-label="Sign Up">
      <p class="signup-note">&#10003; Signing up puts you on our email list, you can remove yourself <a href="https://email-tools.hackclub.com/" target="_blank" rel="noreferrer">here</a>.</p>
      {#if authenticated}
        <div class="signup-form">
          <button
            type="button"
            class="signup-btn valid"
            class:sending={topStatus === 'sending'}
            disabled={topStatus === 'sending'}
            onclick={() => submitAuthenticatedRsvp((s) => topStatus = s)}
          >
            {#if topStatus === 'sending'}Sending...{:else}Start{/if}
          </button>
        </div>
      {:else}
        <div class="signup-form">
          <input class="signup-input" type="email" placeholder="you@example.com" aria-label="Email" bind:value={topEmail} onkeydown={(e) => { if (e.key === 'Enter' && topValid && topStatus !== 'sending') submitRsvp(topEmail, (s) => topStatus = s); }} />
          <button
            type="button"
            class="signup-btn"
            class:valid={topValid}
            class:sending={topStatus === 'sending'}
            disabled={!topValid || topStatus === 'sending'}
            onclick={() => submitRsvp(topEmail, (s) => topStatus = s)}
          >
            {#if topStatus === 'sending'}Sending...{:else}Sign Up{/if}
          </button>
        </div>
      {/if}
      {#if topStatus === 'error'}<p class="signup-error">Something went wrong, please try again.</p>{/if}
    </div>
  </div>

</div>
</div>

<!-- spacer band the absolutely-positioned hero overlay (title + sign-up) hangs into -->
<section class="sticker-cta" aria-hidden="true"></section>

  </div>

<div class="rock-strata" style="background:var(--color-bg)" aria-hidden="true">
  <svg viewBox="0 0 1440 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="0,60 1440,30 1440,100 0,100" fill="var(--color-border)" />
    <line x1="0" y1="60" x2="1440" y2="30" stroke="var(--color-text-faint)" stroke-width="10" stroke-linecap="round" />
  </svg>
</div>

<section class="what-is-this" id="what-is-this">
  <h2>What is this?</h2>
  <p>
    {data.yswsConfig.program.name} is a <a href="https://hackclub.com" target="_blank" rel="noreferrer">Hack Club</a> program.
    {data.yswsConfig.program.description}
    Everything is totally free for teenagers who qualify by building and shipping a project — you'll
    earn {data.yswsConfig.currency.namePlural} for every technical project you ship.
  </p>
</section>

<div class="rock-strata" style="background:var(--color-border)" aria-hidden="true">
  <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="0,72 1440,36 1440,120 0,120" fill="var(--color-bg)" />
    <line x1="0" y1="72" x2="1440" y2="36" stroke="var(--color-text-faint)" stroke-width="10" stroke-linecap="round" />
  </svg>
</div>

<section class="wall-of-fame" id="wall-of-fame">
  <h2>Wall of Fame</h2>
  <p class="wall-of-fame-subtitle">
    Some of the best builds from our community :D
  </p>

  <div class="fame-carousel" role="region" aria-label="Wall of Fame projects">
    <div class="fame-belt">
      {#each fameBelt as project, i}
        {@const dup = i >= wallOfFameProjects.length}
        <article class="fame-item" aria-hidden={dup}>
          <div class="fame-shot">
            {#if project.image}
              <img src={project.image} alt={dup ? '' : project.alt ?? `Screenshot of ${project.title}`} loading="lazy" decoding="async" />
            {:else}
              <div class="fame-terminal" role="img" aria-label="Terminal session of {project.title}">
                <div class="term-bar"><span></span><span></span><span></span><p>{project.author.toLowerCase()}@{data.yswsConfig.program.shortName} ~ </p></div>
                <pre class="term-body"><span class="t-dim">$</span> stats
<span class="t-blue">┌─ {project.author} ──────────────────┐</span>
<span class="t-blue">│</span> hours logged       52.4h <span class="t-blue">│</span>
<span class="t-blue">│</span> {data.yswsConfig.currency.namePlural} earned          52 <span class="t-blue">│</span>
<span class="t-blue">│</span> projects shipped       1 <span class="t-blue">│</span>
<span class="t-blue">└──────────────────────────┘</span>
<span class="t-dim">$</span> devlog post "shipped it!"
<span class="t-ok">✓ devlog posted</span>
<span class="t-dim">$</span> <span class="term-cursor">█</span></pre>
              </div>
            {/if}
          </div>
          <div class="fame-plate">
            <h3>{project.title}</h3>
            <p class="fame-author">by {project.author}</p>
            <p class="fame-description">{project.description}</p>
            <a class="fame-link" href={project.link} target="_blank" rel="noreferrer" tabindex={dup ? -1 : undefined}>View project</a>
          </div>
        </article>
      {/each}
    </div>
  </div>
</section>

<div class="rock-strata" style="background:var(--color-bg)" aria-hidden="true">
  <svg viewBox="0 0 1440 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="0,60 1440,30 1440,100 0,100" fill="var(--color-bg)" />
    <line x1="0" y1="60" x2="1440" y2="30" stroke="var(--color-text-faint)" stroke-width="10" stroke-linecap="round" />
  </svg>
</div>

<div class="info-bg">
<section class="info-section">
  <div class="info-block eligibility">
    <h2>Am I Eligible?</h2>
    <p>
      If you are a teen, yes! The only criteria is being a teenager and building a real open-source
      software/hardware project for 40 hours. If you aren't sure, join the slack and ask!
    </p>
  </div>
  <div class="info-block">
    <h2>How do rewards work?</h2>
    <p>
      Every hour you code earns you 1 {data.yswsConfig.currency.nameSingular}, and you spend {data.yswsConfig.currency.namePlural} in the shop on rewards like laptops,
      tablets, headphones and merch. These will be delivered straight to you and require no money
      transfer! Everything is earned just by working on a project. You can see some of the prize
      selection here ↓
    </p>
  </div>
</section>
</div>

<div class="rock-strata" style="background:var(--color-bg)" aria-hidden="true">
  <svg viewBox="0 0 1440 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="0,60 1440,30 1440,100 0,100" fill="var(--color-bg)" />
    <line x1="0" y1="60" x2="1440" y2="30" stroke="var(--color-text-faint)" stroke-width="10" stroke-linecap="round" />
  </svg>
</div>

<div class="carousel-section" aria-label="Shop carousel preview">
  <h2 class="carousel-title">Earn Prizes!</h2>
  

  <div class="shop-carousel-bg">
    <div class="carousel-belt-bg">
      {#each [...shopItems, ...shopItems, ...shopItems, ...shopItems] as item}
        <article class="carousel-card bg-card">
          <img src={item.src} alt={item.caption} loading="lazy" decoding="async" />
          <p class="card-caption">{item.caption}</p>
        </article>
      {/each}
    </div>
  </div>

  <div class="shop-carousel">
    <div class="carousel-belt">
      {#each [...shopItems, ...shopItems, ...shopItems, ...shopItems] as item}
        <article class="carousel-card">
          <img src={item.src} alt={item.caption} loading="lazy" decoding="async" />
          <p class="card-caption">{item.caption}</p>
        </article>
      {/each}
    </div>
  </div>
</div>

<section class="hackclub-section">
  <div class="hackclub-inner">
    <div class="hackclub-text">
      <h2>Is Hack Club for real?</h2>
      <p>
        Yes - and we do this kind of stuff all the time! Hack Club is a non-profit organization and a
        community of 100k+ teenage makers. We run events online and in-person that reward people making
        open source projects. Thanks to our donors we are always running crazy events at no cost for
        teens. Previously we ran;
      </p>
    </div>
    <div class="hackclub-photos">
      <div class="photo-stack">
        <div class="photo-frame frame-back-2"></div>
        <div class="photo-frame frame-back-1"></div>
        <div class="photo-frame frame-front">
          <img src={eventPhotos[currentPhoto].src} alt={eventPhotos[currentPhoto].caption} loading="lazy" decoding="async" />
        </div>
      </div>
      <p class="photo-caption">{eventPhotos[currentPhoto].caption}</p>
    </div>
  </div>
  <p class="faq-link">More Questions? <a href="/FAQ">Read the FAQ</a></p>
</section>

</div>

<div class="rock-strata" style="background:var(--color-bg)" aria-hidden="true">
  <svg viewBox="0 0 1440 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="0,60 1440,30 1440,100 0,100" fill="var(--color-border)" />
    <line x1="0" y1="60" x2="1440" y2="30" stroke="var(--color-text-faint)" stroke-width="10" stroke-linecap="round" />
  </svg>
</div>

<section class="bottom-rsvp">
  <div class="bottom-rsvp-inner">
    <aside class="rsvp-box" aria-label="Sign Up">
      <svg class="rsvp-border" preserveAspectRatio="none"><rect x="1.5" y="1.5" width="calc(100% - 3px)" height="calc(100% - 3px)" rx="0" ry="0" /></svg>
      <h2>Sign Up / Log In</h2>
      {#if authenticated}
        <button
          type="button"
          class="rsvp-btn valid"
          class:sending={bottomStatus === 'sending'}
          disabled={bottomStatus === 'sending'}
          onclick={() => submitAuthenticatedRsvp((s) => bottomStatus = s)}
        >
          {#if bottomStatus === 'sending'}Sending...{:else}Start{/if}
        </button>
      {:else}
        <input type="email" placeholder="you@example.com" aria-label="Email" bind:value={bottomEmail} onkeydown={(e) => { if (e.key === 'Enter' && bottomValid && bottomStatus !== 'sending') submitRsvp(bottomEmail, (s) => bottomStatus = s); }} />
        <button
          type="button"
          class="rsvp-btn"
          class:valid={bottomValid}
          class:sending={bottomStatus === 'sending'}
          disabled={!bottomValid || bottomStatus === 'sending'}
          onclick={() => submitRsvp(bottomEmail, (s) => bottomStatus = s)}
        >
          {#if bottomStatus === 'sending'}Sending...{:else}Sign Up{/if}
        </button>
      {/if}
      {#if bottomStatus === 'error'}<p class="rsvp-error">Something went wrong, please try again.</p>{/if}
      <p class="updates">&#10003; Signing up puts you on our email list, you can remove yourself <a href="https://email-tools.hackclub.com/" target="_blank" rel="noreferrer">here</a>.</p>
      <p class="rsvp-note">
        We will ask for an address to ship physical rewards to, please use a real address or opt out since we send real hardware! You can always
        <a href="https://hackclub.com/privacy-and-terms/" target="_blank" rel="noreferrer">view our privacy policy</a>.
      </p>
    </aside>
    <div class="bottom-rsvp-text">
      <h2>What Qualifies?</h2>
      <p>Hack Club uses an in-house time tracking tool to measure and validate time spent on projects. <a href="https://hackatime.hackclub.com" target="_blank" rel="noreferrer">Hackatime</a> supports all major IDEs and text editors, but we also have <a href="https://lapse.hackclub.com" target="_blank" rel="noreferrer">Lapse</a> for recording timelapses of hardware projects.</p>
      <p>A qualifying project can be anything you want, but it must meet the following conditions:</p>
      <ul>
        <li>Open Source Forever</li>
        <li>Functional as laid out in project description</li>
        <li>Included ReadMe.md</li>
        <li>Accessible to any user without need of prior experience or setup</li>
        <li>Time spent recorded faithfully through <a href="https://hackatime.hackclub.com" target="_blank" rel="noreferrer">Hackatime</a></li>
      </ul>
    </div>
  </div>
</section>

<div class="rock-strata" style="background:var(--color-border)" aria-hidden="true">
  <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="0,72 1440,36 1440,120 0,120" fill="var(--color-bg)" />
    <line x1="0" y1="72" x2="1440" y2="36" stroke="var(--color-text-faint)" stroke-width="10" stroke-linecap="round" />
  </svg>
</div>

<footer class="site-footer">
  <div class="footer-content">
    <p class="footer-logo-text">{data.yswsConfig.program.name}</p>
    <p class="footer-heading">a project by <a href="https://hackclub.com" target="_blank" rel="noreferrer">Hack Club</a></p>
    <p class="footer-about">
      Hack Club is a 501(c)(3) nonprofit and network of 100k+ technical high schoolers. We believe
      you learn best by building, so we're creating community and providing grants so you can make
      awesome projects. At Hack Club, students aren't just learning - they're
      <span class="footer-shipping">shipping</span>.
    </p>
    <div class="footer-columns">
      <div class="footer-col">
        <h3>{data.yswsConfig.program.shortName}</h3>
        <a href="#what-is-this">what is this</a>
        <a href="#wall-of-fame">wall of fame</a>
        <a href="/FAQ">faq</a>
      </div>
      <div class="footer-col">
        <h3>resources</h3>
        <a href="https://hackclub.com/slack" target="_blank" rel="noreferrer">join our slack</a>
        <a href="https://hackatime.hackclub.com" target="_blank" rel="noreferrer">hackatime</a>
        <a href="https://github.com/hackclub" target="_blank" rel="noreferrer">github</a>
        <a href="https://forms.hackclub.com/bounty" target="_blank" rel="noreferrer">fulfillment bounty</a>
      </div>
      <div class="footer-col">
        <h3>hack club</h3>
        <a href="https://hackclub.com/philosophy/" target="_blank" rel="noreferrer">philosophy</a>
        <a href="https://hackclub.com/team/" target="_blank" rel="noreferrer">our team &amp; board</a>
        <a href="https://hackclub.com/brand/" target="_blank" rel="noreferrer">branding</a>
        <a href="https://hackclub.com/donate/" target="_blank" rel="noreferrer">donate</a>
        <a href="https://hackclub.com/privacy-and-terms/" target="_blank" rel="noreferrer">privacy &amp; terms</a>
      </div>
    </div>
  </div>
  <p class="footer-love">made with <a href="https://hackclub.com/philosophy/" target="_blank" rel="noopener noreferrer">&lt;3</a> by <a href="https://github.com/EDRipper" target="_blank" rel="noopener noreferrer">teens</a> for <a href="https://slack.hackclub.com" target="_blank" rel="noopener noreferrer">teens</a></p>
  <svg class="footer-cog gear-cw" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g fill="var(--color-text-faint)"><circle cx="50" cy="50" r="30"/>{#each Array(8) as _, t}<rect x="43" y="4" width="14" height="22" rx="3" transform="rotate({t*45} 50 50)"/>{/each}</g><circle cx="50" cy="50" r="12" fill="#000"/>
  </svg>
</footer>

</div><!-- saturate-wrap -->


<style>
.top-bg {
    background: var(--color-bg);
  }

  /* ── decorative pipes ───────────────────────────── */
  .page-wrap {
    position: relative;
    /* clip, not hidden — hidden would make this a scroll container and
       promote overflow-y to auto; clip just crops the rotated belts and
       decorative pipes without ever allowing horizontal scroll. */
    overflow-x: clip;
  }

  .hero-scroll-space {
    position: relative;
  }

  .hero-mobile {
    display: none;
    position: relative;
    line-height: 0;
    aspect-ratio: 16 / 10;
    overflow: hidden;
    background: #ffffff;
  }

  .hero-wrap {
    position: relative;
    line-height: 0;
    z-index: 1;
  }

  .scroll-hint {
    position: fixed;
    bottom: 40px;
    right: 40px;
    z-index: 100;
    opacity: 0;
    transition: opacity 0.6s ease;
    animation: bounce-arrow 1.5s ease-in-out infinite;
    pointer-events: none;
  }

  .scroll-hint.visible {
    opacity: 0.8;
  }

  @keyframes bounce-arrow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(8px); }
  }

  .hero-parallax {
    position: relative;
    width: 100%;
    aspect-ratio: 4800 / 2700;
    overflow: hidden;
    background: #ffffff;
  }

  /* explicit placeholder so it's obvious this is meant to be swapped, not
     an attempt at real art */
  .hero-placeholder {
    position: absolute;
    inset: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px dashed rgba(0, 0, 0, 0.35);
    border-radius: 8px;
  }

  .hero-placeholder span {
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: clamp(16px, 2.2vw, 26px);
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: 0.03em;
    color: rgba(0, 0, 0, 0.55);
    text-align: center;
    padding: 0 24px;
  }

  .hero-overlay {
    /* the wordmark's letter frame starts ~17% into the logo image (the gear
       sits to its left); the text rows below indent by the same amount so
       everything aligns to the letters, not the gear */
    --logo-w: clamp(280px, 30vw, 480px);
    --logo-indent: calc(var(--logo-w) * 0.17);
    position: absolute;
    /* hangs below the hero so the whole block sits on the brown ground */
    inset: auto clamp(48px, 7vw, 160px) -120px;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    gap: clamp(32px, 5vw, 80px);
    /* above the strata svg (z 12), which would otherwise paint over the top
       of the logo where it overlaps the rock band */
    z-index: 13;
    /* transparent overlay lets clicks fall through to the parallax; the
       sign-up box re-enables events on itself */
    pointer-events: none;
    line-height: normal;
  }

  .hero-copy {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
    min-width: 0;
  }

  /* bare sign-up: email + button docked to the right of the wordmark */
  .hero-signup {
    pointer-events: auto;
    position: relative;
    flex: 0 0 clamp(320px, 32vw, 440px);
  }

  /* the input and button are each tilted a touch and the button laps over the
     input's edge, like two parts pinned on by hand */
  .signup-form {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 6px 4px;
  }

  .signup-input {
    flex: 1 1 auto;
    min-width: 0;
    position: relative;
    z-index: 1;
    box-sizing: border-box;
    padding: 13px 12px;
    border: 2px solid var(--color-bg);
    background: var(--color-text);
    color: var(--color-bg);
    font-size: 18px;
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    cursor: text;
    rotate: -2deg;
  }

  .signup-input::placeholder {
    color: var(--color-border);
  }

  /* chunky "hardware key" that presses down on hover/click */
  .signup-btn {
    flex: 0 0 auto;
    min-width: 150px;
    position: relative;
    z-index: 2;
    margin-left: -18px;
    rotate: 2.5deg;
    translate: 0 10px;
    border: 2px solid var(--color-bg);
    background: #AD9E83;
    color: #4C483D;
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: 22px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 12px 18px;
    cursor: not-allowed;
    box-shadow: 4px 4px 0 var(--color-bg);
    transition: transform 0.12s ease-out, box-shadow 0.12s ease-out, background 0.2s;
  }

  /* enabled: the disabled palette inverted, dark fill with taupe text;
     taupe border so the dark key stands out against the ground */
  .signup-btn.valid {
    background: #4C483D;
    color: #AD9E83;
    border-color: #AD9E83;
    cursor: pointer;
  }

  .signup-btn.valid:hover {
    background: #5a5648;
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 var(--color-bg);
  }

  .signup-btn.valid:active {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 var(--color-bg);
  }

  .signup-btn.sending {
    background: var(--color-accent);
    color: #f3e9d6;
    cursor: wait;
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 var(--color-bg);
  }

  /* floats above the input row, fades in only while the box holds focus;
     :focus-within keeps the "remove yourself here" link reachable */
  .signup-note {
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    margin: 0 0 10px;
    padding: 10px 12px;
    background: rgba(0, 0, 0, 0.32);
    border: 1px solid rgba(230, 244, 254, 0.15);
    color: var(--color-text);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: 14px;
    line-height: 1.4;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.22s ease-out, transform 0.22s ease-out;
    pointer-events: none;
  }

  .hero-signup:focus-within .signup-note {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .signup-note a,
  .signup-note a:visited {
    color: var(--color-accent);
    text-decoration: underline;
  }

  .signup-error {
    margin: 8px 0 0;
    color: #000000;
    font-size: 14px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  .hero-subtitle {
    margin: 4px 0 0 var(--logo-indent);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: clamp(19px, 2vw, 28px);
    color: #ffffff;
    letter-spacing: 0.03em;
    line-height: 1.4;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.55), 0 2px 10px rgba(0, 0, 0, 0.4);
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .hero-title {
    margin: 0;
    flex-shrink: 0;
    line-height: 0;
  }

  .hero-title-text {
    display: block;
    margin: 0 0 0 var(--logo-indent);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: clamp(32px, 5vw, 72px);
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: 0.02em;
    color: #ffffff;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.4);
  }

  /* Whenever the 16:9 hero leaves too little room for the text block, the
     text sinks below the fold. Anchor the artwork to the bottom and crop it
     from the top ("move the background up") so the beach, the text on the
     brown rock, and breathing room below it all fit in the first screenful.
     Applies wherever the desktop parallax hero renders — both the bottom-
     pinned overlay (>1400px) and the in-flow overlay (901–1400px), which
     needs a similar ~260px below the artwork. */
  @media (min-width: 901px) {
    .hero-crop {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      max-height: calc(100vh - 260px);
      max-height: calc(100svh - 260px);
      overflow: clip;
    }

    .hero-crop .hero-parallax {
      flex: 0 0 auto;
    }
  }

  /* Between 901–1400px the smaller viewport can spare less room below the
     artwork; the bottom-pinned text block overlaps the art more instead. */
  @media (min-width: 901px) and (max-width: 1400px) {
    .hero-crop {
      max-height: calc(100vh - 200px);
      max-height: calc(100svh - 200px);
    }
  }

  /* ── hack club flag ─────────────────────────────── */
  .hc-flag {
    position: absolute;
    top: clamp(16px, 1.8vw, 30px);
    left: clamp(20px, 4vw, 64px);
    z-index: 20;
    width: clamp(96px, 9vw, 150px);
    line-height: 0;
    transform-origin: center;
    transition: transform 0.3s ease;
  }

  .hc-flag:hover,
  .hc-flag:focus-visible {
    transform: scale(1.09);
  }

  .hc-flag img {
    display: block;
    width: 100%;
    height: auto;
    filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.3));
  }

  .hero-strata {
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 100%;
    height: 80px;
    display: block;
    z-index: 12;
  }

  :global(html) {
    scroll-behavior: smooth;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    background-color: var(--color-bg);
  }

  .saturate-wrap {
    --sy: 0;
    filter: saturate(1.5);
  }

  .what-is-this,
  .info-bg,
  .hackclub-section,
  .bottom-rsvp {
    content-visibility: auto;
    contain-intrinsic-size: auto 500px;
  }

  .top-bg,
  .what-is-this,
  .info-bg,
  .carousel-section,
  .hackclub-section,
  .bottom-rsvp,
  .rock-strata,
  .site-footer {
    position: relative;
    margin-top: -1px;
  }

  .sticker-cta::after,
  .what-is-this::after,
  .wall-of-fame::after,
  .info-bg::after,
  .carousel-section::after,
  .hackclub-section::after,
  .bottom-rsvp::after,
  .rock-strata::after,
  .site-footer::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.12;
    mix-blend-mode: overlay;
    background-size: 512px 512px;
    background-repeat: repeat;
  }

  .sticker-cta::after {
    left: 50%;
    right: auto;
    width: 100vw;
    transform: translateX(-50%);
    -webkit-mask-image: linear-gradient(to bottom, transparent, black 200px);
    mask-image: linear-gradient(to bottom, transparent, black 200px);
  }

  :global(.tile-loaded) .sticker-cta::after,
  :global(.tile-loaded) .what-is-this::after,
  :global(.tile-loaded) .wall-of-fame::after,
  :global(.tile-loaded) .info-bg::after,
  :global(.tile-loaded) .carousel-section::after,
  :global(.tile-loaded) .hackclub-section::after,
  :global(.tile-loaded) .bottom-rsvp::after,
  :global(.tile-loaded) .rock-strata::after,
  :global(.tile-loaded) .site-footer::after {
    background-image: url('/images/tile.webp');
  }

  /* ── rock strata ────────────────────────────────── */
  .rock-strata {
    display: block;
    width: 100%;
    line-height: 0;
    margin: -4px 0;
    padding: 0;
    position: relative;
    z-index: 1;
  }

  .rock-strata svg {
    display: block;
    width: 100%;
    height: 100px;
  }

  /* ── sign-up CTA ─────────────────────────────────── */
  .sticker-cta {
    position: relative;
    display: flex;
    align-items: stretch;
    justify-content: center;
    gap: 64px;
    padding: 240px 72px 96px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .gear-cw {
    transform: rotate(calc(var(--sy) * 0.1deg));
  }

  .footer-cog.gear-cw {
    transform: rotate(calc(var(--sy) * 0.1deg));
  }

  /* ── wall of fame ───────────────────────────────── */
  .wall-of-fame {
    background: var(--color-bg);
    padding: 88px 48px 108px;
    color: var(--color-text);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    position: relative;
    z-index: 1;
  }

  .wall-of-fame h2 {
    margin: 0 auto 18px;
    max-width: 1100px;
    color: var(--color-text);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: clamp(28px, 3vw, 52px);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55);
  }

  .wall-of-fame-subtitle {
    max-width: 1100px;
    margin: 0 auto 44px;
    color: var(--color-text);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: clamp(18px, 1.7vw, 24px);
    line-height: 1.6;
    letter-spacing: 0.02em;
    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55);
  }

  /* full-bleed auto-scrolling belt, same idiom as the shop carousel */
  .fame-carousel {
    position: relative;
    z-index: 1;
    margin: 12px -48px 0;
    overflow: hidden;
    overflow: clip;
    /* breathing room for the crooked frames and the overhanging plates */
    padding: 30px 0 56px;
  }

  .fame-belt {
    display: flex;
    width: max-content;
    animation: fame-scroll 60s linear infinite;
  }

  /* pausable so "View project" is actually clickable / tabbable */
  .fame-carousel:hover .fame-belt,
  .fame-carousel:focus-within .fame-belt {
    animation-play-state: paused;
  }

  @keyframes fame-scroll {
    from { transform: translateX(0); }
    to { transform: translateX(calc(-100% / 3)); }
  }

  @media (prefers-reduced-motion: reduce) {
    .fame-belt {
      animation: none;
    }

    .fame-carousel {
      overflow-x: auto;
    }
  }

  .fame-item {
    position: relative;
    flex-shrink: 0;
    width: min(560px, 78vw);
    /* margin instead of flex gap so the belt is exactly 3 copies wide and
       the -100%/3 loop point lands seamlessly */
    margin-right: 64px;
  }

  .fame-item:nth-child(odd) .fame-shot {
    transform: rotate(-1.1deg);
  }

  .fame-item:nth-child(even) .fame-shot {
    transform: rotate(0.9deg);
  }

  .fame-shot {
    position: relative;
    aspect-ratio: 16 / 10;
    background: var(--color-bg);
    border: 3px solid #ffffff;
    box-shadow: 8px 10px 0 rgba(35, 34, 31, 0.55);
    overflow: clip;
    container-type: inline-size;
  }

  .fame-shot img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* terminal mock for CLI projects with no screenshot */
  .fame-terminal {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
  }

  .term-bar {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 10px 14px;
    background: var(--color-bg);
    border-bottom: 1px solid var(--color-bg);
  }

  .term-bar span {
    width: 11px;
    height: 11px;
    border-radius: 999px;
    background: var(--color-text-faint);
  }

  .term-bar span:first-child { background: var(--color-danger); }
  .term-bar span:nth-child(2) { background: var(--color-text); }
  .term-bar span:nth-child(3) { background: var(--color-accent); }

  .term-bar p {
    margin: 0 0 0 8px;
    font-size: 13px;
    color: var(--color-text);
    letter-spacing: 0.03em;
  }

  .term-body {
    flex: 1;
    margin: 0;
    padding: 3.4cqi 4cqi;
    font-size: clamp(12px, 2.6cqi, 19px);
    line-height: 1.7;
    overflow: clip;
  }

  .t-dim { color: var(--color-text-faint); }
  .t-blue { color: var(--color-accent); }
  .t-ok { color: #a3b579; }

  .term-cursor {
    animation: blink 0.7s step-end infinite;
  }

  /* caption plate pinned over the screenshot's lower-right corner */
  .fame-plate {
    position: absolute;
    right: -18px;
    bottom: -30px;
    z-index: 2;
    width: min(60%, 290px);
    box-sizing: border-box;
    background: rgba(240, 235, 229, 0.97);
    border: 1px solid var(--color-bg);
    box-shadow: 5px 5px 0 rgba(75, 72, 64, 0.95);
    padding: 13px 16px 14px;
    color: var(--color-bg);
    transform: rotate(-2.4deg);
  }

  .fame-item:nth-child(even) .fame-plate {
    transform: rotate(1.8deg);
  }

  .fame-plate h3 {
    margin: 0;
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    font-size: 20px;
    line-height: 1.1;
    color: #000000;
  }

  .fame-author {
    margin: 4px 0 0;
    font-size: 16px;
    color: var(--color-border);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
  }

  .fame-description {
    margin: 8px 0 0;
    font-size: 17px;
    line-height: 1.35;
    letter-spacing: 0.01em;
    color: var(--color-bg);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
  }

  .fame-link {
    display: inline-block;
    margin-top: 12px;
    padding: 8px 12px;
    border: 1px solid var(--color-bg);
    background: var(--color-accent);
    color: #ffffff;
    font-size: 14px;
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-weight: 700;
    text-decoration: none;
    box-shadow: 3px 3px 0 rgba(75, 72, 64, 0.95);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .fame-link:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0 rgba(75, 72, 64, 0.95);
  }

  /* ── what-is-this ───────────────────────────────── */
  .what-is-this {
    padding: 80px 48px 72px;
    color: var(--color-text);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    background: var(--color-border);
  }


  .what-is-this h2 {
    max-width: 1100px;
    margin: 0 auto 20px;
    color: var(--color-text);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: clamp(28px, 3vw, 42px);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55);
  }

  .what-is-this p {
    max-width: 1100px;
    margin: 0 auto;
    color: var(--color-text);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: clamp(20px, 2vw, 26px);
    line-height: 1.55;
    letter-spacing: 0.02em;
    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55);
  }

  .what-is-this a,
  .what-is-this a:visited {
    color: var(--color-accent);
    text-decoration-color: var(--color-accent);
  }

  /* ── info sections ──────────────────────────────── */
  .info-bg {
    background: var(--color-bg);
  }

  .info-section {
    max-width: 1100px;
    margin: 0 auto;
    padding: 72px 64px 96px;
    display: flex;
    gap: 72px;
  }

  .info-block {
    flex: 1;
    color: var(--color-text);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
  }

  .info-block h2 {
    margin: 0 0 24px;
    color: var(--color-text);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: clamp(22px, 2.4vw, 34px);
    letter-spacing: 0.04em;
    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55);
    text-transform: uppercase;
  }

  .info-block p {
    margin: 0;
    color: var(--color-text);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: clamp(19px, 1.8vw, 24px);
    line-height: 1.55;
    letter-spacing: 0.02em;
    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55);
  }

  .info-block.eligibility p {
    color: var(--color-accent);
  }

  /* ── layout ─────────────────────────────────────── */
  .rsvp-box {
    position: relative;
    z-index: 1;
    flex: 0 0 380px;
    box-sizing: border-box;
    min-height: 420px;
    padding: 24px;
    background: var(--color-text-faint);
    border: none;
    color: var(--color-bg);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  }

  .rsvp-border {
    position: absolute;
    inset: -3px;
    width: calc(100% + 6px);
    height: calc(100% + 6px);
    pointer-events: none;
    overflow: visible;
  }

  .rsvp-border rect {
    fill: none;
    stroke: #000000;
    stroke-width: 3;
    stroke-dasharray: 20 12;
    animation: march 30s linear infinite;
    animation-play-state: paused;
  }

  .rsvp-box:hover .rsvp-border rect {
    animation-play-state: running;
  }

  @keyframes march {
    to { stroke-dashoffset: -1000; }
  }

  .rsvp-box h2 {
    margin: 0 0 16px;
    color: var(--color-bg);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: 32px;
    line-height: 1;
    letter-spacing: 0.04em;
  }

  .rsvp-box input[type='email'] {
    width: 100%;
    box-sizing: border-box;
    margin: 0 0 14px;
    padding: 14px 12px;
    border: 1px solid var(--color-text);
    background: var(--color-text);
    color: var(--color-bg);
    font-size: 18px;
    font-family: inherit;
    cursor: text;
  }

  .rsvp-box input[type='email']::placeholder {
    color: var(--color-border);
  }

  /* chunky "hardware" button: a hard offset shadow reads as a physical key
     that presses down on hover/click — matches the hand-built mechanical theme */
  .rsvp-box button {
    width: 100%;
    border: 2px solid var(--color-bg);
    background: #a89f8d;
    color: var(--color-bg);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: 26px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 12px;
    cursor: not-allowed;
    box-shadow: 4px 4px 0 var(--color-bg);
    transition: transform 0.12s ease-out, box-shadow 0.12s ease-out, background 0.2s;
  }

  .rsvp-box button.valid {
    background: #b5443f;
    color: #f3e9d6;
    cursor: pointer;
  }

  .rsvp-box button.valid:hover {
    background: #c15049;
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 var(--color-bg);
  }

  .rsvp-box button.valid:active {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 var(--color-bg);
  }

  .rsvp-box button.sending {
    background: var(--color-accent);
    color: #f3e9d6;
    cursor: wait;
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 var(--color-bg);
  }

  .rsvp-error {
    margin: 8px 0 0;
    color: #000000;
    font-size: 14px;
  }

  /* only surfaces while the sign-up box holds focus; :focus-within keeps the
     "remove yourself here" link reachable (focusing it counts as within) */
  .updates {
    display: none;
    margin: 14px 0 0;
    color: var(--color-text);
    font-size: 14px;
    line-height: 1.4;
  }

  .rsvp-box:focus-within .updates {
    display: block;
  }

  .updates a,
  .updates a:visited {
    color: var(--color-accent);
    text-decoration: underline;
  }

  .rsvp-note {
    margin: 20px 0 0;
    color: var(--color-text);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: 14px;
    line-height: 1.35;
    background: rgba(0, 0, 0, 0.25);
    padding: 12px 14px;
    border: 1px solid rgba(230, 244, 254, 0.15);
  }

  .rsvp-note a,
  .rsvp-note a:visited,
  .rsvp-note a:hover,
  .rsvp-note a:active {
    color: var(--color-accent);
    text-decoration-color: var(--color-accent);
  }

  .carousel-section {
    position: relative;
    z-index: 2;
    /* No overflow property here on purpose: the belt wrappers clip themselves
       (overflow: clip below) and .page-wrap clips the page horizontally.
       Any overflow value on this section either creates a scroll container or
       (Safari, with mixed clip/visible axes) clips the rotated belts to a
       plain rectangle instead of letting them bleed over the strata. */
    padding: 100px 0 100px;
    display: grid;
    grid-template: 1fr / 1fr;
    background: var(--color-bg);
  }

  .carousel-title {
    position: absolute;
    left: 55%;
    top: 10%;
    transform: translate(-50%, -50%) rotate(-12deg);
    z-index: 3;
    margin: 0;
    color: var(--color-text);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: clamp(32px, 4vw, 56px);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .carousel-subtitle {
    position: absolute;
    left: 55%;
    top: 18%;
    transform: translate(-50%, -50%) rotate(-12deg);
    z-index: 3;
    margin: 0;
    color: var(--color-text);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: clamp(14px, 1.6vw, 20px);
    letter-spacing: 0.03em;
  }

  .shop-carousel,
  .shop-carousel-bg {
    grid-area: 1 / 1;
    /* clip, not hidden: hidden makes these scroll containers, so find-in-page,
       drag-selection, or programmatic scrollIntoView can shove the belts
       sideways with no way back. clip can never scroll. min-width: 0 is
       required with clip — without a scroll container the grid item's
       automatic minimum size would stretch the track to the belt's width. */
    overflow: hidden;
    overflow: clip;
    min-width: 0;
    width: calc(100% + 28vw);
    margin-left: -14vw;
    margin-right: -14vw;
  }

  .shop-carousel {
    transform: rotate(-12deg);
    padding: 24px 0 32px;
    z-index: 1;
    align-self: center;
  }

  .shop-carousel-bg {
    transform: rotate(12deg);
    padding: 30px 0 20px;
    z-index: 0;
    align-self: center;
  }

  .carousel-belt,
  .carousel-belt-bg {
    display: flex;
    gap: 36px;
    width: max-content;
  }

  .carousel-belt {
    animation: shop-scroll-left 36s linear infinite;
  }

  .carousel-belt-bg {
    animation: shop-scroll-right 46s linear infinite;
  }

  .carousel-section:has(.shop-carousel:hover) .carousel-belt,
  .carousel-section:has(.shop-carousel:hover) .carousel-belt-bg,
  .carousel-section:has(.shop-carousel-bg:hover) .carousel-belt,
  .carousel-section:has(.shop-carousel-bg:hover) .carousel-belt-bg {
    animation-play-state: paused;
  }

  .carousel-card {
    width: 250px;
    flex-shrink: 0;
    background: var(--color-text);
    border: 1px solid var(--color-bg);
    box-shadow: 6px 6px 0 var(--color-bg);
    padding: 12px 12px 10px;
    filter: saturate(0.667);
  }

  .bg-card {
    width: 170px;
    background: var(--color-border);
    border-color: var(--color-bg);
    box-shadow: 3px 3px 0 var(--color-bg);
    padding: 10px 10px 8px;
  }

  .bg-card .card-caption {
    color: var(--color-text);
    font-size: 14px;
  }

  .carousel-card img {
    width: 100%;
    aspect-ratio: 4 / 5;
    height: auto;
    object-fit: contain;
    border: 1px solid var(--color-border);
    background: var(--color-text);
    display: block;
  }

  .card-caption {
    margin: 8px 0 0;
    color: var(--color-bg);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: 16px;
    line-height: 1.25;
    text-align: center;
  }

  @keyframes shop-scroll-left {
    from { transform: translateX(0); }
    to { transform: translateX(-25%); }
  }

  @keyframes shop-scroll-right {
    from { transform: translateX(-25%); }
    to { transform: translateX(0); }
  }

  @media (max-width: 1400px) {
    .sticker-cta {
      gap: 32px;
      /* the hero text block hangs 120px into this section */
      padding: 176px 40px 80px;
    }

    .rsvp-box {
      flex: 0 0 360px;
    }

    .info-section {
      flex-direction: column;
      gap: 56px;
      padding: 60px 48px 72px;
    }

    .carousel-section {
      padding: 24px 0 90px;
    }

    .carousel-title {
      display: none;
    }

    .shop-carousel,
    .shop-carousel-bg {
      width: calc(100% + 44vw);
      margin-left: -22vw;
      margin-right: -22vw;
    }

    .carousel-card {
      width: 120px;
      padding: 6px 6px 5px;
    }

    .bg-card {
      width: 90px;
      padding: 5px 5px 4px;
    }

    .carousel-belt,
    .carousel-belt-bg {
      gap: 16px;
    }

    .card-caption {
      font-size: 11px;
    }
  }

  @media (max-width: 900px) {
    /* the hero overlay flows inline here, so the desktop spacer band the
       absolute overlay hung into is no longer needed */
    .sticker-cta {
      display: none;
    }

    .rsvp-box {
      flex: 0 1 auto;
      align-self: center;
      max-width: 420px;
      width: 100%;
    }

    .bottom-rsvp-inner {
      flex-direction: column;
    }

    .bottom-rsvp-text {
      flex: 0 1 auto;
    }
  }

  /* ── footer ──────────────────────────────────────── */
  .site-footer {
    position: relative;
    overflow: hidden;
    background: var(--color-bg);
    padding: 64px clamp(48px, 8vw, 160px) 44px;
    color: var(--color-text-faint);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
  }

  .footer-content {
    max-width: 1100px;
    margin: 0 auto;
    text-align: left;
  }

  .footer-logo-text {
    display: block;
    margin: 0 0 14px;
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: clamp(22px, 2.4vw, 30px);
    font-weight: 700;
    letter-spacing: 0.03em;
    color: var(--color-text);
  }

  .footer-heading {
    margin: 0 0 22px;
    font-size: clamp(22px, 2vw, 28px);
    letter-spacing: 0.03em;
    color: var(--color-text);
  }

  .footer-heading a,
  .footer-heading a:visited {
    color: var(--color-accent);
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  .footer-heading a:hover {
    color: var(--color-text);
  }

  .footer-about {
    margin: 0;
    max-width: 62ch;
    font-size: clamp(16px, 1.3vw, 19px);
    line-height: 1.65;
    letter-spacing: 0.02em;
    color: var(--color-text);
  }

  .footer-shipping {
    color: var(--color-danger);
  }

  .footer-columns {
    display: flex;
    flex-wrap: wrap;
    gap: 32px 110px;
    margin-top: 52px;
  }

  .footer-col {
    min-width: 150px;
  }

  .footer-col h3 {
    margin: 0 0 16px;
    font-family: inherit;
    font-size: 20px;
    font-weight: normal;
    letter-spacing: 0.04em;
    color: var(--color-danger);
  }

  .footer-col a,
  .footer-col a:visited {
    display: block;
    margin-bottom: 12px;
    color: var(--color-text-faint);
    font-size: 17px;
    letter-spacing: 0.03em;
    text-decoration: none;
    transition: color 200ms ease;
  }

  .footer-col a:hover {
    color: var(--color-text);
  }

  .footer-love {
    margin: 32px 0 0;
    font-size: 18px;
    color: var(--color-text-faint);
    text-align: left;
  }

  .footer-love a,
  .footer-love a:visited,
  .footer-love a:hover,
  .footer-love a:active {
    color: var(--color-accent);
  }

  .footer-cog {
    position: absolute;
    bottom: -60px;
    right: -60px;
    width: 200px;
    height: 200px;
    will-change: transform;
  }

  /* ── bottom RSVP ─────────────────────────────────── */
  /* ── hack club section ────────────────────────────── */
  .hackclub-section {
    background: var(--color-bg);
    padding: 96px 48px 0;
  }

  .hackclub-inner {
    display: flex;
    gap: 48px;
    max-width: 1196px;
    margin: 0 auto;
  }

  .faq-link {
    width: 100%;
    text-align: center;
    color: var(--color-text);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: 36px;
    letter-spacing: 0.04em;
    padding: 48px 0;
    margin: 0;
    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55);
  }

  .faq-link a,
  .faq-link a:visited {
    color: var(--color-accent);
  }

  .faq-link a:hover {
    color: var(--color-text);
  }

  .hackclub-text {
    flex: 1;
    color: var(--color-text);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
  }

  .hackclub-text h2 {
    margin: 35px 0 16px;
    color: var(--color-text);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: clamp(22px, 2.4vw, 34px);
    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .hackclub-text p {
    margin: 0;
    color: var(--color-text);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: clamp(19px, 1.8vw, 24px);
    line-height: 1.55;
    letter-spacing: 0.02em;
    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55);
  }

  .hackclub-photos {
    flex: 0 0 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .photo-stack {
    position: relative;
    width: 360px;
    height: 280px;
  }

  .photo-frame {
    position: absolute;
    width: 360px;
    height: 260px;
    background: var(--color-border);
    border: 3px solid var(--color-bg);
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.3);
  }

  .frame-back-2 {
    top: 0;
    left: 0;
    transform: rotate(-4deg);
    background: var(--color-border);
  }

  .frame-back-1 {
    top: 4px;
    left: 6px;
    transform: rotate(2deg);
    background: var(--color-border);
  }

  .frame-front {
    top: 8px;
    left: 3px;
    transform: rotate(-1deg);
    background: var(--color-text);
    overflow: hidden;
  }

  .frame-front img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 400ms ease;
  }

  .photo-caption {
    margin: 16px 0 0;
    text-align: center;
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: 15px;
    color: var(--color-text);
    letter-spacing: 0.03em;
    font-style: italic;
  }

  /* ── bottom RSVP ─────────────────────────────────── */
  .bottom-rsvp {
    background: var(--color-border);
    position: relative;
    overflow: hidden;
    padding: 56px 48px 64px;
  }

  .bottom-rsvp-inner {
    display: flex;
    gap: 48px;
    max-width: 1100px;
    margin: 0 auto;
  }

  .bottom-rsvp-text {
    flex: 1;
    color: var(--color-text);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
  }

  .bottom-rsvp-text h2 {
    margin: 0 0 16px;
    color: var(--color-text);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: clamp(22px, 2.4vw, 34px);
    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .bottom-rsvp-text p {
    margin: 0 0 12px;
    color: var(--color-text);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: clamp(15px, 1.4vw, 19px);
    line-height: 1.55;
    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55);
  }

  .bottom-rsvp-text ul {
    margin: 0;
    padding-left: 20px;
    color: var(--color-text);
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: clamp(15px, 1.4vw, 19px);
    line-height: 1.75;
    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.55);
  }

  .bottom-rsvp-text a,
  .bottom-rsvp-text a:visited {
    color: var(--color-accent);
    text-decoration: underline;
  }

  .bottom-rsvp-text a:hover {
    color: var(--color-text);
  }

  .bottom-rsvp .rsvp-box {
    flex: 0 0 380px;
    align-self: flex-start;
    z-index: 1;
  }

  @media (max-width: 900px) {
    .sticker-cta::after,
    .what-is-this::after,
    .wall-of-fame::after,
    .info-bg::after,
    .sticker-bg::after,
    .carousel-section::after,
    .hackclub-section::after,
    .bottom-rsvp::after,
    .rock-strata::after,
    .site-footer::after {
      mix-blend-mode: normal;
      opacity: 0.05;
    }

    .hero-mobile {
      display: block;
    }

    .hero-scroll-space {
      height: auto;
    }

    .hero-wrap {
      position: relative;
    }

    .hero-parallax {
      display: none;
    }

    /* mobile: the overlay flows below the static hero image. Overriding
       --logo-w (not the img width) keeps the text indent aligned with the
       wordmark's letter frame. */
    .hero-overlay {
      --logo-w: min(72vw, 420px);
      position: relative;
      inset: auto;
      flex-direction: column;
      align-items: stretch;
      padding: 18px 24px 48px;
      gap: 20px;
    }

    .hero-signup {
      flex: 0 1 auto;
      align-self: center;
      width: 100%;
      max-width: 420px;
    }

    /* no empty hero art to float over here, so the notice sits in flow above
       the input (its space reserved) and just fades — never over the tagline */
    .signup-note {
      position: static;
      margin: 0 0 12px;
      transform: none;
    }

    .scroll-hint {
      display: none;
    }

    .hackclub-section {
      padding: 40px 20px 0;
    }

    .hackclub-inner {
      flex-direction: column;
    }

    .hackclub-photos {
      flex: 0 0 auto;
    }

    .photo-stack {
      width: 300px;
      height: 240px;
    }

    .photo-frame {
      width: 300px;
      height: 220px;
    }

    .bottom-rsvp {
      padding: 40px 20px 48px;
    }

    .footer-cog {
      width: 130px;
      height: 130px;
      bottom: -40px;
      right: -40px;
    }

    .footer-love {
      padding-right: 60px;
    }

    .rsvp-box {
      max-width: 360px;
    }

    /* clean stacked layout: drop the overhanging plate/rotation gimmick,
       card and caption just flow top to bottom */
    .wall-of-fame {
      padding: 56px 20px 72px;
    }

    .fame-carousel {
      margin: 12px -20px 0;
      padding: 16px 0 24px;
    }

    .fame-item {
      width: min(340px, 82vw);
      margin-right: 20px;
    }

    .fame-item:nth-child(odd) .fame-shot,
    .fame-item:nth-child(even) .fame-shot {
      transform: none;
    }

    .fame-shot {
      box-shadow: none;
    }

    .fame-plate {
      position: static;
      width: 100%;
      margin-top: 10px;
      box-shadow: none;
      transform: none;
    }

    .fame-item:nth-child(even) .fame-plate {
      transform: none;
    }
  }

</style>
