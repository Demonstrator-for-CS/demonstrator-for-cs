import {ReactFlow, Position, Handle} from '@xyflow/react';
import TreeNode from '../Styles/TreeNode.jsx';
import SelectedNode from '../Styles/SelectedNode.jsx';
import VisistedNode from '../Styles/VisitedNode.jsx';

const nodeTypes = {
    treeNode: TreeNode,
    selectedNode: SelectedNode,
    visitedNode: VisistedNode,
};

const nodes = [
    {
        id: '7',
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
        type: 'selectedNode',
        position: { x: 100, y: 200 },
        data: { label: '5' },
    },
    {
        id: '4',
        type: 'treeNode',
        position: { x: 200, y: 200 },
        data: { label: '4' },
    },
    {
        id: '6',
        type: 'treeNode',
        position: { x: 300, y: 200 },
        data: { label: '6' },
    },
    {
        id: '1',
        type: 'treeNode',
        position: { x: 400, y: 200 },
        data: { label: '1' },
    },
];

const edges = [
    { id: '7->2', source: '7', target: '2', type: 'straight', style: { stroke: '#000000', strokeWidth: 2 } },
    { id: '7->3', source: '7', target: '3', type: 'straight', style: { stroke: '#000000', strokeWidth: 2 } },
    { id: '2->5', source: '2', target: '5', type: 'straight', style: { stroke: '#000000', strokeWidth: 2 } },
    { id: '2->4', source: '2', target: '4', type: 'straight', style: { stroke: '#000000', strokeWidth: 2 } },
    { id: '3->6', source: '3', target: '6', type: 'straight', style: { stroke: '#000000', strokeWidth: 2 } },
    { id: '3->1', source: '3', target: '1', type: 'straight', style: { stroke: '#000000', strokeWidth: 2 } },
];

export default function Trees() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="grid grid-cols-2 items-center justify-center px-4 h-full w-full">
                <div className="flex flex-col items-center gap-4">
                    <p className="text-5xl">
                        <span className="font-bold">Depth-First Search</span> starts by looking at the root node. It doesn't check the data there quite yet.
                    </p>
                    <p className="text-5xl">
                        If it has any children, it traverses to them instead, prioritizing the left node.
                    </p>
                    <p className="text-5xl">
                        It continues this until it gets all the way to the bottom of the tree. It found <span className="text-red-500">5</span>, not a match for 1.
                    </p>
                </div>


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