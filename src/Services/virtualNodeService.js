export default function(ngapp) {
    ngapp.service('virtualNodeService', function() {
        let service = this;

        // service variables
        service.node_height = 20;
        service.nodes_in_block = 50;
        service.padding_blocks = 1;

        // service functions
        this.findRoot = function(element) {
            do {
                element = element.parentNode;
            } while (element.className.indexOf('root') == -1);
            return element;
        };

        this.getBlockIndex = function(parentNode, blocks, elementOffset, rootElement) {
            let scrollOffset = rootElement.scrollTop;
            if (scrollOffset < elementOffset + service.nodes_in_group * service.node_height ||
                scrollOffset > elementOffset + parentNode.node_count * service.node_height) return -1;
            let totalNodes = 0;
            return blocks.findIndex(function(block) {
                totalNodes += block.node_count;
                return elementOffset + (totalNodes * service.node_height) >= scrollOffset;
            }) || 1;
        };

        this.getDomData = function(parentNode, blocks, index) {
            if (index == -1) {
                return {
                    startIndex: -1,
                    endIndex: -1,
                    top_offset: parentNode.node_count * service.node_height,
                    bottom_offset: 0
                }
            }
            let startIndex = Math.max(index - service.padding_blocks, 0),
                endIndex = Math.max(index + service.padding_blocks, 0);
            return {
                startIndex: startIndex,
                endIndex: endIndex,
                top_offset: blocks.slice(0, startIndex).sum('node_count') * service.node_height,
                bottom_offset: blocks.slice(endIndex, -1).sum('node_count') * service.node_height
            }
        };

        this.firstColumnTemplate = function(node) {
            let columnHtml = [
                `<span class="column column-0" style="padding-left: ${node.depth * 20 + 8 + 'px'}">`
            ];
            if (node.children_count) {
                columnHtml.push(
                    `<span class="expand-node" ng-click="toggleNode($event, node)">`,
                        `<i class="fa fa-{{node.expanded ? 'minus' : 'plus'}}"></i>`,
                    `</span>`
                );
            } else {
                columnHtml.push(`<span class="placeholder"></span>`);
            }
            columnHtml.push(node.column_values[0]);
            columnHtml.push(`</span>`);
            return columnHtml.join('');
        };

        this.nodeTemplate = function(node, blockIndex, nodeIndex) {
            let nodeHtml = [
                `<div ng-if="1" ng-init="node = blocks[${blockIndex}].nodes[${nodeIndex}]">`,
                `<div ng-click="selectNode($event, node)" ng-class="{'selected' : node.selected}" class="body">`
            ];
            nodeHtml.push(service.firstColumnTemplate(node));
            node.column_values.forEach(function(value, index) {
                if (index == 0) return;
                nodeHtml.push(`<span class="column column-${index}">${value}</span>`)
            });
            nodeHtml.push('</div>');
            if (node.children_count) {
                nodeHtml.push(`<main-tree-nodes ng-if="node.expanded"></main-tree-nodes>`)
            }
            nodeHtml.push('</div>');
            return nodeHtml.join('');
        };

        this.buildBlockHTML = function(block, blockIndex, cache, key) {
            let blockHtml = block.nodes.map(function(node, nodeIndex) {
                return service.nodeTemplate(node, blockIndex, nodeIndex);
            });
            cache[key] = blockHtml;
            return blockHtml;
        };

        this.buildHTML = function(data, blocks, cache) {
            let html = [];
            html.push(`<div style="height: ${data.top_offset}px"></div>`);
            for (let i = data.startIndex; i < data.endIndex; i++) {
                let key = i.toString();
                html = html.concat(cache[key] || service.buildBlockHTML(blocks[i], i, cache, key));
            }
            html.push(`<div style="height: ${data.bottom_offset}px"></div>`);
            return html.join('');
        };

        this.newBlock = function() {
            return {
                node_count: 0,
                nodes: []
            }
        };

        this.buildBlocks = function(nodes) {
            let blocks = [];
            let block = service.newBlock();
            nodes.forEach(function(node) {
                if (block.node_count >= service.nodes_in_block) {
                    blocks.push(block);
                    block = service.newBlock();
                }
                block.nodes.push(node);
                block.node_count += node.node_count || 1;
            });
            if (block.node_count >= 0) blocks.push(block);
            return blocks;
        };
    });
}