"use client";

export function SortSelect({
  current,
  category,
}: {
  current: string;
  category?: string;
}) {
  return (
    <form method="get" className="flex items-center gap-2 text-sm">
      {category ? <input type="hidden" name="category" value={category} /> : null}
      <label htmlFor="sort" className="text-muted-foreground">
        Sort:
      </label>
      <select
        id="sort"
        name="sort"
        defaultValue={current}
        className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground outline-none focus:border-[var(--brand)]"
        onChange={(e) => {
          const f = e.currentTarget.form;
          if (f) f.requestSubmit();
        }}
      >
        <option value="newest">Newest first</option>
        <option value="price-low">Price: low to high</option>
        <option value="price-high">Price: high to low</option>
      </select>
    </form>
  );
}
