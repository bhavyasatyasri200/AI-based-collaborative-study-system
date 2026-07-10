async function checkExplicitContent(req, res, next) {
    try {
      const { username, email } = req.body;
  
      const response = await fetch("https://api.openai.com/v1/moderations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "omni-moderation-latest",
          input: [username, email],
        }),
      });
  
      if (!response.ok) {
        const error = await response.json();
      
        console.error("Status:", response.status);
        console.error("Error:", error);
      
        return res.status(response.status).json(error);
      }
  
      const data = await response.json();
  
      if (data.results[0].flagged) {
        return res.status(400).json({
          message: "Username contains inappropriate content.",
        });
      }
  
      if (data.results[1].flagged) {
        return res.status(400).json({
          message: "Email contains inappropriate content.",
        });
      }
  
      next();
    } catch (err) {
      console.error("Moderation Error:", err);
  
      return res.status(500).json({
        message: "Internal server error.",
      });
    }
  }

module.exports = checkExplicitContent;