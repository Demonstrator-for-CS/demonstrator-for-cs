import { ReactFlow } from '@xyflow/react';
import TreeNode from '../Styles/TreeNode.jsx';

const nodeTypes = {
    treeNode: TreeNode,
};

const nodes = [
    {
        id: '34',
        type: 'treeNode',
        position: { x: 250, y: 0 },
        data: { label: '34' },
    },
    {
        id: '25',
        type: 'treeNode',
        position: { x: 150, y: 120 },
        data: { label: '25' },
    },
    {
        id: '17',
        type: 'treeNode',
        position: { x: 350, y: 120 },
        data: { label: '17' },
    },
    {
        id: '8',
        type: 'treeNode',
        position: { x: 75, y: 240 },
        data: { label: '8' },
    },
    {
        id: '6',
        type: 'treeNode',
        position: { x: 225, y: 240 },
        data: { label: '6' },
    },
    {
        id: '5',
        type: 'treeNode',
        position: { x: 300, y: 240 },
        data: { label: '5' },
    },
    {
        id: '3',
        type: 'treeNode',
        position: { x: 425, y: 240 },
        data: { label: '3' },
    },
];

const edges = [
    { id: '34->25', source: '34', target: '25', type: 'straight', style: { stroke: '#000000', strokeWidth: 2 } },
    { id: '34->17', source: '34', target: '17', type: 'straight', style: { stroke: '#000000', strokeWidth: 2 } },
    { id: '25->8', source: '25', target: '8', type: 'straight', style: { stroke: '#000000', strokeWidth: 2 } },
    { id: '25->6', source: '25', target: '6', type: 'straight', style: { stroke: '#000000', strokeWidth: 2 } },
    { id: '17->5', source: '17', target: '5', type: 'straight', style: { stroke: '#000000', strokeWidth: 2 } },
    { id: '17->3', source: '17', target: '3', type: 'straight', style: { stroke: '#000000', strokeWidth: 2 } },
];

export default function MaxHeap() {
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
                        This is a <span className="font-bold">Max Heap</span>
                    </p>
                    <p className="text-5xl">
                        The <span className="font-bold">root node</span> contains the largest number in the data set.
                    </p>
                    <p className="text-5xl">
                        A <span className="font-bold">Max Heap</span> requires that both children of a node are smaller than their parent.
                    </p>
                </div>
            </div>
        </div>
    );
}