"use client";

import { useState } from "react";

export default function Register() {
  const [form, setForm] = useState({});

  const submit = async () => {
    await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(form),
    });
  };

  return (
    <div>
      <input placeholder="Name"
        onChange={e=>setForm({...form,name:e.target.value})}/>

      <input placeholder="Email"
        onChange={e=>setForm({...form,email:e.target.value})}/>

      <input type="password"
        onChange={e=>setForm({...form,password:e.target.value})}/>

      <select
        onChange={e=>setForm({...form,role:e.target.value})}
      >
        <option value="TEACHER">ครูที่ปรึกษา</option>
        <option value="EXECUTIVE">ผู้บริหาร</option>
        <option value="COMMITTEE">คณะกรรมการ</option>
      </select>

      <button onClick={submit}>Register</button>
    </div>
  );
}