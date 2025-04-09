import { useEffect, useState } from 'react';
import { Background, ReactFlow, NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import * as dagre from 'dagre';

import {
  TopNode,
  BottomNode,
  CenterNode,
} from './CompanyNode';

type Representative = {
  first_name: string;
  last_name: string;
};

type Administrator = {
  id: number;
  administering_company: string | null;
  representatives: Representative[];
};

type Participation = {
  id: number;
  held_company: string;
  percentage: number;
};

type Props = {
  administrators: Administrator[];
  participations: Participation[];
  companyName: string;
  companyId: string;
};

const nodeWidth = 180;
const nodeHeight = 70;

const nodeTypes: NodeTypes = {
  top: TopNode,
  bottom: BottomNode,
  center: CenterNode,
};

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 10, ranksep: 85 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id);
    return {
      ...node,
      position: { x, y },
      targetPosition: 'top',
      sourcePosition: 'bottom',
    };
  });
};

function AdministratorGraph({ administrators, participations, companyName, companyId }: Props) {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const proOptions = { hideAttribution: true };

  useEffect(() => {
    if (!administrators && !participations) return;

    const companyNode = {
      id: companyId,
      type: 'center',
      data: { label: companyName },
      position: { x: 0, y: 0 },
    };

    const adminNodes = administrators.map((admin) => {
      const fullName = admin.representatives
        .map((r) => `${r.first_name} ${r.last_name}`)
        .join(', ');

      return {
        id: `admin-${admin.id}`,
        type: 'top',
        data: {
          label: admin.administering_company || fullName,
          sub: admin.administering_company ? fullName : undefined,
        },
        position: { x: 0, y: 0 },
      };
    });

    const participationNodes = participations.map((part) => ({
      id: `part-${part.id}`,
      type: 'bottom',
      data: {
        label: part.held_company,
        sub: `${(part.percentage * 100).toLocaleString('nl-BE')}%`,
      },
      position: { x: 0, y: 0 },
    }));

    const adminEdges = administrators.map((admin) => ({
      id: `e-admin-${admin.id}`,
      source: `admin-${admin.id}`,
      target: companyId,
    }));

    const participationEdges = participations.map((part) => ({
      id: `e-part-${part.id}`,
      source: companyId,
      target: `part-${part.id}`,
    }));

    const allEdges = [...adminEdges, ...participationEdges];
    const allNodes = [companyNode, ...adminNodes, ...participationNodes];

    const layouted = getLayoutedElements(allNodes, allEdges, 'TB');
    setNodes(layouted);
    setEdges(allEdges);
  }, [administrators, participations, companyId, companyName]);

  return (
    <div className="w-full h-[450px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        elementsSelectable={false}
        proOptions={proOptions}
        panOnDrag
      >
      </ReactFlow>
    </div>
  );
}

export default AdministratorGraph;