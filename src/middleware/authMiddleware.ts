import { Request, Response, NextFunction } from "express";
import path from "path";

const PUBLIC_DIR =
  process.env.NODE_ENV === "production"
    ? path.join(process.cwd(), "dist", "public")
    : path.join(__dirname, "../public");

export const protectForm = (
  req: Request & { session: any },
  res: Response,
  next: NextFunction
) => {
  console.log("Auth check:", {
    path: req.path,
    method: req.method,
    isAuthenticated: req.session.isAuthenticated,
    sessionID: req.sessionID,
  });

  if (req.path.endsWith(".css") || req.path.endsWith(".png")) {
    return next();
  }

  if (req.session.isAuthenticated) {
    console.log("User is authenticated, proceeding...");
    if (req.path === "/") {
      return res.sendFile(path.join(PUBLIC_DIR, "index.html"));
    }
    return next();
  }

  if (
    req.method === "POST" &&
    req.body.password === process.env.FORM_PASSWORD
  ) {
    console.log("Password correct, setting session...");
    req.session.isAuthenticated = true;
    req.session.save((err: Error | null) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).send("Session error");
      }
      console.log("Session saved with ID:", req.sessionID);
      return res.redirect("/");
    });
    return;
  }

  console.log("Not authenticated, showing login form...");
  res.status(401).send(`
    <html>
      <head>
        <title>Access Required</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: #f5f5f5;
          }
          form {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          input, button {
            margin: 0.5rem 0;
            padding: 0.8rem;
            width: 100%;
            box-sizing: border-box;
          }
          button {
            background: #0066ff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <form method="POST">
          <h2>Access Required</h2>
          <input type="password" name="password" placeholder="Enter password" required>
          <button type="submit">Submit</button>
        </form>
      </body>
    </html>
  `);
};
