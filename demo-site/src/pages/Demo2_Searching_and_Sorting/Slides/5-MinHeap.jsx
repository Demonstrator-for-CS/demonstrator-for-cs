import { ReactFlow } from '@xyflow/react';
import TreeNode from '../Styles/TreeNode.jsx';

const nodeTypes = {
    treeNode: TreeNode,
};

const nodes = [
    {
        id: '3',
        type: 'treeNode',
        position: { x: 250, y: 0 },
        data: { label: '3' },
    },
    {
        id: '5',
        type: 'treeNode',
        position: { x: 150, y: 120 },
        data: { label: '5' },
    },
    {
        id: '8',
        type: 'treeNode',
        position: { x: 350, y: 120 },
        data: { label: '8' },
    },
    {
        id: '6',
        type: 'treeNode',
        position: { x: 75, y: 240 },
        data: { label: '6' },
    },
    {
        id: '34',
        type: 'treeNode',
        position: { x: 225, y: 240 },
        data: { label: '34' },
    },
    {
        id: '17',
        type: 'treeNode',
        position: { x: 300, y: 240 },
        data: { label: '17' },
    },
    {
        id: '25',
        type: 'treeNode',
        position: { x: 425, y: 240 },
        data: { label: '25' },
    },
];

const edges = [
    { id: '3->5', source: '3', target: '5', type: 'straight', style: { stroke: '#000000', strokeWidth: 2 } },
    { id: '3->8', source: '3', target: '8', type: 'straight', style: { stroke: '#000000', strokeWidth: 2 } },
    { id: '5->6', source: '5', target: '6', type: 'straight', style: { stroke: '#000000', strokeWidth: 2 } },
    { id: '5->34', source: '5', target: '34', type: 'straight', style: { stroke: '#000000', strokeWidth: 2 } },
    { id: '8->17', source: '8', target: '17', type: 'straight', style: { stroke: '#000000', strokeWidth: 2 } },
    { id: '8->25', source: '8', target: '25', type: 'straight', style: { stroke: '#000000', strokeWidth: 2 } },
];

export default function MinHeap() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <h2 className="text-9xl font-bold mb-6 mt-1">Heaps</h2>
            <div className="grid grid-cols-2 items-center justify-center px-4 h-full w-full">
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

                <div className="flex flex-col items-center gap-4">
                    <p className="text-5xl">
                        This is a <span className="font-bold">Min Heap</span>
                    </p>
                    <p className="text-5xl">
                        <span className="font-bold">Min Heaps</span> are trees that are sorted. The <span className="font-bold">root node</span> contains the smallest number in the data set.
                    </p>
                    <p className="text-5xl">
                        A <span className="font-bold">Min Heap</span> requires that both children of a node are greater than their parent.
                    </p>
                </div>
            </div>
        </div>
    );
}