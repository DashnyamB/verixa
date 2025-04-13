import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { createAccessToken, createRefreshToken } from "../services/jwt-service";
import { env } from "../config/env";
import { parseRefreshToken } from "../helpers";
import { randomBytes } from "crypto";

export const register = async (req: Request) => {
  const { email, password } = await req.json();

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });

  return new Response(
    JSON.stringify({ message: "User registered", userId: user.id }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
};

export const login = async (req: Request) => {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return new Response(JSON.stringify({ message: "Invalid credentials" }), {
      status: 401,
    });
  }

  const accessToken = createAccessToken(user.id);
  const refreshToken = createRefreshToken(user.id);

  // Store refresh token in DB for security
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return new Response(JSON.stringify({ accessToken }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `refreshToken=${refreshToken}; HttpOnly; Path=/auth/refresh; Secure; SameSite=Strict`,
    },
  });
};

export const logout = async (req: Request) => {
    const refreshToken = parseRefreshToken(req);
  
    if (!refreshToken) {
      return new Response(JSON.stringify({ message: "No refresh token found" }), { status: 400 });
    }
  
    try {
      const decoded = jwt.verify(refreshToken, env.jwtSecret) as { userId: string };
  
      // Invalidate refresh token in the database
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { refreshToken: null },
      });
  
      // Clear the refresh token cookie from the client
      return new Response(
        JSON.stringify({ message: "Logged out successfully" }),
        {
          headers: {
            "Set-Cookie": `refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure`,
          },
        }
      );
    } catch (error) {
      return new Response(JSON.stringify({ message: "Error logging out" }), { status: 500 });
    }
  };

export const refreshToken = async (req: Request) => {
  const refreshToken = parseRefreshToken(req);

  if (!refreshToken) {
    return new Response(JSON.stringify({ message: "No refresh token" }), {
      status: 401,
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, env.jwtSecret) as {
      userId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user || user.refreshToken !== refreshToken) {
      return new Response(
        JSON.stringify({ message: "Invalid refresh token" }),
        { status: 401 }
      );
    }

    const newAccessToken = createAccessToken(user.id);
    return new Response(JSON.stringify({ accessToken: newAccessToken }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ message: "Invalid token" }), {
      status: 403,
    });
  }
};

export const resendVerificationEmail = async (req: Request) => {
  const { email } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
  }

  if (user.isVerified) {
    return new Response(JSON.stringify({ message: "User is already verified" }), { status: 400 });
  }

  const verificationToken = randomBytes(32).toString("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationToken,
      verificationTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 30), // Expires in 30 minutes
    },
  });

  // Send verification email again
  // const verificationLink = `${env.APP_URL}/verify-email?token=${verificationToken}`;
  // await sendEmail(user.email, "Verify Your Email", `Click this link to verify your email: ${verificationLink}`);

  return new Response(JSON.stringify({ message: "Verification email resent" }), { status: 200 });
};

export const redirectToOAuth = async (req: Request) => {
  const provider = new URL(req.url).searchParams.get("provider");

  if (provider === "google") {
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/auth");
    googleAuthUrl.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.set("redirect_uri", `${env.APP_URL}/oauth/callback/google`);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");

    return new Response(null, { status: 302, headers: { Location: googleAuthUrl.toString() } });
  }

  return new Response(JSON.stringify({ message: "Unsupported provider" }), { status: 400 });
};

export const handleOAuthCallback = async (req: Request) => {
  const provider = new URL(req.url).pathname.split("/").pop(); // Get provider from URL
  const code = new URL(req.url).searchParams.get("code");

  if (!code) {
    return new Response(JSON.stringify({ message: "Authorization code missing" }), { status: 400 });
  }

  let tokenUrl, profileUrl, clientId, clientSecret;

  if (provider === "google") {
    tokenUrl = "https://oauth2.googleapis.com/token";
    profileUrl = "https://www.googleapis.com/oauth2/v2/userinfo";
    clientId = env.GOOGLE_CLIENT_ID;
    clientSecret = env.GOOGLE_CLIENT_SECRET;
  } else {
    return new Response(JSON.stringify({ message: "Unsupported provider" }), { status: 400 });
  }

  // Exchange code for access token
  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${env.APP_URL}/oauth/callback/${provider}`,
      grant_type: "authorization_code",
      code,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return new Response(JSON.stringify({ message: "Failed to get access token" }), { status: 400 });
  }

  // Fetch user profile
  const profileRes = await fetch(profileUrl, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const profile = await profileRes.json();

  // Check if user already exists
  let user = await prisma.user.findUnique({ where: { oauthProviderId: profile.id as string } });

  if (!user) {
    // Create a new user
    user = await prisma.user.create({
      data: {
        email: profile.email,
        oauthProvider: provider,
        oauthProviderId: profile.id as string,
        isVerified: true, // OAuth emails are already verified
        password: "null", // No password for OAuth users
      },
    });
  }

  // Generate JWT Token
  const accessToken = await createAccessToken(user.id);

  return new Response(JSON.stringify({ accessToken }), { status: 200 });
};
