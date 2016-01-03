(function() {
  'use strict';

  var app = angular.module('ps',['ngAnimate', 'ngCookies', 'ngSanitize', 'ngRoute', 'ui.bootstrap']);
  app.directive('psSelect', psSelect);

  /** @ngInject */
  function psSelect() {
    return {
      restrict: 'A',
      templateUrl: 'ps-select.html',
      scope: {
        data: '=',
        childListName: '&',
        labelName: '&'
      },
      controller: function($scope){
        if(!$scope.labelName){
          $scope.labelName = 'label';
        }

        $scope.treeModal = [];

        var subNode = [{name:'sub3',label: 'sub3'}, {name:'sub4',label: 'sub4'}, {name:'sub5',label: 'sub5'}];
        var subNode2 = [{name:'sub1',label: 'sub1', sub: subNode}, {name:'sub2',label: 'sub2'}];
        $scope.data = [{name:'test',label: 'test', sub: subNode2}];

        this.getTreeModel = function(){
          return $scope.treeModal;
        }

        $scope.hdrLabel = {};
        var selectLabels = [];


        var selectHandler = function(){
            var updateHeader = function(node){
              if(node.ticked){
                selectLabels.push(node[$scope.labelName]);
                return;
              }
              angular.forEach(node.children, function(childNode){
                updateHeader(childNode);
              });
            }

            selectLabels.splice(0, selectLabels.length);
            angular.forEach($scope.treeModal, function(item){
              updateHeader(item);
            });
            $scope.hdrLabel.name = selectLabels.join();
        }

        var generateNode = function(nodeData, parentNode){
          var node = {data: nodeData, children : [], label: nodeData[$scope.labelName]};
          if(parentNode){
            node.parentNode = parentNode;
            parentNode.children.push(node);
            node.level = parentNode.level + 1;
          } else {
            node.level = 0;
          }


          node.childSelectHdl = function(){
               var allChecked = true;
               angular.forEach(this.children, function(node){
                 if(node.ticked !== true){
                   allChecked = false;
                 }
               });
               if(allChecked){
                 this.set(true);
               } else {
                 this.set(false);
               }
               if(this.parentNode){
                   this.parentNode.childSelectHdl();
                }
          }


          node.set = function(select){
            this.ticked = select;
            this.data.ticked = select;
            selectHandler();

          }

          node.setChildren = function(select){
            angular.forEach(this.children, function(node){
                node.set(select);
                node.setChildren(select);
            });
          }


          if(nodeData[$scope.childEleName] && nodeData[$scope.childEleName].length > 0 ){
            node.grouped = true;
            angular.forEach(nodeData[$scope.childEleName], function(childNodeData){
              generateNode(childNodeData, node);
            });
          }
          return node;
        }

        angular.forEach($scope.data, function(dt){
          $scope.treeModal.push(generateNode(dt));
        });
        console.log($scope.treeModal);
      },
      controllerAs: 'multiSelect'
    };
  };

  angular
    .module('psSelect')
    .directive('treeView', ['$compile',treeView]);

  function treeView($compile){
    return {
      restrict: 'A',
      require: '^?multiSelect',
      scope: {
        treeData: '='
      },
      link: function(scope, element, attr, multiSelect){
        console.log(scope.treeData);
        if (!scope.treeData){
          scope.treeData = multiSelect.getTreeModel();
        }


        scope.clickHdl = function(node){
           node.set(!node.ticked);
           //node.parentNode.ticked = node.ticked;
           if(node.parentNode){
               node.parentNode.childSelectHdl();
           }
           node.setChildren(node.ticked);
         };

        var template =   '<ul class="list-group">' +
            '<li class="list-group-item" ng-repeat="node in treeData">' +
                '<div class="item-cont grp-level-{{node.level}}" ng-click="clickHdl(node)" >' +
                    '<span class="text-item">{{node.label}}</span><i class="pull-right" ng-show="node.ticked">X</i></div>' +
                '<div tree-view tree-data="node.children"></div>' +
              '</li>' +
            ' </ul> ';
            element.html('').append( $compile( template )( scope ) );
      }
    }
  }



})();
