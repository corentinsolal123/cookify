"use client";

import { Avatar, Card, CardBody, CardHeader, Skeleton } from "@heroui/react";

export default function RecipeFormSkeleton() {
    return (
        <Card isBlurred>
            <CardBody>
                <div className="container mx-auto p-3 grid grid-cols-12 gap-3">
                    {/* 📌 Nom & Infos principales */}
                    <div className="col-span-3 space-y-5">
                        <Card>
                            <CardBody className="p-4 space-y-4">
                                <Skeleton className="w-full h-10 rounded-lg">
                                    <div className="h-10 rounded-lg bg-default-200" />
                                </Skeleton>
                                <Skeleton className="w-full h-10 rounded-lg">
                                    <div className="h-10 rounded-lg bg-default-200" />
                                </Skeleton>
                            </CardBody>
                        </Card>
                        <Card className="space-y-2">
                            <CardBody className="p-4 space-y-4">
                                <Skeleton className="w-full h-10 rounded-lg">
                                    <div className="h-10 rounded-lg bg-default-200" />
                                </Skeleton>
                                <Skeleton className="w-full h-10 rounded-lg">
                                    <div className="h-10 rounded-lg bg-default-200" />
                                </Skeleton>
                                <Skeleton className="w-full h-10 rounded-lg">
                                    <div className="h-10 rounded-lg bg-default-200" />
                                </Skeleton>
                                <Skeleton className="w-full h-10 rounded-lg">
                                    <div className="h-10 rounded-lg bg-default-200" />
                                </Skeleton>
                                <div className="flex items-center space-x-2">
                                    <Skeleton className="rounded-full">
                                        <Avatar size="sm" />
                                    </Skeleton>
                                    <Skeleton className="w-full h-10 rounded-lg">
                                        <div className="h-10 rounded-lg bg-default-200" />
                                    </Skeleton>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* 📜 Étapes de préparation */}
                    <div className="col-span-6">
                        <Card>
                            <CardHeader>
                                <Skeleton className="w-2/5 rounded-lg">
                                    <div className="h-7 rounded-lg bg-default-200" />
                                </Skeleton>
                            </CardHeader>
                            <CardBody>
                                <div className="space-y-2">
                                    {Array(3).fill(null).map((_, index) => (
                                        <div key={index} className="flex items-center space-x-2 mb-2">
                                            <Skeleton className="w-full h-10 rounded-lg">
                                                <div className="h-10 rounded-lg bg-default-200" />
                                            </Skeleton>
                                            <Skeleton className="w-10 h-10 rounded-lg">
                                                <div className="h-10 w-10 rounded-lg bg-default-300" />
                                            </Skeleton>
                                        </div>
                                    ))}
                                    <Skeleton className="w-40 h-10 rounded-lg">
                                        <div className="h-10 w-40 rounded-lg bg-default-300" />
                                    </Skeleton>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* 🔍 Recherche & liste des ingrédients */}
                    <div className="col-span-3">
                        <Card>
                            <CardHeader>
                                <Skeleton className="w-2/5 rounded-lg">
                                    <div className="h-7 rounded-lg bg-default-200" />
                                </Skeleton>
                            </CardHeader>
                            <CardBody>
                                <Skeleton className="w-full h-10 rounded-lg mb-2">
                                    <div className="h-10 rounded-lg bg-default-200" />
                                </Skeleton>
                                <Skeleton className="w-40 h-10 rounded-lg mb-4">
                                    <div className="h-10 w-40 rounded-lg bg-default-300" />
                                </Skeleton>

                                {/* Liste des ingrédients */}
                                {Array(3).fill(null).map((_, index) => (
                                    <div key={index} className="flex items-center space-x-2 mb-2">
                                        <Skeleton className="w-1/3 h-6 rounded-lg">
                                            <div className="h-6 rounded-lg bg-default-200" />
                                        </Skeleton>
                                        <Skeleton className="w-1/3 h-10 rounded-lg">
                                            <div className="h-10 rounded-lg bg-default-200" />
                                        </Skeleton>
                                        <Skeleton className="w-1/3 h-10 rounded-lg">
                                            <div className="h-10 rounded-lg bg-default-200" />
                                        </Skeleton>
                                        <Skeleton className="w-10 h-10 rounded-lg">
                                            <div className="h-10 w-10 rounded-lg bg-default-300" />
                                        </Skeleton>
                                    </div>
                                ))}
                            </CardBody>
                        </Card>
                    </div>

                    {/* ✅ Validation */}
                    <div className="col-span-12 flex justify-end">
                        <Skeleton className="w-40 h-10 rounded-lg">
                            <div className="h-10 w-40 rounded-lg bg-default-300" />
                        </Skeleton>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}