// ============================================================
// lib/auth.js — NextAuth v5 Configuration (Full Auth System)
// 3 Providers: Google, Email+Password, Mobile Number
// ============================================================
import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { sendPushNotification } from "@/lib/onesignal-server";

// ── Custom error: passes real message as res.code to the client ──
class AuthError extends CredentialsSignin {
  constructor(msg) {
    super(msg);
    this.code = msg;         // res.code on the client
    this.message = msg;      // keeps stack trace readable
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // ── Google OAuth ──────────────────────────────────────
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // ── Credentials Provider 1: Email + Password ──────────
    Credentials({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new AuthError("Email and password are required");
        }

        await dbConnect();

        const user = await User.findOne({
          email: credentials.email.toLowerCase().trim(),
        }).select("+password +loginAttempts +lockUntil +isVerified +isActive");

        if (!user) {
          throw new AuthError("No account found with this email address");
        }

        // ── Check account lock ──────────────────────────────
        if (user.lockUntil && user.lockUntil > new Date()) {
          const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
          throw new AuthError(
            `Account locked. Try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.`
          );
        }

        // ── Check account status ────────────────────────────
        if (!user.isActive) {
          throw new AuthError("This account has been deactivated. Contact support.");
        }

        if (!user.isVerified) {
          throw new AuthError("Please verify your email before logging in.");
        }

        if (!user.password) {
          throw new AuthError("This account uses Google sign-in. Please use the Google button, or set a password in your profile settings.");
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          const newAttempts = (user.loginAttempts || 0) + 1;
          const updateData = { loginAttempts: newAttempts };

          // Lock after 5 failed attempts for 30 minutes
          if (newAttempts >= 5) {
            updateData.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
            updateData.loginAttempts = 0;
          }

          await User.findByIdAndUpdate(user._id, updateData);

          const remaining = Math.max(0, 5 - newAttempts);
          throw new AuthError(
            remaining > 0
              ? `Incorrect password. ${remaining} attempt${remaining > 1 ? "s" : ""} remaining.`
              : "Account locked for 30 minutes due to too many failed attempts."
          );
        }

        // ── Successful login ────────────────────────────────
        await User.findByIdAndUpdate(user._id, {
          loginAttempts: 0,
          lockUntil: null,
          lastLogin: new Date(),
        });

        // Send login push notification
        await sendPushNotification({
          userId: user._id,
          title: "Login Successful 🔐",
          message: `Welcome back, ${user.name.split(' ')[0]}! You have successfully signed in to CareerForge AI.`,
          url: "/"
        }).catch(() => {});

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.profilePicture || user.image,
          role: user.role,
          isVerified: user.isVerified,
          profileCompleted: user.profileCompleted,
          username: user.username,
        };
      },
    }),

    // ── Credentials Provider 2: Mobile Number Only ─────────
    Credentials({
      id: "mobile",
      name: "Mobile Number",
      credentials: {
        phone: { label: "Phone Number", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone) {
          throw new AuthError("Phone number is required");
        }

        const phoneClean = credentials.phone.trim().replace(/\D/g, "");
        if (phoneClean.length !== 10) {
          throw new AuthError("Please enter a valid 10-digit mobile number");
        }

        await dbConnect();

        const user = await User.findOne({ phone: phoneClean });

        if (!user) {
          throw new AuthError("Mobile number not registered. Please sign up first.");
        }

        if (!user.isActive) {
          throw new AuthError("This account has been deactivated. Contact support.");
        }

        // ── Successful mobile login ─────────────────────────
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        // Send login push notification
        await sendPushNotification({
          userId: user._id,
          title: "Login Successful 🔐",
          message: `Welcome back, ${user.name.split(' ')[0]}! You have successfully signed in to CareerForge AI.`,
          url: "/"
        }).catch(() => {});

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.profilePicture || user.image,
          role: user.role,
          profileCompleted: user.profileCompleted,
          username: user.username,
          phone: user.phone,
        };
      },
    }),
  ],

  // ── Session Strategy ───────────────────────────────────────
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },

  // ── Callbacks ──────────────────────────────────────────────
  callbacks: {
    // Handle Google sign-in: auto-create user if not exists
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await dbConnect();

          let dbUser = await User.findOne({ email: profile.email.toLowerCase() });
          let isNewUser = false;

          if (!dbUser) {
            // New user — create with profileCompleted: false
            isNewUser = true;
            dbUser = await User.create({
              name: profile.name,
              email: profile.email.toLowerCase(),
              googleId: profile.sub,
              image: profile.picture,
              isVerified: true,
              emailVerified: new Date(),
              password: null,
              profileCompleted: false,
            });
          } else if (!dbUser.googleId) {
            // Existing email/password user linking Google
            await User.findByIdAndUpdate(dbUser._id, {
              googleId: profile.sub,
              image: profile.picture,
              isVerified: true,
            });
          }

          // Inject DB data so JWT callback can use it
          user.id = dbUser._id.toString();
          user.role = dbUser.role;
          user.isVerified = true;
          user.profileCompleted = dbUser.profileCompleted;
          user.username = dbUser.username;
          user.isNewGoogleUser = isNewUser;

          // Send push notification for Google sign-in
          if (isNewUser) {
            await sendPushNotification({
              userId: dbUser._id,
              title: "Welcome to CareerForge AI! 🎉",
              message: `Hi ${dbUser.name.split(' ')[0]}, your account has been created successfully. Let's build your career!`,
              url: "/complete-profile"
            }).catch(() => {});
          } else {
            await sendPushNotification({
              userId: dbUser._id,
              title: "Login Successful 🔐",
              message: `Welcome back, ${dbUser.name.split(' ')[0]}! You've securely signed in via Google.`,
              url: "/"
            }).catch(() => {});
          }

          return true;
        } catch (error) {
          console.error("[auth.js] Google signIn error:", error.message);
          return false;
        }
      }
      return true; // Credentials providers handled in authorize()
    },

    // Persist user data in JWT token
    async jwt({ token, user, trigger, session }) {
      // ── Initial sign-in: populate token from user object ──
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.image = user.image;
        token.profileCompleted = user.profileCompleted;
        token.username = user.username;
        token.isFirstLogin = user.isFirstLogin;
      }

      // ── Client called update() → sync fields into token ───
      // This is triggered when CompleteProfileForm calls update({ profileCompleted: true })
      if (trigger === "update" && session) {
        if (session.profileCompleted !== undefined) {
          token.profileCompleted = session.profileCompleted;
        }
        if (session.username !== undefined) token.username = session.username;
        if (session.phone !== undefined) token.phone = session.phone;
      }

      // Safety net removed. We rely on the 'update' trigger and initial sign-in to set this.
      // Doing a DB query in the JWT callback on every request can significantly slow down the app.

      return token;
    },

    // Expose safe data to session (NEVER expose password)
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isVerified = token.isVerified;
        session.user.image = token.image;
        session.user.profileCompleted = token.profileCompleted;
        session.user.username = token.username;
        session.user.isFirstLogin = token.isFirstLogin;
      }
      return session;
    },
  },

  // ── Custom Pages ───────────────────────────────────────────
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // ── Security ───────────────────────────────────────────────
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
});
