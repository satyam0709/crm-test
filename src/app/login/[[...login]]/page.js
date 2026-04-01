import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      <SignIn routing="path" path="/login" />
    </div>
  );
}