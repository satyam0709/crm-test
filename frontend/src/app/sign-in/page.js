import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f9fafb" }}>
      <div style={{ width: "min(100%, 420px)", background: "white", borderRadius: "10px", padding: "1.5rem", boxShadow: "0 6px 30px rgba(0,0,0,0.1)" }}>
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/register"
          afterSignInUrl="/dashboard"
          redirectUrl="/dashboard"
        />
      </div>
    </main>
  );
}
