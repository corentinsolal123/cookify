// app/register/page.tsx (Server Component)
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Rejoignez Cookify
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Créez votre compte et commencez à partager vos recettes
                    </p>
                </div>
                <RegisterForm />
            </div>
        </div>
    );
}