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

        this.getDomData = function(parentNode, blocks, startIndex, endIndex) {
            if (startIndex == -1) {
                return {
                    top_offset: parentNode.node_count * service.node_height,
                    bottom_offset: 0
                }
            }
            return {
                top_offset: blocks.slice(0, startIndex).sum('node_count') * service.node_height,
                bottom_offset: blocks.slice(endIndex, -1).sum('node_count') * service.node_height
            }
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