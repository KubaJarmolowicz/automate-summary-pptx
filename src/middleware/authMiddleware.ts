import { Request, Response, NextFunction } from "express";

export const protectForm = (
  req: Request & { session: any },
  res: Response,
  next: NextFunction
) => {
  if (req.path.endsWith(".css") || req.path.endsWith(".png")) {
    return next();
  }

  if (req.session.isAuthenticated) {
    return next();
  }

  if (
    req.method === "POST" &&
    req.body.password === process.env.FORM_PASSWORD
  ) {
    req.session.isAuthenticated = true;
    res.redirect("/");
    return;
  }

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
