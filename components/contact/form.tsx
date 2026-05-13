"use client";

import { useActionState, useState, useRef } from "react";
import {
  Send,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import { submitCustomOrder, type ContactFormState } from "@/app/contact/actions";

const productTypes = [
  "Crochet Bag",
  "Plushie",
  "Clothing",
  "Baby Items",
  "Home Decor",
  "Keychain",
  "Flowers",
  "Blanket",
  "Custom Design",
  "Other",
];

const colorPalette = [
  { name: "White", hex: "#ffffff", border: true },
  { name: "Beige", hex: "#e8d8c4" },
  { name: "Blush", hex: "#f7c8ce" },
  { name: "Pink", hex: "#f48fb1" },
  { name: "Sage Green", hex: "#a8c4a2" },
  { name: "Mint", hex: "#bde0d4" },
  { name: "Sky Blue", hex: "#a6d3e6" },
  { name: "Navy", hex: "#1f3a5f" },
  { name: "Mustard", hex: "#e3b04b" },
  { name: "Rust", hex: "#c2683f" },
  { name: "Lavender", hex: "#cdb4db" },
  { name: "Charcoal", hex: "#3a3a3a" },
];

const sizes = ["Small", "Medium", "Large", "Custom Size"];

const budgets = [
  "Under PKR 3,000",
  "PKR 3,000 – PKR 8,000",
  "PKR 8,000 – PKR 18,000",
  "PKR 18,000 – PKR 35,000",
  "PKR 35,000+",
];

const purposes = [
  "Personal Use",
  "Gift",
  "Baby Shower",
  "Wedding",
  "Birthday",
  "Home Decor",
  "Business",
  "Other",
];

const materials = [
  "Soft Cotton Yarn",
  "Wool",
  "Acrylic",
  "Eco-friendly Yarn",
  "No Preference",
];

const initialState: ContactFormState = { status: "idle", message: "" };

const fieldClass =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-all focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20";

const labelClass =
  "mb-1.5 block text-sm font-medium text-foreground";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitCustomOrder,
    initialState,
  );
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleProduct = (p: string) =>
    setSelectedProducts((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );

  const toggleColor = (c: string) =>
    setSelectedColors((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...incoming].slice(0, 6));
  };

  const removeFile = (idx: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));

  return (
    <section className="bg-background py-20 sm:py-24" id="request-form">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            Custom Crochet Request
          </span>
          <h2 className="font-heading mt-3 text-3xl text-foreground sm:text-4xl lg:text-5xl">
            Tell us your dream design
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Fill in the details below and we&apos;ll get back to you with a
            personalized quote and timeline. The more you share, the better we
            can craft your piece.
          </p>
        </div>

        <form
          action={formAction}
          className="relative mt-12 overflow-hidden rounded-3xl border border-border bg-[var(--surface-soft)] p-6 shadow-sm sm:p-10"
        >
          <input
            type="hidden"
            name="productTypes"
            value={selectedProducts.join(", ")}
          />
          <input
            type="hidden"
            name="colors"
            value={selectedColors.join(", ")}
          />

          {/* Basic info */}
          <div>
            <h3 className="font-heading text-xl text-foreground">
              Basic Information
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              So we know how to reach you.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="fullName" className={labelClass}>
                  Full Name <span className="text-[var(--brand)]">*</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="Jane Cooper"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email Address <span className="text-[var(--brand)]">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="jane@example.com"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>
                  Phone / WhatsApp <span className="text-[var(--brand)]">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+92 300 1234567"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="location" className={labelClass}>
                  Country / City
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="Wah Cantt, Pakistan"
                  className={fieldClass}
                />
              </div>
            </div>
          </div>

          {/* Project info */}
          <div className="mt-12 border-t border-border pt-10">
            <h3 className="font-heading text-xl text-foreground">
              Project Details
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us what you&apos;d love us to make.
            </p>

            {/* Product types - chips */}
            <div className="mt-6">
              <span className={labelClass}>What would you like us to make?</span>
              <div className="flex flex-wrap gap-2">
                {productTypes.map((p) => {
                  const active = selectedProducts.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => toggleProduct(p)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                        active
                          ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-sm shadow-[var(--brand)]/25"
                          : "border-border bg-white text-foreground/80 hover:border-[var(--brand)] hover:text-[var(--brand)]"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label htmlFor="description" className={labelClass}>
                Describe your idea{" "}
                <span className="text-[var(--brand)]">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                required
                placeholder="Tell us your idea, preferred style, inspiration, or special requirements."
                className={`${fieldClass} resize-y`}
              />
            </div>

            {/* File upload */}
            <div className="mt-6">
              <span className={labelClass}>
                Upload reference images{" "}
                <span className="font-normal text-muted-foreground">
                  (Pinterest, sketches, color references — up to 6)
                </span>
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-white px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]/40 hover:text-[var(--brand)]"
              >
                <Upload className="h-6 w-6" />
                <span className="font-medium">
                  Click to upload or drag & drop
                </span>
                <span className="text-xs">PNG, JPG, or PDF — max 10MB each</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                name="references"
                multiple
                accept="image/*,application/pdf"
                onChange={onFileChange}
                className="hidden"
              />

              {files.length > 0 && (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {files.map((f, i) => (
                    <li
                      key={`${f.name}-${i}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    >
                      <span className="truncate text-foreground/80">
                        {f.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        aria-label={`Remove ${f.name}`}
                        className="text-muted-foreground hover:text-[var(--brand)]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Colors */}
            <div className="mt-6">
              <span className={labelClass}>Preferred colors</span>
              <div className="flex flex-wrap gap-2.5">
                {colorPalette.map((c) => {
                  const active = selectedColors.includes(c.name);
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => toggleColor(c.name)}
                      className={`group inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 text-xs font-medium transition-all ${
                        active
                          ? "border border-[var(--brand)] text-[var(--brand)] shadow-sm shadow-[var(--brand)]/15"
                          : "border border-border text-foreground/80 hover:border-[var(--brand)]"
                      }`}
                      aria-pressed={active}
                    >
                      <span
                        className={`h-6 w-6 rounded-full ${
                          c.border ? "ring-1 ring-border" : ""
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                      {c.name}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Select multiple to combine. Want a custom shade? Mention it in
                your description.
              </p>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="size" className={labelClass}>
                  Size preference
                </label>
                <select
                  id="size"
                  name="size"
                  defaultValue=""
                  className={fieldClass}
                >
                  <option value="" disabled>
                    Choose a size
                  </option>
                  {sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="quantity" className={labelClass}>
                  Quantity required
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min={1}
                  defaultValue={1}
                  placeholder="1"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="budget" className={labelClass}>
                  Budget range
                </label>
                <select
                  id="budget"
                  name="budget"
                  defaultValue=""
                  className={fieldClass}
                >
                  <option value="" disabled>
                    Select your budget
                  </option>
                  {budgets.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="deadline" className={labelClass}>
                  Deadline / delivery date
                </label>
                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="purpose" className={labelClass}>
                  Purpose of the order
                </label>
                <select
                  id="purpose"
                  name="purpose"
                  defaultValue=""
                  className={fieldClass}
                >
                  <option value="" disabled>
                    What is it for?
                  </option>
                  {purposes.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="material" className={labelClass}>
                  Material preference
                </label>
                <select
                  id="material"
                  name="material"
                  defaultValue=""
                  className={fieldClass}
                >
                  <option value="" disabled>
                    Choose a yarn type
                  </option>
                  {materials.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="customText" className={labelClass}>
                  Custom name / text{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional — for embroidery, initials, names)
                  </span>
                </label>
                <input
                  id="customText"
                  name="customText"
                  type="text"
                  placeholder="e.g. 'Aira', 'Mom & Me', 'Wedding 2026'"
                  className={fieldClass}
                />
              </div>
            </div>
          </div>

          {/* Communication */}
          <div className="mt-12 border-t border-border pt-10">
            <h3 className="font-heading text-xl text-foreground">
              How should we reach you?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;ll confirm details before crafting begins.
            </p>

            <div className="mt-6">
              <span className={labelClass}>Preferred communication</span>
              <div className="grid gap-2 sm:grid-cols-3">
                {["Email", "WhatsApp", "Instagram DM"].map((opt, i) => (
                  <label
                    key={opt}
                    className="relative flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground transition-all has-[:checked]:border-[var(--brand)] has-[:checked]:bg-[var(--brand-soft)] has-[:checked]:text-[var(--brand)]"
                  >
                    <input
                      type="radio"
                      name="contactMethod"
                      value={opt}
                      defaultChecked={i === 0}
                      className="peer sr-only"
                    />
                    <span className="h-4 w-4 shrink-0 rounded-full border-2 border-border bg-white transition-all peer-checked:border-[5px] peer-checked:border-[var(--brand)]" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="notes" className={labelClass}>
                Additional notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Anything else you would like us to know?"
                className={`${fieldClass} resize-y`}
              />
            </div>
          </div>

          {/* Status messages */}
          {state.status !== "idle" && state.message && (
            <div
              role="status"
              aria-live="polite"
              className={`mt-8 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                state.status === "success"
                  ? "border-[var(--brand)]/30 bg-[var(--brand-soft)] text-[var(--accent-foreground)]"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {state.status === "success" ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              )}
              <p>{state.message}</p>
            </div>
          )}

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              By submitting, you agree we may contact you about your request.
              We&apos;ll never share your info.
            </p>
            <button
              type="submit"
              disabled={pending}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[var(--brand)]/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending request…
                </>
              ) : (
                <>
                  Send Custom Request
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
