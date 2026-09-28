import crypto from "crypto";

export function 
generateCheckInToken(): string{
  return crypto.randomBytes(32).toString("hex");
}

export function
 hashCheckInToken(token :string ):
 string{ 
  return crypto
  .createHash("sha256")
  .update(token)
  .digest("hex");

 }