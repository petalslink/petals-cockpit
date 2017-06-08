/**
 * Copyright (C) 2017 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { VisNetworkOptions, VisNodes, VisEdges } from 'ng2-vis';

import { IContainerRow } from 'app/features/cockpit/workspaces/state/containers/containers.interface';

export function buildVisNetworkData(
  container: IContainerRow,
  otherContainers: IContainerRow[]
) {
  return {
    nodes: new VisNodes([
      node(container)(container),
      ...otherContainers.map(node(container)),
    ]),
    edges: new VisEdges(otherContainers.map(edge(container))),
  };
}

function node(container: IContainerRow) {
  return otherContainer => ({
    id: otherContainer.id,
    label: otherContainer.name,
    fixed: true,
    title:
      '<b>IP :</b> <span class="ip">' +
        otherContainer.ip +
        '</span><br>' +
        '<b>Port :</b> <span class="port">' +
        otherContainer.port +
        '</span>',
    image: container.id === otherContainer.id ||
      container.reachabilities.includes(otherContainer.id)
      ? 'assets/img/network-container.png'
      : 'assets/img/network-container-no-reachable.png',
  });
}

function edge(container: IContainerRow) {
  return otherContainer => ({
    from: container.id,
    to: otherContainer.id,
    color: container.reachabilities.includes(otherContainer.id)
      ? 'green'
      : 'red',
    label: container.reachabilities.includes(otherContainer.id)
      ? 'reachable'
      : 'no reachable',
    arrows: {
      to: container.reachabilities.includes(otherContainer.id) ? true : false,
    },
  });
}

export const containerNetworkOptions: VisNetworkOptions = {
  // see ngOnInit of the component for autoResize
  autoResize: false,
  height: '320px',
  width: '100%',
  clickToUse: true,
  layout: {
    randomSeed: 4,
    improvedLayout: true,
    hierarchical: false,
  },
  nodes: {
    shape: 'image',
    size: 30,
    scaling: {
      min: 10,
      max: 30,
      label: {
        min: 8,
        max: 30,
        drawThreshold: 2,
        maxVisible: 50,
      },
    },
  },
  edges: {
    font: {
      size: 10,
      strokeWidth: 1,
      align: 'top',
    },
    color: 'gray', // default
    shadow: true,
    smooth: {
      enabled: true,
      type: 'continuous', // cubicBezier, dynamic, discrete
      roundness: 0.2,
    },
    arrows: {
      to: { enabled: true, scaleFactor: 0.5, type: 'arrow' },
      from: { enabled: false, scaleFactor: 0.5, type: 'arrow' },
    },
    arrowStrikethrough: true,
    dashes: true,
  },
  physics: {
    stabilization: true,
    barnesHut: {
      gravitationalConstant: -2000,
      centralGravity: 0,
      springLength: 100,
      springConstant: 0.1,
      damping: 0.09,
    },
    maxVelocity: 25,
    minVelocity: 1,
    timestep: 0.75,
  },
  interaction: {
    hideEdgesOnDrag: false, // better performance if true
    hideNodesOnDrag: false, // better performance if true
  },
};
