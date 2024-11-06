import { cn } from "@/lib/utils";
import React from "react";


interface FrontCardProps extends React.HTMLAttributes<HTMLDivElement> {
}

export const FrontCard = ({ className, children, ...props }: FrontCardProps) => {
    return <div className={cn("bg-front-background text-base text-front-foreground rounded-lg border border-front-primary p-4", className)} {...props}>
        {children}
    </div>
}

FrontCard.Title = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return <div className={cn("font-medium mb-2", className)} {...props}>
        {children}
    </div>
}