import { NextRequest, NextResponse } from "next/server";

// Mock data for students
const mockStudents = [
  {
    id: "66001",
    name: "นายสมชาย ใจดี",
    level: "ปวช.3",
    status: "ปกติ",
    advisorName: "อาจารย์วิมลรัตน์",
  },
  {
    id: "66002",
    name: "นางสาวจิรา สวยใจ",
    level: "ปวช.3",
    status: "เสี่ยง",
    advisorName: "อาจารย์วิมลรัตน์",
  },
  {
    id: "66003",
    name: "นายสมเด็จ วิจิตร",
    level: "ปวช.2",
    status: "มีปัญหา",
    advisorName: "อาจารย์วิมลรัตน์",
  },
  {
    id: "66004",
    name: "นางสาวมาศ สุขศรี",
    level: "ปวช.3",
    status: "ปกติ",
    advisorName: "อาจารย์วิมลรัตน์",
  },
  {
    id: "66005",
    name: "นายกิจ ขยันหนุ่ม",
    level: "ปวช.2",
    status: "ปกติ",
    advisorName: "อาจารย์วิมลรัตน์",
  },
];

export async function GET(req: NextRequest) {
  // Get query parameters for search and filter
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const level = searchParams.get("level") || "";
  const status = searchParams.get("status") || "";

  let filtered = [...mockStudents];

  // Filter by search term (name or student id)
  if (search) {
    filtered = filtered.filter(
      (student) =>
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.id.includes(search)
    );
  }

  // Filter by level
  if (level) {
    filtered = filtered.filter((student) => student.level === level);
  }

  // Filter by status
  if (status) {
    filtered = filtered.filter((student) => student.status === status);
  }

  return NextResponse.json({
    data: filtered,
    total: filtered.length,
    page: 1,
    pageSize: 10,
  });
}
