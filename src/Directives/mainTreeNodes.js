export default function(ngapp) {
    ngapp.directive('mainTreeNodes', function($timeout, virtualNodeService) {
        return {
            restrict: 'E',
            templateUrl: 'directives/mainTreeNodes.html',
            link: function(scope, element) {
                let container = element[0],
                    parentNode = scope.node,
                    rootElement = virtualNodeService.findRoot(container),
                    lastIndex = undefined;

                // updates blocks as necessary based on user's scroll position
                let updateBlocks = function() {
                    let elementOffset = container.offsetTop - rootElement.offsetTop;
                    let index = virtualNodeService.getBlockIndex(parentNode, scope.blocks, elementOffset, rootElement);
                    if (index != lastIndex) {
                        lastIndex = index;
                        if (index == -1) {
                            scope.endIndex = -1;
                        } else {
                            scope.startIndex = index - virtualNodeService.padding_blocks;
                            scope.endIndex = index + virtualNodeService.padding_blocks;
                        }
                        scope.domData = virtualNodeService.getDomData(parentNode, scope.blocks, scope.startIndex, scope.endIndex);
                    }
                };

                // initialize DOM
                scope.blocks = virtualNodeService.buildBlocks(parentNode.children);
                $timeout(function() {
                    updateBlocks();
                });

                // event listeners
                rootElement.addEventListener('scroll', updateBlocks);
                scope.$on('nodeExpanded', updateBlocks);
                scope.$on('nodeCollapsed', updateBlocks);
                scope.$on('$destroy', function() {
                    rootElement.removeEventListener('scroll', updateBlocks);
                });
            }
        };
    });
}