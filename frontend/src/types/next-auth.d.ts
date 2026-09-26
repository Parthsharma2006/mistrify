import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email?: string | null;
    mobile: string;
    role: string;
    preferredLanguage: string;
    profilePhoto?: string | null;
  }

  interface Session {
    user: User & {
      id: string;
      role: string;
      mobile: string;
      preferredLanguage: string;
      profilePhoto?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    mobile: string;
    preferredLanguage: string;
    profilePhoto?: string | null;
  }
}
