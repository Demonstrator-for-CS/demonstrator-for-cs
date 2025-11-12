import {ReactFlow, Position, Handle} from '@xyflow/react';

export default function TreeNode({ data }) {
    return (
        <div className="relative">
            <Handle type="target" position={Position.Top} />
            <div className="bg-white border-2 border-black rounded-full w-16 h-16 flex items-center justify-center font-bold text-2xl">
                {data.label}
            </div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}