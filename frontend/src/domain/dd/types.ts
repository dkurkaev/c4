export interface DDGroupAPI {
  id: number;
  parent_id: number | null;
  name: string;
  type_id: number;
  type_name: string;
  instances: number | null;
  specification: string;
}

export interface DDComponentAPI {
  id: number;
  name: string;
  c2_component_id: number | null;
  type_id: number;
  type_name: string;
  technology: string;
  description: string;
  group_id: number;
  is_external: boolean;
}

export interface ComponentType {
  id: number;
  name: string;
}

export interface DdGroupType {
  id: number;
  name: string;
}

export interface DDLink {
  id: number;
  group_from_id: number;
  group_to_id: number;
  protocol_id: number;
  protocol_name: string;
  ports: number[];
}

export interface DDTreeNode {
  id: string;
  name: string;
  type: 'group' | 'component';
  children?: DDTreeNode[];
  data?: DDGroupAPI | DDComponentAPI;
}

export interface DragState {
  draggedNode: DDTreeNode | null;
  dragOverNode: DDTreeNode | null;
  isDragging: boolean;
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  node: DDTreeNode | null;
}

export interface CreateModalState {
  visible: boolean;
  parentNode: DDTreeNode | null;
  createType: 'group' | 'component' | null;
  isEditing: boolean;
  editValues: any;
}

export interface MoveConfirmModalState {
  visible: boolean;
  sourceNode: DDTreeNode | null;
  targetNode: DDTreeNode | null;
} 