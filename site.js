const searchInput = document.querySelector("#exhibit-search");

if (searchInput) {
  const cards = [...document.querySelectorAll("[data-exhibit]")];
  const searchStatus = document.querySelector("#search-status");
  const noResults = document.querySelector("#no-results");

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    for (const card of cards) {
      const matches = `${card.dataset.search} ${card.textContent}`.toLowerCase().includes(query);
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    }

    searchStatus.textContent = query
      ? `${visibleCount} ${visibleCount === 1 ? "result" : "results"} found.`
      : "Showing all exhibit results.";
    noResults.hidden = visibleCount !== 0;
  });
}

const feedbackForm = document.querySelector("#feedback-form");

if (feedbackForm) {
  const storageKey = "aquarium-adventure-feedback";
  const feedbackList = document.querySelector("#feedback-list");
  const feedbackStatus = document.querySelector("#feedback-status");
  const domExceptions = ["SecurityError", "QuotaExceededError"];

  function readFeedback() {
    let saved;
    try {
      saved = localStorage.getItem(storageKey);
    } catch (error) {
      if (error instanceof DOMException && domExceptions.includes(error.name)) {
        feedbackStatus.textContent = "This browser does not allow local feedback storage.";
        return [];
      }
      throw error;
    }

    if (!saved) return [];

    try {
      const entries = JSON.parse(saved);
      if (Array.isArray(entries) && entries.every(entry =>
        entry &&
        typeof entry.name === "string" &&
        typeof entry.message === "string"
      )) {
        return entries;
      }
      feedbackStatus.textContent = "Saved feedback could not be read because its format is invalid.";
      return [];
    } catch (error) {
      if (error instanceof SyntaxError) {
        feedbackStatus.textContent = "Saved feedback could not be read because its data is invalid.";
        return [];
      }
      throw error;
    }
  }

  function renderFeedback(entries) {
    feedbackList.replaceChildren();

    for (const entry of entries) {
      const item = document.createElement("li");
      item.className = "feedback-item";
      const name = document.createElement("strong");
      name.textContent = entry.name;
      const message = document.createElement("p");
      message.textContent = entry.message;
      item.append(name, message);
      feedbackList.append(item);
    }
  }

  let entries = readFeedback();
  renderFeedback(entries);

  feedbackForm.addEventListener("submit", event => {
    event.preventDefault();
    const formData = new FormData(feedbackForm);
    const entry = {
      name: String(formData.get("name")).trim(),
      message: String(formData.get("message")).trim()
    };

    if (!entry.name || !entry.message) {
      feedbackStatus.textContent = "Enter your name and feedback before posting.";
      return;
    }

    const updatedEntries = [entry, ...entries].slice(0, 20);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedEntries));
    } catch (error) {
      if (error instanceof DOMException && domExceptions.includes(error.name)) {
        feedbackStatus.textContent = "Your feedback could not be saved in this browser. Check browser storage settings and try again.";
        return;
      }
      throw error;
    }

    entries = updatedEntries;
    renderFeedback(entries);
    feedbackForm.reset();
    feedbackStatus.textContent = "Your feedback was saved in this browser.";
  });
}
