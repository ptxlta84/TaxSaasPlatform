const payload = {
  name: "TestUserDebug",
  email: "testdebug@example.com",
  password: "password123",
  mobile: "1122334455"
};

async function test() {
  const payload2 = { ...payload, email: "testdebug2@example.com", mobile: "9988112244" }; // Unique
  const payload3 = { ...payload, email: "testdebug3@example.com", mobile: "9988112244" }; // Duplicate mobile

  console.log("\n1. Registering user (New Mobile)...");
  try {
    const res1 = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload2)
    });
    const data1 = await res1.json();
    console.log("Status:", res1.status);
    console.log("Response:", data1);
  } catch (e) {
    console.error("Req 1 failed", e);
  }

  console.log("\n2. Registering duplicate MOBILE...");
  try {
    const res2 = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload3)
    });
    const data2 = await res2.json();
    console.log("Status:", res2.status);
    console.log("Response:", data2);
  } catch (e) {
      console.error("Req 2 failed", e);
  }
}

test();
