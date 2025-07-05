async function testGeminiAPI() {
    const apiKey = "AIzaSyCfG0g6hOUndFicxfonWt3zDh7txnN_-HI"; // Replace with your actual API key
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Hello, Gemini Flash!" }] }] })
    });

    if (response.ok) {
        const data = await response.json();
        console.log("✅ Gemini API Response:", data);
    } else {
        console.log(`❌ Error: ${response.status} - ${await response.text()}`);
    }
}

testGeminiAPI();

