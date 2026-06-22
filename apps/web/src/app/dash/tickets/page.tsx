"use client";

import React, { useEffect, useState } from "react";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default function Page() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="p-10 text-center">Loading...</div>;

    return (
        <main className="mx-auto mt-16 flex min-h-[70%] w-full max-w-5xl flex-col items-center p-4">
            <h1 className="mb-10 text-6xl font-extrabold text-hackathon md:text-8xl">
                Tickets
            </h1>
            <div className="flex w-full max-w-[500px] flex-col items-center rounded-xl bg-white p-5 backdrop-blur transition dark:bg-white/[0.08]">
                <h1 className="text-xl font-bold">Ticket Creation Coming Soon</h1>
            </div>
        </main>
    );
}