// Update this catalog when you want to add, rename, or delete demos
export const demoCatalog = [
    {
        id: "demo1",
        title: "Logic Gates",
        status: "available",
        path: "/logic-gates",
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

