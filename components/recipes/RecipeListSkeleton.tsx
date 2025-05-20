"use client";

import { Card, CardBody, CardHeader, Divider, Skeleton } from "@heroui/react";

export default function RecipeListSkeleton() {
    // Create an array of 3 items to show multiple skeleton cards
    const skeletonItems = Array(3).fill(null);
    
    return (
        <div className="recipe-list flex flex-col gap-6 items-center">
            {skeletonItems.map((_, index) => (
                <Card
                    key={index}
                    isBlurred
                    className="border-none bg-background/60 dark:bg-default-100/50 w-full max-w-[610px]"
                    shadow="sm"
                >
                    <CardHeader className="flex flex-col gap-1">
                        <Skeleton className="w-3/5 rounded-lg">
                            <div className="h-6 w-3/5 rounded-lg bg-default-200" />
                        </Skeleton>
                    </CardHeader>
                    <Divider className="my-4" />
                    <CardBody>
                        <Skeleton className="w-4/5 rounded-lg mb-2">
                            <div className="h-4 w-4/5 rounded-lg bg-default-200" />
                        </Skeleton>
                        <Skeleton className="w-full rounded-lg mb-2">
                            <div className="h-4 w-full rounded-lg bg-default-200" />
                        </Skeleton>
                        <Skeleton className="w-2/3 rounded-lg">
                            <div className="h-4 w-2/3 rounded-lg bg-default-300" />
                        </Skeleton>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
}