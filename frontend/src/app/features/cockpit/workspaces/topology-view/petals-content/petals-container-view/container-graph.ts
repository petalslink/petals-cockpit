/**
 * Copyright (C) 2017-2019 Linagora
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

import { VisEdges, VisNetworkOptions, VisNodes } from 'ngx-vis';

import { IContainerRow } from '@wks/state/containers/containers.interface';
import { IContainerWithSiblings } from '@wks/state/containers/containers.selectors';

export function buildVisNetworkData(container: IContainerWithSiblings) {
  return {
    nodes: new VisNodes([
      node(container)(container),
      ...container.siblings.map(node(container)),
    ]),
    edges: new VisEdges(container.siblings.map(edge(container))),
  };
}

function node(container: IContainerRow) {
  return (currentContainer: IContainerRow) => ({
    id: currentContainer.id,
    label:
      currentContainer.name +
      '\n' +
      currentContainer.ip +
      ':' +
      currentContainer.port,
    fixed: true,
    image: currentContainer.isReachable
      ? 'assets/img/network-container.png'
      : 'assets/img/network-container-no-reachable.png',
  });
}

function edge(container: IContainerRow) {
  return (otherContainer: IContainerRow) => ({
    from: container.id,
    to: otherContainer.id,
    color: otherContainer.isReachable ? 'green' : 'red',
    label: otherContainer.isReachable ? 'reachable' : 'unreachable',
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
    labelHighlightBold: true,
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
