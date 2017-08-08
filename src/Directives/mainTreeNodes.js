export default function(ngapp) {
    ngapp.directive('mainTreeNodes', function($compile, $timeout, virtualNodeService) {
        return {
            priority: 100,
            restrict: 'E',
            templateUrl: 'directives/mainTreeNodes.html',
            link: function(scope, element) {
                let container = element[0].firstElementChild,
                    parentNode = scope.node,
                    rootElement = virtualNodeService.findRoot(container),
                    prevIndex = undefined,
                    cache = {},
                    applying = false;

                // updates blocks as necessary based on user's scroll position
                var updateBlocks = function() {
                    if (applying) return;
                    let elementOffset = container.offsetTop - rootElement.offsetTop;
                    let index = virtualNodeService.getBlockIndex(parentNode, scope.blocks, elementOffset, rootElement);
                    let domData = virtualNodeService.getDomData(parentNode, scope.blocks, index);
                    if (index == prevIndex) {
                        container.firstElementChild.style.height = `${domData.top_offset}px`;
                        container.lastElementChild.style.height = `${domData.bottom_offset}px`;
                    } else {
                        prevIndex = index;
                        container.innerHTML = virtualNodeService.buildHTML(domData, scope.blocks, cache);
                        $compile(container)(scope);
                        applying = true;
                        $timeout(function() {
                            applying = false;
                        })
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