import { auth } from "@repo/auth";
import { Role } from "../generated-prisma-client/client";

async function main() {
  console.log("Seeding");

  const pm = await auth.api.signUpEmail({
    body: {
      email: "pm@example.com",
      name: "Project Manager",
      password: "password",
      role: "PROJECT_MANAGER" as Role,
    },
    asResponse: true,
  });

  const programmer = await auth.api.signUpEmail({
    body: {
      email: "programmer@example.com",
      name: "Programmer",
      password: "password",
      role: "PROGRAMMER" as Role,
    },
    asResponse: true,
  });

  console.log("Programmer: ", programmer);
  console.log("PM: ", pm);
}

main();
