"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ProfilePage() {

 const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const res = await fetch("/api/profile");
    const data = await res.json();
    setProfiles(data);
  };  

  const [file, setFile] = useState<File | null>(null);

  const submit = async (e: any) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", e.target.name.value);
    formData.append("email", e.target.email.value);
    if (file) formData.append("image", file);

    await fetch("/api/profile", {
      method: "POST",
      body: formData,
    });

    alert("Saved!");
  };

  return (
    <>
      <form onSubmit={submit}>
        <input name="name" placeholder="Name" />
        <input name="email" placeholder="Email" />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button type="submit">Save Profile</button>
      </form>

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          Profile List
        </h1>

        <div className="grid grid-cols-3 gap-4">
          {profiles.map((p: any) => (
            <div
              key={p._id}
              className="border rounded-lg p-4 shadow"
            >
              <Image
                src={p.image}
                width={200}
                height={200}
                alt="profile"
                className="rounded"
              />

              <h2 className="font-semibold mt-2">
                {p.name}
              </h2>

              <p className="text-gray-500">
                {p.email}
              </p>
            </div>
          ))}
        </div>
      </div>

   </>
  );
}