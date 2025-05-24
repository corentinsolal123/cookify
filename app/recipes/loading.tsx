// app/recipes/loading.tsx (Skeleton pour toute la page)
import RecipeListSkeleton from "@/components/recipes/RecipeListSkeleton";

export default function Loading() {
    return (
        <main className="pb-6 h-full w-full">
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mb-8 pb-6">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-64"></div>
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48 mt-2"></div>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-64"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-40"></div>
                        </div>
                    </div>
                </div>
            </div>
            <RecipeListSkeleton />
        </main>
    );
}