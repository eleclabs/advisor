// proxy.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { hasPagePermission, PagePermission } from './lib/permissions';

// แผนที่เส้นทางกับสิทธิ์ที่ต้องการ (คงเดิม)
const pathPermissions: Record<string, PagePermission> = {
  '/student': 'STUDENT_LIST',
  '/student/student_add': 'STUDENT_CREATE',
  '/student/student_detail': 'STUDENT_VIEW',
  '/student/student_detail/(.*)/edit': 'STUDENT_EDIT',
  '/student_learn': 'LEARN_LIST',
  '/student_learn/create': 'LEARN_CREATE',
  '/student_learn/(.*)/edit': 'LEARN_EDIT',
  '/student_learn/(.*)/record': 'LEARN_RECORD',
  '/student_learn/(.*)/album': 'LEARN_ALBUM',
  '/student_problem': 'PROBLEM_LIST',
  '/student_problem/add': 'PROBLEM_CREATE',
  '/student_problem/(.*)/edit': 'PROBLEM_EDIT',
  '/student_problem/activity': 'PROBLEM_ACTIVITY',
  '/student_problem/(.*)/result': 'PROBLEM_EVALUATION',
  '/student_send': 'SEND_LIST',
  '/student_send/new': 'SEND_CREATE',
  '/student_send/(.*)/edit': 'SEND_EDIT',
  '/student_send/(.*)/coordination': 'SEND_COORDINATION',
  '/student_send/(.*)/followup': 'SEND_FOLLOWUP',
  '/user': 'USER_LIST',
  '/user/new': 'USER_CREATE',
  '/user/(.*)/edit': 'USER_EDIT',
  '/dashboard': 'DASHBOARD_VIEW',
  '/committees/plan': 'COMMITTEE_PLAN',
  '/committees/assign': 'COMMITTEE_ASSIGN',
  '/committees/roles': 'COMMITTEE_ROLES',
  '/major': 'MAJOR_LIST',
};

// ฟังก์ชันหา permission (คงเดิม)
function getPermissionFromPath(path: string): PagePermission | null {
  const cleanPath = path.split('?')[0].replace(/\/$/, '');
  
  if (pathPermissions[cleanPath]) return pathPermissions[cleanPath];
  
  for (const [pattern, permission] of Object.entries(pathPermissions)) {
    if (pattern.includes('(.*)')) {
      const regexPattern = pattern.replace(/\(\.\*\)/g, '[^/]+');
      const regex = new RegExp(`^${regexPattern}$`);
      if (regex.test(cleanPath)) return permission as PagePermission;
    }
  }
  
  if (cleanPath.startsWith('/student/student_detail/') && cleanPath.includes('/assessment/')) {
    return 'STUDENT_ASSESSMENT';
  }
  if (cleanPath.startsWith('/student/student_detail/') && cleanPath.includes('/interview/')) {
    return 'STUDENT_INTERVIEW';
  }
  
  return null;
}

// ✅ เปลี่ยนจาก middleware เป็น proxy (ตามที่ Next.js ต้องการ)
export async function proxy(req: NextRequest) {
  const token = await getToken({ req });
  const path = req.nextUrl.pathname;

  // หน้าและ API ที่ไม่ต้องล็อกอิน
  if (path === '/login' || path === '/register' || path === '/' || path.startsWith('/api/register')) {
    return NextResponse.next();
  }

  // ถ้าไม่มี token → redirect ไป login
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }

  // ตรวจสอบสิทธิ์
  const requiredPermission = getPermissionFromPath(path);
  
  if (!requiredPermission) {
    return NextResponse.next();
  }

  const userRole = token.role as string;
  const hasPermission = hasPagePermission(userRole, requiredPermission);

  if (!hasPermission) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

// export const config (คงเดิม)
export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login|register).*)',
  ],
};