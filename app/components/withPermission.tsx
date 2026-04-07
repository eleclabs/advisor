// app/components/withPermission.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { hasPagePermission, PagePermission, Role } from "@/lib/permissions";

export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permission: PagePermission,
  options?: {
    redirectTo?: string;
    loadingComponent?: React.ReactNode;
  }
) {
  const {
    redirectTo = "/unauthorized",
    loadingComponent = (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  } = options || {};

  return function WithPermissionComponent(props: P) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === "loading") return;

      if (!session) {
        router.push("/login");
        return;
      }

      const userRole = session?.user?.role;
      
      // Handle STUDENT role specifically for localStorage authentication
      const isStudentRole = userRole === "STUDENT";
      const isStudentAuthenticated = isStudentRole || 
        (localStorage.getItem('isStudent') === 'true' && localStorage.getItem('token'));
      
      // Allow access if:
      // 1. Has NextAuth session with valid permission, OR
      // 2. Is student role AND has valid localStorage authentication
      const hasValidAuth = session || isStudentAuthenticated;
      
      if (!hasValidAuth) {
        router.push("/login");
        return;
      }

      const hasPermission = hasPagePermission(userRole as Role | undefined, permission);

      if (!hasPermission) {
        router.push(redirectTo);
      }
    }, [session, status, router]);

    if (status === "loading") {
      return loadingComponent;
    }

    if (!session) {
      return null;
    }

    const userRole = session.user?.role;
    const hasPermission = hasPagePermission(userRole as Role, permission);

    if (!hasPermission) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}