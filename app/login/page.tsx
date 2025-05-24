// app/login/page.tsx (Server Component)
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Bon retour sur Cookify
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Connectez-vous pour retrouver vos recettes
                    </p>
                </div>
                <LoginForm />
            </div>
        </div>
    );
}