import AuthLayout from "@/components/auth/AuthLayout";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthLayout
      title="Join YathraGo"
      subtitle="Create your account to start your safe transport journey"
    >
      <SignupForm />
    </AuthLayout>
  );
}
