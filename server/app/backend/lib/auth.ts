import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export function verifyToken(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    throw new Error("No token provided");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new Error("Invalid token format");
  }

  const decoded = jwt.verify(token, JWT_SECRET) as {
    userId: number;
    email: string;
    role: string;
  };

  return decoded;
}