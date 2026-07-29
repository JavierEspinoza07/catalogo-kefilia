const OPENROUTER_API_KEY = "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";
const SYSTEM_PROMPT = "Eres Kefibot, el asistente virtual experto, amable y persuasivo de Kefilia, una empresa de Kefir artesanal en La Paz, Bolivia. Tu objetivo es ayudar a los clientes, responder CUALQUIER pregunta que tengan. Informacion clave: Kefir Natural Bs 40, Strawkefir Bs 48.";

async function testOpenRouter() {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + OPENROUTER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: "Hola, cuánto cuesta el kefir natural?" }
        ]
      })
    });
    console.log("Status:", response.status);
    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log("Reply:", data.choices[0].message.content);
    } else {
      console.log("Response:", JSON.stringify(data));
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
testOpenRouter();
