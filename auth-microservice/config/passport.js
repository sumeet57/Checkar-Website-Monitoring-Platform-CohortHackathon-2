import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";
import { generateTokens } from "../services/token.service.js";
import env from "./env.js";
import { oauthUser } from "../services/auth.service.js";

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(
  new GoogleStrategy(
    {
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: env.googleCallbackUrl,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, googleProfile, done) => {
      try {
        const profile = {
          firstName: googleProfile.name.givenName,
          lastName: googleProfile.name.familyName,
          email: googleProfile.emails[0].value,
          googleId: googleProfile.id,
        };

        const result = await oauthUser(profile, req.res);
        if (result.success) {
          return done(null, result);
        } else {
          return done(new Error("OAuth authentication failed"), null);
        }
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);
