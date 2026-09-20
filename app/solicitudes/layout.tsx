import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

export default function SolicitudesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 min-w-0">
                    <Header />
                    <main>{children}</main>
                </div>
            </div>
        </ProtectedRoute>
    );
}