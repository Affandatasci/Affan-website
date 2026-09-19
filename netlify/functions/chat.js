exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { message } = JSON.parse(event.body);
    if (!message || typeof message !== "string") {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing message" }) };
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "system",
            content: `You are the portfolio assistant for Affan Ahmed Khan. Answer questions about him concisely (2-4 sentences max).

WHO HE IS: AI engineer, Karachi, Pakistan. MS in AI from NED University (NLP & Computer Vision). BE in Mechanical Engineering, NED UET. Available for remote freelance work. 5/5 on Fiverr.

PROJECTS:
- Email Automation Agent: LangGraph agent that reads Gmail, classifies emails, drafts replies, human approval before sending.
- WhatsApp Omnichannel Agent: multi-channel routing across WhatsApp and email.
- Shopify Commerce Agent: handles order status, returns, product queries via WhatsApp/email with live Shopify API data and HITL review.
- Knee OA Detection (MS Thesis): deep learning for knee osteoarthritis detection — Swin-Tiny, EfficientNet-B3, ResNet-50, LP-FT training, TTA, FEA feature fusion.

STACK: Python, LangGraph, Groq, RAG, PyTorch, OpenCV, SQLAlchemy, Streamlit, Gmail API, WhatsApp API, Shopify API, ANSYS, SolidWorks.

CONTACT: affanned399@gmail.com | WhatsApp: +923242639275 | Portfolio: https://affanengr.netlify.app | Fiverr: https://www.fiverr.com/s/xXKlV5a

If you don't know something about Affan, say you're not sure and suggest emailing affanned399@gmail.com.`
          },
          {
            role: "user",
            content: message.slice(0, 500),
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error(`Groq error: ${response.status}`);

    const data = await response.json();
    const reply = data.choices[0].message.content;
    return { statusCode: 200, headers, body: JSON.stringify({ reply }) };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Something went wrong. Please email affanned399@gmail.com" }),
    };
  }
};
