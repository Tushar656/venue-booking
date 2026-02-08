import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full border-t border-border/40 bg-background py-6 md:py-0">
            <div className="container w-full max-w-screen-xl flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-6 mx-auto">
                <p className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm leading-loose text-muted-foreground md:justify-start">
                    <a href="https://drive.google.com/file/d/19VuWRETlTBUgwiX7ZrnPWHM4liWIlKIb/view" className="hover:underline">Tushar Verma</a>
                    <a href="https://github.com/Tushar656" className="hover:underline">GitHub</a>
                    <a href="https://www.linkedin.com/in/tushar-verma-502a86204/" className="hover:underline">LinkedIn</a>
                </p>
            </div>
        </footer>
    );
}
