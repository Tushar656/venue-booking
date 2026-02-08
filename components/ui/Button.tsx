import React from "react";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
        const baseStyles =
            "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";

        const variants = {
            primary: "bg-slate-900 text-white hover:bg-slate-900/90 shadow-sm",
            secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
            outline: "border border-slate-200 hover:bg-slate-100 hover:text-slate-900",
            ghost: "hover:bg-slate-100 hover:text-slate-900",
        };

        const sizes = {
            sm: "h-9 px-3",
            md: "h-10 py-2 px-4",
            lg: "h-11 px-8",
        };

        const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

        return (
            <button
                ref={ref}
                className={classes}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
