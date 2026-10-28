
const participants = [
    "Jenny", "Jessica", "Jayson", "Mama", "Papa",
    "Jerald", "Karen", "Azi", "Jia"
];

const mainGroup = [
    "Jenny", "Jessica", "Jayson", "Mama", "Papa"
];

const familyGroup = [
    "Jerald", "Karen", "Azi", "Jia"
];

const STORAGE_KEY = "familyGiftAssignments";
const REVEALED_KEY = "familyGiftRevealed_";

function shuffle(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

function createDraw() {
    const givers = [
        ...shuffle(familyGroup),
        ...shuffle(mainGroup)
    ];

    const assignments = {};
    const usedRecipients = new Set();

    function assign(index) {
        if (index === givers.length) {
            return true;
        }

        const giver = givers[index];

        let possibleRecipients = participants.filter(recipient => {
            if (recipient === giver) return false;
            if (usedRecipients.has(recipient)) return false;

            // Restricted family members can choose only the main group.
            if (
                familyGroup.includes(giver) &&
                !mainGroup.includes(recipient)
            ) {
                return false;
            }

            return true;
        });

        possibleRecipients = shuffle(possibleRecipients);

        for (const recipient of possibleRecipients) {
            assignments[giver] = recipient;
            usedRecipients.add(recipient);

            if (assign(index + 1)) {
                return true;
            }

            delete assignments[giver];
            usedRecipients.delete(recipient);
        }

        return false;
    }

    return assign(0) ? assignments : null;
}

function isValidDraw(draw) {
    if (!draw || typeof draw !== "object") return false;

    if (!participants.every(name =>
        Object.prototype.hasOwnProperty.call(draw, name)
    )) {
        return false;
    }

    const recipients = participants.map(name => draw[name]);

    if (!recipients.every(name => participants.includes(name))) {
        return false;
    }

    if (new Set(recipients).size !== participants.length) {
        return false;
    }

    for (const giver of participants) {
        if (draw[giver] === giver) return false;

        if (
            familyGroup.includes(giver) &&
            !mainGroup.includes(draw[giver])
        ) {
            return false;
        }
    }

    return true;
}

function getDraw() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            const parsed = JSON.parse(saved);

            if (isValidDraw(parsed)) {
                return parsed;
            }
        }
    } catch (error) {
        console.error("Could not read saved draw:", error);
    }

    const newDraw = createDraw();

    if (newDraw) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newDraw));
        } catch (error) {
            console.error("Could not save draw:", error);
        }
    }

    return newDraw;
}

const assignments = getDraw();

function revealName() {
    const participant = document.getElementById("participant");
    const button = document.getElementById("drawButton");
    const result = document.getElementById("result");

    const name = participant.value;

    result.replaceChildren();

    if (!name) {
        result.textContent = "Please select your name first! 🎄";
        return;
    }

    if (!assignments || !isValidDraw(assignments)) {
        result.textContent = "The draw could not be created. Please try again.";
        return;
    }

    const usedKey = REVEALED_KEY + name;

    if (localStorage.getItem(usedKey) === "true") {
        result.textContent =
            "This name has already been revealed on this browser.";
        button.disabled = true;
        return;
    }

    const heading = document.createElement("h3");
    heading.textContent = "YOUR SECRET GIFT PERSON IS...";

    const recipient = document.createElement("p");
    recipient.className = "recipient-name";
    recipient.textContent = assignments[name];

    const message = document.createElement("p");
    message.textContent =
        "Shhh! Keep this name a secret until Christmas! 🎁";

    result.append(heading, recipient, message);

    try {
        localStorage.setItem(usedKey, "true");
    } catch (error) {
        result.textContent =
            "Your browser could not save the reveal. Please check your browser settings.";
        return;
    }

    button.disabled = true;
    button.textContent = "Name Revealed ❤️";
}

document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("drawButton");

    button.addEventListener("click", revealName);
});
