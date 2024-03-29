import User from "@/models/User";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { mongooseConnect } from "@/lib/mongoose";

export default NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      async authorize(creadentials) {

        await mongooseConnect();


        const user = await User.findOne({
          email: creadentials.email,
        });

        if (
          user &&
          bcryptjs.compareSync(creadentials.password, user.password)
        ) {
          return {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
          };
        }

        throw new Error("Invalid email or password");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?._id) {
        token._id = user._id;
      }

      if (user?.isAdmin) {
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {

      if (token?._id) {
        session.user._id = token._id;
      }
      if (token?.isAdmin) {
        session.user.isAdmin = token.isAdmin;
      }
      console.log(session);
      return session;
    },

  },
});
