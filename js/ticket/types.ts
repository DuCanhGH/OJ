export interface Ticket {
    id: string;
    open: boolean;
    title: string;
    message: string;
    user: string;
    assignees: any[];
    type: "new-ticket" | "ticket-status" | "ticket-message";
}
