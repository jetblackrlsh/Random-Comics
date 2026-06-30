const state = {
  catalog: null,
  comics: [],
  series: [],
  selectedSlug: null,
  selectedSeriesSlug: null,
  query: "",
  advancedSearch: {
    title: "",
    description: "",
    series: "",
    issueNumber: "",
    dateFrom: "",
    dateTo: "",
    sort: "date-desc",
  },
  view: "home",
  readerMode: false,
  hasComicRoute: false,
  hasSeriesRoute: false,
};

const els = {
  readerView: document.querySelector("#readerView"),
  aboutView: document.querySelector("#aboutView"),
  aiLimitationsView: document.querySelector("#aiLimitationsView"),
  followView: document.querySelector("#followView"),
  otherComicsView: document.querySelector("#otherComicsView"),
  advancedSearchView: document.querySelector("#advancedSearchView"),
  comicList: document.querySelector("#comicList"),
  comicSearch: document.querySelector("#comicSearch"),
  advancedSearchForm: document.querySelector("#advancedSearchForm"),
  advancedTitleSearch: document.querySelector("#advancedTitleSearch"),
  advancedDescriptionSearch: document.querySelector("#advancedDescriptionSearch"),
  advancedSeriesFilter: document.querySelector("#advancedSeriesFilter"),
  advancedIssueNumber: document.querySelector("#advancedIssueNumber"),
  advancedDateFrom: document.querySelector("#advancedDateFrom"),
  advancedDateTo: document.querySelector("#advancedDateTo"),
  advancedSort: document.querySelector("#advancedSort"),
  advancedSearchCount: document.querySelector("#advancedSearchCount"),
  advancedFilterSummary: document.querySelector("#advancedFilterSummary"),
  advancedGallery: document.querySelector("#advancedGallery"),
  earliestButton: document.querySelector("#earliestButton"),
  latestButton: document.querySelector("#latestButton"),
  readerPanel: document.querySelector(".reader-panel"),
  comicDate: document.querySelector("#comicDate"),
  comicTitle: document.querySelector("#comicTitle"),
  comicSummary: document.querySelector("#comicSummary"),
  pageStrip: document.querySelector("#pageStrip"),
  readerModeButton: document.querySelector("#readerModeButton"),
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
  if (initialRoute === "ai-limitations") return { view: "ai-limitations", slug: null };
  if (initialRoute === "follow") return { view: "follow", slug: null };
  if (initialRoute === "other-comics") return { view: "other-comics", slug: null };
  if (initialRoute === "advanced-search") return { view: "advanced-search", slug: null };

  const path = window.location.pathname.replace(/\/+$/, "");
  const comicMatch = path.match(/\/comics\/([^/]+)$/);
  if (comicMatch) return { view: "home", slug: decodeURIComponent(comicMatch[1]) };
  const seriesMatch = path.match(/\/series\/([^/]+)$/);
  if (seriesMatch) return { view: "home", slug: null, seriesSlug: decodeURIComponent(seriesMatch[1]) };
  if (/\/about$/.test(path)) return { view: "about", slug: null };
  if (/\/ai-limitations$/.test(path)) return { view: "ai-limitations", slug: null };
  if (/\/follow$/.test(path)) return { view: "follow", slug: null };
  if (/\/other-comics$/.test(path)) return { view: "other-comics", slug: null };
  if (/\/advanced-search$/.test(path)) return { view: "advanced-search", slug: null };

  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return { view: "home", slug: params.get("comic"), seriesSlug: params.get("series") };
}

function appRootPath() {
  const path = window.location.pathname;
  const marker = "/web-app/";
  const markerIndex = path.indexOf(marker);
  if (markerIndex >= 0) return `${path.slice(0, markerIndex)}${marker}`;
  return path.replace(/(?:(?:comics|series)\/[^/]+\/?|(?:about|ai-limitations|follow|other-comics|advanced-search)\/?)$/, "");
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

function aiLimitationsUrl() {
  return new URL("ai-limitations/", `${window.location.origin}${appRootPath()}`).href;
}

function followUrl() {
  return new URL("follow/", `${window.location.origin}${appRootPath()}`).href;
}

function otherComicsUrl() {
  return new URL("other-comics/", `${window.location.origin}${appRootPath()}`).href;
}

function advancedSearchUrl() {
  return new URL("advanced-search/", `${window.location.origin}${appRootPath()}`).href;
}

function updateUrl({ replace = false } = {}) {
  if (!state.catalog) return;
  const comic = currentComic();
  const series = currentSeries();
  const target = state.view === "other-comics"
    ? otherComicsUrl()
    : state.view === "advanced-search"
    ? advancedSearchUrl()
    : state.view === "ai-limitations"
    ? aiLimitationsUrl()
    : state.view === "follow"
    ? followUrl()
    : state.view === "about"
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

function normalizeSearchValue(value) {
  return String(value || "").trim().toLowerCase();
}

function comicSeriesTitle(comic) {
  return comic.series?.title || "Standalone";
}

function matchesAdvancedSearch(comic) {
  const filters = state.advancedSearch;
  const title = normalizeSearchValue(filters.title);
  const description = normalizeSearchValue(filters.description);
  const issueNumber = String(filters.issueNumber || "").trim();
  const series = filters.series;

  if (title && !normalizeSearchValue(comic.title).includes(title)) return false;
  if (description && !normalizeSearchValue(comic.summary).includes(description)) return false;
  if (series === "__standalone__" && comic.series) return false;
  if (series && series !== "__standalone__" && comic.series?.slug !== series) return false;
  if (issueNumber && String(comic.issueNumber || "") !== issueNumber) return false;
  if (filters.dateFrom && comic.publishedDate < filters.dateFrom) return false;
  if (filters.dateTo && comic.publishedDate > filters.dateTo) return false;

  return true;
}

function compareNumbersWithFallback(a, b, fallback) {
  const aNumber = Number.isFinite(a) ? a : Number.POSITIVE_INFINITY;
  const bNumber = Number.isFinite(b) ? b : Number.POSITIVE_INFINITY;
  const byNumber = aNumber - bNumber;
  return byNumber || fallback();
}

function compareIssueNumbersDescending(a, b, fallback) {
  const aHasNumber = Number.isFinite(a);
  const bHasNumber = Number.isFinite(b);
  if (aHasNumber && bHasNumber) return b - a || fallback();
  if (aHasNumber) return -1;
  if (bHasNumber) return 1;
  return fallback();
}

function sortAdvancedComics(comics) {
  const sorted = [...comics];
  sorted.sort((a, b) => {
    const byTitle = () => a.title.localeCompare(b.title, undefined, { numeric: true });
    const byDate = () => a.publishedDate.localeCompare(b.publishedDate) || byTitle();
    const bySeries = () => comicSeriesTitle(a).localeCompare(comicSeriesTitle(b), undefined, { numeric: true })
      || compareNumbersWithFallback(a.issueNumber, b.issueNumber, byTitle);

    switch (state.advancedSearch.sort) {
      case "date-asc":
        return byDate();
      case "title-asc":
        return byTitle();
      case "title-desc":
        return -byTitle();
      case "issue-asc":
        return compareNumbersWithFallback(a.issueNumber, b.issueNumber, bySeries);
      case "issue-desc":
        return compareIssueNumbersDescending(a.issueNumber, b.issueNumber, bySeries);
      case "series-asc":
        return bySeries();
      case "series-desc":
        return -bySeries();
      case "date-desc":
      default:
        return -byDate();
    }
  });
  return sorted;
}

function advancedSearchResults() {
  return sortAdvancedComics(state.comics.filter(matchesAdvancedSearch));
}

function activeAdvancedFilterCount() {
  const filters = state.advancedSearch;
  return [
    filters.title,
    filters.description,
    filters.series,
    filters.issueNumber,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;
}

function renderAdvancedSearchSummary(results) {
  const total = state.comics.length;
  const count = results.length;
  els.advancedSearchCount.textContent = `${count} of ${total} comics`;

  const activeCount = activeAdvancedFilterCount();
  els.advancedFilterSummary.textContent = activeCount
    ? `${activeCount} filter${activeCount === 1 ? "" : "s"} active`
    : "No filters active";
}

function renderAdvancedGallery() {
  const comics = advancedSearchResults();
  renderAdvancedSearchSummary(comics);
  els.advancedGallery.innerHTML = "";

  if (!comics.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state advanced-empty-state";
    empty.textContent = "No comics match those filters.";
    els.advancedGallery.append(empty);
    return;
  }

  for (const comic of comics) {
    const card = document.createElement("a");
    let pointerStart = null;
    let handledPointerActivation = false;
    const activateCard = (event) => {
      event.preventDefault();
      selectComic(comic.slug);
    };
    card.className = "advanced-comic-card";
    card.href = comicUrl(comic);
    card.dataset.slug = comic.slug;
    card.innerHTML = `
      <img src="${comic.cover}" alt="">
      <span class="advanced-comic-body">
        <span class="advanced-comic-meta">${formatDate(comic.publishedDate)} · ${issueLabel(comic)}</span>
        <strong>${comic.title}</strong>
        <span class="advanced-comic-summary">${comic.summary || "A standalone Random Comics issue."}</span>
      </span>
    `;
    card.addEventListener("pointerdown", (event) => {
      pointerStart = { x: event.clientX, y: event.clientY, type: event.pointerType };
    });
    card.addEventListener("pointerup", (event) => {
      if (!pointerStart || pointerStart.type === "mouse" || event.pointerType === "mouse") return;
      const moved = Math.abs(event.clientX - pointerStart.x) > 10 || Math.abs(event.clientY - pointerStart.y) > 10;
      pointerStart = null;
      if (moved) return;
      handledPointerActivation = true;
      window.setTimeout(() => {
        handledPointerActivation = false;
      }, 600);
      activateCard(event);
    });
    card.addEventListener("click", (event) => {
      if (handledPointerActivation) {
        event.preventDefault();
        return;
      }
      activateCard(event);
    });
    els.advancedGallery.append(card);
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

function renderReaderMode() {
  document.body.classList.toggle("reader-mode", state.readerMode);
  els.readerModeButton.setAttribute("aria-pressed", String(state.readerMode));
  els.readerModeButton.textContent = state.readerMode ? "Exit Reader" : "Reader Mode";
}

function syncFullscreen(enabled) {
  if (enabled) {
    if (document.fullscreenElement || !els.readerView.requestFullscreen) return;
    els.readerView.requestFullscreen().catch(() => {});
    return;
  }

  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

function setReaderMode(enabled, { syncNativeFullscreen = true } = {}) {
  state.readerMode = Boolean(enabled) && state.view === "home";
  renderReaderMode();
  if (syncNativeFullscreen) syncFullscreen(state.readerMode);
}

function renderView() {
  const isAbout = state.view === "about";
  const isAiLimitations = state.view === "ai-limitations";
  const isFollow = state.view === "follow";
  const isOtherComics = state.view === "other-comics";
  const isAdvancedSearch = state.view === "advanced-search";
  if (isAbout || isAiLimitations || isFollow || isOtherComics || isAdvancedSearch) setReaderMode(false);
  els.aboutView.hidden = !isAbout;
  els.aiLimitationsView.hidden = !isAiLimitations;
  els.followView.hidden = !isFollow;
  els.otherComicsView.hidden = !isOtherComics;
  els.advancedSearchView.hidden = !isAdvancedSearch;
  els.readerView.hidden = isAbout || isAiLimitations || isFollow || isOtherComics || isAdvancedSearch;
  els.navLinks.forEach((link) => {
    const route = link.dataset.route;
    link.classList.toggle("active", route === state.view || (!isAbout && !isAiLimitations && !isFollow && !isOtherComics && !isAdvancedSearch && route === "home"));
  });
  if (!isAbout && !isAiLimitations && !isFollow && !isOtherComics && !isAdvancedSearch) {
    renderList();
    renderReader();
    renderReaderMode();
  } else if (isAbout) {
    document.title = "About Random Comics";
  } else if (isAiLimitations) {
    document.title = "AI Limitations | Random Comics";
  } else if (isFollow) {
    document.title = "Follow Random Comics";
  } else if (isOtherComics) {
    document.title = "Other Comics | Random Comics";
  } else {
    document.title = "Advanced Search | Random Comics";
    renderAdvancedGallery();
  }
}

function preferredScrollBehavior() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function scrollAfterComicSelection() {
  if (!window.matchMedia("(max-width: 980px)").matches || !els.readerPanel) {
    window.scrollTo({ top: 0, behavior: preferredScrollBehavior() });
    return;
  }

  const header = document.querySelector(".site-header");
  const headerPosition = header ? window.getComputedStyle(header).position : "";
  const headerHeight = header && (headerPosition === "sticky" || headerPosition === "fixed")
    ? header.offsetHeight
    : 0;
  const targetTop = els.readerPanel.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
  window.scrollTo({ top: Math.max(0, targetTop), behavior: preferredScrollBehavior() });
}

function scheduleScrollAfterComicSelection() {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(scrollAfterComicSelection);
  });
}

function scrollToPageTop() {
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: preferredScrollBehavior() });
  });
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
  scheduleScrollAfterComicSelection();
}

function selectBoundary(kind) {
  const comic = kind === "earliest" ? state.comics.at(0) : state.comics.at(-1);
  if (comic) selectComic(comic.slug);
}

function updateAdvancedSearchFromForm() {
  state.advancedSearch = {
    title: els.advancedTitleSearch.value,
    description: els.advancedDescriptionSearch.value,
    series: els.advancedSeriesFilter.value,
    issueNumber: els.advancedIssueNumber.value,
    dateFrom: els.advancedDateFrom.value,
    dateTo: els.advancedDateTo.value,
    sort: els.advancedSort.value,
  };
  renderAdvancedGallery();
}

function resetAdvancedSearch() {
  state.advancedSearch = {
    title: "",
    description: "",
    series: "",
    issueNumber: "",
    dateFrom: "",
    dateTo: "",
    sort: "date-desc",
  };
  els.advancedTitleSearch.value = "";
  els.advancedDescriptionSearch.value = "";
  els.advancedSeriesFilter.value = "";
  els.advancedIssueNumber.value = "";
  els.advancedDateFrom.value = "";
  els.advancedDateTo.value = "";
  els.advancedSort.value = "date-desc";
  renderAdvancedGallery();
}

function populateAdvancedSeriesFilter() {
  els.advancedSeriesFilter.innerHTML = '<option value="">All series and standalones</option><option value="__standalone__">Standalone comics only</option>';
  for (const series of state.series) {
    const option = document.createElement("option");
    option.value = series.slug;
    option.textContent = series.title;
    els.advancedSeriesFilter.append(option);
  }
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

  els.advancedSearchForm.addEventListener("input", updateAdvancedSearchFromForm);
  els.advancedSearchForm.addEventListener("change", updateAdvancedSearchFromForm);
  els.advancedSearchForm.addEventListener("reset", (event) => {
    event.preventDefault();
    resetAdvancedSearch();
  });

  els.earliestButton.addEventListener("click", () => selectBoundary("earliest"));
  els.latestButton.addEventListener("click", () => selectBoundary("latest"));
  els.readerModeButton.addEventListener("click", () => setReaderMode(!state.readerMode));
  els.shareButton.addEventListener("click", () => {
    shareCurrentComic().catch(() => {});
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.readerMode) setReaderMode(false);
  });

  document.addEventListener("fullscreenchange", () => {
    if (state.readerMode && !document.fullscreenElement) {
      setReaderMode(false, { syncNativeFullscreen: false });
    }
  });

  document.addEventListener("click", (event) => {
    const routeLink = event.target.closest("[data-route]");
    if (!routeLink) return;
    event.preventDefault();
    state.view = routeLink.dataset.route === "about"
      || routeLink.dataset.route === "ai-limitations"
      || routeLink.dataset.route === "follow"
      || routeLink.dataset.route === "other-comics"
      || routeLink.dataset.route === "advanced-search"
      ? routeLink.dataset.route
      : "home";
    state.query = "";
    state.selectedSeriesSlug = null;
    state.hasComicRoute = false;
    state.hasSeriesRoute = false;
    els.comicSearch.value = "";
    renderView();
    updateUrl();
    scrollToPageTop();
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
  populateAdvancedSeriesFilter();
  bindEvents();
  renderView();
  if (state.view !== "about" && state.view !== "ai-limitations" && state.view !== "follow" && state.view !== "other-comics" && (requestedSlug || requestedSeriesSlug)) updateUrl({ replace: true });
}

init().catch((error) => {
  els.comicTitle.textContent = "Unable to load comics";
  els.comicSummary.textContent = error.message;
});
