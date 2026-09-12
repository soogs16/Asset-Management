import { useEffect, useState } from "react";

export default function CategoryDropdown() {
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("assetCategories");

    return saved
      ? JSON.parse(saved)
      : [];
  });

  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [open, setOpen] = useState(false);


  useEffect(() => {
    localStorage.setItem(
      "assetCategories",
      JSON.stringify(categories)
    );
  }, [categories]);

  const addCategory = () => {
    const category = newCategory.trim();

    if (!category) return;

    if (categories.includes(category)) {
      setNewCategory("");
      return;
    }

    setCategories([...categories, category]);
    setSelectedCategory(category);
    setNewCategory("");
    setOpen(false);
  };

  return (
    <div className="relative w-full text-black max-w-md">
      
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-grey-300 text-left"
      >
        {selectedCategory || "Select category"}
      </button>

      {open && (
        <div className="absolute text-black z-10 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg">

          <div className="max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setOpen(false);
                }}
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                {category}
              </button>
            ))}
          </div>

          <div className="border-t p-3">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Add new category..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCategory();
                }
              }}
            />

            <button
              type="button"
              onClick={addCategory}
              className="mt-2 w-full rounded-lg bg-black px-3 py-2 text-white"
            >
              + Add Category
            </button>
          </div>

        </div>
      )}
    </div>
  );
}