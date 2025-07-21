import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your YathraGo account to manage your transport needs"
    >
      <LoginForm />
    </AuthLayout>
  );
}
