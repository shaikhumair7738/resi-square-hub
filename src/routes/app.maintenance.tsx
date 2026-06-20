import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/app/maintenance")({ component: () => <Outlet /> });
