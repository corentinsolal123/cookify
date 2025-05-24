import NextLink from "next/link";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Divider } from "@heroui/divider";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { getFeaturedRecipe, getStats } from "@/lib/data";

export default async function Home() {
    const stats = await getStats();
    const featuredRecipe = await getFeaturedRecipe();

    return (
        <div className="container-custom py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
                            Découvrez et partagez des <span className="text-primary-600 dark:text-primary-400">recettes</span> délicieuses
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Cookify vous permet de créer, organiser et partager vos recettes préférées. Générez automatiquement des listes de courses et planifiez vos repas.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                            as={NextLink}
                            href="/recipes" 
                            color="primary" 
                            size="lg"
                            className="font-medium"
                            endContent={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            }
                        >
                            Explorer les recettes
                        </Button>
                        <Button 
                            as={NextLink}
                            href="/register" 
                            color="secondary" 
                            variant="flat"
                            size="lg"
                            className="font-medium"
                        >
                            Créer un compte
                        </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.recipesCount}+</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Recettes</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.usersCount}+</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Utilisateurs</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.support}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Support</div>
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary-200 dark:bg-primary-900 rounded-full blur-2xl opacity-60"></div>
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary-200 dark:bg-secondary-900 rounded-full blur-2xl opacity-60"></div>
                    <Card className="w-full border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <CardHeader className="pb-0 pt-6 px-6 flex-col items-start">
                            <h4 className="font-bold text-xl text-gray-900 dark:text-white">Recette en vedette</h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Découvrez notre sélection du jour</p>
                        </CardHeader>
                        <CardBody className="py-4 px-6">
                            <div className="relative rounded-xl overflow-hidden mb-4">
                                <Image
                                    alt="Recette en vedette"
                                    className="object-cover w-full aspect-video rounded-xl"
                                    src={featuredRecipe.image}
                                />
                            </div>
                            <h5 className="font-bold text-lg text-gray-900 dark:text-white">{featuredRecipe.name}</h5>
                            <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                                {featuredRecipe.description}
                            </p>
                        </CardBody>
                        <Divider />
                        <CardFooter className="px-6 py-4">
                            <Button 
                                as={NextLink}
                                href={"/recipe/" + featuredRecipe._id}
                                color="primary" 
                                variant="flat" 
                                className="w-full"
                            >
                                Voir la recette
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            <Divider className="my-16" />

            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Fonctionnalités</h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Découvrez tout ce que Cookify peut faire pour vous aider en cuisine
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="border border-gray-200 dark:border-gray-700">
                    <CardBody className="p-6 text-center">
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Gestion de recettes</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Créez, modifiez et organisez facilement vos recettes préférées avec des ingrédients, étapes et photos.
                        </p>
                    </CardBody>
                </Card>

                <Card className="border border-gray-200 dark:border-gray-700">
                    <CardBody className="p-6 text-center">
                        <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-600 dark:text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Liste de courses</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Générez automatiquement des listes de courses à partir de vos recettes sélectionnées pour faciliter vos achats.
                        </p>
                    </CardBody>
                </Card>

                <Card className="border border-gray-200 dark:border-gray-700">
                    <CardBody className="p-6 text-center">
                        <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-warning-600 dark:text-warning-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Planification de repas</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Planifiez vos repas à l'avance et organisez votre semaine culinaire pour gagner du temps.
                        </p>
                    </CardBody>
                </Card>
            </div>

            <div className="mt-16 text-center">
                <Button 
                    as={NextLink}
                    href="/register" 
                    color="primary" 
                    size="lg"
                    className="font-medium"
                >
                    Commencer maintenant
                </Button>
            </div>
        </div>
    );
}
