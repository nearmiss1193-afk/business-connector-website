import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";

const schema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .transform((v) => (v ?? "").trim())
    .refine((v) => /[0-9()+\-\s]{7,}/.test(v), {
      message: "Enter a valid phone number",
    }),
  message: z.string().max(2000).optional(),
  agreeTerms: z
    .boolean()
    .refine((v) => v === true, { message: "You must agree to the Terms and Privacy" }),
  agreeConsent: z
    .boolean()
    .refine((v) => v === true, { message: "Please consent to communications" }),
});

export type LeadContactFormValues = z.infer<typeof schema>;

export default function LeadContactForm({ propertyId, onSuccess }: { propertyId?: string, onSuccess?: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LeadContactFormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: LeadContactFormValues) => {
    try {
      const payload = {
        type: "contact",
        source: propertyId ? "property-detail" : "contact-page",
        propertyId: propertyId ?? null,
        data: values,
        meta: {
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          location: window.location.href,
          timestamp: new Date().toISOString(),
        },
      };
      const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
      let recaptchaToken: string | undefined = undefined;
      if (siteKey) {
        // load reCAPTCHA v3 script on demand
        if (!(window as any).grecaptcha) {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement("script");
            s.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
            s.async = true;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error("Failed to load reCAPTCHA"));
            document.head.appendChild(s);
          });
        }
        recaptchaToken = await (window as any).grecaptcha.execute(siteKey, { action: "lead" });
      }
      // send to server which verifies reCAPTCHA (if secret configured) and relays to webhook
      const resp = await axios.post("/api/lead", { recaptchaToken, payload });
      if (!resp.data?.ok) {
        throw new Error(resp.data?.error || "Lead submission failed");
      }
      toast.success("Thanks! We'll be in touch shortly.");
      reset();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      const message = (err as any)?.response?.data?.error || (err as any)?.message || "Failed to send. Please try again.";
      toast.error(message);
    }
  };

  const consentText = useMemo(
    () => (
      <>
        By submitting, you agree to our {" "}
        <a className="underline" href="/terms-of-service">Terms of Use</a>{" "}
        and {" "}
        <a className="underline" href="/privacy-policy">Privacy Notice</a>. You
        also consent to receive communications, including autodialed or
        pre-recorded calls and texts, from Central Florida Homes and its partners
        at the number and email provided. Message frequency varies. Message &
        data rates may apply. Text STOP to opt out. Consent is not a condition
        of purchase.
      </>
    ),
    []
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">First name</label>
          <input className="mt-1 w-full border rounded px-3 py-2" {...register("firstName")} />
          {errors.firstName && <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Last name</label>
          <input className="mt-1 w-full border rounded px-3 py-2" {...register("lastName")} />
          {errors.lastName && <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input type="email" className="mt-1 w-full border rounded px-3 py-2" {...register("email")} />
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input className="mt-1 w-full border rounded px-3 py-2" {...register("phone")} />
          {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">How can we help?</label>
        <textarea rows={4} className="mt-1 w-full border rounded px-3 py-2" placeholder="Tell us what you're looking for" {...register("message")} />
        {errors.message && <p className="text-sm text-red-600 mt-1">{errors.message.message}</p>}
      </div>
      <div className="space-y-2 text-sm">
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-1" {...register("agreeTerms")} />
          <span>{consentText}</span>
        </label>
        {errors.agreeTerms && <p className="text-sm text-red-600">{errors.agreeTerms.message as string}</p>}
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-1" {...register("agreeConsent")} />
          <span>
            I agree to be contacted by phone, SMS, and email about my inquiry.
          </span>
        </label>
        {errors.agreeConsent && <p className="text-sm text-red-600">{errors.agreeConsent.message as string}</p>}
      </div>
      <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-white border-t">
        <button disabled={isSubmitting} className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-70">
          {isSubmitting ? "Sending..." : "Submit"}
        </button>
      </div>
    </form>
  );
}
