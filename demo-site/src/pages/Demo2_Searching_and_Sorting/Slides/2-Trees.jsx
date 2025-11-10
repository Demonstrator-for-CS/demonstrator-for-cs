import { ReactFlow } from '@xyflow/react';

// Custom node component for tree nodes
function TreeNode({ data }) {
    return (
        <div className="relative">
            <div className="bg-red-600 border-2 border-black rounded-full w-16 h-16 flex items-center justify-center font-bold text-2xl">
                {data.label}
            </div>
        </div>
    );


}

const nodeTypes = {
    treeNode: TreeNode,
};

const nodes = [
    {
        id: '1',
        type: 'treeNode',
        position: { x: 250, y: 0 },
        data: { label: '7' },
    },
    {
        id: '2',
        type: 'treeNode',
        position: { x: 150, y: 100 },
        data: { label: '2' },
    },
    {
        id: '3',
        type: 'treeNode',
        position: { x: 350, y: 100 },
        data: { label: '3' },
    },
    {
        id: '5',
        type: 'treeNode',
        position: { x: 100, y: 200 },
        data: { label: '5' },
    },
    {
        id: '4',
        type: 'treeNode',
        position: { x: 250, y: 200 },
        data: { label: '4' },
    },
    {
        id: '6',
        type: 'treeNode',
        position: { x: 300, y: 200 },
        data: { label: '6' },
    },
    {
        id: '1_leaf',
        type: 'treeNode',
        position: { x: 450, y: 200 },
        data: { label: '1' },
    },
];

const edges = [
    { id: 'e1-2', source: '1', target: '2'},
    { id: 'e1-3', source: '1', target: '3'},
    { id: 'e2-5', source: '2', target: '5'},
    { id: 'e2-4', source: '2', target: '4'},
    { id: 'e3-6', source: '3', target: '6',},
    { id: 'e3-1', source: '3', target: '1_leaf'},
];

export default function Trees() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <h2 className="text-9xl font-bold mb-8">Trees</h2>
            <div className="flex flex-row items-center justify-between px-4 h-full">
                <p className="text-3xl w-1/2">Trees are a data structure made up of <span className="text-blue-600 font-bold">nodes </span>
                    that contain data, and <span className="text-red-600 font-bold">edges</span> that link the data together.
                </p>
                <div className="w-full h-full">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        fitView
                        nodesDraggable={false}
                        panOnDrag={false}
                        elementsSelectable={false}
                        zoomOnScroll={false}
                    />
                </div>
            </div>

        </div>
    );
}