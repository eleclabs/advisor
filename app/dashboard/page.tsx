import { auth } from "@/lib/auth";

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    return <div>Please login</div>;
  }

  return (
    <div>
      Welcome {session.user?.name}
      <p>Role: {session.user?.role}</p>
    </div>
  );
}