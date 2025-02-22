"use client";

import { subtitle, title } from "@/components/global/Primitives";
import { Card, CardBody } from "@heroui/react";

export default function Home() {
    return (
        <Card isBlurred className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
            <CardBody className="inline-block max-w-xl text-center justify-center">
                <span className={title()}>Work in&nbsp;</span>
                <span className={title({ color: "yellow" })}>Progress.&nbsp;</span>
                <br />
                <span className={title()}>
                    Super site de recette.
                </span>
                <div className={subtitle({ class: "mt-4" })}>
                    Avec création de liste de course eheh.
                </div>
            </CardBody>
        </Card>
    );
}
