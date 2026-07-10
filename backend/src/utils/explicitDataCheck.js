// explicitDataCheck.js

async function checkExplicitContent(req, res, next) {
    try {
      const { username, email } = req.body;
  
      // Skip if username or email is missing or invalid
      if (
        typeof username !== "string" ||
        typeof email !== "string" ||
        !username.trim() ||
        !email.trim()
      ) {
        return next();
      }
  
      const moderationPrompt = `
  You are a strict content moderation API.
  Analyze the username and email for any offensive, abusive, vulgar, explicit, or hateful language.
  
  Username: ${username}
  Email: ${email}
  
  Focus on:
  - English profane and abusive words
  - Telugu offensive words (including romanized forms)
  - Hindi offensive words (including romanized forms)
  
  Rules:
  - Detect clear offensive intent even if mixed with numbers or symbols
  - Be strict with Telugu and English
  - Return ONLY valid JSON
  - If in doubt, mark as safe
  
  Reply only with this format:
  
  Safe:
  {"safe": true}
  
  Unsafe:
  {"safe": false, "field": "username", "reason": "Contains inappropriate language"}
  
  OR
  {"safe": false, "field": "email", "reason": "Contains inappropriate language"}
  `;
  
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY1}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: moderationPrompt,
              },
            ],
            temperature: 0,
            response_format: {
              type: "json_object",
            },
          }),
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error("Groq API Error:", data);
        return next();
      }
  
      let result;
      try {
        result = JSON.parse(data.choices[0].message.content);
      } catch (err) {
        console.error("Invalid JSON from Groq");
        return next();
      }
  
      if (!result.safe) {
        return res.status(400).json({
          message: result.reason || "Inappropriate content detected.",
          field: result.field || "username",
        });
      }
  
      return next();
    } catch (err) {
      console.error("Moderation Error:", err);
      return next(); 
    }
  }
  
  module.exports = checkExplicitContent;