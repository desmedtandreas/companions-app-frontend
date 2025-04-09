
import { Handle, Position } from '@xyflow/react';
import { RiCornerDownRightLine } from '@remixicon/react';

function TopNode({ data }: any) {
  return (
    <div className="flex flex-col rounded-md border border-gray-200 bg-white shadow-xl p-2 w-44">
      <div className="flex justify-center items-center p-1 bg-[#ff91009e] text-white font-medium rounded">
        <p className="text-sm">Bestuurder</p>
      </div>
      <div className="flex items-center p-2 flex-1">
        <div className='overflow-hidden whitespace-nowrap text-ellipsis'>
          <div className="font-semibold text-sm">{data.label}</div>
          {data.sub && 
            <div className="flex justify-start items-center text-xs text-gray-500 mt-1">
              <RiCornerDownRightLine className='w-4 h-4 mr-1 shrink-0 mb-0'/> {data.sub}
            </div>}
        </div>
      </div>

      
      {/* Handles for connecting edges */}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function BottomNode({ data }: any) {
  return (
    <div className="flex flex-col rounded-md border border-gray-200 bg-white shadow-xl p-2 w-44">
      <div className="flex justify-center items-center p-1 bg-[#7b00ff8f] text-white font-medium rounded">
        <p className="text-sm">Participatie</p>
      </div>
      <div className="flex items-center p-2 flex-1">
        <div className='overflow-hidden whitespace-nowrap text-ellipsis'>
          <div className="font-semibold text-sm">{data.label}</div>
          {data.sub && 
            <div className="flex justify-start items-center text-gray-800 mt-1">
              <RiCornerDownRightLine className='w-4 h-4 mr-1 shrink-0 mb-0'/> 
              <span className='font-medium text-md'>{data.sub}</span>
            </div>}
        </div>
      </div>
      
      {/* Handles for connecting edges */}
      <Handle type="target" position={Position.Top} />
    </div>
  );
}

function CenterNode({ data }: any) {
  return (
    <div className="flex justify-center items-center rounded-md border border-gray-300 bg-[#0f083a] text-white shadow-xl p-4 w-44 h-[70px]">
      <div className='overflow-hidden whitespace-nowrap text-ellipsis'>
        <div className="font-semibold text-sm">{data.label}</div>
        <div className="text-xs text-white mt-1">{data.vat}</div>
        {data.sub && <div className="text-xs text-gray-500 mt-1">{data.sub}</div>}
      </div>
      
      {/* Handles for connecting edges */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export { TopNode, BottomNode, CenterNode };