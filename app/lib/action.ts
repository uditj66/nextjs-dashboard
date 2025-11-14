"use server";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import * as z from "zod";
import postgres from "postgres";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({ invalid_type_error: "Please select a customer" }),
  amount: z.coerce
    .number({
      description: "Please select an amount",
      required_error: "This is Required",
      invalid_type_error: "The amount should be a number",
    })
    .gt(0, { message: "The amount should be a valid number" }),
  date: z.string(),
  status: z.enum(["paid", "pending"], {
    description: "Please select the status",
    required_error: "This is required",
    invalid_type_error: "Select any one",
  }),
});
const CreateInvoice = FormSchema.omit({ id: true, date: true });
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
export async function createInvoice(prevState: State, formData: FormData) {
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

  // Validate form using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    status: formData.get("status"),
    amount: formData.get("amount"),
  });
  console.log(validatedFields.error);

  // If form validation fails, return errors early. Otherwise, continue
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }
  const { amount, customerId, status } = validatedFields.data;
  const amountInCents = amount * 100;
  // const date = new Date().toLocaleString("en-IN");
  // console.log(date);

  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status)
    VALUES (${customerId}, ${amountInCents}, ${status})`;
  } catch (error) {
    console.error(error);
    // return {
    //   message: "Database action failed , Invoice is not created",
    // };
  }
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
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}`;
  } catch (error) {
    console.error(error);
    throw error;

    // return {
    //   message: "Database action failed , Invoice not updated",
    // };
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}
export async function deleteInvoice(id: string) {
  // throw new Error("Something happens with the deleting the invoice");
  await sql`
  DELETE FROM invoices where id=${id}`;

  revalidatePath("/dashboard/invoices");
}
export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}
