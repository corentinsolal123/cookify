"use client";

import { Avatar, Card, CardBody, CardHeader, Divider, Skeleton } from "@heroui/react";

export default function RecipeDetailSkeleton() {
    return (
        <div className="container mx-auto p-6 grid grid-cols-12 gap-6">
            {/* Image et infos pratiques */}
            <div className="col-span-3 space-y-4">
                <Card>
                    <CardBody className="p-4 space-y-2">
                        <Skeleton className="w-3/5 rounded-lg">
                            <div className="h-6 rounded-lg bg-default-200" />
                        </Skeleton>
                        <Skeleton className="w-full h-48 rounded-lg">
                            <div className="w-full h-48 rounded-lg bg-default-300" />
                        </Skeleton>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-4 space-y-2">
                        <Skeleton className="w-1/3 rounded-lg">
                            <div className="h-5 rounded-lg bg-default-200" />
                        </Skeleton>
                        <Skeleton className="w-2/3 rounded-lg">
                            <div className="h-5 rounded-lg bg-default-200" />
                        </Skeleton>
                        <Skeleton className="w-2/3 rounded-lg">
                            <div className="h-5 rounded-lg bg-default-200" />
                        </Skeleton>
                        <Skeleton className="w-2/3 rounded-lg">
                            <div className="h-5 rounded-lg bg-default-200" />
                        </Skeleton>
                        <div className="flex items-center space-x-2">
                            <Skeleton className="rounded-full">
                                <Avatar size="sm" />
                            </Skeleton>
                            <Skeleton className="w-20 rounded-lg">
                                <div className="h-5 rounded-lg bg-default-200" />
                            </Skeleton>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Étapes de préparation */}
            <div className="col-span-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="w-2/5 rounded-lg">
                            <div className="h-7 rounded-lg bg-default-200" />
                        </Skeleton>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-2">
                            {Array(5).fill(null).map((_, index) => (
                                <Skeleton key={index} className="w-full rounded-lg">
                                    <div className="h-5 rounded-lg bg-default-200" />
                                </Skeleton>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Liste des ingrédients */}
            <div className="col-span-3 space-y-4">
                <Card>
                    <CardHeader>
                        <Skeleton className="w-2/5 rounded-lg">
                            <div className="h-7 rounded-lg bg-default-200" />
                        </Skeleton>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-2">
                            {Array(4).fill(null).map((_, index) => (
                                <div key={index} className="flex justify-between">
                                    <Skeleton className="w-2/5 rounded-lg">
                                        <div className="h-5 rounded-lg bg-default-200" />
                                    </Skeleton>
                                    <Skeleton className="w-1/3 rounded-lg">
                                        <div className="h-5 rounded-lg bg-default-200" />
                                    </Skeleton>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* Ajout à la liste de courses */}
                <Card>
                    <CardHeader>
                        <Skeleton className="w-2/5 rounded-lg">
                            <div className="h-7 rounded-lg bg-default-200" />
                        </Skeleton>
                    </CardHeader>
                    <CardBody>
                        <Skeleton className="w-full rounded-lg">
                            <div className="h-10 rounded-lg bg-default-300" />
                        </Skeleton>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}