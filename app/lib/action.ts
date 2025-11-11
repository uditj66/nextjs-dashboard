"use server";
import * as z from "zod";
import postgres from "postgres";
import { revalidatePath, revalidateTag } from "next/cache";
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
  // const date = new Date().toLocaleString("en-IN");
  // console.log(date);

  await sql`
  INSERT INTO invoices (customer_id, amount, status)
  VALUES (${customerId}, ${amountInCents}, ${status})
`;
  // revalidatePath("/dashboard/invoices");
  // revalidatePath("/dashboard");
  revalidatePath("/", "layout");
  redirect("/dashboard/invoices");
}
export async function updateInvoice(id: string, formData: FormData) {
  const updatedInvoice = FormSchema.omit({ id: true, date: true });
  const { customerId, amount, status } = updatedInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  const amountInCents = amount * 100;
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}`;
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}
export async function deleteInvoice(id: string) {
  await sql`
  DELETE FROM invoices where id=${id}`;

  revalidatePath("/dashboard/invoices");
}
