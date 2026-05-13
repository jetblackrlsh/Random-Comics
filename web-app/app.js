const state = {
  catalog: null,
  comics: [],
  series: [],
  selectedSlug: null,
  selectedSeriesSlug: null,
  query: "",
  view: "home",
  hasComicRoute: false,
  hasSeriesRoute: false,
};

const els = {
  readerView: document.querySelector("#readerView"),
  aboutView: document.querySelector("#aboutView"),
  comicList: document.querySelector("#comicList"),
  comicSearch: document.querySelector("#comicSearch"),
  earliestButton: document.querySelector("#earliestButton"),
  latestButton: document.querySelector("#latestButton"),
  comicDate: document.querySelector("#comicDate"),
  comicTitle: document.querySelector("#comicTitle"),
  comicSummary: document.querySelector("#comicSummary"),
  pageStrip: document.querySelector("#pageStrip"),
  downloadButton: document.querySelector("#downloadButton"),
  shareButton: document.querySelector("#shareButton"),
  navLinks: document.querySelectorAll("[data-route]"),
};

function formatDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function currentComic() {
  return state.comics.find((comic) => comic.slug === state.selectedSlug) || state.comics.at(-1) || null;
}

function currentSeries() {
  return state.series.find((series) => series.slug === state.selectedSeriesSlug) || null;
}

function routeFromLocation() {
  const initialRoute = document.body.dataset.initialRoute;
  if (initialRoute?.startsWith("comic:")) return { view: "home", slug: initialRoute.slice(6) };
  if (initialRoute?.startsWith("series:")) return { view: "home", slug: null, seriesSlug: initialRoute.slice(7) };
  if (initialRoute === "about") return { view: "about", slug: null };

  const path = window.location.pathname.replace(/\/+$/, "");
  const comicMatch = path.match(/\/comics\/([^/]+)$/);
  if (comicMatch) return { view: "home", slug: decodeURIComponent(comicMatch[1]) };
  const seriesMatch = path.match(/\/series\/([^/]+)$/);
  if (seriesMatch) return { view: "home", slug: null, seriesSlug: decodeURIComponent(seriesMatch[1]) };
  if (/\/about$/.test(path)) return { view: "about", slug: null };

  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return { view: "home", slug: params.get("comic"), seriesSlug: params.get("series") };
}

function appRootPath() {
  const path = window.location.pathname;
  const marker = "/web-app/";
  const markerIndex = path.indexOf(marker);
  if (markerIndex >= 0) return `${path.slice(0, markerIndex)}${marker}`;
  return path.replace(/(?:(?:comics|series)\/[^/]+\/?|about\/?)$/, "");
}

function comicUrl(comic) {
  return new URL(`comics/${comic.slug}/`, `${window.location.origin}${appRootPath()}`).href;
}

function seriesUrl(series) {
  return new URL(`series/${series.slug}/`, `${window.location.origin}${appRootPath()}`).href;
}

function homeUrl() {
  return new URL("./", `${window.location.origin}${appRootPath()}`).href;
}

function aboutUrl() {
  return new URL("about/", `${window.location.origin}${appRootPath()}`).href;
}

function updateUrl({ replace = false } = {}) {
  if (!state.catalog) return;
  const comic = currentComic();
  const series = currentSeries();
  const target = state.view === "about"
    ? aboutUrl()
    : state.hasSeriesRoute && series
      ? seriesUrl(series)
      : state.hasComicRoute && comic
        ? comicUrl(comic)
        : homeUrl();
  const method = replace ? "replaceState" : "pushState";
  if (window.location.href !== target) {
    window.history[method]({}, "", target);
  }
}

function issueLabel(comic) {
  if (comic.issueLabel) return comic.issueLabel;
  if (comic.series?.title && comic.issueNumber) return `Issue #${comic.issueNumber} of ${comic.series.title}`;
  if (comic.series?.title) return `Part of ${comic.series.title}`;
  return "Standalone issue";
}

function searchableText(comic) {
  const series = comic.series?.slug
    ? state.series.find((item) => item.slug === comic.series.slug)
    : null;
  return [
    comic.title,
    comic.publishedDate,
    formatDate(comic.publishedDate),
    comic.summary,
    issueLabel(comic),
    comic.series?.title,
    comic.series?.summary,
    series?.summary,
    series?.characterDescriptions,
    series?.settingDescriptions,
    series?.keyItemDescriptions,
    series?.issueSummaries,
  ].filter(Boolean).join(" ").toLowerCase();
}

function filteredComics() {
  const query = state.query.trim().toLowerCase();
  const seriesSlug = state.selectedSeriesSlug;
  return state.comics.filter((comic) => {
    const matchesSeries = !seriesSlug || comic.series?.slug === seriesSlug;
    const matchesQuery = !query || searchableText(comic).includes(query);
    return matchesSeries && matchesQuery;
  });
}

function renderList() {
  const comics = filteredComics();
  els.comicList.innerHTML = "";

  if (!comics.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No comics match that search.";
    els.comicList.append(empty);
    return;
  }

  for (const comic of comics) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `comic-card${comic.slug === state.selectedSlug ? " active" : ""}`;
    button.setAttribute("aria-current", comic.slug === state.selectedSlug ? "true" : "false");
    button.innerHTML = `
      <img src="${comic.cover}" alt="">
      <span>
        <strong>${comic.title}</strong>
        <span>${formatDate(comic.publishedDate)} · ${comic.pageCount} pages</span>
        <span class="comic-card-series">${issueLabel(comic)}</span>
      </span>
    `;
    button.addEventListener("click", () => selectComic(comic.slug));
    els.comicList.append(button);
  }
}

function renderReader() {
  const comic = currentComic();
  if (!comic) {
    els.comicTitle.textContent = "No comics found";
    els.comicDate.textContent = "";
    els.comicSummary.textContent = "Add a comic folder with assets/comic-pages to make it appear here.";
    els.pageStrip.innerHTML = "";
    els.downloadButton.hidden = true;
    return;
  }

  const series = currentSeries();
  document.title = state.hasComicRoute
    ? `${comic.title} | Random Comics`
    : state.hasSeriesRoute && series
      ? `${series.title} | Random Comics`
      : state.catalog.site.title;
  els.comicDate.textContent = `Published ${formatDate(comic.publishedDate)} · ${issueLabel(comic)}`;
  els.comicTitle.textContent = comic.title;
  els.comicSummary.textContent = comic.summary || "A standalone Random Comics issue.";
  els.downloadButton.hidden = !comic.pdf;
  els.downloadButton.href = comic.pdf || "#";
  els.downloadButton.setAttribute("download", comic.pdf ? "" : "false");

  els.pageStrip.innerHTML = "";
  for (const page of comic.pages) {
    const img = document.createElement("img");
    img.className = "comic-page";
    img.src = page.path;
    img.alt = page.alt;
    img.loading = page.number <= 2 ? "eager" : "lazy";
    img.decoding = "async";
    els.pageStrip.append(img);
  }
}

function renderView() {
  const isAbout = state.view === "about";
  els.aboutView.hidden = !isAbout;
  els.readerView.hidden = isAbout;
  els.navLinks.forEach((link) => {
    const route = link.dataset.route;
    link.classList.toggle("active", (isAbout && route === "about") || (!isAbout && route === "home"));
  });
  if (!isAbout) {
    renderList();
    renderReader();
  } else {
    document.title = "About Random Comics";
  }
}

function selectComic(slug, { replace = false } = {}) {
  if (!state.comics.some((comic) => comic.slug === slug)) return;
  state.view = "home";
  state.selectedSlug = slug;
  state.selectedSeriesSlug = state.comics.find((comic) => comic.slug === slug)?.series?.slug || null;
  state.hasComicRoute = true;
  state.hasSeriesRoute = false;
  renderView();
  updateUrl({ replace });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectBoundary(kind) {
  const comic = kind === "earliest" ? state.comics.at(0) : state.comics.at(-1);
  if (comic) selectComic(comic.slug);
}

async function shareCurrentComic() {
  const comic = currentComic();
  if (!comic) return;
  const url = comicUrl(comic);
  const data = {
    title: `${comic.title} | Random Comics`,
    text: `Read ${comic.title} on Random Comics.`,
    url,
  };

  if (navigator.share) {
    await navigator.share(data);
    return;
  }

  await navigator.clipboard.writeText(url);
  const original = els.shareButton.textContent;
  els.shareButton.textContent = "Copied";
  window.setTimeout(() => {
    els.shareButton.textContent = original;
  }, 1400);
}

function bindEvents() {
  els.comicSearch.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderList();
  });

  els.earliestButton.addEventListener("click", () => selectBoundary("earliest"));
  els.latestButton.addEventListener("click", () => selectBoundary("latest"));
  els.shareButton.addEventListener("click", () => {
    shareCurrentComic().catch(() => {});
  });

  document.addEventListener("click", (event) => {
    const routeLink = event.target.closest("[data-route]");
    if (!routeLink) return;
    event.preventDefault();
    state.view = routeLink.dataset.route === "about" ? "about" : "home";
    state.query = "";
    state.selectedSeriesSlug = null;
    state.hasComicRoute = false;
    state.hasSeriesRoute = false;
    els.comicSearch.value = "";
    renderView();
    updateUrl();
  });

  window.addEventListener("popstate", () => {
    const route = routeFromLocation();
    state.view = route.view;
    const requestedSeriesSlug = route.seriesSlug && state.series.some((series) => series.slug === route.seriesSlug)
      ? route.seriesSlug
      : null;
    const seriesComic = requestedSeriesSlug
      ? state.comics.find((comic) => comic.series?.slug === requestedSeriesSlug)
      : null;
    state.selectedSeriesSlug = requestedSeriesSlug;
    state.selectedSlug = route.slug && state.comics.some((comic) => comic.slug === route.slug)
      ? route.slug
      : seriesComic?.slug || state.comics.at(-1)?.slug || null;
    state.hasComicRoute = Boolean(route.slug && state.comics.some((comic) => comic.slug === route.slug));
    state.hasSeriesRoute = Boolean(requestedSeriesSlug);
    renderView();
  });
}

async function init() {
  const response = await fetch("comics.json", { cache: "no-store" });
  state.catalog = await response.json();
  state.comics = state.catalog.comics;
  state.series = state.catalog.series || [];
  const route = routeFromLocation();
  const requestedSlug = route.slug && state.comics.some((comic) => comic.slug === route.slug)
    ? route.slug
    : null;
  const requestedSeriesSlug = route.seriesSlug && state.series.some((series) => series.slug === route.seriesSlug)
    ? route.seriesSlug
    : null;
  const seriesComic = requestedSeriesSlug
    ? state.comics.find((comic) => comic.series?.slug === requestedSeriesSlug)
    : null;

  state.view = route.view;
  state.selectedSeriesSlug = requestedSeriesSlug;
  state.selectedSlug = requestedSlug || seriesComic?.slug || state.comics.at(-1)?.slug || null;
  state.hasComicRoute = Boolean(requestedSlug);
  state.hasSeriesRoute = Boolean(requestedSeriesSlug);
  bindEvents();
  renderView();
  if (state.view !== "about" && (requestedSlug || requestedSeriesSlug)) updateUrl({ replace: true });
}

init().catch((error) => {
  els.comicTitle.textContent = "Unable to load comics";
  els.comicSummary.textContent = error.message;
});
