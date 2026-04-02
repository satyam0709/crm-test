import { SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "Sign In – RND TECHNOSOFT CRM",
  description: "Sign in to your RND TECHNOSOFT CRM account.",
};

export default function SignInPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f9fafb" }}>
      <section style={{ width: "min(100%, 420px)", padding: "2rem", borderRadius: "12px", background: "white", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
        <h1 style={{ marginBottom: "1rem", fontSize: "1.5rem", textAlign: "center" }}>Sign in to RND TECHNOSOFT CRM</h1>
        <SignIn path="/sign-in" routing="path" signUpUrl="/register" afterSignInUrl="/dashboard" />
      </section>
    </main>
  );
}
