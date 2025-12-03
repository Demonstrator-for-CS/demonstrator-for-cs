// Update this catalog when you want to rename demos or reintroduce descriptions.
export const demoCatalog = [
    {
        id: "demo1",
        title: "Logic Gates",
        status: "available",
        path: "/logic-gates",
        // Optional: add `tagline` or `description` keys when you want supporting copy.
    },
    {
        id: "demo2",
        title: "Searching and Sorting",
        status: "available",
        path: "/searching-sorting",
    },
];

export function getDemoById(id) {
    return demoCatalog.find((demo) => demo.id === id);
}

