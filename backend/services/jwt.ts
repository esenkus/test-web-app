import crypto from "crypto";

class JwtService {
  private secret: string = "verySecureSecret";
  private header: Map<string, string> = new Map<string, string>([
    ["alg", "HS256"],
    ["type", "JWT"],
  ]);

  private HMACSHA256 = (stringToSign: string): string => {
    const hmac = crypto.createHmac("sha256", this.secret);
    const data = hmac.update(stringToSign);
    return data.digest("hex");
  };

  private encodedHeaders: string = Buffer.from(JSON.stringify(this.header))
    .toString("base64")
    .replace(/=/g, "");

  private generateSignature = (
    encodedHeaders: string,
    encodedPayload: string,
  ): string => {
    const signingKey = this.HMACSHA256(`${encodedHeaders}.${encodedPayload}`);
    return Buffer.from(signingKey).toString("base64").replace(/=/g, "");
  };

  public generateJwt = (username: string, permissions: string[]): string => {
    const payload = {
      sub: username,
      iat: Date.now(),
      permissions: permissions,
    };
    const encodedPayload: string = Buffer.from(JSON.stringify(payload))
      .toString("base64")
      .replace(/=/g, "");

    const encodedSignature: string = this.generateSignature(
      this.encodedHeaders,
      encodedPayload,
    );
    return `${this.encodedHeaders}.${encodedPayload}.${encodedSignature}`;
  };

  public validJwt = (jwtToken: string): boolean => {
    const parts = jwtToken.split(".");
    const header = parts[0];
    const payload = parts[1];
    const signature = parts[2];
    const generatedSignature = this.generateSignature(header, payload);
    return signature === generatedSignature;
  };

  public decodeJwt = (jwtToken: string): Record<string, unknown> => {
    const payload = jwtToken.split(".")[1];
    const data = Buffer.from(payload, "base64").toString("utf-8");
    return JSON.parse(data);
  };
}

export const jwtService = new JwtService();
