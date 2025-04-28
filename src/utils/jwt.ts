import jwt from "jsonwebtoken";

export const generateToken = (user: any) => {
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET as string, {
    expiresIn: "1d"
  });
};

export const verifyToken = (token: string, secret: string) => {
  try {
    return jwt.verify(token, secret);
  } catch {
    throw new Error("Invalid token");
  }
};
