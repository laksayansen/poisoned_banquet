// ==============================
// THE POISONED BANQUET - game.js
// Keeps track of what you've done (the state), saves it,
// and updates the page when things change.
// ==============================


// VARIABLES

let SAVE_KEY = "poisonedBanquet.save";
let ENDINGS_KEY = "poisonedBanquet.endings";

// Everything the game needs to remember about your case
let state = newState();

// Endings are remembered separately, so they stay even after you start a new case
let endingsFound = [];

// Dialogue that is waiting to be shown, one line at a time
let lineQueue = [];
let afterLines = null;     // what to do when the dialogue is finished
let busy = false;          // true while dialogue is playing (buttons are paused)
let newClueTitles = [];    // clues found during the current dialogue


function newState() {
    return {
        place: "garden",
        flags: {},       // things that happened, like tastedSoup: true
        clues: [],       // clue ids in the order you found them
        visited: [],     // places you've been
        done: []         // actions you've finished
    };
}


// ==============================
// HELPERS (story.js uses these too)
// ==============================

function hasFlag(name) {
    return state.flags[name] == true;
}

function setFlag(name) {
    state.flags[name] = true;
}

function hasClue(id) {
    return state.clues.indexOf(id) != -1;
}

function addClue(id) {
    if (!hasClue(id)) {
        state.clues.push(id);
        newClueTitles.push(clues[id].title);
    }
}

function hasVisited(placeId) {
    return state.visited.indexOf(placeId) != -1;
}

function isDone(actionId) {
    return state.done.indexOf(actionId) != -1;
}

function countKeys(object) {
    return Object.keys(object).length;
}


// ==============================
// SAVING (localStorage)
// ==============================

function saveGame() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (error) {
        // Storage can be blocked (private browsing). The game still works, it just won't remember.
    }
}

function loadGame() {
    try {
        let saved = localStorage.getItem(SAVE_KEY);
        if (saved) {
            let parsed = JSON.parse(saved);
            // Start from a fresh state and copy the saved parts in, in case anything is missing
            state = newState();
            state.place = parsed.place || "garden";
            state.flags = parsed.flags || {};
            state.clues = parsed.clues || [];
            state.visited = parsed.visited || [];
            state.done = parsed.done || [];
            return true;
        }
    } catch (error) {
        state = newState();
    }
    return false;
}

function saveEndings() {
    try {
        localStorage.setItem(ENDINGS_KEY, JSON.stringify(endingsFound));
    } catch (error) { }
}

function loadEndings() {
    try {
        let saved = localStorage.getItem(ENDINGS_KEY);
        if (saved) {
            endingsFound = JSON.parse(saved);
        }
    } catch (error) {
        endingsFound = [];
    }
}

function clearCase() {
    state = newState();
    try {
        localStorage.removeItem(SAVE_KEY);
    } catch (error) { }
}


// ==============================
// SCREENS (title, game, ending)
// ==============================

function showScreen(name) {
    document.getElementById("toast").classList.remove("visible");
    document.getElementById("titleScreen").hidden = (name != "title");
    document.getElementById("gameScreen").hidden = (name != "game");
    document.getElementById("endingScreen").hidden = (name != "ending");
    window.scrollTo(0, 0);
}

function showTitle() {
    let hasSave = loadGame() && state.visited.length > 0;

    document.getElementById("continueBtn").hidden = !hasSave;
    document.getElementById("restartBtn").hidden = !hasSave;
    document.getElementById("startBtn").hidden = hasSave;

    let endingsLine = document.getElementById("titleEndings");
    if (endingsFound.length > 0) {
        endingsLine.textContent = "Endings found: " + endingsFound.length + " of " + endingOrder.length;
        endingsLine.hidden = false;
    } else {
        endingsLine.hidden = true;
    }

    showScreen("title");
}

function startCase() {
    clearCase();
    showScreen("game");
    goTo("garden");
}

function continueCase() {
    showScreen("game");
    // Show the place you were in, with its "welcome back" lines
    renderScene();
    playLines(places[state.place].returnLines());
}

function restartCase() {
    let sure = confirm("Start a new case? Your clues will be cleared. Endings you've found will stay.");
    if (sure) {
        startCase();
    }
}


// On phones the buttons are below the picture, so after you tap one
// the page scrolls back up to show what happened.
function scrollToStory(elementId) {
    if (window.innerWidth > 900) {
        return;
    }
    let reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(elementId).scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
    });
}


// ==============================
// MOVING BETWEEN PLACES
// ==============================

function goTo(placeId) {
    let place = places[placeId];

    if (!place.unlocked() || busy) {
        return;
    }

    let firstTime = !hasVisited(placeId);
    state.place = placeId;
    if (firstTime) {
        state.visited.push(placeId);
    }

    renderScene();

    if (firstTime) {
        playLines(place.intro());
    } else {
        playLines(place.returnLines());
    }

    saveGame();
    scrollToStory("placeName");
}

// Updates the picture, place name, and both side panels
function renderScene() {
    let place = places[state.place];
    let sceneImage = document.getElementById("sceneImage");

    // Fade the picture out, swap it, fade back in
    if (sceneImage.getAttribute("src") != place.image) {
        sceneImage.classList.add("fading");
        setTimeout(function () {
            sceneImage.src = place.image;
            sceneImage.alt = place.alt;
            sceneImage.classList.remove("fading");
        }, 200);
    }

    document.getElementById("placeName").textContent = place.name;
    document.title = place.name + " | The Poisoned Banquet";

    renderActions();
    renderPlaces();
    updateJournalButton();
}


// ==============================
// THE "LOOK AROUND" PANEL
// ==============================

function renderActions() {
    let list = document.getElementById("actionList");
    let heading = document.getElementById("actionHeading");
    list.innerHTML = "";

    // The accusation scene shows suspects instead of actions
    if (state.place == "accuse") {
        heading.textContent = "Who did it?";
        renderSuspects(list);
        return;
    }

    heading.textContent = "Look around";
    let actions = places[state.place].actions;

    for (let i = 0; i < actions.length; i++) {
        let action = actions[i];

        // Skip actions that haven't been revealed yet
        if (action.available && !action.available()) {
            continue;
        }

        let button = document.createElement("button");
        button.className = "action";
        button.textContent = action.label;
        button.disabled = busy;

        if (isDone(action.id)) {
            button.classList.add("done");
            let note = document.createElement("span");
            note.className = "visually-hidden";
            note.textContent = " (already done)";
            button.appendChild(note);
        }

        button.addEventListener("click", function () {
            runAction(action);
        });

        list.appendChild(button);
    }
}

function runAction(action) {
    if (busy) {
        return;
    }

    let lines = action.run();

    // Most actions count as done after the first try. Some (like telling Jinshi) need the right clue first.
    let finished = true;
    if (action.isDone) {
        finished = action.isDone();
    }
    if (finished && !isDone(action.id)) {
        state.done.push(action.id);
    }

    saveGame();
    playLines(lines);
    scrollToStory("sceneImage");
}


// ==============================
// THE "GO TO" PANEL
// ==============================

function renderPlaces() {
    let list = document.getElementById("placeList");
    list.innerHTML = "";

    for (let i = 0; i < placeOrder.length; i++) {
        let placeId = placeOrder[i];
        let place = places[placeId];

        let button = document.createElement("button");
        button.className = "travel";

        let name = document.createElement("span");
        name.className = "travel-name";
        name.textContent = place.name;
        button.appendChild(name);

        if (placeId == state.place) {
            button.classList.add("current");
            button.setAttribute("aria-current", "true");
            button.disabled = true;
            let here = document.createElement("span");
            here.className = "travel-note";
            here.textContent = "You are here";
            button.appendChild(here);
        } else if (!place.unlocked()) {
            button.classList.add("locked");
            button.disabled = true;
            let hint = document.createElement("span");
            hint.className = "travel-note";
            hint.textContent = place.lockedHint;
            button.appendChild(hint);
        } else {
            button.disabled = busy;
            if (!hasVisited(placeId)) {
                button.classList.add("new");
                let fresh = document.createElement("span");
                fresh.className = "travel-note";
                fresh.textContent = "Not visited yet";
                button.appendChild(fresh);
            }
            button.addEventListener("click", function () {
                goTo(placeId);
            });
        }

        list.appendChild(button);
    }
}


// ==============================
// DIALOGUE
// ==============================

function playLines(lines, onDone) {
    lineQueue = lines.slice();
    afterLines = onDone || null;
    setBusy(true);
    showNextLine();
}

function showNextLine() {
    let line = lineQueue.shift();
    let speakerId = line[0];
    let text = line[1];

    let box = document.getElementById("dialogue");
    let portrait = document.getElementById("speakerImage");
    let nameTag = document.getElementById("speakerName");
    let lineText = document.getElementById("lineText");

    if (speakerId == null) {
        // Narration: no portrait, no name
        box.classList.add("narration");
        portrait.hidden = true;
        nameTag.hidden = true;
    } else {
        let speaker = characters[speakerId];
        box.classList.remove("narration");
        portrait.hidden = false;
        portrait.src = speaker.image;
        portrait.alt = speaker.name;
        nameTag.hidden = false;
        nameTag.textContent = speaker.name;
    }

    lineText.textContent = text;

    // Restart the little fade-in on the text
    lineText.classList.remove("show");
    void lineText.offsetWidth;
    lineText.classList.add("show");

    let nextBtn = document.getElementById("nextBtn");

    if (lineQueue.length > 0) {
        nextBtn.hidden = false;
        nextBtn.textContent = "Next";
        nextBtn.focus({ preventScroll: true });
    } else if (afterLines) {
        nextBtn.hidden = false;
        nextBtn.textContent = "Continue";
        nextBtn.focus({ preventScroll: true });
    } else {
        nextBtn.hidden = true;
        finishLines();
    }
}

function nextLine() {
    if (lineQueue.length > 0) {
        showNextLine();
    } else if (afterLines) {
        let next = afterLines;
        afterLines = null;
        next();
    }
}

function finishLines() {
    setBusy(false);
    renderActions();
    renderPlaces();
    updateJournalButton();
    showNewClues();

    // Put keyboard focus on the first thing you can do next
    let firstAction = document.querySelector("#actionList button:not(:disabled)");
    if (firstAction) {
        firstAction.focus({ preventScroll: true });
    }
}

function setBusy(value) {
    busy = value;
    let buttons = document.querySelectorAll("#actionList button, #placeList button:not(.locked):not(.current)");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].disabled = value;
    }
}


// ==============================
// NEW CLUE MESSAGE
// ==============================

let toastTimer = null;

function showNewClues() {
    if (newClueTitles.length == 0) {
        return;
    }

    let toast = document.getElementById("toast");
    toast.textContent = "Added to journal: " + newClueTitles.join(", ");
    toast.classList.add("visible");
    newClueTitles = [];

    let journalBtn = document.getElementById("journalBtn");
    journalBtn.classList.remove("bump");
    void journalBtn.offsetWidth;
    journalBtn.classList.add("bump");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
        toast.classList.remove("visible");
    }, 3200);
}


// ==============================
// JOURNAL
// ==============================

function updateJournalButton() {
    document.getElementById("clueCount").textContent = state.clues.length;
}

function openJournal() {
    renderJournal();
    document.getElementById("journal").showModal();
}

function closeJournal() {
    document.getElementById("journal").close();
}

function renderJournal() {
    let list = document.getElementById("clueList");
    let total = countKeys(clues);
    list.innerHTML = "";

    document.getElementById("journalCount").textContent = state.clues.length + " of " + total + " clues found";

    if (state.clues.length == 0) {
        let empty = document.createElement("li");
        empty.className = "empty";
        empty.textContent = "Nothing yet. Clues show up here as you find them. Start by looking around the garden party.";
        list.appendChild(empty);
        return;
    }

    // Newest clue first
    for (let i = state.clues.length - 1; i >= 0; i--) {
        let clue = clues[state.clues[i]];
        let place = places[clue.place];

        let item = document.createElement("li");
        item.className = "clue";

        let thumb = document.createElement("img");
        thumb.src = place.image;
        thumb.alt = "";

        let body = document.createElement("div");

        let title = document.createElement("h3");
        title.textContent = clue.title;

        let text = document.createElement("p");
        text.textContent = clue.text;

        let where = document.createElement("p");
        where.className = "where";
        where.textContent = "Found at " + place.name;

        body.appendChild(title);
        body.appendChild(text);
        body.appendChild(where);
        item.appendChild(thumb);
        item.appendChild(body);
        list.appendChild(item);
    }
}


// ==============================
// ACCUSATION
// ==============================

function renderSuspects(list) {
    let grid = document.createElement("div");
    grid.className = "suspects";

    for (let i = 0; i < suspects.length; i++) {
        let suspect = suspects[i];
        if (!suspect.available()) {
            continue;
        }

        let button = document.createElement("button");
        button.className = "suspect";
        button.disabled = busy;

        let img = document.createElement("img");
        img.src = suspect.image;
        img.alt = "";

        let name = document.createElement("span");
        name.textContent = suspect.name;

        button.appendChild(img);
        button.appendChild(name);
        button.addEventListener("click", function () {
            accuse(suspect.id);
        });

        grid.appendChild(button);
    }

    list.appendChild(grid);

    let note = document.createElement("p");
    note.className = "panel-note";
    note.textContent = "Not sure yet? Use the places below to keep looking. Your clues are in the journal.";
    list.appendChild(note);
}

function hasAllKeyClues() {
    for (let i = 0; i < keyClues.length; i++) {
        if (!hasClue(keyClues[i])) {
            return false;
        }
    }
    return true;
}

function accuse(suspectId) {
    if (busy) {
        return;
    }

    scrollToStory("sceneImage");

    if (suspectId == "taster") {
        playLines(accusations.taster, function () { showEnding("prank"); });
    } else if (suspectId == "servant") {
        playLines(accusations.servant, function () { showEnding("closed"); });
    } else if (suspectId == "ahduo") {
        playLines(accusations.ahduo, function () { showEnding("wrongLady"); });
    } else if (suspectId == "fengming") {
        if (hasAllKeyClues()) {
            playLines(accusations.fengmingFull, showFinalChoice);
        } else {
            playLines(accusations.fengmingWeak, function () { showEnding("weak"); });
        }
    }
}

// The last decision: shown in the side panel after the full explanation
function showFinalChoice() {
    document.getElementById("nextBtn").hidden = true;
    document.getElementById("actionHeading").textContent = finalChoice.question;

    let list = document.getElementById("actionList");
    list.innerHTML = "";

    for (let i = 0; i < finalChoice.options.length; i++) {
        let option = finalChoice.options[i];
        let button = document.createElement("button");
        button.className = "action choice";
        button.textContent = option.label;
        button.addEventListener("click", function () {
            playLines(option.lines, function () { showEnding(option.ending); });
            scrollToStory("sceneImage");
        });
        list.appendChild(button);
    }

    list.querySelector("button").focus({ preventScroll: true });
}


// ==============================
// ENDINGS
// ==============================

function showEnding(endingId) {
    let ending = endings[endingId];

    if (endingsFound.indexOf(endingId) == -1) {
        endingsFound.push(endingId);
        saveEndings();
    }

    setBusy(false);

    document.getElementById("endingImage").src = ending.image;
    document.getElementById("endingTitle").textContent = ending.title;
    document.getElementById("endingText").textContent = ending.text;
    document.getElementById("canonTag").hidden = !ending.canon;
    document.title = ending.title + " | The Poisoned Banquet";

    // List every ending, showing the names of the ones you've found
    let list = document.getElementById("endingList");
    list.innerHTML = "";
    for (let i = 0; i < endingOrder.length; i++) {
        let id = endingOrder[i];
        let item = document.createElement("li");
        if (endingsFound.indexOf(id) != -1) {
            item.textContent = endings[id].title;
            if (id == endingId) {
                item.className = "this-one";
            }
        } else {
            item.textContent = "Not found yet";
            item.className = "missing";
        }
        list.appendChild(item);
    }

    document.getElementById("endingCount").textContent = "Endings found: " + endingsFound.length + " of " + endingOrder.length;

    showScreen("ending");
    document.getElementById("endingTitle").focus();
}

function chooseAgain() {
    // Go back to the accusation with all your clues still there
    showScreen("game");
    state.place = "accuse";
    renderScene();
    playLines(places.accuse.returnLines());
    saveGame();
}


// ==============================
// EVENT LISTENERS
// ==============================

document.getElementById("startBtn").addEventListener("click", startCase);
document.getElementById("continueBtn").addEventListener("click", continueCase);
document.getElementById("restartBtn").addEventListener("click", restartCase);
document.getElementById("nextBtn").addEventListener("click", nextLine);
document.getElementById("journalBtn").addEventListener("click", openJournal);
document.getElementById("closeJournalBtn").addEventListener("click", closeJournal);
document.getElementById("titleBtn").addEventListener("click", showTitle);
document.getElementById("chooseAgainBtn").addEventListener("click", chooseAgain);
document.getElementById("newCaseBtn").addEventListener("click", startCase);

// Clicking the dark area around the journal closes it
document.getElementById("journal").addEventListener("click", function (event) {
    if (event.target.id == "journal") {
        closeJournal();
    }
});

// Keyboard shortcut: J opens and closes the journal
document.addEventListener("keydown", function (event) {
    if (document.getElementById("gameScreen").hidden) {
        return;
    }
    if (event.key == "j" || event.key == "J") {
        let journal = document.getElementById("journal");
        if (journal.open) {
            closeJournal();
        } else {
            openJournal();
        }
    }
});


// ==============================
// START
// ==============================

loadEndings();
showTitle();
