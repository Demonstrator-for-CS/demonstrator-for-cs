import {ReactFlow, Position, Handle} from '@xyflow/react';

export default function VisitedNode({ data }) {
    return (
        <div className="relative">
            <Handle type="target" position={Position.Top} />
            <div className="bg-gray-500 border-2 border-black rounded-full w-16 h-16 flex items-center justify-center font-bold text-2xl">
                {data.label}
            </div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}