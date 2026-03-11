// app/components/withPermission.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { hasPagePermission, PagePermission } from "@/lib/permissions";

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

      const userRole = session.user?.role;
      const hasPermission = hasPagePermission(userRole, permission);

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
    const hasPermission = hasPagePermission(userRole, permission);

    if (!hasPermission) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}