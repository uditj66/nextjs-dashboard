"use server";
import * as z from "zod";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  date: z.string(),
  status: z.enum(["paid", "pending"]),
});
const CreateInvoice = FormSchema.omit({ id: true, date: true });
export async function createInvoice(formData: FormData) {
  const rawData = {
    customerId: formData.get("customerId"),
    status: formData.get("status"),
    amount: formData.get("amount"),
  };

  /*   for (const pair of formData.entries()) {
       console.log(pair);
     }

    const obj = Object.fromEntries(formData.entries());
     console.log(obj);
  */

  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get("customerId"),
    status: formData.get("status"),
    amount: formData.get("amount"),
  });

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];
  await sql`
  INSERT INTO invoices (customer_id, amount, status, date)
  VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
`;
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}
