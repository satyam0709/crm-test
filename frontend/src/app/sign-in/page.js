import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f9fafb" }}>
        <SignIn path="/sign-in" routing="path" signUpUrl="/register" afterSignInUrl="/dashboard" />
    </main>
  );
}
