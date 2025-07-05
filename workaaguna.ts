async function testGeminiAPI() {
    const apiKey = "YOUR_API_KEY"; // Replace with your actual key
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Hello, Gemini!" }] }] })
    });

    if (response.ok) {
        const data = await response.json();
        console.log("✅ Gemini API Response:", data);
    } else {
        console.log(`❌ Error: ${response.status} - ${await response.text()}`);
    }
}

testGeminiAPI();
