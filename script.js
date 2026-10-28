
const SUPABASE_URL = "https://ttqpcvkznkqlddnoyahi.supabase.co";
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/secret-santa`;

// This is a public publishable key, not your service-role key.
const SUPABASE_PUBLISHABLE_KEY = "PASTE_YOUR_PUBLISHABLE_KEY_HERE";

const participantInput = document.getElementById("participant");
const accessCodeInput = document.getElementById("accessCode");
const result = document.getElementById("result");
const drawButton = document.getElementById("drawButton");

drawButton.addEventListener("click", async () => {
    const name = participantInput.value;
    const code = accessCodeInput.value.trim();

    result.textContent = "";

    if (!name) {
        result.textContent = "Please choose your name first. 🎄";
        return;
    }

    if (!code) {
        result.textContent = "Please enter your private access code.";
        return;
    }

    drawButton.disabled = true;
    drawButton.textContent = "Revealing... 🎁";

    try {
        const response = await fetch(FUNCTION_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": sb_publishable_Mv9YuYk4xdfAhbyoJftc0w_9IScSCx9
            },
            body: JSON.stringify({
                name: name,
                code: code
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Unable to reveal your person."
            );
        }

        result.textContent =
            `🎁 You're giving a gift to: ${data.recipient}! 🤫`;
    } catch (error) {
        console.error("Secret Santa error:", error);
        result.textContent =
            "Oops! We couldn't reveal your person. Please check your code or try again later. 💚";
    } finally {
        drawButton.disabled = false;
        drawButton.textContent = "Reveal My Person 🎁";
    }
});
