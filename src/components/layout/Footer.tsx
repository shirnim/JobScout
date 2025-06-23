import Link from "next/link";
import { Briefcase, Twitter, Linkedin, Github } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-card border-t mt-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:opacity-80 transition-opacity">
                        <Briefcase />
                        <span className="font-headline">JobScout</span>
                    </Link>
                    <p className="text-sm text-muted-foreground order-last md:order-none">
                        &copy; {new Date().getFullYear()} JobScout. All Rights Reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
                            <Twitter className="h-5 w-5" />
                        </Link>
                         <Link href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
                            <Linkedin className="h-5 w-5" />
                        </Link>
                         <Link href="#" aria-label="GitHub" className="text-muted-foreground hover:text-primary transition-colors">
                            <Github className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
