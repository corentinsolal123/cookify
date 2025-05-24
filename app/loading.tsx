// app/loading.tsx
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";

export default function Loading() {
    return (
        <div className="container-custom py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-6">
                    <div>
                        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-4"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>

                <Card className="w-full border border-gray-200 dark:border-gray-700">
                    <CardHeader>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
                    </CardHeader>
                    <CardBody>
                        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-4"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}