"use client";

import { Link } from "@heroui/react";

export const Footer = () => {
    return (
        <footer className="w-full flex items-center justify-center py-3">
            <Link
                isExternal
                className="flex items-center gap-1 text-current"
                href="#"
                title="heroui.com homepage"
            >
                <span className="text-default-600">Powered by &nbsp;</span>
                <p className="text-primary">Co&Co² Enterprise</p>
            </Link>
        </footer>);
};
